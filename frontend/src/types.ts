export interface Transaction {
  id: string;
  date: string;
  description?: string;
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
  severity: 'info' | 'warning' | 'critical' | 'success';
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

export interface DashboardOverviewData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin?: number;
  previousRevenue: number;
  previousExpenses: number;
  previousProfit: number;
  runwayMonths: number;
  topExpenseCategory: string;
  topCustomer: string;
}

export interface DashboardCashFlowPoint {
  name: string;
  inflow: number;
  outflow: number;
  net: number;
}

export interface DashboardForecastPoint {
  name: string;
  actual: number | null;
  forecast: number;
}

export interface DashboardExpenseCategoryPoint {
  name: string;
  value: number;
}

export interface DashboardChartsData {
  cashFlow: DashboardCashFlowPoint[];
  forecast: DashboardForecastPoint[];
  expenseCategories: DashboardExpenseCategoryPoint[];
}

export interface DashboardHealthData {
  healthScore: number;
  healthLabel: string;
  factors: string[];
}

export interface FinancialSummary extends DashboardOverviewData {
  healthScore?: number;
  healthLabel?: string;
  healthFactors?: string[];
}

export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}
