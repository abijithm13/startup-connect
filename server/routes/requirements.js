const express = require('express');
const Requirement = require('../models/Requirement');
const { auth, startupAuth } = require('../middleware/auth');

const router = express.Router();

// Get all open requirements (public - for users to browse)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { status: 'Open' };

    if (category && category !== 'All Categories') {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { preferred_skills: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const requirements = await Requirement.find(filter)
      .populate('startup_id', 'name location domain')
      .sort({ created_at: -1 });

    res.json(requirements);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get requirements by startup (startup's own)
router.get('/my', startupAuth, async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { startup_id: req.user.id };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const requirements = await Requirement.find(filter).sort({ created_at: -1 });
    res.json(requirements);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create requirement
router.post('/', startupAuth, async (req, res) => {
  try {
    const { title, category, preferred_skills, urgency_level, description, comments } = req.body;

    const requirement = new Requirement({
      startup_id: req.user.id,
      title, category, preferred_skills, urgency_level, description, comments,
    });

    await requirement.save();
    res.status(201).json(requirement);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update requirement
router.put('/:id', startupAuth, async (req, res) => {
  try {
    const requirement = await Requirement.findOne({ _id: req.params.id, startup_id: req.user.id });
    if (!requirement) return res.status(404).json({ message: 'Requirement not found' });

    Object.assign(requirement, req.body);
    await requirement.save();
    res.json(requirement);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete requirement
router.delete('/:id', startupAuth, async (req, res) => {
  try {
    const requirement = await Requirement.findOneAndDelete({ _id: req.params.id, startup_id: req.user.id });
    if (!requirement) return res.status(404).json({ message: 'Requirement not found' });
    res.json({ message: 'Requirement deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
