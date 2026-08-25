import { mediaSrc } from "@modonty/shared/lib/media-src";
import { buildSiteEntityIds } from "@modonty/shared/lib/seo/site-entity-ids";

import { BRAND_EN, SITE_URL } from "@/constants";

import { buildArticleImageObjects } from "./image-aspect-ratios";

export function generateArticleStructuredData(article: any) {
  const siteUrl = SITE_URL;
  const siteIds = buildSiteEntityIds(siteUrl);
  // Always build from current slug — never trust article.canonicalUrl (may be stale after slug rename)
  const articleUrl = new URL(`/articles/${article.slug}`, siteUrl).href;

  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.seoDescription || article.excerpt || "",
    // Google Article rich results: 3 aspect ratios (1:1, 4:3, 16:9) as ImageObject[]
    // with explicit width/height (richer than bare URLs → better Google Images + AI).
    image: mediaSrc(article.featuredImage)
      ? buildArticleImageObjects(mediaSrc(article.featuredImage) ?? article.featuredImage!.url, 1200, {
          width: article.featuredImage.width,
          height: article.featuredImage.height,
        })
      : undefined,
    datePublished: article.datePublished?.toISOString(),
    // Accurate, not noisy: real edit date → else publish date (NOT updatedAt, which bumps on any
    // DB write and would fake freshness — against Google guidelines). updatedAt only as last resort.
    dateModified: (article.dateModified || article.datePublished || article.updatedAt)?.toISOString(),
    // Author = Modonty (the platform brand). The team/writers change, but the brand is the
    // constant author. Organization type per Google's author best-practices; linked via @id
    // to the #organization entity (logo + url + sameAs) so Google resolves the full identity.
    // url = canonical site (www) — fixes the stale homepage value. Visible byline already
    // shows the same name (schema ↔ visible match, required by Google).
    author: {
      "@type": "Organization",
      "@id": siteIds.organization,
      name: article.author?.name || BRAND_EN,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: article.client.name,
      // Logo as ImageObject — data carries it at client.logoMedia.url (fallback to legacy client.logo)
      ...((mediaSrc(article.client.logoMedia) || article.client.logo) && {
        logo: { "@type": "ImageObject", url: mediaSrc(article.client.logoMedia) || article.client.logo },
      }),
      ...(article.client.url && { url: article.client.url }),
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    ...(article.category && {
      articleSection: article.category.name,
    }),
    ...(article.wordCount && { wordCount: article.wordCount }),
    // keywords = the article's visible tags (matches on-page content → safe enrichment)
    ...(Array.isArray(article.tags) && article.tags.length > 0 && {
      keywords: article.tags.map((t: any) => t?.tag?.name).filter(Boolean),
    }),
    inLanguage: article.inLanguage || "ar",
    isAccessibleForFree: article.isAccessibleForFree ?? true,
    ...(article.license && { license: article.license }),
    // What the page actually gives a reader who needs it. Every term is from the approved W3C
    // "Accessibility Discoverability Vocabulary for Schema.org", and every one is claimed only
    // because the page does it:
    //   displayTransformability — the reader can set the body text size, and the type is sized
    //     in rem/em throughout, which is what the term requires (no absolute px).
    //   tableOfContents + structuralNavigation — the pinned contents list, built from real
    //     headings, so the article can be navigated by structure rather than by scrolling.
    //   readingOrder — one column of prose in source order; nothing is placed out of sequence.
    //   alternativeText — images carry alt text.
    // Honest scope: Google does not rank on these. They are read by accessibility-aware
    // catalogues and aggregators, and they are true — which is the only reason to emit them.
    accessibilityFeature: [
      "displayTransformability",
      "tableOfContents",
      "structuralNavigation",
      "readingOrder",
      "alternativeText",
    ],
    accessibilityHazard: ["noFlashingHazard", "noSoundHazard", "noMotionSimulationHazard"],
  };

  if (article.faqs && article.faqs.length > 0) {
    structuredData.mainEntity = {
      "@type": "FAQPage",
      mainEntity: article.faqs.map((faq: any) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };
  }

  // Inject semanticKeywords (Wikidata entities) as schema.org `mentions`.
  // Each entity references its Wikidata URL via @id + sameAs for disambiguation.
  // Falls back to plain { @type: Thing, name } when no wikidataId/url is set.
  const semantics = Array.isArray(article.semanticKeywords)
    ? (article.semanticKeywords as Array<{ name?: string; wikidataId?: string | null; url?: string | null }>)
    : [];
  const mentionEntities = semantics
    .filter((s) => s && typeof s.name === "string" && s.name.trim().length > 0)
    .map((s) => {
      const wikidataUrl = s.wikidataId
        ? `https://www.wikidata.org/entity/${s.wikidataId}`
        : null;
      const entityId = s.url || wikidataUrl;
      const entity: Record<string, unknown> = {
        "@type": "Thing",
        name: s.name,
      };
      if (entityId) {
        entity["@id"] = entityId;
        entity.sameAs = entityId;
      }
      return entity;
    });
  if (mentionEntities.length > 0) {
    structuredData.mentions = mentionEntities;
  }

  return structuredData;
}
