const { createClient } = require('@supabase/supabase-js');
const { Redis } = require('@upstash/redis');
const { publishNewJob } = require('../config/rabbitmq');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// GET /api/v1/jobs  — filterable + paginated
exports.getAllJobs = async (req, res) => {
  try {
    const {
      city,
      town,
      position,
      work_type,
      country,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    // Build a stable cache key from filter params
    const cacheKey = `jobs:city=${city||''}&pos=${position||''}&wt=${work_type||''}&p=${pageNum}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    let query = supabase.from('jobs').select('*', { count: 'exact' }).eq('status', 'ACTIVE');

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    if (town) {
      query = query.or(`city.ilike.%${town}%,description.ilike.%${town}%`);
    }
    if (position) {
      query = query.or(`title.ilike.%${position}%,position.ilike.%${position}%`);
    }
    if (work_type) {
      query = query.eq('work_type', work_type);
    }
    if (country) {
      query = query.ilike('country', `%${country}%`);
    }

    const { data: jobs, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const result = {
      data: jobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
      },
    };

    await redis.setex(cacheKey, 180, result); // 3 min cache
    res.status(200).json(result);
  } catch (error) {
    console.error('getAllJobs error:', error);
    res.status(500).json({ error: 'Server error fetching jobs' });
  }
};

// GET /api/v1/jobs/:id
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `job_detail_${id}`;

    const cached = await redis.get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    await redis.setex(cacheKey, 600, data);
    res.status(200).json(data);
  } catch (error) {
    console.error('getJobById error:', error);
    res.status(500).json({ error: 'Server error fetching job' });
  }
};

// GET /api/v1/jobs/related/:id  — at least 3 related jobs
exports.getRelatedJobs = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch source job first
    const { data: source } = await supabase.from('jobs').select('position,city').eq('id', id).single();
    if (!source) return res.status(404).json({ error: 'Job not found' });

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .neq('id', id)
      .or(`position.ilike.%${source.position}%,city.ilike.%${source.city}%`)
      .eq('status', 'ACTIVE')
      .limit(4);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('getRelatedJobs error:', error);
    res.status(500).json({ error: 'Server error fetching related jobs' });
  }
};

// POST /api/v1/jobs  — admin creates job
exports.createJob = async (req, res) => {
  try {
    const { title, company_name, city, position, description, requirements, work_type, country, created_by } = req.body;

    if (!title || !company_name || !city || !position || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('jobs')
      .insert([{ 
        title, company_name, city, position, description, requirements, 
        work_type: work_type || 'Tam Zamanlı', 
        country: country || 'Türkiye',
        created_by: created_by || null
      }])
      .select()
      .single();

    if (error) throw error;

    // Invalidate listing caches
    const keys = await redis.keys('jobs:*');
    if (keys && keys.length) await Promise.all(keys.map(k => redis.del(k)));

    // Publish to RabbitMQ queue so notification service picks it up
    await publishNewJob(data);

    res.status(201).json(data);
  } catch (error) {
    console.error('createJob error:', error);
    res.status(500).json({ error: 'Server error creating job' });
  }
};

// PUT /api/v1/jobs/:id  — admin updates job
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('jobs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Invalidate caches
    await redis.del(`job_detail_${id}`);
    const keys = await redis.keys('jobs:*');
    if (keys && keys.length) await Promise.all(keys.map(k => redis.del(k)));

    res.status(200).json(data);
  } catch (error) {
    console.error('updateJob error:', error);
    res.status(500).json({ error: 'Server error updating job' });
  }
};

// POST /api/v1/jobs/:id/apply
exports.applyJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, user_email } = req.body;

    if (!user_id) return res.status(400).json({ error: 'User ID required' });

    // Check if already applied
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', id)
      .eq('user_id', user_id)
      .single();

    if (existing) return res.status(409).json({ error: 'Already applied to this job' });

    const { data, error } = await supabase
      .from('applications')
      .insert([{ job_id: id, user_id, user_email: user_email || null }])
      .select()
      .single();

    if (error) throw error;

    // Increment applications_count
    await supabase.rpc('increment_applications', { job_id: parseInt(id) });

    // Invalidate job cache
    await redis.del(`job_detail_${id}`);

    res.status(201).json({ message: 'Applied successfully', application: data });
  } catch (error) {
    console.error('applyJob error:', error);
    res.status(500).json({ error: 'Server error applying to job' });
  }
};

// GET /api/v1/jobs/:id/applicants — employer sees who applied
exports.getJobApplicants = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('applications')
      .select('id, user_id, user_email, applied_at')
      .eq('job_id', id)
      .order('applied_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data || []);
  } catch (error) {
    console.error('getJobApplicants error:', error);
    res.status(500).json({ error: 'Server error fetching applicants' });
  }
};

// GET /api/v1/jobs/my-applications?user_id=
exports.getUserApplications = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });

    const { data, error } = await supabase
      .from('applications')
      .select('id, applied_at, job_id, jobs(id, title, company_name, city, country, work_type, position, status)')
      .eq('user_id', user_id)
      .order('applied_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data || []);
  } catch (error) {
    console.error('getUserApplications error:', error);
    res.status(500).json({ error: 'Server error fetching applications' });
  }
};

// GET /api/v1/jobs/autocomplete?q=
exports.autocomplete = async (req, res) => {
  try {
    const { q, type } = req.query; // type: 'position' | 'city'
    if (!q || q.length < 2) return res.status(200).json([]);

    const field = type === 'city' ? 'city' : 'title';
    const { data, error } = await supabase
      .from('jobs')
      .select(field)
      .ilike(field, `%${q}%`)
      .eq('status', 'ACTIVE')
      .limit(8);

    if (error) throw error;

    const suggestions = [...new Set(data.map(d => d[field]))];
    res.status(200).json(suggestions);
  } catch (error) {
    console.error('autocomplete error:', error);
    res.status(500).json({ error: 'Autocomplete error' });
  }
};
