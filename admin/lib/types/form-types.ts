import { ArticleStatus, SubscriptionTier, SubscriptionStatus, PaymentStatus, UserRole } from "@prisma/client";

export interface FAQItem {
  question: string;
  answer: string;
  position?: number;
}

export interface GalleryFormItem {
  mediaId: string;
  position: number;
  caption?: string | null;
  altText?: string | null;
  // Temporary: For display purposes (loaded from Media table, not saved to DB)
  media?: {
    id: string;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
    filename: string;
  };
}

export interface ArticleFormData {
  // Basic Content
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  contentFormat?: string;
  
  // Relationships
  clientId: string;
  categoryId?: string;
  authorId: string;
  
  // Status & Workflow
  status: ArticleStatus;
  scheduledAt?: Date | null;
  featured?: boolean;
  
  // Schema.org Article - Core Fields
  datePublished?: Date | null;
  lastReviewed?: Date | null;
  mainEntityOfPage?: string;
  
  // Schema.org Article - Extended Fields
  wordCount?: number;
  readingTimeMinutes?: number;
  contentDepth?: string;
  inLanguage?: string;
  isAccessibleForFree?: boolean;
  license?: string;
  
  // SEO Meta Tags
  seoTitle?: string;
  seoDescription?: string;
  metaRobots?: string;
  
  // Open Graph (Complete)
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  ogSiteName?: string;
  ogLocale?: string;
  ogType?: string;
  ogArticleAuthor?: string;
  ogArticlePublishedTime?: Date | null;
  ogArticleModifiedTime?: Date | null;
  ogArticleSection?: string;
  ogArticleTag?: string[];
  
  // Twitter Cards (Complete)
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterSite?: string;
  twitterCreator?: string;
  
  // Technical SEO
  canonicalUrl?: string;
  sitemapPriority?: number;
  sitemapChangeFreq?: string;

  // Alternate languages (hreflang, from settings)
  alternateLanguages?: Array<{ hreflang?: string; url?: string }>;

  // Breadcrumb Support
  breadcrumbPath?: any;
  
  // Featured Media
  featuredImageId?: string | null;
  featuredImageAlt?: string | null;
  gallery?: GalleryFormItem[];
  
  // JSON-LD Structured Data
  jsonLdStructuredData?: string;
  jsonLdLastGenerated?: Date | null;
  jsonLdValidationReport?: any;
  
  // Content for Structured Data
  articleBodyText?: string;
  
  // Semantic Enhancement
  semanticKeywords?: any;
  
  // E-E-A-T Enhancement
  citations?: string[];

  // SEO keywords the article is based on (reference)
  seoKeywords?: string[];
  
  // Schema Versioning
  jsonLdVersion?: number;
  jsonLdHistory?: any;
  jsonLdDiffSummary?: string;

  // Tags & FAQs
  tags?: string[];
  faqs?: FAQItem[];
  
  // Related Articles
  relatedArticles?: Array<{
    relatedId: string;
    relationshipType?: 'related' | 'similar' | 'recommended';
  }>;
}

export interface ClientFormData {
  name: string;
  slug: string;
  legalName?: string;
  url?: string;
  // Centralized media references
  logoMediaId?: string | null;
  ogImageMediaId?: string | null;
  twitterImageMediaId?: string | null;
  sameAs?: string[];
  email: string;
  phone?: string;
  password?: string | null;
  seoTitle?: string;
  seoDescription?: string;
  description?: string | null;
  businessBrief?: string;
  industryId?: string | null;
  targetAudience?: string;
  contentPriorities?: string[];
  foundingDate?: Date | null;
  contactType?: string | null;
  addressStreet?: string | null;
  addressCity?: string | null;
  addressCountry?: string | null;
  addressPostalCode?: string | null;
  twitterCard?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterSite?: string | null;
  canonicalUrl?: string | null;
  metaRobots?: string | null;
  gtmId?: string;
  subscriptionTier?: SubscriptionTier | null;
  subscriptionStartDate?: Date | null;
  subscriptionEndDate?: Date | null;
  articlesPerMonth?: number;
  subscriptionTierConfigId?: string | null;
  subscriptionStatus?: SubscriptionStatus;
  paymentStatus?: PaymentStatus;

  // Saudi Arabia & Gulf Identifiers
  commercialRegistrationNumber?: string | null;
  vatID?: string | null;
  taxID?: string | null;
  legalForm?: string | null;

  // Address Enhancement
  addressRegion?: string | null;
  addressNeighborhood?: string | null;
  addressBuildingNumber?: string | null;
  addressAdditionalNumber?: string | null;
  addressLatitude?: number | null;
  addressLongitude?: number | null;

  // Classification & Business Info
  businessActivityCode?: string | null;
  isicV4?: string | null;
  numberOfEmployees?: string | null;
  licenseNumber?: string | null;
  licenseAuthority?: string | null;

  // Additional Properties
  alternateName?: string | null;
  slogan?: string | null;
  keywords?: string[];
  knowsLanguage?: string[];
  organizationType?: string | null;

  // Relationships
  parentOrganizationId?: string | null;
}

export interface AuthorFormData {
  name: string;
  slug: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  worksFor?: string;
  bio?: string;
  image?: string;
  imageAlt?: string;
  url?: string;
  email?: string;
  linkedIn?: string;
  twitter?: string;
  facebook?: string;
  sameAs?: string[];
  credentials?: string[];
  qualifications?: string[];
  expertiseAreas?: string[];
  experienceYears?: number;
  verificationStatus?: boolean;
  memberOf?: string[];
  education?: Array<Record<string, string | number | boolean>>;
  seoTitle?: string;
  seoDescription?: string;
  socialImage?: string | null;
  socialImageAlt?: string | null;
  cloudinaryPublicId?: string | null;
  canonicalUrl?: string;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  socialImage?: string | null;
  socialImageAlt?: string | null;
  cloudinaryPublicId?: string | null;
}

export interface TagFormData {
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  socialImage?: string | null;
  socialImageAlt?: string | null;
  cloudinaryPublicId?: string | null;
}

export interface TagFormDataOld {
  name: string;
  slug: string;
}

export interface IndustryFormData {
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  socialImage?: string | null;
  socialImageAlt?: string | null;
  cloudinaryPublicId?: string | null;
}

export interface UserFormData {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  avatar?: string;
  image?: string;
  clientAccess?: string[];
}

export interface FormSubmitResult {
  success: boolean;
  error?: string;
  article?: {
    id: string;
    title?: string | null;
    status?: ArticleStatus;
  };
}
