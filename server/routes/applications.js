const express = require('express');
const Application = require('../models/Application');
const Requirement = require('../models/Requirement');
const Notification = require('../models/Notification');
const User = require('../models/User'); // ✅ ADDED
const { auth, startupAuth, userAuth } = require('../middleware/auth');

const router = express.Router();

// ✅ 1️⃣ USER APPLY → STARTUP NOTIFICATION (Already Working)
router.post('/', userAuth, async (req, res) => {
  try {
    const { requirement_id, cover_letter } = req.body;
    
    const requirement = await Requirement.findById(requirement_id)
      .populate('startup_id', 'name email');
    if (!requirement) {
      return res.status(404).json({ message: 'Requirement not found' });
    }

    const existing = await Application.findOne({ 
      requirement_id, 
      user_id: req.user.id 
    });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied' });
    }

    const application = new Application({
      requirement_id,
      user_id: req.user.id,
      startup_id: requirement.startup_id._id,
      cover_letter,
    });
    await application.save();

    const user = await User.findById(req.user.id).select('name');
    const userName = user?.name || 'Job Seeker';

    await Notification.create({
      userId: requirement.startup_id._id,
      type: 'job_application',
      title: `New Application: ${requirement.title}`,
      message: `${userName} applied for "${requirement.title}"`,
      relatedId: application._id
    });

    res.status(201).json(application);
  } catch (err) {
    console.error('❌ Application POST error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ 2️⃣ Get user's applications
router.get('/my', userAuth, async (req, res) => {
  try {
    const applications = await Application.find({ user_id: req.user.id })
      .populate({
        path: 'requirement_id',
        populate: { 
          path: 'startup_id', 
          select: 'name location domain' 
        }
      })
      .sort({ applied_at: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ 3️⃣ Get applications for startup
router.get('/startup', startupAuth, async (req, res) => {
  try {
    const applications = await Application.find({ startup_id: req.user.id })
      .populate('user_id', 'name email phone_number location skills experience_level resume_url')
      .populate('requirement_id', 'title category urgency_level experience')
      .sort({ applied_at: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ 4️⃣ FIXED: STARTUP ACCEPT/REJECT → USER NOTIFICATION (THIS WAS BROKEN)
router.put('/:id/status', startupAuth, async (req, res) => {
  try {
    // ✅ FIXED: Proper population chain to get startup name
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'requirement_id',
        select: 'title',
        populate: { 
          path: 'startup_id', 
          select: 'name'  // ✅ CRITICAL: Get startup name here
        }
      })
      .populate('user_id', 'name'); // ✅ Optional: for debugging

    if (!application || application.startup_id.toString() !== req.user.id.toString()) {
      return res.status(404).json({ message: 'Application not found or unauthorized' });
    }

    const oldStatus = application.status;
    const newStatus = req.body.status;
    application.status = newStatus;
    await application.save();

    // ✅ FIXED: Only create notification if status actually changed
    if (newStatus !== oldStatus) {
      // ✅ FIXED: Properly get startup name
      const startupName = application.requirement_id.startup_id.name || 'Startup';
      
      // ✅ PERFECT MESSAGE FORMAT YOU WANTED
      await Notification.create({
        userId: application.user_id._id || application.user_id,  // ✅ TO THE USER identity
        type: 'application_status',
        title: 'Application Update',
        message: `${startupName} ${newStatus.toLowerCase()}d your application`, // ✅ "Startup accepted your application"
        relatedId: application._id
      });

      console.log(`🔔 ✅ Notification sent to user ${application.user_id}: "${startupName} ${newStatus.toLowerCase()}d your application"`);
    }

    res.json(application);
  } catch (err) {
    console.error('❌ Status update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
