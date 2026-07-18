import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import { Toast } from './components/Toast';
import { Layout } from './layouts/Layout';

import { LandingPage } from './pages/LandingPage';
import { LoadingScreen } from './components/LoadingScreen';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { RevenueAnalytics } from './pages/RevenueAnalytics';
import { ExpenseAnalytics } from './pages/ExpenseAnalytics';
import { CSVUpload } from './pages/CSVUpload';
import { AIInsights } from './pages/AIInsights';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { NotificationHistory } from './pages/NotificationHistory';

import { CommandPalette } from './components/CommandPalette';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center p-6 bg-[#020617]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel flex min-w-[280px] flex-col items-center gap-4 rounded-[32px] px-8 py-8 text-center"
        >
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500/70 border-t-transparent" />
          <div>
            <p className="text-lg font-semibold text-slate-50">Initializing Workspace</p>
            <p className="mt-1 text-sm text-slate-450">Preparing secure access parameters...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Layout>{children}</Layout>;
};

const AppContent: React.FC = () => {
  const { toasts, removeToast, user, backendError } = useApp();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <LoadingScreen onComplete={() => setShowSplash(false)} />;
  }

  if (backendError) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center p-6 bg-[#030712]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel max-w-md rounded-[32px] p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-rose-300">Connection Offline</h2>
          <p className="mt-3 text-sm leading-6 text-slate-450">
            Please ensure the FastAPI server is running before continuing.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="premium-button mt-6 cursor-pointer"
          >
            Retry Connection
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/revenue" element={<ProtectedRoute><RevenueAnalytics /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><ExpenseAnalytics /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><CSVUpload /></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute><AIInsights /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationHistory /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toast toasts={toasts} removeToast={removeToast} />
      <CommandPalette />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
