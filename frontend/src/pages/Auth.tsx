import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Activity, 
  DollarSign, 
  ArrowUpRight,
  Eye,
  EyeOff
} from 'lucide-react';

export const Auth: React.FC = () => {
  const { login, signup, loginWithGoogle, addToast } = useApp();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Left testimonial rotation states
  const quotes = [
    { quote: "Revenue Hub forecasted our net operational profits with 99% accuracy.", author: "Arjun Mehta", role: "Fractional CFO" },
    { quote: "Mapping ledger CSV statements takes less than 10 seconds now.", author: "Priya Nair", role: "Founder, Zenith Hub" },
    { quote: "Our fractional advisors sync with cloud ledgers instantly.", author: "Sam Kelly", role: "Accountant" }
  ];
  const [activeQuoteIdx, setActiveQuoteIdx] = useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveQuoteIdx((prev) => (prev + 1) % quotes.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleGoogleSubmit = async () => {
    try {
      setLoading(true);
      const success = await loginWithGoogle();
      if (success) {
        navigate('/dashboard');
      }
    } catch (e: any) {
      addToast('error', e.message || 'Google SSO failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      addToast('warning', 'Please populate required fields.');
      return;
    }

    if (isSignUp) {
      if (!name.trim()) {
        addToast('warning', 'Please provide your name.');
        return;
      }
      if (password !== confirmPassword) {
        addToast('warning', 'Passwords do not match.');
        return;
      }
      try {
        setLoading(true);
        const success = await signup(email, password, name);
        if (success) {
          addToast('success', 'Account registered successfully!');
          navigate('/dashboard');
        }
      } catch (e: any) {
        addToast('error', e.message || 'Registration failed.');
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        const success = await login(email, password);
        if (success) {
          addToast('success', 'Logged in successfully.');
          navigate('/dashboard');
        }
      } catch (e: any) {
        addToast('error', e.message || 'Credentials invalid.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#020617] text-white font-['Plus_Jakarta_Sans'] select-none overflow-hidden">
      
      {/* LEFT: Cinematic dashboard graphics and auroras */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/20 border-r border-white/5">
        
        {/* Glow auroras */}
        <div className="absolute top-[10%] left-[10%] h-[350px] w-[350px] rounded-full bg-blue-500/10 blur-[85px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[10%] h-[350px] w-[350px] rounded-full bg-purple-500/10 blur-[85px] pointer-events-none" />

        {/* Company Header */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400">
            <BrainCircuit className="text-white" size={20} />
          </div>
          <span className="text-base font-extrabold tracking-tight uppercase">Revenue Hub</span>
        </div>

        {/* Center Zone: Floating Dashboard elements */}
        <div className="relative h-64 flex items-center justify-center">
          
          {/* Revenue Card (Blue) */}
          <motion.div 
            initial={{ opacity: 0, x: -30, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute left-6 top-0 w-44 glass-panel p-4 rounded-[20px] shadow-lg animate-float"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[9px] font-bold uppercase tracking-wider">Revenue</span>
              <DollarSign size={13} className="text-blue-400" />
            </div>
            <h4 className="text-base font-black mt-1">₹4.8M</h4>
            <span className="text-[8px] font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight size={10} /> +12% MoM
            </span>
          </motion.div>

          {/* Profit Card (Purple) */}
          <motion.div 
            initial={{ opacity: 0, x: 40, y: -40 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute right-6 top-8 w-44 glass-panel p-4 rounded-[20px] shadow-lg border border-white/10"
            style={{ animationDelay: '1.5s' }}
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[9px] font-bold uppercase tracking-wider">Net Profit</span>
              <Activity size={13} className="text-purple-400" />
            </div>
            <h4 className="text-base font-black mt-1">₹3.2M</h4>
            <span className="text-[8px] font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight size={10} /> +18.5%
            </span>
          </motion.div>

          {/* Health Score circle (Blue Gradient) */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute bottom-2 w-48 glass-panel p-4 rounded-[20px] shadow-lg flex items-center gap-3.5"
            style={{ animationDelay: '2.5s' }}
          >
            <div className="h-10 w-10 rounded-full border-2 border-double border-cyan-400 flex items-center justify-center bg-cyan-400/5 text-cyan-300 shrink-0">
              <span className="text-xs font-black">94</span>
            </div>
            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-200">Business Health</h5>
              <span className="text-[9px] font-bold text-slate-450 uppercase">Excellent Runway</span>
            </div>
          </motion.div>

        </div>

        {/* Footer Zone Tagline & Testimonial Carousel */}
        <div className="space-y-6 relative z-10">
          <h2 className="text-xl font-extrabold tracking-tight text-white leading-tight">
            Make smarter business decisions with AI.
          </h2>
          
          <div className="h-20 border-l border-white/10 pl-4 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeQuoteIdx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-1.5"
              >
                <p className="text-xs text-slate-350 leading-relaxed italic">
                  "{quotes[activeQuoteIdx].quote}"
                </p>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {quotes[activeQuoteIdx].author} &middot; {quotes[activeQuoteIdx].role}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* RIGHT: Glass authentication card form */}
      <div className="flex items-center justify-center p-6 relative">
        {/* Glow behind container */}
        <div className="absolute top-[25%] right-[25%] h-[200px] w-[200px] bg-cyan-500/5 blur-[55px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel w-full max-w-[420px] rounded-[32px] p-8 border border-white/10 bg-slate-950/20 shadow-2xl relative z-10 flex flex-col gap-6"
        >
          {/* Welcome Header */}
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black tracking-tight text-white">Welcome Back</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {isSignUp ? 'Create your platform account' : 'Access your financial console'}
            </p>
          </div>

          {/* Google SSO button */}
          <button 
            onClick={handleGoogleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl border border-white/8 bg-white/4 p-3 text-xs font-bold uppercase tracking-wider text-slate-200 hover:bg-white/8 hover:text-white transition cursor-pointer"
          >
            {/* Google icon SVG */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 text-slate-500 my-1 text-[10px] font-bold uppercase tracking-wider">
            <div className="h-px bg-white/5 flex-1" />
            <span>or</span>
            <div className="h-px bg-white/5 flex-1" />
          </div>

          {/* Form Tabs selectors */}
          <div className="flex rounded-xl border border-white/5 bg-white/4 p-0.5 font-bold uppercase tracking-wider text-[9px]">
            <button 
              onClick={() => setIsSignUp(false)}
              className={`flex-1 text-center py-2 rounded-lg transition-colors cursor-pointer ${
                !isSignUp ? 'bg-white/10 text-white shadow-md' : 'text-slate-450 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsSignUp(true)}
              className={`flex-1 text-center py-2 rounded-lg transition-colors cursor-pointer ${
                isSignUp ? 'bg-white/10 text-white shadow-md' : 'text-slate-450 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Fields Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            {/* Name Field (Sign Up only) */}
            {isSignUp && (
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 pl-0.5">Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="peer w-full h-[52px] pl-12 pr-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/8 focus:border-blue-500/50 text-xs font-semibold text-slate-200 placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 ease-out"
                    disabled={loading}
                  />
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none peer-focus:text-blue-500 transition-colors duration-300" />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 pl-0.5">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="peer w-full h-[52px] pl-12 pr-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/8 focus:border-blue-500/50 text-xs font-semibold text-slate-200 placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 ease-out"
                  required
                  disabled={loading}
                />
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none peer-focus:text-blue-500 transition-colors duration-300" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-center pr-0.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450">Password</label>
                {!isSignUp && (
                  <button 
                    type="button" 
                    onClick={() => addToast('info', 'Password reset instructions dispatched to account emails.')}
                    className="text-[9px] font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 transition cursor-pointer"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="peer w-full h-[52px] pl-12 pr-12 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/8 focus:border-blue-500/50 text-xs font-semibold text-slate-200 placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 ease-out"
                  required
                  disabled={loading}
                />
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none peer-focus:text-blue-500 transition-colors duration-300" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-550 hover:text-slate-200 transition-colors cursor-pointer flex items-center justify-center"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Sign Up only) */}
            {isSignUp && (
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 pl-0.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="peer w-full h-[52px] pl-12 pr-12 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/8 focus:border-blue-500/50 text-xs font-semibold text-slate-200 placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 ease-out"
                    required
                    disabled={loading}
                  />
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none peer-focus:text-blue-500 transition-colors duration-300" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-550 hover:text-slate-200 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me */}
            {!isSignUp && (
              <label className="flex items-center gap-2 pl-0.5 cursor-pointer text-xs font-bold text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-blue-500 bg-slate-900 border-white/10"
                />
                Remember Me
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="premium-button w-full py-3.5 text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 mt-3"
            >
              Continue
              <ArrowRight size={14} />
            </button>

          </form>

          {/* Form Footer */}
          <div className="text-center text-xs font-bold uppercase tracking-wider text-slate-450 border-t border-white/5 pt-4 mt-2">
            {!isSignUp ? (
              <span>
                Don't have an account?{' '}
                <button onClick={() => setIsSignUp(true)} className="text-blue-400 hover:text-blue-300 transition cursor-pointer">
                  Create Account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button onClick={() => setIsSignUp(false)} className="text-blue-400 hover:text-blue-300 transition cursor-pointer">
                  Sign In
                </button>
              </span>
            )}
          </div>

        </motion.div>
      </div>

    </div>
  );
};

export default Auth;
