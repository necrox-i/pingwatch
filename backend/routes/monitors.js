const router = require('express').Router();
const Monitor = require('../models/Monitor');
const StatusLog = require('../models/StatusLog');

// GET all monitors
router.get('/', async (req, res) => {
  try {
    const monitors = await Monitor.find().sort({ createdAt: -1 });
    res.json(monitors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single monitor
router.get('/:id', async (req, res) => {
  try {
    const monitor = await Monitor.findById(req.params.id);
    if (!monitor) return res.status(404).json({ error: 'Monitor not found' });
    res.json(monitor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create monitor
router.post('/', async (req, res) => {
  try {
    const { name, url, interval } = req.body;
    if (!name || !url) return res.status(400).json({ error: 'Name and URL are required' });
    const monitor = new Monitor({ name, url, interval });
    await monitor.save();
    res.status(201).json(monitor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH toggle active/paused
router.patch('/:id/toggle', async (req, res) => {
  try {
    const monitor = await Monitor.findById(req.params.id);
    if (!monitor) return res.status(404).json({ error: 'Monitor not found' });
    monitor.active = !monitor.active;
    await monitor.save();
    res.json(monitor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE monitor + its logs
router.delete('/:id', async (req, res) => {
  try {
    await Monitor.findByIdAndDelete(req.params.id);
    await StatusLog.deleteMany({ monitorId: req.params.id });
    res.json({ message: 'Monitor deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
