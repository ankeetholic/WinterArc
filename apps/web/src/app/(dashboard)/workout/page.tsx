'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  api,
  RoutineTemplate,
  Workout,
  WorkoutExercise,
  WorkoutSet,
  PersonalRecord,
  ProgressiveOverloadAdvice,
} from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  Dumbbell,
  Play,
  CheckCircle2,
  Trophy,
  History,
  Clock,
  Plus,
  Trash2,
  Sparkles,
  Flame,
  Check,
  Timer,
  ChevronRight,
  RotateCcw,
  Zap,
  Calendar,
  BedDouble,
  ShieldAlert,
  Home,
  Building2,
  Pause,
  ArrowRight,
  TrendingUp,
  Activity,
  Bot,
  Info,
} from 'lucide-react';

const WEEKDAYS = [
  { id: 'day-1', num: 1, name: 'Monday', short: 'Mon', focus: 'Chest + Triceps', abs: 'Upper Abs', type: 'gym' },
  { id: 'day-2', num: 2, name: 'Tuesday', short: 'Tue', focus: 'Back + Biceps', abs: 'Lower Abs', type: 'gym_home', hasHome: true },
  { id: 'day-3', num: 3, name: 'Wednesday', short: 'Wed', focus: 'Side & Rear Delts', abs: 'Obliques', type: 'gym' },
  { id: 'day-4', num: 4, name: 'Thursday', short: 'Thu', focus: 'Chest + Triceps', abs: 'Upper Abs', type: 'gym' },
  { id: 'day-5', num: 5, name: 'Friday', short: 'Fri', focus: 'Back + Biceps', abs: 'Lower Abs', type: 'gym_home', hasHome: true },
  { id: 'day-6', num: 6, name: 'Saturday', short: 'Sat', focus: 'Legs + Side Delts', abs: 'Obliques', type: 'gym' },
  { id: 'day-7', num: 7, name: 'Sunday', short: 'Sun', focus: 'Rest & Recovery', abs: 'Rest', type: 'rest' },
];

