import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { login } = useAuth();

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            {/* Header — same as App */}
            <header className="border-b border-gray-800 px-6 py-4 flex items-center">
                <div className="flex items-center gap-3">
                    {/* Logo mark */}
                    <div
                        className="w-12 h-12 rounded-xl bg-cover bg-center"
                        style={{ backgroundImage: "url('/pingwatch.png')" }}
                    >
                    </div>
                    <h1 className="text-lg font-semibold tracking-tight">PingWatch</h1>
                </div>
            </header>

            {/* Center content */}
            <div className="flex-1 flex items-center justify-center px-6">
                <div className="w-full max-w-sm">
                    <div className="border border-gray-800 rounded-xl p-8 bg-gray-900 flex flex-col items-center gap-6">
                        {/* Logo mark */}
                        <div
                            className="w-12 h-12 rounded-xl bg-cover bg-center"
                            style={{ backgroundImage: "url('/pingwatch.png')" }}
                        >
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-semibold tracking-tight mb-1">
                                Sign in to PingWatch
                            </h2>
                            <p className="text-sm text-gray-500">
                                Monitor your URLs. Get alerted when they go down.
                            </p>
                        </div>

                        <button
                            onClick={login}
                            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 text-sm font-medium px-5 py-2.5 rounded-lg transition"
                        >
                            {/* Google SVG icon */}
                            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                                <path
                                    d="M47.532 24.552c0-1.636-.147-3.2-.397-4.727H24.48v9.01h12.993c-.567 2.98-2.24 5.5-4.77 7.2l7.703 5.985c4.497-4.147 7.126-10.248 7.126-17.468z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M24.48 48c6.49 0 11.938-2.147 15.916-5.826l-7.702-5.985c-2.147 1.44-4.896 2.294-8.214 2.294-6.31 0-11.655-4.258-13.566-9.985L2.9 34.56C6.865 42.426 15.07 48 24.48 48z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M10.914 28.498A14.86 14.86 0 0 1 10.08 24c0-1.564.274-3.082.834-4.498L4.797 13.44A23.93 23.93 0 0 0 .48 24c0 3.863.927 7.52 2.57 10.56l7.864-6.062z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M24.48 9.517c3.555 0 6.74 1.222 9.252 3.62l6.942-6.942C36.4 2.388 30.952 0 24.48 0 15.07 0 6.865 5.574 2.9 13.44l7.617 6.062c1.91-5.727 7.256-9.985 13.963-9.985z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </button>

                        <p className="text-xs text-gray-600 text-center">
                            Free plan · up to 5 monitors
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}