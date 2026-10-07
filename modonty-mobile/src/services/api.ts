import type {
  ArchiveData,
  ArchiveReadingTime,
  ArchiveSort,
  ArticleCountsData,
  ArticleDetailData,
  ArticlesFeedView,
  ArticlesPage,
  AuthData,
  BookingData,
  BookingSource,
  CategoriesPage,
  CategoryData,
  CategorySort,
  CommentCreateData,
  CommentsData,
  FavoriteResult,
  FollowData,
  ForgotPasswordData,
  HomeData,
  IndustriesPage,
  IndustryData,
  IndustrySort,
  LikeResult,
  LogoutData,
  MeData,
  MeFavoritesData,
  MeFollowingData,
  NotificationReadAllData,
  NotificationReadData,
  NotificationsData,
  NotificationTab,
  PartnerData,
  PartnersPage,
  PartnerViewData,
  ReelData,
  ReelFiltersData,
  ReelsPage,
  ReelToggleData,
  ReelViewData,
  SearchArticleSort,
  SearchData,
  SearchPartnerSort,
  SearchType,
  ShareData,
  SharePlatform,
  ViewData,
} from './api-types';
import { request } from './http';

const enc = encodeURIComponent;

/** C1 · C2 · C3 — المحتوى العامّ. */
export const contentApi = {
  home: (signal?: AbortSignal) => request<HomeData>('/home', { signal }),
  articles: (q: { page: number; category?: string; client?: string; view?: ArticlesFeedView }, signal?: AbortSignal) =>
    request<ArticlesPage>('/articles', { query: q, signal }),
  archive: (
    q: {
      page: number;
      sort?: ArchiveSort;
      time?: ArchiveReadingTime;
      industry?: string;
      category?: string;
      tag?: string;
      search?: string;
      modonty?: boolean;
      withFilters?: boolean;
    },
    signal?: AbortSignal,
  ) => request<ArchiveData>('/articles/archive', { query: q, signal }),
  article: (slug: string, signal?: AbortSignal) => request<ArticleDetailData>(`/articles/${enc(slug)}`, { signal }),
  articleCounts: (slug: string, signal?: AbortSignal) =>
    request<ArticleCountsData>(`/articles/${enc(slug)}/counts`, { auth: 'optional', signal }),
  comments: (articleId: string, signal?: AbortSignal) => request<CommentsData>(`/articles/${articleId}/comments`, { signal }),
  categories: (q: { page: number; search?: string; sort?: CategorySort }, signal?: AbortSignal) =>
    request<CategoriesPage>('/categories', { query: q, signal }),
  category: (slug: string, signal?: AbortSignal) => request<CategoryData>(`/categories/${enc(slug)}`, { signal }),
  industries: (q: { page: number; search?: string; sort?: IndustrySort }, signal?: AbortSignal) =>
    request<IndustriesPage>('/industries', { query: q, signal }),
  industry: (slug: string, page: number, signal?: AbortSignal) =>
    request<IndustryData>(`/industries/${enc(slug)}`, { query: { page }, signal }),
  partners: (q: { page: number; q?: string; industry?: string; featured?: boolean }, signal?: AbortSignal) =>
    request<PartnersPage>('/partners', { query: q, signal }),
  partner: (slug: string, signal?: AbortSignal) => request<PartnerData>(`/partners/${enc(slug)}`, { signal }),
  reels: (q: { cursor?: string | null; client?: string | null }, signal?: AbortSignal) =>
    request<ReelsPage>('/reels', { query: q, auth: 'optional', signal }),
  reelFilters: (signal?: AbortSignal) => request<ReelFiltersData>('/reels/filters', { signal }),
  reel: (slug: string, signal?: AbortSignal) => request<ReelData>(`/reels/${enc(slug)}`, { signal }),
  search: (
    q: { q: string; type?: SearchType; page: number; sortArticles?: SearchArticleSort; sortPartners?: SearchPartnerSort },
    signal?: AbortSignal,
  ) => request<SearchData>('/search', { query: q, signal }),
};

