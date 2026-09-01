import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Something went wrong while loading data.',
  onRetry,
}: ErrorStateProps) {
  return (
    <Card className="p-8 text-center flex flex-col items-center justify-center border-red-500/30 bg-red-950/20">
      <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-white mb-1">Unable to Load Data</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" size="sm">
          Try Again
        </Button>
      )}
    </Card>
  );
}
