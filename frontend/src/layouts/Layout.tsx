import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  UploadCloud,
  BrainCircuit,
  FileSpreadsheet,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  Search,
  ChevronRight,
  User,
  TrendingUp,
  ArrowDownRight
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const {
    user,
    logout,
    darkMode,
    setDarkMode,
    notifications,
    markNotificationsAsRead
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Match menu navigation
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Revenue Analytics', path: '/revenue', icon: TrendingUp },
    { name: 'Expense Analytics', path: '/expenses', icon: ArrowDownRight },
    { name: 'CSV Upload', path: '/upload', icon: UploadCloud },
    { name: 'AI Insights', path: '/insights', icon: BrainCircuit },
    { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  // Breadcrumbs title helper
  const getBreadcrumbs = () => {
    const item = menuItems.find((m) => m.path === location.pathname);
    return item ? item.name : 'Home';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-200/80 dark:border-slate-900 bg-white dark:bg-slate-900/50 backdrop-blur-md">
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-900/50">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <BrainCircuit className="text-white" size={18} />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
              Revenue Hub
            </span>
          </Link>
        </div>

        {/* Desktop Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all relative ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-900/30'
                }`}
              >
                <Icon size={18} className="shrink-0 stroke-[2px]" />
                {item.name}
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 w-1 h-6 bg-blue-600 dark:bg-blue-400 rounded-r-md"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-900/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/10 rounded-xl transition-all"
          >
            <LogOut size={18} className="shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Responsive Mobile Drawer Trigger / Navigation */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            {/* Sidebar menu drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-white dark:bg-slate-900 z-50 flex flex-col shadow-2xl border-r border-slate-200 dark:border-slate-800 lg:hidden"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
                <Link to="/" className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <BrainCircuit className="text-white" size={16} />
                  </div>
                  <span className="font-bold text-md text-slate-900 dark:text-white">
                    Revenue Hub
                  </span>
                </Link>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon size={18} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/10 rounded-xl"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 3. Main content workspace shell */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header toolbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-slate-200/80 dark:border-slate-900 bg-white/70 dark:bg-slate-950/40 backdrop-blur-md z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumbs path */}
            <div className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              <span>App</span>
              <ChevronRight size={14} className="text-slate-300 dark:text-slate-700" />
              <span className="text-slate-900 dark:text-white font-bold">{getBreadcrumbs()}</span>
            </div>
          </div>

          {/* Header Action tray */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Input bar */}
            <div className="relative hidden md:block w-64">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Theme selector toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-850 hover:bg-slate-100/50 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  markNotificationsAsRead();
                }}
                className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-850 hover:bg-slate-100/50 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950 animate-ping" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
                )}
              </button>

              {/* Notifications Dropdown panel */}
              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-40 p-4"
                    >
                      <div className="flex justify-between items-center pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          Smart Notifications
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">
                          {notifications.length} alerts
                        </span>
                      </div>

                      <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-400">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors border border-slate-100/50 dark:border-slate-800/40"
                            >
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-200 leading-snug">
                                  {n.title}
                                </h4>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                  {n.timestamp}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                {n.description}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Menu dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-1 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-900 transition-all shadow-sm"
              >
                <div className="h-7 w-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : <User size={14} />}
                </div>
              </button>

              <AnimatePresence>
                {profileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setProfileMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2.5 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-40 p-2"
                    >
                      <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-400 font-semibold">Logged in as</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
                          {user?.email || 'demo@company.com'}
                        </p>
                      </div>

                      <div className="p-1 space-y-0.5">
                        <Link
                          to="/settings"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold rounded-xl text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white transition-colors"
                        >
                          <SettingsIcon size={16} />
                          Account Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl text-rose-600 hover:bg-rose-50 dark:text-rose-450 dark:hover:bg-rose-950/10 transition-colors text-left"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page body wrapper */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
export default Layout;
