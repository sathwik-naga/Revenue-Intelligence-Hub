import { auth, db } from "../firebase/firebase";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, FinancialSummary, AIInsight, ChatMessage, SystemNotification } from '../types';
import { geminiService } from '../services/geminiService';

interface AppContextType {
  user: any;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  transactions: Transaction[];
  summary: FinancialSummary;
  insights: AIInsight[];
  insightsLoading: boolean;
  insightsText: string;
  insightsConfidence: number;
  chatMessages: ChatMessage[];
  chatLoading: boolean;
  notifications: SystemNotification[];
  toasts: Array<{ id: string; type: string; message: string }>;
  addToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  removeToast: (id: string) => void;
  processCSVData: (csvRows: any[]) => void;
  askQuestion: (question: string) => Promise<void>;
  addNotification: (title: string, desc: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  markNotificationsAsRead: () => void;
  refreshAnalysis: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial professional dummy transactions spanning the last 4 months
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'tx-001', date: '2026-07-04', description: 'Acme Corp Monthly Contract', category: 'SaaS Invoices', amount: 15400, type: 'inflow', status: 'completed', merchant: 'Acme Corp', paymentRisk: 'low' },
  { id: 'tx-002', date: '2026-07-03', description: 'Amazon Web Services Hosting', category: 'Infrastructure', amount: 4820, type: 'outflow', status: 'completed', merchant: 'AWS', paymentRisk: 'low' },
  { id: 'tx-003', date: '2026-07-02', description: 'Google Workspace Licenses', category: 'Software', amount: 240, type: 'outflow', status: 'completed', merchant: 'Google Inc.', paymentRisk: 'low' },
  { id: 'tx-004', date: '2026-07-01', description: 'Stripe Payout - Retail Sales', category: 'SaaS Invoices', amount: 8250, type: 'inflow', status: 'completed', merchant: 'Stripe Payouts', paymentRisk: 'low' },
  { id: 'tx-005', date: '2026-06-28', description: 'Facebook Ad Campaigns', category: 'Marketing', amount: 3200, type: 'outflow', status: 'completed', merchant: 'Meta Platforms', paymentRisk: 'medium' },
  { id: 'tx-006', date: '2026-06-25', description: 'Vercel Pro Analytics', category: 'Software', amount: 120, type: 'outflow', status: 'completed', merchant: 'Vercel', paymentRisk: 'low' },
  { id: 'tx-007', date: '2026-06-24', description: 'Consulting Advisory Services', category: 'Consulting', amount: 5600, type: 'inflow', status: 'completed', merchant: 'Stark Industries', paymentRisk: 'low' },
  { id: 'tx-008', date: '2026-06-20', description: 'Office Rental Fee', category: 'Rent & Office', amount: 2500, type: 'outflow', status: 'completed', merchant: 'WeWork Global', paymentRisk: 'low' },
  { id: 'tx-009', date: '2026-06-18', description: 'Contractor Design Service', category: 'Salaries & Contracts', amount: 4200, type: 'outflow', status: 'completed', merchant: 'Figma Contractor', paymentRisk: 'medium' },
  { id: 'tx-010', date: '2026-06-15', description: 'Acme Corp Milestone 2 Inflow', category: 'SaaS Invoices', amount: 12000, type: 'inflow', status: 'completed', merchant: 'Acme Corp', paymentRisk: 'low' },
  { id: 'tx-011', date: '2026-06-10', description: 'Amazon Web Services Cloud', category: 'Infrastructure', amount: 3410, type: 'outflow', status: 'completed', merchant: 'AWS', paymentRisk: 'low' },
  { id: 'tx-012', date: '2026-06-05', description: 'Github Team Accounts', category: 'Software', amount: 90, type: 'outflow', status: 'completed', merchant: 'GitHub Inc.', paymentRisk: 'low' },
  { id: 'tx-013', date: '2026-05-29', description: 'Inflow - Enterprise Advisory', category: 'Consulting', amount: 9500, type: 'inflow', status: 'completed', merchant: 'Wayne Enterp.', paymentRisk: 'low' },
  { id: 'tx-014', date: '2026-05-25', description: 'Slack Hub Subscription', category: 'Software', amount: 350, type: 'outflow', status: 'completed', merchant: 'Slack Technologies', paymentRisk: 'low' },
  { id: 'tx-015', date: '2026-05-20', description: 'Staff Salaries (June Payout)', category: 'Salaries & Contracts', amount: 18500, type: 'outflow', status: 'completed', merchant: 'Internal payroll', paymentRisk: 'low' },
  { id: 'tx-016', date: '2026-05-15', description: 'Facebook Ad Platform', category: 'Marketing', amount: 2800, type: 'outflow', status: 'completed', merchant: 'Meta Platforms', paymentRisk: 'low' },
  { id: 'tx-017', date: '2026-05-10', description: 'API Usage Surcharges', category: 'Usage Charges', amount: 1800, type: 'inflow', status: 'completed', merchant: 'API client payouts', paymentRisk: 'low' },
  { id: 'tx-018', date: '2026-05-02', description: 'Law firm advisory setup', category: 'Legal', amount: 1500, type: 'outflow', status: 'failed', merchant: 'Wilson & Sons', paymentRisk: 'high' }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    healthScore: 0,
    previousRevenue: 0,
    previousExpenses: 0,
    previousProfit: 0,
    runwayMonths: 0,
    topExpenseCategory: '',
    topCustomer: ''
  });

  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [insightsText, setInsightsText] = useState<string>('');
  const [insightsLoading, setInsightsLoading] = useState<boolean>(false);
  const [insightsConfidence, setInsightsConfidence] = useState<number>(0);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'notif-1',
      title: 'New AI Insight Ready',
      description: 'Your cash runway calculations have been updated based on June transactions.',
      type: 'info',
      timestamp: '1 hour ago',
      read: false
    },
    {
      id: 'notif-2',
      title: 'Anomalous Cost Warning',
      description: 'Infrastructure fees spiked by 42% last week.',
      type: 'warning',
      timestamp: 'Yesterday',
      read: false
    }
  ]);

  const [toasts, setToasts] = useState<Array<{ id: string; type: string; message: string }>>([]);

  // Toast controls
  const addToast = (
  type: 'success' | 'error' | 'warning' | 'info',
  message: string
) => {
  const id = crypto.randomUUID();

  setToasts((prev) => [
    ...prev,
    {
      id,
      type,
      message,
    },
  ]);

  setTimeout(() => removeToast(id), 4000);
};

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth operations
  const login = async (
  email: string,
  password: string
): Promise<boolean> => {
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const firebaseUser = {
      uid: credential.user.uid,
      email: credential.user.email,
      name:
        credential.user.displayName ??
        credential.user.email?.split("@")[0],
      avatar: credential.user.photoURL,
    };

    setUser(firebaseUser);

    addToast("success", `Welcome back ${firebaseUser.name}`);

    return true;
  } catch (error: any) {
    addToast("error", error.message);
    return false;
  }
};

 const logout = async () => {
  await signOut(auth);

  setUser(null);

  addToast("info", "Logged out successfully");
};

  // Add a system notification
  const addNotification = (title: string, desc: string, type: 'info' | 'success' | 'warning' | 'error') => {
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
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Calculate stats from transactions list
  const calculateFinancials = (txs: Transaction[]) => {
    // Current period (July, June, May)
    const inflows = txs.filter((t) => t.type === 'inflow' && t.status === 'completed');
    const outflows = txs.filter((t) => t.type === 'outflow' && t.status === 'completed');

    const totalRev = inflows.reduce((sum, t) => sum + t.amount, 0);
    const totalExp = outflows.reduce((sum, t) => sum + t.amount, 0);
    const netProf = totalRev - totalExp;

    // Previous period aggregates (simulate previous values for growth badges)
    const prevRev = totalRev * 0.92;
    const prevExp = totalExp * 0.95;
    const prevProf = prevRev - prevExp;

    // Find top expense category
    const categoryTotals: Record<string, number> = {};
    outflows.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    let topExpCat = 'N/A';
    let maxExp = 0;
    Object.entries(categoryTotals).forEach(([cat, val]) => {
      if (val > maxExp) {
        maxExp = val;
        topExpCat = cat;
      }
    });

    // Find top customer (inflow)
    const customerTotals: Record<string, number> = {};
    inflows.forEach((t) => {
      customerTotals[t.merchant] = (customerTotals[t.merchant] || 0) + t.amount;
    });
    let topCust = 'N/A';
    let maxCust = 0;
    Object.entries(customerTotals).forEach(([cust, val]) => {
      if (val > maxCust) {
        maxCust = val;
        topCust = cust;
      }
    });

    // Health Score calculation (simple logic out of 100)
    // Positive factors: Net profit margin, low failed transactions, short term cash buffer
    const profitMargin = totalRev > 0 ? (netProf / totalRev) : 0;
    const failedTxs = txs.filter((t) => t.status === 'failed').length;
    let score = 50; // base score
    score += Math.round(profitMargin * 35); // profit margin contributes up to 35 points
    score -= failedTxs * 5; // deduct 5 points per failure
    if (netProf > 0) score += 15;
    score = Math.max(10, Math.min(100, score));

    // Runway calculation (Cash Runway)
    const avgMonthlyBurn = totalExp / 3;
    const mockCashReserve = 120000; // Simulated business checking reserve
    const runway = avgMonthlyBurn > 0 ? Math.round((mockCashReserve + netProf) / avgMonthlyBurn) : 12;

    setSummary({
      totalRevenue: totalRev,
      totalExpenses: totalExp,
      netProfit: netProf,
      healthScore: score,
      previousRevenue: prevRev,
      previousExpenses: prevExp,
      previousProfit: prevProf,
      runwayMonths: runway,
      topExpenseCategory: topExpCat,
      topCustomer: topCust
    });
  };

  // Recalculates financials whenever transactions list changes
  useEffect(() => {
    calculateFinancials(transactions);
  }, [transactions]);

  // Load user session from cache on start
 // Restore Firebase session on app start
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name:
          firebaseUser.displayName ||
          firebaseUser.email?.split("@")[0],
        avatar: firebaseUser.photoURL,
      });
    } else {
      setUser(null);
    }
  });

  // Load theme
  const theme = localStorage.getItem("rih_theme");

  if (theme === "dark") {
    setDarkMode(true);
    document.documentElement.classList.add("dark");
  } else {
    setDarkMode(false);
    document.documentElement.classList.remove("dark");
  }

  return () => unsubscribe();
}, []);

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

  // Perform AI analysis update
  const refreshAnalysis = async () => {
    setInsightsLoading(true);
    try {
      const result = await geminiService.analyzeFinancials(transactions, summary);
      console.log("Result:", result);
      console.log("Analysis Length:", result.analysisText.length);
      console.log(result.analysisText);
      setInsights(result.insights);
      setInsightsText(result.analysisText);
      setInsightsConfidence(result.confidenceScore);
      
      // Initialize first model chat welcome message
      setChatMessages([
        {
          id: 'welcome',
          role: 'model',
          text: `Hello! I have completed analyzing your business ledger. Your financial health score is currently **${summary.healthScore}/100**. How can I help optimize your margins today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      addNotification('AI Analysis Complete', 'Gemini successfully generated financial recommendations & runway models.', 'success');
    } catch (error) {
      console.error(error);
      addToast('error', 'AI analysis failed. Please check network connection.');
    } finally {
      setInsightsLoading(false);
    }
  };

  // Whenever summary changes, trigger AI re-run (e.g. after upload)
  useEffect(() => {
    if (summary.totalRevenue > 0) {
      refreshAnalysis();
    }
  }, [summary.totalRevenue]);

  // Process rows from CSV parser 
const processCSVData = (csvRows: any[]) => {
  addToast("info", "Parsing uploaded statement files...");

  const newTransactions: Transaction[] = csvRows
    .filter((row) => row.Date || row.date || row.Amount || row.amount)
    .map((row, index) => {
      const date =
        row.Date || row.date || new Date().toISOString().split("T")[0];

      const description =
        row.Description || row.description || "Raw Transaction";

      const category =
        row.Category || row.category || "Uncategorized";

      const rawAmount = parseFloat(row.Amount || row.amount || "0");
      const amount = Math.abs(rawAmount);

      let type: "inflow" | "outflow" =
        rawAmount >= 0 ? "inflow" : "outflow";

      if (row.Type || row.type) {
        const rawType = String(row.Type || row.type).toLowerCase();

        if (
          rawType.includes("expense") ||
          rawType.includes("debit") ||
          rawType.includes("out")
        ) {
          type = "outflow";
        } else {
          type = "inflow";
        }
      }

      return {
        id: `csv-${Date.now()}-${index}`,
        date,
        description,
        category,
        amount,
        type,
        status: row.Status || row.status || "completed",
        merchant:
          row.Merchant ||
          row.merchant ||
          description.split(" ")[0] ||
          "Unknown",
        paymentRisk: row.Risk || row.risk || "low",
      } as Transaction;
    });

  if (newTransactions.length === 0) {
    addToast("error", "No valid transactions found in CSV.");
    return;
  }

  const uploadTransactions = async () => {
    try {
      // Save transactions to Firestore
      for (const transaction of newTransactions) {
        await addDoc(collection(db, "transactions"), transaction);
      }

      // Reload all transactions
      const snapshot = await getDocs(collection(db, "transactions"));

      const firestoreTransactions: Transaction[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...(doc.data() as Omit<Transaction, "id">),
          }) as Transaction
      );

      setTransactions(firestoreTransactions);

      addToast(
        "success",
        `${newTransactions.length} transactions uploaded successfully!`
      );

      addNotification(
        "CSV Data Integrated",
        `${newTransactions.length} transactions saved to Firestore.`,
        "success"
      );
    } catch (error) {
      console.error(error);

      addToast(
        "error",
        "Failed to upload transactions to Firestore."
      );
    }
  };

  uploadTransactions();
};

  // AI Q&A panel triggers
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
      const response = await geminiService.askAIQuestion(text, transactions, summary);
      
      const modelMsg: ChatMessage = {
        id: `chat-${Date.now()}-model`,
        role: 'model',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages((prev) => [...prev, modelMsg]);
    } catch (e) {
      console.error(e);
      addToast('error', 'Failed to retrieve AI answer');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        darkMode,
        setDarkMode: handleSetDarkMode,
        transactions,
        summary,
        insights,
        insightsLoading,
        insightsText,
        insightsConfidence,
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
        refreshAnalysis
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