/** E1 · E3 · E4 · E6 · E8 · E9 · E11 · E14 · E16 · E17 · T1 — التفاعل. */
export const actionsApi = {
  likeArticle: (articleId: string, slug: string) =>
    request<LikeResult>(`/articles/${articleId}/like`, { method: 'POST', auth: 'required', body: { slug } }),
  favoriteArticle: (articleId: string, slug: string) =>
    request<FavoriteResult>(`/articles/${articleId}/favorite`, { method: 'POST', auth: 'required', body: { slug } }),
  comment: (articleId: string, slug: string, content: string) =>
    request<CommentCreateData>(`/articles/${articleId}/comments`, {
      method: 'POST',
      auth: 'required',
      body: { slug, content },
    }),
  shareArticle: (slug: string, platform: SharePlatform) =>
    request<ShareData>(`/articles/${enc(slug)}/share`, { method: 'POST', auth: 'optional', device: true, body: { platform } }),
  viewArticle: (slug: string) =>
    request<ViewData>(`/articles/${enc(slug)}/view`, { method: 'POST', auth: 'optional', device: true, body: {} }),
  followState: (slug: string) => request<FollowData>(`/partners/${enc(slug)}/follow`, { auth: 'required' }),
  follow: (slug: string) => request<FollowData>(`/partners/${enc(slug)}/follow`, { method: 'POST', auth: 'required' }),
  unfollow: (slug: string) => request<FollowData>(`/partners/${enc(slug)}/follow`, { method: 'DELETE', auth: 'required' }),
  viewPartner: (slug: string) =>
    request<PartnerViewData>(`/partners/${enc(slug)}/view`, { method: 'POST', auth: 'optional', device: true, body: {} }),
  book: (
    partnerId: string,
    body: {
      name?: string;
      email?: string;
      phone: string;
      preferredAt?: string | null;
      message?: string;
      source: BookingSource;
      articleId?: string | null;
      disclaimerAccepted: boolean;
      newsletterOptIn?: boolean;
    },
  ) => request<BookingData>(`/partners/${partnerId}/booking`, { method: 'POST', body }),
  likeReel: (reelId: string) => request<ReelToggleData>(`/reels/${reelId}/like`, { method: 'POST', auth: 'required' }),
  favoriteReel: (reelId: string) => request<ReelToggleData>(`/reels/${reelId}/favorite`, { method: 'POST', auth: 'required' }),
  viewReel: (reelId: string) => request<ReelViewData>(`/reels/${reelId}/view`, { method: 'POST', device: true }),
  pageview: (path: string) =>
    request<unknown>('/track/pageview', { method: 'POST', auth: 'optional', device: true, body: { path } }),
};

/** A1 · A2 · A5 · A6 · A7 · A8 · A13 · N1 · N2 — الحساب. */
export const accountApi = {
  login: async (email: string, password: string) =>
    request<AuthData>('/auth/login', { method: 'POST', device: true, body: { email, password } }),
  register: (body: { name: string; email: string; password: string; confirmPassword?: string; marketingConsent?: boolean }) =>
    request<AuthData>('/auth/register', { method: 'POST', device: true, body }),
  forgotPassword: (email: string) =>
    request<ForgotPasswordData>('/auth/forgot-password', { method: 'POST', body: { email } }),
  logout: (refreshToken: string, deviceId: string) =>
    request<LogoutData>('/auth/logout', { method: 'POST', auth: 'optional', body: { refreshToken, deviceId } }),
  me: (signal?: AbortSignal) => request<MeData>('/me', { auth: 'required', signal }),
  favorites: (signal?: AbortSignal) => request<MeFavoritesData>('/me/favorites', { auth: 'required', query: { limit: 50 }, signal }),
  following: (signal?: AbortSignal) => request<MeFollowingData>('/me/following', { auth: 'required', query: { limit: 50 }, signal }),
  notifications: (q: { tab: NotificationTab; cursor?: string | null }, signal?: AbortSignal) =>
    request<NotificationsData>('/me/notifications', { auth: 'required', query: { ...q, limit: 20 }, signal }),
  readNotification: (id: string) =>
    request<NotificationReadData>(`/me/notifications/${id}/read`, { method: 'POST', auth: 'required' }),
  readAllNotifications: () =>
    request<NotificationReadAllData>('/me/notifications/read-all', { method: 'POST', auth: 'required' }),
};
