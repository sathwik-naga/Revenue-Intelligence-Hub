import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import {
  Mail,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  RefreshCw,
  Search
} from 'lucide-react';

export const NotificationHistory: React.FC = () => {
  const {
    notificationHistory,
    fetchNotificationHistory,
    triggerManualNotification,
    testEmailNotification,
    testWhatsAppNotification,
    notificationPreferences
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'delivered' | 'failed' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState('');
  const [showTestModal, setShowTestModal] = useState<'none' | 'email' | 'whatsapp'>('none');
  const [testWhatsAppPhone, setTestWhatsAppPhone] = useState(notificationPreferences?.whatsappNumber || '');

  const loadHistory = async () => {
    setIsRefreshing(true);
    await fetchNotificationHistory();
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchNotificationHistory();
  }, [fetchNotificationHistory]);

  const handleManualTrigger = async () => {
    setIsSendingReport(true);
    await triggerManualNotification();
    setIsSendingReport(false);
  };

  const handleSendTestEmail = async () => {
    const emailToUse = testEmailInput.trim() || undefined;
    await testEmailNotification(emailToUse);
    setShowTestModal('none');
    setTestEmailInput('');
  };

  const handleSendTestWhatsApp = async () => {
    if (!testWhatsAppPhone.trim()) return;
    await testWhatsAppNotification(testWhatsAppPhone.trim());
    setShowTestModal('none');
  };

  // Filter history
  const filteredHistory = notificationHistory.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.recipient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.channel?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      activeFilter === 'all' ? true : item.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight my-0">
            Notification Center
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Monitor transaction notification delivery status, retry dispatches, and trigger test alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadHistory}
            disabled={isRefreshing}
            className="p-2.5 rounded-2xl border border-white/8 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition flex items-center justify-center cursor-pointer"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          
          <button
            onClick={() => setShowTestModal('email')}
            className="rounded-2xl border border-white/8 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-350 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            Test Email
          </button>

          <button
            onClick={() => setShowTestModal('whatsapp')}
            className="rounded-2xl border border-white/8 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-350 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            Test WhatsApp
          </button>

          <button
            onClick={handleManualTrigger}
            disabled={isSendingReport}
            className="premium-button text-xs font-bold uppercase tracking-wider px-4 py-2.5 cursor-pointer flex items-center gap-1.5"
          >
            <Send size={12} className={isSendingReport ? 'animate-pulse' : ''} />
            {isSendingReport ? 'Sending...' : 'Dispatch Report'}
          </button>
        </div>
      </div>

      {/* Main glass panel containing list & filters */}
      <div className="border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-sm space-y-6">
        
        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          
          {/* Status Filters */}
          <div className="flex bg-slate-100 dark:bg-slate-950/40 p-1.5 rounded-2xl border border-slate-250/20 dark:border-white/5 w-max">
            {(['all', 'delivered', 'failed', 'pending'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-450 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {filter === 'delivered' ? 'Success' : filter === 'failed' ? 'Failed' : filter === 'pending' ? 'Pending' : 'All'}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search history logs..."
              className="w-full h-[40px] pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-850 dark:text-slate-200 placeholder-slate-450 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-150/80 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-450">
                <th className="pb-3 pl-3">Title</th>
                <th className="pb-3">Channel</th>
                <th className="pb-3">Recipient</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Created</th>
                <th className="pb-3">Delivered</th>
                <th className="pb-3 text-right pr-3">Latency</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs font-semibold text-slate-400">
                    No notification logs matching the active criteria.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-100 dark:border-slate-800/40 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50/20 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 pl-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-blue-500 shrink-0">
                          {log.channel === 'email' ? <Mail size={14} /> : <MessageSquare size={14} className="text-emerald-500" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">{log.title}</p>
                          {log.error && <p className="text-[10px] text-rose-500 mt-0.5 leading-none">{log.error}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
                        {log.channel}
                      </span>
                    </td>
                    <td className="py-4 font-semibold text-slate-850 dark:text-slate-200">{log.recipient}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        log.status === 'delivered'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : log.status === 'failed'
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {log.status === 'delivered' ? (
                          <>
                            <CheckCircle size={10} />
                            Success
                          </>
                        ) : log.status === 'failed' ? (
                          <>
                            <XCircle size={10} />
                            Failed
                          </>
                        ) : (
                          <>
                            <Clock size={10} className="animate-spin" />
                            Pending
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 text-slate-500">{formatDate(log.createdAt)}</td>
                    <td className="py-4 text-slate-500">{formatDate(log.deliveredAt)}</td>
                    <td className="py-4 text-right pr-3 font-semibold text-slate-400">
                      {log.deliveryTimeMs ? `${log.deliveryTimeMs}ms` : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Email/WhatsApp modals */}
      {showTestModal !== 'none' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-2.5 text-white">
              {showTestModal === 'email' ? <Mail size={18} className="text-blue-500" /> : <MessageSquare size={18} className="text-emerald-500" />}
              <h4 className="font-extrabold text-base">
                {showTestModal === 'email' ? 'Send Test Email' : 'Send Test WhatsApp'}
              </h4>
            </div>

            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              {showTestModal === 'email'
                ? 'Send a demo Neon Aurora summary email to the address below. Leave empty to send to your session email.'
                : 'Send a quick text financial summary demo message to the phone number below.'}
            </p>

            <div className="space-y-3">
              {showTestModal === 'email' ? (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    value={testEmailInput}
                    onChange={(e) => setTestEmailInput(e.target.value)}
                    placeholder="e.g. business@revenuehub.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950/30 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Recipient Phone Number (with Country Code)
                  </label>
                  <input
                    type="text"
                    value={testWhatsAppPhone}
                    onChange={(e) => setTestWhatsAppPhone(e.target.value)}
                    placeholder="e.g. +919876543210"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950/30 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs font-bold uppercase tracking-wider">
              <button
                onClick={() => {
                  setShowTestModal('none');
                  setTestEmailInput('');
                }}
                className="px-4 py-2 bg-transparent text-slate-450 hover:text-white rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={showTestModal === 'email' ? handleSendTestEmail : handleSendTestWhatsApp}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition"
              >
                Send Test
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
export default NotificationHistory;
