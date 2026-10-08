import type { ArticleResponse } from '@/services/api-types-content';
import { cardDate, compactNumber, readingTime } from './format';
import type { ArticleCardModel } from './models';

/** `ArticleResponse` (الرائج · الأخبار) → نموذج البطاقة. */
export function fromArticleResponse(a: ArticleResponse): ArticleCardModel {
  const i = a.interactions;
  return {
    key: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt?.trim() || null,
    image: a.image ?? a.featuredImage?.url ?? null,
    imageBlur: a.featuredImage?.blurDataURL ?? null,
    publisher: a.client.name,
    publisherLogo: a.client.logo ?? null,
    verified: false,
    meta: [cardDate(a.publishedAt), readingTime(a.readingTimeMinutes)].filter(Boolean).join('، '),
    stats: [i.views > 0 ? `${compactNumber(i.views)} مشاهدة` : null, i.likes > 0 ? `${compactNumber(i.likes)} إعجاب` : null].filter(Boolean).join('، ') || null,
    hasAudio: !!a.hasAudio,
  };
}
