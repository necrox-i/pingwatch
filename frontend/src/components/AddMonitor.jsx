import { useState } from "react";
import { motion } from "framer-motion";

const MONITOR_LIMIT = 10;

export default function AddMonitor({ onAdd, monitorCount = 0 }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [interval, setInterval] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const atLimit = monitorCount >= MONITOR_LIMIT;
  const progress = (monitorCount / MONITOR_LIMIT) * 100;

  const progressColor =
    monitorCount >= MONITOR_LIMIT
      ? "bg-red-500"
      : monitorCount >= 7
      ? "bg-yellow-400"
      : "bg-emerald-400";

  const handleSubmit = async () => {
    if (loading || atLimit) return;

    if (!name.trim() || !url.trim()) {
      setError("Both name and URL are required.");
      return;
    }

    if (!/^https?:\/\//i.test(url)) {
      setError("URL must start with http:// or https://");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onAdd({ name: name.trim(), url: url.trim(), interval });
      setName("");
      setUrl("");
      setInterval(5);
    } catch (err) {
      const msg = err?.response?.data?.error;
      setError(msg || "Failed to add monitor.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.06] focus:ring-1 focus:ring-indigo-500/30 transition disabled:opacity-40 appearance-none";

  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] sm:p-6">

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-white">Add Monitor</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Track uptime and receive alerts
            </p>
          </div>

          {/* Slot counter pill */}
          <span
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-mono font-medium border ${
              atLimit
                ? "border-red-500/40 bg-red-500/10 text-red-400"
                : monitorCount >= 7
                ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-400"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                atLimit
                  ? "bg-red-400 animate-pulse"
                  : monitorCount >= 7
                  ? "bg-yellow-400"
                  : "bg-emerald-400"
              }`}
            />
            {monitorCount} / {MONITOR_LIMIT} monitors
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${progressColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* LIMIT STATE */}
      {atLimit ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-red-400/60 bg-red-500/20 flex items-center justify-center text-[10px] text-red-400 font-bold">!</span>
          <p className="text-sm text-red-300">
            Free plan limit reached. Remove a monitor to add a new one.
          </p>
        </div>
      ) : (
        <>
          {/* FORM */}
          <div className="grid gap-3 sm:grid-cols-2">

            {/* Name */}
            <div className="relative">
              <label className="mb-1.5 block text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Name
              </label>
              <input
                type="text"
                placeholder="e.g. API Server"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputBase}
              />
            </div>

            {/* URL */}
            <div className="relative">
              <label className="mb-1.5 block text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                URL
              </label>
              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className={inputBase}
              />
            </div>

            {/* Interval */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Check Interval
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 5, 10, 30].map((val) => (
                  <button
                    key={val}
                    onClick={() => setInterval(val)}
                    className={`rounded-xl border py-2.5 text-xs font-medium transition ${
                      interval === val
                        ? "border-indigo-500/60 bg-indigo-500/20 text-indigo-300"
                        : "border-white/10 bg-white/[0.04] text-zinc-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {val}m
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileTap={!loading ? { scale: 0.97 } : {}}
              onClick={handleSubmit}
              disabled={loading}
              className="sm:col-span-2 w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-4 py-2.5 transition disabled:opacity-50 shadow-[0_0_20px_rgba(99,102,241,0.25)]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Adding...
                </span>
              ) : (
                "Add Monitor"
              )}
            </motion.button>
          </div>

          {/* ERROR */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5"
            >
              <span className="mt-0.5 shrink-0 text-red-400 text-xs font-bold">✕</span>
              <p className="text-xs text-red-300">{error}</p>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}