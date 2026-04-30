import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../api";

function StatusDot({ status }) {
  const styles = {
    up: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]",
    down: "bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.9)]",
    pending: "bg-yellow-400",
  };

  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${styles[status] || "bg-zinc-600"}`}
    />
  );
}

export default function MonitorCard({ monitor, onDelete, onToggle }) {
  const [uptime, setUptime] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get(`/api/logs/${monitor._id}/uptime`)
      .then((r) => setUptime(r.data.uptime))
      .catch(() => {});

    api.get(`/api/logs/${monitor._id}`)
      .then((r) => setLogs(r.data.slice(0, 24)))
      .catch(() => {});
  }, [monitor._id, monitor.lastChecked]);

  const lastChecked = monitor.lastChecked
    ? new Date(monitor.lastChecked).toLocaleTimeString()
    : "—";

  const avgResponseTime = logs.length
    ? Math.round(
        logs
          .filter((l) => l.responseTime)
          .reduce((a, b) => a + b.responseTime, 0) / logs.length
      )
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-5 transition ${
        monitor.active ? "" : "opacity-50"
      }`}
    >
      <div className="flex items-center gap-4">

        {/* STATUS + INFO */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <StatusDot status={monitor.currentStatus} />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white truncate">
                {monitor.name}
              </p>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-zinc-400 border border-white/10">
                {monitor.interval}m
              </span>
            </div>

            <p className="text-xs text-zinc-500 truncate mt-1">
              {monitor.url}
            </p>
          </div>
        </div>

        {/* METRICS */}
        <div className="hidden sm:flex items-center gap-8 text-right">
          <Metric label="Uptime" value={uptime !== null ? `${uptime}%` : "—"} />
          <Metric
            label="Latency"
            value={avgResponseTime !== null ? `${avgResponseTime}ms` : "—"}
          />
          <Metric label="Last" value={lastChecked} />
        </div>

        {/* SPARKLINE */}
        <div className="hidden sm:flex items-end gap-[2px] h-8">
          {logs.length === 0
            ? Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[3px] h-2 rounded-sm bg-white/10"
                />
              ))
            : logs.map((log, i) => (
                <div
                  key={i}
                  className={`w-[3px] rounded-sm ${
                    log.status === "up"
                      ? "bg-emerald-400"
                      : "bg-red-500"
                  }`}
                  style={{
                    height:
                      log.status === "up"
                        ? `${Math.min(
                            100,
                            Math.max(25, 100 - log.responseTime / 20)
                          )}%`
                        : "25%",
                  }}
                  title={`${log.status} — ${log.responseTime ?? "?"}ms`}
                />
              ))}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onToggle(monitor._id)}
            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition"
          >
            {monitor.active ? "Pause" : "Resume"}
          </button>

          <button
            onClick={() => onDelete(monitor._id)}
            className="text-xs px-3 py-1.5 rounded-lg text-zinc-500 hover:text-red-400 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* --- Subcomponents --- */

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-zinc-500">{label}</p>
      <p className="text-sm font-mono text-white mt-0.5">
        {value}
      </p>
    </div>
  );
}