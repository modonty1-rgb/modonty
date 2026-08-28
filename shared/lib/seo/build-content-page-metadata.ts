import { absoluteUrl } from "./absolute-url";
import { buildHreflangLanguages } from "./build-hreflang-languages";
import { toReferrerPolicy } from "./referrer-policy";
import { tightenGooglebot } from "./tighten-googlebot";

/**
 * The ONE builder for a content page's stored Metadata blob (about, contact, terms, the four
 * legal pages, trust, story, audio, reels).
 *
 * It lives in `shared/` for the same reason `build-listing-page-metadata` does: the admin
 * writes the blob and modonty renders it, so a builder inside either app is a second writer
 * waiting to drift. Every value comes from the page's own row first, then the Settings
 * default, then the literal the caller passes — nothing is invented here.
 */
export interface ContentPageRow {
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

export interface ContentPageMetadataInput {
  row: ContentPageRow | null;
  /** The Settings singleton as a plain record — the defaults every page inherits. */
  settings: Record<string, unknown>;
  siteUrl: string;
  /** Route path used for the canonical when the row carries none, e.g. "/trust". */
  path: string;
  fallbackTitle: string;
  fallbackDescription: string;
  /** Robots directive while the row carries none. Absence means the Settings default. */
  fallbackRobots?: string;
  /** Share image resolved by the caller (brand default), used when the row has none. */
  fallbackOgImage?: string | null;
}

const str = (v: unknown): string | undefined => {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length > 0 ? s : undefined;
};

const handle = (v: unknown): string | undefined => {
  const s = str(v);
  return s ? `@${s.replace(/^@/, "")}` : undefined;
};

export function buildContentPageMetadata(input: ContentPageMetadataInput) {
  const { settings: s, siteUrl, path, fallbackTitle, fallbackDescription } = input;
  const row = input.row ?? {};

  const canonicalUrl = str(row.canonicalUrl) || absoluteUrl(path, siteUrl);
  // التدرّج بين مصادر في القاعدة (صفّ الصفحة ثم الإعدادات) سليم — والاحتياط المكتوب
  // في آخر السلسلة هو المخالفة: يجعل فراغ العمودين معاً غير مرئي إلى الأبد.
  const siteName = str(row.ogSiteName) || str(s.siteName);
  const title = str(row.seoTitle) || str(row.title) || fallbackTitle;
  const description = str(row.seoDescription) || fallbackDescription;
  const locale = str(row.ogLocale) || str(row.inLanguage) || str(s.defaultOgLocale);

  const ogImage =
    str(row.ogImage) || str(row.socialImage) || str(input.fallbackOgImage) || str(s.ogImageUrl);
  const imageAlt = str(row.socialImageAlt) || str(s.altImage) || title;

  // The column stores the directive as written ("index, follow"); absence means indexable.
  const directive =
    str(row.metaRobots) || input.fallbackRobots || str(s.defaultMetaRobots) || "index, follow";
  // May only ADD restrictions, never lift one — see `tightenGooglebot` for Google's wording.
  const googlebot = tightenGooglebot(directive, str(s.defaultGooglebot) || directive);
  const index = !directive.includes("noindex");
  const follow = !directive.includes("nofollow");

  const twitterSite = handle(row.twitterSite) || handle(s.twitterSite);
  const twitterCreator = handle(row.twitterCreator) || handle(s.twitterCreator) || twitterSite;
  const author = str(s.siteAuthor);

  return {
    // No brand suffix here: the root layout's title template already appends "| مدونتي".
    title,
    description,
    ...(author ? { authors: [{ name: author }] } : {}),
    ...(toReferrerPolicy(s.defaultReferrerPolicy)
      ? { referrer: toReferrerPolicy(s.defaultReferrerPolicy) }
      : {}),
    robots: {
      index,
      follow,
      googleBot: {
        index: !googlebot.includes("noindex"),
        follow: !googlebot.includes("nofollow"),
        "max-video-preview": -1,
        "max-image-preview": "large" as const,
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: canonicalUrl,
      languages: buildHreflangLanguages(s.defaultAlternateLanguages, canonicalUrl, siteUrl),
    },
    openGraph: {
      title: str(row.ogTitle) || title,
      description: str(row.ogDescription) || description,
      url: canonicalUrl,
      ...(siteName ? { siteName } : {}),
      ...(locale ? { locale } : {}),
      // `og:type` وصفٌ للكائن لا إعدادُ موقع (ogp.me)، وهذه الصفحات كلّها من نوع واحد.
      type: str(row.ogType) || str(s.defaultOgType) || "website",
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                alt: imageAlt,
                ...(str(s.defaultOgImageType) ? { type: str(s.defaultOgImageType) } : {}),
                // No width/height: a size is declared only where the file was measured.
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: (str(row.twitterCard) || str(s.defaultTwitterCard) || (ogImage ? "summary_large_image" : "summary")) as
        | "summary"
        | "summary_large_image",
      title: str(row.twitterTitle) || title,
      description: str(row.twitterDescription) || description,
      ...(twitterSite ? { site: twitterSite } : {}),
      ...(str(s.twitterSiteId) ? { siteId: str(s.twitterSiteId) } : {}),
      ...(twitterCreator ? { creator: twitterCreator } : {}),
      ...(str(s.twitterCreatorId) ? { creatorId: str(s.twitterCreatorId) } : {}),
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}
