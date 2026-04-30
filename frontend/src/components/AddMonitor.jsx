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
      await onAdd({
        name: name.trim(),
        url: url.trim(),
        interval,
      });

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
    "w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition disabled:opacity-40";

  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] sm:p-6">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">Add Monitor</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Track uptime and receive alerts
          </p>
        </div>

        <div
          className={`inline-flex w-fit text-xs font-mono px-2 py-1 rounded-md border ${
            atLimit
              ? "border-red-500/40 text-red-400"
              : "border-white/10 text-zinc-400"
          }`}
        >
          {monitorCount} / {MONITOR_LIMIT}
        </div>
      </div>

      {/* LIMIT STATE */}
      {atLimit ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Free plan limit reached. Remove a monitor to continue.
        </div>
      ) : (
        <>
          {/* FORM */}
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Monitor name (e.g. API Server)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputBase}
            />

            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className={inputBase}
            />

            <select
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              className={inputBase}
            >
              <option value={1}>1 min interval</option>
              <option value={5}>5 min interval</option>
              <option value={10}>10 min interval</option>
              <option value={30}>30 min interval</option>
            </select>

            <motion.button
              whileTap={!loading ? { scale: 0.97 } : {}}
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-xl bg-white text-black font-medium text-sm px-4 py-2.5 transition hover:bg-zinc-200 disabled:opacity-50 sm:col-span-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-transparent" />
                  Adding...
                </span>
              ) : (
                "Add Monitor"
              )}
            </motion.button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
}