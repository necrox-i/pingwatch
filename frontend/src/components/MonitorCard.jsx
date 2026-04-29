import { useState, useEffect } from 'react';
import axios from 'axios';

function StatusDot({ status }) {
  const styles = {
    up: 'bg-green-500',
    down: 'bg-red-500 animate-pulse',
    pending: 'bg-yellow-500',
  };
  return (
    <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${styles[status] || 'bg-gray-600'}`} />
  );
}

export default function MonitorCard({ monitor, onDelete, onToggle }) {
  const [uptime, setUptime] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios
      .get(`/api/logs/${monitor._id}/uptime`)
      .then((r) => setUptime(r.data.uptime))
      .catch(() => { });

    axios
      .get(`/api/logs/${monitor._id}`)
      .then((r) => setLogs(r.data.slice(0, 24)))
      .catch(() => { });
  }, [monitor._id, monitor.lastChecked]);

  const lastChecked = monitor.lastChecked
    ? new Date(monitor.lastChecked).toLocaleTimeString()
    : 'Never';

  const avgResponseTime = logs.length
    ? Math.round(logs.filter((l) => l.responseTime).reduce((a, b) => a + b.responseTime, 0) / logs.length)
    : null;

  return (
    <div
      className={`border rounded-xl px-5 py-4 transition-opacity ${monitor.active
          ? 'border-gray-800 bg-gray-900'
          : 'border-gray-800 bg-gray-900 opacity-40'
        }`}
    >
      <div className="flex items-center gap-4">
        {/* Status + name */}
        <StatusDot status={monitor.currentStatus} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-md truncate">{monitor.name}</p>
          <p className="text-xs text-gray-500 truncate">{monitor.url}</p>
          <span className="text-xs text-gray-600 font-mono">every {monitor.interval}m</span>
        </div>

        {/* Stats — hidden on small screens */}
        <div className="hidden sm:flex items-center gap-6 text-right">
          <div>
            <p className="text-xs text-gray-600">Uptime 24h</p>
            <p className="text-sm font-mono text-gray-300">
              {uptime !== null ? `${uptime}%` : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Avg response</p>
            <p className="text-sm font-mono text-gray-300">
              {avgResponseTime !== null ? `${avgResponseTime}ms` : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Last check</p>
            <p className="text-sm font-mono text-gray-300">{lastChecked}</p>
          </div>
        </div>

        {/* Sparkline — last 24 checks */}
        <div className="hidden sm:flex items-end gap-px h-7">
          {logs.length === 0 &&
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-1.5 h-2 rounded-sm bg-gray-800" />
            ))}
          {logs.map((log, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-sm transition-all ${log.status === 'up' ? 'bg-green-500' : 'bg-red-500'
                }`}
              style={{
                height: log.status === 'up'
                  ? `${Math.min(100, Math.max(30, 100 - (log.responseTime / 20)))}%`
                  : '30%',
              }}
              title={`${log.status} — ${log.responseTime ?? '?'}ms`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onToggle(monitor._id)}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white transition"
          >
            {monitor.active ? 'Pause' : 'Resume'}
          </button>
          <button
            onClick={() => onDelete(monitor._id)}
            className="text-xs px-3 py-1.5 rounded-lg border border-transparent hover:border-red-900 text-gray-600 hover:text-red-400 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
