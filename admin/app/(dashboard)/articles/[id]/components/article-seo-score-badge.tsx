'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getArticleSeoScore } from '@/lib/seo/article-seo-score';
import { Article } from '../helpers/article-view-types';

// The SEO number comes from dataLayer — the single source of truth for every surface
// (Khalid 2026-07-13: «أحتاج نتيجة 100% من source of truth واحد»). It scores the STORED,
// published fields, so this badge, the articles table and the segment tables all show
// the same figure for the same article. The old form-based analyzer is not an SEO score
// and is no longer used to render one.
interface ArticleSEOScoreBadgeProps {
  article: Article;
}

export function ArticleSEOScoreBadge({ article }: ArticleSEOScoreBadgeProps) {
  const score = useMemo(() => getArticleSeoScore(article), [article]);

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
