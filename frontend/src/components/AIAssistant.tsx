import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Mic, Sparkles, User, RefreshCw } from 'lucide-react';

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const AIAssistant: React.FC = () => {
  const {
    chatMessages,
    chatLoading,
    askQuestion,
    addToast
  } = useApp();

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggested Prompts
  const suggestions = [
    "What's my profit?",
    "Show biggest expense",
    "Forecast next month",
    "Highest revenue"
  ];

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Speech Recognition listener
  const startVoiceSearch = () => {
    if (!SpeechRecognition) {
      addToast('warning', 'Voice recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      addToast('info', 'Listening for financial commands...');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      addToast('success', `Heard: "${transcript}"`);
      handleVoiceCommand(transcript);
    };

    recognition.onerror = (e: any) => {
      console.error(e);
      addToast('error', 'Voice command failed or was blocked.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleVoiceCommand = (command: string) => {
    const clean = command.toLowerCase().trim();
    if (clean.includes('show dashboard') || clean.includes('open dashboard') || clean.includes('go to dashboard')) {
      navigate('/dashboard');
    } else if (clean.includes('open analytics') || clean.includes('go to analytics') || clean.includes('show analytics')) {
      navigate('/revenue');
    } else if (clean.includes('show revenue') || clean.includes('open revenue') || clean.includes('go to revenue')) {
      navigate('/revenue');
    } else if (clean.includes('open transactions') || clean.includes('show transactions') || clean.includes('go to transactions')) {
      navigate('/upload');
    } else if (clean.includes('open forecast') || clean.includes('show forecast') || clean.includes('go to forecast') || clean.includes('open insights')) {
      navigate('/insights');
    } else {
      // Treat as standard prompt question
      askQuestion(command);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    askQuestion(input);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      <AnimatePresence>
        
        {/* Chat Drawer Popup */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="glass-panel w-[350px] h-[480px] rounded-[28px] border border-white/10 bg-slate-950/90 shadow-[0_25px_65px_rgba(0,0,0,0.6)] backdrop-blur-3xl flex flex-col mb-4 overflow-hidden"
          >
            
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/20">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-cyan-400 animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">AI CFO Co-Pilot</span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Powered by Gemini</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-white/5 bg-white/5 p-1.5 text-slate-400 hover:text-white transition"
              >
                <X size={14} />
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-4">
                  <div className="p-4 bg-blue-500/10 text-blue-300 rounded-full border border-blue-500/20">
                    <Sparkles size={24} className="animate-bounce" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">Aurora AI Advisor Offline</h5>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Select one of the demo businesses to boot simulated analysis.
                    </p>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isModel = msg.role === 'model';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${isModel ? '' : 'flex-row-reverse'}`}
                    >
                      <div className={`h-6 w-6 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow ${
                        isModel ? 'bg-blue-600' : 'bg-indigo-600'
                      }`}>
                        {isModel ? <Sparkles size={11} /> : <User size={11} />}
                      </div>
                      <div className={`max-w-[80%] rounded-[18px] p-3 border text-[11px] font-medium leading-relaxed ${
                        isModel
                          ? 'bg-white/4 border-white/5 text-slate-200'
                          : 'bg-blue-600 border-blue-500 text-white'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}

              {chatLoading && (
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-lg bg-blue-600 shrink-0 flex items-center justify-center text-white animate-spin">
                    <RefreshCw size={11} />
                  </div>
                  <div className="bg-white/4 border border-white/5 text-slate-400 rounded-[18px] px-3.5 py-2 text-[10px] font-bold animate-pulse">
                    Analyzing cash flow registers...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-4 py-2 border-t border-white/5 flex flex-wrap gap-1.5 bg-slate-950/20">
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  onClick={() => askQuestion(sug)}
                  className="px-2.5 py-1 text-[9px] font-bold text-slate-400 hover:text-white border border-white/5 rounded-lg bg-white/3 hover:bg-white/5 transition whitespace-nowrap"
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Form Input Box */}
            <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-slate-950/30 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 px-3 py-2.5 text-xs rounded-xl border border-white/5 bg-white/3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white/6"
                disabled={chatLoading}
              />
              
              {/* Mic Command */}
              <button
                type="button"
                onClick={startVoiceSearch}
                className={`p-2.5 rounded-xl border transition flex items-center justify-center shrink-0 ${
                  isListening 
                    ? 'bg-rose-500/20 border-rose-500/30 text-rose-400 listening-pulse' 
                    : 'bg-white/3 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Mic size={14} />
              </button>

              <button
                type="submit"
                className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition shrink-0 flex items-center justify-center cursor-pointer"
                disabled={chatLoading}
              >
                <Send size={14} />
              </button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button Bubble */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 text-white shadow-[0_10px_35px_rgba(59,130,246,0.4)] border border-white/10 cursor-pointer"
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
      </motion.button>
    </div>
  );
};

export default AIAssistant;
