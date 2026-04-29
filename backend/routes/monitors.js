const router = require('express').Router();
const Monitor = require('../models/Monitor');
const StatusLog = require('../models/StatusLog');
const isAuth = require('../middleware/isAuth');

const MONITOR_LIMIT = 10;

// All routes require auth
router.use(isAuth);

// GET all monitors for current user
router.get('/', async (req, res) => {
  try {
    const monitors = await Monitor.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(monitors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single monitor (must belong to user)
router.get('/:id', async (req, res) => {
  try {
    const monitor = await Monitor.findOne({ _id: req.params.id, userId: req.user._id });
    if (!monitor) return res.status(404).json({ error: 'Monitor not found' });
    res.json(monitor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create monitor
router.post('/', async (req, res) => {
  try {
    const count = await Monitor.countDocuments({ userId: req.user._id });
    if (count >= MONITOR_LIMIT) {
      return res.status(403).json({ error: `Free plan limit: ${MONITOR_LIMIT} monitors max.` });
    }

    const { name, url, interval } = req.body;
    if (!name || !url) return res.status(400).json({ error: 'Name and URL are required' });

    const monitor = new Monitor({ userId: req.user._id, name, url, interval });
    await monitor.save();
    res.status(201).json(monitor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH toggle active/paused (ownership check)
router.patch('/:id/toggle', async (req, res) => {
  try {
    const monitor = await Monitor.findOne({ _id: req.params.id, userId: req.user._id });
    if (!monitor) return res.status(404).json({ error: 'Monitor not found' });
    monitor.active = !monitor.active;
    await monitor.save();
    res.json(monitor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE monitor + its logs (ownership check)
router.delete('/:id', async (req, res) => {
  try {
    const monitor = await Monitor.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!monitor) return res.status(404).json({ error: 'Monitor not found' });
    await StatusLog.deleteMany({ monitorId: req.params.id });
    res.json({ message: 'Monitor deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;