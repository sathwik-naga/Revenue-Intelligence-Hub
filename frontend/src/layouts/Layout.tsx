import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { InviteModal } from '../components/InviteModal';
import { AIAssistant } from '../components/AIAssistant';
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
  User,
  TrendingUp,
  ArrowDownRight,
  PanelLeftClose,
  PanelLeftOpen,
  UserPlus,
  HelpCircle,
  RefreshCw
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
    insights,
    insightsLoading,
    addToast,
    notifications,
    markNotificationsAsRead
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  
  // Logout loader states
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutStage, setLogoutStage] = useState('');

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Revenue Analytics', path: '/revenue', icon: TrendingUp },
    { name: 'Expense Analytics', path: '/expenses', icon: ArrowDownRight },
    { name: 'File Converter', path: '/upload', icon: UploadCloud },
    { name: 'AI Insights', path: '/insights', icon: BrainCircuit },
    { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const stages = [
      'Signing out...',
      'Session cleared',
      'Redirecting...'
    ];
    for (let i = 0; i < stages.length; i++) {
      setLogoutStage(stages[i]);
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
    try {
      await logout();
    } catch (e) {
      console.warn("Signout error:", e);
    }
    setIsLoggingOut(false);
    navigate('/');
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    if (isoString === 'Just now') return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return isoString;
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="relative min-h-screen text-slate-100 bg-[#020617]">
      
      <InviteModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />

      <div className="relative z-10 flex min-h-screen p-4 gap-4">
        
        <aside className={`hidden lg:flex flex-col shrink-0 rounded-[28px] border border-white/8 bg-slate-950/20 backdrop-blur-2xl p-4 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${
          sidebarCollapsed ? 'w-24' : 'w-72'
        }`}>
          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 shadow-[0_8px_25px_rgba(59,130,246,0.3)]">
                <BrainCircuit className="text-white animate-pulse" size={20} />
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-white tracking-tight">Revenue Hub</span>
                  <span className="text-[9px] font-bold text-cyan-350 tracking-[0.2em] uppercase">Enterprise</span>
                </div>
              )}
            </Link>
            <button
              onClick={() => setSidebarCollapsed((v) => !v)}
              className="rounded-xl border border-white/5 bg-white/5 p-2 text-slate-400 hover:text-white transition"
            >
              {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>

          <nav className="flex-1 space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative flex items-center gap-3.5 rounded-[18px] px-3.5 py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/10 to-cyan-500/10 border border-white/10 text-white shadow-[0_12px_30px_rgba(59,130,246,0.1)]'
                      : 'text-slate-400 border border-transparent hover:bg-white/5 hover:text-white'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon size={18} className="shrink-0" />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                  
                  {isActive && !sidebarCollapsed && (
                    <motion.div 
                      layoutId="sidebar-active" 
                      className="absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" 
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-white/5 mt-4 space-y-2">
            {!sidebarCollapsed && (
              <button 
                onClick={() => setInviteOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-200 transition hover:bg-white/8 hover:text-white"
              >
                <UserPlus size={14} />
                Invite Advisor
              </button>
            )}
            <button
              onClick={handleLogout}
              className={`flex w-full items-center gap-3.5 rounded-[18px] px-3.5 py-3.5 text-xs font-bold uppercase tracking-wider text-rose-400 border border-transparent transition hover:bg-rose-500/10 hover:border-rose-500/10 ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut size={18} />
              {!sidebarCollapsed && 'Sign out'}
            </button>
          </div>
        </aside>

        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setMobileSidebarOpen(false)} 
                className="fixed inset-0 z-40 bg-slate-950/70 lg:hidden" 
              />
              <motion.aside 
                initial={{ x: '-100%' }} 
                animate={{ x: 0 }} 
                exit={{ x: '-100%' }} 
                transition={{ type: 'spring', damping: 28, stiffness: 240 }} 
                className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-slate-950/95 p-4 backdrop-blur-2xl lg:hidden"
              >
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                  <Link to="/" className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400">
                      <BrainCircuit className="text-white" size={18} />
                    </div>
                    <span className="text-base font-bold text-white">Revenue Hub</span>
                  </Link>
                  <button onClick={() => setMobileSidebarOpen(false)} className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300">
                    <X size={18} />
                  </button>
                </div>

                <nav className="flex-1 space-y-1.5">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <Link 
                        key={item.path} 
                        to={item.path} 
                        onClick={() => setMobileSidebarOpen(false)} 
                        className={`flex items-center gap-3 rounded-[18px] px-3.5 py-3.5 text-xs font-bold uppercase tracking-wider transition-all ${
                          isActive 
                            ? 'bg-white/10 text-white' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Icon size={18} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>

                <div className="pt-4 border-t border-white/5 mt-4 space-y-2">
                  <button 
                    onClick={() => { setMobileSidebarOpen(false); setInviteOpen(true); }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/8 bg-white/5 px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-200 transition hover:bg-white/10"
                  >
                    <UserPlus size={14} />
                    Invite Advisor
                  </button>
                  <button 
                    onClick={handleLogout} 
                    className="flex w-full items-center gap-3.5 rounded-[18px] px-3.5 py-3.5 text-xs font-bold uppercase tracking-wider text-rose-400 transition hover:bg-rose-500/10"
                  >
                    <LogOut size={18} />
                    Sign out
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          
          <header className="sticky top-0 z-30 rounded-[24px] border border-white/8 bg-slate-950/20 px-6 py-4 backdrop-blur-3xl shadow-[0_10px_35px_rgba(0,0,0,0.3)] mb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setMobileSidebarOpen(true)} 
                  className="rounded-2xl border border-white/8 bg-white/5 p-2 text-slate-350 hover:text-white transition lg:hidden"
                >
                  <Menu size={18} />
                </button>
                
                <div className="hidden sm:flex flex-col">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-extrabold">REVENUE PLATFORM</span>
                  <span className="text-xs font-bold text-slate-400">{currentDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3.5">
                
                <div className="relative hidden md:block">
                  <input 
                    type="text" 
                    placeholder="Search accounts..." 
                    className="peer w-56 h-[38px] pl-10 pr-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/8 focus:border-blue-500/50 text-[11px] font-semibold text-slate-200 placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 ease-out" 
                  />
                  <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 peer-focus:text-blue-500 transition-colors duration-300" />
                </div>

                <div className="relative">
                  <button 
                    onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                    className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                    <span>SYSTEM ONLINE</span>
                  </button>

                  <AnimatePresence>
                    {statusMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setStatusMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="glass-panel absolute right-0 mt-2.5 w-52 rounded-[20px] border border-white/10 bg-slate-950/90 p-4 shadow-[0_15px_40px_rgba(2,6,23,0.8)] backdrop-blur-2xl z-40 space-y-3"
                        >
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 pb-2 border-b border-white/5">
                            System Nodes Status
                          </h4>
                          <div className="space-y-2 text-[10px] font-semibold text-slate-350">
                            <div className="flex items-center justify-between">
                              <span>Backend Ledger</span>
                              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(16,185,129,0.8)]" />
                                Online
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Firebase Auth</span>
                              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(16,185,129,0.8)]" />
                                Synced
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Session Status</span>
                              {user ? (
                                <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_4px_rgba(59,130,246,0.8)]" />
                                  Authenticated
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5 text-slate-500 font-bold">
                                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                                  Guest Node
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span>AI CFO Model</span>
                              {insightsLoading ? (
                                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_4px_rgba(245,158,11,0.8)]" />
                                  AI Initializing
                                </span>
                              ) : insights.length > 0 ? (
                                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(16,185,129,0.8)]" />
                                  AI Ready
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-550 shadow-[0_0_4px_rgba(239,68,68,0.8)]" />
                                  AI Offline
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={() => setDarkMode(!darkMode)} 
                  className="rounded-2xl border border-white/8 bg-white/5 p-2.5 text-slate-400 hover:text-white transition"
                >
                  {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                </button>

                <div className="relative">
                  <button 
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      if (!notificationsOpen) {
                        markNotificationsAsRead();
                      }
                    }} 
                    className="rounded-2xl border border-white/8 bg-white/5 p-2.5 text-slate-400 hover:text-white transition relative"
                  >
                    <Bell size={16} />
                    {notifications.some(n => !n.read) && (
                      <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                    )}
                  </button>

                  <AnimatePresence>
                    {notificationsOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)} />
                        <motion.div 
                          initial={{ opacity: 0, y: 12, scale: 0.96 }} 
                          animate={{ opacity: 1, y: 0, scale: 1 }} 
                          exit={{ opacity: 0, y: 8, scale: 0.96 }} 
                          className="absolute right-0 mt-3 w-80 rounded-[24px] border border-white/10 bg-slate-950/90 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.6)] backdrop-blur-3xl z-40"
                        >
                          <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">System Notifications</span>
                            <span className="text-[10px] font-bold text-cyan-350 bg-cyan-500/10 px-2 py-0.5 rounded-full">{notifications.filter(n => !n.read).length} unread</span>
                          </div>
                          
                          <div className="max-h-60 space-y-2.5 overflow-y-auto pr-1">
                            {notifications.length === 0 ? (
                              <div className="py-6 text-center text-[10px] text-slate-500 font-bold">
                                No notifications.
                              </div>
                            ) : (
                              notifications.slice(0, 5).map((n) => (
                                <div key={n.id} className={`rounded-xl border border-white/5 p-3 hover:bg-white/6 transition-colors ${n.read ? 'opacity-60 bg-white/2' : 'bg-white/4'}`}>
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="text-xs font-bold text-slate-100 leading-tight">{n.title}</h4>
                                    <span className="text-[9px] text-slate-500 font-bold shrink-0">{formatTime(n.timestamp)}</span>
                                  </div>
                                  <p className="mt-1 text-[11px] text-slate-400 leading-normal">{n.description}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={() => setInviteOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-200 transition hover:bg-white/10"
                >
                  <UserPlus size={14} />
                  Invite
                </button>

                <div className="relative">
                  <button 
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)} 
                    className="rounded-2xl border border-white/8 bg-white/5 p-1 transition hover:bg-white/10 cursor-pointer"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 text-xs font-extrabold text-white">
                      {user?.name ? user.name.slice(0, 2).toUpperCase() : <User size={13} />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {profileMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setProfileMenuOpen(false)} />
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.96 }} 
                          animate={{ opacity: 1, y: 0, scale: 1 }} 
                          exit={{ opacity: 0, y: 8, scale: 0.96 }} 
                          className="absolute right-0 mt-3 w-56 rounded-[24px] border border-white/10 bg-slate-950/95 p-2.5 shadow-[0_25px_80px_rgba(0,0,0,0.6)] backdrop-blur-3xl z-40"
                        >
                          <div className="rounded-[18px] border border-white/5 bg-white/4 p-3 mb-2">
                            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500">Active Session</p>
                            <div className="flex items-center gap-2 mt-1.5 truncate">
                              <User size={13} className="text-slate-400 shrink-0" />
                              <div className="truncate">
                                <p className="text-xs font-extrabold text-slate-100 truncate">{user?.name || 'Sathwik'}</p>
                                <p className="text-[9px] font-semibold text-slate-400 truncate">{user?.email || 'sathwik@gmail.com'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <button 
                              onClick={() => { setProfileMenuOpen(false); addToast('info', 'Profile manager is Prototype Ready.'); }}
                              className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-slate-350 hover:bg-white/5 hover:text-white transition"
                            >
                              <User size={14} className="text-blue-400" />
                              Profile
                            </button>
                            <Link 
                              to="/settings" 
                              onClick={() => setProfileMenuOpen(false)} 
                              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-350 hover:bg-white/5 hover:text-white transition"
                            >
                              <SettingsIcon size={14} className="text-cyan-400" />
                              Settings
                            </Link>
                            <button 
                              onClick={() => { setProfileMenuOpen(false); addToast('info', 'Help & Resources: support@revenue.hub'); }}
                              className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-slate-350 hover:bg-white/5 hover:text-white transition"
                            >
                              <HelpCircle size={14} className="text-purple-400" />
                              Help
                            </button>
                            <div className="h-px bg-white/5 my-1" />
                            <button 
                              onClick={handleLogout} 
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 transition"
                            >
                              <LogOut size={14} />
                              Sign out
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 flex flex-col relative z-25">
            {children}
          </main>
          <AIAssistant />
        </div>
      </div>

      {/* Logout Loader Overlay */}
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#020617]/85 backdrop-blur-md flex flex-col items-center justify-center space-y-4"
          >
            <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-full flex items-center justify-center animate-spin text-rose-400">
              <RefreshCw size={24} />
            </div>
            <p className="text-xs font-black text-slate-200 uppercase tracking-widest animate-pulse">{logoutStage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
