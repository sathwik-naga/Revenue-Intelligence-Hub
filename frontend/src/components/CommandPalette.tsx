import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  LayoutDashboard, 
  TrendingUp, 
  ArrowDownRight, 
  UploadCloud, 
  FileSpreadsheet, 
  Settings, 
  X,
  Sparkles
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { name: 'Go to Dashboard', desc: 'Overview of business health and metrics', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Go to Revenue Analytics', desc: 'Inflow margins and client receivables', path: '/revenue', icon: TrendingUp },
    { name: 'Go to Expense Analytics', desc: 'Outflow categories and cost concentrations', path: '/expenses', icon: ArrowDownRight },
    { name: 'Go to File Converter', desc: 'Transform CSV, JSON, or Excel statement logs', path: '/upload', icon: UploadCloud },
    { name: 'Go to Reports', desc: 'Generate P&L spreadsheets and scheduler digests', path: '/reports', icon: FileSpreadsheet },
    { name: 'Go to Settings', desc: 'Configure company metadata and security', path: '/settings', icon: Settings },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      
      // Focus on '/' when user is not typing in an input
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }

      // Close on Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const filteredCommands = commands.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          
          {/* Blur backdrop overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-[#020617]/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.2 }}
            className="glass-panel w-full max-w-lg rounded-[28px] border border-white/10 bg-slate-950/80 shadow-[0_30px_70px_rgba(2,6,23,0.8)] backdrop-blur-3xl overflow-hidden relative z-10 flex flex-col"
          >
            
            {/* Search Input block */}
            <div className="p-4 border-b border-white/5 relative">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search console routes (e.g. Reports...)"
                className="peer w-full h-[46px] pl-11 pr-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/8 focus:border-blue-500/50 text-xs font-semibold text-slate-200 placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 ease-out"
              />
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none peer-focus:text-blue-500 transition-colors duration-300" />
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-white/5 bg-white/4 p-1 text-slate-400 hover:text-white transition"
              >
                <X size={12} />
              </button>
            </div>

            {/* List entries */}
            <div className="max-h-[320px] overflow-y-auto p-2.5 space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No commands match your query.
                </div>
              ) : (
                filteredCommands.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.path}
                      onClick={() => handleNavigate(cmd.path)}
                      className="w-full text-left rounded-xl p-3 flex items-center justify-between hover:bg-white/4 border border-transparent hover:border-white/5 transition group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-center justify-center group-hover:bg-cyan-500/10 group-hover:text-cyan-300 transition">
                          <Icon size={15} />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-200 group-hover:text-white transition">{cmd.name}</h5>
                          <p className="text-[10px] text-slate-500 group-hover:text-slate-400 transition">{cmd.desc}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black text-slate-500 border border-white/5 bg-white/3 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">
                        ENTER
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer tips */}
            <div className="p-3 bg-slate-950/40 border-t border-white/5 flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider px-4">
              <div className="flex items-center gap-1">
                <Sparkles size={11} className="text-cyan-400" />
                <span>Tip: Press <kbd className="bg-white/5 px-1 rounded text-slate-400">Ctrl+K</kbd> to toggle</span>
              </div>
              <span>ESC to cancel</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
