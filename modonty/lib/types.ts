/**
 * Shared TypeScript types for API responses, feed DTOs, and page params.
 * Used by API routes, server components, server actions, and UI components.
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ArticleResponse {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  image?: string;
  publishedAt: string;
  hasAudio?: boolean;
  author: {
    id: string;
    name: string;
    slug?: string;
    bio?: string;
    image?: string;
  };
  client: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    industry?: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  featuredImage?: {
    url: string;
    bunnyUrl: string | null;
    /** Carried through so cards can render the stored placeholder — dropping it here
     *  silently disabled blur on every feed and listing card. */
    blurDataURL: string | null;
    altText?: string;
  };
  interactions: InteractionCounts;
  readingTimeMinutes?: number;
  wordCount?: number;
}

export interface InteractionCounts {
  likes: number;
  dislikes: number;
  comments: number;
  favorites: number;
  views: number;
}

/** Feed/card representation mapped from ArticleResponse. Use for PostCard, FeedContainer, search, loadMore. */
export interface FeedPost {
  id: string;
  title: string;
  excerpt?: string;
  image?: string;
  /** Stored LQIP for `image`. Dropping it silently disables the blur placeholder on every card. */
  imageBlur?: string;
  slug: string;
  publishedAt: Date;
  clientName: string;
  clientSlug: string;
  clientId?: string;
  clientLogo?: string;
  readingTimeMinutes?: number;
  hasAudio?: boolean;
  /** Optional: feed cards don't render the author (homepage feed omits it to avoid a User join). Search still provides it. */
  author?: {
    id: string;
    name: string;
    title: string;
    company: string;
    avatar: string;
  };
  likes: number;
  /** Optional: cards never render dislikes; homepage feed omits it. */
  dislikes?: number;
  comments: number;
  favorites: number;
  views: number;
  status: "published" | "draft";
}

export interface CategoryClientPreview {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  articleCount: number;
  isFeatured?: boolean;
  recentArticleCount?: number;
  totalEngagement?: number;
  socialImage?: string;
  socialImageAlt?: string;
  children?: CategoryResponse[];
  clientPreviews?: CategoryClientPreview[];
  clientCount?: number;
  /** Sum of the digital-impact total of every ACTIVE client in this category (GA4 + DB engagement). Computed, currently hidden on the card. */
  digitalImpact?: number;
}

export interface CategoryAnalytics {
  totalBlogs: number;
  totalReactions: number;
  averageEngagement: number;
  totalLikes: number;
  totalComments: number;
  totalDislikes: number;
  totalFavorites: number;
  totalViews: number;
  averageCommentsPerBlog: number;
  engagedBlogs: number;
}

export interface CategoryQueryOptions {
  search?: string;
  sortBy?: 'name' | 'articles' | 'trending' | 'recent';
  view?: 'grid' | 'list';
  featured?: boolean;
}

export interface CategoryArticleQueryOptions {
  search?: string;
  sortBy?: 'latest' | 'oldest' | 'popular' | 'trending';
  clientId?: string;
  limit?: number;
}

// Industry listing — clients link DIRECTLY via Client.industryId (no articles junction),
// so the card headline is the partner-company count, not an article count.
export interface IndustryListItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  socialImage?: string;
  socialImageAlt?: string;
  clientCount: number;
  clientPreviews: { id: string; name: string; logoUrl?: string }[];
}

export interface IndustryQueryOptions {
  search?: string;
  sortBy?: 'clients' | 'name';
}

export interface ClientResponse {
  id: string;
  name: string;
  slug: string;
  legalName?: string;
  description?: string;
  industry?: { id: string; name: string; slug: string };
  url?: string;
  logo?: string;
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
  subscriptionTier?: string;
  createdAt: Date;
  isVerified: boolean;
  isFeatured?: boolean; // featured/premium partner spotlight (admin toggle)
}

export interface ArticleFilters {
  page?: number;
  limit?: number;
  category?: string;
  client?: string;
  featured?: boolean;
  search?: string;
  hasAudio?: boolean;
  status?: "PUBLISHED" | "DRAFT" | "SCHEDULED";
  sortBy?: "newest" | "oldest" | "title" | "popular";
}
