"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, FileText, Search, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RequiredTab } from "./tabs/required-tab";
import { BusinessTab } from "./tabs/business-tab";
import { ContactTab } from "./tabs/contact-tab";
import { AddressTab } from "./tabs/address-tab";
import { LegalTab } from "./tabs/legal-tab";
import { SEOTab } from "./tabs/seo-tab";
import { MediaSocialTab } from "./tabs/media-social-tab";
import { SecurityTab } from "./tabs/security-tab";
import { AdditionalTab } from "./tabs/additional-tab";
import { SettingsTab } from "./tabs/settings-tab";
import { ClientAnalytics } from "./client-analytics";
import { ClientArticles } from "./client-articles";
import { ArticleStatus } from "@prisma/client";
import type { MediaType } from "@prisma/client";

type Article = {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  createdAt: Date;
  datePublished: Date | null;
  scheduledAt: Date | null;
  views: number;
  category: { name: string } | null;
  author: { name: string } | null;
};

type Media = {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  fileSize: number | null;
  width: number | null;
  height: number | null;
  altText: string | null;
  title: string | null;
  description: string | null;
  type: MediaType;
  createdAt: Date;
  cloudinaryPublicId?: string | null;
  cloudinaryVersion?: string | null;
};

interface ClientTabsProps {
  client: {
    id: string;
    name: string;
    slug: string;
    legalName: string | null;
    alternateName: string | null;
    slogan: string | null;
    organizationType: string | null;
    url: string | null;
    logoMedia: {
      url: string;
      altText: string | null;
    } | null;
    ogImageMedia: {
      url: string;
      altText: string | null;
    } | null;
    twitterImageMedia: {
      url: string;
      altText: string | null;
    } | null;
    email: string;
    phone: string | null;
    sameAs: string[];
    seoTitle: string | null;
    seoDescription: string | null;
    description: string | null;
    businessBrief: string | null;
    industry: {
      id: string;
      name: string;
    } | null;
    targetAudience: string | null;
    contentPriorities: string[];
    keywords: string[];
    knowsLanguage: string[];
    numberOfEmployees: string | null;
    subscriptionTier: string | null;
    subscriptionStartDate: Date | null;
    subscriptionEndDate: Date | null;
    articlesPerMonth: number | null;
    subscriptionTierConfig?: {
      id: string;
      tier: string;
      name: string;
      articlesPerMonth: number;
      price: number;
      isPopular: boolean;
    } | null;
    subscriptionStatus: string;
    paymentStatus: string;
    contactType: string | null;
    addressStreet: string | null;
    addressCity: string | null;
    addressCountry: string | null;
    addressPostalCode: string | null;
    addressRegion: string | null;
    addressNeighborhood: string | null;
    addressBuildingNumber: string | null;
    addressAdditionalNumber: string | null;
    canonicalUrl: string | null;
    twitterCard: string | null;
    twitterTitle: string | null;
    twitterDescription: string | null;
    twitterSite: string | null;
    gtmId: string | null;
    metaRobots: string | null;
    metaTags: {
      title: string;
      description: string;
      robots: string;
      author: string;
      language: string;
      charset: string;
      openGraph: {
        title: string;
        description: string;
        type: string;
        url: string;
        siteName: string;
        locale: string;
        images?: Array<{
          url: string;
          secure_url: string;
          type: string;
          width: number;
          height: number;
          alt: string;
        }>;
      };
      twitter: {
        card: string;
        title: string;
        description: string;
        image?: string;
        imageAlt?: string;
        site?: string;
        creator?: string;
      };
      canonical: string;
      formatDetection: {
        telephone: boolean;
        email: boolean;
        address: boolean;
      };
    } | null;
    jsonLdStructuredData: string | null;
    jsonLdLastGenerated: Date | null;
    jsonLdValidationReport: {
      adobe?: { valid: boolean; errors?: unknown[]; warnings?: unknown[] };
      custom?: { valid: boolean; errors?: unknown[]; warnings?: unknown[] };
      richResults?: { valid: boolean; errors?: unknown[]; warnings?: unknown[] };
    } | null;
    foundingDate: Date | null;
    commercialRegistrationNumber: string | null;
    vatID: string | null;
    taxID: string | null;
    legalForm: string | null;
    businessActivityCode: string | null;
    isicV4: string | null;
    licenseNumber: string | null;
    licenseAuthority: string | null;
    parentOrganization: {
      id: string;
      name: string;
      url: string | null;
      slug: string;
    } | null;
    _count: {
      articles: number;
    };
  };
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    createdAt: Date;
    datePublished: Date | null;
    scheduledAt: Date | null;
    views: number;
    category: { name: string } | null;
    author: { name: string } | null;
  }>;
  articlesThisMonth: number;
  analytics: {
    totalViews: number;
    uniqueSessions: number;
    avgTimeOnPage: number;
    bounceRate: number;
    avgScrollDepth: number;
    topArticles?: Array<{
      articleId: string;
      title: string;
      client: string;
      views: number;
    }>;
    trafficSources?: Record<string, number>;
    channelSummary?: Record<string, {
      views: number;
      sessions: number;
      avgTimeOnPage: number;
      bounceRate: number;
      avgScrollDepth: number;
    }>;
  };
  media: Array<{
    id: string;
    filename: string;
    url: string;
    mimeType: string;
    fileSize: number | null;
    width: number | null;
    height: number | null;
    altText: string | null;
    title: string | null;
    description: string | null;
    type: string;
    createdAt: Date;
    cloudinaryPublicId?: string | null;
    cloudinaryVersion?: string | null;
  }>;
}

