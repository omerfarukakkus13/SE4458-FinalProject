const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/searchController');

router.get('/', ctrl.searchJobs);
router.get('/recent-all', ctrl.getAllRecentSearches);
router.get('/recent', ctrl.getRecentSearches);

module.exports = router;
