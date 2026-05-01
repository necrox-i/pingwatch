const axios = require('axios');
const cron = require('node-cron');
const Monitor = require('./models/Monitor');
const StatusLog = require('./models/StatusLog');

// ─── Ping a single monitor ────────────────────────────────────────────────────
async function pingMonitor(monitor) {
  const start = Date.now();
  let status = 'down';
  let responseTime = null;
  let statusCode = null;
  let error = null;

  try {
    const response = await axios.get(monitor.url, {
      timeout: 10000,
      maxRedirects: 5,
      // Don't send cookies or auth headers to external URLs
      headers: { 'User-Agent': 'PingWatch/1.0 (uptime monitor)' },
    });
    responseTime = Date.now() - start;
    statusCode = response.status;
    status = response.status < 400 ? 'up' : 'down';
  } catch (err) {
    responseTime = Date.now() - start;
    statusCode = err.response?.status || null;
    error = err.message;
    status = 'down';
  }

  // Read previousStatus BEFORE writing — avoids stale read
  const previousStatus = monitor.currentStatus;

  // Write log + update monitor in parallel — saves ~50-100ms per ping
  await Promise.all([
    StatusLog.create({
      monitorId: monitor._id,
      userId: monitor.userId,
      status,
      responseTime,
      statusCode,
      error,
    }),
    Monitor.findByIdAndUpdate(monitor._id, {
      currentStatus: status,
      lastChecked: new Date(),
    }),
  ]);

  const symbol = status === 'up' ? '✓' : '✗';
  console.log(`${symbol} [${new Date().toISOString()}] ${monitor.name} → ${status} (${responseTime}ms)`);

  // Alert on status flip
  if (previousStatus !== 'pending' && previousStatus !== status) {
    console.log(`⚠️  ALERT: "${monitor.name}" flipped ${previousStatus} → ${status}`);
    // TODO Phase 9: sendAlert(monitor, status);
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

    const now = Date.now();
    const dueMonitors = monitors.filter((monitor) => {
      const lastChecked = monitor.lastChecked
        ? new Date(monitor.lastChecked).getTime()
        : 0;
      const intervalMs = (monitor.interval || 10) * 60 * 1000;
      return now - lastChecked >= intervalMs;
    });

    if (dueMonitors.length === 0) {
      console.log('[worker] No monitors due for check.');
      return;
    }

    console.log(`[worker] Checking ${dueMonitors.length}/${monitors.length} monitors`);

    // Run all pings in parallel — one failure never blocks others
    const results = await Promise.allSettled(dueMonitors.map(pingMonitor));

    // Log any unexpected errors
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        console.error(`[worker] Ping failed for "${dueMonitors[i].name}":`, result.reason?.message);
      }
    });

  } catch (err) {
    console.error('[worker] Error in runChecks:', err.message);
  }
}

// ─── Watch for new monitors → ping immediately ────────────────────────────────
function watchNewMonitors() {
  try {
    const changeStream = Monitor.watch(
      [{ $match: { operationType: 'insert' } }],
      { fullDocument: 'updateLookup' }
    );

    changeStream.on('change', async (event) => {
      const monitor = event.fullDocument;
      if (!monitor?.active) return;
      console.log(`[worker] New monitor: "${monitor.name}" — pinging immediately`);
      try {
        await pingMonitor(monitor);
      } catch (err) {
        console.error(`[worker] Immediate ping failed for "${monitor.name}":`, err.message);
      }
    });

    changeStream.on('error', (err) => {
      console.error('[worker] Change stream error:', err.message);
      // Reconnect after 5s
      setTimeout(watchNewMonitors, 5000);
    });

    console.log('[worker] Watching for new monitors...');
  } catch (err) {
    // Change streams require MongoDB replica set — M0 Atlas supports this
    // If running locally without replica set, this will fail silently
    console.warn('[worker] Change stream unavailable (local MongoDB?):', err.message);
  }
}

// ─── Self-ping to prevent Render cold start ───────────────────────────────────
function keepAlive() {
  const url = process.env.SERVER_URL;
  if (!url) {
    console.log('[worker] SERVER_URL not set — keepAlive disabled');
    return;
  }
  // Ping every 10 min — Render spins down after 15 min inactivity
  cron.schedule('*/10 * * * *', async () => {
    try {
      await axios.get(`${url}/health`, { timeout: 5000 });
    } catch {
      // Silently ignore — if health fails, something bigger is wrong
    }
  });
  console.log(`[worker] keepAlive active → ${url}/health every 10 min`);
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────
module.exports = async function startWorker() {
  console.log('[worker] Starting...');

  // Run immediately on startup
  await runChecks();

  // Watch for new monitors via change stream
  watchNewMonitors();

  // Main cron — runs every minute, filters by per-monitor interval internally
  cron.schedule('* * * * *', async () => {
    await runChecks();
  });

  // Keep Render service alive
  keepAlive();

  console.log('[worker] Started. Scheduler running every minute.');
};