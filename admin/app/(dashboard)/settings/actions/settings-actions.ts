"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonValue = Prisma.InputJsonValue | any;

export interface SEOSettings {
  seoTitleMin: number;
  seoTitleMax: number;
  seoTitleRestrict: boolean;
  seoDescriptionMin: number;
  seoDescriptionMax: number;
  seoDescriptionRestrict: boolean;
  twitterTitleMax: number;
  twitterTitleRestrict: boolean;
  twitterDescriptionMax: number;
  twitterDescriptionRestrict: boolean;
  ogTitleMax: number;
  ogTitleRestrict: boolean;
  ogDescriptionMax: number;
  ogDescriptionRestrict: boolean;
}

export interface GTMSettings {
  gtmContainerId: string | null;
  gtmEnabled: boolean;
}

export interface HOTjarSettings {
  hotjarSiteId: string | null;
  hotjarEnabled: boolean;
}

export interface SocialMediaSettings {
  facebookUrl: string | null;
  twitterUrl: string | null;
  linkedInUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  tiktokUrl: string | null;
  pinterestUrl: string | null;
  snapchatUrl: string | null;
}

export interface MediaSettings {
  logoUrl: string | null;
  ogImageUrl: string | null;
  altImage: string | null;
}

export interface ModontySettings {
  modontySeoTitle: string | null;
  modontySeoDescription: string | null;
  clientsSeoTitle: string | null;
  clientsSeoDescription: string | null;
  categoriesSeoTitle: string | null;
  categoriesSeoDescription: string | null;
  trendingSeoTitle: string | null;
  trendingSeoDescription: string | null;
}

export interface SettingsJsonLdCache {
  jsonLdStructuredData: string | null;
  jsonLdLastGenerated: Date | null;
  jsonLdValidationReport: Record<string, unknown> | null;
}

export interface GeneratedPageSeoCache {
  metaTags: Record<string, unknown> | null;
  jsonLdStructuredData: string | null;
  jsonLdLastGenerated: Date | null;
  jsonLdValidationReport: Record<string, unknown> | null;
}

export interface SettingsGeneratedSeo {
  homeMetaTags: Record<string, unknown> | null;
  clientsPageMetaTags: Record<string, unknown> | null;
  clientsPageJsonLdStructuredData: string | null;
  clientsPageJsonLdLastGenerated: Date | null;
  clientsPageJsonLdValidationReport: Record<string, unknown> | null;
  categoriesPageMetaTags: Record<string, unknown> | null;
  categoriesPageJsonLdStructuredData: string | null;
  categoriesPageJsonLdLastGenerated: Date | null;
  categoriesPageJsonLdValidationReport: Record<string, unknown> | null;
  trendingPageMetaTags: Record<string, unknown> | null;
  trendingPageJsonLdStructuredData: string | null;
  trendingPageJsonLdLastGenerated: Date | null;
  trendingPageJsonLdValidationReport: Record<string, unknown> | null;
}

export interface SiteOrgSettings {
  siteUrl: string | null;
  siteName: string | null;
  brandDescription: string | null;
  siteAuthor: string | null;
  themeColor: string | null;
  inLanguage: string | null;
  defaultMetaRobots: string | null;
  defaultGooglebot: string | null;
  defaultOgType: string | null;
  defaultOgLocale: string | null;
  defaultOgDeterminer: string | null;
  defaultTwitterCard: string | null;
  defaultSitemapPriority: number | null;
  defaultSitemapChangeFreq: string | null;
  articleDefaultSitemapChangeFreq: string | null;
  articleDefaultSitemapPriority: number | null;
  defaultLicense: string | null;
  defaultIsAccessibleForFree: boolean;
  defaultAlternateLanguages: unknown;
  defaultContentFormat: string | null;
  defaultCharset: string | null;
  defaultViewport: string | null;
  defaultOgImageType: string | null;
  defaultOgImageWidth: number | null;
  defaultOgImageHeight: number | null;
  defaultHreflang: string | null;
  defaultPathname: string | null;
  defaultTruncationSuffix: string | null;
  defaultReferrerPolicy: string | null;
  defaultNotranslate: boolean | null;
  twitterSite: string | null;
  twitterCreator: string | null;
  twitterSiteId: string | null;
  twitterCreatorId: string | null;
  orgContactType: string | null;
  orgContactEmail: string | null;
  orgContactTelephone: string | null;
  orgContactAvailableLanguage: string | null;
  orgContactOption: string | null;
  orgContactHoursAvailable: string | null;
  orgAreaServed: string | null;
  orgStreetAddress: string | null;
  orgAddressLocality: string | null;
  orgAddressRegion: string | null;
  orgAddressCountry: string | null;
  orgPostalCode: string | null;
  orgGeoLatitude: number | null;
  orgGeoLongitude: number | null;
  orgSearchUrlTemplate: string | null;
  orgLogoUrl: string | null;
}

export interface AllSettings
  extends SEOSettings,
    GTMSettings,
    HOTjarSettings,
    SocialMediaSettings,
    SiteOrgSettings,
    MediaSettings,
    ModontySettings,
    SettingsJsonLdCache,
    SettingsGeneratedSeo {}

