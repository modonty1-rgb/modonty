import type { Metadata } from "next";

import { SITE_URL } from "@/constants";
import { getBrandMedia } from "@/lib/settings/get-brand-media";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";

import { buildHreflangLanguages } from "./build-hreflang-languages";

/** The SEO columns every editable page row exposes. All optional — a row may be half-filled. */
export interface PageSeoRow {
  title?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  metaRobots?: string | null;
  socialImage?: string | null;
  socialImageAlt?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogType?: string | null;
  ogSiteName?: string | null;
  ogLocale?: string | null;
  ogImage?: string | null;
  twitterCard?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterSite?: string | null;
  twitterCreator?: string | null;
  canonicalUrl?: string | null;
  inLanguage?: string | null;
}

interface Options {
  /** Route path used to build the canonical when the row does not carry one, e.g. "/trust". */
  path: string;
  /** Shown when the row is missing or its title is empty — never an empty tag. */
  fallbackTitle: string;
  fallbackDescription: string;
}

/**
 * Turn a stored page row into Next.js Metadata.
 *
 * Seven pages each carried their own sixty-line copy of this, which is how they drifted:
 * one page grew a twitter handle, another did not. New pages call this instead, and the
 * seven can adopt it whenever they are next touched.
 */
export async function buildMetadataFromPageRow(
  page: PageSeoRow | null,
  { path, fallbackTitle, fallbackDescription }: Options,
): Promise<Metadata> {
  // A missing row is an EMPTY row, not a different code path: every field below already
  // falls back, so the page still ships og:, twitter: and robots exactly as before. An
  // early return here would silently drop them until someone filled the form.
  const row: PageSeoRow = page ?? {};

  // The chain is page column → Settings default → literal. The middle link is the one the
  // older pages skipped, which is how Settings could list nine hreflang locales while the
  // pages declared four.
  const [brandMedia, defaults] = await Promise.all([getBrandMedia(), getPageSeoDefaults()]);

  const canonicalUrl = row.canonicalUrl?.trim() || `${SITE_URL}${path}`;
  const siteName = row.ogSiteName?.trim() || defaults.siteName;
  const title = row.seoTitle?.trim() || row.title?.trim() || fallbackTitle;
  const description = row.seoDescription?.trim() || fallbackDescription;
  const locale = row.ogLocale?.trim() || row.inLanguage?.trim() || defaults.ogLocale;

  const ogImage =
    row.ogImage?.trim() || row.socialImage?.trim() || brandMedia.ogImageUrl || undefined;

  // The column stores the directive as written ("index, follow"); absence means indexable.
  const robotsDirective = row.metaRobots?.trim() || defaults.metaRobots;
  const shouldIndex = !robotsDirective.includes("noindex");
  const shouldFollow = !robotsDirective.includes("nofollow");

  const twitter: NonNullable<Metadata["twitter"]> = {
    card: (row.twitterCard?.trim() || defaults.twitterCard) as "summary" | "summary_large_image",
    title: row.twitterTitle?.trim() || title,
    description: row.twitterDescription?.trim() || description,
    images: ogImage ? [ogImage] : undefined,
  };

  const twitterSite = row.twitterSite?.trim() || brandMedia.twitterSite || defaults.twitterSite;
  const twitterCreator =
    row.twitterCreator?.trim() || brandMedia.twitterCreator || defaults.twitterCreator;
  if (twitterSite) twitter.site = twitterSite.startsWith("@") ? twitterSite : `@${twitterSite}`;
  if (twitterCreator) twitter.creator = `@${twitterCreator.replace(/^@/, "")}`;

  return {
    // No brand suffix here: the root layout's title template already appends "| مدونتي"
    // (layout.tsx:35). The seven older pages each append it a second time, so their tags
    // read "… - مدونتي | مدونتي" — measured on /about, 2026-08-15.
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: buildHreflangLanguages(defaults.alternateLanguages, canonicalUrl, SITE_URL),
    },
    openGraph: {
      title: row.ogTitle?.trim() || title,
      description: row.ogDescription?.trim() || description,
      url: canonicalUrl,
      siteName,
      locale,
      type: (row.ogType as "website" | "article" | "profile") || "website",
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: row.socialImageAlt?.trim() || title }]
        : undefined,
    },
    twitter,
    robots: {
      index: shouldIndex,
      follow: shouldFollow,
      googleBot: {
        index: shouldIndex,
        follow: shouldFollow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
