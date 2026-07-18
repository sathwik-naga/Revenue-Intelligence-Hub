import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  BrainCircuit, 
  ArrowRight, 
  CheckCircle2, 
  LineChart, 
  Activity, 
  Sparkles, 
  FileSpreadsheet, 
  FolderOpen,
  Zap,
  Globe,
  Database
} from 'lucide-react';

const CountUp: React.FC<{ to: number; prefix?: string; suffix?: string; decimals?: number }> = ({ to, prefix = '', suffix = '', decimals = 0 }) => {
  const [val, setVal] = useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = React.useRef(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isInView.current) {
        isInView.current = true;
        let start = 0;
        const duration = 1500;
        const steps = 50;
        const increment = to / steps;
        const stepTime = duration / steps;
        
        const timer = setInterval(() => {
          start += increment;
          if (start >= to) {
            setVal(to);
            clearInterval(timer);
          } else {
            setVal(start);
          }
        }, stepTime);
      }
    }, { threshold: 0.1 });

    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, [to]);

  return <span ref={ref}>{prefix}{val.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{suffix}</span>;
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  // Floating Mockup States
  const [revenueCount, setRevenueCount] = useState(1.2);
  const [profitCount, setProfitCount] = useState(0.5);
  const [healthCount, setHealthCount] = useState(25);
  const [mockupChartData, setMockupChartData] = useState([30, 45, 25, 60, 80, 50, 75, 95]);
  const [activeInsight, setActiveInsight] = useState(0);

  // Interactive Demo Terminal States
  const [activeDemoTab, setActiveDemoTab] = useState<'overview' | 'auditor' | 'chat'>('overview');
  const [demoChatMessages, setDemoChatMessages] = useState<any[]>([
    { id: 1, role: 'model', text: 'Hello! I am your AI CFO. Ask me any question about your revenue cash flows.' }
  ]);
  const [demoChatLoading, setDemoChatLoading] = useState(false);

  const { scrollY } = useScroll();

  // GPU Parallax transforms
  const yGlow1 = useTransform(scrollY, [0, 1000], [0, 80]);
  const yGlow2 = useTransform(scrollY, [0, 1000], [0, -60]);
  const yGrid = useTransform(scrollY, [0, 1500], [0, 100]);
  const yHeroMock = useTransform(scrollY, [0, 1000], [0, -40]);

  const mockupInsights = [
    { title: "Runway Warning", desc: "Optimizing database host leases can extend buffer runway by 3.5 months.", color: "purple" },
    { title: "Cash Flow Alert", desc: "Receivables from Acme Corp are 5 days overdue. Send automated ping.", color: "cyan" },
    { title: "Revenue Milestone", desc: "Inflows crossed ₹14M this month. Top performer: Enterprise SLA.", color: "emerald" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    
    // Mockup statistics count-up loop
    const duration = 1800; // 1.8s
    const intervalTime = 30;
    const steps = duration / intervalTime;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setRevenueCount((prev: number) => {
        const val = prev + (14.8 - 1.2) / steps;
        return val >= 14.8 ? 14.8 : Number(val.toFixed(1));
      });
      setProfitCount((prev: number) => {
        const val = prev + (10.6 - 0.5) / steps;
        return val >= 10.6 ? 10.6 : Number(val.toFixed(1));
      });
      setHealthCount((prev: number) => {
        const val = prev + (94 - 25) / steps;
        return val >= 94 ? 94 : Math.round(val);
      });

      if (step >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);

    // Continuous Mockup Redraw/Rotate Loop
    const mockupInterval = setInterval(() => {
      // Bouncing Sparkline heights
      setMockupChartData(Array.from({ length: 8 }, () => Math.floor(Math.random() * 65) + 30));
      // Fluctuate health gauge smoothly
      setHealthCount((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return next > 96 ? 96 : next < 91 ? 91 : next;
      });
      // Slide active insights card
      setActiveInsight((prev) => (prev + 1) % mockupInsights.length);
    }, 4500);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
      clearInterval(mockupInterval);
    };
  }, []);

  const handleLaunchDashboard = () => {
    navigate('/dashboard');
  };

  const handleGetStarted = () => {
    navigate('/auth');
  };

  // Demo Chatbot replies triggers
  const handleDemoPromptClick = (promptText: string) => {
    if (demoChatLoading) return;
    
    const userMsg = { id: Date.now(), role: 'user', text: promptText };
    setDemoChatMessages((prev) => [...prev, userMsg]);
    setDemoChatLoading(true);
    
    let answer = "";
    if (promptText.includes("runway")) {
      answer = "🟢 **Cash Runway Forecast:** Based on monthly outflows of **₹4.8 Lakhs** and cash reserves of **₹28.4 Lakhs**, your projected runway is **5.9 months**. Optimizing database leases can extend buffer runway to **7.2 months**.";
    } else if (promptText.includes("duplicate")) {
      answer = "⚠️ **Anomaly Detected:** Flagged **2 identical transactions** from *Vercel Web Services* on 2026-07-14 for **₹1,200** each. Suggested action: Initiate chargeback sequence.";
    } else {
      answer = "📈 **Next Month Projection:** Estimated Revenue: **₹16.5 Lakhs (+12%)** driven by Enterprise renewals. Projected Net Profit: **₹5.2 Lakhs** with margins stable at **31.4%**.";
    }

    setTimeout(() => {
      setDemoChatMessages((prev) => [...prev, { id: Date.now() + 1, role: 'model', text: answer }]);
      setDemoChatLoading(false);
    }, 900);
  };

  const partners = [
    { name: "Acme Corp", icon: Globe },
    { name: "Stark Labs", icon: Zap },
    { name: "Apex Group", icon: Activity },
    { name: "Vertex Co", icon: BrainCircuit },
    { name: "Matrix SaaS", icon: Database }
  ];

  const stats = [
    { value: 50, prefix: '₹', suffix: 'M+', label: 'Revenue Processed' },
    { value: 250, suffix: 'K+', label: 'Transactions Audited' },
    { value: 99, suffix: '%', label: 'Prediction Accuracy' },
    { value: 1000, suffix: '+', label: 'Businesses Synced' }
  ];

  const features = [
    {
      icon: FolderOpen,
      title: 'CSV Import',
      desc: 'Seamlessly upload financial statements in CSV, JSON, or Excel format. Automatically mapped by our parser.'
    },
    {
      icon: LineChart,
      title: 'AI Analytics',
      desc: 'Get deep breakdowns of your operational profit margins, recurring cash pools, and cost concentrations.'
    },
    {
      icon: Activity,
      title: 'Forecasting',
      desc: 'Machine learning algorithms calculate and chart multi-month revenue growth trends and runway buffers.'
    },
    {
      icon: FileSpreadsheet,
      title: 'Business Reports',
      desc: 'Compile executive Profit & Loss accounts, and balance sheet registries ready for underwriters and partners.'
    }
  ];

  const workflowSteps = [
    { num: '01', title: 'Upload CSV', desc: 'Securely import ledger statements in standard formats.' },
    { num: '02', title: 'Dashboard Analysis', desc: 'Aurora maps and compiles charts of your cash velocity.' },
    { num: '03', title: 'AI Insights', desc: 'System automatically runs anomaly checks and forecast vectors.' },
    { num: '04', title: 'Business Decisions', desc: 'Use AI auditor suggestions to save capital and plan growth.' }
  ];

  const testimonials = [
    {
      quote: "Aurora completely restructured our runway visibility. We caught a cloud billing overlap and saved ₹1.5 Lakhs MoM.",
      author: "Rohan Varma",
      role: "CEO, Matrix SaaS Labs"
    },
    {
      quote: "The forecasting accuracy is unreal. Having 99% accuracy on receivables help us deploy capital with complete calm.",
      author: "Meera Sen",
      role: "Finance Partner, Apex Logistics"
    },
    {
      quote: "The CFO Co-pilot chatbot answers complex margin queries instantly. It feels like having an on-demand auditor.",
      author: "Vikram Malhotra",
      role: "Co-Founder, Stark Forge"
    }
  ];

  const pricingTiers = [
    {
      name: 'Starter',
      price: '₹2,999',
      period: '/month',
      desc: 'Essential financial dashboard features for local shops and freelancers.',
      features: ['Up to 10,000 transactions/mo', 'Basic CSV mapping converter', '7-Day Free Trial included', 'Weekly email summary digests'],
      cta: 'Start Free Trial',
      highlighted: false
    },
    {
      name: 'Professional',
      price: '₹9,999',
      period: '/month',
      desc: 'Advanced cash flow analysis, forecasts, and AI Chat co-pilot for high-growth startups.',
      features: ['Unlimited transaction limits', 'Multi-format File Converters', 'AI Insights & Chatbot Advisor', 'P&L Reports statements', 'Multi-user workspace sharing'],
      cta: 'Get Started Pro',
      highlighted: true,
      badge: 'Best Value'
    },
    {
      name: 'Enterprise',
      price: 'Custom Pricing',
      period: '',
      desc: 'Tailored models, custom bank connectors, and fractional CFO advisory integrations.',
      features: ['Custom machine learning models', 'Dedicated server clusters', 'SLA guaranteed uptime logs', 'Monthly expert auditor check-ins'],
      cta: 'Contact Sales',
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen text-white bg-[#020617] relative overflow-hidden select-none font-['Plus_Jakarta_Sans']">
      
      {/* Cinematic Glowing Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Ambient Aurora Beams & Moving Circles */}
        <motion.div 
          style={{ y: yGlow1 }}
          animate={{
            x: [0, 45, -25, 0],
            y: [0, -35, 25, 0],
            scale: [1, 1.08, 0.93, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute top-[5%] left-[10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" 
        />
        <motion.div 
          style={{ y: yGlow2 }}
          animate={{
            x: [0, -35, 35, 0],
            y: [0, 25, -45, 0],
            scale: [1, 0.92, 1.08, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2
          }}
          className="absolute top-[20%] right-[5%] h-[450px] w-[450px] rounded-full bg-cyan-400/8 blur-[100px]" 
        />
        <motion.div 
          style={{ y: yGlow1 }}
          animate={{
            x: [0, 25, -25, 0],
            y: [0, 35, -15, 0],
            scale: [1, 1.03, 0.97, 1]
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 4
          }}
          className="absolute bottom-[20%] left-[15%] h-[550px] w-[550px] rounded-full bg-purple-650/8 blur-[120px]" 
        />
        
        {/* Subtle Financial Dot Grid */}
        <motion.div 
          style={{ y: yGrid }}
          className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:24px_24px] opacity-70" 
        />
        
        {/* Floating Particles */}
        <div className="absolute top-[15%] left-[25%] h-1.5 w-1.5 bg-cyan-400/30 rounded-full blur-xs animate-pulse" />
        <div className="absolute top-[40%] left-[15%] h-2 w-2 bg-blue-400/20 rounded-full blur-xs animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[30%] right-[30%] h-1 w-1 bg-purple-400/40 rounded-full blur-xs animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[35%] right-[20%] h-2 w-2 bg-cyan-500/20 rounded-full blur-xs animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-[20%] left-[40%] h-1.5 w-1.5 bg-blue-500/30 rounded-full blur-xs animate-pulse" style={{ animationDelay: '2.5s' }} />
      </div>

      {/* HEADER NAVBAR */}
      <motion.header 
        animate={{
          backgroundColor: scrolled ? 'rgba(2, 6, 23, 0.85)' : 'rgba(2, 6, 23, 0)',
          backdropFilter: scrolled ? 'blur(24px)' : 'blur(0px)',
          borderBottomColor: scrolled ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0)',
          paddingTop: scrolled ? '12px' : '20px',
          paddingBottom: scrolled ? '12px' : '20px'
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 w-full border-b"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5 transition-transform duration-300" style={{ transform: scrolled ? 'scale(0.95)' : 'scale(1)' }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 shadow-[0_8px_25px_rgba(59,130,246,0.35)]">
              <BrainCircuit className="text-white" size={20} />
            </div>
            <span className="text-base font-extrabold tracking-tight text-white uppercase">Hub</span>
          </Link>

          {/* Nav Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-400">
            {['features', 'solutions', 'pricing', 'about'].map((item) => (
              <a 
                key={item}
                href={`#${item}`} 
                className="relative transition hover:text-white py-1"
                onMouseEnter={() => setHoveredNav(item)}
                onMouseLeave={() => setHoveredNav(null)}
              >
                {item}
                {hoveredNav === item && (
                  <motion.div 
                    layoutId="nav-underline"
                    className="absolute left-0 right-0 bottom-0 h-[2px] bg-gradient-to-r from-blue-500 to-cyan-400"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/auth" className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-350 hover:text-white transition">
              Sign In
            </Link>
            <motion.button 
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGetStarted}
              className="premium-button text-xs font-bold uppercase tracking-wider px-5 py-2.5 cursor-pointer"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* 1. HERO SECTION */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-32 pb-20 md:pt-40 md:pb-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          
          {/* Hero Left Content */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300"
            >
              <Sparkles size={12} className="text-cyan-400" />
              ✨ AI Powered Financial Intelligence
            </motion.div>

            <motion.h1 
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.12 } }
              }}
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl leading-[1.15]"
            >
              <motion.span 
                variants={{ hidden: { opacity: 0, y: 25 }, show: { opacity: 1, y: 0 } }}
                className="block"
              >
                Turn Financial Data
              </motion.span>
              <motion.span 
                variants={{ hidden: { opacity: 0, y: 25 }, show: { opacity: 1, y: 0 } }}
                className="block text-gradient-blue"
              >
                Into Smarter Decisions.
              </motion.span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="max-w-xl text-sm md:text-base leading-relaxed text-slate-400 font-medium"
            >
              Revenue Hub helps businesses understand revenue, expenses, profit, cash flow and future growth using intelligent analytics and AI.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <motion.button 
                whileHover={{ scale: 1.03, boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGetStarted} 
                className="premium-button text-xs font-bold uppercase tracking-wider px-6 py-3.5 cursor-pointer"
              >
                Get Started
                <ArrowRight size={14} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.03, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLaunchDashboard} 
                className="premium-button-secondary text-xs font-bold uppercase tracking-wider px-6 py-3.5 cursor-pointer"
              >
                View Dashboard
              </motion.button>
            </motion.div>
          </div>

          {/* Hero Right: Live Oscillating Mockup */}
          <motion.div 
            style={{ y: yHeroMock }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.8, ease: 'easeOut' }}
            className="relative hidden lg:block"
          >
            <motion.div 
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="glass-panel rounded-[28px] p-6 shadow-2xl relative border border-white/10 bg-slate-950/20 backdrop-blur-3xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-blue-500/10 blur-[60px]" />
              <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-purple-500/10 blur-[60px]" />

              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase">Live Preview Console</span>
              </div>

              {/* Stat elements (Live rotating counts) */}
              <div className="grid grid-cols-3 gap-3 mb-4 text-left">
                <div className="rounded-xl border border-white/5 bg-white/3 p-3">
                  <p className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Revenue</p>
                  <h4 className="text-sm font-extrabold text-blue-300 mt-0.5">₹{revenueCount}M</h4>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/3 p-3">
                  <p className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Profit</p>
                  <h4 className="text-sm font-extrabold text-purple-300 mt-0.5">₹{profitCount}M</h4>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/3 p-3 flex flex-col justify-between">
                  <p className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Health</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="relative h-5 w-5 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="10" cy="10" r="8" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" fill="transparent" />
                        <motion.circle 
                          cx="10" 
                          cy="10" 
                          r="8" 
                          stroke="#06b6d4" 
                          strokeWidth="1.5" 
                          fill="transparent" 
                          strokeDasharray="50.2" 
                          animate={{ strokeDashoffset: 50.2 - (50.2 * healthCount) / 100 }}
                          transition={{ duration: 0.5 }}
                        />
                      </svg>
                      <span className="absolute text-[7px] font-black text-slate-200">{healthCount}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sparkline chart */}
              <div className="rounded-xl border border-white/5 bg-white/4 p-3.5 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-450">Liquidity Pulse</span>
                  <span className="text-[9px] font-bold text-emerald-400">Live</span>
                </div>
                <div className="h-16 w-full flex items-end gap-1.5 pt-1">
                  {mockupChartData.map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: `${h}%` }}
                      transition={{ type: "spring", stiffness: 100, damping: 15 }}
                      className="flex-1 bg-gradient-to-t from-blue-600/30 to-cyan-400/50 rounded-t-sm"
                    />
                  ))}
                </div>
              </div>

              {/* Dynamic AI Alert Feed */}
              <div className="h-16 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeInsight}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 flex gap-2.5 text-left border-l-4 border-l-purple-500"
                  >
                    <Sparkles size={14} className="text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-purple-300">{mockupInsights[activeInsight].title}</h5>
                      <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">{mockupInsights[activeInsight].desc}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* 2. TRUSTED BY COMPANIES */}
      <section className="py-10 bg-slate-950/20 border-t border-b border-white/5 relative z-10">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500 mb-6">
            TRUSTED BY FORWARD-THINKING STARTUPS & AUDIT TEAMS
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-40 grayscale hover:grayscale-0 hover:opacity-80 transition-all duration-500">
            {partners.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="flex items-center gap-2 text-white">
                  <Icon size={16} className="text-cyan-400" />
                  <span className="text-xs font-black uppercase tracking-wider">{p.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE DASHBOARD DEMO SHOWCASE */}
      <section id="demo" className="mx-auto max-w-7xl px-6 py-20 border-b border-white/5 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <span className="premium-chip">Interactive Demo Console</span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Test the Revenue Engine.
          </h2>
          <p className="text-xs text-slate-450 max-w-md mx-auto leading-relaxed">
            Click the interactive tabs or chat suggestions below to experience the real-time CFO audit co-pilot.
          </p>
        </div>

        {/* Demo terminal container */}
        <motion.div 
          initial={{ opacity: 0, y: 35, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="glass-panel w-full max-w-4xl mx-auto rounded-[32px] border border-white/10 bg-slate-950/40 overflow-hidden flex flex-col min-h-[460px] shadow-2xl relative"
        >
          {/* Header tabs bar */}
          <div className="bg-slate-950/60 p-4 border-b border-white/5 flex flex-wrap gap-2 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Aurora Cloud Console</span>
            </div>
            
            <div className="flex rounded-xl border border-white/5 bg-white/4 p-0.5 text-[9px] font-bold uppercase tracking-wider">
              <button 
                onClick={() => setActiveDemoTab('overview')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeDemoTab === 'overview' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveDemoTab('auditor')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeDemoTab === 'auditor' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                AI Auditor
              </button>
              <button 
                onClick={() => setActiveDemoTab('chat')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeDemoTab === 'chat' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Predictive Chat
              </button>
            </div>
          </div>

          {/* Terminal view body */}
          <div className="p-6 flex-1 flex flex-col justify-between">
            {activeDemoTab === 'overview' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 flex-1 flex flex-col justify-between text-left"
              >
                {/* 3 KPI widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Operational Inflow</p>
                    <h3 className="text-lg font-black text-white mt-1">₹14.8M <span className="text-[10px] text-emerald-450 font-bold ml-1">↑ 18%</span></h3>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Audited Outflows</p>
                    <h3 className="text-lg font-black text-white mt-1">₹4.2M <span className="text-[10px] text-emerald-450 font-bold ml-1">↓ 6%</span></h3>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Business Health Score</p>
                    <h3 className="text-lg font-black text-cyan-400 mt-1">94 <span className="text-[10px] text-slate-500 font-bold uppercase ml-1">EXCELLENT</span></h3>
                  </div>
                </div>

                {/* Big trend charts */}
                <div className="rounded-2xl border border-white/5 bg-slate-950/20 p-5 flex flex-col justify-between flex-1 min-h-[160px]">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-300">Runway Forecast Audit</h4>
                      <p className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-widest font-semibold">Projected Cash Reservoirs</p>
                    </div>
                    <span className="premium-chip">INR Standard</span>
                  </div>
                  
                  {/* CSS Sparklines */}
                  <div className="h-28 w-full flex items-end gap-2.5 pt-2">
                    {[40, 55, 35, 70, 85, 60, 80, 95, 70, 90, 85, 100].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: '0%' }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.04, duration: 0.6 }}
                        className="flex-1 bg-gradient-to-t from-blue-600/30 via-cyan-500/40 to-blue-500/20 rounded-t-lg border border-blue-500/10"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeDemoTab === 'auditor' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 flex-1 text-left"
              >
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 flex items-start gap-3 border-l-4 border-l-rose-500">
                  <CheckCircle2 size={16} className="text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">Duplicate billing entries flagged</h5>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">System identified double-billing from Vercel Cloud Hosting for transaction on 2026-07-14.</p>
                  </div>
                  <button onClick={() => addToast('success', 'Discrepancy resolved successfully!')} className="premium-chip hover:bg-rose-500/10 cursor-pointer">Resolve</button>
                </div>

                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 flex items-start gap-3 border-l-4 border-l-purple-500">
                  <Sparkles size={16} className="text-purple-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">Database Leases optimization recommendation</h5>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Transitioning database hosting to reserved annual leases will extend cash buffer runway by 3.5 months.</p>
                  </div>
                  <button onClick={() => addToast('success', 'Annual migration scheduled.')} className="premium-chip hover:bg-purple-500/10 cursor-pointer">Apply</button>
                </div>
              </motion.div>
            )}

            {activeDemoTab === 'chat' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col justify-between min-h-[300px]"
              >
                {/* Chat feed window */}
                <div className="space-y-3 max-h-[220px] overflow-y-auto p-2 text-left">
                  {demoChatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-md rounded-2xl p-3.5 text-[11px] leading-relaxed ${msg.role === 'user' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold' : 'border border-white/5 bg-white/3 text-slate-300'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {demoChatLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-md rounded-2xl border border-white/5 bg-white/3 p-3 text-[11px] text-slate-500 animate-pulse">
                        CFO Bot is calculating...
                      </div>
                    </div>
                  )}
                </div>

                {/* Prompt suggestion pills */}
                <div className="border-t border-white/5 pt-4">
                  <p className="text-left text-[9px] font-black uppercase text-slate-550 tracking-wider mb-2">SUGGESTED ANALYTICS</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button 
                      onClick={() => handleDemoPromptClick("Calculate our cash runway")} 
                      className="px-3 py-1.5 rounded-lg border border-white/8 bg-white/4 text-[10px] font-bold text-slate-300 hover:bg-white/8 transition cursor-pointer"
                    >
                      Calculate cash runway
                    </button>
                    <button 
                      onClick={() => handleDemoPromptClick("Check for duplicate billing entries")} 
                      className="px-3 py-1.5 rounded-lg border border-white/8 bg-white/4 text-[10px] font-bold text-slate-300 hover:bg-white/8 transition cursor-pointer"
                    >
                      Audit duplicate billing
                    </button>
                    <button 
                      onClick={() => handleDemoPromptClick("What is our projected next-month profit?")} 
                      className="px-3 py-1.5 rounded-lg border border-white/8 bg-white/4 text-[10px] font-bold text-slate-300 hover:bg-white/8 transition cursor-pointer"
                    >
                      Project next-month profit
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* 4. AI WORKFLOW ANIMATION (Staggered timeline) */}
      <section id="solutions" className="mx-auto max-w-7xl px-6 py-20 md:py-28 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <span className="premium-chip">Workflow Engine</span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Auditing accounts in 4 stages.
          </h2>
          <p className="text-xs text-slate-450 max-w-md mx-auto leading-relaxed">
            From raw CSV bank lists to CFO audit reports, Aurora synchronizes your operations fluidly.
          </p>
        </div>

        {/* Central Vertical Line (Timeline Grows) */}
        <div className="absolute left-1/2 top-[240px] bottom-[100px] w-px bg-white/5 -translate-x-1/2 hidden lg:block">
          <motion.div 
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-full h-full bg-gradient-to-b from-blue-500 via-cyan-400 to-purple-500 origin-top"
          />
        </div>

        {/* Timeline Staggered Grid */}
        <div className="space-y-12 lg:space-y-0">
          {workflowSteps.map((step, idx) => (
            <div key={idx} className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-8 lg:gap-16">
              
              {/* Left Panel */}
              <div className="text-left lg:text-right">
                {idx % 2 === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, x: -45 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="glass-panel rounded-[24px] p-6 hover:border-blue-500/30 transition-colors"
                  >
                    <span className="text-xs font-black text-blue-400">STAGE {step.num}</span>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mt-1">{step.title}</h4>
                    <p className="text-[11px] text-slate-450 leading-relaxed mt-2">{step.desc}</p>
                  </motion.div>
                ) : (
                  <div className="hidden lg:block" />
                )}
              </div>

              {/* Center Timeline Node Dot */}
              <div className="flex justify-center relative z-25">
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="h-5 w-5 rounded-full bg-[#020617] border-4 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)] hidden lg:block" 
                />
              </div>

              {/* Right Panel */}
              <div className="text-left">
                {idx % 2 !== 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, x: 45 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="glass-panel rounded-[24px] p-6 hover:border-cyan-500/30 transition-colors"
                  >
                    <span className="text-xs font-black text-cyan-400">STAGE {step.num}</span>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mt-1">{step.title}</h4>
                    <p className="text-[11px] text-slate-450 leading-relaxed mt-2">{step.desc}</p>
                  </motion.div>
                ) : (
                  <div className="hidden lg:block" />
                )}
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* 5. FEATURES MATRIX SECTION */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20 md:py-28 border-t border-white/5 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="premium-chip">Product Matrix</span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Streamlined revenue operation.
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Eliminate traditional spreadsheets. Deploy automated cash flow predictions, AI recommendation tools, and ledger audits in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 35, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: 'easeOut' }}
                whileHover={{ 
                  y: -8, 
                  borderColor: 'rgba(59, 130, 246, 0.25)', 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  boxShadow: '0 12px 30px rgba(2, 6, 23, 0.4)' 
                }}
                className="glass-panel rounded-[24px] p-6 space-y-4 flex flex-col justify-between group transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-300 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105">
                  <Icon size={18} />
                </div>
                <div className="space-y-1.5 flex-1 text-left">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">{feat.title}</h4>
                  <p className="text-[11px] text-slate-455 leading-relaxed font-medium">{feat.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 6. BUSINESS METRICS (Statistics count up) */}
      <section className="border-t border-b border-white/5 bg-slate-950/20 py-12 relative z-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  <CountUp to={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-6 py-20 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="premium-chip">User Feedback</span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Endorsed by corporate leaders.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              whileHover={{ y: -6, borderColor: 'rgba(139, 92, 246, 0.25)' }}
              className="glass-panel rounded-[24px] p-6 flex flex-col justify-between space-y-6 transition-all duration-300"
            >
              <p className="text-xs text-slate-350 italic leading-relaxed text-left">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-extrabold text-[10px] text-slate-900 uppercase">
                  {t.author.slice(0,2)}
                </div>
                <div className="text-left">
                  <h5 className="text-xs font-bold text-white">{t.author}</h5>
                  <p className="text-[10px] text-slate-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 8. PRICING SECTION */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-20 border-t border-white/5 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="premium-chip">Subscription Plans</span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Flexible packages for scaling teams.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: idx * 0.12 }}
              whileHover={{ 
                y: -10, 
                scale: 1.02,
                borderColor: tier.highlighted ? 'rgba(6, 182, 212, 0.6)' : 'rgba(255, 255, 255, 0.2)',
                boxShadow: tier.highlighted 
                  ? '0 20px 45px rgba(6, 182, 212, 0.2)' 
                  : '0 15px 35px rgba(2, 6, 23, 0.4)' 
              }}
              className={`glass-panel rounded-[28px] p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 text-left ${
                tier.highlighted ? 'border-cyan-400/40 shadow-[0_15px_40px_rgba(6,182,212,0.15)] bg-slate-950/20' : ''
              }`}
            >
              {tier.badge && (
                <div className="absolute right-0 top-0 bg-gradient-to-l from-cyan-500 to-blue-500 text-slate-950 font-black text-[9px] uppercase tracking-wider px-3.5 py-1.5 rounded-bl-xl">
                  {tier.badge}
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-widest">{tier.name}</h4>
                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-3xl font-black text-white">{tier.price}</span>
                  <span className="text-xs font-semibold text-slate-550">{tier.period}</span>
                </div>
                <p className="text-xs text-slate-455 leading-relaxed font-medium">{tier.desc}</p>
                <div className="h-px bg-white/5 w-full my-4" />
                <ul className="space-y-2.5 text-xs text-slate-400">
                  {tier.features.map((feat, fidx) => (
                    <li key={fidx} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGetStarted}
                className={`w-full mt-8 py-3 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition ${
                  tier.highlighted 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md' 
                    : 'bg-white/5 border border-white/8 text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tier.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 9. CALL TO ACTION BANNER */}
      <section id="about" className="mx-auto max-w-5xl px-6 py-16 md:py-20 text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel rounded-[32px] p-10 relative overflow-hidden bg-gradient-to-br from-blue-950/10 via-cyan-950/5 to-purple-950/10 border border-white/10"
        >
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xs text-slate-455 max-w-sm mx-auto leading-relaxed mb-6 font-medium">
            Connect ledger imports in minutes. Integrate AI runway forecast audits immediately.
          </p>
          <motion.button 
            whileHover={{ scale: 1.04, boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGetStarted}
            className="premium-button text-xs font-bold uppercase tracking-wider px-8 py-3.5 cursor-pointer mx-auto"
          >
            Get Started
            <ArrowRight size={14} />
          </motion.button>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="border-t border-white/10 bg-slate-950/40 py-16 px-6 relative z-10">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-5 gap-10">
          
          <div className="space-y-4 md:col-span-2 text-left">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400">
                <BrainCircuit className="text-white" size={16} />
              </div>
              <span className="text-sm font-bold text-white uppercase tracking-wider">Revenue Hub</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs font-medium">
              Enterprise Operating System for modern cash flows. Synced with Google Gemini for automated financial recommendations.
            </p>
          </div>

          <div className="space-y-3 text-left">
            <h5 className="text-[10px] font-bold text-white uppercase tracking-widest">Product</h5>
            <ul className="space-y-2 text-[11px] text-slate-500 font-semibold">
              <li><a href="#features" className="hover:text-slate-200 transition">Features</a></li>
              <li><a href="#pricing" className="hover:text-slate-200 transition">Pricing Plans</a></li>
            </ul>
          </div>

          <div className="space-y-3 text-left">
            <h5 className="text-[10px] font-bold text-white uppercase tracking-widest">Company</h5>
            <ul className="space-y-2 text-[11px] text-slate-500 font-semibold">
              <li><a href="#about" className="hover:text-slate-200 transition">About Hub</a></li>
              <li><a href="#solutions" className="hover:text-slate-200 transition">Solutions</a></li>
            </ul>
          </div>

          <div className="space-y-3 text-left">
            <h5 className="text-[10px] font-bold text-white uppercase tracking-widest">Support</h5>
            <ul className="space-y-2 text-[11px] text-slate-500 font-semibold">
              <li><a href="#contact" className="hover:text-slate-200 transition">Contact Us</a></li>
              <li><a href="#" className="hover:text-slate-200 transition">Privacy Policy</a></li>
            </ul>
          </div>

        </div>

        <div className="mx-auto max-w-7xl border-t border-white/5 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-600 font-bold uppercase tracking-wider">
          <span>&copy; {new Date().getFullYear()} Revenue Hub. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-350 transition">Privacy Policy</a>
            <a href="#" className="hover:text-slate-350 transition">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