const DEFAULT_SETTINGS: AllSettings = {
  seoTitleMin: 30,
  seoTitleMax: 60,
  seoTitleRestrict: false,
  seoDescriptionMin: 120,
  seoDescriptionMax: 160,
  seoDescriptionRestrict: false,
  twitterTitleMax: 70,
  twitterTitleRestrict: true,
  twitterDescriptionMax: 200,
  twitterDescriptionRestrict: true,
  ogTitleMax: 60,
  ogTitleRestrict: false,
  ogDescriptionMax: 200,
  ogDescriptionRestrict: false,
  gtmContainerId: null,
  gtmEnabled: false,
  hotjarSiteId: null,
  hotjarEnabled: false,
  facebookUrl: null,
  twitterUrl: null,
  linkedInUrl: null,
  instagramUrl: null,
  youtubeUrl: null,
  tiktokUrl: null,
  pinterestUrl: null,
  snapchatUrl: null,
  siteUrl: null,
  siteName: null,
  brandDescription: null,
  siteAuthor: null,
  themeColor: null,
  inLanguage: null,
  defaultMetaRobots: null,
  defaultGooglebot: null,
  defaultOgType: null,
  defaultOgLocale: null,
  defaultOgDeterminer: null,
  defaultTwitterCard: null,
  defaultSitemapPriority: null,
  defaultSitemapChangeFreq: null,
  articleDefaultSitemapChangeFreq: null,
  articleDefaultSitemapPriority: null,
  defaultLicense: null,
  defaultIsAccessibleForFree: true,
  defaultAlternateLanguages: null,
  defaultContentFormat: null,
  defaultCharset: null,
  defaultViewport: null,
  defaultOgImageType: null,
  defaultOgImageWidth: null,
  defaultOgImageHeight: null,
  defaultHreflang: null,
  defaultPathname: null,
  defaultTruncationSuffix: "...",
  defaultReferrerPolicy: null,
  defaultNotranslate: null,
  twitterSite: null,
  twitterCreator: null,
  twitterSiteId: null,
  twitterCreatorId: null,
  orgContactType: null,
  orgContactEmail: null,
  orgContactTelephone: null,
  orgContactAvailableLanguage: null,
  orgContactOption: null,
  orgContactHoursAvailable: null,
  orgAreaServed: null,
  orgStreetAddress: null,
  orgAddressLocality: null,
  orgAddressRegion: null,
  orgAddressCountry: null,
  orgPostalCode: null,
  orgGeoLatitude: null,
  orgGeoLongitude: null,
  orgSearchUrlTemplate: null,
  orgLogoUrl: null,
  logoUrl: null,
  ogImageUrl: null,
  altImage: null,
  modontySeoTitle: null,
  modontySeoDescription: null,
  clientsSeoTitle: null,
  clientsSeoDescription: null,
  categoriesSeoTitle: null,
  categoriesSeoDescription: null,
  trendingSeoTitle: null,
  trendingSeoDescription: null,
  jsonLdStructuredData: null,
  jsonLdLastGenerated: null,
  jsonLdValidationReport: null,
  homeMetaTags: null,
  clientsPageMetaTags: null,
  clientsPageJsonLdStructuredData: null,
  clientsPageJsonLdLastGenerated: null,
  clientsPageJsonLdValidationReport: null,
  categoriesPageMetaTags: null,
  categoriesPageJsonLdStructuredData: null,
  categoriesPageJsonLdLastGenerated: null,
  categoriesPageJsonLdValidationReport: null,
  trendingPageMetaTags: null,
  trendingPageJsonLdStructuredData: null,
  trendingPageJsonLdLastGenerated: null,
  trendingPageJsonLdValidationReport: null,
};

/** Build Organization sameAs array from Settings social URLs (for JSON-LD). Falls back to [] if none set. */
export async function getSameAsFromSettings(): Promise<string[]> {
  const all = await getAllSettings();
  const urls = [
    all.facebookUrl,
    all.instagramUrl,
    all.linkedInUrl,
    all.tiktokUrl,
    all.snapchatUrl,
    all.twitterUrl,
    all.youtubeUrl,
    all.pinterestUrl,
  ]
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((v) => v.trim());
  return [...new Set(urls)];
}

export async function getSEOSettings(): Promise<SEOSettings> {
  const all = await getAllSettings();
  return {
    seoTitleMin: all.seoTitleMin,
    seoTitleMax: all.seoTitleMax,
    seoTitleRestrict: all.seoTitleRestrict,
    seoDescriptionMin: all.seoDescriptionMin,
    seoDescriptionMax: all.seoDescriptionMax,
    seoDescriptionRestrict: all.seoDescriptionRestrict,
    twitterTitleMax: all.twitterTitleMax,
    twitterTitleRestrict: all.twitterTitleRestrict,
    twitterDescriptionMax: all.twitterDescriptionMax,
    twitterDescriptionRestrict: all.twitterDescriptionRestrict,
    ogTitleMax: all.ogTitleMax,
    ogTitleRestrict: all.ogTitleRestrict,
    ogDescriptionMax: all.ogDescriptionMax,
    ogDescriptionRestrict: all.ogDescriptionRestrict,
  };
}

