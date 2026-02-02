'use client';

import { CheckCircle2, AlertCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionStatusIndicatorProps {
  completed: boolean;
  hasErrors: boolean;
  className?: string;
}

export function SectionStatusIndicator({
  completed,
  hasErrors,
  className,
}: SectionStatusIndicatorProps) {
  if (hasErrors) {
    return (
      <AlertCircle
        className={cn('h-4 w-4 text-destructive shrink-0', className)}
        aria-label="يوجد أخطاء"
      />
    );
  }

  if (completed) {
    return (
      <CheckCircle2
        className={cn('h-4 w-4 text-green-600 shrink-0', className)}
        aria-label="مكتمل"
      />
    );
  }

  return (
    <Circle
      className={cn('h-4 w-4 text-muted-foreground shrink-0', className)}
      aria-label="غير مكتمل"
    />
  );
}
