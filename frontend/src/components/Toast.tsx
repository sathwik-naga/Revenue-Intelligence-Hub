import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

interface ToastItem {
  id: string;
  type: string;
  message: string;
}

interface ToastProps {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => {
          let bgColor = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800';
          let textColor = 'text-slate-800 dark:text-slate-200';
          let Icon = Info;
          let iconColor = 'text-primary-500';

          switch (toast.type) {
            case 'success':
              bgColor = 'bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-950/30';
              iconColor = 'text-emerald-500';
              Icon = CheckCircle;
              break;
            case 'error':
              bgColor = 'bg-white dark:bg-slate-900 border-rose-100 dark:border-rose-950/30';
              iconColor = 'text-rose-500';
              Icon = XCircle;
              break;
            case 'warning':
              bgColor = 'bg-white dark:bg-slate-900 border-amber-100 dark:border-amber-950/30';
              iconColor = 'text-amber-500';
              Icon = AlertTriangle;
              break;
          }

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg glass-panel ${bgColor} ${textColor}`}
            >
              <div className={`mt-0.5 shrink-0 ${iconColor}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 text-sm font-medium pr-1 leading-relaxed">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
