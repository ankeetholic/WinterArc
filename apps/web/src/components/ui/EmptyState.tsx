import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { LucideIcon, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Sparkles,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="p-8 text-center flex flex-col items-center justify-center border-dashed">
      <div className="w-12 h-12 rounded-2xl bg-arc-500/10 border border-arc-500/20 text-arc-400 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} size="sm">
          {actionText}
        </Button>
      )}
    </Card>
  );
}
