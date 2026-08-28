import { buildHreflangLanguages } from "./build-hreflang-languages";
import { toReferrerPolicy } from "./referrer-policy";
import { tightenGooglebot } from "./tighten-googlebot";

/**
 * The ONE builder for a listing page's stored Metadata blob.
 *
 * Why it lives in `shared/`: the admin writes this blob and modonty renders it, and the
 * home page used to build its own object by hand inside the same generator file. Two
 * writers of one value is exactly how they drifted — measured 2026-08-25 on production:
 * every listing blob carried `alternates: { canonical }` and nothing else, while
 * `Settings.defaultAlternateLanguages` held nine locales that never reached a single page.
 *
 * Every field comes from Settings. Nothing is invented here: a default that is absent is
 * omitted rather than guessed, because a fabricated value is worse than a missing one.
 */
export interface ListingPageMetadataInput {
  /** The Settings singleton, as a plain record. */
  settings: Record<string, unknown>;
  /** Absolute canonical URL of this page. */
  pageUrl: string;
  siteUrl: string;
  /**
   * Optional: these come from the Settings columns and nowhere else. The callers used to
   * pass a literal when the column was empty — text Google reads that the Settings screen
   * could not change. An empty column now ships no tag instead of a sentence from code.
   */
  title?: string;
  description?: string;
  /** Absolute share-image URL, already resolved (crop applied by the caller). */
  ogImage?: string | null;
  ogImageAlt?: string | null;
  /** Declared share-image size — pass ONLY measured values, never a house default. */
  ogImageWidth?: number | null;
  ogImageHeight?: number | null;
}

const str = (v: unknown): string | undefined => {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length > 0 ? s : undefined;
};

const handle = (v: unknown): string | undefined => {
  const s = str(v);
  return s ? `@${s.replace(/^@/, "")}` : undefined;
};

/** Robots directives are stored as written ("index, follow"); absence means indexable. */
function robotsFrom(settings: Record<string, unknown>) {
  const directive = str(settings.defaultMetaRobots) || "index, follow";
  // May only ADD restrictions, never lift one — see `tightenGooglebot` for Google's wording.
  const googlebot = tightenGooglebot(directive, str(settings.defaultGooglebot) || directive);
  const index = !directive.includes("noindex");
  const follow = !directive.includes("nofollow");
  return {
    index,
    follow,
    googleBot: {
      index: !googlebot.includes("noindex"),
      follow: !googlebot.includes("nofollow"),
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  };
}

export function buildListingPageMetadata(input: ListingPageMetadataInput) {
  const { settings: s, pageUrl, siteUrl, title, description } = input;

  const ogImage = str(input.ogImage) || str(s.ogImageUrl);
  const imageAlt = str(input.ogImageAlt) || str(s.altImage) || title;
  const hasMeasuredSize =
    typeof input.ogImageWidth === "number" &&
    typeof input.ogImageHeight === "number" &&
    input.ogImageWidth > 0 &&
    input.ogImageHeight > 0;

  const images = ogImage
    ? [
        {
          url: ogImage,
          alt: imageAlt,
          ...(str(s.defaultOgImageType) ? { type: str(s.defaultOgImageType) } : {}),
          // Dimensions are declared only when the caller measured the actual file.
          ...(hasMeasuredSize ? { width: input.ogImageWidth!, height: input.ogImageHeight! } : {}),
        },
      ]
    : undefined;

  const twitterSite = handle(s.twitterSite);
  const twitterCreator = handle(s.twitterCreator) || twitterSite;
  const author = str(s.siteAuthor);
  // لا احتياط: عمودٌ فارغ يعني وسماً غائباً، لا اسماً كتبه الكود فبدا البيان مكتملاً.
  const siteName = str(s.siteName);

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(author ? { authors: [{ name: author }] } : {}),
    ...(toReferrerPolicy(s.defaultReferrerPolicy)
      ? { referrer: toReferrerPolicy(s.defaultReferrerPolicy) }
      : {}),
    robots: robotsFrom(s),
    alternates: {
      canonical: pageUrl,
      languages: buildHreflangLanguages(s.defaultAlternateLanguages, pageUrl, siteUrl),
    },
    openGraph: {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      url: pageUrl,
      ...(siteName ? { siteName } : {}),
      type: str(s.defaultOgType) || "website",
      ...(str(s.defaultOgLocale) ? { locale: str(s.defaultOgLocale) } : {}),
      ...(str(s.defaultOgDeterminer) ? { determiner: str(s.defaultOgDeterminer) } : {}),
      ...(images ? { images } : {}),
    },
    twitter: {
      card: (str(s.defaultTwitterCard) || (ogImage ? "summary_large_image" : "summary")) as
        | "summary"
        | "summary_large_image",
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(twitterSite ? { site: twitterSite } : {}),
      ...(str(s.twitterSiteId) ? { siteId: str(s.twitterSiteId) } : {}),
      ...(twitterCreator ? { creator: twitterCreator } : {}),
      ...(str(s.twitterCreatorId) ? { creatorId: str(s.twitterCreatorId) } : {}),
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}
