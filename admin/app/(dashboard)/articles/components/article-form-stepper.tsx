'use client';

import { useArticleForm } from './article-form-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Check, AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STEP_CONFIGS, getStepStatus, getMissingRequiredFields, getMissingOptionalFields } from '../helpers/step-validation-helpers';
import { useEffect, useRef } from 'react';

export function ArticleFormStepper() {
  const { currentStep, goToStep, totalSteps, getStepValidation, formData } = useArticleForm();
  const stepRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentStep > 1) {
        e.preventDefault();
        goToStep(currentStep - 1);
        stepRefs.current[currentStep - 2]?.focus();
      } else if (e.key === 'ArrowRight' && currentStep < totalSteps) {
        e.preventDefault();
        goToStep(currentStep + 1);
        stepRefs.current[currentStep]?.focus();
      }
    };

    const activeElement = document.activeElement;
    if (activeElement && stepRefs.current.includes(activeElement as HTMLButtonElement)) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [currentStep, goToStep, totalSteps]);

  return (
    <div className="w-full">
      <div className="hidden lg:flex items-center justify-between">
        {STEP_CONFIGS.map((step, index) => {
          const validation = getStepValidation(step.number);
          const status = getStepStatus(step.number, currentStep, validation);
          const missingRequiredFields = getMissingRequiredFields(step.number, formData);
          const missingOptionalFields = getMissingOptionalFields(step.number, formData);
          const isActive = status === 'active';
          const isCompleted = status === 'completed';
          const hasError = status === 'error';
          const hasWarning = status === 'warning';
          const isLast = index === STEP_CONFIGS.length - 1;

          return (
            <div key={step.id} className="flex items-start flex-1 min-w-0">
              <div className="flex flex-col items-center flex-1 min-w-0">
                <HoverCard openDelay={200} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <Button
                      ref={(el) => { stepRefs.current[index] = el; }}
                      variant="ghost"
                      size="sm"
                      onClick={() => goToStep(step.number)}
                      className={cn(
                        'h-12 w-12 rounded-full p-0 relative transition-all duration-300',
                        'hover:scale-110 focus:scale-110 focus:ring-2 focus:ring-offset-2',
                        'transform-gpu will-change-transform',
                        isActive && 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 focus:ring-primary',
                        isCompleted && 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30',
                        hasError && 'bg-gradient-to-br from-destructive to-red-600 text-white shadow-md shadow-destructive/20 animate-pulse',
                        hasWarning && 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20',
                        !isActive && !isCompleted && !hasError && !hasWarning && 'bg-gradient-to-br from-muted to-muted/80 text-muted-foreground hover:from-muted/90 hover:to-muted/70 shadow-sm',
                      )}
                      aria-label={`Step ${step.number}: ${step.label}. ${validation.completedFields} of ${validation.totalFields} fields completed`}
                      aria-current={isActive ? 'step' : undefined}
                    >
                      {isCompleted ? (
                        <Check className="h-6 w-6 stroke-[2.5]" />
                      ) : hasError ? (
                        <AlertCircle className="h-6 w-6 stroke-[2.5]" />
                      ) : hasWarning ? (
                        <AlertTriangle className="h-6 w-6 stroke-[2.5]" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="text-base font-bold tracking-tight">{step.number}</span>
                          {!validation.isValid && (
                            <div className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 shadow-sm">
                              <AlertCircle className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      )}

                      {validation.completionPercentage > 0 && validation.completionPercentage < 100 && (
                        <svg className="absolute inset-0 h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                          <circle
                            cx="24"
                            cy="24"
                            r="22"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="opacity-20"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r="22"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={`${validation.completionPercentage * 1.38} 138`}
                            strokeLinecap="round"
                            className={cn(
                              'transition-all duration-500 ease-in-out',
                              isActive && 'stroke-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]',
                              isCompleted && 'stroke-emerald-400',
                              hasError && 'stroke-red-400',
                              hasWarning && 'stroke-amber-400',
                            )}
                          />
                        </svg>
                      )}
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 p-5 shadow-xl border-2" side="bottom" align="center">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <Badge
                            variant={
                              isActive
                                ? 'default'
                                : isCompleted
                                  ? 'secondary'
                                  : hasError
                                    ? 'destructive'
                                    : 'outline'
                            }
                            className={cn(
                              'text-xs font-bold px-2.5 py-1 shadow-sm',
                              isActive && 'bg-gradient-to-r from-primary to-primary/80',
                              isCompleted && 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white',
                            )}
                          >
                            {step.number}
                          </Badge>
                          <h4 className="font-bold text-sm tracking-tight">{step.label}</h4>
                        </div>
                        <span className={cn(
                          'text-2xl font-extrabold tabular-nums',
                          validation.completionPercentage === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary',
                        )}>
                          {validation.completionPercentage}%
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                        {step.description}
                      </p>

                      <div className="space-y-2.5">
                        <Progress value={validation.completionPercentage} className="h-2 shadow-inner" />
                        <div className="flex justify-between text-xs font-medium">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-foreground/80">
                              {validation.completedFields}/{validation.totalFields} fields
                            </span>
                          </div>
                          <span
                            className={cn(
                              'font-semibold px-2 py-0.5 rounded',
                              validation.isValid
                                ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30'
                                : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30',
                            )}
                          >
                            {validation.completedRequiredFields}/{validation.requiredFields} required
                          </span>
                        </div>
                      </div>

                      {missingRequiredFields.length > 0 && (
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-950/10 border-2 border-amber-300 dark:border-amber-700 rounded-lg p-3 shadow-sm">
                          <div className="flex items-center gap-1.5 mb-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
                              Missing Required
                            </p>
                          </div>
                          <ul className="text-xs space-y-1 text-amber-900 dark:text-amber-200 ml-5 font-medium">
                            {missingRequiredFields.map(({ field, label }) => (
                              <li key={field} className="flex items-center gap-1">
                                <span className="text-amber-600 dark:text-amber-400">•</span> {label}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {missingOptionalFields.length > 0 && (
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-950/10 border border-blue-200 dark:border-blue-800 rounded-lg p-3 shadow-sm">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                              Optional (for 100%)
                            </p>
                          </div>
                          <ul className="text-xs space-y-1 text-blue-900 dark:text-blue-200 ml-5 font-medium max-h-32 overflow-y-auto">
                            {missingOptionalFields.map(({ field, label }) => (
                              <li key={field} className="flex items-center gap-1">
                                <span className="text-blue-600 dark:text-blue-400">•</span> {label}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {validation.hasErrors && (
                        <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-950/10 border-2 border-red-300 dark:border-red-700 rounded-lg p-3 shadow-sm">
                          <p className="text-sm font-bold text-red-900 dark:text-red-100 mb-2 flex items-center gap-1.5">
                            <AlertCircle className="h-4 w-4" />
                            {validation.errors.length} Error{validation.errors.length > 1 ? 's' : ''} Found
                          </p>
                          <ul className="text-xs space-y-1 text-red-900 dark:text-red-200 ml-5 font-medium">
                            {validation.errors.slice(0, 3).map((error, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <span className="text-red-600 dark:text-red-400">•</span> {error}
                              </li>
                            ))}
                            {validation.errors.length > 3 && (
                              <li className="text-muted-foreground font-semibold mt-1">
                                + {validation.errors.length - 3} more error{validation.errors.length - 3 > 1 ? 's' : ''}
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </HoverCardContent>
                </HoverCard>
                <span
                  className={cn(
                    'mt-3 text-xs font-semibold transition-all duration-300 tracking-wide whitespace-nowrap px-1',
                    isActive && 'text-primary scale-105 drop-shadow-sm',
                    isCompleted && 'text-emerald-600 dark:text-emerald-400',
                    hasError && 'text-destructive',
                    hasWarning && 'text-amber-600 dark:text-amber-400',
                    !isActive && !isCompleted && !hasError && !hasWarning && 'text-muted-foreground/70',
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div className="relative flex-1 max-w-[120px] h-1 mx-3 mt-6">
                  <div className="absolute inset-0 bg-muted rounded-full" />
                  <div
                    className={cn(
                      'absolute inset-0 rounded-full transition-all duration-500 ease-in-out',
                      isCompleted
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/30'
                        : 'bg-transparent w-0',
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex lg:hidden items-center justify-center gap-2 overflow-x-auto px-2 py-2">
        {STEP_CONFIGS.map((step) => {
          const validation = getStepValidation(step.number);
          const status = getStepStatus(step.number, currentStep, validation);
          const missingRequiredFields = getMissingRequiredFields(step.number, formData);
          const missingOptionalFields = getMissingOptionalFields(step.number, formData);
          const isActive = status === 'active';
          const isCompleted = status === 'completed';
          const hasError = status === 'error';
          const hasWarning = status === 'warning';

          return (
            <HoverCard key={step.id} openDelay={200} closeDelay={100}>
              <HoverCardTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToStep(step.number)}
                  className={cn(
                    'h-10 w-10 rounded-full p-0 relative shrink-0 transition-all duration-300',
                    'hover:scale-110 transform-gpu',
                    isActive && 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30',
                    isCompleted && 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20',
                    hasError && 'bg-gradient-to-br from-destructive to-red-600 text-white shadow-md shadow-destructive/20',
                    hasWarning && 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20',
                    !isActive && !isCompleted && !hasError && !hasWarning && 'bg-gradient-to-br from-muted to-muted/80 text-muted-foreground shadow-sm',
                  )}
                  aria-label={`Step ${step.number}: ${step.label}`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 stroke-[2.5]" />
                  ) : hasError ? (
                    <AlertCircle className="h-5 w-5 stroke-[2.5]" />
                  ) : hasWarning ? (
                    <AlertTriangle className="h-5 w-5 stroke-[2.5]" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold">{step.number}</span>
                      {!validation.isValid && (
                        <div className="absolute -top-0.5 -right-0.5 bg-destructive text-white rounded-full p-0.5 shadow-sm">
                          <AlertCircle className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </div>
                  )}
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-72 p-4 shadow-lg border-2" side="bottom">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">{step.label}</h4>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-sm font-bold px-2.5 py-1',
                        validation.completionPercentage === 100 && 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white',
                      )}
                    >
                      {validation.completionPercentage}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    {step.description}
                  </p>
                  <div className="text-xs space-y-2 font-medium">
                    <div className="flex justify-between items-center px-2 py-1.5 bg-muted/50 rounded">
                      <span className="text-muted-foreground">Completed:</span>
                      <span className="font-bold text-foreground">
                        {validation.completedFields}/{validation.totalFields}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-2 py-1.5 bg-muted/50 rounded">
                      <span className="text-muted-foreground">Required:</span>
                      <span className={cn(
                        'font-bold',
                        validation.isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400',
                      )}>
                        {validation.completedRequiredFields}/{validation.requiredFields}
                      </span>
                    </div>
                  </div>
                  {missingRequiredFields.length > 0 && (
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-950/10 border-2 border-amber-300 dark:border-amber-700 rounded-lg p-2">
                      <p className="text-xs font-bold text-amber-900 dark:text-amber-100 mb-1 flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Required:
                      </p>
                      <p className="text-xs text-amber-900 dark:text-amber-200 font-medium pl-4">
                        {missingRequiredFields.map((f) => f.label).join(', ')}
                      </p>
                    </div>
                  )}
                  {missingOptionalFields.length > 0 && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-950/10 border border-blue-200 dark:border-blue-800 rounded-lg p-2">
                      <p className="text-xs font-bold text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-1">
                        <Info className="h-3.5 w-3.5" />
                        For 100%:
                      </p>
                      <p className="text-xs text-blue-900 dark:text-blue-200 font-medium pl-4 max-h-20 overflow-y-auto">
                        {missingOptionalFields.map((f) => f.label).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </HoverCardContent>
            </HoverCard>
          );
        })}
      </div>
    </div>
  );
}
