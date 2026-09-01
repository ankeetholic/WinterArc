import React from 'react';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-10 h-10 border-3 border-arc-500/20 border-t-arc-400 rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium text-slate-400">{message}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 animate-pulse space-y-3">
      <div className="h-4 bg-slate-800 rounded w-1/3" />
      <div className="h-8 bg-slate-800 rounded w-1/2" />
      <div className="h-3 bg-slate-800 rounded w-2/3" />
    </div>
  );
}
