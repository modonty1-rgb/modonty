'use client';

import { useState, useEffect } from 'react';
import type { FullPageValidationResult } from '@/lib/seo/types';
import { ValidationResults } from './validation-results';
import { Loader2 } from 'lucide-react';

interface PreviewValidationSectionProps {
  articleId: string;
}

export function PreviewValidationSection({ articleId }: PreviewValidationSectionProps) {
  const [validationResults, setValidationResults] = useState<FullPageValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateArticle = async () => {
      setIsValidating(true);
      setError(null);

      try {
        const response = await fetch(`/api/articles/${articleId}/validate`, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error(`Validation failed: ${response.statusText}`);
        }

        const result: FullPageValidationResult = await response.json();
        setValidationResults(result);
      } catch (err) {
        console.error("Error validating article:", err);
        setError(err instanceof Error ? err.message : "Failed to validate article");
      } finally {
        setIsValidating(false);
      }
    };

    validateArticle();
  }, [articleId]);

  if (isValidating) {
    return (
      <div className="flex items-center justify-center p-8 border-t">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Validating article...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-t mt-12 pt-8">
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4">
          <p className="text-sm font-medium text-red-900 dark:text-red-100">
            Validation Error
          </p>
          <p className="text-xs text-red-700 dark:text-red-300 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!validationResults) {
    return null;
  }

  return (
    <div className="border-t mt-12 pt-8">
      <ValidationResults validationResults={validationResults} />
    </div>
  );
}