export default function WorkoutPage() {
  const [routines, setRoutines] = useState<RoutineTemplate[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [history, setHistory] = useState<Workout[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'today' | 'split' | 'live' | 'history' | 'prs'>('today');

  // AI Coach Drawer state
  const [isAICoachOpen, setIsAICoachOpen] = useState(false);
  const [selectedExerciseForAI, setSelectedExerciseForAI] = useState<string>('');

  // Today determination (1: Mon, ..., 7: Sun)
  const currentDayOfWeek = new Date().getDay() === 0 ? 7 : new Date().getDay();
  const [selectedDayNum, setSelectedDayNum] = useState<number>(currentDayOfWeek);

  // Live Timer states
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Rest Timer states
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);
  const [totalRestDuration, setTotalRestDuration] = useState<number>(90);

  // Add custom exercise modal
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [customFocus, setCustomFocus] = useState('');
  const [customSets, setCustomSets] = useState('3');
  const [customReps, setCustomReps] = useState('8-12');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [tplRes, histRes, prRes] = await Promise.all([
        api.getWorkoutTemplates(),
        api.getWorkouts(),
        api.getPersonalRecords(),
      ]);
      setRoutines(tplRes.routines);
      setHistory(histRes.results);
      setPrs(prRes.prs);
    } catch (err: any) {
      setError(err.message || 'Failed to load workout data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Workout duration timer ticker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Rest timer ticker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (restSecondsLeft !== null && restSecondsLeft > 0) {
      interval = setInterval(() => {
        setRestSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restSecondsLeft]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartRoutine = async (templateId: string) => {
    setLoading(true);
    try {
      const workout = await api.startWorkoutTemplate({
        template_id: templateId,
        date: new Date().toISOString().split('T')[0],
      });
      setActiveWorkout(workout);
      setTimerSeconds(0);
      setIsTimerRunning(true);
      setActiveTab('live');
    } catch (err: any) {
      alert(err.message || 'Failed to start workout.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogSet = async (
    exerciseId: string,
    setNumber: number,
    weight: number,
    reps: number,
    completed: boolean
  ) => {
    if (!activeWorkout) return;
    try {
      await api.logWorkoutSet(activeWorkout.id, {
        exercise_id: exerciseId,
        set_number: setNumber,
        weight,
        repetitions: reps,
        completed,
      });

      // Update local state for immediate feedback
      setActiveWorkout((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          exercises: prev.exercises.map((ex) => {
            if (ex.id !== exerciseId) return ex;
            return {
              ...ex,
              sets: ex.sets.map((s) => {
                if (s.set_number !== setNumber) return s;
                return { ...s, weight, repetitions: reps, completed };
              }),
            };
          }),
        };
      });

      // Start 90s rest timer on completed set
      if (completed) {
        setTotalRestDuration(90);
        setRestSecondsLeft(90);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save set.');
    }
  };

  const handleAddCustomExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkout || !customExerciseName.trim()) return;
    try {
      const newEx = await api.addWorkoutExercise(activeWorkout.id, {
        exercise_name: customExerciseName.trim(),
        primary_focus: customFocus.trim(),
        target_sets: parseInt(customSets) || 3,
        target_reps: customReps.trim() || '8-12',
      });
      setActiveWorkout({
        ...activeWorkout,
        exercises: [...activeWorkout.exercises, newEx],
      });
      setIsAddExerciseOpen(false);
      setCustomExerciseName('');
      setCustomFocus('');
    } catch (err: any) {
      alert(err.message || 'Failed to add exercise.');
    }
  };

  const handleFinishWorkout = async () => {
    if (!activeWorkout) return;
    if (!confirm('Finish and log this workout session?')) return;
    const duration = Math.max(1, Math.round(timerSeconds / 60));
    try {
      await api.updateWorkout(activeWorkout.id, {
        duration_minutes: duration,
      });
      setIsTimerRunning(false);
      setActiveWorkout(null);
      setRestSecondsLeft(null);
      loadData();
      setActiveTab('history');
    } catch (err: any) {
      alert(err.message || 'Failed to finish workout.');
    }
  };

  if (loading && routines.length === 0) {
    return <LoadingState message="Loading your workout routine program..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  const selectedGymRoutine = routines.find((r) => r.id === `day-${selectedDayNum}`);
  const homeTrapsNeckRoutine = routines.find((r) => r.id === 'home-traps-neck');
  const hasHomeRoutineToday = selectedDayNum === 2 || selectedDayNum === 5; // Tuesday & Friday

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-arc-500/20 text-arc-300 border border-arc-500/30 uppercase tracking-widest font-mono">
              6-Day Hypertrophy + AI Overload
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Workout Progression
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Prescribed Gym sessions + separate Home Traps/Neck hypertrophy on Tuesdays & Fridays.
          </p>
        </div>

        {/* AI Coach & Tab Switcher Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedExerciseForAI('');
              setIsAICoachOpen(true);
            }}
            className="border-arc-500/40 text-arc-300 hover:text-white bg-arc-500/10 shadow-lg shadow-arc-500/10 font-bold"
          >
            <Bot className="w-4 h-4 mr-1.5 text-arc-400" /> AI Coach
          </Button>

          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-2xl flex-wrap shadow-lg shadow-black/40">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                activeTab === 'today' ? 'bg-arc-500 text-slate-950 font-bold shadow-md shadow-arc-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily Program
            </button>
            <button
              onClick={() => setActiveTab('split')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                activeTab === 'split' ? 'bg-arc-500 text-slate-950 font-bold shadow-md shadow-arc-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Routines
            </button>
            {activeWorkout && (
              <button
                onClick={() => setActiveTab('live')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 ${
                  activeTab === 'live'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-emerald-400 hover:bg-slate-900 animate-pulse'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> Live ({formatTime(timerSeconds)})
              </button>
            )}
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                activeTab === 'history' ? 'bg-arc-500 text-slate-950 font-bold shadow-md shadow-arc-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              History ({history.length})
            </button>
            <button
              onClick={() => setActiveTab('prs')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                activeTab === 'prs' ? 'bg-arc-500 text-slate-950 font-bold shadow-md shadow-arc-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              PRs ({prs.length})
            </button>
          </div>
        </div>
      </div>

      {/* Day Selector Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
        {WEEKDAYS.map((day) => {
          const isCurrentToday = day.num === currentDayOfWeek;
          const isSelected = day.num === selectedDayNum && activeTab === 'today';
          return (
            <button
              key={day.id}
              onClick={() => {
                setSelectedDayNum(day.num);
                setActiveTab('today');
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                isSelected
                  ? 'bg-gradient-to-br from-[#0c182a] via-[#091222] to-[#060b14] border-arc-400 text-white shadow-xl shadow-arc-500/20 ring-1 ring-arc-400/50'
                  : isCurrentToday
                  ? 'bg-[#0a111e] border-arc-500/40 text-slate-200 hover:border-arc-400'
                  : 'bg-[#080d16]/80 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {isCurrentToday && (
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[9px] font-black rounded-full bg-arc-400 text-slate-950 uppercase font-mono shadow-sm shadow-arc-400/40">
                  TODAY
                </span>
              )}
              <div className="flex items-center gap-1.5">
                {day.type === 'rest' ? (
                  <BedDouble className="w-3.5 h-3.5 text-emerald-400" />
                ) : day.hasHome ? (
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Dumbbell className="w-3.5 h-3.5 text-arc-400" />
                )}
                <p className="text-xs font-extrabold font-mono uppercase tracking-wider">{day.name}</p>
              </div>
              <p className="text-[11px] font-bold text-white truncate mt-1.5">{day.focus}</p>
              <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-400 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-arc-300 font-mono">
                  {day.abs}
                </span>
                {day.hasHome && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono">
                    + Home
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Floating Rest Timer Dock */}
      {restSecondsLeft !== null && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0c1424]/95 border border-arc-400/50 text-white p-4 rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5 border-glow">
          <div className="w-12 h-12 rounded-xl bg-arc-500/20 text-arc-400 flex items-center justify-center font-mono font-bold text-sm border border-arc-500/30">
            <Timer className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Rest Interval</p>
            <p className="text-2xl font-black text-white font-mono">{formatTime(restSecondsLeft)}</p>
          </div>
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <button
              onClick={() => setRestSecondsLeft((prev) => (prev !== null ? prev + 30 : 30))}
              className="px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              +30s
            </button>
            <button
              onClick={() => setRestSecondsLeft(null)}
              className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: TODAY'S DEDICATED SESSIONS VIEW */}
      {activeTab === 'today' && selectedGymRoutine && (
        <div className="space-y-6">
          {/* Sunday Rest View */}
          {selectedGymRoutine.category === 'REST' ? (
            <Card className="p-8 sm:p-12 text-center bg-gradient-to-br from-[#07161b] via-[#09111c] to-[#060a12] border-emerald-500/30 space-y-6 shadow-2xl shadow-emerald-950/20">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                <BedDouble className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <span className="px-3.5 py-1 text-xs font-extrabold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-mono tracking-wider">
                  Sunday (Day 7) — Active Recovery & Rest
                </span>
                <h2 className="text-3xl font-black text-white">Full Recovery & Rejuvenation</h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                  Your hypertrophy progress happens while you rest. Prioritize 8+ hours of sleep, high protein intake, tissue hydration, and light mobility.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left pt-4">
                {selectedGymRoutine.exercises.map((ex, i) => (
                  <div key={i} className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/90 text-xs shadow-md">
                    <p className="font-bold text-white text-sm">{ex.name}</p>
                    <p className="text-emerald-400 mt-1 font-mono text-xs">{ex.target_reps} • {ex.focus}</p>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Session 1: Gym Workout Card */}
              <Card className="p-6 sm:p-8 bg-gradient-to-br from-[#0c1626] via-[#09111e] to-[#060a12] border-arc-500/30 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-slate-800/80">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-arc-500/20 text-arc-300 border border-arc-500/30 uppercase font-mono flex items-center gap-1.5 shadow-sm shadow-arc-500/10">
                        <Building2 className="w-3.5 h-3.5" /> Session 1: Gym Workout
                      </span>
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-800/90 text-slate-300 border border-slate-700 font-mono">
                        Abs: <strong className="text-arc-300">{selectedGymRoutine.abs_rotation}</strong>
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                      {selectedGymRoutine.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                      {selectedGymRoutine.focus}
                    </p>
                  </div>

                  <Button
                    onClick={() => handleStartRoutine(selectedGymRoutine.id)}
                    size="lg"
                    className="bg-gradient-to-r from-arc-400 via-sky-400 to-teal-300 text-slate-950 font-black shadow-xl shadow-arc-500/25 flex-shrink-0"
                  >
                    <Play className="w-4 h-4 mr-2 fill-current" /> Start Gym Session
                  </Button>
                </div>

                {/* Exercises Preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                      Prescribed Gym Exercises ({selectedGymRoutine.exercises.length} Total)
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {selectedGymRoutine.exercises.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 flex items-center justify-between gap-3 text-xs transition duration-200"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-arc-400 font-mono font-bold flex items-center justify-center text-xs">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-white text-sm">{ex.name}</span>
                          </div>
                          <p className="text-slate-400 mt-1 pl-8">
                            Focus: <span className="text-slate-200 font-medium">{ex.focus}</span>
                          </p>
                        </div>
                        <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-right font-mono flex-shrink-0">
                          <span className="text-arc-300 font-bold">{ex.target_sets} sets</span>
                          <p className="text-[10px] text-slate-500">{ex.target_reps}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Session 2: Home Routine Card (Tuesdays & Fridays) */}
              {hasHomeRoutineToday && homeTrapsNeckRoutine && (
                <Card className="p-6 sm:p-8 bg-gradient-to-br from-[#1b1208] via-[#100d08] to-[#06080e] border-amber-500/30 space-y-6 shadow-2xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-slate-800/80">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-mono flex items-center gap-1.5 shadow-sm shadow-amber-500/10">
                          <Home className="w-3.5 h-3.5" /> Session 2: Home Workout (Evening / Post-Gym)
                        </span>
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-800/90 text-slate-300 border border-slate-700 font-mono">
                          Schedule: <strong className="text-amber-300">2x / Week (Tue & Fri)</strong>
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                        {homeTrapsNeckRoutine.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                        {homeTrapsNeckRoutine.focus}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleStartRoutine(homeTrapsNeckRoutine.id)}
                      size="lg"
                      className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-xl shadow-amber-500/25 flex-shrink-0"
                    >
                      <Play className="w-4 h-4 mr-2 fill-current" /> Start Home Session
                    </Button>
                  </div>

                  {/* Safety note */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Neck Training Protocol:</strong> Start very light, use slow controlled reps, and stop immediately if you experience sharp pain.
                    </span>
                  </div>

                  {/* Home Exercises Preview */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                      Home Exercises ({homeTrapsNeckRoutine.exercises.length} Total)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {homeTrapsNeckRoutine.exercises.map((ex, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 flex items-center justify-between gap-3 text-xs transition duration-200"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 font-mono font-bold flex items-center justify-center text-xs">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-white text-sm">{ex.name}</span>
                            </div>
                            <p className="text-slate-400 mt-1 pl-8">
                              Focus: <span className="text-slate-200 font-medium">{ex.focus}</span>
                            </p>
                          </div>
                          <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-right font-mono flex-shrink-0">
                            <span className="text-amber-300 font-bold">{ex.target_sets} sets</span>
                            <p className="text-[10px] text-slate-500">{ex.target_reps}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL ROUTINES SPLIT VIEW */}
      {activeTab === 'split' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {routines.map((routine) => (
              <Card
                key={routine.id}
                className="p-6 flex flex-col justify-between hover:border-slate-700 transition duration-300 group shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase font-mono bg-arc-500/20 text-arc-300 border border-arc-500/30">
                      {routine.day_name || `Day ${routine.day_number}`}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold font-mono">
                      {routine.abs_rotation}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-arc-300 transition">
                      {routine.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{routine.focus}</p>
                  </div>

                  <div className="pt-2 space-y-1.5 text-xs">
                    {routine.exercises.map((ex, i) => (
                      <div key={i} className="flex items-center justify-between text-slate-400 py-0.5">
                        <span className="truncate pr-2">{i + 1}. {ex.name}</span>
                        <span className="font-mono text-[11px] text-slate-500 flex-shrink-0">
                          {ex.target_sets} × {ex.target_reps}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80">
                  <Button
                    onClick={() => handleStartRoutine(routine.id)}
                    size="sm"
                    className="w-full font-bold"
                  >
                    <Play className="w-3.5 h-3.5 mr-1.5 fill-current" /> Start Session
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE WORKOUT TRACKER */}
      {activeTab === 'live' && (
        <div className="space-y-6">
          {!activeWorkout ? (
            <EmptyState
              title="No Active Session"
              description="You don't have a live workout in progress. Select a session to begin logging."
              actionText="View Today's Sessions"
              onAction={() => setActiveTab('today')}
            />
          ) : (
            <>
              {/* Session Control Header Card */}
              <Card className="p-6 bg-gradient-to-r from-slate-900 via-[#0a1420] to-[#07131b] border-arc-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-20 shadow-2xl backdrop-blur-2xl">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
                      Live Session Active
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white mt-1">{activeWorkout.name}</h2>
                  <p className="text-xs text-slate-400">{activeWorkout.notes}</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="px-5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-center font-mono shadow-inner">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Duration</p>
                    <p className="text-2xl font-black text-white">{formatTime(timerSeconds)}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedExerciseForAI(activeWorkout.exercises[0]?.exercise_name || '');
                      setIsAICoachOpen(true);
                    }}
                    className="border-arc-500/40 text-arc-300 font-bold"
                  >
                    <Bot className="w-4 h-4 mr-1 text-arc-400" /> AI Coach
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddExerciseOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Exercise
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleFinishWorkout}
                    className="bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/25 text-slate-950 font-black px-5"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Finish Session
                  </Button>
                </div>
              </Card>

              {/* Exercise Cards List */}
              <div className="space-y-5">
                {activeWorkout.exercises.map((exercise, exIdx) => (
                  <LiveExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    exIdx={exIdx}
                    onLogSet={(setNum, weight, reps, completed) =>
                      handleLogSet(exercise.id, setNum, weight, reps, completed)
                    }
                    onOpenAICoach={(exName) => {
                      setSelectedExerciseForAI(exName);
                      setIsAICoachOpen(true);
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 4: WORKOUT HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">Logged Workout History</h2>
          {history.length === 0 ? (
            <EmptyState
              title="No Logged Workouts"
              description="You have not completed any workout sessions yet. Start a session from your program to track volume and PRs."
              actionText="Start Today's Workout"
              onAction={() => setActiveTab('today')}
            />
          ) : (
            <div className="space-y-3">
              {history.map((w) => (
                <Card key={w.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-slate-800 text-arc-400 uppercase font-mono">
                        {w.date}
                      </span>
                      <h3 className="text-base font-bold text-white">{w.name}</h3>
                    </div>
                    <p className="text-xs text-slate-400">
                      Duration: <strong className="text-slate-200">{w.duration_minutes} mins</strong> • Completed Sets: <strong className="text-slate-200">{w.total_sets || 0}</strong> • Total Volume: <strong className="text-arc-400 font-mono">{w.total_volume || 0} kg</strong>
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-slate-500">
                      {w.exercises?.map((ex, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-lg bg-slate-950 border border-slate-800/80 font-medium">
                          {ex.exercise_name}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PERSONAL RECORDS (PRs) */}
      {activeTab === 'prs' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">Personal Records (Max Working Weight)</h2>
          {prs.length === 0 ? (
            <EmptyState
              title="No Personal Records Yet"
              description="Complete your exercises and log your heavy working sets to automatically unlock PR badges."
              actionText="View Today's Workout"
              onAction={() => setActiveTab('today')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {prs.map((pr, i) => (
                <Card key={i} className="p-5 flex flex-col justify-between hover:border-slate-700 shadow-xl">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">{pr.date}</span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-3">{pr.exercise_name}</h3>
                  </div>
                  <div className="pt-3 mt-3 border-t border-slate-800">
                    <p className="text-3xl font-black text-white font-mono">
                      {pr.max_weight} <span className="text-sm font-normal text-slate-400 font-sans">kg</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Max Reps: {pr.max_reps}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Custom Exercise Modal */}
      <Modal
        isOpen={isAddExerciseOpen}
        onClose={() => setIsAddExerciseOpen(false)}
        title="Add Custom Exercise to Session"
      >
        <form onSubmit={handleAddCustomExercise} className="space-y-4">
          <Input
            label="Exercise Name"
            placeholder="e.g. Incline Cable Fly"
            value={customExerciseName}
            onChange={(e) => setCustomExerciseName(e.target.value)}
            required
          />
          <Input
            label="Primary Focus (Optional)"
            placeholder="e.g. Upper Chest / Clavicular Head"
            value={customFocus}
            onChange={(e) => setCustomFocus(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Target Sets"
              type="number"
              min="1"
              max="10"
              value={customSets}
              onChange={(e) => setCustomSets(e.target.value)}
              required
            />
            <Input
              label="Target Reps"
              placeholder="e.g. 8-12"
              value={customReps}
              onChange={(e) => setCustomReps(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddExerciseOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Exercise</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Subcomponent: Live Exercise Card with AI Progressive Overload Advisor
function LiveExerciseCard({
  exercise,
  exIdx,
  onLogSet,
  onOpenAICoach,
}: {
  exercise: WorkoutExercise;
  exIdx: number;
  onLogSet: (setNum: number, weight: number, reps: number, completed: boolean) => void;
  onOpenAICoach: (exName: string) => void;
}) {
  const [aiAdvice, setAiAdvice] = useState<ProgressiveOverloadAdvice | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiError, setAiError] = useState<string>('');

  const fetchAIOverload = async () => {
    if (aiAdvice) {
      setIsAIOpen(!isAIOpen);
      return;
    }
    setLoadingAI(true);
    setAiError('');
    try {
      const res = await api.getProgressiveOverloadAdvice({
        exercise_name: exercise.exercise_name,
        target_sets: exercise.target_sets,
        target_reps: exercise.target_reps,
      });
      setAiAdvice(res);
      setIsAIOpen(true);
    } catch (err: any) {
      setAiError(err.message || 'LLM API call failed. Please configure GEMINI_API_KEY or OPENAI_API_KEY.');
      setIsAIOpen(true);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <Card className="p-5 sm:p-6 space-y-4 shadow-xl border-slate-800/90">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-slate-800 text-arc-400 font-mono font-bold text-xs flex items-center justify-center border border-slate-700">
              {exIdx + 1}
            </span>
            <h3 className="text-lg font-bold text-white">{exercise.exercise_name}</h3>
          </div>
          {exercise.primary_focus && (
            <p className="text-xs text-slate-400 mt-1 pl-9">
              Focus: <strong className="text-slate-200">{exercise.primary_focus}</strong> • Target: {exercise.target_sets} sets × {exercise.target_reps}
            </p>
          )}
        </div>

        {/* AI Overload Trigger Button */}
        <button
          type="button"
          onClick={fetchAIOverload}
          className="self-start px-3 py-1.5 rounded-xl bg-gradient-to-r from-arc-500/15 to-sky-500/10 border border-arc-500/30 text-arc-300 text-xs font-mono font-bold hover:border-arc-400 hover:text-white transition flex items-center gap-1.5 shadow-sm shadow-arc-500/10"
        >
          <Bot className="w-3.5 h-3.5 text-arc-400" />
          {loadingAI ? 'Invoking LLM...' : isAIOpen ? 'Hide AI Overload' : 'AI Overload Target'}
        </button>
      </div>

      {/* Error state if API key is missing or network fails */}
      {isAIOpen && aiError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in slide-in-from-top-2">
          <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block text-rose-200 mb-0.5">LLM API Error:</strong>
            <span>{aiError}</span>
          </div>
        </div>
      )}

      {/* AI Progressive Overload Insight Card */}
      {isAIOpen && aiAdvice && !aiError && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1626] to-[#070d16] border border-arc-500/30 space-y-3 text-xs animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-arc-500/20 text-arc-300 font-mono font-bold uppercase text-[10px] border border-arc-500/30">
                {aiAdvice.action}
              </span>
              <span className="font-bold text-white text-sm">
                🎯 Overload Target: <strong className="text-arc-300 font-mono">{aiAdvice.target_sets || exercise.target_sets} Sets</strong> of <strong className="text-arc-300 font-mono">{aiAdvice.suggested_weight} kg</strong> × <strong className="text-arc-300 font-mono">{aiAdvice.suggested_reps} reps</strong>
              </span>
            </div>
            <span className="text-emerald-400 font-mono font-bold text-[11px]">
              {aiAdvice.volume_projected_increase}
            </span>
          </div>

          <p className="text-slate-300 leading-relaxed">
            <strong>Rule:</strong> {aiAdvice.progression_rule}
          </p>

          <p className="text-slate-400">
            <strong>Hypertrophy Cue:</strong> {aiAdvice.coaching_tip}
          </p>

          {/* Warmup sets preview & 1-Click Auto-fill Button */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {aiAdvice.warmup_scheme && aiAdvice.warmup_scheme.length > 0 ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider">
                  Warmups:
                </span>
                {aiAdvice.warmup_scheme.map((w, wIdx) => (
                  <span key={wIdx} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-300">
                    {w.set}: <strong className="text-arc-400">{w.weight}kg</strong> × {w.reps}
                  </span>
                ))}
              </div>
            ) : <div />}

            <button
              type="button"
              onClick={() => {
                // Auto-log suggested weight for all empty sets
                exercise.sets.forEach((s) => {
                  if (!s.completed && (!s.weight || Number(s.weight) === 0)) {
                    onLogSet(s.set_number, aiAdvice.suggested_weight, s.repetitions || 8, false);
                  }
                });
              }}
              className="px-3 py-1.5 rounded-xl bg-arc-500/20 hover:bg-arc-500/30 border border-arc-500/40 text-arc-300 hover:text-white font-mono font-bold text-xs transition flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-arc-400" />
              Auto-fill {aiAdvice.suggested_weight}kg into all {aiAdvice.target_sets || exercise.target_sets} Sets
            </button>
          </div>
        </div>
      )}

      {/* Sets Table */}
      <div className="space-y-2 pt-1">
        <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-2">
          <span className="col-span-2 sm:col-span-1">Set</span>
          <span className="col-span-4 sm:col-span-3">Weight (kg)</span>
          <span className="col-span-4 sm:col-span-3">Reps</span>
          <span className="col-span-2 sm:col-span-5 text-right">Done</span>
        </div>

        {exercise.sets.map((s) => (
          <SetRow
            key={s.id || s.set_number}
            setObj={s}
            defaultWeight={aiAdvice ? aiAdvice.suggested_weight : undefined}
            onSave={(w, r, c) => onLogSet(s.set_number, w, r, c)}
          />
        ))}
      </div>
    </Card>
  );
}

// Subcomponent: Live Set Row
function SetRow({
  setObj,
  defaultWeight,
  onSave,
}: {
  setObj: WorkoutSet;
  defaultWeight?: number;
  onSave: (weight: number, reps: number, completed: boolean) => void;
}) {
  const [weight, setWeight] = useState<string>(
    setObj.weight !== undefined && setObj.weight !== null && Number(setObj.weight) > 0
      ? String(setObj.weight)
      : defaultWeight !== undefined && defaultWeight > 0
      ? String(defaultWeight)
      : ''
  );
  const [reps, setReps] = useState<string>(
    setObj.repetitions ? String(setObj.repetitions) : ''
  );
  const [isCompleted, setIsCompleted] = useState<boolean>(setObj.completed);

  const handleToggle = () => {
    const nextCompleted = !isCompleted;
    setIsCompleted(nextCompleted);
    const numW = parseFloat(weight) || 0;
    const numR = parseInt(reps) || 0;
    onSave(numW, numR, nextCompleted);
  };

  const handleBlur = () => {
    const numW = parseFloat(weight) || 0;
    const numR = parseInt(reps) || 0;
    if (isCompleted || numW > 0 || numR > 0) {
      onSave(numW, numR, isCompleted);
    }
  };

  return (
    <div
      className={`grid grid-cols-12 gap-2 items-center p-3 rounded-2xl border transition duration-200 ${
        isCompleted
          ? 'bg-[#081714] border-emerald-500/40 shadow-sm shadow-emerald-950/30'
          : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
      }`}
    >
      <span className="col-span-2 sm:col-span-1 font-mono font-black text-xs text-slate-300 pl-1">
        #{setObj.set_number}
      </span>
      <div className="col-span-4 sm:col-span-3">
        <input
          type="number"
          step="0.5"
          min="0"
          placeholder="0.0"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          onBlur={handleBlur}
          className="w-full px-3 py-2 text-xs font-mono bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-arc-400"
        />
      </div>
      <div className="col-span-4 sm:col-span-3">
        <input
          type="number"
          min="0"
          placeholder="0"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          onBlur={handleBlur}
          className="w-full px-3 py-2 text-xs font-mono bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-arc-400"
        />
      </div>
      <div className="col-span-2 sm:col-span-5 flex justify-end">
        <button
          type="button"
          onClick={handleToggle}
          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
            isCompleted
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/30 scale-105'
              : 'border-slate-700 bg-slate-900/80 hover:border-arc-400 text-transparent hover:text-slate-500'
          }`}
        >
          <Check className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
