const express = require('express');
const Application = require('../models/Application');
const Requirement = require('../models/Requirement');
const { auth, startupAuth, userAuth } = require('../middleware/auth');

const router = express.Router();

// Apply to a requirement (user)
router.post('/', userAuth, async (req, res) => {
  try {
    const { requirement_id, cover_letter } = req.body;

    const requirement = await Requirement.findById(requirement_id);
    if (!requirement) return res.status(404).json({ message: 'Requirement not found' });

    const existing = await Application.findOne({ requirement_id, user_id: req.user.id });
    if (existing) return res.status(400).json({ message: 'You have already applied' });

    const application = new Application({
      requirement_id,
      user_id: req.user.id,
      startup_id: requirement.startup_id,
      cover_letter,
    });

    await application.save();
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user's applications
router.get('/my', userAuth, async (req, res) => {
  try {
    const applications = await Application.find({ user_id: req.user.id })
      .populate({
        path: 'requirement_id',
        populate: { path: 'startup_id', select: 'name location' },
      })
      .sort({ applied_at: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get applications for a startup's requirements
router.get('/startup', startupAuth, async (req, res) => {
  try {
    const applications = await Application.find({ startup_id: req.user.id })
      .populate('user_id', 'name email phone_number location skills')
      .populate('requirement_id', 'title category')
      .sort({ applied_at: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update application status (startup)
router.put('/:id/status', startupAuth, async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, startup_id: req.user.id });
    if (!application) return res.status(404).json({ message: 'Application not found' });

    application.status = req.body.status;
    await application.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
