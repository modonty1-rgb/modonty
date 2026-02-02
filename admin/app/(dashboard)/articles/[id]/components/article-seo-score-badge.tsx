'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { analyzeArticleSEO } from '../../analyzer';
import { Article } from '../helpers/article-view-types';

interface ArticleSEOScoreBadgeProps {
  article: Article;
}

export function ArticleSEOScoreBadge({ article }: ArticleSEOScoreBadgeProps) {
  const scoreResult = useMemo(() => analyzeArticleSEO(article), [article]);
  const score = scoreResult.percentage;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500 hover:bg-green-600';
    if (score >= 60) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-red-500 hover:bg-red-600';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return 'text-green-50';
    if (score >= 60) return 'text-yellow-50';
    return 'text-red-50';
  };

  const handleClick = () => {
    const element = document.querySelector('[data-section="section-seo-guidance"]');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Badge
      className={cn(
        'px-4 py-2 text-base font-semibold cursor-pointer transition-colors',
        getScoreColor(score),
        getScoreTextColor(score)
      )}
      onClick={handleClick}
      title="Click to view full SEO guidance"
    >
      {score}%
    </Badge>
  );
}
