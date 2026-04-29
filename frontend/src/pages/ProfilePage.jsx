import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage({ onClose }) {
  const { user, logout } = useAuth();
  const [monitorCount, setMonitorCount] = useState(null);
  const LIMIT = 5;

  useEffect(() => {
    axios
      .get('/api/monitors', { withCredentials: true })
      .then((r) => setMonitorCount(r.data.length))
      .catch(() => {});
  }, []);

  const usedPct = monitorCount !== null ? (monitorCount / LIMIT) * 100 : 0;
  const barColor = usedPct >= 100 ? 'bg-red-500' : usedPct >= 60 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-72 border border-gray-800 rounded-xl bg-gray-900 shadow-2xl overflow-hidden">
        {/* Top section — avatar + name */}
        <div className="px-5 py-5 border-b border-gray-800 flex items-center gap-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full ring-2 ring-gray-700"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-sm font-bold">
              {user?.name?.[0] ?? '?'}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Monitor usage */}
        <div className="px-5 py-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400">Monitors used</p>
            <p className="text-xs font-mono text-gray-300">
              {monitorCount !== null ? `${monitorCount} / ${LIMIT}` : '— / 5'}
            </p>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${Math.min(usedPct, 100)}%` }}
            />
          </div>
          {monitorCount >= LIMIT && (
            <p className="text-xs text-red-400 mt-2">
              Limit reached. Delete a monitor to add more.
            </p>
          )}
        </div>

        {/* Plan badge */}
        <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
          <p className="text-xs text-gray-500">Plan</p>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
            Free
          </span>
        </div>

        {/* Member since */}
        <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
          <p className="text-xs text-gray-500">Member since</p>
          <p className="text-xs font-mono text-gray-400">
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })
              : '—'}
          </p>
        </div>

        {/* Logout */}
        <div className="px-5 py-3">
          <button
            onClick={logout}
            className="w-full text-sm text-red-400 hover:text-red-300 hover:bg-red-950/40 py-1.5 rounded-lg transition text-left px-2"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}