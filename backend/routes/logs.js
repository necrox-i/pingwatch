const router = require('express').Router();
const StatusLog = require('../models/StatusLog');
const Monitor = require('../models/Monitor');
const isAuth = require('../middleware/isAuth');

router.use(isAuth);

// Helper: verify monitor belongs to current user
async function ownedMonitor(monitorId, userId) {
  return Monitor.findOne({ _id: monitorId, userId });
}

// GET last 50 logs for a monitor
router.get('/:monitorId', async (req, res) => {
  try {
    const monitor = await ownedMonitor(req.params.monitorId, req.user._id);
    if (!monitor) return res.status(404).json({ error: 'Monitor not found' });

    const logs = await StatusLog.find({ monitorId: req.params.monitorId })
      .sort({ checkedAt: -1 })
      .limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET uptime % for last 24h
router.get('/:monitorId/uptime', async (req, res) => {
  try {
    const monitor = await ownedMonitor(req.params.monitorId, req.user._id);
    if (!monitor) return res.status(404).json({ error: 'Monitor not found' });

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const logs = await StatusLog.find({
      monitorId: req.params.monitorId,
      checkedAt: { $gte: since },
    });

    if (logs.length === 0) return res.json({ uptime: null, total: 0 });

    const upCount = logs.filter((l) => l.status === 'up').length;
    const uptime = parseFloat(((upCount / logs.length) * 100).toFixed(2));
    res.json({ uptime, total: logs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;