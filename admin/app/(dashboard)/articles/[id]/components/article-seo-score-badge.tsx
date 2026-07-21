'use client';

import { useMemo } from 'react';
import { getArticleSeoScore } from '@/lib/seo/article-seo-score';
import { SeoScoreBadge } from '@/components/shared/seo-score-badge';
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

  // Same pattern as the client badge: the SEO score opens the article's full technical
  // guide (/technical) — where the fault is and how to fix it.
  return <SeoScoreBadge score={score} size="lg" href={`/articles/${article.id}/technical`} />;
}
