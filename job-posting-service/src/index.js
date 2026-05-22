const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const jobRoutes = require('./routes/jobRoutes');
const alertRoutes = require('./routes/alertRoutes');

// Versioned API
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/alerts', alertRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'job-posting-service' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Job Posting Service on port ${PORT}`));
