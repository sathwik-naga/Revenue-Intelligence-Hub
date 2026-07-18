import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { BrainCircuit, Mail, Lock, ShieldCheck, RefreshCw, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const success = await login(email, password);
      if (success) navigate('/dashboard');
    } catch {
      setError('Invalid credentials or Firebase network timeout.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const success = await login('admin@revenuehub.com', 'admin123');
      if (success) navigate('/dashboard');
    } catch {
      setError('Failed to load demo workspace.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.16),_transparent_28%),linear-gradient(135deg,_#030712_0%,_#0b1220_100%)] p-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:70px_70px] opacity-40" />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel flex flex-col justify-between rounded-[32px] p-8 sm:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
              <Sparkles size={14} />
              Revenue Glass Enterprise
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
              Command your revenue operations with calm precision.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-400">
              A premium operating system for finance teams that blends AI insight, cash visibility, and elegant execution.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              ['Live AI co-pilot', 'Instant analysis and forecasts'],
              ['Zero-friction import', 'CSV-ledger onboarding in minutes']
            ].map(([title, body]) => (
              <div key={title} className="rounded-[22px] border border-white/10 bg-white/8 p-4">
                <p className="text-sm font-semibold text-slate-100">{title}</p>
                <p className="mt-1 text-sm text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.45 }} className="glass-panel rounded-[32px] p-6 sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-blue-500 via-cyan-400 to-violet-500 shadow-[0_12px_40px_rgba(59,130,246,0.25)]">
              <BrainCircuit className="text-white" size={24} />
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-50">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-400">Sign in to your Revenue workspace.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-[18px] border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Business email</label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="premium-input pl-10" disabled={loading} />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Password</label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="premium-input pl-10" disabled={loading} />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-400">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="rounded border-white/10 bg-white/10 text-cyan-400" />
                Remember device
              </label>
              <a href="#forgot" className="text-cyan-300 transition hover:text-cyan-200">Forgot details?</a>
            </div>

            <button type="submit" className="premium-button w-full" disabled={loading}>
              {loading ? <><RefreshCw size={16} className="animate-spin" />Authenticating...</> : 'Sign in'}
            </button>

            <div className="flex items-center gap-3 py-2">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Or continue with</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <button type="button" onClick={handleDemoLogin} className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-white/8 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/12" disabled={loading}>
              <ShieldCheck size={16} className="text-emerald-300" />
              Access demo workspace
            </button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
