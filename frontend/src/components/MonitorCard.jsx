import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";

const normalizeStatus = (s) => (s === "accepted" ? "up" : s);

function StatusDot({ status }) {
  const normalized = normalizeStatus(status);
  const map = {
    up:      "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
    down:    "bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]",
    pending: "bg-yellow-400",
  };
  return <span className={`inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full ${map[normalized] || "bg-zinc-600"}`} />;
}

function StatusBadge({ status }) {
  const normalized = normalizeStatus(status);
  const map = {
    up:      "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    down:    "border-red-500/30 bg-red-500/10 text-red-400",
    pending: "border-yellow-400/30 bg-yellow-400/10 text-yellow-400",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold font-mono ${map[normalized] || "border-white/10 text-zinc-500"}`}>
      {normalized || "pending"}
    </span>
  );
}

function Metric({ label, value, color }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] text-zinc-500 uppercase tracking-wide font-medium">{label}</p>
      <p className={`mt-0.5 truncate font-mono text-sm font-semibold ${color || "text-white"}`}>{value}</p>
    </div>
  );
}

function UptimeColor(v) {
  if (v === null) return "text-zinc-500";
  if (v >= 99) return "text-emerald-400";
  if (v >= 95) return "text-yellow-400";
  return "text-red-400";
}

function RespColor(ms) {
  if (ms === null) return "text-zinc-500";
  if (ms < 300) return "text-emerald-400";
  if (ms < 800) return "text-yellow-400";
  return "text-red-400";
}

export default function MonitorCard({ monitor, onDelete, onToggle }) {
  const [uptime, setUptime] = useState(null);
  const [logs, setLogs] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => {
    api.get(`/api/logs/${monitor._id}/uptime`)
      .then((r) => setUptime(r.data.uptime)).catch(() => {});
    api.get(`/api/logs/${monitor._id}`)
      .then((r) => setLogs(r.data.slice(0, 30).map((l) => ({ ...l, status: normalizeStatus(l.status) }))))
      .catch(() => {});
  }, [monitor._id, monitor.lastChecked]);

  const responseLogs = logs.filter((l) => typeof l.responseTime === "number");
  const avgMs = responseLogs.length
    ? Math.round(responseLogs.reduce((s, l) => s + l.responseTime, 0) / responseLogs.length)
    : null;

  const lastChecked = monitor.lastChecked
    ? new Date(monitor.lastChecked).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Never";

  const handleToggle = async (e) => {
    e.stopPropagation();
    setToggling(true);
    try { await onToggle(monitor._id); } finally { setToggling(false); }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirmDel) { setConfirmDel(true); return; }
    setDeleting(true);
    try { await onDelete(monitor._id); } catch { setDeleting(false); setConfirmDel(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: deleting ? 0 : 1, y: 0, scale: deleting ? 0.97 : 1 }}
      transition={{ duration: 0.2 }}
      className={`group rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden transition-all duration-200
        hover:border-white/[0.15] hover:bg-white/[0.06] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]
        ${!monitor.active ? "opacity-40" : ""}
      `}
    >
      {/* Main row */}
      <div
        className="flex flex-col gap-4 p-4 cursor-pointer sm:flex-row sm:items-center sm:p-5"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Status dot + info */}
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="mt-0.5 flex-shrink-0">
            <StatusDot status={monitor.currentStatus} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <p className="text-sm font-semibold text-white truncate">{monitor.name}</p>
              <StatusBadge status={monitor.currentStatus} />
              <span className="rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-mono text-zinc-500">
                {monitor.interval}m
              </span>
              {!monitor.active && (
                <span className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-600">paused</span>
              )}
            </div>
            <p className="text-xs text-zinc-500 truncate">{monitor.url}</p>

            {/* Mobile metrics */}
            <div className="mt-3 grid grid-cols-3 gap-3 sm:hidden">
              <Metric label="Uptime" value={uptime !== null ? `${uptime}%` : "—"} color={UptimeColor(uptime)} />
              <Metric label="Avg resp" value={avgMs !== null ? `${avgMs}ms` : "—"} color={RespColor(avgMs)} />
              <Metric label="Last" value={lastChecked} />
            </div>
          </div>
        </div>

        {/* Desktop metrics */}
        <div className="hidden items-center gap-8 text-right sm:flex flex-shrink-0">
          <Metric label="24h uptime" value={uptime !== null ? `${uptime}%` : "—"} color={UptimeColor(uptime)} />
          <Metric label="Avg resp" value={avgMs !== null ? `${avgMs}ms` : "—"} color={RespColor(avgMs)} />
          <Metric label="Last check" value={lastChecked} />
        </div>

        {/* Sparkline */}
        <div
          className="hidden h-8 items-end gap-[2px] sm:flex flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {logs.length === 0
            ? Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="h-2 w-[4px] rounded-sm bg-white/10" />
              ))
            : logs.map((log, i) => (
                <div
                  key={i}
                  className="relative flex h-full items-end"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {hoveredBar === i && (
                    <div className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 z-20
                      whitespace-nowrap rounded-lg border border-white/10 bg-zinc-900 px-2 py-1
                      text-[10px] font-mono text-zinc-300 shadow-xl pointer-events-none">
                      {log.status} · {log.responseTime ?? "?"}ms
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
                        border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent
                        border-t-[4px] border-t-zinc-900" />
                    </div>
                  )}
                  <div
                    className={`w-[4px] rounded-sm transition-all cursor-default
                      ${log.status === "up"
                        ? "bg-emerald-400 hover:bg-emerald-300"
                        : "bg-red-500 hover:bg-red-400"}`}
                    style={{
                      height: log.status === "up"
                        ? `${Math.min(100, Math.max(20, 100 - log.responseTime / 15))}%`
                        : "20%",
                    }}
                  />
                </div>
              ))
          }
        </div>

        {/* Actions */}
        <div
          className="flex items-center gap-2 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleToggle}
            disabled={toggling}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-400
              transition hover:border-white/25 hover:text-white hover:bg-white/[0.06] disabled:opacity-40"
          >
            {toggling ? "..." : monitor.active ? "Pause" : "Resume"}
          </button>

          <AnimatePresence mode="wait">
            {confirmDel ? (
              <motion.button
                key="confirm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={handleDelete}
                disabled={deleting}
                onBlur={() => setConfirmDel(false)}
                className="rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-1.5 text-xs font-semibold
                  text-red-400 transition hover:bg-red-500/25 disabled:opacity-50"
              >
                {deleting ? "..." : "Confirm?"}
              </motion.button>
            ) : (
              <motion.button
                key="delete"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleDelete}
                className="rounded-lg px-3 py-1.5 text-xs text-zinc-600
                  transition hover:text-red-400 hover:bg-red-500/10"
              >
                Delete
              </motion.button>
            )}
          </AnimatePresence>

          {/* Expand chevron */}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-zinc-600 ml-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.07] px-4 py-4 sm:px-5">
              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Status", value: monitor.currentStatus || "pending", color: monitor.currentStatus === "up" ? "text-emerald-400" : monitor.currentStatus === "down" ? "text-red-400" : "text-yellow-400" },
                  { label: "Interval", value: `every ${monitor.interval}m` },
                  { label: "Checks stored", value: `${logs.length}` },
                  { label: "Added", value: new Date(monitor.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide font-medium mb-1">{stat.label}</p>
                    <p className={`text-[13px] font-semibold font-mono ${stat.color || "text-white"}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Full response history */}
              {logs.length > 0 && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wide font-medium mb-2">Response history</p>
                  <div className="flex items-end gap-[2px] h-12 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2">
                    {logs.map((log, i) => (
                      <div key={i} className="relative flex-1 flex items-end h-full group/bar"
                        onMouseEnter={() => setHoveredBar(`exp-${i}`)}
                        onMouseLeave={() => setHoveredBar(null)}>
                        {hoveredBar === `exp-${i}` && (
                          <div className="absolute bottom-[calc(100%+4px)] left-1/2 -translate-x-1/2 z-20
                            whitespace-nowrap rounded border border-white/10 bg-zinc-900 px-2 py-1
                            text-[10px] font-mono text-zinc-300 shadow-xl pointer-events-none">
                            {log.status} · {log.responseTime ?? "?"}ms
                          </div>
                        )}
                        <div
                          className={`w-full rounded-sm transition-opacity group-hover/bar:opacity-80
                            ${log.status === "up" ? "bg-emerald-400" : "bg-red-500"}`}
                          style={{
                            height: log.status === "up"
                              ? `${Math.min(100, Math.max(15, 100 - log.responseTime / 12))}%`
                              : "15%",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}