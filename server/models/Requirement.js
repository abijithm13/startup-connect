const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
  startup_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
  title: { type: String, required: true },
  category: { type: String, required: true, enum: ['Engineering',
      'IT', 
      'Sales',
      'Marketing',
      'Product Management',
      'Operations',
      'Finance',
      'Human Resources',
      'Business Development',
      'Customer Success',
      'Design',
      'Data & Analytics'] },
  preferred_skills: { type: String },
  urgency_level: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  description: { type: String },
  comments: { type: String },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  created_at: { type: Date, default: Date.now },
  
  // ✅ SINGLE EXPERIENCE FIELD 👇
  experience: { 
    type: String, 
    enum: ['Fresher', '1-2 Years', '3-5 Years', '5+ Years'], 
    default: 'Fresher',
    required: true
  }
  // REMOVED: min_experience, max_experience, experience_preferred 👈
});

module.exports = mongoose.model('Requirement', requirementSchema);
