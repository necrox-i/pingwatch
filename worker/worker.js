require('dotenv').config();
const axios = require('axios');
const cron = require('node-cron');
const mongoose = require('mongoose');

// Schemas defined inline — worker is a standalone service
const monitorSchema = new mongoose.Schema({
  name: String,
  url: String,
  interval: Number,
  active: Boolean,
  currentStatus: String,
  lastChecked: Date,
}, { timestamps: true });

const statusLogSchema = new mongoose.Schema({
  monitorId: mongoose.Schema.Types.ObjectId,
  status: String,
  responseTime: Number,
  statusCode: Number,
  error: String,
  checkedAt: { type: Date, default: Date.now },
});

const Monitor = mongoose.model('Monitor', monitorSchema);
const StatusLog = mongoose.model('StatusLog', statusLogSchema);

// ─── Ping a single monitor ────────────────────────────────────────────────────
async function pingMonitor(monitor) {
  const start = Date.now();
  let status = 'down';
  let responseTime = null;
  let statusCode = null;
  let error = null;

  try {
    const response = await axios.get(monitor.url, { timeout: 10000 });
    responseTime = Date.now() - start;
    statusCode = response.status;
    status = response.status < 400 ? 'up' : 'down';
  } catch (err) {
    responseTime = Date.now() - start;
    statusCode = err.response?.status || null;
    error = err.message;
    status = 'down';
  }

  // Save result to log
  await StatusLog.create({ monitorId: monitor._id, status, responseTime, statusCode, error });

  // Detect status change (for alerting)
  const previousStatus = monitor.currentStatus;

  // Update monitor document
  await Monitor.findByIdAndUpdate(monitor._id, {
    currentStatus: status,
    lastChecked: new Date(),
  });

  const symbol = status === 'up' ? '✓' : '✗';
  console.log(`${symbol} [${new Date().toISOString()}] ${monitor.name} → ${status} (${responseTime}ms)`);

  // Alert on status change — Phase 9: replace this with Telegram/email
  if (previousStatus !== 'pending' && previousStatus !== status) {
    console.log(`⚠️  ALERT: "${monitor.name}" flipped ${previousStatus} → ${status}`);
    // TODO: sendTelegramAlert(monitor, status);
  }
}

// ─── Run all due checks ───────────────────────────────────────────────────────
async function runChecks() {
  try {
    const monitors = await Monitor.find({ active: true });
    if (monitors.length === 0) {
      console.log('[worker] No active monitors.');
      return;
    }
    // Run all pings in parallel, don't let one failure stop others
    await Promise.allSettled(monitors.map(pingMonitor));
  } catch (err) {
    console.error('[worker] Error fetching monitors:', err.message);
  }
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pingwatch');
  console.log('[worker] Connected to MongoDB');

  // Run immediately on startup so you see results right away
  console.log('[worker] Running initial check...');
  await runChecks();

  // Then run every 10 minutes (Phase 2: make this per-monitor interval)
  // Note: interval-based scheduling per monitor is a Phase 2 improvement
  // cron.schedule('*/10 * * * *', async () => {
  cron.schedule('* * * * *', async () => {

    console.log('[worker] Running scheduled check...');
    await runChecks();
  });

  console.log('[worker] Scheduler started. Checking every 10 minutes.');
}

main().catch((err) => {
  console.error('[worker] Fatal error:', err.message);
  process.exit(1);
});
