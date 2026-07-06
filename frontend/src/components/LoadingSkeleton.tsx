import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 rounded-2xl animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
      <div className="h-8 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 rounded-2xl animate-pulse space-y-6">
      <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-end justify-between p-4 gap-2">
        <div className="h-12 w-full bg-slate-300 dark:bg-slate-700 rounded-t" />
        <div className="h-24 w-full bg-slate-300 dark:bg-slate-700 rounded-t" />
        <div className="h-40 w-full bg-slate-300 dark:bg-slate-700 rounded-t" />
        <div className="h-16 w-full bg-slate-300 dark:bg-slate-700 rounded-t" />
        <div className="h-32 w-full bg-slate-300 dark:bg-slate-700 rounded-t" />
        <div className="h-48 w-full bg-slate-300 dark:bg-slate-700 rounded-t" />
        <div className="h-28 w-full bg-slate-300 dark:bg-slate-700 rounded-t" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 rounded-2xl animate-pulse space-y-4">
      <div className="flex justify-between items-center pb-2">
        <div className="h-5 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="h-4 w-1/5 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-1/6 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-6 w-36 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-52 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <div>
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
};
export default SkeletonPage;
