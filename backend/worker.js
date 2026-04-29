const axios = require('axios');
const cron = require('node-cron');
const Monitor = require('./models/Monitor');
const StatusLog = require('./models/StatusLog');

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

  await StatusLog.create({
    monitorId: monitor._id,
    userId: monitor.userId,
    status,
    responseTime,
    statusCode,
    error,
  });

  const previousStatus = monitor.currentStatus;

  await Monitor.findByIdAndUpdate(monitor._id, {
    currentStatus: status,
    lastChecked: new Date(),
  });

  const symbol = status === 'up' ? '✓' : '✗';
  console.log(`${symbol} [${new Date().toISOString()}] ${monitor.name} -> ${status} (${responseTime}ms)`);

  if (previousStatus !== 'pending' && previousStatus !== status) {
    console.log(`ALERT: "${monitor.name}" flipped ${previousStatus} -> ${status}`);
  }
}

async function runChecks() {
  try {
    const monitors = await Monitor.find({ active: true });
    if (monitors.length === 0) {
      console.log('[worker] No active monitors.');
      return;
    }

    const now = Date.now();
    const dueMonitors = monitors.filter((monitor) => {
      const lastChecked = monitor.lastChecked ? new Date(monitor.lastChecked).getTime() : 0;
      const intervalMs = (monitor.interval || 10) * 60 * 1000;
      return now - lastChecked >= intervalMs;
    });

    if (dueMonitors.length === 0) {
      console.log('[worker] No monitors due for check.');
      return;
    }

    await Promise.allSettled(dueMonitors.map(pingMonitor));
  } catch (err) {
    console.error('[worker] Error fetching monitors:', err.message);
  }
}

function watchNewMonitors() {
  const changeStream = Monitor.watch(
    [{ $match: { operationType: 'insert' } }],
    { fullDocument: 'updateLookup' }
  );

  changeStream.on('change', async (event) => {
    const monitor = event.fullDocument;
    if (!monitor || !monitor.active) return;
    console.log(`[worker] New monitor detected: "${monitor.name}" — pinging immediately`);
    try {
      await pingMonitor(monitor);
    } catch (err) {
      console.error(`[worker] Immediate ping failed for "${monitor.name}":`, err.message);
    }
  });

  changeStream.on('error', (err) => {
    console.error('[worker] Change stream error:', err.message);
    setTimeout(watchNewMonitors, 5000);
  });

  console.log('[worker] Watching for new monitors...');
}

function keepAlive() {
  const url = process.env.SERVER_URL;
  if (!url) return;
  cron.schedule('*/10 * * * *', async () => {
    try { await axios.get(`${url}/health`); } catch {}
  });
}

module.exports = async function startWorker() {
  console.log('[worker] Running initial check...');
  await runChecks();

  watchNewMonitors();

  cron.schedule('* * * * *', async () => {
    console.log('[worker] Running scheduled check...');
    await runChecks();
  });

  keepAlive();
  console.log('[worker] Scheduler started.');
};