import React from 'react';
import { useApp } from '../context/AppContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { TrendingUp, ArrowUpRight, Award } from 'lucide-react';

export const RevenueAnalytics: React.FC = () => {
  const { summary, transactions } = useApp();

  const fmt = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Compile monthly revenue growth
  const monthlyRevenueData = [
    { month: 'May', revenue: 12300, growth: 0 },
    { month: 'June', revenue: 29600, growth: 140 },
    { month: 'July', revenue: summary.totalRevenue || 23650, growth: -20 }
  ];

  // Inflow categories breakdown
  const inflowTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'inflow' && t.status === 'completed')
    .forEach((t) => {
      inflowTotals[t.category] = (inflowTotals[t.category] || 0) + t.amount;
    });

  const categoryData = Object.entries(inflowTotals).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6'];

  // Top Customers Contribution List
  const customerTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'inflow' && t.status === 'completed')
    .forEach((t) => {
      customerTotals[t.merchant] = (customerTotals[t.merchant] || 0) + t.amount;
    });

  const customerList = Object.entries(customerTotals)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: summary.totalRevenue > 0 ? (amount / summary.totalRevenue) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight my-0">
          Revenue Analytics
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Detailed breakdown of transaction channels, growth curves, and client concentration.
        </p>
      </div>

      {/* Analytics Main Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Monthly Growth Vector</h4>
              <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Aggregated Monthly Receipts</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-xl">
              <TrendingUp size={14} />
              +28% average QoQ
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip formatter={(v) => fmt(Number(v))} />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stream distribution Bar chart */}
        <div className="border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">Revenue Channels</h4>
            <div className="h-56 w-full">
              {categoryData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">No data found</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical">
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} hide />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={75} tickLine={false} />
                    <Tooltip formatter={(v) => fmt(Number(v))} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Top Channel</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 block mt-1">
              {categoryData.sort((a,b)=>b.value-a.value)[0]?.name || 'N/A'} - {fmt(categoryData.sort((a,b)=>b.value-a.value)[0]?.value || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Concentration Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer concentration list */}
        <div className="lg:col-span-2 border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-sm">
          <h4 className="font-bold text-base text-slate-900 dark:text-white pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">Revenue Contribution by Client</h4>
          
          <div className="space-y-4">
            {customerList.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No client data found</div>
            ) : (
              customerList.map((cust, idx) => (
                <div key={cust.name} className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 text-xs font-bold rounded flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-slate-800 dark:text-slate-200">{cust.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-900 dark:text-white font-bold">{fmt(cust.amount)}</span>
                      <span className="text-xs text-slate-400 ml-2">({cust.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                      style={{ width: `${cust.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Concentrated Risk analysis Card */}
        <div className="border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Award size={20} className="stroke-[2px]" />
              <h4 className="font-bold text-base">Concentration Risk Assessment</h4>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              In modern corporate finance, having a single client contribute more than **20%** of gross inflows triggers account reliance exposure.
            </p>
            
            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/55 dark:border-amber-900/20 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Risk Level</span>
              <span className="text-sm font-extrabold text-amber-800 dark:text-amber-400 block">
                {customerList[0]?.percentage > 35 ? 'HIGH CONCENTRATION RISK' : 'MEDIUM RISK'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed block mt-1">
                Your top client contributors account for **{customerList[0]?.percentage.toFixed(0)}%** of gross cash flows.
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
            <button className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-450 hover:underline">
              AI Diversification Strategy
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RevenueAnalytics;
