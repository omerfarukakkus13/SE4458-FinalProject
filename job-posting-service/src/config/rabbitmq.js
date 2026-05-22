const amqp = require('amqplib');

let channel;

async function connectQueue() {
    try {
        const connection = await amqp.connect(process.env.AMQP_URL);
        channel = await connection.createChannel();
        await channel.assertQueue('new_job_postings');
        console.log("Connected to RabbitMQ");
    } catch (error) {
        console.error("RabbitMQ Connection Error:", error);
    }
}

connectQueue();

exports.publishNewJob = async (jobData) => {
    try {
        if (!channel) await connectQueue();
        channel.sendToQueue('new_job_postings', Buffer.from(JSON.stringify(jobData)));
        console.log("Published new job to queue");
    } catch (error) {
        console.error("Error publishing to queue", error);
    }
};
