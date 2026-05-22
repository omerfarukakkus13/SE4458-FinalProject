const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
    userId: { type: String, required: false }, // optional if not logged in
    position: { type: String },
    city: { type: String },
    searchedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
