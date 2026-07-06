import React, { useState } from 'react';
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
import { ShieldAlert, TrendingDown, ArrowUpRight, DollarSign } from 'lucide-react';

export const ExpenseAnalytics: React.FC = () => {
  const { summary, transactions, insights } = useApp();
  const [activeIndex, setActiveIndex] = useState(-1);

  const fmt = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight my-0">
          Expense Analytics
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Monitor operating cash outflows, category percentages, and expense anomalies.
        </p>
      </div>

      {/* Main Breakdown Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Pie Chart */}
        <div className="border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-sm">
          <h4 className="font-bold text-base text-slate-900 dark:text-white pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">Operating Budget Distribution</h4>
          
          <div className="h-64 w-full flex items-center justify-center">
            {pieData.length === 0 ? (
              <div className="text-xs text-slate-450">No expenses captured</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    {...({
                      activeIndex,
                      activeShape: { stroke: '#3b82f6', strokeWidth: 2 },
                      data: pieData,
                      cx: "50%",
                      cy: "50%",
                      innerRadius: 60,
                      outerRadius: 80,
                      paddingAngle: 3,
                      dataKey: "value",
                      onMouseEnter: (_: any, index: number) => setActiveIndex(index),
                      onMouseLeave: () => setActiveIndex(-1)
                    } as any)}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-2 mt-4 max-h-32 overflow-y-auto pr-1">
            {pieData.map((entry, idx) => (
              <div key={entry.name} className="flex justify-between items-center text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-slate-850 dark:text-slate-350">{entry.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-900 dark:text-white font-bold">{fmt(entry.value)}</span>
                  <span className="text-slate-400 ml-1.5">({entry.percentage.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stacked Category Trends Bar Chart */}
        <div className="lg:col-span-2 border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-sm">
          <h4 className="font-bold text-base text-slate-900 dark:text-white pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">Monthly Category Outflow Velocity</h4>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCategoryExpenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip formatter={(v) => fmt(Number(v))} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '600' }} />
                <Bar dataKey="Infrastructure" stackId="a" fill="#2563EB" />
                <Bar dataKey="Software" stackId="a" fill="#10B981" />
                <Bar dataKey="Marketing" stackId="a" fill="#F59E0B" />
                <Bar dataKey="Salaries" stackId="a" fill="#8B5CF6" />
                <Bar dataKey="Legal" stackId="a" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Anomaly & Risk detection panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outlier warnings list */}
        <div className="lg:col-span-2 border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-rose-600 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <ShieldAlert size={20} className="stroke-[2px]" />
            <h4 className="font-bold text-base">Cost Anomalies & Outliers</h4>
          </div>

          <div className="space-y-4">
            {anomalyWarnings.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No anomalies detected in current billing cycles.</div>
            ) : (
              anomalyWarnings.map((warn) => (
                <div
                  key={warn.id}
                  className="flex items-start justify-between gap-4 p-4 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100/55 dark:border-rose-900/25 rounded-xl"
                >
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-rose-800 dark:text-rose-400">{warn.title}</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {warn.description}
                    </p>
                  </div>
                  {warn.impactAmount && (
                    <div className="text-right shrink-0">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Est. Leakage</span>
                      <span className="text-base font-extrabold text-rose-600 dark:text-rose-400">{fmt(warn.impactAmount)}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Optimizations panel card */}
        <div className="border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-450">
              <TrendingDown size={20} className="stroke-[2px]" />
              <h4 className="font-bold text-base">Cost Reduction Target</h4>
            </div>

            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
              We identified cost-reduction optimizations across cloud hosting and active contract payments.
            </p>

            <div className="flex items-center gap-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20 rounded-xl">
              <div className="p-2 bg-emerald-500 text-white rounded-lg">
                <DollarSign size={16} />
              </div>
              <div>
                <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Identified savings</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{fmt(2650)}/yr</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
            <button className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-450 hover:underline">
              Review optimization suggestions
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ExpenseAnalytics;