export async function getAllSettings(): Promise<AllSettings> {
  try {
    // Use findFirst for singleton pattern (only one settings record)
    const settings = await db.settings.findFirst();

    if (!settings) {
      // Create default settings if none exist
      const newSettings = await db.settings.create({
        data: DEFAULT_SETTINGS as unknown as Prisma.SettingsCreateInput,
      });
      return {
        seoTitleMin: newSettings.seoTitleMin,
        seoTitleMax: newSettings.seoTitleMax,
        seoTitleRestrict: newSettings.seoTitleRestrict,
        seoDescriptionMin: newSettings.seoDescriptionMin,
        seoDescriptionMax: newSettings.seoDescriptionMax,
        seoDescriptionRestrict: newSettings.seoDescriptionRestrict,
        twitterTitleMax: newSettings.twitterTitleMax,
        twitterTitleRestrict: newSettings.twitterTitleRestrict,
        twitterDescriptionMax: newSettings.twitterDescriptionMax,
        twitterDescriptionRestrict: newSettings.twitterDescriptionRestrict,
        ogTitleMax: newSettings.ogTitleMax,
        ogTitleRestrict: newSettings.ogTitleRestrict,
        ogDescriptionMax: newSettings.ogDescriptionMax,
        ogDescriptionRestrict: newSettings.ogDescriptionRestrict,
        gtmContainerId: newSettings.gtmContainerId,
        gtmEnabled: newSettings.gtmEnabled,
        hotjarSiteId: newSettings.hotjarSiteId,
        hotjarEnabled: newSettings.hotjarEnabled,
        facebookUrl: newSettings.facebookUrl,
        twitterUrl: newSettings.twitterUrl,
        linkedInUrl: newSettings.linkedInUrl,
        instagramUrl: newSettings.instagramUrl,
        youtubeUrl: newSettings.youtubeUrl,
        tiktokUrl: newSettings.tiktokUrl,
        pinterestUrl: newSettings.pinterestUrl,
        snapchatUrl: newSettings.snapchatUrl,
        siteUrl: newSettings.siteUrl,
        siteName: newSettings.siteName,
        brandDescription: newSettings.brandDescription,
        siteAuthor: newSettings.siteAuthor,
        themeColor: newSettings.themeColor,
        inLanguage: newSettings.inLanguage,
        defaultMetaRobots: newSettings.defaultMetaRobots,
        defaultGooglebot: newSettings.defaultGooglebot,
        defaultOgType: newSettings.defaultOgType,
        defaultOgLocale: newSettings.defaultOgLocale,
        defaultOgDeterminer: newSettings.defaultOgDeterminer,
        defaultTwitterCard: newSettings.defaultTwitterCard,
        defaultSitemapPriority: newSettings.defaultSitemapPriority,
        defaultSitemapChangeFreq: newSettings.defaultSitemapChangeFreq,
        articleDefaultSitemapChangeFreq: newSettings.articleDefaultSitemapChangeFreq,
        articleDefaultSitemapPriority: newSettings.articleDefaultSitemapPriority,
        defaultLicense: newSettings.defaultLicense,
        defaultIsAccessibleForFree: newSettings.defaultIsAccessibleForFree ?? true,
        defaultAlternateLanguages: (newSettings as { defaultAlternateLanguages?: unknown }).defaultAlternateLanguages ?? null,
        defaultContentFormat: (newSettings as { defaultContentFormat?: string | null }).defaultContentFormat ?? null,
        defaultCharset: newSettings.defaultCharset,
        defaultViewport: newSettings.defaultViewport,
        defaultOgImageType: newSettings.defaultOgImageType,
        defaultOgImageWidth: newSettings.defaultOgImageWidth,
        defaultOgImageHeight: newSettings.defaultOgImageHeight,
        defaultHreflang: newSettings.defaultHreflang,
        defaultPathname: newSettings.defaultPathname,
        defaultTruncationSuffix: newSettings.defaultTruncationSuffix,
        defaultReferrerPolicy: (newSettings as { defaultReferrerPolicy?: string | null }).defaultReferrerPolicy ?? null,
        defaultNotranslate: (newSettings as { defaultNotranslate?: boolean | null }).defaultNotranslate ?? null,
        twitterSite: newSettings.twitterSite,
        twitterCreator: newSettings.twitterCreator,
        twitterSiteId: newSettings.twitterSiteId,
        twitterCreatorId: newSettings.twitterCreatorId,
        orgContactType: newSettings.orgContactType,
        orgContactEmail: newSettings.orgContactEmail,
        orgContactTelephone: newSettings.orgContactTelephone,
        orgContactAvailableLanguage: (newSettings as { orgContactAvailableLanguage?: string | null }).orgContactAvailableLanguage ?? null,
        orgContactOption: (newSettings as { orgContactOption?: string | null }).orgContactOption ?? null,
        orgContactHoursAvailable: (newSettings as { orgContactHoursAvailable?: string | null }).orgContactHoursAvailable ?? null,
        orgAreaServed: newSettings.orgAreaServed,
        orgStreetAddress: newSettings.orgStreetAddress,
        orgAddressLocality: newSettings.orgAddressLocality,
        orgAddressRegion: newSettings.orgAddressRegion,
        orgAddressCountry: newSettings.orgAddressCountry,
        orgPostalCode: newSettings.orgPostalCode,
        orgGeoLatitude: newSettings.orgGeoLatitude,
        orgGeoLongitude: newSettings.orgGeoLongitude,
        orgSearchUrlTemplate: newSettings.orgSearchUrlTemplate,
        orgLogoUrl: newSettings.orgLogoUrl,
        logoUrl: newSettings.logoUrl,
        ogImageUrl: newSettings.ogImageUrl,
        altImage: newSettings.altImage,
        modontySeoTitle: newSettings.modontySeoTitle,
        modontySeoDescription: newSettings.modontySeoDescription,
        clientsSeoTitle: (newSettings as Record<string, unknown>).clientsSeoTitle as string | null,
        clientsSeoDescription: (newSettings as Record<string, unknown>).clientsSeoDescription as string | null,
        categoriesSeoTitle: (newSettings as Record<string, unknown>).categoriesSeoTitle as string | null,
        categoriesSeoDescription: (newSettings as Record<string, unknown>).categoriesSeoDescription as string | null,
        trendingSeoTitle: (newSettings as Record<string, unknown>).trendingSeoTitle as string | null,
        trendingSeoDescription: (newSettings as Record<string, unknown>).trendingSeoDescription as string | null,
        jsonLdStructuredData: newSettings.jsonLdStructuredData,
        jsonLdLastGenerated: newSettings.jsonLdLastGenerated,
        jsonLdValidationReport: (newSettings.jsonLdValidationReport ?? null) as Record<string, unknown> | null,
        homeMetaTags: ((newSettings as Record<string, unknown>).homeMetaTags ?? null) as Record<string, unknown> | null,
        clientsPageMetaTags: ((newSettings as Record<string, unknown>).clientsPageMetaTags ?? null) as Record<string, unknown> | null,
        clientsPageJsonLdStructuredData: ((newSettings as Record<string, unknown>).clientsPageJsonLdStructuredData ?? null) as string | null,
        clientsPageJsonLdLastGenerated: ((newSettings as Record<string, unknown>).clientsPageJsonLdLastGenerated ?? null) as Date | null,
        clientsPageJsonLdValidationReport: ((newSettings as Record<string, unknown>).clientsPageJsonLdValidationReport ?? null) as Record<string, unknown> | null,
        categoriesPageMetaTags: ((newSettings as Record<string, unknown>).categoriesPageMetaTags ?? null) as Record<string, unknown> | null,
        categoriesPageJsonLdStructuredData: ((newSettings as Record<string, unknown>).categoriesPageJsonLdStructuredData ?? null) as string | null,
        categoriesPageJsonLdLastGenerated: ((newSettings as Record<string, unknown>).categoriesPageJsonLdLastGenerated ?? null) as Date | null,
        categoriesPageJsonLdValidationReport: ((newSettings as Record<string, unknown>).categoriesPageJsonLdValidationReport ?? null) as Record<string, unknown> | null,
        trendingPageMetaTags: ((newSettings as Record<string, unknown>).trendingPageMetaTags ?? null) as Record<string, unknown> | null,
        trendingPageJsonLdStructuredData: ((newSettings as Record<string, unknown>).trendingPageJsonLdStructuredData ?? null) as string | null,
        trendingPageJsonLdLastGenerated: ((newSettings as Record<string, unknown>).trendingPageJsonLdLastGenerated ?? null) as Date | null,
        trendingPageJsonLdValidationReport: ((newSettings as Record<string, unknown>).trendingPageJsonLdValidationReport ?? null) as Record<string, unknown> | null,
      };
    }

    return {
      seoTitleMin: settings.seoTitleMin,
      seoTitleMax: settings.seoTitleMax,
      seoTitleRestrict: settings.seoTitleRestrict,
      seoDescriptionMin: settings.seoDescriptionMin,
      seoDescriptionMax: settings.seoDescriptionMax,
      seoDescriptionRestrict: settings.seoDescriptionRestrict,
      twitterTitleMax: settings.twitterTitleMax,
      twitterTitleRestrict: settings.twitterTitleRestrict,
      twitterDescriptionMax: settings.twitterDescriptionMax,
      twitterDescriptionRestrict: settings.twitterDescriptionRestrict,
      ogTitleMax: settings.ogTitleMax,
      ogTitleRestrict: settings.ogTitleRestrict,
      ogDescriptionMax: settings.ogDescriptionMax,
      ogDescriptionRestrict: settings.ogDescriptionRestrict,
      gtmContainerId: settings.gtmContainerId,
      gtmEnabled: settings.gtmEnabled,
      hotjarSiteId: settings.hotjarSiteId,
      hotjarEnabled: settings.hotjarEnabled,
      facebookUrl: settings.facebookUrl,
      twitterUrl: settings.twitterUrl,
      linkedInUrl: settings.linkedInUrl,
      instagramUrl: settings.instagramUrl,
      youtubeUrl: settings.youtubeUrl,
      tiktokUrl: settings.tiktokUrl,
      pinterestUrl: settings.pinterestUrl,
      snapchatUrl: settings.snapchatUrl,
      siteUrl: settings.siteUrl,
      siteName: settings.siteName,
      brandDescription: settings.brandDescription,
      siteAuthor: settings.siteAuthor,
      themeColor: settings.themeColor,
      inLanguage: settings.inLanguage,
      defaultMetaRobots: settings.defaultMetaRobots,
      defaultGooglebot: settings.defaultGooglebot,
      defaultOgType: settings.defaultOgType,
      defaultOgLocale: settings.defaultOgLocale,
      defaultOgDeterminer: settings.defaultOgDeterminer,
      defaultTwitterCard: settings.defaultTwitterCard,
      defaultSitemapPriority: settings.defaultSitemapPriority,
      defaultSitemapChangeFreq: settings.defaultSitemapChangeFreq,
      articleDefaultSitemapChangeFreq: settings.articleDefaultSitemapChangeFreq,
        articleDefaultSitemapPriority: settings.articleDefaultSitemapPriority,
        defaultLicense: settings.defaultLicense,
        defaultIsAccessibleForFree: (settings as { defaultIsAccessibleForFree?: boolean }).defaultIsAccessibleForFree ?? true,
        defaultAlternateLanguages: (settings as { defaultAlternateLanguages?: unknown }).defaultAlternateLanguages ?? null,
        defaultContentFormat: (settings as { defaultContentFormat?: string | null }).defaultContentFormat ?? null,
        defaultCharset: settings.defaultCharset,
      defaultViewport: settings.defaultViewport,
      defaultOgImageType: settings.defaultOgImageType,
      defaultOgImageWidth: settings.defaultOgImageWidth,
      defaultOgImageHeight: settings.defaultOgImageHeight,
      defaultHreflang: settings.defaultHreflang,
      defaultPathname: settings.defaultPathname,
      defaultTruncationSuffix: settings.defaultTruncationSuffix,
      defaultReferrerPolicy: (settings as { defaultReferrerPolicy?: string | null }).defaultReferrerPolicy ?? null,
      defaultNotranslate: (settings as { defaultNotranslate?: boolean | null }).defaultNotranslate ?? null,
      twitterSite: settings.twitterSite,
      twitterCreator: settings.twitterCreator,
      twitterSiteId: settings.twitterSiteId,
      twitterCreatorId: settings.twitterCreatorId,
      orgContactType: settings.orgContactType,
      orgContactEmail: settings.orgContactEmail,
      orgContactTelephone: settings.orgContactTelephone,
      orgContactAvailableLanguage: (settings as { orgContactAvailableLanguage?: string | null }).orgContactAvailableLanguage ?? null,
      orgContactOption: (settings as { orgContactOption?: string | null }).orgContactOption ?? null,
      orgContactHoursAvailable: (settings as { orgContactHoursAvailable?: string | null }).orgContactHoursAvailable ?? null,
      orgAreaServed: settings.orgAreaServed,
      orgStreetAddress: settings.orgStreetAddress,
      orgAddressLocality: settings.orgAddressLocality,
      orgAddressRegion: settings.orgAddressRegion,
      orgAddressCountry: settings.orgAddressCountry,
      orgPostalCode: settings.orgPostalCode,
      orgGeoLatitude: settings.orgGeoLatitude,
      orgGeoLongitude: settings.orgGeoLongitude,
      orgSearchUrlTemplate: settings.orgSearchUrlTemplate,
      orgLogoUrl: settings.orgLogoUrl,
      logoUrl: settings.logoUrl,
      ogImageUrl: settings.ogImageUrl,
      altImage: settings.altImage,
      modontySeoTitle: settings.modontySeoTitle,
      modontySeoDescription: settings.modontySeoDescription,
      clientsSeoTitle: (settings as Record<string, unknown>).clientsSeoTitle as string | null ?? null,
      clientsSeoDescription: (settings as Record<string, unknown>).clientsSeoDescription as string | null ?? null,
      categoriesSeoTitle: (settings as Record<string, unknown>).categoriesSeoTitle as string | null ?? null,
      categoriesSeoDescription: (settings as Record<string, unknown>).categoriesSeoDescription as string | null ?? null,
      trendingSeoTitle: (settings as Record<string, unknown>).trendingSeoTitle as string | null ?? null,
      trendingSeoDescription: (settings as Record<string, unknown>).trendingSeoDescription as string | null ?? null,
      jsonLdStructuredData: settings.jsonLdStructuredData,
      jsonLdLastGenerated: settings.jsonLdLastGenerated,
      jsonLdValidationReport: (settings.jsonLdValidationReport ?? null) as Record<string, unknown> | null,
      homeMetaTags: ((settings as Record<string, unknown>).homeMetaTags ?? null) as Record<string, unknown> | null,
      clientsPageMetaTags: ((settings as Record<string, unknown>).clientsPageMetaTags ?? null) as Record<string, unknown> | null,
      clientsPageJsonLdStructuredData: ((settings as Record<string, unknown>).clientsPageJsonLdStructuredData ?? null) as string | null,
      clientsPageJsonLdLastGenerated: ((settings as Record<string, unknown>).clientsPageJsonLdLastGenerated ?? null) as Date | null,
      clientsPageJsonLdValidationReport: ((settings as Record<string, unknown>).clientsPageJsonLdValidationReport ?? null) as Record<string, unknown> | null,
      categoriesPageMetaTags: ((settings as Record<string, unknown>).categoriesPageMetaTags ?? null) as Record<string, unknown> | null,
      categoriesPageJsonLdStructuredData: ((settings as Record<string, unknown>).categoriesPageJsonLdStructuredData ?? null) as string | null,
      categoriesPageJsonLdLastGenerated: ((settings as Record<string, unknown>).categoriesPageJsonLdLastGenerated ?? null) as Date | null,
      categoriesPageJsonLdValidationReport: ((settings as Record<string, unknown>).categoriesPageJsonLdValidationReport ?? null) as Record<string, unknown> | null,
      trendingPageMetaTags: ((settings as Record<string, unknown>).trendingPageMetaTags ?? null) as Record<string, unknown> | null,
      trendingPageJsonLdStructuredData: ((settings as Record<string, unknown>).trendingPageJsonLdStructuredData ?? null) as string | null,
      trendingPageJsonLdLastGenerated: ((settings as Record<string, unknown>).trendingPageJsonLdLastGenerated ?? null) as Date | null,
      trendingPageJsonLdValidationReport: ((settings as Record<string, unknown>).trendingPageJsonLdValidationReport ?? null) as Record<string, unknown> | null,
    };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return DEFAULT_SETTINGS;
  }
}

