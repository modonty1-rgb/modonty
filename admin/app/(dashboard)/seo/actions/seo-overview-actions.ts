"use server";

import { db } from "@/lib/db";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { generateModontyPageSEO } from "@/app/(dashboard)/modonty/setting/actions/generate-modonty-page-seo";
import { previewPageSeo, savePageSeo, type PageKey } from "@/app/(dashboard)/modonty/setting/actions/generate-home-and-list-page-seo";
import { revalidatePath } from "next/cache";

export interface SeoPageStatus {
  id: string;
  name: string;
  path: string;
  group: "list" | "content";
  hasMetaTags: boolean;
  hasJsonLd: boolean;
  lastGenerated: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

export async function getAllPagesSeoStatus(): Promise<SeoPageStatus[]> {
  const [settings, modontyPages] = await Promise.all([
    getAllSettings(),
    db.modonty.findMany({
      where: {
        slug: { in: ["about", "terms", "user-agreement", "privacy-policy", "cookie-policy", "copyright-policy"] },
      },
      select: {
        slug: true,
        title: true,
        seoTitle: true,
        seoDescription: true,
        metaTags: true,
        jsonLdStructuredData: true,
        jsonLdLastGenerated: true,
      },
    }),
  ]);

  const s = settings as unknown as Record<string, unknown>;

  const listPages: SeoPageStatus[] = [
    {
      id: "home",
      name: "Home",
      path: "/",
      group: "list",
      hasMetaTags: s.homeMetaTags != null,
      hasJsonLd: !!s.jsonLdStructuredData,
      lastGenerated: s.jsonLdLastGenerated ? new Date(s.jsonLdLastGenerated as string).toISOString() : null,
      seoTitle: (s.modontySeoTitle as string) || null,
      seoDescription: (s.modontySeoDescription as string) || null,
    },
    {
      id: "clients",
      name: "Clients",
      path: "/clients",
      group: "list",
      hasMetaTags: s.clientsPageMetaTags != null,
      hasJsonLd: !!s.clientsPageJsonLdStructuredData,
      lastGenerated: s.clientsPageJsonLdLastGenerated ? new Date(s.clientsPageJsonLdLastGenerated as string).toISOString() : null,
      seoTitle: (s.clientsSeoTitle as string) || null,
      seoDescription: (s.clientsSeoDescription as string) || null,
    },
    {
      id: "categories",
      name: "Categories",
      path: "/categories",
      group: "list",
      hasMetaTags: s.categoriesPageMetaTags != null,
      hasJsonLd: !!s.categoriesPageJsonLdStructuredData,
      lastGenerated: s.categoriesPageJsonLdLastGenerated ? new Date(s.categoriesPageJsonLdLastGenerated as string).toISOString() : null,
      seoTitle: (s.categoriesSeoTitle as string) || null,
      seoDescription: (s.categoriesSeoDescription as string) || null,
    },
    {
      id: "trending",
      name: "Trending",
      path: "/trending",
      group: "list",
      hasMetaTags: s.trendingPageMetaTags != null,
      hasJsonLd: !!s.trendingPageJsonLdStructuredData,
      lastGenerated: s.trendingPageJsonLdLastGenerated ? new Date(s.trendingPageJsonLdLastGenerated as string).toISOString() : null,
      seoTitle: (s.trendingSeoTitle as string) || null,
      seoDescription: (s.trendingSeoDescription as string) || null,
    },
    {
      id: "tags",
      name: "Tags",
      path: "/tags",
      group: "list",
      hasMetaTags: s.tagsPageMetaTags != null,
      hasJsonLd: !!s.tagsPageJsonLdStructuredData,
      lastGenerated: s.tagsPageJsonLdLastGenerated ? new Date(s.tagsPageJsonLdLastGenerated as string).toISOString() : null,
      seoTitle: (s.tagsSeoTitle as string) || null,
      seoDescription: (s.tagsSeoDescription as string) || null,
    },
    {
      id: "industries",
      name: "Industries",
      path: "/industries",
      group: "list",
      hasMetaTags: s.industriesPageMetaTags != null,
      hasJsonLd: !!s.industriesPageJsonLdStructuredData,
      lastGenerated: s.industriesPageJsonLdLastGenerated ? new Date(s.industriesPageJsonLdLastGenerated as string).toISOString() : null,
      seoTitle: (s.industriesSeoTitle as string) || null,
      seoDescription: (s.industriesSeoDescription as string) || null,
    },
    {
      id: "articles",
      name: "Articles",
      path: "/articles",
      group: "list",
      hasMetaTags: s.articlesPageMetaTags != null,
      hasJsonLd: !!s.articlesPageJsonLdStructuredData,
      lastGenerated: s.articlesPageJsonLdLastGenerated ? new Date(s.articlesPageJsonLdLastGenerated as string).toISOString() : null,
      seoTitle: (s.articlesSeoTitle as string) || null,
      seoDescription: (s.articlesSeoDescription as string) || null,
    },
    {
      id: "faq",
      name: "FAQ",
      path: "/help/faq",
      group: "list",
      hasMetaTags: s.faqPageMetaTags != null,
      hasJsonLd: !!s.faqPageJsonLdStructuredData,
      lastGenerated: s.faqPageJsonLdLastGenerated ? new Date(s.faqPageJsonLdLastGenerated as string).toISOString() : null,
      seoTitle: (s.faqSeoTitle as string) || null,
      seoDescription: (s.faqSeoDescription as string) || null,
    },
  ];

  const pageLabels: Record<string, { name: string; path: string }> = {
    about: { name: "About", path: "/about" },
    terms: { name: "Terms of Service", path: "/terms" },
    "user-agreement": { name: "User Agreement", path: "/legal/user-agreement" },
    "privacy-policy": { name: "Privacy Policy", path: "/legal/privacy-policy" },
    "cookie-policy": { name: "Cookie Policy", path: "/legal/cookie-policy" },
    "copyright-policy": { name: "Copyright Policy", path: "/legal/copyright-policy" },
  };

  const contentPages: SeoPageStatus[] = modontyPages.map((p) => ({
    id: p.slug,
    name: pageLabels[p.slug]?.name || p.title,
    path: pageLabels[p.slug]?.path || `/${p.slug}`,
    group: "content" as const,
    hasMetaTags: p.metaTags != null,
    hasJsonLd: !!p.jsonLdStructuredData,
    lastGenerated: p.jsonLdLastGenerated ? p.jsonLdLastGenerated.toISOString() : null,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
  }));

  // Ensure all 6 content pages appear even if not in DB yet
  const existingSlugs = new Set(contentPages.map((p) => p.id));
  for (const [slug, info] of Object.entries(pageLabels)) {
    if (!existingSlugs.has(slug)) {
      contentPages.push({
        id: slug,
        name: info.name,
        path: info.path,
        group: "content",
        hasMetaTags: false,
        hasJsonLd: false,
        lastGenerated: null,
        seoTitle: null,
        seoDescription: null,
      });
    }
  }

  return [...listPages, ...contentPages];
}

export async function regenerateContentPageSeo(slug: string) {
  const result = await generateModontyPageSEO(slug);
  revalidatePath("/seo-overview", "page");
  return result;
}

const LIST_PAGE_KEYS: PageKey[] = ["home", "clients", "categories", "trending", "faq"];

export async function regenerateListPageSeo(pageId: string) {
  if (!LIST_PAGE_KEYS.includes(pageId as PageKey)) {
    return { success: false, error: `${pageId.charAt(0).toUpperCase() + pageId.slice(1)} page SEO generator is under development — will be available in next update` };
  }
  try {
    const preview = await previewPageSeo(pageId as PageKey);
    if (!preview.success || !preview.data) {
      return { success: false, error: preview.error || "Preview generation failed" };
    }
    const result = await savePageSeo(pageId as PageKey, preview.data);
    revalidatePath("/seo-overview", "page");
    return result;
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}
