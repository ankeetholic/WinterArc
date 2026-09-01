'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api, HeatmapData, HeatmapDay, Goal } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Heatmap } from '@/components/ui/Heatmap';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Trophy, Flame, Calendar, TrendingUp, Target, Award, Sparkles, BarChart2, CheckCircle2, XCircle } from 'lucide-react';

interface WeeklyData {
  week_start: string;
  week_end: string;
  completion_rate: number;
  percentage: number;
  completed_goals: number;
  total_goals: number;
}

interface MonthlyData {
  year: number;
  month: number;
  completion_rate: number;
  percentage: number;
  completed_goals: number;
  total_goals: number;
}

interface GoalStat {
  goal_id: string;
  name: string;
  category: string;
  unit: string;
  target_value: number;
  total_logged: number;
  completed_logged: number;
  completion_rate: number;
  percentage: number;
}

export default function ProgressPage() {
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [streak, setStreak] = useState<{ current_streak: number; best_streak: number }>({
    current_streak: 0,
    best_streak: 0,
  });
  const [weekly, setWeekly] = useState<WeeklyData | null>(null);
  const [monthly, setMonthly] = useState<MonthlyData | null>(null);
  const [goalStats, setGoalStats] = useState<GoalStat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Selected past day from heatmap inspector
  const [selectedPastDay, setSelectedPastDay] = useState<HeatmapDay | null>(null);
  const [pastDayGoals, setPastDayGoals] = useState<Goal[]>([]);
  const [loadingPastDay, setLoadingPastDay] = useState<boolean>(false);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [heatRes, streakRes, weekRes, monthRes, goalRes] = await Promise.all([
        api.getHeatmap(),
        api.getStreak(),
        api.getWeeklyAnalytics(),
        api.getMonthlyAnalytics(),
        api.getGoalAnalytics(),
      ]);
      setHeatmap(heatRes);
      setStreak(streakRes);
      setWeekly(weekRes);
      setMonthly(monthRes);
      setGoalStats(goalRes.goals);
    } catch (err: any) {
      setError(err.message || 'Failed to load progress analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleSelectHeatmapDay = async (day: HeatmapDay) => {
    setSelectedPastDay(day);
    setLoadingPastDay(true);
    try {
      const res = await api.getTodayGoals(day.date);
      setPastDayGoals(res.goals);
    } catch (err) {
      // fallback
    } finally {
      setLoadingPastDay(false);
    }
  };

  if (loading) return <LoadingState message="Calculating past analytics and heatmap consistency..." />;
  if (error) return <ErrorState message={error} onRetry={loadAnalytics} />;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-arc-500/20 text-arc-300 border border-arc-500/30 uppercase tracking-widest font-mono">
              Past History & Heatmap
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Consistency & Heatmap History</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize your past daily execution history, streak records, and habit performance over time.
          </p>
        </div>
      </div>

      {/* Streaks & Summary Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Current Streak"
          value={`${streak.current_streak}d`}
          subtitle="Consecutive discipline"
          icon={Flame}
          glowColor="amber"
          badge={streak.current_streak > 0 ? 'Active 🔥' : undefined}
        />
        <StatCard
          title="Best Streak"
          value={`${streak.best_streak}d`}
          subtitle="All-time record"
          icon={Trophy}
          glowColor="purple"
        />
        {weekly && (
          <StatCard
            title="This Week"
            value={`${weekly.percentage}%`}
            subtitle={`${weekly.completed_goals} / ${weekly.total_goals} habits`}
            icon={TrendingUp}
            glowColor="emerald"
          />
        )}
        {monthly && (
          <StatCard
            title="This Month"
            value={`${monthly.percentage}%`}
            subtitle={`${monthly.completed_goals} / ${monthly.total_goals} habits`}
            icon={Calendar}
            glowColor="sky"
          />
        )}
      </div>

      {/* Heatmap Section */}
      {heatmap && (
        <div className="space-y-4">
          <Heatmap
            days={heatmap.days}
            startDate={heatmap.start_date}
            endDate={heatmap.end_date}
            selectedDate={selectedPastDay?.date}
            onSelectDay={handleSelectHeatmapDay}
          />

          {/* Past Day Inspector Details Card */}
          {selectedPastDay && (
            <Card className="p-6 bg-gradient-to-br from-[#0c1626] via-[#09121f] to-[#070b14] border-arc-500/30 space-y-4 shadow-xl animate-in slide-in-from-top-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-arc-500/20 text-arc-400 flex items-center justify-center font-bold text-sm">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      History for {new Date(selectedPastDay.date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Execution Score: <strong className="text-arc-400 font-mono">{selectedPastDay.percentage}%</strong> ({selectedPastDay.completed}/{selectedPastDay.total} completed)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPastDay(null)}
                  className="text-xs text-slate-500 hover:text-slate-300 self-start sm:self-auto"
                >
                  Close Inspector
                </button>
              </div>

              {loadingPastDay ? (
                <p className="text-xs text-slate-400 py-4 text-center">Loading past day events...</p>
              ) : pastDayGoals.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No recorded events for this date.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                  {pastDayGoals.map((g) => (
                    <div
                      key={g.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                        g.completed
                          ? 'bg-[#081714] border-emerald-500/30 text-slate-200'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                      }`}
                    >
                      <span className={`font-semibold truncate pr-2 ${g.completed ? 'text-white' : 'text-slate-400'}`}>
                        {g.name}
                      </span>
                      {g.completed ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px] flex-shrink-0 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Done
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-500 font-mono text-[11px] flex-shrink-0">
                          <XCircle className="w-3.5 h-3.5" /> Missed
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Goal Performance Breakdown */}
      <div className="space-y-4 pt-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          Habit Consistency Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goalStats.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-500 col-span-2 border-dashed">
              No habit statistics available yet. Track your daily habits to see detailed breakdown analytics.
            </Card>
          ) : (
            goalStats.map((g) => (
              <Card key={g.goal_id} className="p-5 sm:p-6 space-y-4 hover:border-slate-700 shadow-xl group">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-arc-300 transition">
                      {g.name}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono mt-0.5 block">
                      {g.category} • Target: {g.target_value} {g.unit}
                    </span>
                  </div>
                  <span className="text-xl font-black text-arc-400 font-mono">{g.percentage}%</span>
                </div>
                <ProgressBar percentage={g.percentage} size="md" variant="gradient" />
                <div className="flex justify-between text-xs text-slate-400 font-mono pt-1">
                  <span>{g.completed_logged} completed logs</span>
                  <span className="text-slate-500">{g.total_logged} total logged</span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
