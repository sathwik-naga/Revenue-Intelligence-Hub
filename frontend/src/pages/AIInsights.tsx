import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
//import { motion } from 'framer-motion';
import {
  BrainCircuit,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Send,
  LineChart,
  User,
  ShieldCheck
} from 'lucide-react';
import { ResponsiveContainer, LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3.5 shadow-2xl backdrop-blur-md max-w-[260px] text-left">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-450">{label}</p>
        <div className="mt-2 space-y-1">
          {payload.map((pld: any, index: number) => (
            <p key={index} className="text-xs font-semibold text-slate-200 flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 truncate">
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: pld.color || pld.fill }} />
                {pld.name}:
              </span>
              <span className="font-extrabold text-white">
                {typeof pld.value === 'number' ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(pld.value) : pld.value}
              </span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const AIInsights: React.FC = () => {
  const {
    insights,
    insightsText,
    insightsLoading,
    insightsConfidence,
    insightsError,
    chatMessages,
    chatLoading,
    askQuestion,
    refreshAnalysis,
    summary
  } = useApp();

  const [questionInput, setQuestionInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom on updates
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim()) return;
    askQuestion(questionInput);
    setQuestionInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    askQuestion(suggestion);
  };



  // Compile monthly future forecast mock data
  const forecastData = [
    { name: 'Jul (A)', revenue: summary.totalRevenue || 23650 },
    { name: 'Aug (P)', revenue: Math.round((summary.totalRevenue / 3) * 1.05 || 26500) },
    { name: 'Sep (P)', revenue: Math.round((summary.totalRevenue / 3) * 1.11 || 28200) },
    { name: 'Oct (P)', revenue: Math.round((summary.totalRevenue / 3) * 1.18 || 30100) }
  ];

  const suggestionChips = [
    'What caused my losses?',
    'Predict next month\'s revenue',
    'How can I reduce expenses?',
    'Which client yields highest revenue?'
  ];

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight my-0">
            AI Insights Co-Pilot
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Google Gemini algorithms analyzing transaction runs and structural runways.
          </p>
        </div>

        <button
          onClick={refreshAnalysis}
          className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
          disabled={insightsLoading}
        >
          <RefreshCw size={14} className={insightsLoading ? 'animate-spin' : ''} />
          Re-Analyze Accounts
        </button>
      </div>

      {insightsError && (
        <div className="p-6 border border-rose-500/20 bg-rose-500/5 rounded-2xl space-y-4 text-left">
          <div className="flex items-start gap-3">
            <span className="p-2 bg-rose-500/20 text-rose-400 rounded-xl text-lg shrink-0">⚠️</span>
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-white">AI Insights Temporarily Unavailable</h4>
              <p className="text-xs text-slate-400">The AI service is currently unavailable.</p>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1 pl-11">
            <p className="font-bold text-slate-350">Possible reasons:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Model unavailable</li>
              <li>API quota reached</li>
              <li>Temporary backend issue</li>
            </ul>
          </div>
          <div className="pl-11 pt-1">
            <button
              onClick={() => {
                console.error("Technical error details:", insightsError);
                refreshAnalysis();
              }}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Retry Analysis
            </button>
          </div>
        </div>
      )}

      {insightsLoading ? (
        <div className="flex flex-col items-center justify-center p-24 bg-white/70 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4 animate-pulse">
          <BrainCircuit size={48} className="text-blue-600 animate-spin" />
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Gemini model auditing accounts ledger...</h4>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDE: AI Predictions, Anomalies, runway */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Confidence Score & Overview banner */}
            <div className="border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <BrainCircuit size={20} className="stroke-[2px]" />
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">Business Health Audit</h4>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-xl text-xs font-bold">
                  <ShieldCheck size={14} />
                  Confidence: {insightsConfidence}%
                </div>
              </div>

              {/* Formatted markdown text generated by Gemini */}
              {/* AI Analysis from Gemini */}
<div
  className="
    prose prose-invert max-w-none
    text-white
    prose-headings:text-white
    prose-headings:font-bold
    prose-h1:text-4xl
    prose-h2:text-3xl
    prose-h3:text-2xl
    prose-p:text-slate-100
    prose-strong:text-white
    prose-li:text-slate-100
    prose-ul:list-disc
    prose-ol:list-decimal
    prose-code:text-cyan-300
    prose-hr:border-slate-700
  "
>
  {insightsText ? (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {insightsText}
    </ReactMarkdown>
  ) : (
    <p>No AI analysis available.</p>
  )}
</div>
            </div>

            {/* Forecasting Trend chart */}
            <div className="border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-sm">
              <div   className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <LineChart size={18} className="text-blue-600" />
                <h4 className="font-bold text-base text-slate-900 dark:text-white">Gemini Trend Forecast</h4>
              </div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLine data={forecastData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      tickLine={false} 
                      tickFormatter={(val) => typeof val === 'string' && val.length > 8 ? `${val.slice(0, 6)}...` : val}
                      minTickGap={15}
                    />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="revenue" stroke="#356fe6" strokeWidth={3} dot={{ stroke: '#2563EB', strokeWidth: 2, r: 4 }} />
                  </RechartsLine>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Recommendation Cards */}
{/* AI Recommendation Cards */}

<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

  {insights.length > 0 ? (
    insights.map((item) => (
      <div
        key={item.id}
        className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">{item.title}</h3>

          <span
            className={`text-xs px-2 py-1 rounded-full
            ${
              item.severity === "critical"
                ? "bg-red-600"
                : item.severity === "warning"
                ? "bg-yellow-600"
                : "bg-green-600"
            }`}
          >
            {item.severity}
          </span>
        </div>

        <p className="text-sm text-slate-400 mb-4">
          {item.description}
        </p>

        {item.impactAmount && (
          <div className="text-green-400 font-semibold mb-2">
            Estimated Impact: ${item.impactAmount.toLocaleString()}
          </div>
        )}

        {item.confidenceScore && (
          <div className="text-xs text-slate-500">
            Confidence: {item.confidenceScore}%
          </div>
        )}
      </div>
    ))
  ) : (
    <div className="col-span-full rounded-xl border border-dashed border-slate-600 p-8 text-center text-slate-400">
      No AI insight cards available.
    </div>
  )}

</div>
         
          </div>

          {/* RIGHT SIDE: Interactive Gemini Q&A Chat */}
          <div className="lg:col-span-5 flex flex-col border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl shadow-sm h-[680px]">
            
            {/* Chat header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="text-blue-600" size={18} />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Ask AI Financial Advisor</h4>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <Sparkles size={10} className="text-blue-500" />
                Gemini-3.5-Flash
              </span>
            </div>

            {/* Chat message thread panel */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-full animate-bounce">
                    <BrainCircuit size={28} />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-850 dark:text-slate-200">AI Knowledge Sync Complete</h5>
                    <p className="text-xs text-slate-450 dark:text-slate-500 mt-1 max-w-xs leading-relaxed">
                      Query your transaction ledger for instant anomalies explanation or multi-month forecasts.
                    </p>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isModel = msg.role === 'model';
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${isModel ? '' : 'flex-row-reverse'}`}
                    >
                      <div className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm ${isModel ? 'bg-blue-600' : 'bg-indigo-600'}`}>
                        {isModel ? <Sparkles size={14} /> : <User size={14} />}
                      </div>
                      <div className={`max-w-[80%] rounded-2xl p-3.5 border text-xs font-medium leading-relaxed ${
                        isModel
                          ? 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800 text-slate-850 dark:text-slate-200'
                          : 'bg-blue-600 border-blue-600 text-white dark:bg-blue-600'
                      }`}>
                        {msg.text.split('\n').map((line, lidx) => (
                          <p key={lidx} className={lidx > 0 ? 'mt-2' : ''}>
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}

              {chatLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-blue-600 shrink-0 flex items-center justify-center text-white animate-spin">
                    <RefreshCw size={14} />
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 rounded-2xl px-4 py-2.5 text-xs font-semibold animate-pulse">
                    AI calculations in progress...
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Suggestion Chips */}
            {chatMessages.length <= 1 && (
              <div className="px-4 py-2 border-t border-slate-50 dark:border-slate-850/30 flex flex-wrap gap-1.5 bg-slate-50/40 dark:bg-slate-950/20">
                {suggestionChips.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => handleSuggestionClick(sug)}
                    className="px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-900 border border-slate-200 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg bg-white dark:bg-slate-900 transition-colors whitespace-nowrap"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}

            {/* Chat Send Input Box */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-850/50 bg-white dark:bg-slate-900/50 flex gap-2">
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder="Ask AI Advisor..."
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={chatLoading}
              />
              <button
                type="submit"
                className="p-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl shadow-md transition-all shrink-0 flex items-center justify-center"
                disabled={chatLoading}
              >
                <Send size={14} fill="currentColor" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AIInsights;
