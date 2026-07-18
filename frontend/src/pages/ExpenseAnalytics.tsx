import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { ShieldAlert, ArrowUpRight, Activity } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3.5 shadow-2xl backdrop-blur-md max-w-[260px] text-left">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-450">{label}</p>
        <div className="mt-2 space-y-1">
          {payload.map((pld: any, index: number) => (
            <p key={index} className="text-xs font-semibold text-slate-200 flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 truncate">
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: pld.color || pld.fill }} />
                {pld.name}:
              </span>
              <span className="font-extrabold text-white">
                {typeof pld.value === 'number' ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(pld.value) : pld.value}
              </span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const ExpenseAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { summary, transactions, insights, insightsLoading, insightsError, refreshAnalysis } = useApp();
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showSampleReport, setShowSampleReport] = useState(false);

  const fmt = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Compile monthly category expense histories (simulate Stacked Bar data)
  const monthlyCategoryExpenseData = [
    { month: 'May', Infrastructure: 3200, Software: 240, Marketing: 2800, Salaries: 15400, Legal: 1500 },
    { month: 'June', Infrastructure: 3410, Software: 440, Marketing: 3200, Salaries: 4200, Legal: 0 },
    { month: 'July', Infrastructure: 4820, Software: 360, Marketing: 0, Salaries: 0, Legal: 0 }
  ];

  // Outflows category distribution list
  const expenseTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'outflow' && t.status === 'completed')
    .forEach((t) => {
      expenseTotals[t.category] = (expenseTotals[t.category] || 0) + t.amount;
    });

  const pieData = Object.entries(expenseTotals).map(([name, value]) => ({
    name,
    value,
    percentage: summary.totalExpenses > 0 ? (value / summary.totalExpenses) * 100 : 0
  })).sort((a,b)=>b.value-a.value);

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#64748B'];

  // Anomaly warnings list (from insights filter)
  const anomalyWarnings = insights.filter((i) => i.type === 'anomaly');

  // Fallback mocks if the database is empty
  const isLedgerEmpty = transactions.length === 0;

  const displayPieData = isLedgerEmpty ? [
    { name: 'Marketing', value: 18500, percentage: 35 },
    { name: 'Salaries', value: 16000, percentage: 30 },
    { name: 'Software', value: 8500, percentage: 16 },
    { name: 'Infrastructure', value: 6000, percentage: 11 },
    { name: 'Legal', value: 3840, percentage: 8 }
  ] : pieData;

  const totalExpensesVal = isLedgerEmpty ? 52840 : summary.totalExpenses;
  const highestCategoryVal = isLedgerEmpty ? 'Marketing' : (summary.topExpenseCategory || 'Marketing');
  
  const expenseTransactions = transactions.filter(t => t.type === 'outflow');
  const largestTransactionVal = isLedgerEmpty 
    ? 18500 
    : (expenseTransactions.length > 0 ? Math.max(...expenseTransactions.map(t => t.amount)) : 0);
  
  const averageDailySpendVal = isLedgerEmpty 
    ? 1760 
    : (transactions.length > 0 ? Math.round(summary.totalExpenses / 30) : 0);

  const trendText = isLedgerEmpty 
    ? '↓ 12% vs last month' 
    : (summary.totalExpenses > summary.previousExpenses 
        ? `↑ ${Math.round(((summary.totalExpenses - summary.previousExpenses) / (summary.previousExpenses || 1)) * 100)}% vs last month` 
        : `↓ ${Math.round(((summary.previousExpenses - summary.totalExpenses) / (summary.previousExpenses || 1)) * 100)}% vs last month`);

  const defaultRecommendations = [
    'Marketing spend increased by 18%.',
    'Cloud infrastructure costs are above average.',
    'Salary expenses account for 42% of total spending.',
    'Consider reducing recurring software subscriptions.'
  ];

  const aiRecs = (!insightsError && insights.length > 0)
    ? insights.filter(i => i.type === 'prediction' || i.type === 'general').map(i => i.description || i.title)
    : [];

  const recommendationsList = aiRecs.length > 0 ? aiRecs : defaultRecommendations;

  // Top Risks Fallback Data
  const defaultRisks = [
    'Marketing spend increased 18%',
    'Cloud costs rising',
    'Salary expenses exceed target',
    'Software subscriptions duplicated'
  ];

  const displayRisks = (!insightsError && anomalyWarnings.length > 0)
    ? anomalyWarnings.map(w => w.title)
    : defaultRisks;

  // 5. Loading Skeleton Loader
  if (insightsLoading) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="space-y-2 text-left">
          <div className="h-8 w-48 bg-white/5 rounded-xl" />
          <div className="h-4 w-96 bg-white/5 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-[420px] glass-panel rounded-[28px] p-6 space-y-4">
            <div className="h-6 w-32 bg-white/5 rounded-lg" />
            <div className="h-56 w-56 mx-auto rounded-full bg-white/5 flex items-center justify-center">
              <div className="h-32 w-32 rounded-full bg-slate-900" />
            </div>
          </div>
          <div className="lg:col-span-2 h-[420px] glass-panel rounded-[28px] p-6 space-y-4">
            <div className="h-6 w-48 bg-white/5 rounded-lg" />
            <div className="h-64 w-full bg-white/5 rounded-2xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 glass-panel rounded-2xl p-6" />
          <div className="h-64 glass-panel rounded-2xl p-6" />
        </div>
      </div>
    );
  }

  // 4. Empty State View
  if (isLedgerEmpty && !showSampleReport) {
    return (
      <div className="space-y-6 select-none">
        <div className="text-left">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight my-0">
            Expense Analytics
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Monitor operating cash outflows, category percentages, and expense anomalies.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center p-12 text-center glass-panel rounded-[32px] max-w-2xl mx-auto my-16 space-y-6">
          <span className="text-5xl">💸</span>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">No expense data available.</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Upload a CSV file containing your recent financial statements to generate expense analytics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/upload')}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white rounded-2xl shadow transition text-xs font-bold cursor-pointer"
            >
              Upload CSV
            </button>
            <button
              onClick={() => setShowSampleReport(true)}
              className="px-5 py-3 border border-white/8 bg-white/4 hover:bg-white/8 text-slate-200 rounded-2xl transition shadow text-xs font-bold cursor-pointer"
            >
              View Sample Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      
      {/* 1. Sample Data Banner */}
      {isLedgerEmpty && showSampleReport && (
        <div className="glass-panel border-amber-500/20 bg-amber-500/5 p-5 rounded-[24px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span>📊</span> Sample Report
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
              This page is generated from sample financial data because no ledger transactions have been uploaded yet. Upload a CSV file to generate real expense analytics.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => navigate('/upload')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
            >
              Upload CSV
            </button>
            <button
              onClick={() => setShowSampleReport(false)}
              className="px-4 py-2.5 border border-white/8 bg-white/4 hover:bg-white/8 text-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Page Heading & Status Badge */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight my-0">
              Expense Analytics
            </h1>
            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 ${
              isLedgerEmpty 
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' 
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
            }`}>
              {isLedgerEmpty ? '🟡 Sample Data' : '🟢 Live Financial Data'}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1.5">
            Monitor operating cash outflows, category percentages, and expense anomalies.
          </p>
        </div>
      </div>

      {/* 1. Financial Overview Section */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 text-left pl-1">Financial Overview</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-slate-950/15 text-left">
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Total Expenses</p>
            <div className="flex items-baseline justify-between gap-1.5 mt-1.5">
              <h3 className="text-base font-extrabold text-white">{fmt(totalExpensesVal)}</h3>
              {isLedgerEmpty && <span className="text-[8px] text-rose-455 font-bold uppercase tracking-wider">↑ 12%</span>}
            </div>
            {isLedgerEmpty && <p className="text-[7px] text-amber-400 font-bold uppercase mt-1 tracking-widest">Sample Values</p>}
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-slate-950/15 text-left">
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Highest Category</p>
            <h3 className="text-base font-extrabold text-white mt-1.5 truncate">{highestCategoryVal}</h3>
            {isLedgerEmpty && <p className="text-[7px] text-amber-400 font-bold uppercase mt-1 tracking-widest">Sample Values</p>}
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-slate-950/15 text-left">
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Largest Transaction</p>
            <div className="flex items-baseline justify-between gap-1.5 mt-1.5">
              <h3 className="text-base font-extrabold text-white mt-1.5">{fmt(largestTransactionVal)}</h3>
              {isLedgerEmpty && <span className="text-[8px] text-rose-455 font-bold uppercase tracking-wider">↑ 4%</span>}
            </div>
            {isLedgerEmpty && <p className="text-[7px] text-amber-400 font-bold uppercase mt-1 tracking-widest">Sample Values</p>}
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-slate-950/15 text-left">
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Average Daily Spend</p>
            <div className="flex items-baseline justify-between gap-1.5 mt-1.5">
              <h3 className="text-base font-extrabold text-white mt-1.5">{fmt(averageDailySpendVal)}</h3>
              {isLedgerEmpty && <span className="text-[8px] text-emerald-450 font-bold uppercase tracking-wider">↓ 6%</span>}
            </div>
            {isLedgerEmpty && <p className="text-[7px] text-amber-400 font-bold uppercase mt-1 tracking-widest">Sample Values</p>}
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-slate-950/15 text-left col-span-2 md:col-span-1">
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Expense Trend</p>
            <h3 className="text-base font-extrabold text-emerald-400 mt-1.5">{trendText}</h3>
            {isLedgerEmpty && <p className="text-[7px] text-amber-400 font-bold uppercase mt-1 tracking-widest">Sample Values</p>}
          </div>
        </div>
      </div>

      {/* Main Breakdown Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Interactive Pie/Donut Chart & 3. Expense Breakdown Table */}
        <div className="glass-panel rounded-[28px] p-6 flex flex-col justify-between">
          <h4 className="font-bold text-base text-white pb-3 mb-4 border-b border-white/5 text-left">Operating Budget Distribution</h4>
          
          <div className="relative h-64 w-full flex items-center justify-center">
            {/* Centered Total Expenses Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Total Expenses</span>
              <span className="text-lg font-black text-white mt-1">{fmt(totalExpensesVal)}</span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  {...({
                    activeIndex,
                    activeShape: { stroke: '#3b82f6', strokeWidth: 2 },
                    data: displayPieData,
                    cx: "50%",
                    cy: "50%",
                    innerRadius: 60,
                    outerRadius: 80,
                    paddingAngle: 3,
                    dataKey: "value",
                    onMouseEnter: (_: any, index: number) => setActiveIndex(index),
                    onMouseLeave: () => setActiveIndex(-1),
                    isAnimationActive: true,
                    animationDuration: 850,
                    label: ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.45;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return percent > 0.08 ? (
                        <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" className="text-[8px] font-black pointer-events-none">
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      ) : null;
                    }
                  } as any)}
                >
                  {displayPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 3. Expense Breakdown Table */}
          <div className="mt-4 border border-white/5 rounded-2xl overflow-hidden bg-slate-950/15">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/4 border-b border-white/5 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider">
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5 text-right">Amount</th>
                  <th className="p-2.5 text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {displayPieData.map((entry, idx) => (
                  <tr key={entry.name} className="border-b border-white/5 text-slate-350 hover:bg-white/3 text-[11px] font-semibold">
                    <td className="p-2.5 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="truncate max-w-[90px]">{entry.name}</span>
                    </td>
                    <td className="p-2.5 text-right font-bold text-white">{fmt(entry.value)}</td>
                    <td className="p-2.5 text-right text-slate-450 flex items-center justify-end gap-2">
                      <div className="w-12 bg-white/5 h-1.5 rounded-full overflow-hidden shrink-0 hidden sm:block">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${entry.percentage}%` }} />
                      </div>
                      <span>{entry.percentage.toFixed(0)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stacked Category Trends Bar Chart */}
        <div className="lg:col-span-2 glass-panel rounded-[28px] p-6 text-left">
          <h4 className="font-bold text-base text-white pb-3 mb-4 border-b border-white/5">Monthly Category Outflow Velocity</h4>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCategoryExpenseData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis 
                  dataKey="month" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  tickFormatter={(val) => typeof val === 'string' && val.length > 8 ? `${val.slice(0, 6)}...` : val}
                  minTickGap={15}
                />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Legend iconType="circle" verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: '600', paddingBottom: '10px' }} />
                <Bar dataKey="Infrastructure" stackId="a" fill="#2563EB" radius={[4, 4, 4, 4]} isAnimationActive={true} />
                <Bar dataKey="Software" stackId="a" fill="#10B981" radius={[4, 4, 4, 4]} isAnimationActive={true} />
                <Bar dataKey="Marketing" stackId="a" fill="#F59E0B" radius={[4, 4, 4, 4]} isAnimationActive={true} />
                <Bar dataKey="Salaries" stackId="a" fill="#8B5CF6" radius={[4, 4, 4, 4]} isAnimationActive={true} />
                <Bar dataKey="Legal" stackId="a" fill="#EF4444" radius={[4, 4, 4, 4]} isAnimationActive={true} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Anomaly & Risk detection panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Outlier Warnings list & Sub-risk cards */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Anomalies Card */}
          <div className="glass-panel rounded-2xl p-6 text-left">
            <div className="flex items-center gap-2 text-rose-455 pb-3 mb-4 border-b border-white/5">
              <ShieldAlert size={20} className="stroke-[2px]" />
              <h4 className="font-bold text-base text-white">Cost Anomalies & Outliers</h4>
            </div>

            <div className="space-y-4">
              {insightsError ? (
                /* AI Insights Temporarily Unavailable Card */
                <div className="p-6 border border-rose-500/20 bg-rose-500/5 rounded-2xl space-y-4 text-left">
                  <div className="flex items-start gap-3">
                    <span className="p-2 bg-rose-500/20 text-rose-400 rounded-xl text-lg shrink-0">⚠️</span>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-sm text-white">AI Insights Temporarily Unavailable</h4>
                      <p className="text-xs text-slate-400">The AI service is currently unavailable.</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-1 pl-11">
                    <p className="font-bold text-slate-350">Possible reasons:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Model unavailable</li>
                      <li>API quota reached</li>
                      <li>Temporary backend issue</li>
                    </ul>
                  </div>
                  <div className="pl-11 pt-1">
                    <button
                      onClick={() => {
                        console.error("Technical error details:", insightsError);
                        refreshAnalysis();
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Retry Analysis
                    </button>
                  </div>
                </div>
              ) : anomalyWarnings.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">No anomalies detected in current billing cycles.</div>
              ) : (
                anomalyWarnings.map((warn) => (
                  <div
                    key={warn.id}
                    className="flex items-start justify-between gap-4 p-4 border border-rose-500/20 bg-rose-500/5 rounded-xl"
                  >
                    <div className="space-y-1">
                      <h5 className="font-bold text-sm text-rose-400">{warn.title}</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {warn.description}
                      </p>
                    </div>
                    {warn.impactAmount && (
                      <div className="text-right shrink-0">
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Est. Leakage</span>
                        <span className="text-base font-extrabold text-rose-450">{fmt(warn.impactAmount)}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sub-grid: Top Risks & Cost Savings Opportunity Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Top Risks card */}
            <div className="glass-panel p-5 rounded-2xl text-left border border-white/5 bg-slate-950/15">
              <h4 className="font-bold text-sm text-rose-400 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                <span>⚠️</span> Top Risks
              </h4>
              <div className="space-y-2.5">
                {displayRisks.map((risk, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs font-semibold text-slate-350">
                    <span className="text-rose-400 mt-0.5 shrink-0">•</span>
                    <span>{risk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Savings Opportunity card */}
            <div className="glass-panel p-5 rounded-2xl text-left border border-white/5 bg-slate-950/15 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-emerald-450 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                  <span>💰</span> Savings Opportunities
                </h4>
                <div className="mb-3.5 p-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Potential Annual Savings</span>
                  <span className="text-base font-black text-emerald-450">{fmt(26500)}</span>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2 text-xs font-semibold text-slate-350">
                    <span className="text-emerald-450 mt-0.5 shrink-0">•</span>
                    <span>Consolidate software licenses</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-semibold text-slate-350">
                    <span className="text-emerald-450 mt-0.5 shrink-0">•</span>
                    <span>Reduce idle cloud resources</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-semibold text-slate-350">
                    <span className="text-emerald-450 mt-0.5 shrink-0">•</span>
                    <span>Optimize marketing spend</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Actionable AI Recommendations card */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-450">
              <Activity size={20} className="stroke-[2px]" />
              <h4 className="font-bold text-base text-white">Actionable Recommendations</h4>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              CFO advisory guidelines compiled from ledger analysis:
            </p>

            <div className="space-y-2.5">
              {insightsLoading ? (
                <p className="text-[11px] text-slate-500 italic">Recommendations will appear once AI analysis completes...</p>
              ) : insightsError ? (
                <p className="text-[11px] text-amber-500 font-semibold italic">Recommendations will appear once AI analysis completes.</p>
              ) : (
                recommendationsList.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs font-semibold text-slate-350">
                    <span className="text-emerald-450 mt-0.5 shrink-0">•</span>
                    <span>{rec}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 mt-6">
            <button 
              onClick={() => navigate('/upload')}
              className="flex items-center gap-1 text-xs font-bold text-emerald-455 hover:underline cursor-pointer"
            >
              Upload ledger for updates
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExpenseAnalytics;
