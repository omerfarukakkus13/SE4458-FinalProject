const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/jobs', proxy(process.env.JOB_POSTING_URL));
app.use('/api/search', proxy(process.env.JOB_SEARCH_URL));
app.use('/api/notifications', proxy(process.env.NOTIFICATION_URL));
app.use('/api/ai', proxy(process.env.AI_AGENT_URL));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));
