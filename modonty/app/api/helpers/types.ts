/**
 * Shared TypeScript types for API responses
 * Used by both API routes and Server Components
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
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  featuredImage?: {
    url: string;
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
}

export interface CategoryAnalytics {
  totalBlogs: number;
  totalReactions: number;
  averageEngagement: number;
}

export interface CategoryPageParams {
  searchParams: Promise<{
    search?: string;
    sort?: 'name' | 'articles' | 'trending' | 'recent';
    view?: 'grid' | 'list';
    featured?: string;
  }>;
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

export interface CategoryDetailPageParams {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    search?: string;
    sort?: 'latest' | 'oldest' | 'popular' | 'trending';
    view?: 'grid' | 'list' | 'compact';
    client?: string;
  }>;
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
}

export interface NavigationItem {
  icon: string;
  label: string;
  href: string;
}

export interface ArticleFilters {
  page?: number;
  limit?: number;
  category?: string;
  client?: string;
  featured?: boolean;
  search?: string;
  status?: "PUBLISHED" | "DRAFT" | "SCHEDULED";
}
