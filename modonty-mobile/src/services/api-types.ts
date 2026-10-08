/**
 * Wire types for the Modonty reader API — `modonty/app/api/mobile/v1/**`.
 *
 * Every type here is the JSON-over-the-wire shape of a route's `data` payload, derived by reading
 * the server functions each route calls (paths below are relative to the monorepo root).
 * Conventions:
 *  - `Date` on the server → ISO `string` here (NextResponse.json → JSON.stringify).
 *  - Prisma enums → string-literal unions (values from `shared/prisma/schema/schema.prisma`).
 *  - A server field typed `T | undefined` / `field?:` is dropped by JSON.stringify when undefined,
 *    so it stays optional here. `null` is preserved as `null`.
 *
 * Envelope (modonty/lib/mobile-api/http.ts:34-47):
 *  - success → `{ data: <payload> }`
 *  - failure → `{ error: { code, message, details? } }`
 *
 * Standalone on purpose: no imports.
 */

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Envelope & shared helpers
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** modonty/lib/mobile-api/http.ts:7-14 (HTTP status map at :16-24). */
export type ApiErrorCode =
  | "UNAUTHORIZED" // 401
  | "FORBIDDEN" // 403
  | "NOT_FOUND" // 404
  | "VALIDATION_ERROR" // 422
  | "CONFLICT" // 409
  | "RATE_LIMITED" // 429
  | "INTERNAL_ERROR"; // 500

/**
 * modonty/lib/mobile-api/http.ts:40-47. `details` is present only when the route passed one.
 * Known `details` shapes: see `ApiErrorDetails*` below.
 */
export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
}

/** modonty/lib/mobile-api/http.ts:34-38. */
export interface ApiSuccessBody<T> {
  data: T;
}

export type ApiResponseBody<T> = ApiSuccessBody<T> | ApiErrorBody;

/** auth/login/route.ts:35 — RATE_LIMITED (also sends `Retry-After` header). */
export interface ApiErrorDetailsRateLimited {
  retryAfterSeconds: number;
}

/**
 * auth/register/route.ts:28 — VALIDATION_ERROR. `fieldErrors` is zod's
 * `error.flatten().fieldErrors` (app/(site)/users/register/actions/register-actions.ts:27).
 */
export interface ApiErrorDetailsRegisterFields {
  fieldErrors: Record<string, string[] | undefined>;
}

/**
 * articles/[ref]/comments/route.ts:52-56 — VALIDATION_ERROR. `reason` is the English text from
 * `validateCommentContent` (modonty/lib/comments/validate-comment.ts:27-32); may be absent.
 */
export interface ApiErrorDetailsComment {
  reason?: string;
}

/** Offset page used by most list routes (`{ items, page, hasMore }`). */
export interface Paged<T> {
  items: T[];
  page: number;
  hasMore: boolean;
}

/** Offset page that also carries the total of the filtered list. */
export interface PagedWithTotal<T> extends Paged<T> {
  total: number;
}

/** ISO-8601 timestamp string (a server `Date` after JSON serialization). */
export type IsoDateString = string;

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Prisma enums (shared/prisma/schema/schema.prisma)
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** shared/prisma/schema/schema.prisma:167-176 — body of POST articles/:slug/share. */
export type SharePlatform =
  | "FACEBOOK"
  | "TWITTER"
  | "LINKEDIN"
  | "WHATSAPP"
  | "EMAIL"
  | "COPY_LINK"
  | "PRINT"
  | "OTHER";

/** shared/prisma/schema/schema.prisma:117-122. */
export type CommentStatus = "PENDING" | "APPROVED" | "REJECTED" | "DELETED";

/** shared/prisma/schema/schema.prisma:153-157. */
export type ClientCtaMode = "NONE" | "FORM" | "LINK";

/** shared/prisma/schema/schema.prisma:162-165. */
export type ClientListing = "BOOKING" | "SHOP";

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Request enums (query/body zod schemas in the route files)
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** articles/route.ts:11 — `view` query. */
export type ArticlesFeedView = "latest" | "popular" | "audio";

/** articles/archive/route.ts:12 (= ArchiveSort, modonty/lib/articles/archive/get-articles-archive.ts:23). */
export type ArchiveSort = "newest" | "mostRead" | "mostEngaged";

/** articles/archive/route.ts:13 (= ReadingTimeBucket, modonty/lib/articles/archive/reading-time-buckets.ts:3). */
export type ArchiveReadingTime = "short" | "medium" | "long";

/** categories/route.ts:10 (= CategoryQueryOptions.sortBy, modonty/lib/types.ts:155). */
export type CategorySort = "name" | "articles" | "trending" | "recent";

/** industries/route.ts:10 (= IndustryQueryOptions.sortBy, modonty/lib/types.ts:182). */
export type IndustrySort = "clients" | "name";

/** search/route.ts:9 — `type` query (`partners` is mapped to the helper's `clients` scope). */
export type SearchType = "all" | "articles" | "partners";

/** search/route.ts:11 (= ArticleSortOption, app/(site)/search/helpers/get-search-results.ts:7). */
export type SearchArticleSort = "newest" | "oldest" | "title";

/** search/route.ts:12-14 (= ClientSortOption, app/(site)/search/helpers/client-sort.ts:4-10). */
export type SearchPartnerSort = "name-asc" | "name-desc" | "articles-desc" | "articles-asc" | "newest" | "oldest";

