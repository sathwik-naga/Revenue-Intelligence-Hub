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
  // Map color definitions
  const colorMap = {
    primary: {
      bg: 'bg-blue-50/50 dark:bg-blue-950/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/50',
      spark: '#3b82f6'
    },
    success: {
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/50',
      spark: '#10b981'
    },
    danger: {
      bg: 'bg-rose-50/50 dark:bg-rose-950/20',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-100 dark:border-rose-900/50',
      spark: '#ef4444'
    },
    warning: {
      bg: 'bg-amber-50/50 dark:bg-amber-950/20',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/50',
      spark: '#f59e0b'
    }
  };

  const activeColors = colorMap[color];

  // Format sparkline items
  const chartData = trendData ? trendData.map((val, idx) => ({ id: idx, value: val })) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 shadow-sm hover:shadow-md hover-card-trigger"
    >
      {/* Decorative colored glow */}
      <div className={`absolute top-0 right-0 h-24 w-24 rounded-bl-full opacity-[0.03] dark:opacity-[0.07] ${activeColors.bg}`} />

      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
            {title}
          </span>
          {loading ? (
            <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse mt-1" />
          ) : (
            <h3 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white mt-1">
              {value}
            </h3>
          )}
        </div>

        <div className={`p-3 rounded-xl ${activeColors.bg} ${activeColors.text}`}>
          <Icon size={20} className="stroke-[2px]" />
        </div>
      </div>

      <div className="flex justify-between items-end mt-6">
        <div className="space-y-1.5">
          {percentageChange !== undefined && (
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isPositive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                }`}
              >
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isPositive ? '+' : ''}
                {percentageChange.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">vs last month</span>
            </div>
          )}
          {subtext && !percentageChange && (
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 leading-none">
              {subtext}
            </span>
          )}
        </div>

        {/* Recharts Mini Sparkline */}
        {trendData && trendData.length > 0 && (
          <div className="h-10 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={activeColors.spark}
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
};
export default StatCard;
