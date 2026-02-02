'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle, AlertTriangle, CheckCircle2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { StepConfig, StepValidation } from '../../helpers/step-validation-helpers';
import type { ArticleFormData } from '@/lib/types/form-types';
import { formatFieldValue, isFieldSet } from '../../helpers/field-display-helpers';
import { getFieldLabel } from '../../helpers/step-validation-helpers';

interface StepReviewCardProps {
  stepNumber: number;
  stepConfig: StepConfig;
  validation: StepValidation;
  formData: ArticleFormData;
  missingFields: Array<{ field: string; label: string }>;
}

export function StepReviewCard({
  stepNumber,
  stepConfig,
  validation,
  formData,
  missingFields,
}: StepReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isCompleted = validation.isValid && validation.completionPercentage === 100;
  const hasError = validation.hasErrors;
  const hasWarning = !validation.isValid && !hasError;

  const allFields = [...stepConfig.requiredFields, ...stepConfig.optionalFields];
  const completedFields = allFields.filter((field) => isFieldSet(formData[field]));

  return (
    <Card className={cn(
      'border-2 shadow-lg transition-all duration-300',
      isCompleted && 'border-emerald-500/30',
      hasError && 'border-destructive/30',
      hasWarning && 'border-amber-500/30',
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Badge
              className={cn(
                'text-sm font-bold px-3 py-1.5 shadow-sm',
                isCompleted && 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white',
                hasError && 'bg-gradient-to-r from-destructive to-red-600 text-white',
                hasWarning && 'bg-gradient-to-r from-amber-500 to-amber-600 text-white',
                !isCompleted && !hasError && !hasWarning && 'bg-gradient-to-r from-primary to-primary/80',
              )}
            >
              Step {stepNumber}
            </Badge>
            <div className="flex-1">
              <h3 className="font-bold text-base tracking-tight">{stepConfig.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">{stepConfig.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className={cn(
              'text-3xl font-extrabold tabular-nums',
              validation.completionPercentage === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary',
            )}>
              {validation.completionPercentage}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0"
            >
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div className="space-y-3 mt-4">
          <Progress value={validation.completionPercentage} className="h-2 shadow-inner" />
          <div className="flex justify-between text-sm font-medium">
            <div className="flex items-center gap-2">
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
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 pt-0">
          {missingFields.length > 0 && (
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-950/10 border-2 border-amber-300 dark:border-amber-700 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
                  Missing Required Fields ({missingFields.length})
                </p>
              </div>
              <ul className="text-sm space-y-2 text-amber-900 dark:text-amber-200 ml-7 font-medium">
                {missingFields.map(({ field, label }) => (
                  <li key={field} className="flex items-center gap-2">
                    <span className="text-amber-600 dark:text-amber-400">•</span>
                    <span className="font-semibold">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validation.hasErrors && (
            <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-950/10 border-2 border-red-300 dark:border-red-700 rounded-lg p-4 shadow-sm">
              <p className="text-sm font-bold text-red-900 dark:text-red-100 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {validation.errors.length} Error{validation.errors.length > 1 ? 's' : ''} Found
              </p>
              <ul className="text-sm space-y-2 text-red-900 dark:text-red-200 ml-7 font-medium">
                {validation.errors.map((error, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-red-600 dark:text-red-400">•</span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground">All Fields</h4>
              <Badge variant="secondary" className="text-xs">
                {completedFields.length}/{allFields.length} completed
              </Badge>
            </div>

            <div className="space-y-2">
              {stepConfig.requiredFields.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Required Fields
                  </p>
                  {stepConfig.requiredFields.map((field) => {
                    const value = formData[field];
                    const fieldIsSet = isFieldSet(value);
                    const displayValue = formatFieldValue(value);

                    return (
                      <div
                        key={field}
                        className={cn(
                          'flex items-start justify-between p-3 rounded-lg border transition-colors',
                          fieldIsSet
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                            : 'bg-muted/30 border-muted',
                        )}
                      >
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          {fieldIsSet ? (
                            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">
                              {getFieldLabel(field)}
                            </p>
                            {fieldIsSet && (
                              <p className="text-xs text-muted-foreground font-mono mt-1 break-words">
                                {displayValue}
                              </p>
                            )}
                          </div>
                        </div>
                        {!fieldIsSet && (
                          <Badge variant="outline" className="text-xs shrink-0">
                            Not set
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {stepConfig.optionalFields.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Optional Fields
                  </p>
                  {stepConfig.optionalFields.map((field) => {
                    const value = formData[field];
                    const fieldIsSet = isFieldSet(value);
                    const displayValue = formatFieldValue(value);

                    return (
                      <div
                        key={field}
                        className={cn(
                          'flex items-start justify-between p-3 rounded-lg border transition-colors',
                          fieldIsSet
                            ? 'bg-muted/50 border-muted'
                            : 'bg-muted/20 border-muted/50',
                        )}
                      >
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          {fieldIsSet ? (
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          ) : (
                            <div className="h-4 w-4 mt-0.5 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground/80">
                              {getFieldLabel(field)}
                            </p>
                            {fieldIsSet && (
                              <p className="text-xs text-muted-foreground font-mono mt-1 break-words">
                                {displayValue}
                              </p>
                            )}
                          </div>
                        </div>
                        {!fieldIsSet && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            Empty
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
