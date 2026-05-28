const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const Monitor = require('../models/Monitor');
const StatusLog = require('../models/StatusLog');

// Kick off Google OAuth flow
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google redirects back here
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.redirect(`${process.env.CLIENT_URL}/?token=${token}`);
  }
);

router.get('/debug', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  res.json({
    secret: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
    secretLength: process.env.JWT_SECRET?.length || 0,
    tokenReceived: token ? token.slice(0, 20) + '...' : 'NONE',
  });
});
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });

  const token = authHeader.split(' ')[1]; // Bearer <token>
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-__v');
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json(user);
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

//delete account
router.delete('/delete', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    
    const monitors = await Monitor.find({ userId });
    const monitorIds = monitors.map(m => m._id);
    await StatusLog.deleteMany({ monitorId: { $in: monitorIds } });

    //delete all monitors
    await Monitor.deleteMany({ userId });
    //delete user 
    await User.findByIdAndDelete(userId);
    
    res.json({ message: 'Account and associated monitors deleted' });
  }
  catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;