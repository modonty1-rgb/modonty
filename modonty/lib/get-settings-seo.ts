/**
 * Get stored meta + JSON-LD from Settings for a route (home, clients, categories, trending).
 * Used by modonty pages to read generated SEO from DB (PRD Phase 7).
 */

import { db } from "@/lib/db";
import type { Metadata } from "next";

export type RouteForSeo = "home" | "clients" | "categories" | "trending";

interface StoredMeta {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: string;
  openGraph?: {
    title?: string;
    description?: string;
    url?: string;
    siteName?: string;
    locale?: string;
    type?: string;
    images?: Array<{ url?: string; width?: number; height?: number; alt?: string }>;
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
    site?: string;
    creator?: string;
  };
  [key: string]: unknown;
}

function storedMetaToMetadata(meta: StoredMeta | null | undefined): Metadata | null {
  if (!meta || typeof meta !== "object") return null;
  const title = (meta.title as string) || "";
  const description = (meta.description as string) || "";
  const canonical = (meta.canonical as string) || "";
  const robots = (meta.robots as string) || "index, follow";
  const og = meta.openGraph as StoredMeta["openGraph"] | undefined;
  const tw = meta.twitter as StoredMeta["twitter"] | undefined;
  if (!title && !description) return null;

  const metadata: Metadata = {
    title: title || undefined,
    description: description || undefined,
    robots: robots || undefined,
    alternates: canonical ? { canonical } : undefined,
    openGraph: og
      ? {
          title: (og.title as string) || title,
          description: (og.description as string) || description,
          url: (og.url as string) || canonical,
          siteName: (og.siteName as string) || undefined,
          locale: (og.locale as string) || undefined,
          type: (og.type as "website") || "website",
          images: Array.isArray(og.images) && og.images.length
            ? og.images.map((img) => ({
                url: (img?.url as string) || "",
                width: (img?.width as number) || 1200,
                height: (img?.height as number) || 630,
                alt: (img?.alt as string) || title,
              }))
            : undefined,
        }
      : undefined,
    twitter: tw
      ? {
          card: (tw.card as "summary_large_image") || "summary_large_image",
          title: (tw.title as string) || title,
          description: (tw.description as string) || description,
          images: (tw.image as string)
            ? [{ url: tw.image as string }]
            : undefined,
          site: (tw.site as string) || undefined,
          creator: (tw.creator as string) || undefined,
        }
      : undefined,
  };
  return metadata;
}

export interface SettingsSeoForRoute {
  metadata: Metadata | null;
  jsonLd: string | null;
}

export async function getSettingsSeoForRoute(
  route: RouteForSeo
): Promise<SettingsSeoForRoute> {
  try {
    const settings = await db.settings.findFirst();
    if (!settings) return { metadata: null, jsonLd: null };

    const s = settings as Record<string, unknown>;
    let meta: StoredMeta | null = null;
    let jsonLd: string | null = null;

    if (route === "home") {
      meta = (s.homeMetaTags as StoredMeta) ?? null;
      jsonLd = typeof s.jsonLdStructuredData === "string" ? s.jsonLdStructuredData : null;
    } else if (route === "clients") {
      meta = (s.clientsPageMetaTags as StoredMeta) ?? null;
      jsonLd = typeof s.clientsPageJsonLdStructuredData === "string" ? s.clientsPageJsonLdStructuredData : null;
    } else if (route === "categories") {
      meta = (s.categoriesPageMetaTags as StoredMeta) ?? null;
      jsonLd = typeof s.categoriesPageJsonLdStructuredData === "string" ? s.categoriesPageJsonLdStructuredData : null;
    } else if (route === "trending") {
      meta = (s.trendingPageMetaTags as StoredMeta) ?? null;
      jsonLd = typeof s.trendingPageJsonLdStructuredData === "string" ? s.trendingPageJsonLdStructuredData : null;
    }

    const metadata = storedMetaToMetadata(meta);
    return { metadata: metadata ?? null, jsonLd };
  } catch {
    return { metadata: null, jsonLd: null };
  }
}
