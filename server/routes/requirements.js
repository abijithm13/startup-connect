const express = require('express');
const Requirement = require('../models/Requirement');
const Notification = require('../models/Notification'); // ✅ NEW IMPORT
const User = require('../models/User'); // ✅ NEW IMPORT
const { auth, startupAuth } = require('../middleware/auth');

const router = express.Router();

// Get all open requirements (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, experience } = req.query;
    const filter = { status: 'Open' };

    if (category && category !== 'All Categories') {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { preferred_skills: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { experience: { $regex: search, $options: 'i' } }
      ];
    }
    if (experience) {
      filter.experience = experience;
    }

    const requirements = await Requirement.find(filter)
      .populate('startup_id', 'name location domain')
      .sort({ created_at: -1 });

    res.json(requirements);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get startup's own requirements
router.get('/my', startupAuth, async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { startup_id: req.user.id };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { experience: { $regex: search, $options: 'i' } }
      ];
    }

    const requirements = await Requirement.find(filter).sort({ created_at: -1 });
    res.json(requirements);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create requirement - NEW JOB POST → SEND NOTIFICATION TO USERS ✅
router.post('/', startupAuth, async (req, res) => {
  try {
    const requirement = new Requirement({
      startup_id: req.user.id,
      title: req.body.title,
      category: req.body.category,
      preferred_skills: req.body.preferred_skills,
      urgency_level: req.body.urgency_level,
      description: req.body.description,
      comments: req.body.comments,
      experience: req.body.experience || 'Fresher'
    });

    await requirement.save();

    const startup = await User.findById(req.user.id).select('name email');
    // ✅ SEND NOTIFICATION TO RECENT ACTIVE JOB SEEKERS (LIMIT 50 to avoid spam)
    // NOTE: User schema has no userType, so send to all job seeker records from User collection.
    const recentUsers = await User.find().limit(50);

    const notifications = recentUsers.map(user => ({
      userId: user._id,
      type: 'new_job_post',
      title: `New Job: ${requirement.title}`,
      message: `${startup?.name || 'Startup'} posted "${requirement.title}"`,
      relatedId: requirement._id
    }));

    await Notification.insertMany(notifications); // Bulk insert for performance

    res.status(201).json(requirement);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update requirement
router.put('/:id', startupAuth, async (req, res) => {
  try {
    const requirement = await Requirement.findOne({ 
      _id: req.params.id, 
      startup_id: req.user.id 
    });
    if (!requirement) return res.status(404).json({ message: 'Requirement not found' });

    requirement.title = req.body.title || requirement.title;
    requirement.category = req.body.category || requirement.category;
    requirement.preferred_skills = req.body.preferred_skills || requirement.preferred_skills;
    requirement.urgency_level = req.body.urgency_level || requirement.urgency_level;
    requirement.description = req.body.description || requirement.description;
    requirement.comments = req.body.comments || requirement.comments;
    requirement.experience = req.body.experience || requirement.experience;

    await requirement.save();
    res.json(requirement);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete requirement
router.delete('/:id', startupAuth, async (req, res) => {
  try {
    const requirement = await Requirement.findOneAndDelete({ 
      _id: req.params.id, 
      startup_id: req.user.id 
    });
    if (!requirement) return res.status(404).json({ message: 'Requirement not found' });
    res.json({ message: 'Requirement deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
