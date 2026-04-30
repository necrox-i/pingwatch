import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await login();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#03040a] text-white">
      <StyleBlock />

      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.20),transparent_35%),radial-gradient(ellipse_at_bottom_right,rgba(14,165,233,0.16),transparent_28%),linear-gradient(to_bottom,#03040a_0%,#050816_45%,#020308_100%)]" />
      <div className="absolute inset-0 opacity-35 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="absolute inset-0 bg-stars opacity-50" />

      <div className="absolute -top-28 -left-28 h-[34rem] w-[34rem] rounded-full bg-violet-600/20 blur-[140px]" />
      <div className="absolute top-1/3 -right-32 h-[30rem] w-[30rem] rounded-full bg-cyan-500/18 blur-[140px]" />
      <div className="absolute -bottom-36 left-1/3 h-[26rem] w-[26rem] rounded-full bg-indigo-500/12 blur-[160px]" />

      {/* Main Layout */}
      <div className="relative z-10 grid min-h-dvh lg:grid-cols-2">
        {/* Brand Side */}
        <section className="hidden items-center justify-center px-10 lg:flex">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-300 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.85)]" />
              Free Live Uptime Intelligence For Modern Teams
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] shadow-[0_0_30px_rgba(255,255,255,0.08)] backdrop-blur-xl">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 12h4l2-6 4 12 2-6h4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <h1 className="text-4xl font-semibold tracking-tight">PingWatch</h1>
                <p className="mt-2 text-sm text-zinc-400">
                  Monitor uptime. Detect incidents. Respond fast.
                </p>
              </div>
            </div>

            <p className="mt-8 max-w-lg text-base leading-7 text-zinc-300">
              A clean monitoring platform for service health, status visibility,
              and instant alerting across your infrastructure.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["10m checks", "Fast verification cycles"],
                ["Global nodes", "Distributed monitoring"],
                ["Instant alerts by sparkline", "Immediate awareness"],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md"
                >
                  <div className="text-sm font-medium text-white">{title}</div>
                  <div className="mt-2 text-xs leading-5 text-zinc-400">{desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Login Side */}
        <section className="flex items-center justify-center px-4 py-6 sm:px-10 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-10">
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] shadow-[0_0_24px_rgba(255,255,255,0.08)]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M4 12h4l2-6 4 12 2-6h4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <h2 className="text-3xl font-semibold tracking-tight">
                  Welcome back
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Sign in to access your monitoring dashboard and incident alerts.
                </p>
              </div>

              <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Platform status</span>
                  <span className="flex items-center gap-2 text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Operational
                  </span>
                </div>
                <div className="mt-3 text-sm text-zinc-200">
                  Secure sign-in with Google authentication.
                </div>
              </div>

              <motion.button
                whileHover={loading ? undefined : { y: -1 }}
                whileTap={loading ? undefined : { scale: 0.985 }}
                onClick={handleLogin}
                disabled={loading}
                aria-busy={loading}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-3.5 font-medium text-zinc-950 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    Continue with Google
                  </>
                )}
              </motion.button>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  ["10", "Monitors"],
                  ["Instant", "Alerts"],
                  ["24/7", "Coverage"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-center"
                  >
                    <div className="text-sm font-semibold text-white">{value}</div>
                    <div className="mt-1 text-[11px] text-zinc-500">{label}</div>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-center text-xs leading-5 text-zinc-500">
                Access is limited to authorized accounts.
                <br />
                Built for reliability, clarity, and speed.
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-zinc-600">
              © {new Date().getFullYear()} PingWatch
            </p>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24.5v9h13c-.6 3-2.2 5.5-4.8 7.2l7.7 6c4.5-4.2 7.1-10.3 7.1-17.5z" />
      <path fill="#34A853" d="M24.5 48c6.5 0 12-2.1 16-5.8l-7.7-6c-2.2 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.3-13.5-10l-8 6.1C6.9 42.4 15.1 48 24.5 48z" />
      <path fill="#FBBC05" d="M11 28.5c-.5-1.4-.8-2.9-.8-4.5s.3-3.1.8-4.5l-8-6.1C1 16.5 0 20.2 0 24s1 7.5 3 10.6l8-6.1z" />
      <path fill="#EA4335" d="M24.5 9.5c3.6 0 6.8 1.2 9.3 3.6l7-7C36.4 2.4 31 0 24.5 0 15.1 0 6.9 5.6 3 13.4l8 6.1c1.9-5.7 7.2-10 13.5-10z" />
    </svg>
  );
}

function StyleBlock() {
  return (
    <style>{`
      @keyframes drift {
        0% { transform: translate3d(0, 0, 0); }
        50% { transform: translate3d(0, -12px, 0); }
        100% { transform: translate3d(0, 0, 0); }
      }

      .bg-stars {
        background-image:
          radial-gradient(circle at 10% 20%, rgba(255,255,255,0.9) 0 1px, transparent 1.5px),
          radial-gradient(circle at 20% 30%, rgba(255,255,255,0.6) 0 1px, transparent 1.5px),
          radial-gradient(circle at 35% 15%, rgba(255,255,255,0.8) 0 1px, transparent 1.5px),
          radial-gradient(circle at 45% 55%, rgba(255,255,255,0.5) 0 1px, transparent 1.5px),
          radial-gradient(circle at 60% 25%, rgba(255,255,255,0.75) 0 1px, transparent 1.5px),
          radial-gradient(circle at 70% 65%, rgba(255,255,255,0.55) 0 1px, transparent 1.5px),
          radial-gradient(circle at 82% 18%, rgba(255,255,255,0.75) 0 1px, transparent 1.5px),
          radial-gradient(circle at 92% 42%, rgba(255,255,255,0.65) 0 1px, transparent 1.5px),
          radial-gradient(circle at 15% 78%, rgba(255,255,255,0.5) 0 1px, transparent 1.5px),
          radial-gradient(circle at 55% 82%, rgba(255,255,255,0.7) 0 1px, transparent 1.5px);
        background-size: 420px 420px;
        animation: drift 18s ease-in-out infinite;
      }
    `}</style>
  );
}