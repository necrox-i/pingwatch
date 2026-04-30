import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const LIMIT = 10;

export default function ProfilePage({ onClose }) {
  const { user, logout } = useAuth();
  const [monitorCount, setMonitorCount] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get('/api/monitors')
      .then((r) => setMonitorCount(r.data.length))
      .catch(() => {});
  }, []);

  const usedPct = monitorCount !== null ? (monitorCount / LIMIT) * 100 : 0;
  const barColor = usedPct >= 100 ? '#ef4444' : usedPct >= 60 ? '#f59e0b' : '#22c55e';

  // ✅ Fixed: matches backend route /auth/delete
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/auth/delete');
      localStorage.removeItem('token');
      window.location.href = '/';
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    // ✅ Fixed: full-screen overlay, panel slides in from top-right
    <div className="fixed inset-0 z-50 flex items-start justify-end p-3 sm:p-4 pt-14 sm:pt-16">
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .panel-anim { animation: slideIn 0.2s ease both; }
      `}</style>

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* ✅ Fixed: dark theme + responsive width */}
      <div className="panel-anim relative w-full max-w-[300px] rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl overflow-hidden">

        {/* Avatar + name + close */}
        <div className="px-4 sm:px-5 pt-5 pb-4 flex items-center gap-3 border-b border-gray-800">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full ring-2 ring-gray-700 flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-green-900 flex items-center justify-center text-green-400 font-bold text-sm flex-shrink-0">
              {user?.name?.[0] ?? '?'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[12px] text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-800 text-gray-600 hover:text-gray-300 transition flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Monitor usage */}
        <div className="px-4 sm:px-5 py-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-medium text-gray-500">Monitor usage</p>
            <p className="font-mono text-[11px] font-semibold" style={{ color: barColor }}>
              {monitorCount !== null ? `${monitorCount} / ${LIMIT}` : `— / ${LIMIT}`}
            </p>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(usedPct, 100)}%`, background: barColor }}
            />
          </div>
          {monitorCount >= LIMIT && (
            <p className="text-[11px] text-red-400 mt-1.5 font-medium">
              Limit reached. Delete a monitor to add more.
            </p>
          )}
        </div>

        {/* Plan */}
        <div className="px-4 sm:px-5 py-3 border-b border-gray-800 flex items-center justify-between">
          <p className="text-[12px] text-gray-500">Plan</p>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-950 text-green-400 border border-green-900">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Free
          </span>
        </div>

        {/* Member since */}
        <div className="px-4 sm:px-5 py-3 border-b border-gray-800 flex items-center justify-between">
          <p className="text-[12px] text-gray-500">Member since</p>
          <p className="font-mono text-[11px] text-gray-400 font-medium">
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
              : '—'}
          </p>
        </div>

        {/* Sign out — unchanged */}
        <div className="px-4 sm:px-5 py-3 border-b border-gray-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 text-[13px] text-gray-400 hover:text-white hover:bg-gray-800 py-2 px-2 rounded-lg transition text-left"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Sign out
          </button>
        </div>

        {/* Delete account */}
        <div className="px-4 sm:px-5 py-3">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center gap-2.5 text-[13px] text-gray-600 hover:text-red-400 hover:bg-red-950/30 py-2 px-2 rounded-lg transition text-left"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              Delete account
            </button>
          ) : (
            <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-3">
              <div className="flex items-start gap-2 mb-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                </svg>
                <div>
                  <p className="text-[12px] font-semibold text-red-400 mb-0.5">Delete your account?</p>
                  <p className="text-[11px] text-red-500/80 leading-relaxed">
                    Permanently deletes your account, all monitors, and all uptime history. Cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="flex-1 text-[12px] font-medium py-1.5 rounded-lg border border-gray-700 bg-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 text-[12px] font-semibold py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {deleting ? (
                    <>
                      <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      Deleting...
                    </>
                  ) : 'Yes, delete'}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}