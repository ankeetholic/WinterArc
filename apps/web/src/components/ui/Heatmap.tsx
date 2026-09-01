'use client';

import React, { useState } from 'react';
import { Card } from './Card';
import { HeatmapDay } from '@/lib/api';
import { Calendar, Sparkles, Flame, CheckCircle2, TrendingUp, ChevronRight } from 'lucide-react';

interface HeatmapProps {
  days: HeatmapDay[];
  startDate?: string;
  endDate?: string;
  selectedDate?: string;
  onSelectDay?: (day: HeatmapDay) => void;
}

export function Heatmap({ days, selectedDate, onSelectDay }: HeatmapProps) {
  const [activeHoverDay, setActiveHoverDay] = useState<HeatmapDay | null>(null);

  // Map of date string -> HeatmapDay
  const dayMap = new Map<string, HeatmapDay>();
  days.forEach((d) => dayMap.set(d.date, d));

  // Determine weeks layout (columns) & month header markers
  const columns: Array<{
    weekIndex: number;
    monthLabel?: string;
    cells: Array<{ date: string; day?: HeatmapDay }>;
  }> = [];

  let totalLoggedHabits = 0;
  let totalActiveDays = 0;
  let perfectDays = 0;

  days.forEach((d) => {
    totalLoggedHabits += d.completed;
    if (d.completed > 0) totalActiveDays++;
    if (d.percentage >= 100) perfectDays++;
  });

  if (days.length > 0) {
    const firstDate = new Date(days[0].date + 'T00:00:00');
    const lastDate = new Date(days[days.length - 1].date + 'T00:00:00');

    // Align start to the preceding Sunday
    const startDate = new Date(firstDate);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const curr = new Date(startDate);
    let currentWeekCells: Array<{ date: string; day?: HeatmapDay }> = [];
    let prevMonth = -1;
    let weekIndex = 0;

    while (curr <= lastDate || currentWeekCells.length > 0) {
      const dateStr = curr.toISOString().split('T')[0];
      const dayData = dayMap.get(dateStr);

      currentWeekCells.push({ date: dateStr, day: dayData });

      if (currentWeekCells.length === 7) {
        // Check if a new month starts in this week
        const midWeekDate = new Date(curr);
        midWeekDate.setDate(midWeekDate.getDate() - 3);
        const currMonth = midWeekDate.getMonth();
        let monthLabel: string | undefined = undefined;

        if (currMonth !== prevMonth) {
          monthLabel = midWeekDate.toLocaleDateString('en-US', { month: 'short' });
          prevMonth = currMonth;
        }

        columns.push({
          weekIndex,
          monthLabel,
          cells: currentWeekCells,
        });

        currentWeekCells = [];
        weekIndex++;
      }

      curr.setDate(curr.getDate() + 1);
      if (curr > lastDate && currentWeekCells.length === 0) break;
    }
  }

  // Level colors
  const getCellStyling = (score?: number, isSelected?: boolean) => {
    if (isSelected) {
      return 'ring-2 ring-arc-400 ring-offset-2 ring-offset-[#06090e] scale-110 z-20 shadow-lg shadow-arc-400/40 bg-arc-400 text-slate-950';
    }
    if (score === undefined || score === 0) {
      return 'bg-[#0b1220] border border-white/[0.04] hover:border-slate-500 hover:scale-105';
    }
    if (score <= 0.3) {
      return 'bg-emerald-950/80 border border-emerald-800/40 hover:border-emerald-400 hover:scale-105 shadow-sm shadow-emerald-950/30';
    }
    if (score <= 0.6) {
      return 'bg-emerald-700 border border-emerald-500/50 hover:border-emerald-300 hover:scale-105 shadow-sm shadow-emerald-700/30';
    }
    if (score <= 0.85) {
      return 'bg-emerald-500 border border-emerald-400 hover:border-white hover:scale-105 shadow-md shadow-emerald-500/40';
    }
    return 'bg-gradient-to-tr from-arc-400 to-emerald-300 border border-white/60 shadow-lg shadow-arc-400/50 hover:scale-110';
  };

  const displayedDay = activeHoverDay || (selectedDate ? dayMap.get(selectedDate) : null) || (days.length > 0 ? days[days.length - 1] : null);

  return (
    <Card className="p-6 sm:p-7 space-y-6 bg-gradient-to-br from-[#0a101d] via-[#070c16] to-[#040810] border-arc-500/20 shadow-2xl relative overflow-hidden">
      {/* Top Header with Overview Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-arc-500/20 text-arc-300 border border-arc-500/30 uppercase tracking-widest font-mono shadow-sm shadow-arc-500/10">
              Contribution Matrix
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-center gap-2">
            Execution Consistency Heatmap
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Every square represents 1 full day of your daily timetable discipline.
          </p>
        </div>

        {/* Quick Highlights Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3.5 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-center font-mono">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Logged Tasks</span>
            <strong className="text-arc-400 text-sm font-bold">{totalLoggedHabits}</strong>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-center font-mono">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Active Days</span>
            <strong className="text-emerald-400 text-sm font-bold">{totalActiveDays}</strong>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-center font-mono">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">100% Days</span>
            <strong className="text-amber-400 text-sm font-bold">{perfectDays}</strong>
          </div>
        </div>
      </div>

      {/* Heatmap Matrix Table */}
      <div className="space-y-2">
        <div className="overflow-x-auto pb-3 pt-1">
          <div className="inline-block min-w-max">
            {/* Month Labels Header Row */}
            <div className="flex pl-10 mb-1.5 h-4 text-[11px] font-mono text-slate-400 font-bold select-none">
              {columns.map((col, idx) => (
                <div key={idx} className="w-[18px] sm:w-[22px] flex-shrink-0 text-left">
                  {col.monthLabel && <span>{col.monthLabel}</span>}
                </div>
              ))}
            </div>

            {/* Matrix Body: Day labels + Week Columns */}
            <div className="flex gap-2">
              {/* Day of week labels: All 7 days */}
              <div className="flex flex-col gap-1.5 text-[10px] text-slate-400 font-mono select-none pr-1">
                <span className="h-4 sm:h-5 flex items-center justify-end">Sun</span>
                <span className="h-4 sm:h-5 flex items-center justify-end">Mon</span>
                <span className="h-4 sm:h-5 flex items-center justify-end">Tue</span>
                <span className="h-4 sm:h-5 flex items-center justify-end">Wed</span>
                <span className="h-4 sm:h-5 flex items-center justify-end">Thu</span>
                <span className="h-4 sm:h-5 flex items-center justify-end">Fri</span>
                <span className="h-4 sm:h-5 flex items-center justify-end">Sat</span>
              </div>

              {/* Columns of 7 days */}
              <div className="flex gap-1.5">
                {columns.map((col, cIdx) => (
                  <div key={cIdx} className="flex flex-col gap-1.5">
                    {col.cells.map((cell) => {
                      const day = cell.day;
                      const isTracked = !!day;
                      const isSelected = selectedDate === cell.date;

                      return (
                        <button
                          key={cell.date}
                          type="button"
                          onMouseEnter={() => day && setActiveHoverDay(day)}
                          onMouseLeave={() => setActiveHoverDay(null)}
                          onClick={() => {
                            if (day) {
                              setActiveHoverDay(day);
                              onSelectDay?.(day);
                            }
                          }}
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-[5px] transition-all duration-200 cursor-pointer ${getCellStyling(
                            day?.score,
                            isSelected
                          )}`}
                          title={
                            day
                              ? `${day.date}: ${day.percentage}% (${day.completed}/${day.total} habits completed)`
                              : cell.date
                          }
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend and Active Day Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
          {/* Active day quick info preview */}
          {displayedDay ? (
            <div className="flex items-center gap-2.5 text-slate-300 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-arc-400 animate-pulse" />
              <span>
                <strong>{new Date(displayedDay.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}:</strong>{' '}
                <span className="text-arc-400 font-bold">{displayedDay.percentage}% score</span>{' '}
                <span className="text-slate-400">({displayedDay.completed}/{displayedDay.total} tasks)</span>
              </span>
            </div>
          ) : (
            <span className="text-slate-400">Click any day above to inspect logged habits</span>
          )}

          {/* Color Scale Legend */}
          <div className="flex items-center gap-2 font-mono text-slate-400 text-[11px] self-end sm:self-auto">
            <span>0%</span>
            <div className="w-3.5 h-3.5 rounded-[4px] bg-[#0b1220] border border-white/5" />
            <div className="w-3.5 h-3.5 rounded-[4px] bg-emerald-950 border border-emerald-800/40" />
            <div className="w-3.5 h-3.5 rounded-[4px] bg-emerald-700" />
            <div className="w-3.5 h-3.5 rounded-[4px] bg-emerald-500" />
            <div className="w-3.5 h-3.5 rounded-[4px] bg-gradient-to-tr from-arc-400 to-emerald-300 shadow-sm shadow-arc-400/50" />
            <span>100%</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
