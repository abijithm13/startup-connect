const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const Startup = require('../models/Startup');
const { auth, userAuth, startupAuth } = require('../middleware/auth');

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const router = express.Router();

// Get user profile
router.get('/profile', userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user profile
router.put('/profile', userAuth, async (req, res) => {
  try {
    const { name, phone_number, location, skills, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone_number, location, skills, bio },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Upload resume to user profile
router.post('/profile/resume', userAuth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Resume file required' });
    }

    const resumeUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { resume_url: resumeUrl },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get startup profile
router.get('/startup/profile', startupAuth, async (req, res) => {
  try {
    const startup = await Startup.findById(req.user.id).select('-password');
    if (!startup) return res.status(404).json({ message: 'Startup not found' });
    res.json(startup);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// List job seeker users (for startups to browse candidates)
router.get('/', startupAuth, async (req, res) => {
  try {
    // we could accept query parameters for filtering in future
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
