import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import {
  Download,
  Printer,
  Sparkles
} from 'lucide-react';

export const Reports: React.FC = () => {
  const { summary, transactions, addToast } = useApp();
  const [reportType, setReportType] = useState<'income' | 'transactions'>('income');

  const fmt = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Compile transaction sums by category
  const categoriesMap: Record<string, { inflows: number; outflows: number }> = {};
  transactions
    .filter((t) => t.status === 'completed')
    .forEach((t) => {
      if (!categoriesMap[t.category]) {
        categoriesMap[t.category] = { inflows: 0, outflows: 0 };
      }
      if (t.type === 'inflow') {
        categoriesMap[t.category].inflows += t.amount;
      } else {
        categoriesMap[t.category].outflows += t.amount;
      }
    });

  // Export full transaction table to CSV file
  const exportCSVReport = () => {
    const headers = 'ID,Date,Description,Category,Amount,Type,Status,Merchant,Risk\n';
    const csvContent = transactions.map((t) => {
      return `"${t.id}","${t.date}","${t.description.replace(/"/g, '""')}","${t.category}",${t.amount},"${t.type}","${t.status}","${t.merchant}","${t.paymentRisk}"`;
    }).join('\n');

    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + csvContent));
    downloadLink.setAttribute('download', `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    addToast('success', 'CSV spreadsheet compiled & downloaded!');
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:p-0 print:bg-white">
      {/* Page Heading (hidden on print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight my-0">
            Financial Statements & Reports
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Export structured P&L accounts, balance summaries, and audit ledgers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerPrint}
            className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50 text-slate-655 dark:text-slate-200 rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold"
          >
            <Printer size={14} />
            Print Report
          </button>
          <button
            onClick={exportCSVReport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl shadow-md shadow-blue-500/10 transition-all flex items-center gap-2 text-xs font-bold"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Report Switcher (hidden on print) */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 pb-px print:hidden">
        <button
          onClick={() => setReportType('income')}
          className={`pb-3 font-bold text-sm border-b-2 transition-all ${
            reportType === 'income'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Operating Income Statement (P&L)
        </button>
        <button
          onClick={() => setReportType('transactions')}
          className={`pb-3 font-bold text-sm border-b-2 transition-all ${
            reportType === 'transactions'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Transaction Audits Ledger
        </button>
      </div>

      {/* REPORT CONTENT PANEL */}
      <motion.div
        key={reportType}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl shadow-sm space-y-6 print:border-0 print:bg-white print:p-0"
      >
        {reportType === 'income' ? (
          /* INCOME STATEMENT */
          <div className="space-y-6">
            <div className="text-center pb-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white print:text-black">
                Profit & Loss Statement (P&L)
              </h3>
              <p className="text-xs text-slate-450 dark:text-slate-500 mt-1 uppercase tracking-wider font-bold">
                Operating Period: Q2-Q3 2026
              </p>
            </div>

            {/* Income breakdown table */}
            <div className="space-y-4">
              <h4 className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                1. Gross Revenues
              </h4>
              <div className="border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <tbody>
                    <tr className="bg-slate-50/40 dark:bg-slate-950/20 font-bold border-b border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white">
                      <td className="p-3">Total Inflow Receipts</td>
                      <td className="p-3 text-right text-emerald-500">{fmt(summary.totalRevenue)}</td>
                    </tr>
                    {Object.entries(categoriesMap).map(([cat, val]) => {
                      if (val.inflows === 0) return null;
                      return (
                        <tr key={cat} className="border-b border-slate-100 dark:border-slate-800/50 text-slate-655 dark:text-slate-400">
                          <td className="p-3 pl-6">{cat} receipts</td>
                          <td className="p-3 text-right">{fmt(val.inflows)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h4 className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                2. Operating Expenditures
              </h4>
              <div className="border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <tbody>
                    <tr className="bg-slate-50/40 dark:bg-slate-950/20 font-bold border-b border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white">
                      <td className="p-3">Total Outflow Charges</td>
                      <td className="p-3 text-right text-rose-500">{fmt(summary.totalExpenses)}</td>
                    </tr>
                    {Object.entries(categoriesMap).map(([cat, val]) => {
                      if (val.outflows === 0) return null;
                      return (
                        <tr key={cat} className="border-b border-slate-100 dark:border-slate-800/50 text-slate-655 dark:text-slate-400">
                          <td className="p-3 pl-6">{cat} expenditures</td>
                          <td className="p-3 text-right">{fmt(val.outflows)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Profit summary banner */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center font-extrabold text-sm">
              <span className="text-slate-700 dark:text-slate-350">Net Operational Profits</span>
              <span className={summary.netProfit >= 0 ? 'text-emerald-500 text-base' : 'text-rose-500 text-base'}>
                {fmt(summary.netProfit)}
              </span>
            </div>

            {/* AI Auditor Overview (hidden on print) */}
            <div className="p-4 border border-blue-100 dark:border-blue-900/20 bg-blue-50/20 dark:bg-blue-950/5 rounded-xl space-y-2 print:hidden">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs">
                <Sparkles size={14} />
                AI Auditor Summary Notes
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Operating net income shows growth MoM, heavily backed by accounts receivable from {summary.topCustomer}. Outflows are concentrated in {summary.topExpenseCategory}. Budget revisions are recommended to optimize runways.
              </p>
            </div>
          </div>
        ) : (
          /* TRANSACTION LOGS STATEMENT */
          <div className="space-y-6">
            <div className="text-center pb-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white print:text-black">
                Transaction Audits Ledger
              </h3>
              <p className="text-xs text-slate-450 dark:text-slate-500 mt-1 uppercase tracking-wider font-bold">
                Historical record
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 font-extrabold text-slate-400 uppercase">
                    <th className="py-2.5 pr-2">Date</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Risk</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 pl-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {transactions.map((t) => (
                    <tr key={t.id} className="text-slate-800 dark:text-slate-350">
                      <td className="py-3 pr-2 font-semibold">{t.date}</td>
                      <td className="py-3 px-3 font-bold">{t.merchant}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 uppercase text-[10px] font-bold">{t.paymentRisk}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className={`py-3 pl-2 text-right font-bold ${t.type === 'inflow' ? 'text-emerald-500' : ''}`}>
                        {t.type === 'inflow' ? '+' : '-'}{fmt(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
export default Reports;
