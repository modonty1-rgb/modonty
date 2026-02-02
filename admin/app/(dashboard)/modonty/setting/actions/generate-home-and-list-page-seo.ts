"use server";

import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { getAllSettings, getSameAsFromSettings, updateAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { getArticleDefaultsFromSettings } from "@/app/(dashboard)/settings/helpers/get-article-defaults-from-settings";
import { buildMetaFromSettingsForPageType, type SettingsForMeta } from "../helpers/build-meta-from-settings";
import {
  buildHomeJsonLdFromSettings,
  buildListPageJsonLdFromSettings,
  type ArticleForHomeJsonLd,
  type ListPageType,
} from "../helpers/build-home-jsonld-from-settings";
import {
  buildClientsPageJsonLd,
  type ClientForClientsPageJsonLd,
} from "../helpers/build-clients-page-jsonld";
import {
  buildCategoriesPageJsonLd,
  type CategoryForCategoriesPageJsonLd,
} from "../helpers/build-categories-page-jsonld";
import { buildTrendingPageJsonLd } from "../helpers/build-trending-page-jsonld";
import { validateHomeOrListPageJsonLd } from "../helpers/modonty-jsonld-validator";

export type PageKey = "home" | "clients" | "categories" | "trending";
export type GeneratePageType = PageKey | "all";

// Preview result (no DB save)
export interface PreviewSeoData {
  metaTags: unknown;
  jsonLd: string;
  report: unknown;
  valid: boolean;
  errors: string[];
}

export interface PreviewSeoResult {
  success: boolean;
  error?: string;
  data?: PreviewSeoData;
}

// Save result
export interface SaveSeoResult {
  success: boolean;
  error?: string;
}

/**
 * Preview SEO data for a single page (no DB save)
 */
export async function previewPageSeo(page: PageKey): Promise<PreviewSeoResult> {
  try {
    const [settings, sameAs] = await Promise.all([getAllSettings(), getSameAsFromSettings()]);
    const settingsWithSameAs = { ...settings, sameAs };

    const meta = buildMetaFromSettingsForPageType(settings as SettingsForMeta, page);

    if (page === "home") {
      const [articles, total] = await Promise.all([
        db.article.findMany({
          where: {
            status: ArticleStatus.PUBLISHED,
            OR: [
              { datePublished: null },
              { datePublished: { lte: new Date() } },
            ],
          },
          include: {
            client: {
              select: {
                name: true,
                slug: true,
                logoMedia: { select: { url: true } },
              },
            },
            author: { select: { name: true, slug: true } },
            category: { select: { name: true, slug: true } },
            tags: { select: { tag: { select: { name: true } } } },
            featuredImage: { select: { url: true } },
          },
          orderBy: { datePublished: "desc" },
          take: 20,
        }),
        db.article.count({
          where: {
            status: ArticleStatus.PUBLISHED,
            OR: [
              { datePublished: null },
              { datePublished: { lte: new Date() } },
            ],
          },
        }),
      ]);

      const articleDefaults = getArticleDefaultsFromSettings(settings);
      const articlesForJsonLd: ArticleForHomeJsonLd[] = articles.map((a) => ({
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        datePublished: a.datePublished,
        dateModified: a.updatedAt,
        wordCount: a.wordCount,
        inLanguage: articleDefaults.inLanguage,
        featuredImage: a.featuredImage,
        client: {
          name: a.client.name,
          slug: a.client.slug,
          logoMedia: a.client.logoMedia,
        },
        author: { name: a.author.name, slug: a.author.slug },
        category: a.category,
        tags: a.tags.map((t) => ({ name: t.tag.name })),
      }));

      const jsonLdObj = buildHomeJsonLdFromSettings(
        settingsWithSameAs as Parameters<typeof buildHomeJsonLdFromSettings>[0],
        articlesForJsonLd,
        total
      );
      const report = await validateHomeOrListPageJsonLd(jsonLdObj);
      const valid =
        report.adobe.valid &&
        report.ajv.valid &&
        report.jsonldJs.valid &&
        report.custom.errors.length === 0;
      const errors = [
        ...report.adobe.errors.map((e) => e.message),
        ...report.ajv.errors,
        ...report.jsonldJs.errors,
        ...report.custom.errors,
      ].filter(Boolean);

      return {
        success: true,
        data: {
          metaTags: meta,
          jsonLd: JSON.stringify(jsonLdObj),
          report,
          valid,
          errors,
        },
      };
    } else if (page === "clients") {
      const [clients, total] = await Promise.all([
        db.client.findMany({
          orderBy: { name: "asc" },
          take: 20,
          include: {
            logoMedia: { select: { url: true } },
            ogImageMedia: { select: { url: true } },
            industry: { select: { name: true } },
            parentOrganization: { select: { slug: true } },
          },
        }),
        db.client.count(),
      ]);
      const maxUpdatedAt = clients.reduce<Date | null>(
        (acc, c) => (!acc || c.updatedAt > acc ? c.updatedAt : acc),
        null
      );
      const clientsForJsonLd: ClientForClientsPageJsonLd[] = clients.map((c) => ({
        name: c.name,
        slug: c.slug,
        legalName: c.legalName,
        alternateName: c.alternateName,
        description: c.description,
        seoDescription: c.seoDescription,
        url: c.url,
        canonicalUrl: c.canonicalUrl,
        logoMedia: c.logoMedia,
        ogImageMedia: c.ogImageMedia,
        sameAs: c.sameAs,
        email: c.email,
        phone: c.phone,
        contactType: c.contactType,
        addressStreet: c.addressStreet,
        addressCity: c.addressCity,
        addressRegion: c.addressRegion,
        addressPostalCode: c.addressPostalCode,
        addressCountry: c.addressCountry,
        addressNeighborhood: c.addressNeighborhood,
        addressBuildingNumber: c.addressBuildingNumber,
        addressAdditionalNumber: c.addressAdditionalNumber,
        addressLatitude: c.addressLatitude,
        addressLongitude: c.addressLongitude,
        foundingDate: c.foundingDate,
        knowsLanguage: c.knowsLanguage,
        vatID: c.vatID,
        taxID: c.taxID,
        slogan: c.slogan,
        keywords: c.keywords,
        numberOfEmployees: c.numberOfEmployees,
        parentOrganizationId: c.parentOrganizationId,
        organizationType: c.organizationType,
        isicV4: c.isicV4,
        commercialRegistrationNumber: c.commercialRegistrationNumber,
        legalForm: c.legalForm,
        industry: c.industry,
        parent: c.parentOrganization ? { slug: c.parentOrganization.slug } : null,
        updatedAt: c.updatedAt,
      }));
      const jsonLdObj = buildClientsPageJsonLd(
        settingsWithSameAs as Parameters<typeof buildClientsPageJsonLd>[0],
        clientsForJsonLd,
        total,
        maxUpdatedAt ?? new Date()
      );
      const report = await validateHomeOrListPageJsonLd(jsonLdObj);
      const valid =
        report.adobe.valid &&
        report.ajv.valid &&
        report.jsonldJs.valid &&
        report.custom.errors.length === 0;
      const errors = [
        ...report.adobe.errors.map((e) => e.message),
        ...report.ajv.errors,
        ...report.jsonldJs.errors,
        ...report.custom.errors,
      ].filter(Boolean);
      return {
        success: true,
        data: {
          metaTags: meta,
          jsonLd: JSON.stringify(jsonLdObj),
          report,
          valid,
          errors,
        },
      };
    } else if (page === "categories") {
      const [categories, total] = await Promise.all([
        db.category.findMany({
          orderBy: { name: "asc" },
          take: 20,
          include: {
            parent: { select: { slug: true } },
          },
        }),
        db.category.count(),
      ]);
      const maxUpdatedAt = categories.reduce<Date | null>(
        (acc, c) => (!acc || c.updatedAt > acc ? c.updatedAt : acc),
        null
      );
      const categoriesForJsonLd: CategoryForCategoriesPageJsonLd[] = categories.map((c) => ({
        name: c.name,
        slug: c.slug,
        description: c.description,
        seoDescription: c.seoDescription,
        seoTitle: c.seoTitle,
        socialImage: c.socialImage,
        socialImageAlt: c.socialImageAlt,
        canonicalUrl: c.canonicalUrl,
        parentId: c.parentId,
        parent: c.parent,
        id: c.id,
        updatedAt: c.updatedAt,
      }));
      const jsonLdObj = buildCategoriesPageJsonLd(
        settingsWithSameAs as Parameters<typeof buildCategoriesPageJsonLd>[0],
        categoriesForJsonLd,
        total,
        maxUpdatedAt ?? new Date()
      );
      const report = await validateHomeOrListPageJsonLd(jsonLdObj);
      const valid =
        report.adobe.valid &&
        report.ajv.valid &&
        report.jsonldJs.valid &&
        report.custom.errors.length === 0;
      const errors = [
        ...report.adobe.errors.map((e) => e.message),
        ...report.ajv.errors,
        ...report.jsonldJs.errors,
        ...report.custom.errors,
      ].filter(Boolean);
      return {
        success: true,
        data: {
          metaTags: meta,
          jsonLd: JSON.stringify(jsonLdObj),
          report,
          valid,
          errors,
        },
      };
    } else if (page === "trending") {
      const timeRange = new Date();
      timeRange.setDate(timeRange.getDate() - 30);
      const articlesRaw = await db.article.findMany({
        where: {
          status: ArticleStatus.PUBLISHED,
          OR: [
            { datePublished: null },
            { datePublished: { lte: new Date() } },
          ],
          createdAt: { gte: timeRange },
        },
        include: {
          client: {
            select: { name: true, slug: true, logoMedia: { select: { url: true } } },
          },
          author: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
          tags: { select: { tag: { select: { name: true } } } },
          featuredImage: { select: { url: true } },
          _count: { select: { views: true, likes: true, comments: true, favorites: true } },
        },
        take: 100,
      });
      const gravity = 1.8;
      const articlesWithScores = articlesRaw.map((a) => {
        const views = a._count?.views ?? 0;
        const likes = a._count?.likes ?? 0;
        const comments = a._count?.comments ?? 0;
        const favorites = a._count?.favorites ?? 0;
        const interactions = views + likes * 2 + comments * 3 + favorites * 2;
        const ageInHours = (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60);
        const score = interactions / Math.pow(ageInHours + 2, gravity);
        return { article: a, score };
      });
      const sorted = articlesWithScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
        .map((x) => x.article);
      const total = await db.article.count({
        where: {
          status: ArticleStatus.PUBLISHED,
          OR: [
            { datePublished: null },
            { datePublished: { lte: new Date() } },
          ],
          createdAt: { gte: timeRange },
        },
      });
      const maxUpdatedAt = sorted.reduce<Date | null>(
        (acc, a) => (!acc || a.updatedAt > acc ? a.updatedAt : acc),
        null
      );
      const articleDefaults = getArticleDefaultsFromSettings(settings);
      const articlesForJsonLd: ArticleForHomeJsonLd[] = sorted.map((a) => ({
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        datePublished: a.datePublished,
        dateModified: a.updatedAt,
        wordCount: a.wordCount,
        inLanguage: articleDefaults.inLanguage,
        featuredImage: a.featuredImage,
        client: {
          name: a.client.name,
          slug: a.client.slug,
          logoMedia: a.client.logoMedia,
        },
        author: { name: a.author.name, slug: a.author.slug },
        category: a.category,
        tags: a.tags.map((t) => ({ name: t.tag.name })),
      }));
      const jsonLdObj = buildTrendingPageJsonLd(
        settingsWithSameAs as Parameters<typeof buildTrendingPageJsonLd>[0],
        articlesForJsonLd,
        total,
        maxUpdatedAt ?? new Date()
      );
      const report = await validateHomeOrListPageJsonLd(jsonLdObj);
      const valid =
        report.adobe.valid &&
        report.ajv.valid &&
        report.jsonldJs.valid &&
        report.custom.errors.length === 0;
      const errors = [
        ...report.adobe.errors.map((e) => e.message),
        ...report.ajv.errors,
        ...report.jsonldJs.errors,
        ...report.custom.errors,
      ].filter(Boolean);
      return {
        success: true,
        data: {
          metaTags: meta,
          jsonLd: JSON.stringify(jsonLdObj),
          report,
          valid,
          errors,
        },
      };
    } else {
      const jsonLdObj = buildListPageJsonLdFromSettings(
        settingsWithSameAs as Parameters<typeof buildListPageJsonLdFromSettings>[0],
        page as ListPageType
      );
      const report = await validateHomeOrListPageJsonLd(jsonLdObj);
      const valid =
        report.adobe.valid &&
        report.ajv.valid &&
        report.jsonldJs.valid &&
        report.custom.errors.length === 0;
      const errors = [
        ...report.adobe.errors.map((e) => e.message),
        ...report.ajv.errors,
        ...report.jsonldJs.errors,
        ...report.custom.errors,
      ].filter(Boolean);
      return {
        success: true,
        data: {
          metaTags: meta,
          jsonLd: JSON.stringify(jsonLdObj),
          report,
          valid,
          errors,
        },
      };
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Preview failed";
    return { success: false, error: message };
  }
}

/**
 * Save preview data to DB for a single page
 */
export async function savePageSeo(
  page: PageKey,
  data: PreviewSeoData
): Promise<SaveSeoResult> {
  try {
    const updates: Record<string, unknown> = {};

    if (page === "home") {
      updates.homeMetaTags = data.metaTags;
      updates.jsonLdStructuredData = data.jsonLd;
      updates.jsonLdLastGenerated = new Date();
      updates.jsonLdValidationReport = data.report;
    } else {
      updates[`${page}PageMetaTags`] = data.metaTags;
      updates[`${page}PageJsonLdStructuredData`] = data.jsonLd;
      updates[`${page}PageJsonLdLastGenerated`] = new Date();
      updates[`${page}PageJsonLdValidationReport`] = data.report;
    }

    const result = await updateAllSettings(updates);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Save failed";
    return { success: false, error: message };
  }
}

// Legacy function for backward compatibility
export interface GenerateHomeAndListPageSeoResult {
  success: boolean;
  error?: string;
  generated?: GeneratePageType[];
  validation?: Record<string, { valid: boolean; errors?: string[] }>;
}

export async function generateHomeAndListPageSeo(
  pageType: GeneratePageType
): Promise<GenerateHomeAndListPageSeoResult> {
  try {
    const toRun: PageKey[] =
      pageType === "all"
        ? ["home", "clients", "categories", "trending"]
        : [pageType as PageKey];

    const validation: Record<string, { valid: boolean; errors?: string[] }> = {};

    for (const page of toRun) {
      const previewResult = await previewPageSeo(page);
      if (!previewResult.success || !previewResult.data) {
        return { success: false, error: previewResult.error, generated: [], validation };
      }

      validation[page] = {
        valid: previewResult.data.valid,
        errors: previewResult.data.errors,
      };

      const saveResult = await savePageSeo(page, previewResult.data);
      if (!saveResult.success) {
        return { success: false, error: saveResult.error, generated: [], validation };
      }
    }

    return { success: true, generated: toRun, validation };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generate failed";
    return { success: false, error: message };
  }
}
