'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  variant?: 'spinner' | 'shimmer';
}

export function LoadingSpinner({ size = 'md', text, className = '', variant = 'spinner' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const iconClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (variant === 'shimmer') {
    return (
      <div className={cn("relative overflow-hidden rounded-xl bg-white/5 border border-white/10", className)}>
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    );
  }

  return (
    <div className={cn(`flex flex-col items-center justify-center gap-4`, className)}>
      <div className={cn("relative flex items-center justify-center", sizeClasses[size])}>
        {/* Outer rotating gradient ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute inset-0 rounded-full border-t-2 border-r-2 border-purple-500 border-opacity-70"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute inset-1 rounded-full border-b-2 border-l-2 border-blue-400 border-opacity-50"
        />
        {/* Inner static logo */}
        <div className="relative z-10 flex items-center justify-center bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 text-white rounded-full p-2 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
          <Sparkles className={cn("animate-pulse", iconClasses[size])} />
        </div>
      </div>
      {text && (
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-gray-300 to-white"
        >
          {text}
        </motion.span>
      )}
    </div>
  );
}
