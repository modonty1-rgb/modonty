import type { Metadata } from "next";

import { buildHreflangLanguages } from "@modonty/shared/lib/seo/build-hreflang-languages";

import { SITE_URL } from "@/constants";
import { getBrandMedia } from "@/lib/settings/get-brand-media";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";
import { FEED_ALTERNATE_TYPES } from "./feed-alternate-types";
import { toShareImage } from "./index";
import { withHonestOpenGraphImageDimensions } from "./open-graph-image-dimensions";

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
  /**
   * نصٌّ يُعرض حين يخلو الصفّ — وهو **مخالفة** لا ميزة: صفحةٌ بلا عنوان في القاعدة كانت
   * تُنشَر بعنوان كتبه الكود، فيبدو البيان مكتملاً ولا يعرف أحد أن الصفّ فارغ.
   *
   * قِيس ٢٨ أغسطس ٢٠٢٦ على `modonty_dev` — ١١ صفّاً: **١١ تحمل عنواناً** (فحذف الاحتياط
   * لا يغيّر شيئاً)، و**٤ بلا وصف** (`contact` · `trust` · `story` · `audio`) — هذه وحدها
   * تفقد وسم الوصف، وجوجل تبني المقتطف من المتن، وهو أصدق من جملةٍ عامّة تتكرّر.
   *
   * كلاهما اختياريّ الآن: مرّرْه فقط حيث يكون النصّ قراراً تحريرياً واعياً.
   */
  fallbackTitle?: string;
  fallbackDescription?: string;
  /**
   * Robots directive to use while the row carries none. Defaults to the Settings default
   * (indexable). `/reels` passes "noindex, nofollow": its feed is closed until it has content,
   * and until someone saves its row, code must not open it by omission.
   */
  fallbackRobots?: string;
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
  { path, fallbackTitle, fallbackDescription, fallbackRobots }: Options,
): Promise<Metadata> {
  // The stored blob is the source of truth: the admin generated it from this row plus every
  // Settings default, so reading it is one property access instead of rebuilding the same
  // object on every request (Khalid, 25 Aug 2026 — every page reads ready-made data).
  const stored = (page as { nextjsMetadata?: unknown } | null)?.nextjsMetadata;
  if (stored && typeof stored === "object" && Object.keys(stored as object).length > 0) {
    return withHonestOpenGraphImageDimensions(stored as Metadata);
  }

  // No blob yet (a page saved before this existed, or never generated): build it here so the
  // page still ships og:, twitter: and robots rather than waiting for someone to press a button.
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
  // ولهذا الغياب هنا **ليس** فراغ بيان: صفحةٌ بلا توجيه تُفهرَس، وهو ما ينصّ عليه معيار
  // الروبوتس نفسه. فالسلسلة تنتهي بنصّ فارغ، والصفحة تُفهرَس كما لو لم يُكتب وسم.
  const robotsDirective = row.metaRobots?.trim() || fallbackRobots || defaults.metaRobots || "";
  const shouldIndex = !robotsDirective.includes("noindex");
  const shouldFollow = !robotsDirective.includes("nofollow");

  const twitter: NonNullable<Metadata["twitter"]> = {
    card: (row.twitterCard?.trim() || defaults.twitterCard) as "summary" | "summary_large_image",
    ...(row.twitterTitle?.trim() || title ? { title: row.twitterTitle?.trim() || title } : {}),
    ...(row.twitterDescription?.trim() || description
      ? { description: row.twitterDescription?.trim() || description }
      : {}),
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
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: {
      canonical: canonicalUrl,
      languages: buildHreflangLanguages(defaults.alternateLanguages, canonicalUrl, SITE_URL),
      types: FEED_ALTERNATE_TYPES,
    },
    openGraph: {
      ...(row.ogTitle?.trim() || title ? { title: row.ogTitle?.trim() || title } : {}),
      ...(row.ogDescription?.trim() || description
        ? { description: row.ogDescription?.trim() || description }
        : {}),
      url: canonicalUrl,
      ...(siteName ? { siteName } : {}),
      ...(locale ? { locale } : {}),
      type: (row.ogType as "website" | "article" | "profile") || "website",
      images: ogImage
        ? [{ ...toShareImage(ogImage), alt: row.socialImageAlt?.trim() || title }]
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
