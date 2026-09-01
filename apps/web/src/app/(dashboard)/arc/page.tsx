'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api, Arc } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Flame, Plus, Edit3, Archive, Calendar, CheckCircle2, Sparkles, Clock } from 'lucide-react';

export default function ArcPage() {
  const [arcs, setArcs] = useState<Arc[]>([]);
  const [activeArc, setActiveArc] = useState<Arc | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusVal, setStatusVal] = useState<'ACTIVE' | 'COMPLETED' | 'ARCHIVED'>('ACTIVE');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadArcs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getArcs();
      setArcs(res.results);
      const active = res.results.find((a) => a.status === 'ACTIVE') || null;
      setActiveArc(active);
    } catch (err: any) {
      setError(err.message || 'Failed to load Arcs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArcs();
  }, [loadArcs]);

  const openCreateModal = () => {
    setIsEdit(false);
    setName('Winter Arc ' + new Date().getFullYear());
    setDescription('');
    const todayStr = new Date().toISOString().split('T')[0];
    const endD = new Date();
    endD.setDate(endD.getDate() + 90);
    setStartDate(todayStr);
    setEndDate(endD.toISOString().split('T')[0]);
    setStatusVal('ACTIVE');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (a: Arc) => {
    setIsEdit(true);
    setName(a.name);
    setDescription(a.description || '');
    setStartDate(a.start_date);
    setEndDate(a.end_date);
    setStatusVal(a.status);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      if (isEdit && activeArc) {
        await api.updateArc(activeArc.id, {
          name,
          description,
          start_date: startDate,
          end_date: endDate,
          status: statusVal,
        });
      } else {
        await api.createArc({
          name,
          description,
          start_date: startDate,
          end_date: endDate,
        });
      }
      setIsModalOpen(false);
      loadArcs();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save Arc.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (a: Arc) => {
    if (!confirm(`Archive "${a.name}"?`)) return;
    try {
      await api.updateArc(a.id, { status: 'ARCHIVED' });
      loadArcs();
    } catch (err: any) {
      alert(err.message || 'Failed to archive Arc.');
    }
  };

  if (loading) return <LoadingState message="Loading your Arcs..." />;
  if (error) return <ErrorState message={error} onRetry={loadArcs} />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-arc-500/20 text-arc-300 border border-arc-500/30 uppercase tracking-widest font-mono">
              Arc Architecture
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Arc Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Define your dedicated timeline, milestones, and discipline parameters.
          </p>
        </div>
        <Button onClick={openCreateModal} size="md" className="shadow-lg shadow-arc-500/20 font-bold">
          <Plus className="w-4 h-4 mr-1.5" /> Create New Arc
        </Button>
      </div>

      {/* Active Arc Section */}
      {activeArc ? (
        <Card className="p-6 sm:p-8 bg-gradient-to-br from-[#0c1626] via-[#09111e] to-[#060a12] border-arc-500/30 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 pb-4 border-b border-slate-800/80">
            <div className="space-y-2">
              <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-arc-500/20 text-arc-300 border border-arc-500/30 uppercase font-mono tracking-wider shadow-sm shadow-arc-500/10">
                Current Active Arc
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">{activeArc.name}</h2>
              {activeArc.description && (
                <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">{activeArc.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => openEditModal(activeArc)} className="rounded-xl">
                <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Timeline
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleArchive(activeArc)} className="rounded-xl">
                <Archive className="w-3.5 h-3.5 mr-1" /> Archive
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/90">
              <span className="text-slate-500 uppercase tracking-wider text-[10px] block">Start Date</span>
              <strong className="text-white text-sm font-semibold">{activeArc.start_date}</strong>
            </div>
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/90">
              <span className="text-slate-500 uppercase tracking-wider text-[10px] block">End Target</span>
              <strong className="text-white text-sm font-semibold">{activeArc.end_date}</strong>
            </div>
          </div>
        </Card>
      ) : (
        <EmptyState
          title="No Active Arc Configured"
          description="You currently do not have an active Arc. Create a new Arc to begin your consistency journey."
          actionText="Create Arc"
          onAction={openCreateModal}
        />
      )}

      {/* Arc History */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">All Arcs History</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {arcs.map((a) => (
            <Card key={a.id} className="p-5 flex flex-col justify-between hover:border-slate-700 shadow-xl group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase font-mono ${
                      a.status === 'ACTIVE'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {a.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {a.start_date} → {a.end_date}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-arc-300 transition mt-1">{a.name}</h4>
                {a.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{a.description}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-800/80">
                <Button variant="ghost" size="sm" onClick={() => openEditModal(a)} className="text-xs">
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEdit ? 'Edit Arc Timeline' : 'Create New Arc'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium">
              {formError}
            </div>
          )}

          <Input
            label="Arc Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            <label className="block text-xs font-semibold text-slate-300">Status</label>
            <select
              value={statusVal}
              onChange={(e: any) => setStatusVal(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0a0f19] border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-arc-400 focus:ring-2 focus:ring-arc-400/20"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are the primary rules and focus areas for this Arc?"
              className="w-full px-3.5 py-2 bg-[#0a0f19] border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-arc-400 focus:ring-2 focus:ring-arc-400/20 resize-none h-20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {isEdit ? 'Save Changes' : 'Create Arc'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
