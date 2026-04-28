import { useState } from 'react';

export default function AddMonitor({ onAdd }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [interval, setInterval] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
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
    } catch {
      setError('Failed to add monitor. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition';

  return (
    <div className="border border-gray-800 rounded-xl p-5 bg-gray-900">
      <p className="text-sm font-medium text-gray-400 mb-3">Add monitor</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Name (e.g. My API)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`flex-1 ${inputClass}`}
        />
        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className={`flex-1 ${inputClass}`}
        />
        <select
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
          className={inputClass}
        >
          <option value={1}>Every 1 min</option>
          <option value={5}>Every 5 min</option>
          <option value={10}>Every 10 min</option>
          <option value={30}>Every 30 min</option>
        </select>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg transition"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}
