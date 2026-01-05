const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  auditeur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tache: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  action: { type: String },
  details: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('History', HistorySchema);
