import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import Papa from 'papaparse';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  ArrowDownCircle,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const CSVUpload: React.FC = () => {
  const { processCSVData, addToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [parsing, setParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Drag Over
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        parsePreview(droppedFile);
      } else {
        addToast('error', 'Only CSV file format is supported.');
      }
    }
  };

  // Handle File browse selection
  const handleBrowseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      parsePreview(selectedFile);
    }
  };

  const triggerBrowse = () => {
    fileInputRef.current?.click();
  };

  // Parse first 10 rows for client review
  const parsePreview = (targetFile: File) => {
    setParsing(true);
    Papa.parse(targetFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPreviewRows(results.data.slice(0, 10));
        setParsing(false);
        addToast('success', `${targetFile.name} parsed for preview.`);
      },
      error: (error) => {
        console.error(error);
        addToast('error', 'Failed to parse CSV file header structure.');
        setParsing(false);
      }
    });
  };

  // Process and load to Dashboard context
  const handleIntegrate = () => {
    if (!file) return;

    setParsing(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        processCSVData(results.data);
        setParsing(false);
        // Clear selection
        setFile(null);
        setPreviewRows([]);
      },
      error: (error) => {
        console.error(error);
        addToast('error', 'Failed parsing statement contents.');
        setParsing(false);
      }
    });
  };

  const handleClear = () => {
    setFile(null);
    setPreviewRows([]);
  };

  // Programmatic generation of sample SME ledger template file
  const downloadSampleTemplate = () => {
    const headers = 'Date,Description,Category,Amount,Type,Status,Merchant,Risk\n';
    const sampleRows = [
      '2026-07-05,Monthly retainer contract,SaaS Invoices,14500,inflow,completed,Acme Corp,low',
      '2026-07-04,AWS Hosting Surcharge,Infrastructure,-1200,outflow,completed,AWS,low',
      '2026-07-03,Email newsletter tool,Software,-180,outflow,completed,Mailchimp,low',
      '2026-07-02,Legal consultancy setup,Legal,-3500,outflow,pending,Consultancy Partner,medium',
      '2026-07-01,Ad campaign contract payouts,Marketing,-1800,outflow,completed,Meta Platforms,low',
      '2026-06-30,Advisory Advisory fees,Consulting,4200,inflow,completed,Stark Labs,low'
    ].join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + sampleRows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', 'sample_financial_ledger_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Sample CSV template downloaded!');
  };

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight my-0">
          CSV Statement Upload
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Import local accounting logs to dynamically generate forecasts and AI recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Container Zone */}
        <div className="lg:col-span-2 space-y-6">
          {/* Drag & Drop Card */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all bg-white/70 dark:bg-slate-900/50 backdrop-blur-md flex flex-col items-center justify-center cursor-pointer ${
              dragActive
                ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/10'
                : file
                ? 'border-emerald-300 dark:border-emerald-900/30 bg-emerald-50/5 dark:bg-emerald-950/5'
                : 'border-slate-300 dark:border-slate-800 hover:border-blue-400'
            }`}
            onClick={!file ? triggerBrowse : undefined}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleBrowseChange}
              className="hidden"
            />

            {!file ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-2xl inline-block">
                  <UploadCloud size={32} className="stroke-[1.5px]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-850 dark:text-slate-200">
                    Drag & Drop your CSV accounting file here
                  </p>
                  <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">
                    Or select file to browse from device
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 rounded-2xl inline-block">
                  <FileSpreadsheet size={32} className="stroke-[1.5px]" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-800 dark:text-white">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    File size: {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleClear}
                    className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl text-slate-500 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw size={12} />
                    Reset
                  </button>
                  <button
                    onClick={handleIntegrate}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                    disabled={parsing}
                  >
                    <Play size={12} fill="currentColor" />
                    Load Ledger Data
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Parsed Rows preview */}
          {previewRows.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-sm"
            >
              <h4 className="font-bold text-base text-slate-900 dark:text-white pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                File Preview (First 10 Rows)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 font-extrabold text-slate-400 uppercase">
                      <th className="py-2.5 pr-3">Date</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 pl-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {previewRows.map((row, idx) => (
                      <tr key={idx} className="text-slate-800 dark:text-slate-350">
                        <td className="py-2.5 pr-3 font-semibold">{row.Date || row.date || 'N/A'}</td>
                        <td className="py-2.5 px-3 font-bold truncate max-w-[120px]">{row.Description || row.description || 'N/A'}</td>
                        <td className="py-2.5 px-3">{row.Category || row.category || 'N/A'}</td>
                        <td className="py-2.5 px-3 uppercase text-[10px] font-bold">
                          <span
                            className={
                              String(row.Type || row.type).toLowerCase().includes('in')
                                ? 'text-emerald-500'
                                : 'text-slate-500'
                            }
                          >
                            {row.Type || row.type || 'outflow'}
                          </span>
                        </td>
                        <td className="py-2.5 pl-3 text-right font-bold">
                          {row.Amount || row.amount || '0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>

        {/* Documentation Helper & Template Card */}
        <div className="space-y-6">
          <div className="border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-sm space-y-4">
            <h4 className="font-bold text-base text-slate-900 dark:text-white pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
              CSV Format Specifications
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your spreadsheet ledger should match standard export variables to sync with the AI prediction algorithms.
            </p>
            <div className="space-y-2 text-xs font-semibold text-slate-655 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500" />
                <span>Date: YYYY-MM-DD format</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500" />
                <span>Amount: Positive value</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500" />
                <span>Type: inflow or outflow string</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500" />
                <span>Category: Software, Marketing, Rent etc.</span>
              </div>
            </div>
            
            <button
              onClick={downloadSampleTemplate}
              className="flex items-center justify-center gap-2 w-full py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl transition-all border border-blue-100/50 dark:border-blue-900/30"
            >
              <ArrowDownCircle size={14} />
              Download Template CSV
            </button>
          </div>

          <div className="border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} />
              <h4 className="font-bold text-base">Instant AI Analysis</h4>
            </div>
            <p className="text-xs text-blue-100/90 leading-relaxed">
              Once you load the CSV, our integrated Gemini API triggers a comprehensive margin forecast, scans for double-billings, and builds your custom chatbot knowledge base.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CSVUpload;
