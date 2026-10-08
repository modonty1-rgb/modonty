import type {
  AudioData,
  AuthorData,
  FaqData,
  NewsPage,
  PartnerArticlesPage,
  PartnerFaqsData,
  PartnerFollowersData,
  PartnerGalleryData,
  PartnerReelsData,
  PartnerReviewsPage,
  PublicUserData,
  ReelCommentsData,
  SectorData,
  SectorsData,
  StaticPageData,
  StaticPageKey,
  TagData,
  TagsPage,
  TrendingData,
} from './api-types-content';
import { request } from './http';

const enc = encodeURIComponent;

/** قراءات المحتوى V2/V3 — `modonty/app/api/mobile/v1/{tags,authors,audio,trending,news,pages,faq,sectors,users,partners/:ref/*,reels/:ref/comments}`. */
export const moreContentApi = {
  tags: (q: { page: number; search?: string; sort?: 'name' | 'articles' | 'trending' }, signal?: AbortSignal) =>
    request<TagsPage>('/tags', { query: q, signal }),
  tag: (slug: string, signal?: AbortSignal) => request<TagData>(`/tags/${enc(slug)}`, { signal }),
  partnerArticles: (slug: string, page: number, signal?: AbortSignal) =>
    request<PartnerArticlesPage>(`/partners/${enc(slug)}/articles`, { query: { page }, signal }),
  partnerReviews: (slug: string, page: number, signal?: AbortSignal) =>
    request<PartnerReviewsPage>(`/partners/${enc(slug)}/reviews`, { query: { page }, signal }),
  partnerFollowers: (slug: string, signal?: AbortSignal) =>
    request<PartnerFollowersData>(`/partners/${enc(slug)}/followers`, { query: { limit: 60 }, signal }),
  partnerGallery: (slug: string, signal?: AbortSignal) => request<PartnerGalleryData>(`/partners/${enc(slug)}/gallery`, { signal }),
  partnerFaqs: (slug: string, signal?: AbortSignal) => request<PartnerFaqsData>(`/partners/${enc(slug)}/faqs`, { signal }),
  partnerReels: (slug: string, signal?: AbortSignal) => request<PartnerReelsData>(`/partners/${enc(slug)}/reels`, { signal }),
  reelComments: (reelId: string, signal?: AbortSignal) =>
    request<ReelCommentsData>(`/reels/${reelId}/comments`, { auth: 'optional', signal }),
  author: (slug: string, page: number, signal?: AbortSignal) => request<AuthorData>(`/authors/${enc(slug)}`, { query: { page }, signal }),
  audio: (signal?: AbortSignal) => request<AudioData>('/audio', { signal }),
  trending: (days: 7 | 14 | 30, signal?: AbortSignal) => request<TrendingData>('/trending', { query: { days }, signal }),
  news: (page: number, signal?: AbortSignal) => request<NewsPage>('/news', { query: { page }, signal }),
  page: (key: StaticPageKey, signal?: AbortSignal) => request<StaticPageData>(`/pages/${key}`, { signal }),
  faq: (signal?: AbortSignal) => request<FaqData>('/faq', { signal }),
  sectors: (signal?: AbortSignal) => request<SectorsData>('/sectors', { signal }),
  sector: (key: string, signal?: AbortSignal) => request<SectorData>(`/sectors/${enc(key)}`, { signal }),
  user: (id: string, signal?: AbortSignal) => request<PublicUserData>(`/users/${id}`, { signal }),
};
