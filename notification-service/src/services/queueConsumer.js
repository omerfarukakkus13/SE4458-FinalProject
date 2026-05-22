const amqp = require('amqplib');

exports.startConsumer = async () => {
    try {
        const connection = await amqp.connect(process.env.AMQP_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue('new_job_postings');

        console.log("Notification Service: Waiting for messages in 'new_job_postings' queue...");

        channel.consume('new_job_postings', (msg) => {
            if (msg !== null) {
                const jobData = JSON.parse(msg.content.toString());
                console.log(`[x] Received New Job Posting: ${jobData.title} at ${jobData.company_name}`);
                
                // Here we would match this new job against User Job Alerts in MongoDB or Supabase
                // And send an email/notification
                
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error("RabbitMQ Consumer Error:", error);
    }
};
