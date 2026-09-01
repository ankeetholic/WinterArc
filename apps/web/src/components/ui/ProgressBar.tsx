import React from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  percentage: number;
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'cyan' | 'emerald' | 'gradient';
}

export function ProgressBar({
  percentage,
  showLabel = false,
  className,
  size = 'md',
  variant = 'cyan',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percentage));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variantGradients = {
    cyan: 'bg-gradient-to-r from-sky-500 via-arc-400 to-teal-300 shadow-sm shadow-arc-400/40',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-300 shadow-sm shadow-emerald-400/40',
    gradient: 'bg-gradient-to-r from-sky-500 via-arc-400 to-emerald-400 shadow-sm shadow-arc-400/40',
  };

  return (
    <div className={clsx('w-full space-y-1.5', className)}>
      <div className={clsx('w-full bg-[#131b2c] rounded-full overflow-hidden p-0.5 border border-white/5', sizeClasses[size])}>
        <div
          className={clsx('h-full rounded-full transition-all duration-700 ease-out', variantGradients[variant])}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400 font-mono">
          <span>Progress</span>
          <span className="font-bold text-white">{clamped}%</span>
        </div>
      )}
    </div>
  );
}
