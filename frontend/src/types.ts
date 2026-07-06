export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'inflow' | 'outflow';
  status: 'completed' | 'pending' | 'failed';
  merchant: string;
  paymentRisk: 'low' | 'medium' | 'high';
}

export interface KPIMetric {
  title: string;
  value: number;
  percentageChange: number;
  isPositive: boolean;
  trendData: number[];
}

export interface AIInsight {
  id: string;
  type: 'prediction' | 'anomaly' | 'recommendation' | 'general';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'active' | 'dismissed' | 'resolved';
  actionLabel?: string;
  impactAmount?: number;
  confidenceScore?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface ForecastPeriod {
  month: string;
  actual: number | null;
  forecast: number;
  lower: number;
  upper: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  healthScore: number;
  previousRevenue: number;
  previousExpenses: number;
  previousProfit: number;
  runwayMonths: number;
  topExpenseCategory: string;
  topCustomer: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}
