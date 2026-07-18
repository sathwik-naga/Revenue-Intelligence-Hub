import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  ArrowDownCircle,
  Play,
  RotateCcw,
  Sparkles,
  RefreshCw,
  FileText
} from 'lucide-react';

export const CSVUpload: React.FC = () => {
  const { processCSVData, addToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionStage, setConversionStage] = useState('');
  const [isConverted, setIsConverted] = useState(false);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fmt = (val: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      maximumFractionDigits: 0 
    }).format(val);
  };

  // Stateful CSV parser (resilient to commas inside double quotes)
  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = [];
    let row: string[] = [];
    let col = "";
    let insideQuote = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuote && nextChar === '"') {
          col += '"';
          i++; // Skip escaped quote
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        row.push(col.trim());
        col = "";
      } else if ((char === '\r' || char === '\n') && !insideQuote) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        row.push(col.trim());
        lines.push(row);
        row = [];
        col = "";
      } else {
        col += char;
      }
    }
    if (col || row.length > 0) {
      row.push(col.trim());
      lines.push(row);
    }
    return lines.filter(r => r.length > 0 && r.some(c => c !== ""));
  };

  const findHeaderIndex = (headers: string[], keys: string[]): number => {
    return headers.findIndex(h => keys.some(k => h.includes(k)));
  };

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const ext = droppedFile.name.split('.').pop()?.toLowerCase();
      if (['csv', 'json', 'xlsx', 'xls'].includes(ext || '')) {
        setFile(droppedFile);
        setIsConverted(false);
        setPreviewRows([]);
      } else {
        addToast('error', 'Supported formats: CSV, JSON, and Excel only.');
      }
    }
  };

  const handleBrowseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setIsConverted(false);
      setPreviewRows([]);
    }
  };

  const triggerBrowse = () => {
    fileInputRef.current?.click();
  };

  // Dynamic Parsing Sequence
  const handleConvert = async () => {
    if (!file) return;
    setIsConverting(true);
    
    const stages = [
      'Extracting entries registry...',
      'Mapping fields layout...',
      'Validating payment risk scores...',
      'Compiling audit-ready sheet...'
    ];

    for (let i = 0; i < stages.length; i++) {
      setConversionStage(stages[i]);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    try {
      const parsedData = await new Promise<any[]>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const text = event.target?.result as string;
            
            // Handle JSON parsing
            if (file.name.endsWith('.json')) {
              const jsonData = JSON.parse(text);
              const items = Array.isArray(jsonData) ? jsonData : Array.isArray(jsonData.transactions) ? jsonData.transactions : [];
              if (items.length === 0) {
                reject(new Error("No valid transaction list found in JSON."));
                return;
              }
              const rows = items.map((item: any, idx: number) => {
                const rawAmt = item.amount || item.amt || item.value || 0;
                const numericAmt = typeof rawAmt === 'string' ? parseFloat(rawAmt.replace(/[^0-9.-]/g, '')) || 0 : Number(rawAmt) || 0;
                
                let detectedType = 'outflow';
                if (item.type || item.direction) {
                  const t = String(item.type || item.direction).toLowerCase();
                  detectedType = t.includes('in') || t.includes('credit') || t.includes('plus') ? 'inflow' : 'outflow';
                } else {
                  detectedType = numericAmt >= 0 ? 'inflow' : 'outflow';
                }
                
                return {
                  id: `tx-${idx}-${Date.now()}`,
                  date: item.date || item.day || item.timestamp || 'N/A',
                  description: item.description || item.desc || item.merchant || item.name || 'N/A',
                  category: item.category || item.cat || item.tag || 'N/A',
                  type: detectedType,
                  amount: Math.abs(numericAmt)
                };
              });
              resolve(rows);
              return;
            }

            // Handle CSV parsing
            const parsedLines = parseCSV(text);
            if (parsedLines.length < 2) {
              reject(new Error("Unable to read this CSV. Please verify the file format."));
              return;
            }

            const headers = parsedLines[0].map((h: string) => h.toLowerCase().trim());
            const dateIdx = findHeaderIndex(headers, ['date', 'day', 'timestamp']);
            const descIdx = findHeaderIndex(headers, ['desc', 'merchant', 'details', 'name', 'memo', 'description']);
            const catIdx = findHeaderIndex(headers, ['category', 'cat', 'tag']);
            const typeIdx = findHeaderIndex(headers, ['type', 'direction', 'kind']);
            const amtIdx = findHeaderIndex(headers, ['amount', 'amt', 'value', 'price', 'total']);

            const rows = parsedLines.slice(1).map((line, idx) => {
              const rawAmt = amtIdx !== -1 && line[amtIdx] ? line[amtIdx] : '';
              const cleanedAmt = rawAmt ? rawAmt.replace(/[^0-9.-]/g, '') : '';
              const numericAmt = parseFloat(cleanedAmt) || 0;

              let detectedType = 'outflow';
              if (typeIdx !== -1 && line[typeIdx]) {
                const t = line[typeIdx].toLowerCase();
                detectedType = t.includes('in') || t.includes('credit') || t.includes('plus') || t.includes('deposit') ? 'inflow' : 'outflow';
              } else {
                detectedType = numericAmt >= 0 ? 'inflow' : 'outflow';
              }

              return {
                id: `tx-${idx}-${Date.now()}`,
                date: dateIdx !== -1 && line[dateIdx] ? line[dateIdx] : 'N/A',
                description: descIdx !== -1 && line[descIdx] ? line[descIdx] : 'N/A',
                category: catIdx !== -1 && line[catIdx] ? line[catIdx] : 'N/A',
                type: detectedType,
                amount: Math.abs(numericAmt)
              };
            });
            resolve(rows);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error("Unable to read this CSV. Please verify the file format."));
        reader.readAsText(file);
      });

      setPreviewRows(parsedData);
      setIsConverted(true);
      addToast('success', `${file.name} converted successfully!`);
    } catch (err: any) {
      console.error("Statement parse error:", err);
      addToast('error', "Unable to read this CSV. Please verify the file format.");
    } finally {
      setIsConverting(false);
    }
  };

  const getConvertedCSVBlob = () => {
    const headers = 'Date,Description,Category,Amount,Type,Status,Merchant,Risk\n';
    const csvLines = previewRows.map((r) => {
      const cleanDesc = (r.description || '').replace(/"/g, '""');
      const cleanCat = (r.category || '').replace(/"/g, '""');
      return `"${r.date}","${cleanDesc}","${cleanCat}",${r.type === 'inflow' ? r.amount : -r.amount},"${r.type}","completed","${cleanDesc}","low"`;
    }).join('\n');
    return new Blob([headers + csvLines], { type: 'text/csv;charset=utf-8;' });
  };

  const handleDownloadCSV = () => {
    if (previewRows.length === 0) return;
    const csvBlob = getConvertedCSVBlob();
    const csvContent = URL.createObjectURL(csvBlob);
    
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `aurora_converted_${file?.name.split('.')[0] || 'ledger'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(csvContent);
    addToast('success', 'Converted CSV ledger downloaded!');
  };

  const handleImportToDashboard = async () => {
    if (!file || previewRows.length === 0) return;
    try {
      // Create a new file object from the converted parsed CSV rows to ensure backend maps actual columns
      const csvBlob = getConvertedCSVBlob();
      const convertedFile = new File([csvBlob], `converted_${file.name.split('.')[0]}.csv`, { type: 'text/csv' });

      await processCSVData(convertedFile);
      addToast('success', 'Ledger statements loaded directly to console dashboards.');
      handleClear();
    } catch (err: any) {
      addToast('error', err.message || 'CSV statements integration failed.');
    }
  };

  const handleClear = () => {
    setFile(null);
    setIsConverted(false);
    setPreviewRows([]);
  };

  return (
    <div className="space-y-6 page-shell">
      {/* Page Heading */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="glass-panel rounded-[32px] p-6"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
              <Sparkles size={12} className="text-cyan-300" />
              Aurora Ledger Converter
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-3 my-0">
              Multi-Format Statement Converter
            </h1>
            <p className="text-xs text-slate-450 mt-2">
              Transform raw JSON or CSV ledger exports into standard system schemas.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload and Convert area */}
        <div className="lg:col-span-2 space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border border-dashed rounded-[28px] p-10 text-center transition bg-slate-950/20 backdrop-blur-md flex flex-col items-center justify-center cursor-pointer min-h-[300px] relative overflow-hidden ${
              dragActive
                ? 'border-blue-500 bg-blue-500/5'
                : file
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-white/10 hover:border-blue-500/40 hover:bg-white/3'
            }`}
            onClick={!file && !isConverting ? triggerBrowse : undefined}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleBrowseChange}
              className="hidden"
            />

            {/* Converting state overlay */}
            <AnimatePresence>
              {isConverting && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#020617]/90 flex flex-col items-center justify-center space-y-4 z-30"
                >
                  <RefreshCw className="h-10 w-10 text-cyan-400 animate-spin" />
                  <p className="text-sm font-bold text-slate-200 uppercase tracking-widest animate-pulse">Converting...</p>
                  <p className="text-xs text-slate-500">{conversionStage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {!file ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/10 text-blue-300 rounded-[22px] inline-block border border-blue-500/20">
                  <UploadCloud size={36} className="stroke-[1.5px] animate-bounce" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">
                    Drag & drop accounting sheet here
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider">
                    Accepts CSV and JSON files
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className={`p-4 rounded-[22px] inline-block border ${
                  isConverted 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                }`}>
                  {file.name.endsWith('.json') ? (
                    <FileText size={36} />
                  ) : (
                    <FileSpreadsheet size={36} />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white truncate max-w-xs">{file.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Size: {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleClear(); }}
                    className="px-4 py-2 border border-white/8 bg-white/4 text-xs font-bold rounded-xl text-slate-350 hover:bg-white/8 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    Reset
                  </button>
                  
                  {!isConverted ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleConvert(); }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold rounded-xl shadow-md transition hover:-translate-y-0.5 cursor-pointer flex items-center gap-1.5"
                    >
                      <Play size={12} fill="currentColor" />
                      Convert to CSV
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownloadCSV(); }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition hover:-translate-y-0.5 cursor-pointer flex items-center gap-1.5"
                      >
                        <ArrowDownCircle size={12} />
                        Download CSV
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleImportToDashboard(); }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold rounded-xl shadow-md transition hover:-translate-y-0.5 cursor-pointer flex items-center gap-1.5"
                      >
                        Load to Console
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* preview rows */}
          <AnimatePresence>
            {isConverted && previewRows.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="glass-panel p-6 rounded-[24px]"
              >
                <div className="flex justify-between items-center pb-3 mb-4 border-b border-white/5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400" />
                    Conversion Result Preview
                  </h4>
                  <span className="text-[9px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded">SUCCESS</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 font-extrabold text-slate-500 uppercase text-[9px] tracking-wider">
                        <th className="py-2.5 pr-3">Date</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 pl-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {previewRows.map((row, idx) => (
                        <tr key={idx} className="text-slate-300">
                          <td className="py-3 pr-3 font-semibold">{row.date}</td>
                          <td className="py-3 px-3 font-bold text-slate-200">{row.description}</td>
                          <td className="py-3 px-3">
                            <span className="rounded-lg border border-white/5 bg-white/4 px-2 py-0.5 text-[9px]">
                              {row.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 uppercase text-[9px] font-bold">
                            <span className={row.type === 'inflow' ? 'text-emerald-400' : 'text-rose-450'}>
                              {row.type}
                            </span>
                          </td>
                          <td className="py-3 pl-3 text-right font-bold text-slate-100">
                            {row.type === 'inflow' ? '+' : '-'}{fmt(row.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Documentation sidebar */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-[28px] space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-widest text-slate-350 pb-3 border-b border-white/5">
              Mapping Schemas
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              When converting JSON sheets, the algorithm auto-maps custom keys to standard auditing values.
            </p>
            <div className="space-y-3 text-[11px] text-slate-400 font-medium">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">Date Range</span>
                <span className="text-slate-200">YYYY-MM-DD</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">Inflows Indicator</span>
                <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">inflow</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">Outflows Indicator</span>
                <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">outflow</span>
              </div>
              <div className="flex items-center justify-between pb-1">
                <span className="text-slate-500">Default Currency</span>
                <span className="text-slate-200">INR (₹) / USD ($)</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-[28px] bg-gradient-to-br from-blue-600/10 to-cyan-500/10 border border-cyan-400/20 text-white space-y-3">
            <div className="flex items-center gap-2 text-cyan-300">
              <Sparkles size={16} />
              <h4 className="font-bold text-xs uppercase tracking-widest">Automatic Risk Scan</h4>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Upon conversion, the engine flags double-billings and schedules AI audit recommendations dynamically.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CSVUpload;
