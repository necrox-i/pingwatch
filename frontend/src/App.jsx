import { useState, useEffect, useCallback } from 'react';
import api from './api';
import { useAuth } from './context/AuthContext';
import MonitorCard from './components/MonitorCard';
import AddMonitor from './components/AddMonitor';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const fetchMonitors = useCallback(async () => {
    try {
      const res = await axios.get('/api/monitors', { withCredentials: true });
      setMonitors(res.data);
      setError(null);
    } catch {
      setError('Cannot reach backend. Is it running on port 5000?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchMonitors();
    const interval = setInterval(fetchMonitors, 30000);
    return () => clearInterval(interval);
  }, [fetchMonitors, user]);

  const handleAdd = async ({ name, url, interval }) => {
    await axios.post('/api/monitors', { name, url, interval }, { withCredentials: true });
    fetchMonitors();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/monitors/${id}`, { withCredentials: true });
    setMonitors((prev) => prev.filter((m) => m._id !== id));
  };

  const handleToggle = async (id) => {
    await axios.patch(`/api/monitors/${id}/toggle`, {}, { withCredentials: true });
    fetchMonitors();
  };

  // Auth loading splash
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div
          className="w-12 h-12 rounded-xl bg-cover bg-center"
          style={{ backgroundImage: "url('/pingwatch.png')" }}
        >
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) return <LoginPage />;

  const upCount = monitors.filter((m) => m.currentStatus === 'up').length;
  const downCount = monitors.filter((m) => m.currentStatus === 'down').length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div
            className="w-12 h-12 rounded-xl bg-cover bg-center"
            style={{ backgroundImage: "url('/pingwatch.png')" }}
          >
          </div>
          <h1 className="text-lg font-semibold tracking-tight">PingWatch</h1>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-5 text-sm">
            <span className="text-green-400 font-mono">{upCount} up</span>
            <span className="text-red-400 font-mono">{downCount} down</span>
            <span className="text-gray-600 font-mono">{monitors.length} total</span>
          </div>

          {/* Avatar button */}
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full ring-2 ring-gray-700"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold">
                {user.name?.[0] ?? '?'}
              </div>
            )}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <AddMonitor onAdd={handleAdd} monitorCount={monitors.length} />

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

      {/* Profile panel */}
      {profileOpen && <ProfilePage onClose={() => setProfileOpen(false)} />}
    </div>
  );
}