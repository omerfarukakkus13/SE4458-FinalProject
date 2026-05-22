const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const amqp = require('amqplib');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ──────────────────────────────────────────────
// Nodemailer Transporter Configuration
// ──────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ──────────────────────────────────────────────
// RabbitMQ Consumer — picks up new job messages
// ──────────────────────────────────────────────
async function startQueueConsumer() {
  try {
    const conn = await amqp.connect(process.env.AMQP_URL);
    const channel = await conn.createChannel();
    await channel.assertQueue('new_job_postings', { durable: true });

    console.log('[Queue] Waiting for messages in new_job_postings...');

    channel.consume('new_job_postings', async (msg) => {
      if (!msg) return;
      const job = JSON.parse(msg.content.toString());
      console.log(`[Queue] New job received: ${job.title} @ ${job.company_name}`);

      // Match against job_alerts in Supabase
      await matchAlertsAndNotify(job);

      channel.ack(msg);
    });
  } catch (err) {
    console.error('[Queue] RabbitMQ connection error:', err.message);
    // Retry after 10 seconds
    setTimeout(startQueueConsumer, 10000);
  }
}

// ──────────────────────────────────────────────
// Match new job against all user job alerts
// ──────────────────────────────────────────────
async function matchAlertsAndNotify(job) {
  try {
    const { data: alerts, error } = await supabase
      .from('job_alerts')
      .select('*');

    if (error || !alerts) return;

    for (const alert of alerts) {
      const keywordMatch = job.title.toLowerCase().includes(alert.keyword.toLowerCase()) ||
                           job.position.toLowerCase().includes(alert.keyword.toLowerCase());
      const cityMatch = !alert.city || job.city.toLowerCase().includes(alert.city.toLowerCase());
      const workTypeMatch = !alert.work_type || job.work_type === alert.work_type;

      if (keywordMatch && cityMatch && workTypeMatch) {
        console.log(`[Alert] MATCH! Alerting user ${alert.user_email} for job: ${job.title}`);
        
        // 1. Insert in-app notification
        await supabase.from('notifications').insert({
          user_id: alert.user_id,
          job_id: job.id,
          message: `İş Alarmı: Kriterlerinize uygun yeni ilan! (${job.title})`
        });

        // 2. Send email via Nodemailer
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: alert.user_email,
            subject: `KariyerAI - İş Alarmı: ${job.title}`,
            html: `
              <h2>Yeni bir ilan bulundu!</h2>
              <p>İş Alarmı kriterlerinize uygun yeni bir ilan yayınlandı:</p>
              <ul>
                <li><strong>Pozisyon:</strong> ${job.title}</li>
                <li><strong>Şirket:</strong> ${job.company_name}</li>
                <li><strong>Şehir:</strong> ${job.city}</li>
              </ul>
              <p><a href="http://localhost:5173/job/${job.id}">İlanı İncele ve Başvur</a></p>
            `
          };
          transporter.sendMail(mailOptions).catch(err => console.error('[Alert] Email error:', err.message));
        }
      }
    }
  } catch (err) {
    console.error('[Alert] matchAlertsAndNotify error:', err.message);
  }
}

// ──────────────────────────────────────────────
// CRON JOB 1: Daily - Check job alerts for recent new jobs
// Runs every day at 08:00
// ──────────────────────────────────────────────
cron.schedule('0 8 * * *', async () => {
  console.log('[Cron] Running daily job alert check...');
  try {
    // Get jobs posted in the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: newJobs, error: jobErr } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'ACTIVE')
      .gte('created_at', yesterday);

    if (jobErr || !newJobs || newJobs.length === 0) {
      console.log('[Cron] No new jobs in the last 24h.');
      return;
    }

    console.log(`[Cron] Found ${newJobs.length} new jobs. Checking alerts...`);
    for (const job of newJobs) {
      await matchAlertsAndNotify(job);
    }
  } catch (err) {
    console.error('[Cron] Daily alert check error:', err.message);
  }
});

// ──────────────────────────────────────────────
// CRON JOB 2: Daily - Send related job notifications based on user searches
// Runs every day at 09:00
// ──────────────────────────────────────────────
cron.schedule('0 9 * * *', async () => {
  console.log('[Cron] Running related job notification check...');
  // NOTE: This cron calls the Job Search Service to fetch recent user searches from MongoDB
  // Then matches them against active jobs and sends notifications.
  try {
    const response = await fetch(`${process.env.JOB_SEARCH_URL}/api/v1/search/recent-all`);
    if (!response.ok) return;

    const recentSearches = await response.json();

    for (const search of recentSearches) {
      if (!search.userId) continue;

      const { data: matchedJobs } = await supabase
        .from('jobs')
        .select('id, title, company_name, city')
        .or(`title.ilike.%${search.position||''}%,city.ilike.%${search.city||''}%`)
        .eq('status', 'ACTIVE')
        .limit(3);

      if (matchedJobs && matchedJobs.length > 0) {
        console.log(`[Cron] Sending ${matchedJobs.length} related job notifications to user ${search.userId}`);
        
        // 1. Insert in-app notifications
        for (const mJob of matchedJobs) {
          await supabase.from('notifications').insert({
            user_id: search.userId,
            job_id: mJob.id,
            message: `Arama Geçmişinize göre öneri: ${mJob.title}`
          });
        }

        // 2. Fetch user email from Supabase to send notification
        const { data: userData } = await supabase.auth.admin.getUserById(search.userId);
        const userEmail = userData?.user?.email;

        if (userEmail && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
           const jobListHtml = matchedJobs.map(j => `<li><a href="http://localhost:5173/job/${j.id}">${j.title}</a> - ${j.company_name} (${j.city})</li>`).join('');
           const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'KariyerAI - Son aramalarınıza göre yeni ilanlar',
            html: `
              <h2>Aramalarınıza uygun ilanlar bulduk!</h2>
              <p>Son aramalarınıza dayanarak dikkatinizi çekebilecek bazı ilanlar:</p>
              <ul>${jobListHtml}</ul>
            `
          };
          transporter.sendMail(mailOptions).catch(err => console.error('[Cron] Email error:', err.message));
        }
      }
    }
  } catch (err) {
    console.error('[Cron] Related jobs notification error:', err.message);
  }
});

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'notification-service' }));

// ──────────────────────────────────────────────
// REST API: Get user notifications
// ──────────────────────────────────────────────
app.get('/api/v1/notifications/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// REST API: Mark notification as read
app.patch('/api/v1/notifications/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark read' });
  }
});

// Start queue consumer
startQueueConsumer();

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Notification Service running on port ${PORT}`));
