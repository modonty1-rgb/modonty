'use client';

import { useArticleForm } from './article-form-context';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function ArticleFormNavigation() {
  const { overallProgress, seoScore, goToStep } = useArticleForm();

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b shadow-sm">
      <div className="max-w-[1200px] mx-auto px-4 py-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => goToStep(3)}
              className="inline-flex"
              aria-label="Jump to SEO tab"
            >
              <Badge
                variant={seoScore >= 80 ? 'default' : seoScore >= 60 ? 'secondary' : 'destructive'}
                className={cn(
                  'text-[10px] px-2 py-0 h-5 font-bold uppercase tracking-wider transition-colors cursor-pointer',
                  seoScore >= 80 && 'bg-emerald-500 hover:bg-emerald-600',
                  seoScore >= 60 && seoScore < 80 && 'bg-amber-500 hover:bg-amber-600 text-white',
                )}
              >
                SEO Health: {seoScore}%
              </Badge>
            </button>

            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {overallProgress}% Complete
            </span>
          </div>

          <div className="w-full">
            <Progress
              value={overallProgress}
              className="h-1 transition-all duration-300"
              aria-label={`Overall progress: ${overallProgress}%`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
