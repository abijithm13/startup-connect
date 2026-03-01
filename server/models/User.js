const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone_number: { type: String },
  location: { type: String },
  skills: { type: String },
  resume_url: { type: String },
  bio: { type: String },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
