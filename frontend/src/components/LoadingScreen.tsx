import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

interface LoadingScreenProps {
  onComplete?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const messages = [
    'Revenue Hub',
    'Preparing Financial Engine...',
    'Loading Analytics...',
    'Synchronizing Dashboard...',
    'Ready!'
  ];

  useEffect(() => {
    // Increment progress bar over 2.5 seconds
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        if (next >= 100) {
          clearInterval(progressInterval);
          setIsDone(true);
          return 100;
        }

        // Sync messages index with percentage markers
        if (next < 20) setMessageIndex(0);
        else if (next < 45) setMessageIndex(1);
        else if (next < 70) setMessageIndex(2);
        else if (next < 92) setMessageIndex(3);
        else setMessageIndex(4);

        return next;
      });
    }, 22);

    return () => {
      clearInterval(progressInterval);
    };
  }, []);

  useEffect(() => {
    if (isDone && onComplete) {
      const timeout = setTimeout(() => {
        onComplete();
      }, 400); // Small delay to let fade out happen
      return () => clearTimeout(timeout);
    }
  }, [isDone, onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020617] text-white">
      {/* Aurora Radial Glows in Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 h-[350px] w-[350px] rounded-full bg-blue-500/10 blur-[80px]" />
        <div className="absolute bottom-1/3 right-1/4 h-[350px] w-[350px] rounded-full bg-cyan-400/10 blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-violet-600/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center"
      >
        {/* Animated Logo */}
        <motion.div
          animate={{ 
            rotateY: [0, 180, 360],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-blue-600 via-cyan-450 to-violet-600 shadow-[0_15px_45px_rgba(59,130,246,0.35)] mb-8"
        >
          <BrainCircuit className="text-white" size={38} />
        </motion.div>

        {/* Brand Header */}
        <h2 className="text-2xl font-extrabold tracking-tight text-white mb-1">
          Revenue Hub
        </h2>
        <p className="text-[10px] font-bold tracking-[0.35em] text-cyan-350 uppercase mb-8">
          Enterprise Revenue Hub
        </p>

        {/* Loading Progress Bar Container */}
        <div className="w-64 h-[5px] rounded-full bg-white/5 border border-white/5 overflow-hidden mb-4 relative">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Percent */}
        <span className="text-[10px] font-bold text-slate-500 tracking-wider">
          {progress}%
        </span>

        {/* Loading Messages with Fade */}
        <div className="h-6 mt-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.25 }}
              className="text-xs text-slate-400 font-medium"
            >
              {messages[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
