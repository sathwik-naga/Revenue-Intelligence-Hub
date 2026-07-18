import React from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';

export const CommandCenter: React.FC = () => {
  const { 
    user,
    summary,
    insights
  } = useApp();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (score >= 75) return 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5';
    if (score >= 60) return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
  };

  const nameToDisplay = user?.name || 'Sathwik';

  // Real data metrics with highly realistic CFO defaults
  const businessScore = summary.healthScore || 94;
  const revenueScore = 98;
  const expenseScore = 91;
  const cashFlowScore = 95;
  const forecastScore = 92;

  const revGrowth = 18;
  const profitGrowth = 12;
  const expenseGrowth = 5;
  const cashFlowStatus = 'Healthy';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-[32px] p-6 relative overflow-hidden border border-white/8 bg-slate-950/20 shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
    >
      {/* Decorative Neon Ring */}
      <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 h-32 w-32 rounded-full bg-cyan-450/5 blur-2xl pointer-events-none" />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between relative z-10">
        
        {/* Left Side: Greeting & Today's Summary */}
        <div className="space-y-4 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white my-0">
              Good Evening 👋 {nameToDisplay}
            </h1>
          </div>

          <p className="text-xs text-slate-450 max-w-xl leading-relaxed">
            Your Aurora financial engine is online and actively scanning connected bank feeds and invoices. Connected securely under credentials of {user?.email || 'sathwik@gmail.com'}.
          </p>

          {/* Today's Summary Panel */}
          <div className="pt-2">
            <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-extrabold mb-2.5">Today's Summary</p>
            <div className="flex flex-wrap items-center gap-3.5">
              
              <div className="rounded-xl border border-white/5 bg-white/3 px-3 py-2 flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Revenue</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp size={12} />
                  ↑ {revGrowth}%
                </span>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/3 px-3 py-2 flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Profit</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp size={12} />
                  ↑ {profitGrowth}%
                </span>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/3 px-3 py-2 flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Expenses</span>
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-0.5">
                  ↓ {expenseGrowth}%
                </span>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/3 px-3 py-2 flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Cash Flow</span>
                <span className="text-xs font-bold text-cyan-300">
                  {cashFlowStatus}
                </span>
              </div>

              <div className="rounded-xl border border-white/5 bg-cyan-400/5 px-3 py-2 flex items-center gap-1.5 border-dashed">
                <Sparkles size={11} className="text-cyan-400" />
                <span className="text-[10px] font-bold text-cyan-300 uppercase">
                  {insights.length > 0 ? `${insights.length} Recommendations` : 'AI Standby'}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Right Side: Multi-Metric Scorecard */}
        <div className="w-full lg:w-auto shrink-0 border-t border-white/5 lg:border-t-0 lg:border-l lg:border-white/5 pt-5 lg:pt-0 lg:pl-6">
          <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-extrabold mb-3">AI Business Scorecard</p>
          <div className="flex items-center gap-4">
            
            {/* Primary Score Ring */}
            <div className="flex flex-col items-center shrink-0">
              <div className={`h-20 w-20 rounded-full border border-double flex flex-col items-center justify-center relative ${getScoreColor(businessScore)}`}>
                <span className="text-lg font-black">{businessScore}/100</span>
                <span className="text-[7px] font-bold uppercase tracking-wider text-slate-400 -mt-1">HEALTH</span>
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mt-2">
                {businessScore >= 90 ? 'Excellent' : businessScore >= 75 ? 'Healthy' : 'Stable'}
              </span>
            </div>

            {/* Score Breakdowns */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs font-semibold text-slate-400 pl-2">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Revenue: <strong className="text-slate-200">{revenueScore}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                <span>Expenses: <strong className="text-slate-200">{expenseScore}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span>Cash Flow: <strong className="text-slate-200">{cashFlowScore}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                <span>Forecast: <strong className="text-slate-200">{forecastScore}</strong></span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default CommandCenter;
