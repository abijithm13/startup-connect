const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: __dirname + '/.env' });
console.log("MONGO URI:", process.env.MONGODB_URI);
const authRoutes = require('./routes/auth');
const requirementRoutes = require('./routes/requirements');
const applicationRoutes = require('./routes/applications');
const userRoutes = require('./routes/users');



const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/notifications', require('./routes/notifications'));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Startup Connect API is running' });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
