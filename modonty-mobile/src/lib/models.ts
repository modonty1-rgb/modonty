import type { ArchiveArticle, ClientListItem, FeedPost } from '@/services/api-types';
import { ago, cardDate, compactNumber, readMinutesShort, readingTime } from './format';

/** نموذج بطاقة المقال — يُحسب مرّة عند وصول البيانات لا داخل البطاقة (ENGINEERING §١ب٥). */
export type ArticleCardModel = {
  key: string;
  slug: string;
  title: string;
  excerpt: string | null;
  image: string | null;
  imageBlur: string | null;
  publisher: string;
  publisherLogo: string | null;
  verified: boolean;
  meta: string;
  stats: string | null;
  hasAudio: boolean;
};

export function toArticleCard(p: FeedPost | ArchiveArticle): ArticleCardModel {
  const meta = [cardDate(p.publishedAt), readingTime(p.readingTimeMinutes)].filter(Boolean).join('، ');
  const stats = [
    p.views > 0 ? `${compactNumber(p.views)} مشاهدة` : null,
    p.likes > 0 ? `${compactNumber(p.likes)} إعجاب` : null,
    p.comments > 0 ? `${compactNumber(p.comments)} تعليق` : null,
  ]
    .filter(Boolean)
    .join('، ');
  return {
    key: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt?.trim() || null,
    image: p.image || null,
    imageBlur: p.imageBlur || null,
    publisher: p.clientName,
    publisherLogo: p.clientLogo || null,
    verified: 'verified' in p ? p.verified : false,
    meta,
    stats: stats || null,
    hasAudio: !!p.hasAudio,
  };
}

export type PartnerCardModel = {
  key: string;
  slug: string;
  name: string;
  logo: string | null;
  line: string | null;
  meta: string;
  verified: boolean;
  rating: string | null;
};

export function toPartnerCard(c: ClientListItem): PartnerCardModel {
  const meta = [c.industry?.name, c.city, c.articleCount > 0 ? `${compactNumber(c.articleCount)} مقال` : null]
    .filter(Boolean)
    .join('، ');
  return {
    key: c.id,
    slug: c.slug,
    name: c.name,
    logo: c.logo,
    line: c.credential || c.description,
    meta,
    verified: c.isVerified,
    rating: c.rating && c.rating.count > 0 ? `${c.rating.average.toFixed(1)} (${compactNumber(c.rating.count)})` : null,
  };
}

/** بطاقة صفّ من مصادر لا تحمل FeedPost كاملاً (الكاتب · الصوت · الرائج · القطاع · الشريك · المفضّلة). */
export function articleRow(a: {
  id?: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  image?: string | null;
  imageBlur?: string | null;
  publisher?: string | null;
  date?: string | null;
  /** تاريخ جاهز للعرض كما يرسله الخادم (مثل `posts[].date` في صفحة الشريك). */
  dateLabel?: string | null;
  readingTimeMinutes?: number | null;
  hasAudio?: boolean;
}): ArticleCardModel {
  return {
    key: a.id ?? a.slug,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt?.trim() || null,
    image: a.image || null,
    imageBlur: a.imageBlur || null,
    publisher: a.publisher ?? '',
    publisherLogo: null,
    verified: false,
    meta: [a.dateLabel ?? cardDate(a.date), readingTime(a.readingTimeMinutes)].filter(Boolean).join('، '),
    stats: null,
    hasAudio: !!a.hasAudio,
  };
}

/** وقت القراءة بفئات الموقع (ReadingTimeBucket): ≤٣ على الماشي · ٤–٧ فنجان قهوة · ≥٨ جلسة روقان. */
export type ReadBucket = 'short' | 'medium' | 'long';
export function readBucket(minutes: number | null | undefined): ReadBucket | null {
  if (!minutes || minutes <= 0) return null;
  return minutes <= 3 ? 'short' : minutes <= 7 ? 'medium' : 'long';
}

/** صفّ المقال في نظام التصميم ١٫٠ (Screens A · 01): الناشر · العنوان · نقطة الفئة + «٩ د قراءة · قبل ٨ أيام» · صورة ٨٨. */
export type ArticleRowModel = {
  key: string;
  slug: string;
  title: string;
  image: string | null;
  imageBlur: string | null;
  publisher: string;
  publisherLogo: string | null;
  meta: string;
  bucket: ReadBucket | null;
};

export function toArticleRow(p: FeedPost | ArchiveArticle): ArticleRowModel {
  return {
    key: p.id,
    slug: p.slug,
    title: p.title,
    image: p.image || null,
    imageBlur: p.imageBlur || null,
    publisher: p.clientName,
    publisherLogo: p.clientLogo || null,
    meta: [readMinutesShort(p.readingTimeMinutes), ago(p.publishedAt)].filter(Boolean).join(' · '),
    bucket: readBucket(p.readingTimeMinutes),
  };
}
