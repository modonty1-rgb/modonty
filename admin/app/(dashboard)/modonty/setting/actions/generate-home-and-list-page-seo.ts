"use server";

import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { getAllSettings, getSameAsFromSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
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
import {
  buildTaxonomyPageJsonLd,
  type TaxonomyItemForJsonLd,
  type TaxonomyPageType,
} from "../helpers/build-taxonomy-page-jsonld";
import { buildFaqPageJsonLd, type FaqForJsonLd } from "../helpers/build-faq-page-jsonld";
import { validateHomeOrListPageJsonLd } from "../helpers/modonty-jsonld-validator";

/** The seven modonty pages that actually exist. `/articles` is deliberately a 404 — see next.config.ts. */
export type PageKey =
  | "home"
  | "clients"
  | "categories"
  | "trending"
  | "faq"
  | "tags"
  | "industries";

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


/** Tag and Industry share the same SEO shape, so one select feeds both taxonomy pages. */
const TAXONOMY_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  seoTitle: true,
  seoDescription: true,
  socialImage: true,
  socialImageAlt: true,
  canonicalUrl: true,
  updatedAt: true,
} as const;

/** Run the three validators and shape the preview result — same contract as the inline branches. */
async function finalizePreview(meta: unknown, jsonLdObj: object): Promise<PreviewSeoResult> {
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
    data: { metaTags: meta, jsonLd: JSON.stringify(jsonLdObj), report, valid, errors },
  };
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
                logoMedia: { select: { url: true, bunnyUrl: true } },
              },
            },
            author: { select: { name: true, slug: true } },
            category: { select: { name: true, slug: true } },
            tags: { select: { tag: { select: { name: true } } } },
            featuredImage: { select: { url: true, bunnyUrl: true } },
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
            logoMedia: { select: { url: true, bunnyUrl: true } },
            heroImageMedia: { select: { url: true, bunnyUrl: true } },
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
        heroImageMedia: c.heroImageMedia,
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
            select: { name: true, slug: true, logoMedia: { select: { url: true, bunnyUrl: true } } },
          },
          author: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
          tags: { select: { tag: { select: { name: true } } } },
          featuredImage: { select: { url: true, bunnyUrl: true } },
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
    } else if (page === "faq") {
      const faqs = await db.fAQ.findMany({
        where: { isActive: true },
        orderBy: { position: "asc" },
        select: {
          question: true,
          answer: true,
          dateCreated: true,
          datePublished: true,
          author: true,
          upvoteCount: true,
          lastReviewed: true,
        },
      });
      const faqsForJsonLd: FaqForJsonLd[] = faqs.map((f) => ({
        question: f.question,
        answer: f.answer,
        dateCreated: f.dateCreated,
        datePublished: f.datePublished,
        author: f.author,
        upvoteCount: f.upvoteCount,
        lastReviewed: f.lastReviewed,
      }));
      const jsonLdObj = buildFaqPageJsonLd(
        settingsWithSameAs as Parameters<typeof buildFaqPageJsonLd>[0],
        faqsForJsonLd
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
    } else if (page === "tags" || page === "industries") {
      const [rows, total] = await Promise.all([
        page === "tags"
          ? db.tag.findMany({ orderBy: { name: "asc" }, take: 20, select: TAXONOMY_SELECT })
          : db.industry.findMany({ orderBy: { name: "asc" }, take: 20, select: TAXONOMY_SELECT }),
        page === "tags" ? db.tag.count() : db.industry.count(),
      ]);
      const maxUpdatedAt = rows.reduce<Date | null>(
        (acc, r) => (!acc || r.updatedAt > acc ? r.updatedAt : acc),
        null
      );
      const items: TaxonomyItemForJsonLd[] = rows.map((r) => ({
        name: r.name,
        slug: r.slug,
        description: r.description,
        seoDescription: r.seoDescription,
        seoTitle: r.seoTitle,
        socialImage: r.socialImage,
        socialImageAlt: r.socialImageAlt,
        canonicalUrl: r.canonicalUrl,
        id: r.id,
      }));
      const jsonLdObj = buildTaxonomyPageJsonLd(
        settingsWithSameAs as Parameters<typeof buildTaxonomyPageJsonLd>[0],
        page as TaxonomyPageType,
        items,
        total,
        maxUpdatedAt ?? new Date()
      );
      return finalizePreview(meta, jsonLdObj);
    } else {
      const jsonLdObj = buildListPageJsonLdFromSettings(
        settingsWithSameAs as Parameters<typeof buildListPageJsonLdFromSettings>[0],
        page as ListPageType
      );
      return finalizePreview(meta, jsonLdObj);
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Preview failed";
    return { success: false, error: message };
  }
}

/**
 * `savePageSeo` and the legacy `generateHomeAndListPageSeo` used to sit here. Both removed
 * 2026-08-02 — they had no live caller, and they wrote `data.metaTags` straight into the
 * Settings meta columns. That value is a flat custom object (`canonical`, `hreflang`,
 * `twitter.image`), while modonty casts those columns to a Next.js `Metadata` with no adapter,
 * so Next silently dropped the canonical and the twitter image on any page written through them.
 *
 * Meta is now built exclusively by `buildListingMetadata` in
 * `admin/lib/seo/listing-page-seo-generator.ts` — the single writer of those columns.
 * `previewPageSeo` above remains the single JSON-LD source and never writes.
 */
