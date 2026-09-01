'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api, DashboardData, HeatmapData } from '@/lib/api';
import { StatCard } from '@/components/ui/StatCard';
import { GoalCard } from '@/components/ui/GoalCard';
import { Heatmap } from '@/components/ui/Heatmap';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  Flame,
  Trophy,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Sparkles,
  Target,
  Clock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, heatRes] = await Promise.all([
        api.getDashboard(),
        api.getHeatmap(),
      ]);
      setData(dashRes);
      setHeatmap(heatRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleToggleGoal = async (goalId: string, completed: boolean, value?: number) => {
    if (!data) return;
    const todayStr = data.today.date;
    try {
      await api.createDailyLog({
        goal: goalId,
        date: todayStr,
        completed,
        value: value !== undefined ? value : (completed ? 1 : 0),
      });
      const updated = await api.getDashboard();
      const updatedHeat = await api.getHeatmap();
      setData(updated);
      setHeatmap(updatedHeat);
    } catch (err: any) {
      try {
        const existingLogs = await api.getDailyLogs({ date: todayStr, goal: goalId });
        if (existingLogs.results.length > 0) {
          await api.updateDailyLog(existingLogs.results[0].id, {
            completed,
            value: value !== undefined ? value : (completed ? 1 : 0),
          });
          const updated = await api.getDashboard();
          const updatedHeat = await api.getHeatmap();
          setData(updated);
          setHeatmap(updatedHeat);
        }
      } catch (innerErr: any) {
        alert(innerErr.message || 'Failed to update goal.');
      }
    }
  };

  if (loading) {
    return <LoadingState message="Loading your consistency dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboard} />;
  }

  if (!data?.arc) {
    return (
      <EmptyState
        title="No Active Arc Found"
        description="You haven't set up an active Winter Arc yet. Create your first Arc to start building your daily streak."
        actionText="Create Your Arc"
        onAction={() => router.push('/onboarding')}
      />
    );
  }

  const { arc, today, streak, goals, recent_activity } = data;
  const daysLeft = arc.total_days && arc.day_number ? Math.max(0, arc.total_days - arc.day_number) : null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Arc Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-arc-500/20 bg-gradient-to-br from-[#0c1424] via-[#090f1a] to-[#070b12] p-6 sm:p-8 shadow-2xl shadow-black/80 shadow-[inset_0_1px_0_0_rgba(56,189,248,0.2)]">
        {/* Background glow orb */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-arc-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold rounded-full bg-arc-500/20 text-arc-300 border border-arc-500/30 uppercase tracking-wider shadow-sm shadow-arc-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-arc-400 animate-ping" />
                Active Arc
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {arc.start_date} → {arc.end_date}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{arc.name}</h1>
            {arc.description && (
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">{arc.description}</p>
            )}
          </div>

          {/* Timeline counter pill */}
          <div className="flex items-center gap-4 bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-lg self-start md:self-auto">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Day Progress</p>
              <p className="text-2xl font-black text-white font-mono mt-0.5">
                Day {arc.day_number || 1}{' '}
                <span className="text-sm font-normal text-slate-500 font-sans">/ {arc.total_days || 90}</span>
              </p>
            </div>
            {daysLeft !== null && (
              <div className="pl-4 border-l border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Remaining</p>
                <p className="text-2xl font-black text-arc-400 font-mono mt-0.5">{daysLeft}d</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/[0.05]">
          <ProgressBar percentage={arc.progress_percentage || 0} showLabel size="md" variant="cyan" />
        </div>
      </div>

      {/* Today's Scheduled Workout Split Banner */}
      <Card className="p-5 bg-gradient-to-r from-slate-900 via-[#0a1622] to-slate-900 border-arc-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-arc-500/15 border border-arc-500/30 text-arc-400 flex items-center justify-center shadow-md shadow-arc-500/10 flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-arc-400 text-slate-950 font-mono">
                {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
              </span>
              <span className="text-xs text-slate-400 font-mono">Scheduled Routine</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              {(() => {
                const day = new Date().getDay();
                switch (day) {
                  case 1: return 'Day 1 — Chest + Triceps + Upper Abs (Upper Chest Focus)';
                  case 2: return 'Day 2 — Back + Biceps + Lower Abs + Traps & Neck (V-Taper)';
                  case 3: return 'Day 3 — Side & Rear Delts + Obliques (3D Shoulders)';
                  case 4: return 'Day 4 — Chest + Triceps + Upper Abs (Incline & Dips)';
                  case 5: return 'Day 5 — Back + Biceps + Lower Abs + Traps & Neck (Thickness)';
                  case 6: return 'Day 6 — Legs + Side Delts + Obliques (Futsal & Athletic)';
                  default: return 'Day 7 — Sunday Rest & Active Recovery';
                }
              })()}
            </h3>
          </div>
        </div>
        <Button
          onClick={() => router.push('/workout')}
          size="sm"
          className="bg-gradient-to-r from-arc-400 to-sky-400 text-slate-950 font-bold whitespace-nowrap self-start sm:self-auto shadow-md shadow-arc-500/20"
        >
          Open Routine <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </Card>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Today's Score"
          value={`${today.percentage}%`}
          subtitle={`${today.completed} of ${today.total} habits finished`}
          icon={CheckCircle2}
          glowColor="emerald"
        />
        <StatCard
          title="Current Streak"
          value={`${streak.current_streak}d`}
          subtitle="Daily discipline streak"
          icon={Flame}
          glowColor="amber"
          badge={streak.current_streak > 0 ? 'Active 🔥' : undefined}
        />
        <StatCard
          title="Best Streak"
          value={`${streak.best_streak}d`}
          subtitle="All-time high record"
          icon={Trophy}
          glowColor="purple"
        />
        <StatCard
          title="Active Goals"
          value={goals.length}
          subtitle="Locked in for daily tracking"
          icon={Target}
          glowColor="sky"
        />
      </div>

      {/* Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Today's Goals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Today&apos;s Execution</h2>
                <span className="px-2 py-0.5 text-xs font-bold font-mono rounded-full bg-slate-800 text-arc-300 border border-slate-700">
                  {today.completed}/{today.total}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Check off completed habits or log units</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/today')}
              className="text-xs"
            >
              Focus View <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          {goals.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <p className="text-xs text-slate-400">No active goals configured yet.</p>
              <Button size="sm" onClick={() => router.push('/goals')} className="mt-3">
                Add Goals
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onToggleComplete={handleToggleGoal}
                  onEdit={() => router.push('/goals')}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recent Activity Snapshot */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Activity Stream</h2>
            <p className="text-xs text-slate-400 mt-0.5">Authoritative history from database</p>
          </div>

          <Card className="p-5 space-y-3">
            {recent_activity.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No daily logs recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {recent_activity.map((log) => (
                  <div key={log.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">{log.goal_name}</span>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{log.date}</p>
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                      {log.value ? `${log.value} ${log.unit || ''}` : 'Complete ✓'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Heatmap Section */}
      {heatmap && (
        <div className="pt-2">
          <Heatmap days={heatmap.days} startDate={heatmap.start_date} endDate={heatmap.end_date} />
        </div>
      )}
    </div>
  );
}
