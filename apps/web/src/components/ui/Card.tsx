import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'glow';
}

export function Card({
  className,
  variant = 'default',
  children,
  ...props
}: CardProps) {
  const baseStyles = 'rounded-2xl transition-all duration-300 relative';
  
  const variants = {
    default: 'bg-[#0c121d]/90 border border-slate-800/90 shadow-xl shadow-black/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] backdrop-blur-xl',
    elevated: 'bg-slate-900 border border-slate-800 shadow-2xl shadow-black/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]',
    glass: 'bg-slate-900/50 border border-white/5 backdrop-blur-md shadow-xl shadow-black/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
    glow: 'bg-[#0c1322]/90 border border-arc-500/25 shadow-2xl shadow-arc-500/10 shadow-[inset_0_1px_0_0_rgba(56,189,248,0.2)] backdrop-blur-xl',
  };

  return (
    <div className={twMerge(clsx(baseStyles, variants[variant], className))} {...props}>
      {children}
    </div>
  );
}
