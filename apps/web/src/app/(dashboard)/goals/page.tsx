'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api, Goal, Arc } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  Plus,
  Target,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Code2,
  Dumbbell,
  BookOpen,
  Brain,
  Heart,
  Briefcase,
  Sparkles,
  Zap,
} from 'lucide-react';

const CATEGORIES = [
  'CODING',
  'FITNESS',
  'LEARNING',
  'RESEARCH',
  'HEALTH',
  'CAREER',
  'PERSONAL',
  'OTHER',
];

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

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeArc, setActiveArc] = useState<Arc | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('CODING');
  const [targetValue, setTargetValue] = useState('1');
  const [unit, setUnit] = useState('hours');
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY'>('DAILY');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [arcRes, goalsRes] = await Promise.all([
        api.getActiveArc().catch(() => null),
        api.getGoals(),
      ]);
      setActiveArc(arcRes);
      setGoals(goalsRes.results);
    } catch (err: any) {
      setError(err.message || 'Failed to load goals.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setName('');
    setDescription('');
    setCategory('CODING');
    setTargetValue('1');
    setUnit('hours');
    setFrequency('DAILY');
    setFormError('');
    setIsCreateOpen(true);
  };

  const openEditModal = (g: Goal) => {
    setEditingGoal(g);
    setName(g.name);
    setDescription(g.description || '');
    setCategory(g.category);
    setTargetValue(String(g.target_value));
    setUnit(g.unit);
    setFrequency(g.frequency);
    setFormError('');
    setIsEditOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeArc) {
      setFormError('An active Arc is required before creating goals.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await api.createGoal({
        arc: activeArc.id,
        name,
        description,
        category,
        target_value: parseFloat(targetValue) || 1,
        unit,
        frequency,
      });
      setIsCreateOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create goal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;
    setSubmitting(true);
    setFormError('');
    try {
      await api.updateGoal(editingGoal.id, {
        name,
        description,
        category,
        target_value: parseFloat(targetValue) || 1,
        unit,
        frequency,
      });
      setIsEditOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update goal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (g: Goal) => {
    try {
      await api.updateGoal(g.id, { is_active: !g.is_active });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to change goal status.');
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    try {
      await api.deleteGoal(goalId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete goal.');
    }
  };

  if (loading) return <LoadingState message="Loading your goals..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  const activeGoals = goals.filter((g) => g.is_active);
  const inactiveGoals = goals.filter((g) => !g.is_active);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-arc-500/20 text-arc-300 border border-arc-500/30 uppercase tracking-widest font-mono">
              Core Tracking
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Goal Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure daily habits, target thresholds, and tracking metrics.
          </p>
        </div>
        <Button onClick={openCreateModal} size="md" className="shadow-lg shadow-arc-500/20 font-bold">
          <Plus className="w-4 h-4 mr-1.5" /> Add New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          title="No Goals Found"
          description="You have not created any goals yet. Add your first discipline habit to start tracking daily progress."
          actionText="Add Goal"
          onAction={openCreateModal}
        />
      ) : (
        <div className="space-y-8">
          {/* Active Goals Grid */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
              Active Goals ({activeGoals.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeGoals.map((g) => {
                const Icon = CATEGORY_ICONS[g.category] || Target;
                const colors = CATEGORY_COLORS[g.category] || CATEGORY_COLORS.OTHER;
                return (
                  <Card key={g.id} className="p-5 flex flex-col justify-between hover:border-slate-700 shadow-xl group">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase font-mono border ${colors.badge}`}>
                            {g.category}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium capitalize font-mono">
                          {g.frequency.toLowerCase()}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-arc-300 transition">
                          {g.name}
                        </h3>
                        {g.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{g.description}</p>}
                      </div>

                      <div className="pt-2">
                        <p className="text-xs text-slate-400">
                          Target: <strong className="text-white font-mono text-sm">{g.target_value} {g.unit}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80">
                      <button
                        onClick={() => handleToggleActive(g)}
                        className="text-xs font-medium text-slate-400 hover:text-amber-400 transition"
                      >
                        Deactivate
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(g)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(g.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Inactive Goals */}
          {inactiveGoals.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">
                Inactive / Paused Goals ({inactiveGoals.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60">
                {inactiveGoals.map((g) => (
                  <Card key={g.id} className="p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase bg-slate-800 text-slate-400 font-mono">
                          {g.category}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">Inactive</span>
                      </div>
                      <h3 className="text-base font-semibold text-slate-300 mt-2">{g.name}</h3>
                      <p className="text-xs text-slate-400 mt-2">
                        Target: {g.target_value} {g.unit}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80">
                      <button
                        onClick={() => handleToggleActive(g)}
                        className="text-xs text-arc-400 hover:text-arc-300 transition font-bold"
                      >
                        Reactivate
                      </button>
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Goal Modal */}
      <Modal
        isOpen={isCreateOpen || isEditOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setIsEditOpen(false);
        }}
        title={isCreateOpen ? 'Create New Goal' : 'Edit Goal'}
      >
        <form onSubmit={isCreateOpen ? handleCreate : handleEdit} className="space-y-4">
          {formError && (
            <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium">
              {formError}
            </div>
          )}

          <Input
            label="Goal Name"
            placeholder="e.g. Deep Work Coding"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0a0f19] border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-arc-400 focus:ring-2 focus:ring-arc-400/20"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Target Value"
              type="number"
              min="0"
              step="any"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              required
            />
            <Input
              label="Unit"
              placeholder="hours, mins, session, boolean"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes or execution rules for this habit..."
              className="w-full px-3.5 py-2 bg-[#0a0f19] border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-arc-400 focus:ring-2 focus:ring-arc-400/20 resize-none h-20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                setIsEditOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {isCreateOpen ? 'Create Goal' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
