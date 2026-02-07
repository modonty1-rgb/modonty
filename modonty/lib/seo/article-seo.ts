import { db } from "@/lib/db";
import type { Metadata } from "next";

export interface ArticleSeo {
  metadata: Metadata | null;
  jsonLd: string | null;
}

// Read cached Next.js Metadata + JSON-LD for an article by slug.
// Does not build or mutate SEO – it only reads what admin flows cached.
export async function getArticleSeo(slug: string): Promise<ArticleSeo> {
  const article = await db.article.findFirst({
    where: { slug },
    select: {
      nextjsMetadata: true,
      jsonLdStructuredData: true,
    },
  });

  if (!article) {
    return { metadata: null, jsonLd: null };
  }

  const metadata = (article.nextjsMetadata || null) as Metadata | null;
  const rawJsonLd = article.jsonLdStructuredData;
  const jsonLd =
    typeof rawJsonLd === "string" && rawJsonLd.trim().length > 0
      ? rawJsonLd
      : null;

  return { metadata, jsonLd };
}

