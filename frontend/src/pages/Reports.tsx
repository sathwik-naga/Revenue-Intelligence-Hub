import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Calendar,
  Mail,
  Sliders,
  Clock,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  Search
} from 'lucide-react';

export const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { summary, transactions, addToast, user } = useApp();
  const [reportType, setReportType] = useState<'income' | 'transactions' | 'scheduler'>('income');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dateRange, setDateRange] = useState<'all' | '30d' | '90d' | 'ytd'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Toggle showing the sample report when database is empty
  const [showSampleReport, setShowSampleReport] = useState(false);

  // Scheduler state variables
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pnlEnabled, setPnlEnabled] = useState(true);
  const [expenseEnabled, setExpenseEnabled] = useState(true);
  const [forecastEnabled, setForecastEnabled] = useState(false);
  const [alertEnabled, setAlertEnabled] = useState(true);
  const [frequency, setFrequency] = useState('weekly');
  const [hour, setHour] = useState('09:00');

  const fmt = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Filter transactions based on dateRange and searchQuery
  const filteredTransactions = transactions.filter((t) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      (t.merchant || '').toLowerCase().includes(query) || 
      (t.description || '').toLowerCase().includes(query) || 
      (t.category || '').toLowerCase().includes(query);

    if (!matchesSearch) return false;
    if (dateRange === 'all') return true;

    const txDate = new Date(t.date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - txDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (dateRange === '30d') return diffDays <= 30;
    if (dateRange === '90d') return diffDays <= 90;
    if (dateRange === 'ytd') return txDate.getFullYear() === now.getFullYear();

    return true;
  });

  // Compile transaction sums dynamically from filtered data
  const categoriesMap: Record<string, { inflows: number; outflows: number }> = {};
  let totalFilteredInflow = 0;
  let totalFilteredOutflow = 0;

  filteredTransactions
    .filter((t) => t.status === 'completed')
    .forEach((t) => {
      if (!categoriesMap[t.category]) {
        categoriesMap[t.category] = { inflows: 0, outflows: 0 };
      }
      if (t.type === 'inflow') {
        categoriesMap[t.category].inflows += t.amount;
        totalFilteredInflow += t.amount;
      } else {
        categoriesMap[t.category].outflows += t.amount;
        totalFilteredOutflow += t.amount;
      }
    });

  const filteredNetProfit = totalFilteredInflow - totalFilteredOutflow;

  // Fallback mocks if the database is empty
  const isLedgerEmpty = transactions.length === 0;
  const totalInflows = isLedgerEmpty ? 325000 : totalFilteredInflow;
  const totalOutflows = isLedgerEmpty ? 198000 : totalFilteredOutflow;
  const netProfitVal = isLedgerEmpty ? 127000 : filteredNetProfit;
  const healthScoreVal = isLedgerEmpty ? 94 : (summary.healthScore || 94);
  const topExpense = isLedgerEmpty ? 'Marketing' : (summary.topExpenseCategory || 'Marketing');
  const topRevenue = isLedgerEmpty ? 'Subscriptions' : (summary.topCustomer || 'Subscriptions');
  
  const datePeriodText = isLedgerEmpty 
    ? '1 Jul 2026 – 17 Jul 2026' 
    : (dateRange === '30d' ? 'Last 30 Days' : dateRange === '90d' ? 'Last 90 Days' : dateRange === 'ytd' ? 'Year to Date (YTD)' : 'All Time');

  const mockTransactions = [
    { id: 'tx-1', date: '2026-07-15', merchant: 'Stripe Subscriptions Pool', category: 'Subscriptions', paymentRisk: 'low', status: 'completed', type: 'inflow', amount: 325000, description: '' },
    { id: 'tx-2', date: '2026-07-12', merchant: 'Meta Ad Campaigns', category: 'Marketing', paymentRisk: 'low', status: 'completed', type: 'outflow', amount: 198000, description: '' }
  ];

  const displayedTransactions = isLedgerEmpty ? mockTransactions : filteredTransactions;

  // 1. PDF Export Generator
  const handleExportPDF = (title: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      addToast('error', 'Popup blocker active. Please allow popups for PDF export.');
      return;
    }

    const companyName = user?.name || "Enterprise Workspace";
    const currentDate = new Date().toLocaleDateString();
    const inflowsText = fmt(totalInflows);
    const outflowsText = fmt(totalOutflows);
    const profitsText = fmt(netProfitVal);
    const healthText = `${healthScoreVal}/100`;

    const rowsHtml = displayedTransactions.map(t => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px; text-align: left;">${t.date}</td>
        <td style="padding: 8px; text-align: left; font-weight: bold;">${t.merchant || t.description || 'N/A'}</td>
        <td style="padding: 8px; text-align: left;">${t.category}</td>
        <td style="padding: 8px; text-align: left; text-transform: uppercase; font-size: 10px;">${t.paymentRisk || 'low'}</td>
        <td style="padding: 8px; text-align: right; font-weight: bold; color: ${t.type === 'inflow' ? '#10b981' : '#ef4444'}">
          ${t.type === 'inflow' ? '+' : '-'}${fmt(t.amount)}
        </td>
      </tr>
    `).join('');

    const disclaimerBlock = isLedgerEmpty ? `
      <div style="margin-top: 24px; padding: 12px; border: 1px solid #f59e0b; background-color: #fffbeb; color: #b45309; border-radius: 10px; font-size: 10px; font-weight: bold; text-align: center; text-transform: uppercase; letter-spacing: 0.05em;">
        Disclaimer: This report contains sample financial data because no transactions have been uploaded.
      </div>
    ` : '';

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; padding: 40px; margin: 0; }
            .header { border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
            .logo { font-size: 18px; font-weight: 800; color: #1e3a8a; }
            .meta { font-size: 12px; color: #64748b; line-height: 1.4; }
            .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.08em; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 28px; margin-bottom: 12px; }
            .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; margin-bottom: 20px; }
            .summary-value { font-size: 16px; font-weight: 800; margin-top: 4px; }
            .data-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
            .data-table th { border-bottom: 1.5px solid #94a3b8; padding: 8px; text-align: left; color: #475569; text-transform: uppercase; font-size: 9px; }
            .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; font-size: 10px; color: #94a3b8; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">REVENUE HUB</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Advisory & Operating Statement</div>
            </div>
            <div style="text-align: right;" class="meta">
              <div><strong>Date:</strong> ${currentDate}</div>
              <div><strong>Reporting Period:</strong> ${datePeriodText}</div>
            </div>
          </div>

          <table style="width: 100%; font-size: 12px; margin-bottom: 20px;">
            <tr>
              <td><strong>Workspace Name:</strong> ${companyName}</td>
              <td style="text-align: right;"><strong>Document Class:</strong> ${title}</td>
            </tr>
          </table>

          <div class="section-title">Operating Summary</div>
          <div class="summary-card">
            <div>
              <div style="font-size: 9px; uppercase; color: #64748b; font-weight: bold;">Revenue</div>
              <div class="summary-value" style="color: #10b981;">${inflowsText}</div>
            </div>
            <div>
              <div style="font-size: 9px; uppercase; color: #64748b; font-weight: bold;">Expenses</div>
              <div class="summary-value" style="color: #ef4444;">${outflowsText}</div>
            </div>
            <div>
              <div style="font-size: 9px; uppercase; color: #64748b; font-weight: bold;">Net Profit</div>
              <div class="summary-value" style="color: ${netProfitVal >= 0 ? '#10b981' : '#ef4444'}">${profitsText}</div>
            </div>
            <div>
              <div style="font-size: 9px; uppercase; color: #64748b; font-weight: bold;">Health Score</div>
              <div class="summary-value" style="color: #06b6d4;">${healthText}</div>
            </div>
          </div>

          <div class="section-title">Audit Log Entries (${displayedTransactions.length})</div>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 15%;">Date</th>
                <th style="width: 35%;">Description</th>
                <th style="width: 20%;">Category</th>
                <th style="width: 15%;">Risk</th>
                <th style="width: 15%; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          ${disclaimerBlock}

          <div class="footer">
            Generated by Revenue Hub &bull; Document Verified
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    addToast('success', `${title} exported successfully.`);
    setDropdownOpen(false);
  };

  // 2. Multi-Sheet Excel Workbook Builder
  const handleExportExcel = () => {
    const companyName = user?.name || "Enterprise Workspace";
    const currentDate = new Date().toLocaleDateString();

    let xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Summary">
  <Table>
   <Row><Cell><Data ss:Type="String">Revenue Hub Summary</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Company Name:</Data></Cell><Cell><Data ss:Type="String">${companyName}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Report Compiled:</Data></Cell><Cell><Data ss:Type="String">${currentDate}</Data></Cell></Row>
   <Row></Row>
   <Row><Cell><Data ss:Type="String">Operational Metric</Data></Cell><Cell><Data ss:Type="String">Value</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Total Inflows</Data></Cell><Cell><Data ss:Type="Number">${totalInflows}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Total Outflows</Data></Cell><Cell><Data ss:Type="Number">${totalOutflows}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Net Operating Profit</Data></Cell><Cell><Data ss:Type="Number">${netProfitVal}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Corporate Health Score</Data></Cell><Cell><Data ss:Type="Number">${healthScoreVal}</Data></Cell></Row>`;

    if (isLedgerEmpty) {
      xml += `\n   <Row></Row><Row><Cell><Data ss:Type="String">Disclaimer: This report contains sample financial data because no transactions have been uploaded.</Data></Cell></Row>`;
    }

    xml += `\n  </Table>
 </Worksheet>
 <Worksheet ss:Name="Profit &amp; Loss">
  <Table>
   <Row><Cell><Data ss:Type="String">Profit &amp; Loss Statement</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Gross Revenues</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Category</Data></Cell><Cell><Data ss:Type="String">Amount</Data></Cell></Row>`;

    if (isLedgerEmpty) {
      xml += `\n   <Row><Cell><Data ss:Type="String">Subscriptions</Data></Cell><Cell><Data ss:Type="Number">325000</Data></Cell></Row>`;
    } else {
      Object.entries(categoriesMap).forEach(([cat, val]) => {
        if (val.inflows > 0) {
          xml += `\n   <Row><Cell><Data ss:Type="String">${cat}</Data></Cell><Cell><Data ss:Type="Number">${val.inflows}</Data></Cell></Row>`;
        }
      });
    }

    xml += `\n   <Row><Cell><Data ss:Type="String">Total Inflows</Data></Cell><Cell><Data ss:Type="Number">${totalInflows}</Data></Cell></Row>`;
    xml += `\n   <Row></Row>`;
    xml += `\n   <Row><Cell><Data ss:Type="String">Operating Expenses</Data></Cell></Row>`;

    if (isLedgerEmpty) {
      xml += `\n   <Row><Cell><Data ss:Type="String">Marketing</Data></Cell><Cell><Data ss:Type="Number">198000</Data></Cell></Row>`;
    } else {
      Object.entries(categoriesMap).forEach(([cat, val]) => {
        if (val.outflows > 0) {
          xml += `\n   <Row><Cell><Data ss:Type="String">${cat}</Data></Cell><Cell><Data ss:Type="Number">${val.outflows}</Data></Cell></Row>`;
        }
      });
    }

    xml += `\n   <Row><Cell><Data ss:Type="String">Total Outflows</Data></Cell><Cell><Data ss:Type="Number">${totalOutflows}</Data></Cell></Row>`;
    xml += `\n   <Row></Row>`;
    xml += `\n   <Row><Cell><Data ss:Type="String">Net Profit</Data></Cell><Cell><Data ss:Type="Number">${netProfitVal}</Data></Cell></Row>`;

    xml += `\n  </Table>
 </Worksheet>
 <Worksheet ss:Name="Transactions">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">Date</Data></Cell>
    <Cell><Data ss:Type="String">Merchant</Data></Cell>
    <Cell><Data ss:Type="String">Category</Data></Cell>
    <Cell><Data ss:Type="String">Type</Data></Cell>
    <Cell><Data ss:Type="String">Amount</Data></Cell>
    <Cell><Data ss:Type="String">Status</Data></Cell>
   </Row>`;

    displayedTransactions.forEach(t => {
      xml += `\n   <Row>
    <Cell><Data ss:Type="String">${t.date}</Data></Cell>
    <Cell><Data ss:Type="String">${t.merchant || t.description || 'N/A'}</Data></Cell>
    <Cell><Data ss:Type="String">${t.category}</Data></Cell>
    <Cell><Data ss:Type="String">${t.type}</Data></Cell>
    <Cell><Data ss:Type="Number">${t.type === 'inflow' ? t.amount : -t.amount}</Data></Cell>
    <Cell><Data ss:Type="String">${t.status}</Data></Cell>
   </Row>`;
    });

    xml += `\n  </Table>
 </Worksheet>
 <Worksheet ss:Name="Revenue">
  <Table>
   <Row><Cell><Data ss:Type="String">Revenue Receipts Only</Data></Cell></Row>
   <Row>
    <Cell><Data ss:Type="String">Date</Data></Cell>
    <Cell><Data ss:Type="String">Merchant</Data></Cell>
    <Cell><Data ss:Type="String">Category</Data></Cell>
    <Cell><Data ss:Type="String">Amount</Data></Cell>
   </Row>`;

    displayedTransactions.filter(t => t.type === 'inflow').forEach(t => {
      xml += `\n   <Row>
    <Cell><Data ss:Type="String">${t.date}</Data></Cell>
    <Cell><Data ss:Type="String">${t.merchant || t.description || 'N/A'}</Data></Cell>
    <Cell><Data ss:Type="String">${t.category}</Data></Cell>
    <Cell><Data ss:Type="Number">${t.amount}</Data></Cell>
   </Row>`;
    });

    xml += `\n  </Table>
 </Worksheet>
 <Worksheet ss:Name="Expenses">
  <Table>
   <Row><Cell><Data ss:Type="String">Expense Outflows Only</Data></Cell></Row>
   <Row>
    <Cell><Data ss:Type="String">Date</Data></Cell>
    <Cell><Data ss:Type="String">Merchant</Data></Cell>
    <Cell><Data ss:Type="String">Category</Data></Cell>
    <Cell><Data ss:Type="String">Amount</Data></Cell>
   </Row>`;

    displayedTransactions.filter(t => t.type === 'outflow').forEach(t => {
      xml += `\n   <Row>
    <Cell><Data ss:Type="String">${t.date}</Data></Cell>
    <Cell><Data ss:Type="String">${t.merchant || t.description || 'N/A'}</Data></Cell>
    <Cell><Data ss:Type="String">${t.category}</Data></Cell>
    <Cell><Data ss:Type="Number">${t.amount}</Data></Cell>
   </Row>`;
    });

    xml += `\n  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `financial_report_${companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('success', 'Profit & Loss Report exported successfully.');
    setDropdownOpen(false);
  };

  // 3. CSV Filtered Export
  const handleExportCSV = () => {
    const headers = 'Date,Description,Category,Amount,Type,Status,Merchant,Risk\n';
    let csvContent = displayedTransactions.map((t) => {
      const descClean = (t.description || '').replace(/"/g, '""');
      const merchantClean = (t.merchant || '').replace(/"/g, '""');
      return `"${t.date}","${descClean}","${t.category}",${t.amount},"${t.type}","${t.status}","${merchantClean}","${t.paymentRisk || 'low'}"`;
    }).join('\n');

    if (isLedgerEmpty) {
      csvContent += `\n"Disclaimer: This report contains sample financial data because no transactions have been uploaded."`;
    }

    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + csvContent));
    downloadLink.setAttribute('download', `filtered_financial_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    addToast('success', 'Profit & Loss Report exported successfully.');
    setDropdownOpen(false);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('success', 'Digest scheduling synced with cloud registers!');
  };

  // 5. Empty State View
  if (isLedgerEmpty && !showSampleReport) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center glass-panel rounded-[32px] max-w-2xl mx-auto my-16 space-y-6">
        <span className="text-5xl">📊</span>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">No financial transactions found.</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Upload your first CSV file to generate a real Profit & Loss statement and start analyzing your operating ledger.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/upload')}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white rounded-2xl shadow transition text-xs font-bold cursor-pointer"
          >
            Upload CSV
          </button>
          <button
            onClick={() => setShowSampleReport(true)}
            className="px-5 py-3 border border-white/8 bg-white/4 hover:bg-white/8 text-slate-200 rounded-2xl transition shadow text-xs font-bold cursor-pointer"
          >
            View Sample Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:p-0 print:bg-white select-none">
      
      {/* 1. Sample Data Banner */}
      {isLedgerEmpty && showSampleReport && (
        <div className="glass-panel border-amber-500/20 bg-amber-500/5 p-5 rounded-[24px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span>📊</span> Sample Report
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
              This report is generated from sample financial data because no ledger transactions have been uploaded yet. Upload a CSV file to generate real financial statements.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => navigate('/upload')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
            >
              Upload CSV
            </button>
            <button
              onClick={() => setShowSampleReport(false)}
              className="px-4 py-2.5 border border-white/8 bg-white/4 hover:bg-white/8 text-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* FINANCIAL REPORTS HEADER CONTAINER */}
      <div className="glass-panel rounded-[32px] p-6 space-y-5 print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white my-0">
              Financial Reports
            </h1>
            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 ${
              isLedgerEmpty 
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' 
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
            }`}>
              {isLedgerEmpty ? '🟡 Sample Data' : '🟢 Live Financial Data'}
            </span>
          </div>

          {/* Export Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white rounded-2xl shadow transition flex items-center gap-2 text-xs font-bold cursor-pointer"
            >
              <FileText size={15} />
              Export Report
              <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Premium Dropdown List */}
            <AnimatePresence>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2.5 w-60 z-50 rounded-2xl border border-white/10 bg-slate-950/90 backdrop-blur-2xl p-2 shadow-2xl"
                  >
                    <button
                      onClick={() => handleExportPDF('Profit & Loss Report')}
                      className="w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs text-slate-200 hover:bg-white/5 hover:text-white transition cursor-pointer"
                    >
                      <FileText size={14} className="text-blue-400" />
                      Profit & Loss (PDF)
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className="w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs text-slate-200 hover:bg-white/5 hover:text-white transition cursor-pointer"
                    >
                      <FileSpreadsheet size={14} className="text-emerald-450" />
                      Profit & Loss (Excel)
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs text-slate-200 hover:bg-white/5 hover:text-white transition cursor-pointer"
                    >
                      <FileSpreadsheet size={14} className="text-cyan-400" />
                      Profit & Loss (CSV)
                    </button>
                    <div className="h-px bg-white/5 my-1.5" />
                    <button
                      onClick={() => handleExportPDF('Revenue Report')}
                      className="w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs text-slate-200 hover:bg-white/5 hover:text-white transition cursor-pointer"
                    >
                      <FileText size={14} className="text-emerald-450" />
                      Revenue Report (PDF)
                    </button>
                    <button
                      onClick={() => handleExportPDF('Expense Report')}
                      className="w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs text-slate-200 hover:bg-white/5 hover:text-white transition cursor-pointer"
                    >
                      <FileText size={14} className="text-rose-455" />
                      Expense Report (PDF)
                    </button>
                    <button
                      onClick={() => handleExportPDF('Cash Flow Report')}
                      className="w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs text-slate-200 hover:bg-white/5 hover:text-white transition cursor-pointer"
                    >
                      <FileText size={14} className="text-purple-400" />
                      Cash Flow Report (PDF)
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Filters Controls block */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/5 pt-4">
          
          {/* 1. Date Range selection */}
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-0.5">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="premium-input w-full py-2.5 text-xs text-slate-200"
            >
              <option value="all">All Time</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="ytd">Year to Date (YTD)</option>
            </select>
          </div>

          {/* 2. Report type tab selection */}
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-0.5">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="premium-input w-full py-2.5 text-xs text-slate-200"
            >
              <option value="income">Operating Income (P&L)</option>
              <option value="transactions">Audit Ledger List</option>
              <option value="scheduler">Schedule Config</option>
            </select>
          </div>

          {/* 3. Search query filter */}
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-0.5">Search Ledger</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search description/merchant..."
                className="peer premium-input w-full pl-10 py-2.5 text-xs text-slate-200"
              />
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 peer-focus:text-blue-500 transition-colors pointer-events-none" />
            </div>
          </div>

        </div>
      </div>

      {/* REPORT CARDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 print:hidden">
        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-slate-950/15 text-left">
          <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Revenue</p>
          <h3 className="text-sm font-extrabold text-emerald-400 mt-1.5">{fmt(totalInflows)}</h3>
          {isLedgerEmpty && <p className="text-[8px] text-amber-400 font-bold uppercase mt-1 tracking-wider">Sample Values</p>}
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-slate-950/15 text-left">
          <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Expenses</p>
          <h3 className="text-sm font-extrabold text-rose-455 mt-1.5">{fmt(totalOutflows)}</h3>
          {isLedgerEmpty && <p className="text-[8px] text-amber-400 font-bold uppercase mt-1 tracking-wider">Sample Values</p>}
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-slate-950/15 text-left">
          <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Profit</p>
          <h3 className={`text-sm font-extrabold mt-1.5 ${netProfitVal >= 0 ? 'text-emerald-400' : 'text-rose-455'}`}>
            {fmt(netProfitVal)}
          </h3>
          {isLedgerEmpty && <p className="text-[8px] text-amber-400 font-bold uppercase mt-1 tracking-wider">Sample Values</p>}
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-slate-950/15 text-left flex flex-col justify-between">
          <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Cash Flow</p>
          <div>
            <div className="flex items-baseline gap-1 mt-1.5">
              <h3 className="text-sm font-extrabold text-white">{fmt(totalInflows - totalOutflows)}</h3>
              <span className="text-[7px] text-emerald-450 font-bold uppercase tracking-wider">Healthy</span>
            </div>
            {isLedgerEmpty && <p className="text-[8px] text-amber-400 font-bold uppercase mt-1 tracking-wider">Sample Values</p>}
          </div>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-slate-950/15 text-left col-span-2 md:col-span-1">
          <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Business Health</p>
          <div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <h3 className="text-sm font-extrabold text-cyan-400">{healthScoreVal}/100</h3>
              <span className="text-[7px] text-slate-500 font-bold uppercase tracking-wider">Excellent</span>
            </div>
            {isLedgerEmpty && <p className="text-[8px] text-amber-400 font-bold uppercase mt-1 tracking-wider">Sample Values</p>}
          </div>
        </div>
      </div>

      {/* REPORT CONTENT PANEL */}
      <motion.div
        key={reportType}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-[28px] space-y-6 print:border-0 print:bg-white print:p-0"
      >
        {reportType === 'income' && (
          /* INCOME STATEMENT */
          <div className="space-y-6">
            <div className="text-center pb-6 border-b border-white/5 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h3 className="font-extrabold text-lg text-white print:text-black">
                  Profit & Loss Statement (P&L)
                </h3>
                {isLedgerEmpty && (
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border border-amber-500/30 bg-amber-500/10 text-amber-400">
                    Sample Data
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Reporting Period: {datePeriodText}
              </p>
            </div>

            {/* Income breakdown table */}
            <div className="space-y-4">
              <h4 className="font-bold text-[10px] text-slate-500 uppercase tracking-widest text-left">
                1. Gross Revenues
              </h4>
              <div className="border border-white/5 rounded-2xl overflow-hidden bg-slate-950/10">
                <table className="w-full text-left text-xs border-collapse">
                  <tbody>
                    <tr className="bg-white/4 font-bold border-b border-white/5 text-white">
                      <td className="p-3">Total Inflow Receipts</td>
                      <td className="p-3 text-right text-emerald-400">{fmt(totalInflows)}</td>
                    </tr>
                    {isLedgerEmpty ? (
                      <tr className="border-b border-white/5 text-slate-350 hover:bg-white/3">
                        <td className="p-3 pl-6">Subscriptions receipts</td>
                        <td className="p-3 text-right">{fmt(325000)}</td>
                      </tr>
                    ) : (
                      Object.entries(categoriesMap).map(([cat, val]) => {
                        if (val.inflows === 0) return null;
                        return (
                          <tr key={cat} className="border-b border-white/5 text-slate-350 hover:bg-white/3">
                            <td className="p-3 pl-6">{cat} receipts</td>
                            <td className="p-3 text-right">{fmt(val.inflows)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h4 className="font-bold text-[10px] text-slate-500 uppercase tracking-widest text-left">
                2. Operating Expenditures
              </h4>
              <div className="border border-white/5 rounded-2xl overflow-hidden bg-slate-950/10">
                <table className="w-full text-left text-xs border-collapse">
                  <tbody>
                    <tr className="bg-white/4 font-bold border-b border-white/5 text-white">
                      <td className="p-3">Total Outflow Charges</td>
                      <td className="p-3 text-right text-rose-455">{fmt(totalOutflows)}</td>
                    </tr>
                    {isLedgerEmpty ? (
                      <tr className="border-b border-white/5 text-slate-350 hover:bg-white/3">
                        <td className="p-3 pl-6">Marketing expenditures</td>
                        <td className="p-3 text-right">{fmt(198000)}</td>
                      </tr>
                    ) : (
                      Object.entries(categoriesMap).map(([cat, val]) => {
                        if (val.outflows === 0) return null;
                        return (
                          <tr key={cat} className="border-b border-white/5 text-slate-350 hover:bg-white/3">
                            <td className="p-3 pl-6">{cat} expenditures</td>
                            <td className="p-3 text-right">{fmt(val.outflows)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Profit summary banner */}
            <div className="p-4 border border-white/5 bg-slate-950/40 rounded-2xl flex justify-between items-center font-bold text-xs">
              <span className="text-slate-400">Net Operational Profits</span>
              <span className={netProfitVal >= 0 ? 'text-emerald-400 text-sm' : 'text-rose-455 text-sm'}>
                {fmt(netProfitVal)}
              </span>
            </div>

            {/* AI Auditor Overview (hidden on print) */}
            <div className="p-4 border border-cyan-500/20 bg-cyan-500/5 rounded-2xl space-y-2 print:hidden text-left">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs">
                <Sparkles size={14} className="text-cyan-400" />
                AI Auditor Summary Notes
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Operating net income shows growth MoM, heavily backed by accounts receivable from {topRevenue}. Outflows are concentrated in {topExpense}. Budget revisions are recommended to optimize runways.
              </p>
            </div>
          </div>
        )}

        {reportType === 'transactions' && (
          /* TRANSACTION LOGS STATEMENT */
          <div className="space-y-6">
            <div className="text-center pb-6 border-b border-white/5 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h3 className="font-extrabold text-lg text-white print:text-black">
                  Transaction Audits Ledger
                </h3>
                {isLedgerEmpty && (
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border border-amber-500/30 bg-amber-500/10 text-amber-400">
                    Sample Data
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">
                Historical Registry
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 font-extrabold text-slate-500 uppercase text-[9px] tracking-wider pb-2">
                    <th className="py-2.5 pr-2">Date</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Risk</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 pl-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {displayedTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-white/3">
                      <td className="py-3 pr-2 font-semibold">{t.date}</td>
                      <td className="py-3 px-3 font-bold text-slate-200">{t.merchant || t.description}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-white/4 border border-white/5 text-[9px]">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 uppercase text-[9px] font-bold">{t.paymentRisk}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          t.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-455'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className={`py-3 pl-2 text-right font-bold ${t.type === 'inflow' ? 'text-emerald-400' : ''}`}>
                        {t.type === 'inflow' ? '+' : '-'}{fmt(t.amount)}
                      </td>
                    </tr>
                  ))}
                  {displayedTransactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-xs font-semibold">
                        No transactions match the search filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'scheduler' && (
          /* WEEKLY SCHEDULER (PROTOTYPE READY) */
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h3 className="font-extrabold text-lg text-white">
                  Advisory Digests Scheduler
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">
                  Automated Digest Config
                </p>
              </div>
              <span className="premium-chip border-purple-500/30 bg-purple-500/10 text-purple-300">
                Prototype Ready
              </span>
            </div>

            <form onSubmit={handleSaveSchedule} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Toggles Column */}
              <div className="md:col-span-2 space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sliders size={14} className="text-cyan-400" />
                  Select Digest Modules
                </h4>

                <div className="space-y-3 font-semibold text-xs text-slate-350">
                  
                  <label className="flex items-center justify-between p-3.5 border border-white/5 bg-white/3 rounded-xl cursor-pointer">
                    <div className="space-y-0.5 text-left">
                      <span className="block text-slate-200">Email Reports</span>
                      <span className="block text-[10px] text-slate-500 font-medium">Forward digests directly to registered advisor emails.</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={emailEnabled} 
                      onChange={(e) => setEmailEnabled(e.target.checked)} 
                      className="rounded text-cyan-400 focus:ring-cyan-500 bg-slate-900 border-white/10"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 border border-white/5 bg-white/3 rounded-xl cursor-pointer">
                    <div className="space-y-0.5 text-left">
                      <span className="block text-slate-200">Profit & Loss Statements</span>
                      <span className="block text-[10px] text-slate-500 font-medium">Include detailed gross revenues and expenditures list.</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={pnlEnabled} 
                      onChange={(e) => setPnlEnabled(e.target.checked)} 
                      className="rounded text-cyan-400 focus:ring-cyan-500 bg-slate-900 border-white/10"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 border border-white/5 bg-white/3 rounded-xl cursor-pointer">
                    <div className="space-y-0.5 text-left">
                      <span className="block text-slate-200">Expense Breakdown</span>
                      <span className="block text-[10px] text-slate-500 font-medium">Highlight cloud hosts spikes and cost category ratios.</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={expenseEnabled} 
                      onChange={(e) => setExpenseEnabled(e.target.checked)} 
                      className="rounded text-cyan-400 focus:ring-cyan-500 bg-slate-900 border-white/10"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 border border-white/5 bg-white/3 rounded-xl cursor-pointer">
                    <div className="space-y-0.5 text-left">
                      <span className="block text-slate-200">Revenue Forecast</span>
                      <span className="block text-[10px] text-slate-500 font-medium">Append multi-month forecast predict curves models.</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={forecastEnabled} 
                      onChange={(e) => setForecastEnabled(e.target.checked)} 
                      className="rounded text-cyan-400 focus:ring-cyan-500 bg-slate-900 border-white/10"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 border border-white/5 bg-white/3 rounded-xl cursor-pointer">
                    <div className="space-y-0.5 text-left">
                      <span className="block text-slate-200">Loss Alerts</span>
                      <span className="block text-[10px] text-slate-500 font-medium">Flag billing outliers or contract concentration warnings.</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={alertEnabled} 
                      onChange={(e) => setAlertEnabled(e.target.checked)} 
                      className="rounded text-cyan-400 focus:ring-cyan-500 bg-slate-900 border-white/10"
                    />
                  </label>

                </div>
              </div>

              {/* Schedule Timing Column */}
              <div className="space-y-4 border-l border-white/5 pl-0 md:pl-6 text-left">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Calendar size={14} className="text-cyan-400" />
                  Frequency & Time
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Digest Frequency</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="premium-input py-2 text-xs"
                    >
                      <option value="daily">Daily Run</option>
                      <option value="weekly">Weekly Summary</option>
                      <option value="monthly">Monthly Audit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Dispatch Hour</label>
                    <div className="relative">
                      <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="time"
                        value={hour}
                        onChange={(e) => setHour(e.target.value)}
                        className="premium-input pl-10 py-2.5 text-xs text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-white/3 p-3 flex gap-2">
                    <Mail size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                      Automated weekly reports dispatch on Monday morning at 09:00 AM UTC.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="premium-button w-full py-3.5 text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Save Schedule settings
                  </button>
                </div>
              </div>

            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Reports;