/** partners/[ref]/booking/route.ts:15 — default `client_page`. */
export type BookingSource = "article_dock" | "article_card" | "client_page" | "client_list";

/** me/notifications/route.ts:11 (= NotificationTab, modonty/lib/notifications/get-reader-notifications.ts:7). */
export type NotificationTab = "all" | "unread" | "read";

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Shared entity shapes
// ─────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Article card — `FeedPost`, modonty/lib/types.ts:70-112. Which optional fields are filled
 * depends on the producer (absent = key missing from the JSON):
 *
 * | field                 | home (home-feed-shapes.ts:45-68) | /articles (get-more-articles.ts:41-69) | archive (get-articles-archive.ts:74-100) | industry feed (get-industry-feed.ts:74-95) | search (get-search-results.ts:42-70) |
 * |-----------------------|-----|-----|-----|-----|-----|
 * | isCore                | yes | —   | yes | —   | —   |
 * | clientId              | yes | —   | yes | yes | yes |
 * | author                | —   | yes | —   | —   | yes |
 * | dislikes              | —   | yes | —   | —   | yes |
 * | hasAudio              | yes | yes | yes | yes | —   |
 * | excerpt fallback seoDescription | yes | — | yes | — | — |
 *
 * `excerpt`, `image`, `imageBlur`, `clientLogo`, `readingTimeMinutes` are absent when empty.
 */
export interface FeedPost {
  id: string;
  title: string;
  excerpt?: string;
  /** Bunny URL preferred, Cloudinary fallback (shared/lib/media-src.ts:39-42). */
  image?: string;
  /** Stored LQIP data URL for `image`. */
  imageBlur?: string;
  slug: string;
  /** `datePublished || createdAt`. */
  publishedAt: IsoDateString;
  clientName: string;
  clientSlug: string;
  clientId?: string;
  clientLogo?: string;
  readingTimeMinutes?: number;
  hasAudio?: boolean;
  /** Filled by /articles and search only. `title` is always "", `avatar` "" when no image. */
  author?: {
    id: string;
    name: string;
    title: string;
    company: string;
    avatar: string;
  };
  likes: number;
  dislikes?: number;
  comments: number;
  favorites: number;
  views: number;
  /** Always "published" from every producer above. */
  status: "published" | "draft";
  /** Article published by Modonty's own Client row (Settings.coreClientId). */
  isCore?: boolean;
}

/**
 * Archive card — `ArchiveArticle = FeedPost & {...}`,
 * modonty/lib/articles/archive/get-articles-archive.ts:15-20 (mapped at :74-100).
 */
export interface ArchiveArticle extends FeedPost {
  /** Partner's admin-checked badge (`Client.isVerified`). */
  verified: boolean;
  /** First `ClientCredential.name`, trimmed, or null. */
  credential: string | null;
}

/** modonty/lib/queries/reels-feed-shapes.ts:4-30 (mapped at modonty/lib/queries/get-reels-feed-page.ts:97-123). */
export interface ReelFeedItem {
  id: string;
  /** `reelSlug ?? id`. */
  slug: string;
  /** "" when empty. */
  title: string;
  /** "" when empty. */
  description: string;
  /** Image reel: the image. Video reel: its thumbnail (or the media image). */
  imageUrl: string | null;
  width: number | null;
  height: number | null;
  isVideo: boolean;
  /** Video only (null for an image reel). */
  hlsUrl: string | null;
  /** Video only. */
  mp4Url: string | null;
  /** Video only. */
  posterUrl: string | null;
  /** Video only, whole seconds. */
  durationSec: number | null;
  likesCount: number;
  favoritesCount: number;
  /** APPROVED comments only. */
  commentsCount: number;
  clientName: string;
  clientSlug: string;
  clientLogoUrl: string | null;
}

/** modonty/lib/queries/reels-feed-shapes.ts:32-35. Both flags false for a signed-out caller. */
export interface ReelFeedItemWithState extends ReelFeedItem {
  likedByMe: boolean;
  favoritedByMe: boolean;
}

/**
 * Partner card — `ClientListItem`, modonty/lib/queries/get-clients-list.ts:8-46
 * (mapped at :121-152).
 */
export interface ClientListItem {
  id: string;
  name: string;
  slug: string;
  /** `description || seoDescription || null`. */
  description: string | null;
  logo: string | null;
  /** Only for featured partners; null otherwise. */
  heroImage: string | null;
  industry: { name: string; slug: string } | null;
  city: string | null;
  services: string[];
  /** Approved reviews; null when none. */
  rating: { average: number; count: number } | null;
  /** Whole years since `foundingDate`; null when < 1 or unknown. */
  yearsInBusiness: number | null;
  credential: string | null;
  isVerified: boolean;
  articleCount: number;
  /**
   * Note: counted from media rows filtered with `mimeType startsWith "image/"`
   * (get-clients-list.ts:67-71), so video reels are NOT counted here.
   */
  reelCount: number;
  galleryCount: number;
  hasWhatsapp: boolean;
  hasVideo: boolean;
  lastPublishedAt: IsoDateString | null;
  isFeatured: boolean;
  ctaMode: ClientCtaMode;
  ctaLabel: string | null;
  ctaUrl: string | null;
  listedOn: ClientListing[];
  createdAt: IsoDateString;
}

/**
 * The signed-in reader — modonty/lib/mobile-api/reader-profile.ts:10-26.
 * (The function returns `null` when the user row is gone.)
 */
