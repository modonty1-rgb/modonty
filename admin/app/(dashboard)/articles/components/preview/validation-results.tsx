'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FullPageValidationResult } from '@/lib/seo/types';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidationResultsProps {
  validationResults: FullPageValidationResult;
}

export function ValidationResults({ validationResults }: ValidationResultsProps) {
  const { issues, overallScore, canPublish, structuredData, seo } = validationResults;

  const criticalCount = issues.critical.length;
  const warningsCount = issues.warnings.length;
  const suggestionsCount = issues.suggestions.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Validation Results</CardTitle>
            <CardDescription>Complete page validation analysis</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'text-3xl font-bold',
                canPublish ? 'text-green-600' : 'text-red-600'
              )}
            >
              {overallScore}
            </div>
            <div className="text-sm text-muted-foreground">/ 100</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className={cn(
            'flex items-center gap-2 p-4 rounded-lg',
            canPublish
              ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
          )}
        >
          {canPublish ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <div>
            <p className={cn('font-semibold', canPublish ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100')}>
              {canPublish ? 'Ready to Publish' : 'Cannot Publish - Fix Critical Issues'}
            </p>
            <p className={cn('text-sm', canPublish ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300')}>
              {canPublish
                ? 'All critical validation checks passed'
                : `${criticalCount} critical issue${criticalCount !== 1 ? 's' : ''} must be fixed`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
            <div className="text-sm text-red-700 dark:text-red-300">Critical</div>
          </div>
          <div className="text-center p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
            <div className="text-2xl font-bold text-yellow-600">{warningsCount}</div>
            <div className="text-sm text-yellow-700 dark:text-yellow-300">Warnings</div>
          </div>
          <div className="text-center p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
            <div className="text-2xl font-bold text-blue-600">{suggestionsCount}</div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Suggestions</div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Schema Validation</h3>
          <div className="flex items-center gap-4">
            <Badge variant={structuredData.schemaErrors === 0 ? 'default' : 'destructive'}>
              {structuredData.schemaErrors === 0 ? 'Valid' : `${structuredData.schemaErrors} Errors`}
            </Badge>
            {structuredData.schemaWarnings > 0 && (
              <Badge variant="outline">
                {structuredData.schemaWarnings} Warnings
              </Badge>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">SEO Analysis</h3>
          <div className="flex items-center gap-4">
            <Badge variant={seo.score >= 80 ? 'default' : seo.score >= 60 ? 'outline' : 'destructive'}>
              Score: {seo.score}%
            </Badge>
          </div>
        </div>

        {issues.critical.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              Critical Issues ({issues.critical.length})
            </h3>
            <div className="space-y-2">
              {issues.critical.map((issue, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950"
                >
                  <div className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900 dark:text-red-100">
                        {issue.message}
                      </p>
                      {issue.fix && (
                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                          Fix: {issue.fix}
                        </p>
                      )}
                      {issue.property && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {issue.category}: {issue.property}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {issues.warnings.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Warnings ({issues.warnings.length})
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {issues.warnings.map((issue, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                        {issue.message}
                      </p>
                      {issue.fix && (
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                          Suggestion: {issue.fix}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {issues.suggestions.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600" />
              Suggestions ({issues.suggestions.length})
            </h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {issues.suggestions.map((issue, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950"
                >
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        {issue.message}
                      </p>
                      {issue.fix && (
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          {issue.fix}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}