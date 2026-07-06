import React from 'react';
import { Database, Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<any>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = Database
}) => {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/10 backdrop-blur-sm rounded-2xl p-12 text-center max-w-lg mx-auto my-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-2xl mb-4">
        <Icon size={32} className="stroke-[1.5px]" />
      </div>
      
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 max-w-sm">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow"
        >
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
export default EmptyState;
