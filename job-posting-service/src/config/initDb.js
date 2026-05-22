require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DB_URI,
});

const createTables = async () => {
    try {
        await client.connect();
        console.log("Connected to Supabase PostgreSQL.");

        // Create Jobs Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS jobs (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                company_name VARCHAR(255) NOT NULL,
                city VARCHAR(100) NOT NULL,
                position VARCHAR(100) NOT NULL,
                description TEXT NOT NULL,
                requirements TEXT,
                applications_count INTEGER DEFAULT 0,
                status VARCHAR(50) DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Jobs table created or already exists.");

        // Create Applications Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS applications (
                id SERIAL PRIMARY KEY,
                job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
                user_id UUID NOT NULL,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(job_id, user_id)
            );
        `);
        console.log("Applications table created or already exists.");

        console.log("Database initialization successful!");
    } catch (error) {
        console.error("Error initializing database:", error);
    } finally {
        await client.end();
    }
};

createTables();