async function ensureSettingsExists(): Promise<string> {
  const existing = await db.settings.findFirst();
  if (existing) return existing.id;
  const created = await db.settings.create({ data: DEFAULT_SETTINGS as unknown as Prisma.SettingsCreateInput });
  return created.id;
}

export async function saveSEOSettings(data: Partial<SEOSettings>): Promise<{ success: boolean; error?: string }> {
  try {
    const id = await ensureSettingsExists();
    await db.settings.update({
      where: { id },
      data: {
        seoTitleMin: data.seoTitleMin,
        seoTitleMax: data.seoTitleMax,
        seoTitleRestrict: data.seoTitleRestrict,
        seoDescriptionMin: data.seoDescriptionMin,
        seoDescriptionMax: data.seoDescriptionMax,
        seoDescriptionRestrict: data.seoDescriptionRestrict,
        twitterTitleMax: data.twitterTitleMax,
        twitterTitleRestrict: data.twitterTitleRestrict,
        twitterDescriptionMax: data.twitterDescriptionMax,
        twitterDescriptionRestrict: data.twitterDescriptionRestrict,
        ogTitleMax: data.ogTitleMax,
        ogTitleRestrict: data.ogTitleRestrict,
        ogDescriptionMax: data.ogDescriptionMax,
        ogDescriptionRestrict: data.ogDescriptionRestrict,
      },
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save SEO settings";
    return { success: false, error: message };
  }
}

export async function saveSiteSettings(data: Partial<Pick<SiteOrgSettings, "siteUrl" | "siteName" | "brandDescription" | "siteAuthor" | "themeColor" | "inLanguage" | "defaultMetaRobots" | "defaultGooglebot" | "defaultOgType" | "defaultOgLocale" | "defaultOgDeterminer" | "defaultTwitterCard" | "defaultSitemapPriority" | "defaultSitemapChangeFreq" | "articleDefaultSitemapChangeFreq" | "articleDefaultSitemapPriority" | "defaultLicense" | "defaultCharset" | "defaultViewport" | "defaultOgImageType" | "defaultOgImageWidth" | "defaultOgImageHeight" | "defaultHreflang" | "defaultPathname" | "defaultTruncationSuffix" | "defaultReferrerPolicy" | "defaultNotranslate" | "twitterSite" | "twitterCreator" | "twitterSiteId" | "twitterCreatorId">>): Promise<{ success: boolean; error?: string }> {
  try {
    const id = await ensureSettingsExists();
    await db.settings.update({
      where: { id },
      data: {
        siteUrl: data.siteUrl,
        siteName: data.siteName,
        brandDescription: data.brandDescription,
        siteAuthor: data.siteAuthor,
        themeColor: data.themeColor,
        inLanguage: data.inLanguage,
        defaultMetaRobots: data.defaultMetaRobots,
        defaultGooglebot: data.defaultGooglebot,
        defaultOgType: data.defaultOgType,
        defaultOgLocale: data.defaultOgLocale,
        defaultOgDeterminer: data.defaultOgDeterminer,
        defaultTwitterCard: data.defaultTwitterCard,
        defaultSitemapPriority: data.defaultSitemapPriority,
        defaultSitemapChangeFreq: data.defaultSitemapChangeFreq,
        articleDefaultSitemapChangeFreq: data.articleDefaultSitemapChangeFreq,
        articleDefaultSitemapPriority: data.articleDefaultSitemapPriority,
        defaultLicense: data.defaultLicense,
        defaultCharset: data.defaultCharset,
        defaultViewport: data.defaultViewport,
        defaultOgImageType: data.defaultOgImageType,
        defaultOgImageWidth: data.defaultOgImageWidth,
        defaultOgImageHeight: data.defaultOgImageHeight,
        defaultHreflang: data.defaultHreflang,
        defaultPathname: data.defaultPathname,
        defaultTruncationSuffix: data.defaultTruncationSuffix,
        defaultReferrerPolicy: data.defaultReferrerPolicy,
        defaultNotranslate: data.defaultNotranslate,
        twitterSite: data.twitterSite,
        twitterCreator: data.twitterCreator,
        twitterSiteId: data.twitterSiteId,
        twitterCreatorId: data.twitterCreatorId,
      },
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save Site settings";
    return { success: false, error: message };
  }
}

export async function saveOrganizationSettings(data: Partial<Omit<SiteOrgSettings, "siteUrl" | "siteName" | "brandDescription" | "siteAuthor" | "themeColor" | "inLanguage" | "defaultMetaRobots" | "defaultGooglebot" | "defaultOgType" | "defaultOgLocale" | "defaultOgDeterminer" | "defaultTwitterCard" | "defaultSitemapPriority" | "defaultSitemapChangeFreq" | "articleDefaultSitemapChangeFreq" | "articleDefaultSitemapPriority" | "defaultLicense" | "defaultCharset" | "defaultViewport" | "defaultOgImageType" | "defaultOgImageWidth" | "defaultOgImageHeight" | "defaultHreflang" | "defaultPathname" | "defaultTruncationSuffix" | "defaultReferrerPolicy" | "defaultNotranslate" | "twitterSite" | "twitterCreator" | "twitterSiteId" | "twitterCreatorId">>): Promise<{ success: boolean; error?: string }> {
  try {
    const id = await ensureSettingsExists();
    await db.settings.update({
      where: { id },
      data: {
        orgContactType: data.orgContactType,
        orgContactEmail: data.orgContactEmail,
        orgContactTelephone: data.orgContactTelephone,
        orgAreaServed: data.orgAreaServed,
        orgStreetAddress: data.orgStreetAddress,
        orgAddressLocality: data.orgAddressLocality,
        orgAddressRegion: data.orgAddressRegion,
        orgAddressCountry: data.orgAddressCountry,
        orgPostalCode: data.orgPostalCode,
        orgGeoLatitude: data.orgGeoLatitude,
        orgGeoLongitude: data.orgGeoLongitude,
        orgSearchUrlTemplate: data.orgSearchUrlTemplate,
        orgLogoUrl: data.orgLogoUrl,
      },
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save Organization settings";
    return { success: false, error: message };
  }
}

export async function saveTrackingSettings(data: Partial<GTMSettings & HOTjarSettings>): Promise<{ success: boolean; error?: string }> {
  try {
    const id = await ensureSettingsExists();
    await db.settings.update({
      where: { id },
      data: {
        gtmContainerId: data.gtmContainerId,
        gtmEnabled: data.gtmEnabled,
        hotjarSiteId: data.hotjarSiteId,
        hotjarEnabled: data.hotjarEnabled,
      },
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save Tracking settings";
    return { success: false, error: message };
  }
}

export async function saveSocialMediaSettings(data: Partial<SocialMediaSettings>): Promise<{ success: boolean; error?: string }> {
  try {
    const id = await ensureSettingsExists();
    await db.settings.update({
      where: { id },
      data: {
        facebookUrl: data.facebookUrl,
        twitterUrl: data.twitterUrl,
        linkedInUrl: data.linkedInUrl,
        instagramUrl: data.instagramUrl,
        youtubeUrl: data.youtubeUrl,
        tiktokUrl: data.tiktokUrl,
        pinterestUrl: data.pinterestUrl,
        snapchatUrl: data.snapchatUrl,
      },
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save Social Media settings";
    return { success: false, error: message };
  }
}

export async function saveMediaSettings(data: Partial<MediaSettings>): Promise<{ success: boolean; error?: string }> {
  try {
    const id = await ensureSettingsExists();
    await db.settings.update({
      where: { id },
      data: {
        logoUrl: data.logoUrl,
        ogImageUrl: data.ogImageUrl,
        altImage: data.altImage,
      },
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save Media settings";
    return { success: false, error: message };
  }
}

export async function saveModontySettings(data: Partial<ModontySettings>): Promise<{ success: boolean; error?: string }> {
  try {
    const id = await ensureSettingsExists();
    await db.settings.update({
      where: { id },
      data: {
        modontySeoTitle: data.modontySeoTitle,
        modontySeoDescription: data.modontySeoDescription,
        clientsSeoTitle: data.clientsSeoTitle,
        clientsSeoDescription: data.clientsSeoDescription,
        categoriesSeoTitle: data.categoriesSeoTitle,
        categoriesSeoDescription: data.categoriesSeoDescription,
        trendingSeoTitle: data.trendingSeoTitle,
        trendingSeoDescription: data.trendingSeoDescription,
      },
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save Modonty settings";
    return { success: false, error: message };
  }
}

export async function updateSEOSettings(data: Partial<SEOSettings>) {
  const all = await getAllSettings();
  return updateAllSettings({ ...all, ...data });
}

export async function updateAllSettings(data: Partial<AllSettings>) {
  try {
    // Check if settings exist
    const existing = await db.settings.findFirst();
    
    let settings;
    if (existing) {
      const id = existing.id;
      await db.settings.update({
        where: { id },
        data: {
          seoTitleMin: data.seoTitleMin,
          seoTitleMax: data.seoTitleMax,
          seoTitleRestrict: data.seoTitleRestrict,
          seoDescriptionMin: data.seoDescriptionMin,
          seoDescriptionMax: data.seoDescriptionMax,
          seoDescriptionRestrict: data.seoDescriptionRestrict,
          twitterTitleMax: data.twitterTitleMax,
          twitterTitleRestrict: data.twitterTitleRestrict,
          twitterDescriptionMax: data.twitterDescriptionMax,
          twitterDescriptionRestrict: data.twitterDescriptionRestrict,
          ogTitleMax: data.ogTitleMax,
          ogTitleRestrict: data.ogTitleRestrict,
          ogDescriptionMax: data.ogDescriptionMax,
          ogDescriptionRestrict: data.ogDescriptionRestrict,
          gtmContainerId: data.gtmContainerId,
          gtmEnabled: data.gtmEnabled,
          hotjarSiteId: data.hotjarSiteId,
          hotjarEnabled: data.hotjarEnabled,
          facebookUrl: data.facebookUrl,
          twitterUrl: data.twitterUrl,
          linkedInUrl: data.linkedInUrl,
          instagramUrl: data.instagramUrl,
          youtubeUrl: data.youtubeUrl,
          tiktokUrl: data.tiktokUrl,
          pinterestUrl: data.pinterestUrl,
          snapchatUrl: data.snapchatUrl,
        },
      });
      settings = await db.settings.update({
        where: { id },
        data: {
          siteUrl: data.siteUrl,
          siteName: data.siteName,
          brandDescription: data.brandDescription,
          siteAuthor: data.siteAuthor,
          themeColor: data.themeColor,
          inLanguage: data.inLanguage,
          defaultMetaRobots: data.defaultMetaRobots,
          defaultGooglebot: data.defaultGooglebot,
          defaultOgType: data.defaultOgType,
          defaultOgLocale: data.defaultOgLocale,
          defaultOgDeterminer: data.defaultOgDeterminer,
          defaultTwitterCard: data.defaultTwitterCard,
          defaultSitemapPriority: data.defaultSitemapPriority,
          defaultSitemapChangeFreq: data.defaultSitemapChangeFreq,
          articleDefaultSitemapChangeFreq: data.articleDefaultSitemapChangeFreq,
          articleDefaultSitemapPriority: data.articleDefaultSitemapPriority,
          defaultLicense: data.defaultLicense,
          defaultCharset: data.defaultCharset,
          defaultViewport: data.defaultViewport,
          defaultOgImageType: data.defaultOgImageType,
          defaultOgImageWidth: data.defaultOgImageWidth,
          defaultOgImageHeight: data.defaultOgImageHeight,
          defaultHreflang: data.defaultHreflang,
          defaultPathname: data.defaultPathname,
          defaultTruncationSuffix: data.defaultTruncationSuffix,
          defaultReferrerPolicy: data.defaultReferrerPolicy,
          defaultNotranslate: data.defaultNotranslate,
          twitterSite: data.twitterSite,
          twitterCreator: data.twitterCreator,
          twitterSiteId: data.twitterSiteId,
          twitterCreatorId: data.twitterCreatorId,
          orgContactType: data.orgContactType,
          orgContactEmail: data.orgContactEmail,
          orgContactTelephone: data.orgContactTelephone,
          orgContactAvailableLanguage: data.orgContactAvailableLanguage,
          orgContactOption: data.orgContactOption,
          orgContactHoursAvailable: data.orgContactHoursAvailable,
          orgAreaServed: data.orgAreaServed,
          orgStreetAddress: data.orgStreetAddress,
          orgAddressLocality: data.orgAddressLocality,
          orgAddressRegion: data.orgAddressRegion,
          orgAddressCountry: data.orgAddressCountry,
          orgPostalCode: data.orgPostalCode,
          orgGeoLatitude: data.orgGeoLatitude,
          orgGeoLongitude: data.orgGeoLongitude,
          orgSearchUrlTemplate: data.orgSearchUrlTemplate,
          orgLogoUrl: data.orgLogoUrl,
          logoUrl: data.logoUrl,
          ogImageUrl: data.ogImageUrl,
          altImage: data.altImage,
          modontySeoTitle: data.modontySeoTitle,
          modontySeoDescription: data.modontySeoDescription,
          clientsSeoTitle: data.clientsSeoTitle,
          clientsSeoDescription: data.clientsSeoDescription,
          categoriesSeoTitle: data.categoriesSeoTitle,
          categoriesSeoDescription: data.categoriesSeoDescription,
          trendingSeoTitle: data.trendingSeoTitle,
          trendingSeoDescription: data.trendingSeoDescription,
          jsonLdStructuredData: data.jsonLdStructuredData,
          jsonLdLastGenerated: data.jsonLdLastGenerated,
          jsonLdValidationReport: data.jsonLdValidationReport as Prisma.InputJsonValue | undefined,
          homeMetaTags: data.homeMetaTags as Prisma.InputJsonValue | undefined,
          clientsPageMetaTags: data.clientsPageMetaTags as Prisma.InputJsonValue | undefined,
          clientsPageJsonLdStructuredData: data.clientsPageJsonLdStructuredData,
          clientsPageJsonLdLastGenerated: data.clientsPageJsonLdLastGenerated,
          clientsPageJsonLdValidationReport: data.clientsPageJsonLdValidationReport as Prisma.InputJsonValue | undefined,
          categoriesPageMetaTags: data.categoriesPageMetaTags as Prisma.InputJsonValue | undefined,
          categoriesPageJsonLdStructuredData: data.categoriesPageJsonLdStructuredData,
          categoriesPageJsonLdLastGenerated: data.categoriesPageJsonLdLastGenerated,
          categoriesPageJsonLdValidationReport: data.categoriesPageJsonLdValidationReport as Prisma.InputJsonValue | undefined,
          trendingPageMetaTags: data.trendingPageMetaTags as Prisma.InputJsonValue | undefined,
          trendingPageJsonLdStructuredData: data.trendingPageJsonLdStructuredData,
          trendingPageJsonLdLastGenerated: data.trendingPageJsonLdLastGenerated,
          trendingPageJsonLdValidationReport: data.trendingPageJsonLdValidationReport as Prisma.InputJsonValue | undefined,
        },
      });
    } else {
      settings = await db.settings.create({
        data: {
          ...DEFAULT_SETTINGS,
          ...data,
          jsonLdValidationReport: (data.jsonLdValidationReport ?? null) as Prisma.InputJsonValue,
          homeMetaTags: (data.homeMetaTags ?? null) as Prisma.InputJsonValue,
          clientsPageMetaTags: (data.clientsPageMetaTags ?? null) as Prisma.InputJsonValue,
          clientsPageJsonLdValidationReport: (data.clientsPageJsonLdValidationReport ?? null) as Prisma.InputJsonValue,
          categoriesPageMetaTags: (data.categoriesPageMetaTags ?? null) as Prisma.InputJsonValue,
          categoriesPageJsonLdValidationReport: (data.categoriesPageJsonLdValidationReport ?? null) as Prisma.InputJsonValue,
          trendingPageMetaTags: (data.trendingPageMetaTags ?? null) as Prisma.InputJsonValue,
          trendingPageJsonLdValidationReport: (data.trendingPageJsonLdValidationReport ?? null) as Prisma.InputJsonValue,
        } as Prisma.SettingsCreateInput,
      });
    }

    revalidatePath("/settings");
    return { success: true, settings };
  } catch (error) {
    console.error("Error updating settings:", error);
    const message = error instanceof Error ? error.message : "Failed to update settings";
    return { success: false, error: message };
  }
}

/** Build site/org payload from .env (NEXT_PUBLIC_*). Used by seed-from-env. */
function siteOrgFromEnv(): Partial<SiteOrgSettings> {
  const lat = process.env.NEXT_PUBLIC_ORG_GEO_LATITUDE;
  const lng = process.env.NEXT_PUBLIC_ORG_GEO_LONGITUDE;
  return {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || null,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || null,
    brandDescription: process.env.NEXT_PUBLIC_BRAND_DESCRIPTION?.trim() || null,
    siteAuthor: process.env.NEXT_PUBLIC_SITE_AUTHOR?.trim() || null,
    themeColor: process.env.NEXT_PUBLIC_THEME_COLOR?.trim() || null,
    inLanguage: process.env.NEXT_PUBLIC_IN_LANGUAGE?.trim() || null,
    defaultMetaRobots: process.env.NEXT_PUBLIC_DEFAULT_META_ROBOTS?.trim() || null,
    defaultGooglebot: process.env.NEXT_PUBLIC_DEFAULT_GOOGLEBOT?.trim() || null,
    defaultOgType: process.env.NEXT_PUBLIC_DEFAULT_OG_TYPE?.trim() || null,
    defaultOgLocale: process.env.NEXT_PUBLIC_DEFAULT_OG_LOCALE?.trim() || null,
    defaultOgDeterminer: process.env.NEXT_PUBLIC_DEFAULT_OG_DETERMINER?.trim() || null,
    defaultTwitterCard: process.env.NEXT_PUBLIC_DEFAULT_TWITTER_CARD?.trim() || null,
    defaultSitemapPriority: process.env.NEXT_PUBLIC_DEFAULT_SITEMAP_PRIORITY != null && process.env.NEXT_PUBLIC_DEFAULT_SITEMAP_PRIORITY !== "" ? Number(process.env.NEXT_PUBLIC_DEFAULT_SITEMAP_PRIORITY) : null,
    defaultSitemapChangeFreq: process.env.NEXT_PUBLIC_DEFAULT_SITEMAP_CHANGE_FREQ?.trim() || null,
    articleDefaultSitemapChangeFreq: process.env.NEXT_PUBLIC_ARTICLE_DEFAULT_SITEMAP_CHANGE_FREQ?.trim() || null,
    articleDefaultSitemapPriority: process.env.NEXT_PUBLIC_ARTICLE_DEFAULT_SITEMAP_PRIORITY != null && process.env.NEXT_PUBLIC_ARTICLE_DEFAULT_SITEMAP_PRIORITY !== "" ? Number(process.env.NEXT_PUBLIC_ARTICLE_DEFAULT_SITEMAP_PRIORITY) : null,
    defaultLicense: process.env.NEXT_PUBLIC_DEFAULT_LICENSE?.trim() || null,
    defaultCharset: process.env.NEXT_PUBLIC_DEFAULT_CHARSET?.trim() || null,
    defaultViewport: process.env.NEXT_PUBLIC_DEFAULT_VIEWPORT?.trim() || null,
    defaultOgImageType: process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE_TYPE?.trim() || null,
    defaultOgImageWidth: process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE_WIDTH != null && process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE_WIDTH !== "" ? Number(process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE_WIDTH) : null,
    defaultOgImageHeight: process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE_HEIGHT != null && process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE_HEIGHT !== "" ? Number(process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE_HEIGHT) : null,
    defaultHreflang: process.env.NEXT_PUBLIC_DEFAULT_HREFLANG?.trim() || null,
    defaultPathname: process.env.NEXT_PUBLIC_DEFAULT_PATHNAME?.trim() || null,
    defaultReferrerPolicy: process.env.NEXT_PUBLIC_DEFAULT_REFERRER_POLICY?.trim() || null,
    defaultNotranslate: process.env.NEXT_PUBLIC_DEFAULT_NOTRANSLATE === "true" ? true : process.env.NEXT_PUBLIC_DEFAULT_NOTRANSLATE === "false" ? false : null,
    twitterSite: process.env.NEXT_PUBLIC_TWITTER_SITE?.trim() || null,
    twitterCreator: process.env.NEXT_PUBLIC_TWITTER_CREATOR?.trim() || null,
    twitterSiteId: process.env.NEXT_PUBLIC_TWITTER_SITE_ID?.trim() || null,
    twitterCreatorId: process.env.NEXT_PUBLIC_TWITTER_CREATOR_ID?.trim() || null,
    orgContactType: process.env.NEXT_PUBLIC_ORG_CONTACT_TYPE?.trim() || null,
    orgContactEmail: process.env.NEXT_PUBLIC_ORG_CONTACT_EMAIL?.trim() || null,
    orgContactTelephone: process.env.NEXT_PUBLIC_ORG_CONTACT_TELEPHONE?.trim() || null,
    orgContactAvailableLanguage: process.env.NEXT_PUBLIC_ORG_CONTACT_AVAILABLE_LANGUAGE?.trim() || null,
    orgContactOption: process.env.NEXT_PUBLIC_ORG_CONTACT_OPTION?.trim() || null,
    orgContactHoursAvailable: process.env.NEXT_PUBLIC_ORG_CONTACT_HOURS_AVAILABLE?.trim() || null,
    orgAreaServed: process.env.NEXT_PUBLIC_ORG_AREA_SERVED?.trim() || null,
    orgStreetAddress: process.env.NEXT_PUBLIC_ORG_STREET_ADDRESS?.trim() || null,
    orgAddressLocality: process.env.NEXT_PUBLIC_ORG_ADDRESS_LOCALITY?.trim() || null,
    orgAddressRegion: process.env.NEXT_PUBLIC_ORG_ADDRESS_REGION?.trim() || null,
    orgAddressCountry: process.env.NEXT_PUBLIC_ORG_ADDRESS_COUNTRY?.trim() || null,
    orgPostalCode: process.env.NEXT_PUBLIC_ORG_POSTAL_CODE?.trim() || null,
    orgGeoLatitude: lat != null && lat !== "" ? Number(lat) : null,
    orgGeoLongitude: lng != null && lng !== "" ? Number(lng) : null,
    orgSearchUrlTemplate: process.env.NEXT_PUBLIC_ORG_SEARCH_URL_TEMPLATE?.trim() || null,
    orgLogoUrl: process.env.NEXT_PUBLIC_ORG_LOGO_URL?.trim() || null,
  };
}

/** Populate Settings site/org fields from .env and save to DB. Does not remove .env. */
export async function seedSiteOrgFromEnv(): Promise<{ success: boolean; error?: string }> {
  try {
    const all = await getAllSettings();
    const fromEnv = siteOrgFromEnv();
    return await updateAllSettings({ ...all, ...fromEnv });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to seed from .env";
    return { success: false, error: message };
  }
}
