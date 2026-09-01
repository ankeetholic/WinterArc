'use client';

import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import {
  Check,
  Code2,
  Dumbbell,
  BookOpen,
  Brain,
  Heart,
  Briefcase,
  Target,
  Sparkles,
  Edit3,
} from 'lucide-react';
import { Goal } from '@/lib/api';

interface GoalCardProps {
  goal: Goal;
  onToggleComplete?: (goalId: string, completed: boolean, value?: number) => Promise<void>;
  onEdit?: (goal: Goal) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  CODING: Code2,
  FITNESS: Dumbbell,
  LEARNING: BookOpen,
  RESEARCH: Brain,
  HEALTH: Heart,
  CAREER: Briefcase,
  PERSONAL: Target,
  OTHER: Sparkles,
};

const CATEGORY_COLORS: Record<string, { badge: string; iconBg: string }> = {
  CODING: { badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20', iconBg: 'bg-sky-500/15 text-sky-400' },
  FITNESS: { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', iconBg: 'bg-emerald-500/15 text-emerald-400' },
  LEARNING: { badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20', iconBg: 'bg-violet-500/15 text-violet-400' },
  RESEARCH: { badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', iconBg: 'bg-indigo-500/15 text-indigo-400' },
  HEALTH: { badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', iconBg: 'bg-rose-500/15 text-rose-400' },
  CAREER: { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', iconBg: 'bg-amber-500/15 text-amber-400' },
  PERSONAL: { badge: 'bg-arc-500/10 text-arc-400 border-arc-500/20', iconBg: 'bg-arc-500/15 text-arc-400' },
  OTHER: { badge: 'bg-slate-800 text-slate-300 border-slate-700', iconBg: 'bg-slate-800 text-slate-300' },
};

export function GoalCard({ goal, onToggleComplete, onEdit }: GoalCardProps) {
  const [val, setVal] = useState<string>(
    goal.current_value !== undefined && goal.current_value !== null ? String(goal.current_value) : ''
  );
  const [loading, setLoading] = useState<boolean>(false);

  const isCompleted = !!goal.completed;
  const isMeasurable = goal.unit && goal.unit.toLowerCase() !== 'boolean';
  const Icon = CATEGORY_ICONS[goal.category] || Target;
  const colors = CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.OTHER;

  const currentValNum = goal.current_value !== undefined && goal.current_value !== null ? Number(goal.current_value) : 0;
  const progressPct = isMeasurable && goal.target_value > 0 ? Math.min(100, Math.round((currentValNum / goal.target_value) * 100)) : (isCompleted ? 100 : 0);

  const handleToggle = async () => {
    if (!onToggleComplete) return;
    setLoading(true);
    try {
      const nextCompleted = !isCompleted;
      const numVal = nextCompleted ? (val ? parseFloat(val) : goal.target_value) : 0;
      await onToggleComplete(goal.id, nextCompleted, numVal);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveValue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onToggleComplete) return;
    const num = parseFloat(val);
    if (isNaN(num)) return;
    setLoading(true);
    try {
      const completed = num >= goal.target_value;
      await onToggleComplete(goal.id, completed, num);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className={`p-4 sm:p-5 transition-all duration-300 ${
        isCompleted
          ? 'border-emerald-500/40 bg-[#081513]/90 shadow-lg shadow-emerald-950/30'
          : 'border-slate-800/90 hover:border-slate-700 bg-[#0c121d]/90 hover:shadow-lg hover:shadow-black/50'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Checkbox button */}
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-200 ${
            isCompleted
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30 scale-105'
              : 'border-slate-700/80 bg-slate-800/40 hover:border-arc-400 hover:bg-slate-800 text-transparent hover:text-slate-500'
          }`}
          title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          <Check className={`w-4 h-4 stroke-[3] transition-transform ${isCompleted ? 'scale-100' : 'scale-75'}`} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className={`p-1.5 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <h4
              className={`text-sm sm:text-base font-bold transition ${
                isCompleted ? 'text-slate-300 line-through' : 'text-white'
              }`}
            >
              {goal.name}
            </h4>
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${colors.badge}`}>
              {goal.category}
            </span>
          </div>

          <div className="mt-2 text-xs text-slate-400 flex items-center gap-2 flex-wrap">
            {isMeasurable ? (
              <span>
                Target: <strong className="text-slate-200">{goal.target_value} {goal.unit}</strong>
                {goal.current_value !== null && goal.current_value !== undefined && (
                  <span className="ml-1.5 text-arc-400 font-semibold">
                    ({goal.current_value} logged)
                  </span>
                )}
              </span>
            ) : (
              <span>Daily Commitment</span>
            )}
            {goal.description && (
              <span className="text-slate-500 hidden sm:inline truncate max-w-xs">
                • {goal.description}
              </span>
            )}
          </div>

          {/* Progress Mini Bar */}
          {isMeasurable && (
            <div className="mt-3 w-full bg-slate-800/60 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted ? 'bg-emerald-400' : 'bg-gradient-to-r from-arc-500 to-sky-400'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 self-center">
          {isMeasurable && !isCompleted && (
            <form onSubmit={handleSaveValue} className="flex items-center gap-1.5">
              <input
                type="number"
                step="any"
                min="0"
                placeholder={String(goal.target_value)}
                value={val}
                onChange={(e) => setVal(e.target.value)}
                className="w-16 px-2.5 py-1 text-xs font-mono bg-slate-950/80 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-arc-400 focus:ring-1 focus:ring-arc-400"
              />
              <Button type="submit" size="sm" variant="secondary" loading={loading} className="px-2.5 py-1 text-xs">
                Log
              </Button>
            </form>
          )}

          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="p-2 text-slate-500 hover:text-slate-200 rounded-lg hover:bg-slate-800/80 transition"
              title="Edit Goal"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
