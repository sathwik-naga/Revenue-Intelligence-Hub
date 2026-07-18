import { auth, db } from "../firebase/firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Transaction,
  FinancialSummary,
  AIInsight,
  ChatMessage,
  SystemNotification,
  DashboardChartsData,
  DashboardHealthData
} from '../types';
import { transactionApi } from '../api/transactions';
import { dashboardApi } from '../api/dashboard';
import { aiApi } from '../api/ai';
import { apiClient } from '../api/client';
import { notificationsApi } from '../api/notifications';

interface AppContextType {
  user: any;
  authLoading: boolean;
  backendError: string | null;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  logout: () => void;
  updateUserOnboarding: (onboarded: boolean) => Promise<void>;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  transactions: Transaction[];
  summary: FinancialSummary;
  dashboardCharts: DashboardChartsData;
  dashboardHealth: DashboardHealthData;
  insights: AIInsight[];
  insightsLoading: boolean;
  insightsText: string;
  insightsConfidence: number;
  insightsError: string | null;
  chatMessages: ChatMessage[];
  chatLoading: boolean;
  notifications: SystemNotification[];
  toasts: Array<{ id: string; type: string; message: string }>;
  addToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  removeToast: (id: string) => void;
  processCSVData: (file: File) => Promise<void>;
  askQuestion: (question: string) => Promise<void>;
  addNotification: (title: string, desc: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  markNotificationsAsRead: () => void;
  refreshAnalysis: () => Promise<void>;
  refreshAllData: () => Promise<void>;
  pipelineStatus: string;
  notificationPreferences: any;
  notificationHistory: any[];
  fetchNotificationPreferences: () => Promise<any>;
  saveNotificationPreferences: (prefs: any) => Promise<boolean>;
  fetchNotificationHistory: () => Promise<void>;
  fetchPipelineStatus: () => Promise<void>;
  triggerManualNotification: (companyId?: string) => Promise<boolean>;
  testEmailNotification: (email?: string) => Promise<boolean>;
  testWhatsAppNotification: (phoneNumber: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_SUMMARY: FinancialSummary = {
  totalRevenue: 0,
  totalExpenses: 0,
  netProfit: 0,
  healthScore: 0,
  previousRevenue: 0,
  previousExpenses: 0,
  previousProfit: 0,
  runwayMonths: 0,
  topExpenseCategory: 'N/A',
  topCustomer: 'N/A'
};

const DEFAULT_DASHBOARD_CHARTS: DashboardChartsData = {
  cashFlow: [],
  forecast: [],
  expenseCategories: []
};

const DEFAULT_DASHBOARD_HEALTH: DashboardHealthData = {
  healthScore: 0,
  healthLabel: 'Stable',
  factors: []
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [backendError, setBackendError] = useState<string | null>(null);

  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>(DEFAULT_SUMMARY);
  const [dashboardCharts, setDashboardCharts] = useState<DashboardChartsData>(DEFAULT_DASHBOARD_CHARTS);
  const [dashboardHealth, setDashboardHealth] = useState<DashboardHealthData>(DEFAULT_DASHBOARD_HEALTH);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [insightsText, setInsightsText] = useState<string>('');
  const [insightsLoading, setInsightsLoading] = useState<boolean>(false);
  const [insightsConfidence, setInsightsConfidence] = useState<number>(0);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [toasts, setToasts] = useState<Array<{ id: string; type: string; message: string }>>([]);

  const [pipelineStatus, setPipelineStatus] = useState<string>("Analysis Complete");
  const [notificationPreferences, setNotificationPreferences] = useState<any>({
    emailEnabled: true,
    whatsappEnabled: false,
    weeklySummary: true,
    aiAlerts: true,
    expenseAlerts: true,
    profitAlerts: true,
    csvCompleted: true,
    whatsappNumber: ""
  });
  const [notificationHistory, setNotificationHistory] = useState<any[]>([]);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const ensureUserDocument = async (firebaseUser: any, optionalName?: string) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    try {
      const docSnap = await getDoc(userRef);
      let profileData: any;
      
      if (!docSnap.exists()) {
        profileData = {
          uid: firebaseUser.uid,
          name: optionalName || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
          email: firebaseUser.email || "",
          photoURL: firebaseUser.photoURL || "",
          provider: firebaseUser.providerData[0]?.providerId || "password",
          role: "user",
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          isOnboarded: false
        };
        await setDoc(userRef, profileData);
      } else {
        const existingData = docSnap.data();
        profileData = {
          uid: firebaseUser.uid,
          name: existingData.name || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
          email: firebaseUser.email || existingData.email || "",
          photoURL: existingData.photoURL || firebaseUser.photoURL || "",
          provider: existingData.provider || firebaseUser.providerData[0]?.providerId || "password",
          role: existingData.role || "user",
          isOnboarded: existingData.isOnboarded ?? false,
          createdAt: existingData.createdAt
        };
        await setDoc(userRef, {
          lastLogin: serverTimestamp()
        }, { merge: true });
      }
      return profileData;
    } catch (err) {
      console.error("ensureUserDocument error:", err);
      return {
        uid: firebaseUser.uid,
        name: optionalName || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
        email: firebaseUser.email || "",
        photoURL: firebaseUser.photoURL || "",
        provider: firebaseUser.providerData[0]?.providerId || "password",
        role: "user",
        isOnboarded: false
      };
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await ensureUserDocument(credential.user, name);
      addToast('success', 'Workspace account created successfully.');
      return true;
    } catch (error: any) {
      addToast('error', error.message || 'Signup registration failed.');
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      if (credential.user) {
        await ensureUserDocument(credential.user);
        addToast("success", "Logged in successfully.");
        return true;
      }
      return false;
    } catch (error: any) {
      addToast("error", error.message || "Invalid credentials or login timeout.");
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      await ensureUserDocument(credential.user);
      addToast('success', 'Google SSO authenticated successfully.');
      return true;
    } catch (error: any) {
      addToast('error', error.message || 'Google SSO login failed.');
      return false;
    }
  };

  const updateUserOnboarding = async (onboarded: boolean): Promise<void> => {
    if (!user) return;
    setUser((prev: any) => prev ? { ...prev, isOnboarded: onboarded } : null);
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, {
        isOnboarded: onboarded,
        lastLogin: serverTimestamp()
      }, { merge: true });
    } catch (err: any) {
      console.error("Firestore onboarding update failed:", err);
      addToast('warning', 'Offline mode: onboarding status saved locally.');
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail(auth, email);
      addToast('success', 'Reset link sent to your registered email.');
      return true;
    } catch (error: any) {
      addToast('error', error.message || 'Failed to dispatch reset email.');
      return false;
    }
  };

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
      setTransactions([]);
      setSummary(DEFAULT_SUMMARY);
      setDashboardCharts(DEFAULT_DASHBOARD_CHARTS);
      setDashboardHealth(DEFAULT_DASHBOARD_HEALTH);
      setInsights([]);
      setInsightsText('');
      setChatMessages([]);
      setNotifications([]);
      addToast("info", "Logged out successfully.");
    } catch (error: any) {
      addToast('error', error.message || 'Logout process encountered an error.');
    }
  }, []);

  const addNotification = useCallback(async (title: string, desc: string, type: 'info' | 'success' | 'warning' | 'error') => {
    // Add local notification + toast alert
    const newNotif: SystemNotification = {
      id: Date.now().toString(),
      title,
      description: desc,
      type,
      timestamp: 'Just now',
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
    addToast(type, title);
  }, []);

  const markNotificationsAsRead = async () => {
    try {
      await apiClient.post('/api/notifications/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.warn("Failed to mark notifications read on server:", err);
    }
  };

  const toNumber = (value: unknown, fallback = 0) => {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const normalizeDashboardOverview = (payload: any): FinancialSummary => {
    const source = payload?.data ?? payload ?? {};
    const fallback = DEFAULT_SUMMARY;

    return {
      totalRevenue: toNumber(source.totalRevenue ?? source.total_revenue, fallback.totalRevenue),
      totalExpenses: toNumber(source.totalExpenses ?? source.total_expenses, fallback.totalExpenses),
      netProfit: toNumber(source.netProfit ?? source.net_profit, fallback.netProfit),
      profitMargin: toNumber(source.profitMargin ?? source.profit_margin, 0),
      previousRevenue: toNumber(source.previousRevenue ?? source.previous_revenue, fallback.previousRevenue),
      previousExpenses: toNumber(source.previousExpenses ?? source.previous_expenses, fallback.previousExpenses),
      previousProfit: toNumber(source.previousProfit ?? source.previous_profit, fallback.previousProfit),
      runwayMonths: toNumber(source.runwayMonths ?? source.runway_months, fallback.runwayMonths),
      topExpenseCategory: source.topExpenseCategory ?? source.top_expense_category ?? fallback.topExpenseCategory,
      topCustomer: source.topCustomer ?? source.top_customer ?? fallback.topCustomer,
      healthScore: toNumber(source.healthScore ?? source.health_score, fallback.healthScore),
      healthLabel: source.healthLabel ?? source.health_label ?? fallback.healthLabel ?? 'Stable',
      healthFactors: Array.isArray(source.factors) ? source.factors : []
    };
  };

  const normalizeDashboardCharts = (payload: any): DashboardChartsData => {
    const source = payload?.data ?? payload ?? {};

    const normalizeCashFlow = (value: any[] = []) => value.map((point: any) => ({
      name: point?.name ?? 'Unknown',
      inflow: toNumber(point?.inflow ?? point?.Inflow ?? point?.inflow_amount, 0),
      outflow: toNumber(point?.outflow ?? point?.Outflow ?? point?.outflow_amount, 0),
      net: toNumber(point?.net ?? point?.Net ?? (point?.inflow ?? point?.Inflow ?? 0) - (point?.outflow ?? point?.Outflow ?? 0), 0)
    }));

    const normalizeForecast = (value: any[] = []) => value.map((point: any) => ({
      name: point?.name ?? 'Unknown',
      actual: point?.actual ?? point?.Actual ?? null,
      forecast: toNumber(point?.forecast ?? point?.Forecast ?? 0, 0)
    }));

    const normalizeExpenseCategories = (value: any[] = []) => value.map((point: any) => ({
      name: point?.name ?? point?.category ?? 'Uncategorized',
      value: toNumber(point?.value ?? point?.Value ?? 0, 0)
    }));

    return {
      cashFlow: normalizeCashFlow(source.cashFlow ?? source.cash_flow ?? []),
      forecast: normalizeForecast(source.forecast ?? []),
      expenseCategories: normalizeExpenseCategories(source.expenseCategories ?? source.expense_categories ?? [])
    };
  };

  const normalizeDashboardHealth = (payload: any): DashboardHealthData => {
    const source = payload?.data ?? payload ?? {};
    return {
      healthScore: toNumber(source.healthScore ?? source.health_score, 0),
      healthLabel: source.healthLabel ?? source.health_label ?? 'Stable',
      factors: Array.isArray(source.factors) ? source.factors : []
    };
  };

  const formatMarkdown = (data: any) => {
    return `
# 📊 AI CFO Financial Analysis Report

## 🏥 Executive Summary
${data.summary || 'No summary overview currently compiled.'}

---

## 💯 Business Health Audit
- Financial Health Score: **${data.businessHealth || 'Stable'}**

---

## ⚠ Audit Risks Identifications
${(data.risks || []).map((r: any) => `- **${r.risk}**
  - *Severity*: ${r.severity}
  - *Financial Impact*: ${r.financialImpact}
  - *Mitigation recommendation*: ${r.recommendation}`).join('\n\n')}

---

## 🚀 Identified Growth Opportunities
${(data.opportunities || []).map((o: any) => `- **${o.opportunity}**
  - *Difficulty Level*: ${o.difficulty}
  - *Estimated Benefit*: ${o.estimatedFinancialImpact}
  - *Expected ROI*: ${o.expectedROI}`).join('\n\n')}

---

## ✅ Prioritized CFO Action items
${(data.recommendations || []).map((rec: any) => `- **[${rec.priority}]** ${rec.action}`).join('\n')}
`;
  };

  const mapInsights = (data: any): AIInsight[] => {
    const list: AIInsight[] = [];
    (data.risks || []).forEach((r: any, idx: number) => {
      list.push({
        id: `risk-${idx}`,
        type: 'anomaly',
        title: r.risk,
        description: `Severity: ${r.severity}. Mitigation: ${r.recommendation}`,
        severity: r.severity.toLowerCase() === 'high' || r.severity.toLowerCase() === 'critical' ? 'critical' : 'warning',
        status: 'active',
        impactAmount: parseFloat(r.financialImpact.replace(/[^0-9.-]+/g, "")) || 0
      });
    });
    (data.opportunities || []).forEach((o: any, idx: number) => {
      list.push({
        id: `opp-${idx}`,
        type: 'prediction',
        title: o.opportunity,
        description: `Difficulty: ${o.difficulty}. ROI: ${o.expectedROI}`,
        severity: 'info',
        status: 'active',
        impactAmount: parseFloat(o.estimatedFinancialImpact.replace(/[^0-9.-]+/g, "")) || 0
      });
    });
    (data.recommendations || []).forEach((rec: any, idx: number) => {
      list.push({
        id: `rec-${idx}`,
        type: 'recommendation',
        title: rec.action,
        description: `Priority window: ${rec.priority}`,
        severity: 'info',
        status: 'active'
      });
    });
    return list;
  };

  const refreshAllData = useCallback(async () => {
    try {
      const [txRes, overviewRes, chartsRes, healthRes, latestAIRes, notifRes, statusRes, historyRes, prefsRes] = (await Promise.all([
        transactionApi.list(),
        dashboardApi.getOverview(),
        dashboardApi.getCharts(),
        dashboardApi.getHealth(),
        aiApi.getLatest(),
        apiClient.get('/api/notifications') as any,
        notificationsApi.getStatus() as any,
        notificationsApi.getHistory() as any,
        notificationsApi.getPreferences() as any
      ])) as any[];

      if (statusRes?.success && statusRes.data) setPipelineStatus(statusRes.data.status);
      if (historyRes?.success) setNotificationHistory(historyRes.data);
      if (prefsRes?.success) setNotificationPreferences(prefsRes.data);

      if (txRes.success) setTransactions(txRes.data);

      let normalizedOverview: FinancialSummary | null = null;
      let normalizedCharts: DashboardChartsData | null = null;
      let normalizedHealth: DashboardHealthData | null = null;

      if (overviewRes?.success) {
        normalizedOverview = normalizeDashboardOverview(overviewRes);
        console.log('[dashboard] raw overview response', overviewRes);
      }

      if (chartsRes?.success) {
        normalizedCharts = normalizeDashboardCharts(chartsRes);
      }

      if (healthRes?.success) {
        normalizedHealth = normalizeDashboardHealth(healthRes);
        if (normalizedOverview) {
          normalizedOverview.healthScore = normalizedHealth.healthScore;
          normalizedOverview.healthLabel = normalizedHealth.healthLabel;
          normalizedOverview.healthFactors = normalizedHealth.factors;
        }
      }

      if (normalizedOverview) {
        console.log('[dashboard] mapped dashboard state', {
          overview: normalizedOverview,
          charts: normalizedCharts ?? DEFAULT_DASHBOARD_CHARTS,
          health: normalizedHealth ?? DEFAULT_DASHBOARD_HEALTH
        });
        setSummary(normalizedOverview);
      }

      if (normalizedCharts) {
        setDashboardCharts(normalizedCharts);
      }

      if (normalizedHealth) {
        setDashboardHealth(normalizedHealth);
      }

      if (notifRes.success) setNotifications(notifRes.data);

      if (latestAIRes.success && latestAIRes.data) {
        const analysis = latestAIRes.data.analysis;
        setInsightsText(formatMarkdown(analysis));
        setInsights(mapInsights(analysis));
        setInsightsConfidence(latestAIRes.data.confidenceScore || 95);
        setInsightsError(latestAIRes.data.error || latestAIRes.data.analysis?.error || null);
      } else {
        setInsightsError(latestAIRes?.message || "No AI analysis available.");
      }
    } catch (err: any) {
      console.warn("Failed to perform complete data refresh from APIs:", err);
      setInsightsError(err.message || "Failed to perform complete data refresh.");
    }
  }, []);

  const pollLatestAnalysis = useCallback(() => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const latestAIRes = await aiApi.getLatest();
        if (latestAIRes.success && latestAIRes.data) {
          const analysis = latestAIRes.data.analysis;
          setInsightsText(formatMarkdown(analysis));
          setInsights(mapInsights(analysis));
          setInsightsConfidence(latestAIRes.data.confidenceScore || 95);
          setInsightsError(latestAIRes.data.error || latestAIRes.data.analysis?.error || null);
          
          // Re-fetch calculations and notifications updated in background
          const [overviewRes, healthRes, notifRes, statusRes, historyRes] = (await Promise.all([
            dashboardApi.getOverview(),
            dashboardApi.getHealth(),
            apiClient.get('/api/notifications') as any,
            notificationsApi.getStatus() as any,
            notificationsApi.getHistory() as any
          ])) as any[];
          if (overviewRes.success) {
            const normalizedOverview = normalizeDashboardOverview(overviewRes);
            if (healthRes?.success) {
              const normalizedHealth = normalizeDashboardHealth(healthRes);
              normalizedOverview.healthScore = normalizedHealth.healthScore;
              normalizedOverview.healthLabel = normalizedHealth.healthLabel;
              normalizedOverview.healthFactors = normalizedHealth.factors;
              setDashboardHealth(normalizedHealth);
            }
            setSummary(normalizedOverview);
          }
          if (notifRes.success) setNotifications(notifRes.data);
          if (statusRes?.success && statusRes.data) setPipelineStatus(statusRes.data.status);
          if (historyRes?.success) setNotificationHistory(historyRes.data);

          addToast("success", "AI CFO Analysis results updated!");
          clearInterval(interval);
        } else {
          setInsightsError(latestAIRes?.message || "Polling analysis failed.");
        }
      } catch (e: any) {
        console.warn("Polling error for background AI calculations:", e);
        setInsightsError(e.message || "Polling calculations failed.");
      }
      if (attempts >= 10) {
        clearInterval(interval);
      }
    }, 3000);
  }, []);

  const fetchNotificationPreferences = useCallback(async () => {
    try {
      const res = await notificationsApi.getPreferences();
      if (res.success) {
        setNotificationPreferences(res.data);
        return res.data;
      }
    } catch (err) {
      console.warn("Failed to fetch notification preferences:", err);
    }
    return null;
  }, []);

  const saveNotificationPreferences = useCallback(async (prefs: any) => {
    try {
      const res = await notificationsApi.updatePreferences(prefs);
      if (res.success) {
        setNotificationPreferences(res.data);
        addToast("success", "Preferences synchronized successfully.");
        return true;
      }
    } catch (err: any) {
      addToast("error", err.message || "Failed to update notification settings.");
    }
    return false;
  }, []);

  const fetchNotificationHistory = useCallback(async () => {
    try {
      const res = await notificationsApi.getHistory();
      if (res.success) {
        setNotificationHistory(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch notification history:", err);
    }
  }, []);

  const fetchPipelineStatus = useCallback(async () => {
    try {
      const res = await notificationsApi.getStatus();
      if (res.success && res.data) {
        setPipelineStatus(res.data.status);
      }
    } catch (err) {
      console.warn("Failed to fetch pipeline status:", err);
    }
  }, []);

  const triggerManualNotification = useCallback(async (companyId?: string) => {
    try {
      addToast("info", "Starting report dispatch...");
      setPipelineStatus("Sending");
      const res = await notificationsApi.triggerSend(companyId);
      if (res.success) {
        addToast("success", "Executive report sent successfully.");
        await fetchPipelineStatus();
        await fetchNotificationHistory();
        return true;
      }
    } catch (err: any) {
      addToast("error", err.message || "Email report delivery failed.");
      setPipelineStatus("Failed");
    }
    return false;
  }, [fetchPipelineStatus, fetchNotificationHistory]);

  const testEmailNotification = useCallback(async (email?: string) => {
    try {
      addToast("info", "Sending test email...");
      const res = await notificationsApi.testEmail(email);
      if (res.success) {
        addToast("success", "Email report sent successfully.");
        await fetchNotificationHistory();
        return true;
      }
    } catch (err: any) {
      addToast("error", err.message || "Email delivery failed. Please try again later.");
    }
    return false;
  }, [fetchNotificationHistory]);

  const testWhatsAppNotification = useCallback(async (phoneNumber: string) => {
    try {
      addToast("info", "Sending test WhatsApp...");
      const res = await notificationsApi.testWhatsApp(phoneNumber);
      if (res.success) {
        addToast("success", "WhatsApp summary sent successfully.");
        await fetchNotificationHistory();
        return true;
      }
    } catch (err: any) {
      addToast("error", err.message || "WhatsApp delivery failed. Please try again later.");
    }
    return false;
  }, [fetchNotificationHistory]);

  const processCSVData = async (file: File) => {
    addToast("info", "Uploading statements to secure server...");
    try {
      const res = await transactionApi.uploadCSV(file);
      addToast("success", res.message || "Statements processed successfully.");
      console.log('[dashboard] CSV upload response', res);
      await refreshAllData();
      
      addNotification(
        "AI CFO Analyzing statement files",
        "Statements are being audited. Check insights tab for calculations shortly.",
        "info"
      );
      pollLatestAnalysis();
    } catch (err: any) {
      addToast("error", err.message || "CSV integration failed.");
    }
  };

  const askQuestion = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}-user`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const res = await aiApi.chat(text);
      if (res.success && res.data) {
        const modelMsg: ChatMessage = {
          id: `chat-${Date.now()}-model`,
          role: 'model',
          text: res.data.answer,
          timestamp: res.data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages((prev) => [...prev, modelMsg]);
      }
    } catch (e: any) {
      addToast('error', e.message || 'Failed to communicate with CFO Chat.');
    } finally {
      setChatLoading(false);
    }
  };

  const refreshAnalysis = async () => {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const res = await aiApi.analyze();
      if (res.success && res.data) {
        const analysis = res.data.analysis;
        setInsightsText(formatMarkdown(analysis));
        setInsights(mapInsights(analysis));
        setInsightsConfidence(res.data.confidenceScore || 95);
        setInsightsError(res.data.error || res.data.analysis?.error || null);
        
        setChatMessages([
          {
            id: 'welcome',
            role: 'model',
            text: `Hello! I have completed re-auditing your company ledgers. Your health indicator stands at **${analysis.businessHealth}**. Ask any financial queries below!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        addNotification('AI Analysis Complete', 'Gemini successfully generated financial recommendations & runway models.', 'success');
      } else {
        setInsightsError(res.message || "CFO audit execution failed.");
      }
    } catch (error: any) {
      addToast('error', error.message || 'CFO audit execution failed.');
      setInsightsError(error.message || 'CFO audit execution failed.');
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    let isBooted = false;

    const startupFlow = async () => {
      try {
        // Wait for Firebase Auth state to be resolved
        await auth.authStateReady();

        // Perform backend health check before loading user/rendering app
        try {
          const healthRes = await apiClient.get('/api/health') as any;
          if (!healthRes || healthRes.status !== 'healthy') {
            throw new Error("Backend health check unsuccessful");
          }
        } catch (healthErr) {
          console.error("Startup backend health check failed:", healthErr);
          if (active) {
            setBackendError("Backend unavailable. Please ensure the FastAPI server is running.");
            setAuthLoading(false);
          }
          return;
        }

        // Load authenticated user if present
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          try {
            const dbUser = await ensureUserDocument(firebaseUser);
            if (active) {
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: dbUser.name,
                photoURL: dbUser.photoURL || firebaseUser.photoURL || null,
                role: dbUser.role || "user",
                isOnboarded: dbUser.isOnboarded ?? false
              });
            }
          } catch (err) {
            console.error("startupFlow check error:", err);
            if (active) {
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
                photoURL: firebaseUser.photoURL || null,
                role: "user",
                isOnboarded: false
              });
            }
          }
        } else {
          if (active) setUser(null);
        }

        isBooted = true;
        if (active) {
          setAuthLoading(false);
        }
      } catch (err: any) {
        console.error("App startup flow error:", err);
        if (active) {
          setBackendError("An unexpected error occurred during app startup.");
          setAuthLoading(false);
        }
      }
    };

    startupFlow();

    // Listen for subsequent auth state changes (e.g. login/logout actions)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isBooted) return;

      if (firebaseUser) {
        try {
          const dbUser = await ensureUserDocument(firebaseUser);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: dbUser.name,
            photoURL: dbUser.photoURL || firebaseUser.photoURL || null,
            role: dbUser.role || "user",
            isOnboarded: dbUser.isOnboarded ?? false
          });
        } catch (err) {
          console.error("onAuthStateChanged check error:", err);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
            photoURL: firebaseUser.photoURL || null,
            role: "user",
            isOnboarded: false
          });
        }
      } else {
        setUser(null);
      }
    });

    const theme = localStorage.getItem("rih_theme");
    if (theme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  // Listen to 401 session expiration event to clear cached state and redirect
  useEffect(() => {
    const handleSessionExpired = async () => {
      addToast('error', 'Session expired. Logging out.');
      await logout();
    };

    window.addEventListener('rih_session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('rih_session_expired', handleSessionExpired);
    };
  }, [logout]);

  useEffect(() => {
    if (user) {
      refreshAllData();
    }
  }, [user, refreshAllData]);

  const handleSetDarkMode = (dark: boolean) => {
    setDarkMode(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('rih_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('rih_theme', 'light');
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
        backendError,
        signup,
        login,
        loginWithGoogle,
        forgotPassword,
        logout,
        updateUserOnboarding,
        darkMode,
        setDarkMode: handleSetDarkMode,
        transactions,
        summary,
        dashboardCharts,
        dashboardHealth,
        insights,
        insightsLoading,
        insightsText,
        insightsConfidence,
        insightsError,
        chatMessages,
        chatLoading,
        notifications,
        toasts,
        addToast,
        removeToast,
        processCSVData,
        askQuestion,
        addNotification,
        markNotificationsAsRead,
        refreshAnalysis,
        refreshAllData,
        pipelineStatus,
        notificationPreferences,
        notificationHistory,
        fetchNotificationPreferences,
        saveNotificationPreferences,
        fetchNotificationHistory,
        fetchPipelineStatus,
        triggerManualNotification,
        testEmailNotification,
        testWhatsAppNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside an AppProvider');
  }
  return context;
};
