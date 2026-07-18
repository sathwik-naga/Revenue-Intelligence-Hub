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
    <div className="glass-panel mx-auto my-6 flex max-w-xl flex-col items-center justify-center rounded-[32px] p-12 text-center">
      <div className="mb-5 rounded-[24px] border border-white/10 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 p-4 text-cyan-300">
        <Icon size={30} />
      </div>
      <h3 className="text-xl font-semibold text-slate-50">{title}</h3>
      <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">{description}</p>

      {actionLabel && onAction && (
        <button onClick={onAction} className="premium-button mt-6">
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
