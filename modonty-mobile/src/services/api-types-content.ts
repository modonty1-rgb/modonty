/**
 * Wire types for the reader API's content reads, group C (V2 + V3) —
 * `modonty/app/api/mobile/v1/{tags,partners/[ref]/*,reels/[ref]/comments,authors,audio,trending,news,
 * pages,faq,sectors,users}/**`.
 *
 * Same conventions as `api-types.ts` (kept standalone — no imports):
 *  - `Date` on the server → ISO `string` here.
 *  - `field?:` = the server leaves it `undefined`, which JSON drops. `null` stays `null`.
 *  - Each type is the `data` of the `{ data }` envelope.
 * Paths are relative to the monorepo root.
 */

type IsoDate = string;

// ─────────────────────────────────────────────────────────────────────────────────────────────
// C9 — tags
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** modonty/app/(site)/tags/helpers/tag-types.ts:8-20 (`getTagsEnhanced`). */
export interface TagListItem {
  id: string;
  name: string;
  slug: string;
  socialImage?: string;
  socialImageAlt?: string;
  /** Published, already-live articles carrying the tag. */
  articleCount: number;
  /** Published in the last 7 days. */
  recentArticleCount: number;
  /** Up to 3 ACTIVE partners (Modonty itself excluded). */
  clientPreviews: { id: string; name: string; logoUrl?: string }[];
  clientCount: number;
  /** Sum of the tagged partners' GA4 totals — not views of the tag page. */
  digitalImpact: number;
}

/** GET /tags?search&sort=name|articles|trending&page — tags/route.ts (20 per page, `getTagsPage`). */
export interface TagsPage {
  items: TagListItem[];
  page: number;
  hasMore: boolean;
  total: number;
}

/** tags/[slug]/route.ts — the partner card fields of `getTagPageData` (tags/[slug]/data/get-tag-page-data.ts). */
export interface TagPartner {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  hero: string | null;
  slogan: string | null;
  city: string | null;
  phone: string | null;
  /** APPROVED review average, 0 when none. */
  averageRating: number;
  /** All the partner's articles (`_count.articles`, no status filter — as the web card). */
  articleCount: number;
  /** GA4 total for the partner, 0 when unknown. */
  googleTotal: number;
}

/**
 * GET /tags/:slug — tags/[slug]/route.ts. The web tag page lists partners, not articles; the
 * articles are `GET /articles/archive?tag=<slug>` (shown only when `articleCount > 0`).
 */
export interface TagData {
  tag: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    socialImage: string | null;
    socialImageAlt: string | null;
  };
  articleCount: number;
  partners: TagPartner[];
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// C13 — partner sub-pages (all 404 `partnerNotFound` for a missing or non-ACTIVE partner)
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** shared/components/partner-site/free/home/home-data.ts:45 (`posts`), href → slug. */
export interface PartnerArticleItem {
  title: string;
  slug: string;
  imageUrl: string | null;
  /** Display string, Gregorian with the month in words (shared/lib/partner-site/get-home-data.ts) — NOT ISO. */
  date: string | null;
  excerpt: string | null;
  category: string | null;
}

/** GET /partners/:slug/articles?page — 20 per page out of the newest 60 (getHomeData `take: 60`). */
export interface PartnerArticlesPage {
  items: PartnerArticleItem[];
  page: number;
  hasMore: boolean;
  total: number;
}

/** modonty/app/(partner)/clients/[slug]/helpers/client-reviews.ts:11-17. */
export interface PartnerReview {
  id: string;
  /** 1–5. */
  rating: number;
  comment: string;
  createdAt: IsoDate;
  /** null when the reviewer account is gone. */
  author: { id: string; name: string | null; image: string | null } | null;
}

/** GET /partners/:slug/reviews?page (page ≤ 50) — `getClientReviews`, APPROVED only, newest first. */
export interface PartnerReviewsPage {
  items: PartnerReview[];
  page: number;
  hasMore: boolean;
  /** APPROVED review count. */
  total: number;
  /** APPROVED average, 0 when none. */
  averageRating: number;
}

