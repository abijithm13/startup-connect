const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
  startup_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
  title: { type: String, required: true },
  category: { type: String, required: true, enum: ['Funding', 'Talent', 'Mentorship', 'Partnership', 'Other'] },
  preferred_skills: { type: String },
  urgency_level: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  description: { type: String },
  comments: { type: String },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Requirement', requirementSchema);
