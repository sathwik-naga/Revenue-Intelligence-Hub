import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Activity,
  ArrowDownRight,
  AlertCircle,
  BrainCircuit,
  Search,
  ChevronRight,
  Building2,
  Tag
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { summary, transactions, insights } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'inflow' | 'outflow'>('all');

  // Format currency
  const fmt = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Compile monthly Cash Flow chart data
  const cashFlowChartData = [
    { name: 'May', Inflow: 12300, Outflow: 23150, Net: -10850 },
    { name: 'June', Inflow: 29600, Outflow: 11420, Net: 18180 },
    { name: 'July', Inflow: summary.totalRevenue || 23650, Outflow: summary.totalExpenses || 5060, Net: (summary.totalRevenue - summary.totalExpenses) || 18590 }
  ];

  // Compile forecast chart data
  const forecastChartData = [
    { name: 'May', Actual: 12300, Forecast: 12300 },
    { name: 'June', Actual: 29600, Forecast: 29600 },
    { name: 'July', Actual: summary.totalRevenue || 23650, Forecast: summary.totalRevenue || 23650 },
    { name: 'Aug (F)', Actual: null, Forecast: (summary.totalRevenue / 3) * 1.05 || 26500 },
    { name: 'Sep (F)', Actual: null, Forecast: (summary.totalRevenue / 3) * 1.11 || 28200 },
    { name: 'Oct (F)', Actual: null, Forecast: (summary.totalRevenue / 3) * 1.18 || 30100 }
  ];

  // Compile expense pie chart data
  const expenseTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'outflow' && t.status === 'completed')
    .forEach((t) => {
      expenseTotals[t.category] = (expenseTotals[t.category] || 0) + t.amount;
    });

  const pieData = Object.entries(expenseTotals).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#64748B'];

  // Filter transaction list
  const filteredTxs = transactions
    .filter((t) => {
      const matchSearch =
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchType = typeFilter === 'all' ? true : t.type === typeFilter;
      return matchSearch && matchType;
    })
    .slice(0, 5); // top 5 items for dashboard preview

  // Growth rates (compared to simulated past periods)
  const revGrowth = ((summary.totalRevenue - summary.previousRevenue) / (summary.previousRevenue || 1)) * 100;
  const expGrowth = ((summary.totalExpenses - summary.previousExpenses) / (summary.previousExpenses || 1)) * 100;
  const profitGrowth = ((summary.netProfit - summary.previousProfit) / (summary.previousProfit || 1)) * 100;

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Heading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight my-0">
            Financial Dashboard
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Real-time SME revenue intelligence and cash flow runways.
          </p>
        </div>
        <Link
          to="/upload"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/10 transition-all flex items-center gap-2"
        >
          <UploadCloudIcon className="h-4 w-4" />
          Upload Ledger CSV
        </Link>
      </div>

      {/* 2. Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Inflows"
          value={fmt(summary.totalRevenue)}
          percentageChange={Math.abs(revGrowth)}
          isPositive={revGrowth >= 0}
          trendData={[12300, 29600, summary.totalRevenue]}
          icon={DollarSign}
          color="primary"
        />
        <StatCard
          title="Total Outflows"
          value={fmt(summary.totalExpenses)}
          percentageChange={Math.abs(expGrowth)}
          isPositive={expGrowth <= 0} // Expenses decreasing is positive
          trendData={[23150, 11420, summary.totalExpenses]}
          icon={ArrowDownRight}
          color="danger"
        />
        <StatCard
          title="Net Profit"
          value={fmt(summary.netProfit)}
          percentageChange={Math.abs(profitGrowth)}
          isPositive={profitGrowth >= 0}
          trendData={[-10850, 18180, summary.netProfit]}
          icon={TrendingUp}
          color="success"
        />
        <StatCard
          title="Business Health"
          value={`${summary.healthScore}/100`}
          subtext={`Cash Runway: ${summary.runwayMonths} months`}
          icon={Activity}
          color={summary.healthScore > 75 ? 'success' : summary.healthScore > 50 ? 'warning' : 'danger'}
        />
      </div>

      {/* 3. AI Alerts Banner (if critical) */}
      {insights.some(i => i.severity === 'critical') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-xl border border-rose-200/80 bg-rose-50/60 dark:bg-rose-950/15 dark:border-rose-900/30 text-rose-800 dark:text-rose-400"
        >
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <h4 className="font-bold text-sm">Critical Business Risks Detected</h4>
            <p className="text-xs text-rose-700/80 dark:text-rose-450 mt-1 leading-relaxed">
              Your runway is currently critical based on operational burn rates. Audit software licenses and infrastructure to extend buffer.
            </p>
          </div>
          <Link
            to="/insights"
            className="text-xs font-bold text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-0.5 whitespace-nowrap"
          >
            Solve Risks
            <ChevronRight size={14} />
          </Link>
        </motion.div>
      )}

      {/* 4. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Cash Flow Line Graph */}
        <div className="lg:col-span-2 border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Cash Inflow & Outflow</h4>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">3-Month History</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowChartData}>
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0f172a'
                  }}
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="Inflow" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInflow)" />
                <Area type="monotone" dataKey="Outflow" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOutflow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Distribution Donut */}
        <div className="border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Expense Distribution</h4>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Breakdown</span>
          </div>
          <div className="h-60 w-full flex justify-center">
            {pieData.length === 0 ? (
              <div className="flex items-center justify-center text-xs text-slate-400">No expenses recorded</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
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
          {/* Custom legend */}
          <div className="grid grid-cols-2 gap-2 mt-2 max-h-16 overflow-y-auto">
            {pieData.slice(0, 4).map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Forecast & Key Metrics section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forecast Graph preview */}
        <div className="lg:col-span-2 border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Revenue Forecast (Gemini Engine)</h4>
            <Link to="/insights" className="text-xs font-bold text-blue-600 dark:text-blue-450 hover:underline">Full Analysis</Link>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastChartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip formatter={(v) => fmt(Number(v))} />
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <Area type="monotone" dataKey="Actual" stroke="#3b82f6" strokeWidth={3} fill="#dbeafe" fillOpacity={0.15} />
                <Area type="monotone" dataKey="Forecast" stroke="#2563eb" strokeDasharray="5 5" strokeWidth={2.5} fill="#bfdbfe" fillOpacity={0.05} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Business details breakdown cards */}
        <div className="space-y-6">
          {/* Top Business metrics summary */}
          <div className="border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-sm">
            <h4 className="font-bold text-base text-slate-900 dark:text-white pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">Key Parameters</h4>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Building2 size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Top Customer</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{summary.topCustomer || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Tag size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Top Expense Category</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{summary.topExpenseCategory || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights quick sidebar panel */}
          <div className="border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <BrainCircuit size={20} className="stroke-[2px]" />
              <h4 className="font-bold text-base">Gemini Co-Pilot</h4>
            </div>
            <p className="text-xs text-blue-100/90 leading-relaxed mb-4">
              We parsed your accounts and detected 3 cost-saving suggestions and anomalies.
            </p>
            <Link
              to="/insights"
              className="inline-flex items-center justify-center w-full py-2 bg-white text-blue-600 text-xs font-bold rounded-xl shadow hover:bg-blue-50 transition-colors"
            >
              Ask AI Co-Pilot
            </Link>
          </div>
        </div>
      </div>

      {/* 6. Recent Transactions Table */}
      <div className="border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <h4 className="font-bold text-base text-slate-900 dark:text-white">Recent Transactions</h4>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-grow sm:flex-grow-0">
              <span className="absolute inset-y-0 left-2.5 flex items-center text-slate-400 pointer-events-none">
                <Search size={14} />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full sm:w-44 pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-855 bg-slate-50 dark:bg-slate-950/20 text-slate-850 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Inflow/Outflow filters */}
            <div className="flex rounded-xl border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-950/20 text-[10px] font-bold">
              {(['all', 'inflow', 'outflow'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1 rounded-lg uppercase tracking-wider transition-all ${
                    typeFilter === type
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-550 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table Body */}
        <div className="overflow-x-auto">
          {filteredTxs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No matching transactions found</div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 px-4">Merchant / Client</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Risk</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 pl-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredTxs.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors"
                  >
                    <td className="py-3.5 pr-4 text-xs font-semibold text-slate-550 dark:text-slate-450">{t.date}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">{t.merchant}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-655 dark:bg-slate-800/60 dark:text-slate-400">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider ${
                          t.paymentRisk === 'high'
                            ? 'text-rose-500'
                            : t.paymentRisk === 'medium'
                            ? 'text-amber-500'
                            : 'text-slate-450 dark:text-slate-550'
                        }`}
                      >
                        {t.paymentRisk}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          t.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450'
                            : t.status === 'pending'
                            ? 'bg-amber-55/60 text-amber-700 dark:bg-amber-950/20 dark:text-amber-450'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td
                      className={`py-3.5 pl-4 text-right font-bold text-sm ${
                        t.type === 'inflow' ? 'text-emerald-500' : 'text-slate-800 dark:text-white'
                      }`}
                    >
                      {t.type === 'inflow' ? '+' : '-'}{fmt(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

// Quick custom upload icon definition
const UploadCloudIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m15 15-3-3-3 3" />
  </svg>
);
export default Dashboard;
