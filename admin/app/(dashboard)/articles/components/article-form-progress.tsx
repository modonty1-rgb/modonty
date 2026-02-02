'use client';

import { useArticleForm } from './article-form-context';
import { Progress } from '@/components/ui/progress';
import { useMemo } from 'react';
import { getSectionStatus } from '../helpers/section-status';

export function ArticleFormProgress() {
  const { formData, errors, sections } = useArticleForm();

  const sectionStatus = useMemo(() => {
    return sections.map((section) => ({
      id: section.id,
      ...getSectionStatus(section.id, formData, errors),
    }));
  }, [formData, errors, sections]);

  const progressPercentage = useMemo(() => {
    const completedCount = sectionStatus.filter((s) => s.completed).length;
    return Math.round((completedCount / sectionStatus.length) * 100);
  }, [sectionStatus]);

  const hasErrors = sectionStatus.some((s) => s.hasErrors);

  return (
    <div className="mb-6 space-y-3" role="region" aria-label="تقدم إكمال النموذج">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">تقدم الإكمال</span>
          <span className="text-sm text-muted-foreground" aria-live="polite">
            {progressPercentage}%
          </span>
        </div>
        {hasErrors && (
          <span className="text-xs text-destructive" role="alert">
            يوجد أخطاء في بعض الأقسام
          </span>
        )}
      </div>
      <Progress
        value={progressPercentage}
        className="h-2"
        aria-label={`${progressPercentage}% من النموذج مكتمل`}
      />
    </div>
  );
}
