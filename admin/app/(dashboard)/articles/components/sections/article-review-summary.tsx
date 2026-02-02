'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, AlertTriangle, TrendingUp, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArticleForm } from '../article-form-context';
import { STEP_CONFIGS, getMissingRequiredFields } from '../../helpers/step-validation-helpers';

export function ArticleReviewSummary() {
  const { formData, getStepValidation, overallProgress } = useArticleForm();

  const reviewSteps = STEP_CONFIGS.slice(0, 6); // Steps 1-6 (excluding step 7)

  const stepValidations = reviewSteps.map((step) => ({
    step,
    validation: getStepValidation(step.number),
    missingFields: getMissingRequiredFields(step.number, formData),
  }));

  const stepsWithErrors = stepValidations.filter((s) => s.validation.hasErrors).length;
  const stepsWithWarnings = stepValidations.filter(
    (s) => !s.validation.isValid && !s.validation.hasErrors
  ).length;
  const fullyCompletedSteps = stepValidations.filter(
    (s) => s.validation.isValid && s.validation.completionPercentage === 100
  ).length;

  const allRequiredFieldsComplete = stepValidations.every((s) => s.validation.isValid);

  return (
    <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold flex items-center gap-3">
          <Award className="h-7 w-7 text-primary" />
          Article Review & Validation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'h-20 w-20 rounded-full flex items-center justify-center text-3xl font-extrabold shadow-lg',
                overallProgress === 100
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                  : 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
              )}
            >
              {overallProgress}%
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
              <p className="text-2xl font-bold text-foreground">
                {fullyCompletedSteps}/{reviewSteps.length} Steps
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-center">
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {fullyCompletedSteps}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Completed</p>
            </div>

            {stepsWithWarnings > 0 && (
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {stepsWithWarnings}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Warnings</p>
              </div>
            )}

            {stepsWithErrors > 0 && (
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <span className="text-2xl font-bold text-destructive">{stepsWithErrors}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Errors</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">Total Progress</span>
            <span className="font-bold text-foreground">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-3 shadow-inner" />
        </div>

        {allRequiredFieldsComplete ? (
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-950/10 border-2 border-emerald-300 dark:border-emerald-700 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-base font-bold text-emerald-900 dark:text-emerald-100">
                  All Required Fields Complete!
                </p>
                <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-0.5">
                  Your article is ready for publishing. Review the details below and submit when ready.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-950/10 border-2 border-amber-300 dark:border-amber-700 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-base font-bold text-amber-900 dark:text-amber-100">
                  Almost There!
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-0.5">
                  Complete the missing required fields below to publish your article.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
