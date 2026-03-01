const mongoose = require('mongoose');

const startupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  founder_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: { type: String, required: true },
  domain: { type: String, required: true },
  contact_email: { type: String },
  established_year: { type: Number },
  description: { type: String },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Startup', startupSchema);
