'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api, Arc } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Snowflake, Plus, Trash2, ArrowRight, Check } from 'lucide-react';

interface InitialGoal {
  name: string;
  category: string;
  target_value: number;
  unit: string;
}

const DEFAULT_GOALS: InitialGoal[] = [
  { name: 'Deep Work / Coding', category: 'CODING', target_value: 2, unit: 'hours' },
  { name: 'Workout & Fitness', category: 'FITNESS', target_value: 1, unit: 'session' },
  { name: 'Reading & Learning', category: 'LEARNING', target_value: 30, unit: 'minutes' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [arcName, setArcName] = useState<string>('Winter Arc 2026');
  const [description, setDescription] = useState<string>('Focused discipline in coding, fitness, and daily reading.');
  
  // Default start date = today, end date = +90 days
  const todayStr = new Date().toISOString().split('T')[0];
  const endD = new Date();
  endD.setDate(endD.getDate() + 90);
  const endStr = endD.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(endStr);
  const [createdArc, setCreatedArc] = useState<Arc | null>(null);

  const [goals, setGoals] = useState<InitialGoal[]>(DEFAULT_GOALS);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('1');
  const [newGoalUnit, setNewGoalUnit] = useState('hours');
  const [newGoalCategory, setNewGoalCategory] = useState('PERSONAL');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const handleCreateArc = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const arc = await api.createArc({
        name: arcName,
        description,
        start_date: startDate,
        end_date: endDate,
      });
      setCreatedArc(arc);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to create Arc.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName.trim()) return;
    setGoals([
      ...goals,
      {
        name: newGoalName.trim(),
        target_value: parseFloat(newGoalTarget) || 1,
        unit: newGoalUnit,
        category: newGoalCategory,
      },
    ]);
    setNewGoalName('');
  };

  const handleRemoveGoal = (idx: number) => {
    setGoals(goals.filter((_, i) => i !== idx));
  };

  const handleFinishOnboarding = async () => {
    if (!createdArc) return;
    setSubmitting(true);
    setError('');
    try {
      // Save all configured goals to backend
      for (const g of goals) {
        await api.createGoal({
          arc: createdArc.id,
          name: g.name,
          category: g.category,
          target_value: g.target_value,
          unit: g.unit,
          frequency: 'DAILY',
        });
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to save goals.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-arc-500/20 border border-arc-500/30 flex items-center justify-center text-arc-400">
              <Snowflake className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-white uppercase tracking-wider">Winter Arc Setup</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className={step === 1 ? 'text-arc-400' : 'text-slate-500'}>1. Define Arc</span>
            <span>→</span>
            <span className={step === 2 ? 'text-arc-400' : 'text-slate-500'}>2. Add Goals</span>
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {step === 1 ? (
          <Card className="p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Create Your Winter Arc</h2>
              <p className="text-xs text-slate-400 mt-1">
                An Arc is a dedicated timeframe where you commit to relentless daily discipline.
              </p>
            </div>

            <form onSubmit={handleCreateArc} className="space-y-4">
              <Input
                label="Arc Name"
                value={arcName}
                onChange={(e) => setArcName(e.target.value)}
                placeholder="e.g. Winter Arc 2026"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
                <Input
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is your primary focus during this Arc?"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-arc-500 focus:ring-2 focus:ring-arc-500/20 resize-none h-20"
                />
              </div>

              <Button type="submit" className="w-full mt-4" loading={submitting}>
                Continue to Goals <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          </Card>
        ) : (
          <Card className="p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Set Your Daily Goals</h2>
              <p className="text-xs text-slate-400 mt-1">
                Add 2 to 5 actionable habits you will track every single day during this Arc.
              </p>
            </div>

            {/* List of current goals */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {goals.map((g, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                >
                  <div>
                    <span className="font-semibold text-white">{g.name}</span>
                    <p className="text-slate-400 mt-0.5">
                      Target: <span className="text-arc-300">{g.target_value} {g.unit}</span> ({g.category})
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveGoal(idx)}
                    className="text-slate-500 hover:text-red-400 p-1 rounded"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new goal form */}
            <form onSubmit={handleAddGoal} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  placeholder="Goal name (e.g. Meditation)"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Target"
                    type="number"
                    min="0.1"
                    step="any"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    className="w-20"
                  />
                  <Input
                    placeholder="Unit (mins/hrs)"
                    value={newGoalUnit}
                    onChange={(e) => setNewGoalUnit(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" variant="secondary" size="sm" className="w-full">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Goal
              </Button>
            </form>

            <Button
              onClick={handleFinishOnboarding}
              className="w-full mt-4"
              loading={submitting}
              disabled={goals.length === 0}
            >
              Finish Setup & Start Tracking <Check className="w-4 h-4 ml-1" />
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
