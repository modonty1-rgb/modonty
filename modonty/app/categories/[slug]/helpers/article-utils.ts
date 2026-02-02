/**
 * Article utility functions for category detail page
 * Pure functions that can run on server or client
 */

export function formatReadingTime(minutes?: number): string {
  if (!minutes) return '';
  
  if (minutes < 1) {
    return 'أقل من دقيقة';
  }
  if (minutes === 1) {
    return 'دقيقة واحدة';
  }
  if (minutes === 2) {
    return 'دقيقتان';
  }
  if (minutes >= 3 && minutes <= 10) {
    return `${minutes} دقائق`;
  }
  return `${minutes} دقيقة`;
}

export function formatPublishDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes === 0) return 'الآن';
      if (diffMinutes === 1) return 'منذ دقيقة';
      if (diffMinutes === 2) return 'منذ دقيقتين';
      if (diffMinutes >= 3 && diffMinutes <= 10) return `منذ ${diffMinutes} دقائق`;
      return `منذ ${diffMinutes} دقيقة`;
    }
    if (diffHours === 1) return 'منذ ساعة';
    if (diffHours === 2) return 'منذ ساعتين';
    if (diffHours >= 3 && diffHours <= 10) return `منذ ${diffHours} ساعات`;
    return `منذ ${diffHours} ساعة`;
  }

  if (diffDays === 1) return 'أمس';
  if (diffDays === 2) return 'منذ يومين';
  if (diffDays >= 3 && diffDays <= 10) return `منذ ${diffDays} أيام`;
  if (diffDays < 30) return `منذ ${diffDays} يومًا`;
  
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatEngagementCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}م`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}ألف`;
  }
  return count.toString();
}

export function parseArticleSearchParams(params: Record<string, string | string[] | undefined>) {
  const search = typeof params.search === 'string' ? params.search : undefined;
  const sort = typeof params.sort === 'string' && 
    ['latest', 'oldest', 'popular', 'trending'].includes(params.sort) 
    ? params.sort as 'latest' | 'oldest' | 'popular' | 'trending'
    : undefined;
  const view = typeof params.view === 'string' && ['grid', 'list', 'compact'].includes(params.view)
    ? params.view as 'grid' | 'list' | 'compact'
    : 'grid';
  const client = typeof params.client === 'string' ? params.client : undefined;

  return { search, sort, view, client };
}

export function getTrendingScore(article: {
  interactions: { likes: number; comments: number; favorites: number };
  publishedAt: string;
}): number {
  const daysSincePublish = Math.floor(
    (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const engagementScore = 
    article.interactions.likes * 1 +
    article.interactions.comments * 2 +
    article.interactions.favorites * 3;
  
  const timeDecay = Math.max(0.1, 1 - (daysSincePublish / 30));
  
  return engagementScore * timeDecay;
}