/** modonty/app/(partner)/clients/[slug]/helpers/client-followers.ts:31-36. */
export interface PartnerFollower {
  /** The ClientLike row id. */
  id: string;
  userId: string | null;
  /** «متابع» when the user has no name. */
  name: string;
  image: string | null;
}

/** GET /partners/:slug/followers?limit (1–60, default 6 as the web) — newest first. */
export interface PartnerFollowersData {
  items: PartnerFollower[];
}

/** shared/components/partner-site/free/home/home-data.ts:41 (`gallery`). */
export interface PartnerGalleryImage {
  url: string;
  /** Never empty — «صورة من <name> <n>» when the upload had no alt text. */
  alt: string;
  width: number | null;
  height: number | null;
}

/** GET /partners/:slug/gallery — what /clients/[slug]/photos renders (≤ 40, newest first). */
export interface PartnerGalleryData {
  items: PartnerGalleryImage[];
}

/** GET /partners/:slug/faqs — home-data.ts:44: page FAQs first, then approved article FAQs, deduped. */
export interface PartnerFaqsData {
  items: { question: string; answer: string }[];
}

/** GET /partners/:slug/reels — home-data.ts:55, href → slug (open with GET /reels/:slug). ≤ 60. */
export interface PartnerReelsData {
  items: { title: string; slug: string; imageUrl: string | null }[];
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// C17 — reel comments
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** modonty/app/(fullscreen)/reels/data/get-reel-comments.ts:6-15. */
export interface ReelComment {
  id: string;
  content: string;
  createdAt: IsoDate;
  parentId: string | null;
  replyingTo: { id: string; authorName: string } | null;
  author: { id: string; name: string | null; image: string | null } | null;
  likesCount: number;
  /** Always false without a valid Bearer. */
  likedByMe: boolean;
}

/** GET /reels/:id/comments — APPROVED, oldest first, ≤ 200, flat (replies via `parentId`). no-store. */
export interface ReelCommentsData {
  comments: ReelComment[];
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// C18 — author
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** modonty/lib/settings/get-platform-social-links.ts:7-11. */
export interface PlatformSocialLink {
  key: string;
  href: string;
  /** Arabic platform name. */
  label: string;
}

/** authors/[slug]/route.ts — row from app/(site)/authors/[slug]/data/get-author-by-slug.ts. */
export interface AuthorProfile {
  id: string;
  name: string;
  slug: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  image: string | null;
  imageAlt: string | null;
  url: string | null;
  jobTitle: string | null;
  verified: boolean;
  email: string | null;
  linkedIn: string | null;
  twitter: string | null;
  facebook: string | null;
  sameAs: string[];
  credentials: string[];
  expertiseAreas: string[];
  memberOf: string[];
}

/** app/(site)/authors/[slug]/data/get-author-articles.ts (select). */
export interface AuthorArticle {
  title: string;
  slug: string;
  excerpt: string | null;
  datePublished: IsoDate | null;
  image: string | null;
  imageBlur: string | null;
  imageAlt: string | null;
}

/** GET /authors/:slug?page — 20 per page. */
export interface AuthorData {
  author: AuthorProfile;
  /** true for the platform-brand author (`MODONTY_AUTHOR_SLUG`) — the page draws a publisher header. */
  isOrganization: boolean;
  /** The platform's official channels — empty unless `isOrganization`. */
  socialLinks: PlatformSocialLink[];
  articles: AuthorArticle[];
  page: number;
  hasMore: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// C19 — audio · trending · news
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** modonty/app/(site)/audio/data/get-audio-articles.ts:7-23. */
export interface AudioArticle {
  id: string;
  title: string;
  excerpt?: string;
  slug: string;
  image?: string;
  imageBlur?: string;
  publishedAt: IsoDate;
  clientName: string;
  clientSlug: string;
  clientLogo?: string;
  readingTimeMinutes?: number;
  durationSeconds?: number;
  audioUrl: string;
}

/** GET /audio — ≤ 100, newest first. */
export interface AudioData {
  items: AudioArticle[];
}

/** modonty/lib/types.ts:20-59 as filled by `mapFeedArticleToResponse` (lib/queries/article-feed-shapes.ts:65). */
export interface ArticleResponse {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: string;
  /** Already an ISO string on the server. */
  publishedAt: IsoDate;
  hasAudio?: boolean;
  author: { id: string; name: string; image?: string };
  client: { id: string; name: string; slug: string; logo?: string; industry?: string };
  category?: { id: string; name: string; slug: string };
  featuredImage?: { url: string; bunnyUrl: null; blurDataURL: string | null; altText?: string };
  interactions: { likes: number; dislikes: number; comments: number; favorites: number; views: number };
  readingTimeMinutes?: number;
  wordCount?: number;
}

/** GET /trending?days=7|14|30 — `getTrendingArticles(12, days)`, ranked by trending score. */
export interface TrendingData {
  items: ArticleResponse[];
  days: 7 | 14 | 30;
}

/** GET /news?page — `getArticles({ page, limit: 20 })`, newest first, every publisher. */
export interface NewsPage {
  items: ArticleResponse[];
  page: number;
  hasMore: boolean;
  total: number;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// C20 — static pages · help FAQ
// ─────────────────────────────────────────────────────────────────────────────────────────────

export type StaticPageKey = "about" | "privacy-policy" | "user-agreement" | "terms";

/**
 * GET /pages/:key — pages/[key]/route.ts. `html` is admin-authored HTML, unsanitized exactly as the
 * web injects it. Legal pages fall back to built-in text (never null); `about` has no fallback
 * (`html: null` = no editorial section) and no date (`updatedAt` always null), and its `title`
 * may be "".
 */
export interface StaticPageData {
  key: StaticPageKey;
  title: string;
  html: string | null;
  updatedAt: IsoDate | null;
}

/** modonty/app/(site)/help/faq/actions/faq-actions.ts:7-18 (select) + recomputed counts. */
export interface HelpFaq {
  id: string;
  question: string;
  /** May contain HTML (schema: "can be HTML/rich text"). */
  answer: string;
  lastReviewed: IsoDate | null;
  updatedAt: IsoDate;
  upvoteCount: number;
  downvoteCount: number;
}

/** GET /faq — active FAQs in editor order; an empty list also when the read failed (logged). */
export interface FaqData {
  items: HelpFaq[];
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// V3 — sectors · public user
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** shared/lib/sectors/live-sectors.ts:7-18. */
export type SectorKey = "football" | "ai" | "entrepreneurship" | "education" | "entertainment" | "health";

/** GET /sectors. */
export interface SectorsData {
  items: { key: SectorKey; label: string; paused: boolean }[];
}

/** modonty/app/(site)/modonty/data/get-sector-hero.ts:6-18. */
export interface SectorHeroImage {
  src: string;
  alt: string;
  blur: string | null;
}

export interface SectorHero {
  title: string | null;
  subtitle: string | null;
  desktop: SectorHeroImage | null;
  mobile: SectorHeroImage | null;
}

/** modonty/app/(site)/modonty/data/get-sector-articles.ts:9-16. */
export interface SectorArticle {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  summary: string | null;
}

/** GET /sectors/:key — paused → `hero: null, articles: []`. Articles ≤ 4 (SECTOR_PICK_LIMIT). */
export interface SectorData {
  key: SectorKey;
  label: string;
  paused: boolean;
  hero: SectorHero | null;
  articles: SectorArticle[];
}

/** GET /users/:id — users/[id]/route.ts, from app/(site)/users/[id]/data/get-profile-data.ts. Never the email. */
export interface PublicUserData {
  user: {
    id: string;
    /** The matching author's name first, then the user's. */
    name: string | null;
    image: string | null;
    createdAt: IsoDate;
  };
  /** The author row sharing the user's email, if any. */
  author: { slug: string; name: string; jobTitle: string | null; bio: string | null; image: string | null } | null;
  /** The author's published articles, newest first, ≤ 20. Empty when no author. */
  articles: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    datePublished: IsoDate | null;
    client: { id: string; name: string; slug: string };
  }[];
}
