import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  percentageChange?: number;
  isPositive?: boolean;
  trendData?: number[];
  icon: LucideIcon;
  color?: 'primary' | 'success' | 'danger' | 'warning';
  subtext?: string;
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  percentageChange,
  isPositive = true,
  trendData,
  icon: Icon,
  color = 'primary',
  subtext,
  loading = false
}) => {
  const colorMap = {
    primary: {
      bg: 'from-blue-500/20 to-cyan-400/20',
      text: 'text-blue-200',
      spark: '#3b82f6'
    },
    success: {
      bg: 'from-emerald-500/20 to-green-400/20',
      text: 'text-emerald-200',
      spark: '#10b981'
    },
    danger: {
      bg: 'from-rose-500/20 to-orange-400/20',
      text: 'text-rose-200',
      spark: '#ef4444'
    },
    warning: {
      bg: 'from-amber-500/20 to-yellow-400/20',
      text: 'text-amber-200',
      spark: '#f59e0b'
    }
  };

  const activeColors = colorMap[color];
  const chartData = trendData ? trendData.map((val, idx) => ({ id: idx, value: val })) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3 }}
      className="glass-panel relative overflow-hidden rounded-[24px] p-6"
    >
      <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${activeColors.bg}`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">{title}</p>
          {loading ? (
            <div className="mt-3 h-9 w-28 animate-pulse rounded-2xl bg-white/10" />
          ) : (
            <h3 className="mt-2 text-3xl font-semibold tracking-tight text-slate-50">{value}</h3>
          )}
        </div>
        <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${activeColors.bg} p-3 ${activeColors.text}`}>
          <Icon size={20} />
        </div>
      </div>

      <div className="relative mt-6 flex items-end justify-between gap-3">
        <div className="space-y-2">
          {percentageChange !== undefined && (
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 text-xs font-semibold ${isPositive ? 'bg-emerald-500/12 text-emerald-300' : 'bg-rose-500/12 text-rose-300'}`}>
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isPositive ? '+' : ''}
                {percentageChange.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500">vs last month</span>
            </div>
          )}
          {subtext && !percentageChange && <span className="text-xs text-slate-500">{subtext}</span>}
        </div>

        {trendData && trendData.length > 0 && (
          <div className="h-10 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line type="monotone" dataKey="value" stroke={activeColors.spark} strokeWidth={2.5} dot={false} isAnimationActive />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
