import { FinancialSummary, Transaction, DashboardChartsData, DashboardHealthData, AIInsight } from '../types';

export interface DemoProfile {
  name: string;
  type: string;
  summary: FinancialSummary & {
    revenueScore: number;
    expenseScore: number;
    cashFlowScore: number;
    forecastScore: number;
  };
  charts: DashboardChartsData;
  health: DashboardHealthData;
  transactions: Transaction[];
  insights: AIInsight[];
  alerts: Array<{
    id: string;
    type: 'revenue' | 'expense' | 'cashflow' | 'warning' | 'info';
    severity: 'critical' | 'warning' | 'info';
    title: string;
    desc: string;
    date: string;
  }>;
}

export const demoProfiles: Record<string, DemoProfile> = {
  saas: {
    name: 'SaaS Enterprise',
    type: 'saas',
    summary: {
      totalRevenue: 14850000,
      totalExpenses: 4230000,
      netProfit: 10620000,
      profitMargin: 71.5,
      previousRevenue: 12580000,
      previousExpenses: 4120000,
      previousProfit: 8460000,
      runwayMonths: 36,
      topExpenseCategory: 'Cloud Infrastructure',
      topCustomer: 'Acme Corporate Inc',
      healthScore: 94,
      healthLabel: 'Excellent',
      healthFactors: ['High operating margins', 'Recurring SaaS billing model active', 'Low churn rate (<2% MoM)', 'Cash runway over 36 months'],
      revenueScore: 98,
      expenseScore: 90,
      cashFlowScore: 95,
      forecastScore: 93
    },
    charts: {
      cashFlow: [
        { name: 'May', inflow: 3800000, outflow: 1350000, net: 2450000 },
        { name: 'June', inflow: 4200000, outflow: 1420000, net: 2780000 },
        { name: 'July', inflow: 6850000, outflow: 1460000, net: 5390000 }
      ],
      forecast: [
        { name: 'Jul (A)', actual: 6850000, forecast: 6500000 },
        { name: 'Aug (P)', actual: null, forecast: 7200000 },
        { name: 'Sep (P)', actual: null, forecast: 7850000 },
        { name: 'Oct (P)', actual: null, forecast: 8500000 }
      ],
      expenseCategories: [
        { name: 'Cloud Infrastructure', value: 1650000 },
        { name: 'Engineering Wages', value: 1800000 },
        { name: 'Marketing Ads', value: 450000 },
        { name: 'Software Tooling', value: 330000 }
      ]
    },
    health: {
      healthScore: 94,
      healthLabel: 'Excellent',
      factors: ['High operating margins', 'Recurring SaaS billing model active', 'Low churn rate (<2% MoM)', 'Cash runway over 36 months']
    },
    transactions: [
      { id: 'saas-t1', date: '2026-07-16', merchant: 'AWS Cloud Hosting', category: 'Cloud Infrastructure', amount: 1250000, type: 'outflow', status: 'completed', paymentRisk: 'low' },
      { id: 'saas-t2', date: '2026-07-15', merchant: 'Acme Corporate Inc', category: 'SaaS Invoices', amount: 3500000, type: 'inflow', status: 'completed', paymentRisk: 'low' },
      { id: 'saas-t3', date: '2026-07-14', merchant: 'Google Ads Manager', category: 'Marketing Ads', amount: 450000, type: 'outflow', status: 'completed', paymentRisk: 'low' },
      { id: 'saas-t4', date: '2026-07-12', merchant: 'Framer Design tool', category: 'Software Tooling', amount: 80000, type: 'outflow', status: 'completed', paymentRisk: 'low' },
      { id: 'saas-t5', date: '2026-07-10', merchant: 'Github Enterprise', category: 'Software Tooling', amount: 250000, type: 'outflow', status: 'completed', paymentRisk: 'low' }
    ],
    insights: [
      { id: 'saas-i1', type: 'prediction', title: 'Strong MoM Growth Forecasted', description: 'Revenues are pacing to increase by 12.8% in Q3 due to new contract lock-ins.', severity: 'info', status: 'active', impactAmount: 1850000 },
      { id: 'saas-i2', type: 'recommendation', title: 'Optimize Cloud Server Costs', description: 'Unallocated AWS instances are leading to a 5% leakage. Move to reserved instances.', severity: 'warning', status: 'active', impactAmount: 250000 }
    ],
    alerts: [
      { id: 'saas-a1', type: 'expense', severity: 'warning', title: 'High Cloud Spend', desc: 'AWS Infrastructure bills spiked by 12% compared to June baseline.', date: 'Today 09:30' },
      { id: 'saas-a2', type: 'cashflow', severity: 'info', title: 'Healthy Cash Runway', desc: 'Runway is secure for the next 36 months.', date: 'Yesterday' }
    ]
  },
  retail: {
    name: 'Metropolitan Retail',
    type: 'retail',
    summary: {
      totalRevenue: 8420000,
      totalExpenses: 6120000,
      netProfit: 2300000,
      profitMargin: 27.3,
      previousRevenue: 8950000,
      previousExpenses: 6050000,
      previousProfit: 2900000,
      runwayMonths: 8,
      topExpenseCategory: 'Wholesale Inventory',
      topCustomer: 'Point of Sale (POS)',
      healthScore: 78,
      healthLabel: 'Healthy',
      healthFactors: ['Inventory turnover healthy', 'High wholesale logistics charges', 'Seasonal dip in sales forecast', 'Moderate cash runway (8 months)'],
      revenueScore: 84,
      expenseScore: 72,
      cashFlowScore: 80,
      forecastScore: 76
    },
    charts: {
      cashFlow: [
        { name: 'May', inflow: 2700000, outflow: 1980000, net: 720000 },
        { name: 'June', inflow: 2820000, outflow: 2050000, net: 770000 },
        { name: 'July', inflow: 2900000, outflow: 2090000, net: 810000 }
      ],
      forecast: [
        { name: 'Jul (A)', actual: 2900000, forecast: 3100000 },
        { name: 'Aug (P)', actual: null, forecast: 2750000 },
        { name: 'Sep (P)', actual: null, forecast: 2900000 },
        { name: 'Oct (P)', actual: null, forecast: 3200000 }
      ],
      expenseCategories: [
        { name: 'Wholesale Inventory', value: 3800000 },
        { name: 'Retail Store Rent', value: 1200000 },
        { name: 'Staff Wages', value: 850000 },
        { name: 'Local Marketing', value: 270000 }
      ]
    },
    health: {
      healthScore: 78,
      healthLabel: 'Healthy',
      factors: ['Inventory turnover healthy', 'High wholesale logistics charges', 'Seasonal dip in sales forecast', 'Moderate cash runway (8 months)']
    },
    transactions: [
      { id: 'ret-t1', date: '2026-07-16', merchant: 'Global Logistics Partners', category: 'Wholesale Inventory', amount: 480000, type: 'outflow', status: 'completed', paymentRisk: 'low' },
      { id: 'ret-t2', date: '2026-07-15', merchant: 'Daily POS Sales Register', category: 'Store Sales', amount: 320000, type: 'inflow', status: 'completed', paymentRisk: 'low' },
      { id: 'ret-t3', date: '2026-07-14', merchant: 'Prime Real Estate LLC', category: 'Retail Store Rent', amount: 600000, type: 'outflow', status: 'completed', paymentRisk: 'low' },
      { id: 'ret-t4', date: '2026-07-11', merchant: 'Supreme Textile Supplies', category: 'Wholesale Inventory', amount: 1100000, type: 'outflow', status: 'completed', paymentRisk: 'low' },
      { id: 'ret-t5', date: '2026-07-09', merchant: 'Daily POS Sales Register', category: 'Store Sales', amount: 280000, type: 'inflow', status: 'completed', paymentRisk: 'low' }
    ],
    insights: [
      { id: 'ret-i1', type: 'anomaly', title: 'Inventory Cost Overrun', description: 'Wholesale supplier rates spiked 8.5% this month due to shipping surcharges.', severity: 'warning', status: 'active', impactAmount: 320000 },
      { id: 'ret-i2', type: 'recommendation', title: 'Audit Store Rent Lease', description: 'Landlord offers a 10% discount on upfront quarterly lease payment. Saves ₹120K/yr.', severity: 'info', status: 'active', impactAmount: 120000 }
    ],
    alerts: [
      { id: 'ret-a1', type: 'warning', severity: 'warning', title: 'Inventory Surcharge', desc: 'Textile supply shipping fees rose by 8.5% due to fuel rates.', date: 'Today 08:15' },
      { id: 'ret-a2', type: 'revenue', severity: 'info', title: 'POS Inflow Peak', desc: 'Weekend sales register recorded ₹320K inflow.', date: 'Yesterday' }
    ]
  },
  restaurant: {
    name: 'Gourmet Bistro Group',
    type: 'restaurant',
    summary: {
      totalRevenue: 5200000,
      totalExpenses: 3900000,
      netProfit: 1300000,
      profitMargin: 25.0,
      previousRevenue: 4950000,
      previousExpenses: 3750000,
      previousProfit: 1200000,
      runwayMonths: 4,
      topExpenseCategory: 'Food & Beverage',
      topCustomer: 'Stripe Merchant Payout',
      healthScore: 82,
      healthLabel: 'Stable',
      healthFactors: ['Steady daily cash turnover', 'Food supply costs under inflation pressure', 'High weekend customer volume', 'Short cash buffer (4 months)'],
      revenueScore: 85,
      expenseScore: 78,
      cashFlowScore: 88,
      forecastScore: 77
    },
    charts: {
      cashFlow: [
        { name: 'May', inflow: 1600000, outflow: 1250000, net: 350000 },
        { name: 'June', inflow: 1750000, outflow: 1310000, net: 440000 },
        { name: 'July', inflow: 1850000, outflow: 1340000, net: 510000 }
      ],
      forecast: [
        { name: 'Jul (A)', actual: 1850000, forecast: 1700000 },
        { name: 'Aug (P)', actual: null, forecast: 1950000 },
        { name: 'Sep (P)', actual: null, forecast: 1800000 },
        { name: 'Oct (P)', actual: null, forecast: 2100000 }
      ],
      expenseCategories: [
        { name: 'Food & Beverage', value: 1800000 },
        { name: 'Kitchen & Service Wages', value: 1200000 },
        { name: 'Restaurant Rent', value: 650000 },
        { name: 'Kitchen Upgrades', value: 250000 }
      ]
    },
    health: {
      healthScore: 82,
      healthLabel: 'Stable',
      factors: ['Steady daily cash turnover', 'Food supply costs under inflation pressure', 'High weekend customer volume', 'Short cash buffer (4 months)']
    },
    transactions: [
      { id: 'rest-t1', date: '2026-07-16', merchant: 'Supreme Foods Distributor', category: 'Food & Beverage', amount: 350000, type: 'outflow', status: 'completed', paymentRisk: 'low' },
      { id: 'rest-t2', date: '2026-07-15', merchant: 'Stripe Merchant Payout', category: 'Restaurant Receipts', amount: 890000, type: 'inflow', status: 'completed', paymentRisk: 'low' },
      { id: 'rest-t3', date: '2026-07-13', merchant: 'Metropolitan Utilities', category: 'Restaurant Rent', amount: 120000, type: 'outflow', status: 'completed', paymentRisk: 'low' },
      { id: 'rest-t4', date: '2026-07-11', merchant: 'Catering Equipment Ltd', category: 'Kitchen Upgrades', amount: 250000, type: 'outflow', status: 'completed', paymentRisk: 'low' },
      { id: 'rest-t5', date: '2026-07-08', merchant: 'Fresh Fish Market LLC', category: 'Food & Beverage', amount: 95000, type: 'outflow', status: 'completed', paymentRisk: 'medium' }
    ],
    insights: [
      { id: 'rest-i1', type: 'anomaly', title: 'Food Cost Spikes', description: 'Fresh seafood ingredients rose 18% in cost due to seasonal trade limitations.', severity: 'warning', status: 'active', impactAmount: 95000 },
      { id: 'rest-i2', type: 'recommendation', title: 'Menu Optimization', description: 'Highlighting high-margin pasta/poultry items can boost margins by 4% without client friction.', severity: 'success', status: 'active', impactAmount: 180000 }
    ],
    alerts: [
      { id: 'rest-a1', type: 'warning', severity: 'warning', title: 'Food Inflation', desc: 'Seafood ingredient purchase orders rose by 18% this month.', date: 'Today 10:20' },
      { id: 'rest-a2', type: 'cashflow', severity: 'warning', title: 'Low Cash Buffer', desc: 'Operational runway is constrained at 4 months.', date: '2 Days Ago' }
    ]
  },
  manufacturing: {
    name: 'Precision Heavy Forge',
    type: 'manufacturing',
    summary: {
      totalRevenue: 24500000,
      totalExpenses: 20800000,
      netProfit: 3700000,
      profitMargin: 15.1,
      previousRevenue: 23100000,
      previousExpenses: 19800000,
      previousProfit: 3300000,
      runwayMonths: 5,
      topExpenseCategory: 'Raw Materials & Steel',
      topCustomer: 'General Heavy Engineering',
      healthScore: 65,
      healthLabel: 'Critical Warning',
      healthFactors: ['Critical client concentration (45% reliance)', 'Capital intensive machinery leases', 'Extended billing receivables (Net-90 days)', 'Slim operational cash margins'],
      revenueScore: 72,
      expenseScore: 55,
      cashFlowScore: 60,
      forecastScore: 73
    },
    charts: {
      cashFlow: [
        { name: 'May', inflow: 6500000, outflow: 5800000, net: 700000 },
        { name: 'June', inflow: 7100000, outflow: 6200000, net: 900000 },
        { name: 'July', inflow: 10900000, outflow: 8800000, net: 2100000 }
      ],
      forecast: [
        { name: 'Jul (A)', actual: 10900000, forecast: 9500000 },
        { name: 'Aug (P)', actual: null, forecast: 8200000 },
        { name: 'Sep (P)', actual: null, forecast: 11000000 },
        { name: 'Oct (P)', actual: null, forecast: 9200000 }
      ],
      expenseCategories: [
        { name: 'Raw Materials & Steel', value: 12500000 },
        { name: 'Factory Labor Wages', value: 4800000 },
        { name: 'Machinery Leases', value: 2500000 },
        { name: 'Logistic Freight', value: 1000000 }
      ]
    },
    health: {
      healthScore: 65,
      healthLabel: 'Critical Warning',
      factors: ['Critical client concentration (45% reliance)', 'Capital intensive machinery leases', 'Extended billing receivables (Net-90 days)', 'Slim operational cash margins']
    },
    transactions: [
      { id: 'mfg-t1', date: '2026-07-16', merchant: 'Apex Alloy Smelters', category: 'Raw Materials & Steel', amount: 3500000, type: 'outflow', status: 'completed', paymentRisk: 'low' },
      { id: 'mfg-t2', date: '2026-07-14', merchant: 'General Heavy Engineering', category: 'Enterprise Clients', amount: 8200000, type: 'inflow', status: 'completed', paymentRisk: 'low' },
      { id: 'mfg-t3', date: '2026-07-12', merchant: 'Industrial Machinery Lease Co', category: 'Machinery Leases', amount: 1250000, type: 'outflow', status: 'completed', paymentRisk: 'low' },
      { id: 'mfg-t4', date: '2026-07-10', merchant: 'National Freight Logistics', category: 'Logistic Freight', amount: 480000, type: 'outflow', status: 'completed', paymentRisk: 'medium' },
      { id: 'mfg-t5', date: '2026-07-08', merchant: 'Alloy Smelters Payout', category: 'Raw Materials & Steel', amount: 1500000, type: 'outflow', status: 'pending', paymentRisk: 'low' }
    ],
    insights: [
      { id: 'mfg-i1', type: 'anomaly', title: 'High Client Concentration', description: 'General Heavy Engineering contributes 45% of total inflow receipts. High invoice reliance risk.', severity: 'critical', status: 'active', impactAmount: 8200000 },
      { id: 'mfg-i2', type: 'recommendation', title: 'Invoice Factoring', description: 'Factor your Net-90 enterprise receivables to free up liquidity buffer. Estimated liquidity release ₹4.5M.', severity: 'warning', status: 'active', impactAmount: 4500000 }
    ],
    alerts: [
      { id: 'mfg-a1', type: 'revenue', severity: 'critical', title: 'Concentration Risk', desc: 'A single customer accounts for 45% of monthly revenue.', date: 'Today 11:10' },
      { id: 'mfg-a2', type: 'cashflow', severity: 'warning', title: 'Extended Receivables', desc: 'Net-90 day invoicing delay is putting pressure on runway.', date: 'Yesterday' }
    ]
  },
  coffee: {
    name: 'Aurora Beans & Espresso',
    type: 'coffee',
    summary: {
      totalRevenue: 1820000,
      totalExpenses: 1120000,
      netProfit: 700000,
      profitMargin: 38.5,
      previousRevenue: 1710000,
      previousExpenses: 1090000,
      previousProfit: 620000,
      runwayMonths: 18,
      topExpenseCategory: 'Coffee Beans & Milk',
      topCustomer: 'Card Terminal Receipts',
      healthScore: 89,
      healthLabel: 'Excellent',
      healthFactors: ['Extremely low customer churn', 'Strong margins on specialty coffee beans', 'Daily cash turnover velocity is high', 'Healthy cash reserve (18 months runway)'],
      revenueScore: 92,
      expenseScore: 86,
      cashFlowScore: 90,
      forecastScore: 88
    },
    charts: {
      cashFlow: [
        { name: 'May', inflow: 540000, outflow: 350000, net: 190000 },
        { name: 'June', inflow: 580000, outflow: 370000, net: 210000 },
        { name: 'July', inflow: 700000, outflow: 400000, net: 300000 }
      ],
      forecast: [
        { name: 'Jul (A)', actual: 700000, forecast: 650000 },
        { name: 'Aug (P)', actual: null, forecast: 740000 },
        { name: 'Sep (P)', actual: null, forecast: 780000 },
        { name: 'Oct (P)', actual: null, forecast: 820000 }
      ],
      expenseCategories: [
        { name: 'Coffee Beans & Milk', value: 450000 },
        { name: 'Barista Wages', value: 380000 },
        { name: 'Shop Rent', value: 200000 },
        { name: 'Grinder Repairs', value: 90000 }
      ]
    },
    health: {
      healthScore: 89,
      healthLabel: 'Excellent',
      factors: ['Extremely low customer churn', 'Strong margins on specialty coffee beans', 'Daily cash turnover velocity is high', 'Healthy cash reserve (18 months runway)']
    },
    transactions: [
      { id: 'cof-t1', date: '2026-07-16', merchant: 'Daily Espresso Register', category: 'Coffee Sales', amount: 85000, type: 'inflow', status: 'completed', paymentRisk: 'low' },
      { id: 'cof-t2', date: '2026-07-15', merchant: 'Artisan Roasters Collective', category: 'Coffee Beans & Milk', amount: 120000, type: 'outflow', status: 'completed', paymentRisk: 'low' },
      { id: 'cof-t3', date: '2026-07-14', merchant: 'Urban Properties Co', category: 'Shop Rent', amount: 200000, type: 'outflow', status: 'completed', paymentRisk: 'low' },
      { id: 'cof-t4', date: '2026-07-13', merchant: 'La Marzocco Spares', category: 'Grinder Repairs', amount: 90000, type: 'outflow', status: 'completed', paymentRisk: 'low' },
      { id: 'cof-t5', date: '2026-07-11', merchant: 'Organic Dairy Logistics', category: 'Coffee Beans & Milk', amount: 65000, type: 'outflow', status: 'completed', paymentRisk: 'low' }
    ],
    insights: [
      { id: 'cof-i1', type: 'recommendation', title: 'Bean Subscription Integration', description: 'Integrate custom roasted bean subscription plans for home brewers. Estimated ARR increase +₹150K.', severity: 'success', status: 'active', impactAmount: 150000 },
      { id: 'cof-i2', type: 'anomaly', title: 'Equipment Downtime Loss', description: 'Grinder repairs delayed service by 6 hours. High local sales impact outlier.', severity: 'warning', status: 'active', impactAmount: 45000 }
    ],
    alerts: [
      { id: 'cof-a1', type: 'warning', severity: 'warning', title: 'Equipment Repair Cost', desc: 'Espresso machine maintenance spike cost ₹90K.', date: 'Today 07:45' },
      { id: 'cof-a2', type: 'revenue', severity: 'info', title: 'Coffee Register High', desc: 'POS Daily registration reached record ₹85K.', date: 'Yesterday' }
    ]
  },
  hospital: {
    name: 'Apex Lifecare Institute',
    type: 'hospital',
    summary: {
      totalRevenue: 48250000,
      totalExpenses: 38650000,
      netProfit: 9600000,
      profitMargin: 19.9,
      previousRevenue: 44100000,
      previousExpenses: 36400000,
      previousProfit: 7700000,
      runwayMonths: 24,
      topExpenseCategory: 'Surgical Supplies',
      topCustomer: 'National Health Insurance Corp',
      healthScore: 91,
      healthLabel: 'Excellent',
      healthFactors: ['Consistent patient intake streams', 'High medical equipment leasing costs', 'Government insurance payment lags (Net-60 days)', 'Robust emergency runway buffer (24 months)'],
      revenueScore: 95,
      expenseScore: 84,
      cashFlowScore: 92,
      forecastScore: 93
    },
    charts: {
      cashFlow: [
        { name: 'May', inflow: 13200000, outflow: 11500000, net: 1700000 },
        { name: 'June', inflow: 14800000, outflow: 12100000, net: 2700000 },
        { name: 'July', inflow: 20250000, outflow: 15050000, net: 5200000 }
      ],
      forecast: [
        { name: 'Jul (A)', actual: 20250000, forecast: 18500000 },
        { name: 'Aug (P)', actual: null, forecast: 21500000 },
        { name: 'Sep (P)', actual: null, forecast: 22800000 },
        { name: 'Oct (P)', actual: null, forecast: 24000000 }
      ],
      expenseCategories: [
        { name: 'Surgical Supplies', value: 16500000 },
        { name: 'Physician Salaries', value: 14200000 },
        { name: 'Facility Operations', value: 5400000 },
        { name: 'Medical Insurance', value: 2550050 }
      ]
    },
    health: {
      healthScore: 91,
      healthLabel: 'Excellent',
      factors: ['Consistent patient intake streams', 'High medical equipment leasing costs', 'Government insurance payment lags (Net-60 days)', 'Robust emergency runway buffer (24 months)']
    },
    transactions: [
      { id: 'hosp-t1', date: '2026-07-16', merchant: 'National Health Insurance Corp', category: 'Insurance Payouts', amount: 12500000, type: 'inflow', status: 'completed', paymentRisk: 'low' },
      { id: 'hosp-t2', date: '2026-07-14', merchant: 'Medtronic Cardio Logistics', category: 'Surgical Supplies', amount: 4800000, type: 'outflow', status: 'completed', paymentRisk: 'low' },
      { id: 'hosp-t3', date: '2026-07-12', merchant: 'Siemens Healthineers Lease', category: 'Medical Equipment', amount: 2500000, type: 'outflow', status: 'completed', paymentRisk: 'low' },
      { id: 'hosp-t4', date: '2026-07-10', merchant: 'Global Biotech Waste', category: 'Facility Operations', amount: 350000, type: 'outflow', status: 'completed', paymentRisk: 'medium' },
      { id: 'hosp-t5', date: '2026-07-07', merchant: 'State Compensation Payout', category: 'Insurance Payouts', amount: 3800000, type: 'inflow', status: 'completed', paymentRisk: 'low' }
    ],
    insights: [
      { id: 'hosp-i1', type: 'recommendation', title: 'Fittings Lease Amortization', description: 'Replacing X-Ray equipment leases with direct ownership amortizations saves 15% in financing. Saves ₹350K MoM.', severity: 'success', status: 'active', impactAmount: 350000 },
      { id: 'hosp-i2', type: 'anomaly', title: 'Supply Waste Penalty', description: 'Improper medical waste disposal classification triggered a compliance fine.', severity: 'warning', status: 'active', impactAmount: 85000 }
    ],
    alerts: [
      { id: 'hosp-a1', type: 'warning', severity: 'warning', title: 'Disposal Compliance Surcharge', desc: 'Bio-waste compliance review fee rose to ₹85K.', date: 'Today 11:45' },
      { id: 'hosp-a2', type: 'revenue', severity: 'info', title: 'Insurance Payout Executed', desc: 'Received ₹12.5M from National Health Insurance.', date: 'Yesterday' }
    ]
  }
};
