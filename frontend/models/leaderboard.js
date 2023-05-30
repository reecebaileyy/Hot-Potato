const mongoose = require('mongoose');

const metadataSchema = new mongoose.Schema({
  address: { type: String, required: true },
  successfulPasses: { type: Number, required: true },
  totalWins: { type: Number, required: true },
});

module.exports = mongoose.model('leaderboard', metadataSchema);
