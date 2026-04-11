const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Startup = require('../models/Startup');
const User = require('../models/User');

const router = express.Router();

// Startup Register
router.post('/startup/register', async (req, res) => {
  try {
    const { name, founder_name, email, password, location, domain, established_year, description } = req.body;

    const existing = await Startup.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Startup with this email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const startup = new Startup({
      name, founder_name, email, password: hashedPassword,
      location, domain, established_year, description,
      contact_email: email,
    });

    await startup.save();
    const token = jwt.sign({ id: startup._id, role: 'startup' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      startup: { id: startup._id, name: startup.name, email: startup.email, founder_name: startup.founder_name },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Startup Login
router.post('/startup/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const startup = await Startup.findOne({ email });
    if (!startup) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, startup.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: startup._id, role: 'startup' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      startup: { id: startup._id, name: startup.name, email: startup.email, founder_name: startup.founder_name },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// User Register
router.post('/user/register', async (req, res) => {
  try {
    const { name, email, password, phone_number, location, skills, bio } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: 'User with this email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name, email, password: hashedPassword,
      phone_number, location, skills, bio,
    });

    await user.save();
    const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// User Login
router.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
