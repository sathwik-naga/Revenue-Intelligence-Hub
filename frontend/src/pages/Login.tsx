import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { BrainCircuit, Mail, Lock, ShieldCheck, RefreshCw } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Perform mock validations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
try {
  const success = await login(email,password);

  if (success) {
    navigate('/');
  }
} catch (err) {
  setError('Invalid credentials or Firebase network timeout.');
} finally {
  setLoading(false);
}
  };

 const handleDemoLogin = async () => {
  setLoading(true);

  try {
    const success = await login(
      "admin@revenuehub.com",
      "admin123"
    );

    if (success) {
      navigate("/");
    }
  } catch (err) {
    setError("Failed to load demo workspace.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-600/5 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[100px] dark:bg-emerald-600/5" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 bg-blue-600 rounded-2xl items-center justify-center shadow-lg shadow-blue-500/20 mb-3.5">
            <BrainCircuit className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Revenue Intelligence Hub
          </h2>
          <p className="text-sm font-semibold text-slate-400 mt-1 dark:text-slate-500">
            AI Financial Co-Pilot for Growing SMEs
          </p>
        </div>

        {/* Glassmorphic Auth card */}
        <div className="border border-slate-200/80 dark:border-slate-800 bg-white/75 dark:bg-slate-900/50 backdrop-blur-lg rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl text-rose-600 dark:text-rose-450 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Business Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-500 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-200 text-blue-600 focus:ring-blue-500"
                />
                Remember this device
              </label>
              <a
                href="#forgot"
                className="font-bold text-blue-600 dark:text-blue-450 hover:underline"
              >
                Forgot details?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Or Continue With
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-2"
              disabled={loading}
            >
              <ShieldCheck size={16} className="text-emerald-500" />
              Access Demo Workspace
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          Hackathon Submission: Finance & Business Management Theme.
          <br />
          Built with React 19, TypeScript, and Google Gemini.
        </p>
      </motion.div>
    </div>
  );
};
export default Login;
