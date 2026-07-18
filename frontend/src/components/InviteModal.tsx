import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Shield, UserPlus, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useApp();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Viewer');
  const [inviteType, setInviteType] = useState('Team Member');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      addToast('error', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    
    addToast('success', `Invitation successfully sent to ${email} as ${role} (${inviteType})!`);
    setEmail('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="glass-panel relative w-full max-w-md rounded-[28px] p-6 overflow-hidden border border-white/10 bg-slate-900/40 shadow-[0_25px_60px_rgba(0,0,0,0.5)]"
          >
            {/* Design accents */}
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-cyan-400" />
                <h3 className="text-base font-bold text-white">Invite Workspace Advisor</h3>
              </div>
              <button 
                onClick={onClose} 
                className="rounded-xl border border-white/5 bg-white/5 p-1.5 text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Invitation Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Team Member', 'Accountant', 'Fractional CFO'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setInviteType(type)}
                      className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border transition ${
                        inviteType === type
                          ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                          : 'bg-white/3 border-white/5 text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      {type.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="advisor@company.com"
                    className="premium-input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Workspace Role
                </label>
                <div className="relative">
                  <Shield size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="premium-input pl-10 pr-4 appearance-none"
                  >
                    <option value="Viewer">Viewer (Read Only)</option>
                    <option value="Read Only">Read Only (Export enabled)</option>
                    <option value="Finance Analyst">Finance Analyst (Manage Ledgers)</option>
                  </select>
                </div>
              </div>

              {/* Notice Banner */}
              <div className="rounded-xl border border-white/5 bg-white/3 p-3 flex gap-2">
                <Sparkles size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Invitations secure read-only permission scopes. Invitees cannot connect secondary bank accounts or modify core ledgers.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="premium-button w-full py-3.5 font-bold cursor-pointer mt-4"
              >
                {loading ? 'Sending Invitation...' : 'Send Secure Invitation'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InviteModal;
