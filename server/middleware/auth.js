const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const startupAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'startup') {
      return res.status(403).json({ message: 'Access denied. Startup only.' });
    }
    next();
  });
};

const userAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Access denied. User only.' });
    }
    next();
  });
};

module.exports = { auth, startupAuth, userAuth };