export function ClientTabs({
  client,
  articles,
  articlesThisMonth,
  analytics,
  media,
}: ClientTabsProps) {
  const isSeoCritical = !client.metaRobots || !client.jsonLdStructuredData;

  return (
    <Tabs defaultValue="required" className="w-full">
      <div className="flex gap-6">
        {/* Left Column - Tab Content */}
        <div className="flex-1 min-w-0">
          {/* Required Tab */}
          <TabsContent value="required" className="space-y-6 mt-0">
            <RequiredTab client={client} />
          </TabsContent>

          {/* Business Tab */}
          <TabsContent value="business" className="space-y-6 mt-0">
            <BusinessTab client={client} />
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6 mt-0">
            <ContactTab client={client} />
          </TabsContent>

          {/* Address Tab */}
          <TabsContent value="address" className="space-y-6 mt-0">
            <AddressTab client={client} />
          </TabsContent>

          {/* Legal Tab */}
          <TabsContent value="legal" className="space-y-6 mt-0">
            <LegalTab client={client} />
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6 mt-0">
            <SEOTab client={client} />
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media-social" className="space-y-6 mt-0">
            <MediaSocialTab client={client} media={media.map(m => ({ ...m, type: m.type as MediaType }))} />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6 mt-0">
            <SecurityTab client={client} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-0">
            <SettingsTab client={client} />
          </TabsContent>

          {/* Additional Tab */}
          <TabsContent value="additional" className="space-y-6 mt-0">
            <AdditionalTab client={client} />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-0">
            <ClientAnalytics
              analytics={analytics}
              clientId={client.id}
              client={client}
              articlesThisMonth={articlesThisMonth}
              totalArticles={articles.length}
            />
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="content" className="space-y-6 mt-0">
            <ClientArticles articles={articles.map(a => ({ ...a, status: a.status as ArticleStatus }))} clientId={client.id} />
          </TabsContent>
        </div>

        {/* Right Column - Vertical Tabs */}
        <div className="w-64 shrink-0 flex flex-col gap-4">
          <div className="sticky top-24 z-30 flex flex-col gap-4">
            <TabsList className="flex flex-col h-auto w-full bg-muted p-1.5 gap-1.5">
              <TabsTrigger value="required" className="w-full justify-start relative">
                Required
              </TabsTrigger>
              <TabsTrigger value="business" className="w-full justify-start relative">
                Business
              </TabsTrigger>
              <TabsTrigger value="contact" className="w-full justify-start relative">
                Contact
              </TabsTrigger>
              <TabsTrigger value="address" className="w-full justify-start relative">
                Address
              </TabsTrigger>
              <TabsTrigger value="legal" className="w-full justify-start relative">
                Legal
              </TabsTrigger>
              <TabsTrigger 
                value="seo" 
                className={`w-full justify-start relative ${
                  isSeoCritical ? "relative" : ""
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="truncate">SEO</span>
                  {isSeoCritical && (
                    <Badge 
                      variant="destructive" 
                      className="ml-auto h-4 px-1.5 text-[10px] flex items-center gap-0.5 shrink-0"
                    >
                      <AlertTriangle className="h-2.5 w-2.5" />
                      Critical
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger value="media-social" className="w-full justify-start relative">
                Media
              </TabsTrigger>
              <TabsTrigger value="security" className="w-full justify-start relative">
                Security
              </TabsTrigger>
              <TabsTrigger value="settings" className="w-full justify-start relative">
                Settings
              </TabsTrigger>
              <TabsTrigger value="additional" className="w-full justify-start relative">
                Additional
              </TabsTrigger>
              <TabsTrigger value="analytics" className="w-full justify-start relative">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 flex-shrink-0" />
                  <span>Performance</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="content" className="w-full justify-start relative">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span>Articles</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
      </div>
    </Tabs>
  );
}
