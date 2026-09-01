'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api, Goal } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { GoalCard } from '@/components/ui/GoalCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  CheckCircle2,
  Sparkles,
  Flame,
  LineChart,
  ArrowRight,
  Clock,
  ListTodo,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TodayPage() {
  const router = useRouter();
  const todayStr = new Date().toISOString().split('T')[0];
  const [goals, setGoals] = useState<Goal[]>([]);
  const [score, setScore] = useState<{ completed: number; total: number; percentage: number }>({
    completed: 0,
    total: 0,
    percentage: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const loadTodayData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [goalsRes, scoreRes] = await Promise.all([
        api.getTodayGoals(todayStr),
        api.getDailyScore(todayStr),
      ]);
      setGoals(goalsRes.goals);
      setScore(scoreRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load today tracking data.');
    } finally {
      setLoading(false);
    }
  }, [todayStr]);

  useEffect(() => {
    loadTodayData();
  }, [loadTodayData]);

  const handleToggleGoal = async (goalId: string, completed: boolean, value?: number) => {
    try {
      await api.createDailyLog({
        goal: goalId,
        date: todayStr,
        completed,
        value: value !== undefined ? value : (completed ? 1 : 0),
      });
      loadTodayData();
    } catch (err: any) {
      try {
        const existing = await api.getDailyLogs({ date: todayStr, goal: goalId });
        if (existing.results.length > 0) {
          await api.updateDailyLog(existing.results[0].id, {
            completed,
            value: value !== undefined ? value : (completed ? 1 : 0),
          });
          loadTodayData();
        }
      } catch (innerErr: any) {
        alert(innerErr.message || 'Failed to update goal.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Today's Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-arc-500/20 text-arc-300 border border-arc-500/30 uppercase tracking-widest font-mono shadow-sm shadow-arc-500/10 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-arc-400 animate-ping" />
              Today&apos;s Live Execution
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Focus purely on executing today&apos;s 25 timetable events in sequence.
          </p>
        </div>

        {/* Link to past heatmap history */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/progress')}
          className="text-xs self-start sm:self-auto"
        >
          <LineChart className="w-4 h-4 mr-1.5 text-arc-400" /> Past Heatmap History <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>

      {loading ? (
        <LoadingState message="Loading today's execution schedule..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadTodayData} />
      ) : goals.length === 0 ? (
        <EmptyState
          title="No Active Goals Configured"
          description="You do not have any active daily goals for this Arc. Create habits to track your daily execution score."
          actionText="Add Habits"
          onAction={() => router.push('/goals')}
        />
      ) : (
        <>
          {/* Daily Completion Score Hero Card */}
          <Card className="p-6 bg-gradient-to-r from-[#0c1626] via-[#09121f] to-[#070b14] border-arc-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-2xl shadow-black/60">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-arc-500/20 to-sky-500/10 border border-arc-500/30 text-arc-400 flex items-center justify-center shadow-lg shadow-arc-500/10">
                <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  Today&apos;s Score
                </span>
                <p className="text-2xl font-extrabold text-white mt-0.5">
                  {score.completed} of {score.total} Habits Done{' '}
                  <span className="text-arc-400 font-mono">({score.percentage}%)</span>
                </p>
              </div>
            </div>
            <div className="w-full sm:w-56">
              <ProgressBar percentage={score.percentage} size="md" variant="gradient" />
            </div>
          </Card>

          {/* Chronological Tasks Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <ListTodo className="w-3.5 h-3.5 text-arc-400" /> Daily Sequence ({goals.length} Tasks)
              </span>
              <span className="text-xs text-slate-500 font-mono">5:45 AM → 9:45 PM</span>
            </div>

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
          </div>
        </>
      )}
    </div>
  );
}
