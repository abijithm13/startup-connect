const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['job_application', 'new_job_post', 'application_status'], 
    required: true 
  },
  title: { type: String, required: true },
  message: String,
  relatedId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
