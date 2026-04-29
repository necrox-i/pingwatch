import { useState } from 'react';

const MONITOR_LIMIT = 5;

export default function AddMonitor({ onAdd, monitorCount = 0 }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [interval, setInterval] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const atLimit = monitorCount >= MONITOR_LIMIT;

  const handleSubmit = async () => {
    if (atLimit) return;
    if (!name.trim() || !url.trim()) {
      setError('Both name and URL are required.');
      return;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('URL must start with http:// or https://');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onAdd({ name: name.trim(), url: url.trim(), interval });
      setName('');
      setUrl('');
      setInterval(5);
    } catch (err) {
      const msg = err?.response?.data?.error;
      setError(msg || 'Failed to add monitor. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="border border-gray-800 rounded-xl p-5 bg-gray-900">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-400">Add monitor</p>
        <p className={`text-xs font-mono ${atLimit ? 'text-red-400' : 'text-gray-600'}`}>
          {monitorCount} / {MONITOR_LIMIT} used
        </p>
      </div>

      {atLimit ? (
        <div className="flex items-center gap-3 bg-red-950/30 border border-red-900/50 rounded-lg px-4 py-3">
          <span className="text-red-400 text-sm">
            Free plan limit reached. Delete a monitor to add a new one.
          </span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Name (e.g. My API)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={atLimit}
            className={`flex-1 ${inputClass}`}
          />
          <input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            disabled={atLimit}
            className={`flex-1 ${inputClass}`}
          />
          <select
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            disabled={atLimit}
            className={inputClass}
          >
            <option value={1}>Every 1 min</option>
            <option value={5}>Every 5 min</option>
            <option value={10}>Every 10 min</option>
            <option value={30}>Every 30 min</option>
          </select>
          <button
            onClick={handleSubmit}
            disabled={loading || atLimit}
            className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg transition"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      )}

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}