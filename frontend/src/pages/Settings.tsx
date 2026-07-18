import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
const API_URL = import.meta.env.VITE_API_URL;

import {
  User,
  Sliders,
  Bell,
  CheckCircle,
  Database,
  Building
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, addToast, notificationPreferences, saveNotificationPreferences } = useApp();
  const [userName, setUserName] = useState(user?.name || 'Workspace User');
  const [businessName, setBusinessName] = useState('Acme Corp Inc.');
  const [anomalyThreshold, setAnomalyThreshold] = useState('1000');
  const [currencySymbol, setCurrencySymbol] = useState('USD');
  
  const [whatsappPhone, setWhatsappPhone] = useState(notificationPreferences?.whatsappNumber || '');

  React.useEffect(() => {
    if (notificationPreferences?.whatsappNumber !== undefined) {
      setWhatsappPhone(notificationPreferences.whatsappNumber);
    }
  }, [notificationPreferences?.whatsappNumber]);

  const handlePreferenceChange = async (key: string, value: any) => {
    const updated = {
      ...notificationPreferences,
      [key]: value
    };
    await saveNotificationPreferences(updated);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('success', 'Profile parameters updated successfully.');
  };

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('success', 'Financial anomaly limits synchronized.');
  };

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight my-0">
          Workspace Settings
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Adjust billing thresholds, notification limits, and model predictions settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Account Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* User profile card */}
          <div className="border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              <User size={18} className="text-blue-600" />
              <h4 className="font-bold text-base">Account Profile</h4>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Profile Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Business Entity Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                      <Building size={14} />
                    </span>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                Save Details
              </button>
            </form>
          </div>

          {/* Anomaly thresholds settings */}
          <div className="border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              <Sliders size={18} className="text-blue-600" />
              <h4 className="font-bold text-base">Anomaly Auditing Thresholds</h4>
            </div>

            <form onSubmit={handleSaveThresholds} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Highlight transactions above
                  </label>
                  <input
                    type="number"
                    value={anomalyThreshold}
                    onChange={(e) => setAnomalyThreshold(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Default Currency Symbol
                  </label>
                  <select
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                Sync Limits
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Toggle Switches */}
        <div className="space-y-6">
          {/* Notification Preferences */}
          <div className="border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              <Bell size={18} className="text-blue-600" />
              <h4 className="font-bold text-base">Notification Preferences</h4>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-655 dark:text-slate-400">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Email Notifications</span>
                <input
                  type="checkbox"
                  checked={!!notificationPreferences?.emailEnabled}
                  onChange={(e) => handlePreferenceChange('emailEnabled', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 border-slate-200"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>WhatsApp Notifications</span>
                <input
                  type="checkbox"
                  checked={!!notificationPreferences?.whatsappEnabled}
                  onChange={(e) => handlePreferenceChange('whatsappEnabled', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 border-slate-200"
                />
              </label>

              {notificationPreferences?.whatsappEnabled && (
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider">
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="text"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    onBlur={() => handlePreferenceChange('whatsappNumber', whatsappPhone)}
                    placeholder="e.g. +919876543210"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="h-px bg-white/5 my-2" />

              <label className="flex items-center justify-between cursor-pointer">
                <span>Weekly digests</span>
                <input
                  type="checkbox"
                  checked={!!notificationPreferences?.weeklySummary}
                  onChange={(e) => handlePreferenceChange('weeklySummary', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 border-slate-200"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>AI CFO Alerts</span>
                <input
                  type="checkbox"
                  checked={!!notificationPreferences?.aiAlerts}
                  onChange={(e) => handlePreferenceChange('aiAlerts', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 border-slate-200"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Expense Auditing Alerts</span>
                <input
                  type="checkbox"
                  checked={!!notificationPreferences?.expenseAlerts}
                  onChange={(e) => handlePreferenceChange('expenseAlerts', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 border-slate-200"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Profit Margin Alerts</span>
                <input
                  type="checkbox"
                  checked={!!notificationPreferences?.profitAlerts}
                  onChange={(e) => handlePreferenceChange('profitAlerts', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 border-slate-200"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>CSV Upload Completed Alerts</span>
                <input
                  type="checkbox"
                  checked={!!notificationPreferences?.csvCompleted}
                  onChange={(e) => handlePreferenceChange('csvCompleted', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 border-slate-200"
                />
              </label>
            </div>
          </div>

          <div className="border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-blue-600">
              <Database size={16} />
              <h4 className="font-bold text-xs uppercase tracking-wider">FastAPI & Firebase Status</h4>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
  Platform is connected to:
  <br />
  <span className="text-blue-500">{API_URL}</span>
</p>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded-lg w-max">
              <CheckCircle size={12} />
              Sandbox Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Settings;