export interface ReaderProfile {
  id: string;
  name: string | null;
  email: string | null;
  /** `image || avatar || null`. */
  image: string | null;
  bio: string | null;
  createdAt: IsoDateString;
  hasPassword: boolean;
  /** E.164 when set. */
  phone: string | null;
}

/** modonty/lib/mobile-api/auth.ts:47-51. `expiresIn` = access-token TTL in seconds (900, auth.ts:21). */
export interface ReaderTokens {
  accessToken: string;
  /** `<sessionId>.<secret>`, 30-day TTL, rotated on every refresh. */
  refreshToken: string;
  expiresIn: number;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// C1 — GET /home
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** modonty/lib/queries/get-industries-with-counts.ts:30-40 (only industries with ≥1 active partner). */
export interface HomeIndustry {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  socialImage: string | null;
  socialImageAlt: string | null;
  clientCount: number;
}

/** `LatestPartner`, modonty/lib/queries/get-latest-partners.ts:7-16 (mapped at :45-53). */
export interface LatestPartner {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  industry: string | null;
  /** Client row `createdAt`. */
  joinedAt: IsoDateString;
  isVerified: boolean;
}

/** home/route.ts:6 → modonty/lib/mobile-api/get-home-screen.ts:29-36. */
export interface HomeData {
  /** First FEED_PAGE_SIZE (10) homepage articles (home-feed-shapes.ts:71-91). */
  articles: FeedPost[];
  /** `articles.length >= 10` — then continue with GET /articles?page=2. */
  hasMore: boolean;
  /** First reels page (6) — `getReelsFeedPage().items`, no per-user flags. */
  reels: ReelFeedItem[];
  industries: HomeIndustry[];
  /** 3 newest active partners. */
  partners: LatestPartner[];
  /** Slug of Modonty's own Client row (for «تابع مدونتي» via /partners/:slug/follow). */
  coreClientSlug: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// C2 — GET /articles?page&category&client&view
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** articles/route.ts:24 — items from get-more-articles.ts:41-69 (author + dislikes present, no clientId/isCore). */
export type ArticlesPage = Paged<FeedPost>;

// ─────────────────────────────────────────────────────────────────────────────────────────────
// C3 — GET /articles/archive
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** modonty/lib/articles/archive/get-articles-filters.ts:6-11. */
export interface ArchiveFilterOption {
  name: string;
  slug: string;
  count: number;
}

/** modonty/lib/articles/archive/get-articles-filters.ts:13-21. */
export interface ArchiveCategoryOption extends ArchiveFilterOption {
  industrySlugs: string[];
  /** Sub-categories, busiest first. Leaves have `children: []`. */
  children: ArchiveCategoryOption[];
}

/**
 * modonty/lib/articles/archive/get-articles-filters.ts:23-27. NO tags list — tags were removed
 * from the rail on purpose (get-articles-filters.ts:42-45); `?tag=` still filters.
 */
export interface ArchiveFilters {
  industries: ArchiveFilterOption[];
  /** Root categories only, each carrying its children. */
  categories: ArchiveCategoryOption[];
  /** Number of published articles scanned. */
  total: number;
}

/**
 * articles/archive/route.ts:49-52. Page size ARCHIVE_PAGE_SIZE = 20. `filters` only when
 * `withFilters=1`.
 */
export interface ArchiveData extends Paged<ArchiveArticle> {
  filters?: ArchiveFilters;
  /** Page 1 only, servers from 9 Oct 2026 — the whole archive per reading time, narrowed by the search alone. */
  readingTimeCounts?: Record<ArchiveReadingTime, number>;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// C4 — GET /articles/:slug
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** app/(site)/articles/[slug]/helpers/read-article-outline.ts:1-5. */
export interface ArticleHeading {
  /** The `id` attribute injected into the heading inside `html`. */
  id: string;
  text: string;
  /** Heading level (2, 3, …). */
  level: number;
}

/** app/(site)/articles/[slug]/helpers/resolve-article-cta.ts:1-7 (logic :19-40). */
export interface ResolvedArticleCta {
  mode: ClientCtaMode;
  label: string | null;
  /** When `own`, the article's own URL with Modonty UTM params added (not for WhatsApp links). */
  url: string | null;
  /** true = the article's own product button (always mode LINK); false = the partner's button. */
  own: boolean;
}

/** article-detail-shape.ts:39-45 — `data.featuredImage` (may be the platform default image). */
export interface ArticleDetailImage {
  url: string;
  blurDataURL: string | null;
  altText: string | null;
}

/** article-detail-shape.ts:46-53 — from get-article-page-data.ts:138-148. */
export interface ArticleGalleryImage {
  url: string;
  blurDataURL: string | null;
  width: number | null;
  height: number | null;
  /** `media.altText || article.title`. */
  alt: string;
  /** `caption || altText || null`. */
  caption: string | null;
}

/** article-detail-shape.ts:56-65 (Author select at get-article-content-by-slug.ts:37-53). */
export interface ArticleDetailAuthor {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  image: string | null;
  jobTitle: string | null;
}

/** article-detail-shape.ts:66-78. */
export interface ArticleDetailPartner {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  isVerified: boolean;
  /** `description || businessBrief || slogan` (trimmed) or null. */
  credential: string | null;
  city: string | null;
  phone: string | null;
}

/** article-detail-shape.ts:80 — published FAQs with a non-empty answer (get-article-faqs.ts:19-35). */
export interface ArticleDetailFaq {
  id: string;
  question: string;
  answer: string;
}

/** article-detail-shape.ts:81-89 — «اقرأ أيضاً», trimmed to a multiple of 3 (get-article-page-data.ts:177-180). */
export interface ArticleReadMoreItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  image: string | null;
  imageBlur: string | null;
  clientName: string | null;
}

/** article-detail-shape.ts:91-97 — cached counters of the row; live numbers via /counts. */
export interface ArticleDetailCounts {
  likes: number;
  favorites: number;
  comments: number;
  views: number;
  /** Published FAQ count (`_count.faqs`). */
  questions: number;
}

/** modonty/lib/mobile-api/article-detail-shape.ts:18-99. */
export interface ArticleDetail {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  datePublished: IsoDateString | null;
  dateModified: IsoDateString | null;
  createdAt: IsoDateString;
  readingTimeMinutes: number | null;
  wordCount: number | null;
  audioUrl: string | null;
  audioDurationSeconds: number | null;
  /** Sanitized body HTML with heading ids (`safeHtml`). */
  html: string;
  headings: ArticleHeading[];
  /** First sentence under each of the first three H2s (`outline.summary`). */
  keyPoints: string[];
  featuredImage: ArticleDetailImage | null;
  gallery: ArticleGalleryImage[];
  category: { id: string; name: string; slug: string } | null;
  /** ALL tags (not the 5 visible on web). */
  tags: { id: string; name: string; slug: string }[];
  author: ArticleDetailAuthor | null;
  partner: ArticleDetailPartner | null;
  /** null only when there is no partner. */
  cta: ResolvedArticleCta | null;
  faqs: ArticleDetailFaq[];
  readMore: ArticleReadMoreItem[];
  counts: ArticleDetailCounts;
}

/** articles/[ref]/route.ts:20 — `{ article }`. */
export interface ArticleDetailData {
  article: ArticleDetail;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// C5 — GET /articles/:slug/counts
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** `ArticleLiveCounts`, app/(site)/articles/[slug]/data/get-article-live-counts.ts:5-10. */
export interface ArticleLiveCounts {
  likes: number;
  favorites: number;
  comments: number;
  views: number;
}

/** articles/[ref]/counts/route.ts:29 and :32-36. `me` is null without a valid Bearer. */
export interface ArticleCountsData {
  articleId: string;
  counts: ArticleLiveCounts;
  me: { liked: boolean; disliked: boolean; favorited: boolean } | null;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// E1 / E3 — POST /articles/:id/like · /favorite
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** articles/[ref]/like/route.ts:33 (values from modonty/lib/articles/like-article-as.ts:61-64). */
export interface LikeResult {
  liked: boolean;
  likesCount: number;
  dislikesCount: number;
}

/** articles/[ref]/favorite/route.ts:32 (values from modonty/lib/articles/favorite-article-as.ts:53-56). */
export interface FavoriteResult {
  favorited: boolean;
  favoritesCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// C6 / E4 — GET · POST /articles/:id/comments
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** Comment author — `author: { select: { id, name, image } }` on User (name/image nullable). */
export interface CommentAuthor {
  id: string;
  name: string | null;
  image: string | null;
}

/**
 * One approved comment — select at app/(site)/articles/[slug]/data/get-article-comments.ts:6-14,
 * plus `replyingTo` / `isOrphaned` from modonty/lib/comments/flatten-comments-with-context.ts:16-25.
 * Flat list, oldest first; replies point at their parent via `parentId`.
 */
export interface ArticleComment {
  id: string;
  content: string;
  createdAt: IsoDateString;
  /** Always "APPROVED" in this list (filtered at get-article-comments.ts:24). */
  status: CommentStatus;
  parentId: string | null;
  /** null for an anonymous / deleted-user comment. */
  author: CommentAuthor | null;
  _count: { likes: number; dislikes: number };
  /** null for a top-level comment or a reply whose parent is gone. `authorName` falls back to «ضيف». */
  replyingTo: { id: string; authorName: string } | null;
  /** Present on replies only: true when the parent is not in the list. Absent on top-level comments. */
  isOrphaned?: boolean;
}

/** articles/[ref]/comments/route.ts:23 — uncapped. */
export interface CommentsData {
  comments: ArticleComment[];
}

/**
 * articles/[ref]/comments/route.ts:65-80 (201). Row from modonty/lib/comments/submit-comment-as.ts:44-66.
 * The comment is PENDING until the partner approves it.
 */
export interface CommentCreateData {
  comment: {
    id: string;
    content: string;
    /** "PENDING" on creation. */
    status: CommentStatus;
    createdAt: IsoDateString;
    /** Always null — the endpoint has no reply input. */
    parentId: string | null;
    author: CommentAuthor | null;
  };
  /** Fixed Arabic confirmation text. */
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// E8 — POST /articles/:slug/share   ·   E6 — POST /articles/:slug/view
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** articles/[ref]/share/route.ts:38. Body: `{ platform: SharePlatform }`; RATE_LIMITED after 10/article/hour. */
export interface ShareData {
  ok: true;
}

/**
 * GA4 `article_view` params — modonty/lib/analytics/record-article-view.ts:126-139
 * (declared `Record<string, string | undefined>` at :32; undefined keys are dropped on the wire).
 */
export interface ArticleViewGa4Params {
  article_id: string;
  article_slug: string;
  article_title: string;
  author_id?: string;
  author_name?: string;
  category_slug?: string;
  category_name?: string;
  tag_primary?: string;
  client_id?: string;
  client_slug?: string;
  client_name?: string;
  client_industry?: string;
}

/** modonty/lib/analytics/record-article-view.ts:31 / :81 — keys dropped when undefined. */
export interface ArticleViewClarity {
  /** Partner slug. */
  client?: string;
  /** Author name. */
  author?: string;
}

/**
 * articles/[ref]/view/route.ts:42-47. `counted=false` (refresh-in-place) → `analyticsId: null`,
 * `ga4: null` (record-article-view.ts:84).
 */
export interface ViewData {
  counted: boolean;
  analyticsId: string | null;
  ga4: ArticleViewGa4Params | null;
  clarity: ArticleViewClarity;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// A1–A7 — /auth/*
// ─────────────────────────────────────────────────────────────────────────────────────────────

/**
 * auth/login/route.ts:49 and auth/register/route.ts:41 (201).
 * `user` is `readerProfile(...)`, which is typed nullable (reader-profile.ts:15) — in practice set.
 */
export interface AuthData extends ReaderTokens {
  user: ReaderProfile | null;
}

/** auth/refresh/route.ts:23 — the rotated pair (replaces the old refresh token). */
export type TokensData = ReaderTokens;

/** auth/logout/route.ts:22. */
export interface LogoutData {
  signedOut: true;
}

/** auth/forgot-password/route.ts:29 — always this for a well-formed email (no enumeration). */
export interface ForgotPasswordData {
  sent: true;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// C7 / C8 — /categories
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** `CategoryResponse.clientPreviews[]`, modonty/lib/types.ts:114-118 (≤ 3 per category). */
export interface CategoryClientPreview {
  id: string;
  name: string;
  logoUrl?: string;
}

/**
 * `CategoryResponse`, modonty/lib/types.ts:120-138, as filled by
 * app/(site)/categories/helpers/get-categories-enhanced.ts:62-75 and :152-161.
 * Optional string fields are absent when empty.
 */
export interface CategoryListItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  /** Published articles (scheduled excluded). */
  articleCount: number;
  /** true for the 4 categories with the most articles (computed before search/sort). */
  isFeatured?: boolean;
  /** Published in the last 7 days. */
  recentArticleCount?: number;
  /** likes + comments + favorites over the last 7 days. */
  totalEngagement?: number;
  socialImage?: string;
  socialImageAlt?: string;
  /** Declared on CategoryResponse but never filled by getCategoriesEnhanced. */
  children?: CategoryListItem[];
  /** Set whenever at least one category exists (get-categories-enhanced.ts:152-161). */
  clientPreviews?: CategoryClientPreview[];
  clientCount?: number;
  /** Sum of the partners' GA4 + DB digital-impact totals; hidden on the web card. */
  digitalImpact?: number;
}

/** categories/route.ts:28 — page size CATEGORIES_PAGE_SIZE = 20. */
export type CategoriesPage = PagedWithTotal<CategoryListItem>;

/** categories/[slug]/route.ts:34-46. */
export interface CategoryPartner {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  hero: string | null;
  slogan: string | null;
  city: string | null;
  phone: string | null;
  /** Average of APPROVED reviews; 0 when none. */
  averageRating: number;
  /** ALL of this partner's articles (`_count.articles`, unfiltered — modonty/lib/categories/get-category-page-data.ts:73). */
  articleCount: number;
  /** GA4 total for the partner's slug; 0 when unknown. */
  googleTotal: number;
}

/**
 * categories/[slug]/route.ts:23-47. Its articles are `GET /articles/archive?category=<slug>`.
 */
export interface CategoryData {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    socialImage: string | null;
    socialImageAlt: string | null;
  };
  /** Published, non-scheduled articles in this exact category (sub-categories not added). */
  articleCount: number;
  partners: CategoryPartner[];
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// C10a / C10b — /industries
// ─────────────────────────────────────────────────────────────────────────────────────────────

/**
 * `IndustryListItem`, modonty/lib/types.ts:169-178, filled by
 * modonty/lib/queries/get-industries-enhanced.ts:53-68.
 */
export interface IndustryListItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  socialImage?: string;
  socialImageAlt?: string;
  /** Active partners (Modonty's own row excluded). */
  clientCount: number;
  /** ≤ 3, by name. */
  clientPreviews: { id: string; name: string; logoUrl?: string }[];
}

/** industries/route.ts:22 — page size 20 (app/(site)/industries/helpers/get-industries-page.ts:3). */
export type IndustriesPage = PagedWithTotal<IndustryListItem>;

/**
 * industries/[slug]/route.ts:38-50. `articles` is getIndustryFeed (≤ 200, newest first, sliced by
 * FEED_PAGE_SIZE = 10; items mapped at app/(site)/industries/data/get-industry-feed.ts:74-95).
 * `partners` is the full ClientListItem list for this industry (not paged; may include Modonty's
 * own row if it is in this industry — the route does not exclude it).
 */
export interface IndustryData {
  industry: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    socialImage: string | null;
    socialImageAlt: string | null;
  };
  articles: Paged<FeedPost>;
  partners: ClientListItem[];
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// C11 / C12 — /partners
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** partners/route.ts:35 — page size PARTNERS_PAGE_SIZE = 12; Modonty's own row excluded. */
export type PartnersPage = PagedWithTotal<ClientListItem>;

/**
 * `HomeData`, shared/components/partner-site/free/home/home-data.ts:5-71, filled by
 * shared/lib/partner-site/get-home-data.ts:165-234. Renamed here to avoid clashing with the
 * app's `HomeData` (GET /home).
 */
export interface PartnerHomeData {
  clientId: string;
  /** Sensitive activity (medical / legal / financial): booking requires `disclaimerAccepted`. */
  isYmyl: boolean;
  name: string;
  primaryColor: string | null;
  /** Declared but never set by getHomeData — always absent on this endpoint. */
  whatsappHref?: string | null;
  phone: string | null;
  booking: { mode: ClientCtaMode; label: string | null; url: string | null };
  hero: {
    slogan: string | null;
    description: string | null;
    coverUrl: string | null;
    coverWidth: number | null;
    coverHeight: number | null;
    logoUrl: string | null;
    industry: string | null;
    city: string | null;
    /** Gregorian year, formatted text (SITE_LOCALE_GREGORIAN). */
    foundingYear: string | null;
  };
  trust: {
    verified: boolean;
    credentials: { name: string; authority: string | null; year: string | null }[];
  };
  about: {
    description: string | null;
    legalName: string | null;
  };
  services: { title: string; description: string | null; icon?: string | null }[];
  /** Achievements with both value and label. */
  stats: { value: string; label: string }[];
  /** ≤ 30 APPROVED reviews, newest first (get-home-data.ts:97-102). `author` falls back to «عميل». */
  testimonials: { rating: number; comment: string; author: string }[];
  /** ≤ 40 GALLERY images, newest first. */
  gallery: { url: string; alt: string; width: number | null; height: number | null }[];
  team: { name: string; role: string | null; photoUrl: string | null }[];
  video: { url: string; posterUrl: string | null; title: string | null; width?: number | null; height?: number | null } | null;
  /** Client FAQs first, then answered article FAQs, de-duplicated by question (≤ 100 + 100). */
  faqs: { question: string; answer: string }[];
  /**
   * ≤ 60 published articles. `href` = `/articles/<slug>`; `date` is a pre-formatted Arabic
   * Gregorian date string (not ISO).
   */
  posts: { title: string; href: string; imageUrl: string | null; date: string | null; excerpt: string | null; category: string | null }[];
  /** Web path `/clients/<slug>/articles` (always set by getHomeData). */
  blogHref?: string;
  /** `/clients/<slug>/book`. */
  bookHref?: string;
  /** ≤ 60 published reels with a slug. `href` = `/reels/<encoded slug>`. */
  reels: { title: string; href: string; imageUrl: string | null }[];
  /** `/clients/<slug>/reels`. */
  reelsHref?: string;
  /** `/clients/<slug>/services`. */
  servicesHref?: string;
  /** `/clients/<slug>/reviews`. */
  reviewsHref?: string;
  /** `/clients/<slug>/photos`. */
  photosHref?: string;
  /** `/clients/<slug>/faq`. */
  faqHref?: string;
  contact: {
    /** «street، city» or null. */
    address: string | null;
    email: string | null;
    mapHref: string | null;
    mapEmbedSrc: string | null;
    /** Already merged/translated Arabic rows (e.g. «السبت – الخميس» / «٩ ص – منتصف الليل»). */
    hours: { day: string; time: string }[];
  };
}

/** partners/[ref]/route.ts:29-61 (fields from app/(partner)/clients/[slug]/helpers/get-partner-site.ts:16-67). */
export interface PartnerProfile {
  id: string;
  name: string;
  slug: string;
  seoTitle: string | null;
  slogan: string | null;
  description: string | null;
  seoDescription: string | null;
  logo: string | null;
  hero: string | null;
  /** Phone art (2:1) for /modonty — absent on servers before 9 Oct 2026, hence optional. */
  mobileHero?: string | null;
  /** Industry name. */
  industry: string | null;
  isVerified: boolean;
  phone: string | null;
  /** `Client.email` is a required column (schema.prisma `email String @unique`). */
  email: string;
  url: string | null;
  /** Social profile URLs. */
  sameAs: string[];
  address: {
    street: string | null;
    neighborhood: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  foundingDate: IsoDateString | null;
  legalName: string | null;
  cta: { mode: ClientCtaMode; label: string | null; url: string | null };
  counts: {
    /** PUBLISHED articles. */
    articles: number;
    /** APPROVED reviews. */
    reviews: number;
    /** PUBLISHED client FAQs. */
    faqs: number;
    /** GALLERY media. */
    gallery: number;
  };
}

/** app/(partner)/clients/[slug]/helpers/client-stats.ts:17-20 (0/0 on error). */
export interface PartnerStats {
  /** ClientLike rows (= followers). */
  followers: number;
  /** ClientView rows. */
  totalViews: number;
}

/** partners/[ref]/route.ts:27-66. Only ACTIVE partners resolve. */
export interface PartnerData {
  partner: PartnerProfile;
  /** null when getHomeData found nothing (should not happen for an ACTIVE partner). */
  home: PartnerHomeData | null;
  /** `ClientSite.hiddenSections` — section keys the partner switched off. */
  hiddenSections: string[];
  stats: PartnerStats;
}

/** partners/[ref]/follow/route.ts:12 — GET / POST / DELETE. */
export interface FollowData {
  following: boolean;
  followersCount: number;
}

/**
 * GA4 `client_view` params — modonty/lib/analytics/record-client-view.ts:98-103
 * (declared `Record<string, string | undefined>` at :12).
 */
export interface ClientViewGa4Params {
  client_id: string;
  client_slug: string;
  client_name: string;
  client_industry?: string;
}

/** partners/[ref]/view/route.ts:35-36. */
export type PartnerViewData =
  | { counted: false; ga4: null }
  | { counted: true; ga4: ClientViewGa4Params };

/** partners/[ref]/booking/route.ts:51 (201). Refusals come back as VALIDATION_ERROR with Arabic text. */
export interface BookingData {
  success: true;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// C14–C16, E16, E17 — /reels
// ─────────────────────────────────────────────────────────────────────────────────────────────

/**
 * reels/route.ts:24-25 → `ReelsPageForReader`, modonty/lib/reels/get-reels-page-for.ts:7-10.
 * Cursor paging: pass `nextCursor` as `?cursor=`; null = end. Page size 6.
 */
export interface ReelsPage {
  items: ReelFeedItemWithState[];
  nextCursor: string | null;
}

/** `ReelClientFilterOption`, modonty/lib/queries/get-reels-feed-page.ts:8-13 (sorted by name). */
export interface ReelClientFilterOption {
  name: string;
  slug: string;
  logoUrl: string | null;
  /** Published reels of this partner. */
  reelCount: number;
}

/** reels/filters/route.ts:6. */
export interface ReelFiltersData {
  items: ReelClientFilterOption[];
}

/** `ReelWatch`, app/(fullscreen)/reels/[slug]/data/get-reel-by-slug.ts:6-24 (mapped at :86-105). */
export interface ReelWatch {
  id: string;
  slug: string;
  title: string;
  description: string;
  isVideo: boolean;
  imageUrl: string | null;
  hlsUrl: string | null;
  mp4Url: string | null;
  posterUrl: string | null;
  durationSec: number | null;
  /** `reelPublishedAt`. */
  publishedAt: IsoDateString | null;
  likesCount: number;
  favoritesCount: number;
  viewsCount: number;
  clientName: string;
  clientSlug: string;
  clientLogoUrl: string | null;
}

/** app/(fullscreen)/reels/[slug]/data/get-reel-neighbors.ts:11 — reel slugs in feed order. */
export interface ReelNeighbors {
  newer: string | null;
  older: string | null;
}

/** reels/[ref]/route.ts:19. No per-user like/save flags here (and no `commentsCount`). */
export interface ReelData {
  reel: ReelWatch;
  neighbors: ReelNeighbors;
}

/** modonty/lib/mobile-api/toggle-reel-reaction-route.ts:37 (values from lib/reels/toggle-reel-reaction-as.ts:9-10). */
export interface ReelToggleData {
  /** The reader's state after the toggle. */
  active: boolean;
  /** The reel's new likesCount / favoritesCount. */
  count: number;
}

/** `ReelViewGa4Params`, app/(fullscreen)/reels/actions/track-reel-view.ts:7-14 (filled at :54-61). */
export interface ReelViewGa4Params {
  reel_id: string;
  reel_slug: string;
  reel_kind: "video" | "image";
  client_id?: string;
  client_slug?: string;
  client_name?: string;
}

/** reels/[ref]/view/route.ts:22. */
export interface ReelViewData {
  counted: true;
  ga4: ReelViewGa4Params;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// S1 — GET /search
// ─────────────────────────────────────────────────────────────────────────────────────────────

/**
 * `ClientResponse`, modonty/lib/types.ts:185-209, as filled by
 * app/(site)/search/helpers/get-clients-search.ts:70-94. Optional strings absent when empty.
 * `isFeatured` is declared but never set by this producer.
 */
export interface SearchPartner {
  id: string;
  name: string;
  slug: string;
  legalName?: string;
  /** `description || seoDescription`. */
  description?: string;
  industry?: { id: string; name: string; slug: string };
  url?: string;
  logo?: string;
  /** Hero image. */
  ogImage?: string;
  email?: string;
  phone?: string;
  seoTitle?: string;
  seoDescription?: string;
  articleCount: number;
  viewsCount: number;
  subscribersCount: number;
  commentsCount: number;
  likesCount: number;
  dislikesCount: number;
  favoritesCount: number;
  createdAt: IsoDateString;
  isVerified: boolean;
  isFeatured?: boolean;
}

/**
 * search/route.ts:34-38. Articles: 20 a page (items mapped at get-search-results.ts:42-70 —
 * `author` + `dislikes` + `clientId` present, `hasAudio` absent). Partners: top 10, not paged;
 * `[]` when `type=articles`; articles empty when `type=partners`.
 */
export interface SearchData {
  articles: {
    items: FeedPost[];
    page: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  partners: SearchPartner[];
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// A8, A13, N1, N2 — /me
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** `ProfileStats`, app/(site)/users/profile/helpers/profile-stats.ts:3-12. */
export interface ProfileStats {
  /** APPROVED comments written. */
  commentsCount: number;
  articleLikesCount: number;
  commentLikesCount: number;
  /** Comment dislikes given (counts `commentDislike`, profile-stats.ts:36). */
  dislikesGiven: number;
  /** Saved articles. */
  favoritesCount: number;
  /** Partners followed. */
  followingCount: number;
  bookingsCount: number;
  joinedAt: IsoDateString;
}

/** me/route.ts:22. */
export interface MeData {
  user: ReaderProfile;
  stats: ProfileStats;
  unreadNotifications: number;
}

/** `FavoritedArticle`, app/(site)/users/profile/helpers/profile-favorites.ts:5-16 (mapped at :61-88). */
export interface FavoritedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  datePublished: IsoDateString | null;
  /** `url` already resolved (Bunny preferred); `bunnyUrl` is always null. */
  featuredImage: { url: string; bunnyUrl: string | null; blurDataURL: string | null; altText: string | null } | null;
  client: { id: string; name: string; slug: string; logo: string | null };
  author: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string } | null;
  favoritedAt: IsoDateString;
}

/** me/favorites/route.ts:20 — newest saves first, published only, `limit` 1–50 (default 20), no further pages. */
export interface MeFavoritesData {
  items: FavoritedArticle[];
}

/** `FollowedClient`, app/(site)/users/profile/helpers/profile-following.ts:5-14 (mapped at :47-56). */
export interface FollowedClient {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  /** All articles of the partner (`_count.articles`, unfiltered). */
  articleCount: number;
  followedAt: IsoDateString;
  industry: { id: string; name: string; slug: string } | null;
}

/** me/following/route.ts:19 — newest first, `limit` 1–50 (default 20). */
export interface MeFollowingData {
  items: FollowedClient[];
}

/**
 * Where a notification opens — modonty/lib/mobile-api/notification-targets.ts:6-10
 * (resolved at :51-78). `href` is a WEB path (`/articles/<slug>#comment-<id>`, `/articles/<slug>`,
 * `/reels/<slug>`).
 */
export type NotificationTarget =
  | { kind: "article"; slug: string; title: string; href: string }
  | { kind: "reel"; slug: string; title: string | null; href: string }
  | { kind: "contact"; messageId: string }
  | null;

/** me/notifications/route.ts:35-45 (Notification model: schema.prisma:3747-3770). */
export interface NotificationItem {
  id: string;
  /**
   * Free-form string column. Routing rule (modonty/lib/notifications/notification-target-kind.ts:9-14):
   * `comment_*` → article comment · `reel_comment_*` → reel comment · `faq_reply` → FAQ · else contact reply.
   */
  type: string;
  title: string;
  body: string;
  readAt: IsoDateString | null;
  createdAt: IsoDateString;
  clientId: string | null;
  relatedId: string | null;
  target: NotificationTarget;
}

/** me/notifications/route.ts:43-48 — unread first, then newest. `nextCursor` null = end. */
export interface NotificationsData {
  items: NotificationItem[];
  nextCursor: string | null;
  unreadCount: number;
}

/** me/notifications/[id]/read/route.ts:25. */
export interface NotificationReadData {
  ok: true;
  unreadCount: number;
}

/** me/notifications/read-all/route.ts:21. */
export interface NotificationReadAllData {
  ok: true;
  /** Rows changed by this call. */
  marked: number;
  unreadCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// T1 — POST /track/pageview
// ─────────────────────────────────────────────────────────────────────────────────────────────

/**
 * track/pageview/route.ts:34-36 (reasons from modonty/lib/analytics/record-page-view.ts:15-18;
 * `invalid` becomes a VALIDATION_ERROR instead).
 */
export type PageViewData =
  | { recorded: true; skipped: null }
  | { recorded: false; skipped: "owned" | "bot" | "deduplicated" };

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Route → payload index
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** `data` payload per endpoint (method + path under /api/mobile/v1). */
export interface MobileApiPayloads {
  "GET /home": HomeData;
  "GET /articles": ArticlesPage;
  "GET /articles/archive": ArchiveData;
  "GET /articles/:slug": ArticleDetailData;
  "GET /articles/:slug/counts": ArticleCountsData;
  "POST /articles/:id/like": LikeResult;
  "POST /articles/:id/favorite": FavoriteResult;
  "GET /articles/:id/comments": CommentsData;
  "POST /articles/:id/comments": CommentCreateData;
  "POST /articles/:slug/share": ShareData;
  "POST /articles/:slug/view": ViewData;
  "POST /auth/login": AuthData;
  "POST /auth/register": AuthData;
  "POST /auth/refresh": TokensData;
  "POST /auth/logout": LogoutData;
  "POST /auth/forgot-password": ForgotPasswordData;
  "GET /categories": CategoriesPage;
  "GET /categories/:slug": CategoryData;
  "GET /industries": IndustriesPage;
  "GET /industries/:slug": IndustryData;
  "GET /partners": PartnersPage;
  "GET /partners/:slug": PartnerData;
  "GET /partners/:slug/follow": FollowData;
  "POST /partners/:slug/follow": FollowData;
  "DELETE /partners/:slug/follow": FollowData;
  "POST /partners/:slug/view": PartnerViewData;
  "POST /partners/:id/booking": BookingData;
  "GET /reels": ReelsPage;
  "GET /reels/filters": ReelFiltersData;
  "GET /reels/:slug": ReelData;
  "POST /reels/:id/like": ReelToggleData;
  "POST /reels/:id/favorite": ReelToggleData;
  "POST /reels/:id/view": ReelViewData;
  "GET /search": SearchData;
  "GET /me": MeData;
  "GET /me/favorites": MeFavoritesData;
  "GET /me/following": MeFollowingData;
  "GET /me/notifications": NotificationsData;
  "POST /me/notifications/:id/read": NotificationReadData;
  "POST /me/notifications/read-all": NotificationReadAllData;
  "POST /track/pageview": PageViewData;
}
