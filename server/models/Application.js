const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  requirement_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startup_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
  cover_letter: { type: String },
  status: { type: String, enum: ['Pending', 'Reviewed', 'Accepted', 'Rejected'], default: 'Pending' },
  applied_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Application', applicationSchema);
