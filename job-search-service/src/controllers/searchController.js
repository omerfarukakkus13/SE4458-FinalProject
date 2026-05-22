const SearchHistory = require('../models/SearchHistory');
const mongoose = require('mongoose');

// Yardımcı: MongoDB bağlı mı kontrol et
const isMongoConnected = () => mongoose.connection.readyState === 1;

// GET /api/v1/search — log and search
exports.searchJobs = async (req, res) => {
  try {
    const { position, city, userId, page = 1, limit = 10 } = req.query;

    // MongoDB'ye loglama yap — ama hata olsa bile aramayı durdurma
    if ((position || city) && isMongoConnected()) {
      SearchHistory.create({
        userId: userId || null,
        position: position || null,
        city: city || null,
      }).catch(err => console.warn('[MongoDB] Search log failed:', err.message));
    }

    // Job Posting Service'e proxy
    const params = new URLSearchParams();
    if (position) params.set('position', position);
    if (city) params.set('city', city);
    if (req.query.country) params.set('country', req.query.country);
    if (req.query.work_type) params.set('work_type', req.query.work_type);
    params.set('page', page);
    params.set('limit', limit);

    const jobServiceUrl = process.env.JOB_POSTING_URL || 'http://localhost:3001';
    const response = await fetch(`${jobServiceUrl}/api/v1/jobs?${params.toString()}`);

    if (!response.ok) {
      const text = await response.text();
      console.error('[Search] Job service error:', text);
      throw new Error('Job posting service error');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('searchJobs error:', error.message);
    res.status(500).json({ error: 'Search error: ' + error.message });
  }
};

// GET /api/v1/search/recent?userId=
exports.getRecentSearches = async (req, res) => {
  try {
    if (!isMongoConnected()) return res.status(200).json([]);
    const { userId } = req.query;
    if (!userId) return res.status(200).json([]);

    const searches = await SearchHistory.find({ userId })
      .sort({ searchedAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json(searches);
  } catch (error) {
    console.error('getRecentSearches error:', error.message);
    res.status(200).json([]); // Hata olsa bile boş array dön
  }
};

// GET /api/v1/search/recent-all — notification service için
exports.getAllRecentSearches = async (req, res) => {
  try {
    if (!isMongoConnected()) return res.status(200).json([]);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const searches = await SearchHistory.find({ searchedAt: { $gte: yesterday } })
      .sort({ searchedAt: -1 })
      .limit(100)
      .lean();
    res.status(200).json(searches);
  } catch (error) {
    res.status(200).json([]);
  }
};
