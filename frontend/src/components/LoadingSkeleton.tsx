import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="glass-panel animate-pulse space-y-4 rounded-[24px] p-6">
      <div className="flex items-center justify-between">
        <div className="h-4 w-1/3 rounded-full bg-white/10" />
        <div className="h-10 w-10 rounded-2xl bg-white/10" />
      </div>
      <div className="h-8 w-1/2 rounded-full bg-white/10" />
      <div className="flex items-center justify-between pt-2">
        <div className="h-4 w-1/4 rounded-full bg-white/10" />
        <div className="h-8 w-1/3 rounded-full bg-white/10" />
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="glass-panel animate-pulse space-y-6 rounded-[24px] p-6">
      <div className="h-4 w-1/4 rounded-full bg-white/10" />
      <div className="flex h-64 items-end justify-between gap-2 rounded-[24px] border border-white/10 bg-white/5 p-4">
        <div className="h-12 w-full rounded-t-[16px] bg-white/10" />
        <div className="h-24 w-full rounded-t-[16px] bg-white/10" />
        <div className="h-40 w-full rounded-t-[16px] bg-white/10" />
        <div className="h-16 w-full rounded-t-[16px] bg-white/10" />
        <div className="h-32 w-full rounded-t-[16px] bg-white/10" />
        <div className="h-48 w-full rounded-t-[16px] bg-white/10" />
        <div className="h-28 w-full rounded-t-[16px] bg-white/10" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div className="glass-panel animate-pulse space-y-4 rounded-[24px] p-6">
      <div className="flex items-center justify-between pb-2">
        <div className="h-5 w-1/4 rounded-full bg-white/10" />
        <div className="h-8 w-20 rounded-full bg-white/10" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between border-b border-white/10 py-2">
            <div className="h-4 w-1/5 rounded-full bg-white/10" />
            <div className="h-4 w-1/4 rounded-full bg-white/10" />
            <div className="h-4 w-1/6 rounded-full bg-white/10" />
            <div className="h-4 w-12 rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-36 animate-pulse rounded-full bg-white/10" />
          <div className="h-4 w-52 animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="h-10 w-28 animate-pulse rounded-2xl bg-white/10" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
