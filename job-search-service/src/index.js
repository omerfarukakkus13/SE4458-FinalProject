const express = require('express');
const cors = require('cors');
require('dotenv').config();

const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// Force Google DNS — telefonla paylaşılan internet ve bazı ISP'lerde
// MongoDB SRV sorgularını bloke eden DNS sunucularını aşmak için
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 15000,
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err.message));

const searchRoutes = require('./routes/searchRoutes');
app.use('/api/v1/search', searchRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Job Search Service on port ${PORT}`));
