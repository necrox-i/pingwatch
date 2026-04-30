import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MONITOR_LIMIT = 10;
const INTERVALS = [1, 5, 10, 30];

export default function AddMonitor({ onAdd, monitorCount = 0 }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [interval, setInterval] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [urlFocused, setUrlFocused] = useState(false);

  const atLimit = monitorCount >= MONITOR_LIMIT;
  const progress = Math.min((monitorCount / MONITOR_LIMIT) * 100, 100);

  const isValidUrl = /^https?:\/\/.+/i.test(url);
  const urlState = !url ? "empty" : isValidUrl ? "valid" : "invalid";

  const progressColor =
    monitorCount >= MONITOR_LIMIT ? "bg-red-500" :
    monitorCount >= 7 ? "bg-yellow-400" : "bg-emerald-400";

  const slotStyle =
    atLimit ? "border-red-500/40 bg-red-500/10 text-red-400" :
    monitorCount >= 7 ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-400" :
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";

  const handleSubmit = async () => {
    if (loading || atLimit) return;
    if (!name.trim()) { setError("Monitor name is required."); return; }
    if (!url.trim()) { setError("URL is required."); return; }
    if (!isValidUrl) { setError("URL must start with http:// or https://"); return; }

    setLoading(true);
    setError(null);
    try {
      await onAdd({ name: name.trim(), url: url.trim(), interval });
      setSuccess(true);
      setName(""); setUrl(""); setInterval(5);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to add monitor.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase = `
    w-full rounded-xl bg-white/[0.04] border px-3 py-2.5 text-sm text-white
    placeholder-zinc-600 focus:outline-none focus:ring-1 transition
    disabled:opacity-40 appearance-none
  `;

  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] sm:p-6">

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Add Monitor</h3>
            <p className="mt-0.5 text-xs text-zinc-500">Track uptime across your services</p>
          </div>

          {/* Slot counter */}
          <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-mono font-medium border ${slotStyle}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${atLimit ? "bg-red-400 animate-pulse" : monitorCount >= 7 ? "bg-yellow-400" : "bg-emerald-400"}`} />
            {monitorCount}/{MONITOR_LIMIT}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-[3px] w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${progressColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Limit state */}
      <AnimatePresence>
        {atLimit && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
          >
            <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-red-400/60 bg-red-500/20 flex items-center justify-center text-[10px] text-red-400 font-bold">!</span>
            <p className="text-sm text-red-300">Free plan limit reached. Remove a monitor to add a new one.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      {!atLimit && (
        <div className="grid gap-3 sm:grid-cols-2">

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Name</label>
            <input
              type="text"
              placeholder="e.g. API Server"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null); }}
              disabled={loading}
              className={`${inputBase} border-white/10 focus:border-indigo-500/60 focus:bg-white/[0.06] focus:ring-indigo-500/20`}
            />
          </div>

          {/* URL with validation indicator */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">URL</label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://example.com/health"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(null); }}
                onFocus={() => setUrlFocused(true)}
                onBlur={() => setUrlFocused(false)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                disabled={loading}
                className={`${inputBase} pr-8 transition-all ${
                  urlState === "valid"
                    ? "border-emerald-500/50 focus:border-emerald-500/70 focus:ring-emerald-500/20"
                    : urlState === "invalid" && !urlFocused
                    ? "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20"
                    : "border-white/10 focus:border-indigo-500/60 focus:ring-indigo-500/20"
                }`}
              />
              {/* Validation icon */}
              <AnimatePresence>
                {url && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {isValidUrl
                      ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                      : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    }
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Interval selector */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Check Interval</label>
            <div className="grid grid-cols-4 gap-2">
              {INTERVALS.map((val) => (
                <motion.button
                  key={val}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setInterval(val)}
                  className={`relative rounded-xl border py-2.5 text-xs font-semibold transition-all duration-200 ${
                    interval === val
                      ? "border-indigo-500/60 bg-indigo-500/20 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.15)]"
                      : "border-white/10 bg-white/[0.03] text-zinc-500 hover:border-white/20 hover:text-zinc-300"
                  }`}
                >
                  {interval === val && (
                    <motion.span
                      layoutId="interval-pill"
                      className="absolute inset-0 rounded-xl bg-indigo-500/10"
                      transition={{ type: "spring", duration: 0.3 }}
                    />
                  )}
                  <span className="relative">{val}m</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <motion.button
            whileTap={!loading && !success ? { scale: 0.98 } : {}}
            onClick={handleSubmit}
            disabled={loading}
            className={`sm:col-span-2 w-full rounded-xl font-semibold text-sm px-4 py-2.5 transition-all duration-200 flex items-center justify-center gap-2
              ${success
                ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.15)]"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_24px_rgba(99,102,241,0.3)] hover:shadow-[0_0_32px_rgba(99,102,241,0.4)]"
              } disabled:opacity-50`}
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Adding...
              </>
            ) : success ? (
              <>
                <motion.svg
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="#34d399" strokeWidth="2.5" strokeLinecap="round"
                >
                  <path d="M20 6L9 17l-5-5"/>
                </motion.svg>
                Monitor added!
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                Start Monitoring
              </>
            )}
          </motion.button>
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5"
          >
            <span className="mt-0.5 shrink-0 text-red-400 text-xs font-bold">✕</span>
            <p className="text-xs text-red-300">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}