import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import MonitorCard from './components/MonitorCard';
import AddMonitor from './components/AddMonitor';

export default function App() {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMonitors = useCallback(async () => {
    try {
      const res = await axios.get('/api/monitors');
      setMonitors(res.data);
      setError(null);
    } catch {
      setError('Cannot reach backend. Is it running on port 5000?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonitors();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMonitors, 30000);
    return () => clearInterval(interval);
  }, [fetchMonitors]);

  const handleAdd = async ({ name, url, interval }) => {
    await axios.post('/api/monitors', { name, url, interval });
    fetchMonitors();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/monitors/${id}`);
    setMonitors((prev) => prev.filter((m) => m._id !== id));
  };

  const handleToggle = async (id) => {
    await axios.patch(`/api/monitors/${id}/toggle`);
    fetchMonitors();
  };

  const upCount = monitors.filter((m) => m.currentStatus === 'up').length;
  const downCount = monitors.filter((m) => m.currentStatus === 'down').length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-bold text-sm">P</div>
          <h1 className="text-lg font-semibold tracking-tight">PingWatch</h1>
        </div>
        <div className="flex items-center gap-5 text-sm">
          <span className="text-green-400 font-mono">{upCount} up</span>
          <span className="text-red-400 font-mono">{downCount} down</span>
          <span className="text-gray-600 font-mono">{monitors.length} total</span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <AddMonitor onAdd={handleAdd} />

        <div className="mt-8">
          {loading && (
            <p className="text-gray-500 text-center py-16 text-sm">Loading monitors...</p>
          )}
          {error && (
            <p className="text-red-400 text-center py-16 text-sm">{error}</p>
          )}
          {!loading && !error && monitors.length === 0 && (
            <p className="text-gray-600 text-center py-16 text-sm">
              No monitors yet. Add your first URL above.
            </p>
          )}
          <div className="flex flex-col gap-3">
            {monitors.map((monitor) => (
              <MonitorCard
                key={monitor._id}
                monitor={monitor}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
