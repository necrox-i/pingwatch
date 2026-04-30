import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../api";

const normalizeStatus = (s) => (s === "accepted" ? "up" : s);

function StatusDot({ status }) {
  const normalized = normalizeStatus(status);
  const styles = {
    up: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]",
    down: "bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.9)]",
    pending: "bg-yellow-400",
  };

  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${styles[normalized] || "bg-zinc-600"}`}
    />
  );
}

export default function MonitorCard({ monitor, onDelete, onToggle }) {
  const [uptime, setUptime] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api
      .get(`/api/logs/${monitor._id}/uptime`)
      .then((r) => setUptime(r.data.uptime))
      .catch(() => {});

    api
      .get(`/api/logs/${monitor._id}`)
      .then((r) =>
        setLogs(
          r.data.slice(0, 24).map((log) => ({
            ...log,
            status: normalizeStatus(log.status),
          }))
        )
      )
      .catch(() => {});
  }, [monitor._id, monitor.lastChecked]);

  const lastChecked = monitor.lastChecked
    ? new Date(monitor.lastChecked).toLocaleTimeString()
    : "—";

  const responseLogs = logs.filter((l) => typeof l.responseTime === "number");
  const avgResponseTime = responseLogs.length
    ? Math.round(
        responseLogs.reduce((sum, log) => sum + log.responseTime, 0) /
          responseLogs.length
      )
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl transition sm:p-5 ${
        monitor.active ? "" : "opacity-50"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* STATUS + INFO */}
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <StatusDot status={monitor.currentStatus} />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {monitor.name}
              </p>
              <span className="shrink-0 rounded-md border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] text-zinc-400">
                {monitor.interval}m
              </span>
            </div>

            <p className="mt-1 truncate text-xs text-zinc-500">
              {monitor.url}
            </p>

            {/* Mobile metrics */}
            <div className="mt-4 grid grid-cols-3 gap-3 sm:hidden">
              <Metric label="Uptime" value={uptime !== null ? `${uptime}%` : "—"} />
              <Metric
                label="Latency"
                value={avgResponseTime !== null ? `${avgResponseTime}ms` : "—"}
              />
              <Metric label="Last" value={lastChecked} />
            </div>
          </div>
        </div>

        {/* DESKTOP METRICS */}
        <div className="hidden items-center gap-8 text-right sm:flex">
          <Metric label="Uptime" value={uptime !== null ? `${uptime}%` : "—"} />
          <Metric
            label="Latency"
            value={avgResponseTime !== null ? `${avgResponseTime}ms` : "—"}
          />
          <Metric label="Last" value={lastChecked} />
        </div>

        {/* SPARKLINE */}
        <div className="hidden h-8 items-end gap-[2px] sm:flex">
          {logs.length === 0
            ? Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-2 w-[3px] rounded-sm bg-white/10" />
              ))
            : logs.map((log, i) => (
                <div
                  key={i}
                  className={`w-[3px] rounded-sm ${
                    log.status === "up" ? "bg-emerald-400" : "bg-red-500"
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
        <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
          <button
            onClick={() => onToggle(monitor._id)}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-white/30 hover:text-white"
          >
            {monitor.active ? "Pause" : "Resume"}
          </button>

          <button
            onClick={() => onDelete(monitor._id)}
            className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 transition hover:text-red-400"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-zinc-500">{label}</p>
      <p className="mt-0.5 truncate font-mono text-sm text-white">{value}</p>
    </div>
  );
}