import { SubscriptionTier, SubscriptionStatus, PaymentStatus } from "@prisma/client";

export interface ClientFilters {
  createdFrom?: Date;
  createdTo?: Date;
  minArticleCount?: number;
  maxArticleCount?: number;
  hasArticles?: boolean;
  search?: string;
}

/**
 * Type for client returned by getClients()
 * Matches the exact structure returned by the select query in get-clients.ts
 */
export type ClientForList = {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  subscriptionTier: SubscriptionTier | null;
  subscriptionStatus: SubscriptionStatus;
  paymentStatus: PaymentStatus;
  subscriptionEndDate: Date | null;
  articlesPerMonth: number | null;
  metaTags: unknown;
  jsonLdStructuredData: string | null;
  jsonLdValidationReport: unknown;
  seoTitle: string | null;
  seoDescription: string | null;
  description: string | null;
  legalName: string | null;
  url: string | null;
  canonicalUrl: string | null;
  businessBrief: string | null;
  sameAs: string[];
  foundingDate: Date | null;
  gtmId: string | null;
  twitterCard: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterSite: string | null;
  contactType: string | null;
  addressStreet: string | null;
  addressCity: string | null;
  addressRegion: string | null;
  addressCountry: string | null;
  addressPostalCode: string | null;
  addressLatitude: number | null;
  addressLongitude: number | null;
  commercialRegistrationNumber: string | null;
  vatID: string | null;
  taxID: string | null;
  legalForm: string | null;
  businessActivityCode: string | null;
  isicV4: string | null;
  numberOfEmployees: string | null;
  licenseNumber: string | null;
  organizationType: string | null;
  alternateName: string | null;
  slogan: string | null;
  logoMedia: {
    url: string;
    altText: string | null;
    width: number | null;
    height: number | null;
  } | null;
  ogImageMedia: {
    url: string;
    altText: string | null;
    width: number | null;
    height: number | null;
  } | null;
  twitterImageMedia: {
    url: string;
    altText: string | null;
    width: number | null;
    height: number | null;
  } | null;
  subscriptionTierConfig: {
    price: number;
    articlesPerMonth: number;
    tier: SubscriptionTier;
  } | null;
  articles: Array<{
    id: string;
    datePublished: Date | null;
  }>;
  _count: {
    articles: number;
  };
};

export interface ClientsStats {
  total: number;
  withArticles: number;
  withoutArticles: number;
  createdThisMonth: number;
  averageSEO: number;
  subscription: {
    active: number;
    expired: number;
    cancelled: number;
    pending: number;
    expiringSoon: number;
  };
  revenue?: {
    byTier: Record<string, number>;
  };
  payment?: {
    paid: number;
    pending: number;
    overdue: number;
  };
  delivery: {
    totalPromised: number;
    totalDelivered: number;
    deliveryRate: number;
    behindSchedule: number;
  };
  articles: {
    total: number;
    thisMonth: number;
    averageViewsPerArticle: number;
  };
  views: {
    total: number;
    thisMonth: number;
  };
  engagement: {
    avgTimeOnPage: number;
    avgScrollDepth: number;
    bounceRate: number;
    engagementScore: number;
  };
  traffic: {
    organic: number;
    direct: number;
    referral: number;
    social: number;
    sources: Record<string, number>;
  };
  growth: {
    retentionRate: number;
    newClientsTrend: number;
  };
}

