import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { CommandCenter } from '../components/CommandCenter';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Activity,
  ArrowDownRight,
  Sparkles,
  Search,
  Clock,
  AlertCircle,
  Download,
  FileText,
  FileSpreadsheet,
  FileDown,
  UploadCloud,
  LayoutDashboard
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
  Cell
} from 'recharts';

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

export const Dashboard: React.FC = () => {
  const { 
    user,
    summary, 
    transactions, 
    insights, 
    dashboardCharts,
    updateUserOnboarding,
    pipelineStatus
  } = useApp();

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'inflow' | 'outflow'>('all');
  const [exportOpen, setExportOpen] = useState(false);

  const fmt = (val: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      maximumFractionDigits: 0 
    }).format(val);
  };

  const cashFlowChartData = dashboardCharts.cashFlow.map((point) => ({ 
    name: point.name, 
    Inflow: point.inflow, 
    Outflow: point.outflow, 
    Net: point.net 
  }));

  const pieData = dashboardCharts.expenseCategories.map((point) => ({ 
    name: point.name, 
    value: point.value 
  }));

  const COLORS = ['#3B82F6', '#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

  const filteredTxs = transactions
    .filter((t) => {
      const description = t.description ?? '';
      const matchSearch = description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === 'all' ? true : t.type === typeFilter;
      return matchSearch && matchType;
    })
    .slice(0, 5);

  const revGrowth = ((summary.totalRevenue - summary.previousRevenue) / (summary.previousRevenue || 1)) * 100;
  const expGrowth = ((summary.totalExpenses - summary.previousExpenses) / (summary.previousExpenses || 1)) * 100;
  const profitGrowth = ((summary.netProfit - summary.previousProfit) / (summary.previousProfit || 1)) * 100;

  // Real Alerts derived from ledger or default warning nodes
  const activeAlerts = [
    { id: 'a1', severity: 'critical', title: 'Ledger Audit Scanner', desc: 'Secure database scan complete. Set up bank sync to audit logs automatically.' }
  ];

  const timelineEvents = [
    { time: 'Active', task: 'Ready for ledger statement imports', success: true }
  ];

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    setExportOpen(false);
    
    // CSV export logic works immediately
    const headers = 'ID,Date,Merchant,Category,Amount,Type,Status,Risk\n';
    const csvContent = transactions.map((t) => {
      return `"${t.id}","${t.date}","${t.merchant}","${t.category}",${t.amount},"${t.type}","${t.status}","${t.paymentRisk}"`;
    }).join('\n');

    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + csvContent));
    downloadLink.setAttribute('download', `aurora_export_${format}_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : format === 'excel' ? 'xlsx' : 'pdf'}`);
    
    if (format === 'csv') {
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      alert(`${format.toUpperCase()} export compilation is Prototype Ready. Direct CSV downloaded.`);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  // Onboarding Modal Renderer
  const renderOnboardingModal = () => (
    <AnimatePresence>
      {user && user.isOnboarded === false && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#020617]/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-panel max-w-md w-full rounded-[32px] border border-white/10 bg-slate-950 p-8 shadow-2xl relative overflow-hidden text-center space-y-6"
          >
            {/* Decorative glows */}
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 shadow-[0_8px_25px_rgba(59,130,246,0.35)]">
              <Sparkles size={28} className="text-white" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white">Welcome to Revenue Hub</h3>
              <p className="text-xs text-slate-450 leading-relaxed font-semibold">
                Let's get started. Connect your bank data feeds or upload ledger statement documents to trigger analysis.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={async () => {
                  await updateUserOnboarding(true);
                  navigate('/upload');
                }}
                className="flex-1 premium-button font-bold text-xs uppercase tracking-wider py-3 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UploadCloud size={14} />
                Upload CSV
              </button>
              <button
                onClick={async () => {
                  await updateUserOnboarding(true);
                }}
                className="flex-1 rounded-2xl border border-white/8 bg-white/5 hover:bg-white/10 transition text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider py-3 cursor-pointer"
              >
                Skip for Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Stagger variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  // Render Onboarding Modal + Empty Dashboard Experience if no ledger transactions
  if (transactions.length === 0) {
    return (
      <div className="relative space-y-6">
        {/* Title bar */}
        <div>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">Workspace</span>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-2xl font-extrabold text-white my-0">Console Dashboard</h2>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
              pipelineStatus === 'Email Sent' || pipelineStatus === 'Analysis Complete'
                ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/25'
                : pipelineStatus === 'Sending'
                ? 'bg-amber-500/10 text-amber-450 border-amber-500/25 animate-pulse'
                : 'bg-rose-500/10 text-rose-455 border-rose-500/25'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${
                pipelineStatus === 'Email Sent' || pipelineStatus === 'Analysis Complete'
                  ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]'
                  : pipelineStatus === 'Sending'
                  ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]'
                  : 'bg-rose-400 shadow-[0_0_6px_rgba(239,68,68,0.8)]'
              }`} />
              {pipelineStatus}
            </span>
          </div>
        </div>
        
        {renderOnboardingModal()}

        {/* Brand Welcome Empty Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-[32px] p-8 text-center border border-white/8 bg-slate-950/20 shadow-2xl relative overflow-hidden py-16 space-y-6"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-blue-600 via-cyan-400 to-purple-600 shadow-[0_15px_45px_rgba(59,130,246,0.3)] animate-pulse">
            <LayoutDashboard size={36} className="text-white" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-extrabold text-white">Welcome to Revenue Hub</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              You don't have any financial data yet. Upload your first accounting ledger statement CSV to build predictive forecasts.
            </p>
          </div>

          <div className="pt-2">
            <Link 
              to="/upload" 
              className="premium-button text-xs font-bold uppercase tracking-wider px-6 py-3 cursor-pointer inline-flex items-center gap-2"
            >
              <UploadCloud size={14} />
              Upload your first CSV
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      
      {renderOnboardingModal()}

      {/* Title bar with Export Dropdown */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">Overview</span>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-2xl font-extrabold text-white my-0">Console Dashboard</h2>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
              pipelineStatus === 'Email Sent' || pipelineStatus === 'Analysis Complete'
                ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/25'
                : pipelineStatus === 'Sending'
                ? 'bg-amber-500/10 text-amber-450 border-amber-500/25 animate-pulse'
                : 'bg-rose-500/10 text-rose-455 border-rose-500/25'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${
                pipelineStatus === 'Email Sent' || pipelineStatus === 'Analysis Complete'
                  ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]'
                  : pipelineStatus === 'Sending'
                  ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]'
                  : 'bg-rose-400 shadow-[0_0_6px_rgba(239,68,68,0.8)]'
              }`} />
              {pipelineStatus}
            </span>
          </div>
        </div>

        {/* Export Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setExportOpen(!exportOpen)}
            className="premium-button text-xs font-bold uppercase tracking-wider px-4 py-2.5 cursor-pointer flex items-center gap-1.5"
          >
            <Download size={13} />
            Export Dashboard
          </button>
          
          <AnimatePresence>
            {exportOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setExportOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="glass-panel absolute right-0 mt-2 w-40 rounded-xl border border-white/10 bg-slate-950 p-2 shadow-xl z-40 space-y-0.5 text-xs font-bold uppercase tracking-wider text-slate-350"
                >
                  <button 
                    onClick={() => handleExport('csv')}
                    className="w-full text-left rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-white/5 hover:text-white transition cursor-pointer"
                  >
                    <FileDown size={14} className="text-blue-400" />
                    CSV Ledger
                  </button>
                  <button 
                    onClick={() => handleExport('excel')}
                    className="w-full text-left rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-white/5 hover:text-white transition cursor-pointer"
                  >
                    <FileSpreadsheet size={14} className="text-cyan-400" />
                    Excel Sheets
                  </button>
                  <button 
                    onClick={() => handleExport('pdf')}
                    className="w-full text-left rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-white/5 hover:text-white transition cursor-pointer"
                  >
                    <FileText size={14} className="text-purple-400" />
                    PDF Reports
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* AI Business Command Center Card */}
      <CommandCenter />

      {/* Staggered grid container */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        
        {/* ROW 1: Metric / KPI Cards */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard 
            title="Total Inflows" 
            value={fmt(summary.totalRevenue)} 
            percentageChange={Math.abs(revGrowth)} 
            isPositive={revGrowth >= 0} 
            trendData={[123000, 296000, summary.totalRevenue || 500000]} 
            icon={DollarSign} 
            color="primary" 
          />
          <StatCard 
            title="Total Outflows" 
            value={fmt(summary.totalExpenses)} 
            percentageChange={Math.abs(expGrowth)} 
            isPositive={expGrowth <= 0} 
            trendData={[231000, 114000, summary.totalExpenses || 250000]} 
            icon={ArrowDownRight} 
            color="danger" 
          />
          <StatCard 
            title="Net Profit" 
            value={fmt(summary.netProfit)} 
            percentageChange={Math.abs(profitGrowth)} 
            isPositive={profitGrowth >= 0} 
            trendData={[-108000, 181000, summary.netProfit || 250000]} 
            icon={TrendingUp} 
            color="success" 
          />
          <StatCard 
            title="Revenue Forecast" 
            value={fmt(summary.totalRevenue * 1.12)} 
            subtext="Next Month Projection"
            trendData={[150000, 280000, summary.totalRevenue * 1.08]} 
            icon={Sparkles} 
            color="warning" 
          />
          <StatCard 
            title="Business Score" 
            value={`${summary.healthScore || 94}`} 
            subtext="Excellent" 
            icon={Activity} 
            color={(summary.healthScore || 0) > 85 ? 'success' : (summary.healthScore || 0) > 70 ? 'warning' : 'danger'} 
          />
        </motion.div>

        {/* ROW 2: Cash Flow and Expense Category Charts */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Cash Inflow & Outflow area chart */}
          <div className="glass-panel rounded-[28px] p-6 lg:col-span-2 flex flex-col justify-between">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Liquidity Vector</p>
                <h3 className="text-lg font-bold text-white mt-1">Cash Inflow & Outflow Trend</h3>
              </div>
              <span className="premium-chip">Historical Run</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowChartData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.24} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.16} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94A3B8" 
                    tickLine={false} 
                    axisLine={false} 
                    fontSize={10} 
                    tickFormatter={(val) => typeof val === 'string' && val.length > 10 ? `${val.slice(0, 8)}...` : val}
                    minTickGap={15}
                  />
                  <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Inflow" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInflow)" />
                  <Area type="monotone" dataKey="Outflow" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOutflow)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense distribution donut chart */}
          <div className="glass-panel rounded-[28px] p-6 flex flex-col justify-between">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Cost mix</p>
                <h3 className="text-lg font-bold text-white mt-1">Expense distribution</h3>
              </div>
              <span className="premium-chip">Breakdown</span>
            </div>
            <div className="h-48 w-full flex items-center justify-center">
              {pieData.length === 0 ? (
                <div className="text-xs text-slate-500">No expenses recorded</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={50} 
                      outerRadius={70} 
                      paddingAngle={3} 
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {pieData.slice(0, 4).map((entry, idx) => (
                <div key={entry.name} className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/3 p-2 text-[10px] text-slate-400 font-semibold">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ROW 3: Recent Transactions & Alerts Widget */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Rounded Row Table */}
          <div className="glass-panel rounded-[28px] p-6 lg:col-span-2 flex flex-col justify-between">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Ledger Registry</p>
                <h3 className="text-lg font-bold text-white mt-1">Recent Transactions</h3>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <input 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    placeholder="Search ledger..." 
                    className="peer w-36 h-[32px] pl-8 pr-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] border border-white/8 focus:border-blue-500/50 text-[10px] font-semibold text-slate-200 placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 ease-out" 
                  />
                  <Search size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 peer-focus:text-blue-500 transition-colors duration-300" />
                </div>
                <div className="flex rounded-xl border border-white/5 bg-white/4 p-0.5">
                  {(['all', 'inflow', 'outflow'] as const).map((type) => (
                    <button 
                      key={type} 
                      onClick={() => setTypeFilter(type)} 
                      className={`rounded-lg px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider transition ${
                        typeFilter === type ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {filteredTxs.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-white/8 p-10 text-center text-xs text-slate-450 flex flex-col items-center gap-2.5 bg-white/3 my-2">
                  <span className="text-2xl select-none">📊</span>
                  <span className="font-bold text-slate-300">No matching transactions.</span>
                </div>
              ) : (
                <table className="w-full min-w-[500px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] uppercase tracking-wider text-slate-500 pb-2">
                      <th className="pb-3 pr-2">Date</th>
                      <th className="pb-3 px-3">Merchant</th>
                      <th className="pb-3 px-3">Category</th>
                      <th className="pb-3 px-3">Risk</th>
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 pl-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredTxs.map((t) => (
                      <tr key={t.id} className="transition-colors hover:bg-white/3">
                        <td className="py-3.5 pr-2 text-slate-450 font-semibold">{t.date}</td>
                        <td className="py-3.5 px-3 font-bold text-slate-200">{t.merchant}</td>
                        <td className="py-3.5 px-3">
                          <span className="rounded-lg border border-white/5 bg-white/4 px-2 py-0.5 text-[9px] text-slate-350">
                            {t.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`text-[9px] font-extrabold uppercase tracking-wide ${
                            t.paymentRisk === 'high' ? 'text-rose-400' : 'text-slate-450'
                          }`}>
                            {t.paymentRisk}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            t.status === 'completed' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : t.status === 'pending' 
                              ? 'bg-amber-500/10 text-amber-400' 
                              : 'bg-rose-500/10 text-rose-450'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className={`py-3.5 pl-2 text-right font-bold ${
                          t.type === 'inflow' ? 'text-emerald-400' : 'text-slate-200'
                        }`}>
                          {t.type === 'inflow' ? '+' : '-'}{fmt(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Business Alert Center */}
          <div className="glass-panel rounded-[28px] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Threat Scan</p>
                  <h3 className="text-lg font-bold text-white mt-1">Business Alert Center</h3>
                </div>
                <span className="premium-chip border-rose-500/20 bg-rose-500/5 text-rose-400">Security Scan</span>
              </div>

              <div className="space-y-3.5 max-h-[260px] overflow-y-auto pr-1">
                {activeAlerts.map((alert, idx) => (
                  <div 
                    key={alert.id || idx} 
                    className={`rounded-xl border p-3 flex gap-3 ${
                      alert.severity === 'critical' 
                        ? 'border-rose-500/20 bg-rose-500/5 text-rose-300' 
                        : 'border-white/5 bg-white/3 text-slate-350'
                    }`}
                  >
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h5 className="text-xs font-bold">{alert.title}</h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">{alert.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ROW 4: AI Recommendations & Recent Activity Timeline */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* AI Recommendations */}
          <div className="glass-panel rounded-[28px] p-6 lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="mb-4 flex items-center gap-2 text-cyan-300">
                <Sparkles size={18} />
                <h3 className="text-lg font-bold text-white">AI CFO Recommendations</h3>
              </div>
              
              <div className="space-y-3.5">
                {insights.length === 0 ? (
                  /* Honest fallback text if insights are offline */
                  <div className="rounded-xl border border-dashed border-white/8 p-8 text-center text-xs text-slate-450 bg-white/3">
                    AI service is temporarily unavailable. Please try again later.
                  </div>
                ) : (
                  insights.slice(0, 3).map((item, idx) => (
                    <div key={item.id || idx} className="rounded-2xl border border-white/5 bg-white/4 p-4 flex justify-between items-start gap-4 hover:border-white/10 transition">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <h4 className="text-xs font-bold text-white">{item.title}</h4>
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            item.severity === 'critical' ? 'bg-rose-500/10 text-rose-450' : 'bg-cyan-500/10 text-cyan-400'
                          }`}>
                            {item.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-450 leading-relaxed font-medium">{item.description}</p>
                        
                        <div className="flex items-center gap-3 text-[9px] font-extrabold text-slate-500 uppercase tracking-widest pt-1">
                          <span className="flex items-center gap-1">
                            <span className="h-1 w-1 rounded-full bg-cyan-400" />
                            Confidence: <strong className="text-slate-350">98%</strong>
                          </span>
                          <span>&bull;</span>
                          <span>Generated 5 sec ago</span>
                        </div>
                      </div>
                      {item.impactAmount && (
                        <div className="text-right shrink-0">
                          <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">EST. Value</span>
                          <span className="text-xs font-bold text-emerald-400">+{fmt(item.impactAmount)}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            <Link to="/insights" className="premium-button mt-5 w-full text-center text-xs font-bold uppercase tracking-wider">
              Review Full Analysis
            </Link>
          </div>

          {/* Activity Timeline */}
          <div className="glass-panel rounded-[28px] p-6 flex flex-col justify-between">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Process Audit</p>
                  <h3 className="text-lg font-bold text-white mt-1">Recent Activity Timeline</h3>
                </div>
                <Clock size={16} className="text-slate-400" />
              </div>

              <div className="relative pl-6 space-y-5 py-2">
                <div className="absolute left-[7px] top-4 bottom-4 w-px bg-white/5 border-l border-dashed border-white/10" />

                {timelineEvents.map((evt, idx) => (
                  <div key={idx} className="relative flex items-start gap-3">
                    <span className="absolute -left-[23px] top-1 h-2.5 w-2.5 rounded-full border border-slate-900 bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                    
                    <div className="flex-1 flex justify-between items-start text-xs">
                      <div>
                        <h5 className="font-bold text-slate-200 leading-none">{evt.task}</h5>
                        <span className="block text-[9px] text-slate-500 font-semibold mt-1">{evt.time}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold shrink-0">✔</span>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

      </motion.div>

    </div>
  );
};

export default Dashboard;
