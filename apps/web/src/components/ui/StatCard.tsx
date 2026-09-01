import React from 'react';
import { Card } from './Card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  trend?: string;
  glowColor?: 'sky' | 'emerald' | 'amber' | 'purple';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  trend,
  glowColor = 'sky',
}: StatCardProps) {
  const glowStyles = {
    sky: 'from-sky-500/15 via-transparent to-transparent text-sky-400 bg-sky-500/10 border-sky-500/20',
    emerald: 'from-emerald-500/15 via-transparent to-transparent text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'from-amber-500/15 via-transparent to-transparent text-amber-400 bg-amber-500/10 border-amber-500/20',
    purple: 'from-purple-500/15 via-transparent to-transparent text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  return (
    <Card className="p-5 flex flex-col justify-between hover:border-slate-700/80 transition-all duration-300 group overflow-hidden relative">
      {/* Subtle ambient corner gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${glowStyles[glowColor]} pointer-events-none opacity-40 group-hover:opacity-80 transition duration-500 rounded-bl-full`} />

      <div className="flex items-center justify-between relative z-10">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl border ${glowStyles[glowColor]} transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4 relative z-10">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-3xl font-extrabold text-white tracking-tight font-mono">{value}</span>
          {badge && (
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-arc-500/20 text-arc-300 border border-arc-500/30">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        {trend && <p className="text-xs font-medium text-emerald-400 mt-1">{trend}</p>}
      </div>
    </Card>
  );
}
