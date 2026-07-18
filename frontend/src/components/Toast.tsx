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
    <div className="fixed bottom-5 right-5 z-50 flex w-full max-w-sm flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          let bgColor = 'border-white/10 bg-slate-950/80';
          let textColor = 'text-slate-100';
          let Icon = Info;
          let iconColor = 'text-blue-300';

          switch (toast.type) {
            case 'success':
              bgColor = 'border-emerald-400/20 bg-emerald-500/10';
              iconColor = 'text-emerald-300';
              Icon = CheckCircle;
              break;
            case 'error':
              bgColor = 'border-rose-400/20 bg-rose-500/10';
              iconColor = 'text-rose-300';
              Icon = XCircle;
              break;
            case 'warning':
              bgColor = 'border-amber-400/20 bg-amber-500/10';
              iconColor = 'text-amber-300';
              Icon = AlertTriangle;
              break;
          }

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-start gap-3 rounded-[24px] border p-4 shadow-[0_20px_60px_rgba(2,6,23,0.35)] backdrop-blur-2xl ${bgColor} ${textColor}`}
            >
              <div className={`mt-0.5 shrink-0 ${iconColor}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 pr-1 text-sm font-medium leading-relaxed">{toast.message}</div>
              <button onClick={() => removeToast(toast.id)} className="shrink-0 rounded-lg p-0.5 text-slate-400 transition hover:bg-white/10 hover:text-slate-100">
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
