import { Metadata } from "next";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { TwoColumnLayout } from "@modonty/shared/components/column-layout/TwoColumnLayout";
import { Suspense } from "react";
import { unstable_rethrow } from "next/navigation";

import { getArticleDefaultsFromSettings } from "@/app/(site)/articles/[slug]/helpers/get-article-defaults-from-settings";
import { getArticlePageData } from "@/app/(site)/articles/[slug]/helpers/get-article-page-data";
import { generateMetadataFromSEO } from "@/lib/seo";
import { normalizeOgImages } from "@/app/(site)/articles/[slug]/helpers/normalize-og-images";
import { IconFolder } from "@/lib/icons";
import { messages } from "@/lib/i18n/messages";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";

import {
  getArticleSlugsForStaticParams,
  getArticleContentBySlug,
} from "./data";

// Reused content components.
import {
  ArticleHeader,
  ArticleFeaturedImage,
  ArticleFooter,
  ReadingProgressBar,
  ArticleCitations,
  ArticleTableOfContents,
} from "./components";
// Client-only wrappers — `ssr: false` is only legal inside a 'use client' file, so each one
// sits beside the component it defers.
import { GtmTrackerLazy } from "./components/gtm-tracker/GtmTrackerLazy";
import { ArticleViewTrackerLazy } from "./components/view-tracker/ViewTrackerLazy";
import { ArticleBodyLinkTrackerLazy } from "./components/body-link-tracker/BodyLinkTrackerLazy";

import { ArticleJsonLd } from "./components/article-json-ld/ArticleJsonLd";
import { ArticleMainColumn } from "./components/article-main-column/ArticleMainColumn";
import { AskModoCard } from "./components/ask-modo-card/AskModoCard";
import { ReaderPartnerCard } from "./components/partner-card/ReaderPartnerCard";
import { PartnerStrip } from "./components/partner-strip/PartnerStrip";
import { Gallery } from "./components/gallery/GalleryLazy";
import { ReadMore } from "./components/read-more/ReadMore";
import { ArticleCtaBar } from "./components/article-cta-bar/ArticleCtaBar";
import { ReaderActions } from "./components/reader-actions/ReaderActions";
import { ReadingTools } from "./components/reading-tools/ReadingToolsLazy";
import { ArticleAudioPlayer } from "./components/audio-player/ArticleAudioPlayerLazy";
import { MobileSection } from "./components/mobile-section/MobileSection";
import { EngagementFab } from "./components/engagement-fab/EngagementFab";
import { PartnerCardMobile } from "./components/partner-card/PartnerCardMobile";
import { ReaderPartnerDetails } from "./components/partner-card/ReaderPartnerDetails";
import { ReaderComments } from "./components/comments/ReaderComments";
import { ReaderFaq } from "./components/faq/ReaderFaq";
import { FEED_ALTERNATE_TYPES } from "@/lib/seo/feed-alternate-types";
import { SITE_URL } from "@/constants";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

// Source of truth: Settings.defaultAlternateLanguages (seeded via /seo Auto-Maintenance hreflang Sync step).
// Entries without `url` default to the article's canonical (Arabic single-source content for all GCC + Egypt).
function buildLanguagesMap(
  alternateLanguages: unknown,
  canonicalUrl: string,
  siteUrl: string,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (Array.isArray(alternateLanguages)) {
    for (const entry of alternateLanguages as Array<{ hreflang?: string; url?: string }>) {
      const key = entry?.hreflang?.trim();
      if (!key) continue;
      const url = entry?.url?.trim();
      out[key] = url
        ? (url.startsWith("http") ? url : `${siteUrl}${url.startsWith("/") ? url : `/${url}`}`)
        : canonicalUrl;
    }
  }
  if (!out["x-default"]) out["x-default"] = canonicalUrl;
  return out;
}

// Vercel Pro Fluid Compute: default function timeout is 10s.
// Cold-start DB connections (Prisma + MongoDB Atlas) can take 6-9s alone.
// 60s gives ample headroom — prevents intermittent 500s that Google flags as "Page fetch failed".
// Set to 60 not 800 to keep cost predictable; observed renders complete in <3s when warm.
export const maxDuration = 60;

export async function generateStaticParams() {
  try {
    const articles = await getArticleSlugsForStaticParams();
    if (!articles || articles.length === 0) {
      // Next.js with Cache Components requires at least one result during build-time.
      // Return a placeholder so the build can complete; the page will render `notFound()` later.
      return [{ slug: "__no_articles__" }];
    }

    return articles.map((article: { slug: string }) => ({
      slug: article.slug,
    }));
  } catch {
    // Same reasoning as above: ensure we always return at least one param for build-time validation.
    return [{ slug: "__no_articles__" }];
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  try {
    const { slug: rawSlug } = await params;
    const slug = decodeURIComponent(rawSlug);

    const [article, articleDefaults] = await Promise.all([
      // Same cached read the page body uses — one DB hit serves both.
      getArticleContentBySlug(slug),
      getArticleDefaultsFromSettings(),
    ]);

    if (!article) {
      return {
        title: "مقال غير موجود",
      };
    }

    if (article.nextjsMetadata) {
      try {
        const stored = article.nextjsMetadata as Metadata;
        if (stored.title) {
          // Always regenerate canonical + hreflang — stored values may be stale/truncated.
          // Source of truth: NEXT_PUBLIC_SITE_URL env (mirror of admin Settings.siteUrl).
          const siteUrl = SITE_URL;
          const canonicalUrl = new URL(`/articles/${slug}`, siteUrl).href;
          // Normalize cached og:image to the recommended 1200×630 (cached metadata may carry
          // an undersized image like 1000×563 with mismatched declared dimensions).
          const storedOg = (stored.openGraph as { images?: unknown } | undefined) ?? undefined;
          const normalizedImages = normalizeOgImages(storedOg?.images);
          const storedTw = (stored.twitter as { images?: unknown } | undefined) ?? undefined;
          const normalizedTwImages = normalizeOgImages(storedTw?.images);
          // Refresh OG dates to match the live JSON-LD (cached OG can carry a stale modified_time
          // → contradicts the article's dateModified). Same source as the generator: real edit → publish.
          const modifiedSource = article.dateModified || article.datePublished || article.updatedAt;
          const ogTimes = {
            ...(article.datePublished && { publishedTime: new Date(article.datePublished).toISOString() }),
            ...(modifiedSource && { modifiedTime: new Date(modifiedSource).toISOString() }),
          };
          return {
            ...stored,
            openGraph: {
              ...(storedOg as object | undefined),
              url: canonicalUrl,
              ...ogTimes,
              ...(normalizedImages && { images: normalizedImages }),
            },
            ...(storedTw && normalizedTwImages && {
              twitter: { ...(storedTw as object), images: normalizedTwImages },
            }),
            alternates: {
              ...(stored.alternates as object | undefined),
              canonical: canonicalUrl,
              languages: buildLanguagesMap(
                articleDefaults.alternateLanguages,
                canonicalUrl,
                siteUrl,
              ),
              types: FEED_ALTERNATE_TYPES,
            },
          };
        }
      } catch {
        // fall through to generation
      }
    }

    const articleForGeneration = article;

    const title = (articleForGeneration.seoTitle || articleForGeneration.title)?.slice(0, 51);
    const description = articleForGeneration.seoDescription || articleForGeneration.excerpt || "";
    const image =
      mediaSrc(articleForGeneration.featuredImage) ||
      mediaSrc(articleForGeneration.client.heroImageMedia) ||
      mediaSrc(articleForGeneration.client.logoMedia) ||
      undefined;
    const imageAlt =
      articleForGeneration.featuredImage?.altText || title || undefined;

    const siteUrl = SITE_URL;

    // Always build canonical from current slug — ignore DB articleForGeneration.canonicalUrl
    // (prevents stale URL when slug was renamed; URL constructor handles percent-encoding)
    const urlForMetadata = `/articles/${slug}`;
    const canonicalUrlFull = new URL(urlForMetadata, siteUrl).href;

    const languages = buildLanguagesMap(
      articleDefaults.alternateLanguages,
      canonicalUrlFull,
      siteUrl,
    );

    // نفس مصدر hreflang، بصياغة أوبن جراف (`ar-SA` ← `ar_SA`)، بلا السوق الأساسي ولا
    // `x-default` — فالأخير ثابت بروتوكول لا سوقاً. إشارةٌ واحدة من عمودٍ واحد.
    const ogLocaleAlternate = Object.keys(languages)
      .filter((code) => code !== "x-default")
      .map((code) => code.replace("-", "_"))
      .filter((code) => code !== articleDefaults.ogLocale);

    return generateMetadataFromSEO({
      title,
      description,
      image,
      imageAlt,
      url: urlForMetadata,
      type: "article",
      siteName: articleDefaults.siteName,
      locale: articleDefaults.ogLocale,
      // كانت `["ar_EG", "en_US"]` مكتوبةً هنا — سوقان يُعلنان لجوجل من الكود، أحدهما
      // بلغة لا ننشر بها. الأسواق تُحرَّر من الأدمن (`Settings.defaultAlternateLanguages`)،
      // وهي نفسها التي تُبنى منها وسوم hreflang أسفل الصفحة، فتتّفق الإشارتان.
      localeAlternate: ogLocaleAlternate,
      publishedTime: articleForGeneration.datePublished || undefined,
      modifiedTime: articleForGeneration.dateModified || articleForGeneration.updatedAt,
      authors: articleForGeneration.author?.name
        ? [articleForGeneration.author.name]
        : undefined,
      section: articleForGeneration.category?.name ?? undefined,
      tags:
        articleForGeneration.tags && articleForGeneration.tags.length > 0
          ? articleForGeneration.tags.map(
              (t: { tag: { name: string } }) => t.tag.name
            )
          : undefined,
      twitterCreator: articleDefaults.twitterCreator || undefined,
      twitterSite: articleDefaults.twitterSite || undefined,
      languages,
    });
  } catch {
    // A transient failure here — a database blip, a slow query — must not be allowed to
    // publish a generic title on a real article URL. The page itself still renders (the
    // body is fetched separately), so turning this into a 404 is the wrong cure: it was
    // tried before and Search Console recorded genuine articles as "not found".
    //
    // `noindex, follow` is the honest state: we could not build this page's identity right
    // now, so do not index THIS render, but keep following its links. The next crawl, once
    // the read succeeds, gets the real metadata and the page returns to the index.
    return {
      title: "مقال",
      robots: { index: false, follow: true },
    };
  }
}

async function ArticlePageContent({ params }: ArticlePageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  try {
    const data = await getArticlePageData(slug);
    const {
      article,
      articleFaqsForJsonLd,
      outline,
      storedCard,
      storedHasFaq,
      buildFallbackArticleJsonLd,
      buildFallbackBreadcrumb,
    } = data;
    // Every string modonty writes itself on this page comes from one file (see lib/i18n).
    const copy = messages.article;

    return (
      <>
        <ArticleJsonLd
          storedCard={storedCard}
          storedHasFaq={storedHasFaq}
          buildFallbackArticleJsonLd={buildFallbackArticleJsonLd}
          buildFallbackBreadcrumb={buildFallbackBreadcrumb}
          faqs={articleFaqsForJsonLd}
        />

        {article.client && (
          <GtmTrackerLazy
            clientContext={{
              client_id: article.client.id,
              client_slug: article.client.slug,
              client_name: article.client.name,
            }}
            articleId={article.id}
            pageTitle={article.seoTitle || article.title}
          />
        )}

        <ArticleViewTrackerLazy articleSlug={article.slug} />

        <ReadingProgressBar />

        <Breadcrumb
          items={[
            { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
            { label: "الشركاء", href: "/clients" },
            { label: article.client.name, href: `/clients/${article.client.slug}` },
            { label: article.title },
          ]}
        />

        {/* The shared two-column shell, not a hand-rolled grid: same container and gaps as
            `/articles`, `/clients` and the homepage. `main` renders first in DOM and lands on
            the visual right in RTL — the reading-start side, which is the point. */}
        {/* The four actions, FIXED under the navbar (Khalid, 19 Aug). Measured: the navbar is
            `sticky top-0`, 57px tall, full width, z-50 — so the tabs pin at 56 to tuck one
            pixel under it and leave no seam, at z-40 so the navbar always wins.
            `fixed` is viewport-relative, so the layer repeats the page container's own centring
            (`max-w-[1128px] mx-auto` + the same padding) and `ms-auto` parks the 300px box on
            the rail's column — otherwise a hard `left` would drift on every other screen width.
            The layer ignores pointer events; only the tabs themselves take them. */}
        <div className="pointer-events-none fixed inset-x-0 top-[56px] z-40 hidden lg:block">
          <div className="container mx-auto max-w-[1128px] px-3 sm:px-4">
            {/* Centred over the rail column, not parked on its edge (Khalid, 19 Aug): the four
                tabs and the card below them read as one stack when they share a centre line. */}
            <div className="pointer-events-auto ms-auto flex w-[300px] justify-center gap-2">
              <Suspense fallback={<div className="h-10 w-full" aria-hidden />}>
                <ReaderActions
                  articleId={article.id}
                  articleSlug={article.slug}
                  clientId={article.clientId}
                  likes={article._count.likes}
                  favorites={article._count.favorites}
                  audioUrl={article.audioUrl}
                  audioDurationSeconds={article.audioDurationSeconds}
                  labels={copy.actions}
                  attached
                />
              </Suspense>
            </div>
          </div>
        </div>

        <TwoColumnLayout
          className="pb-8"
          rail={
            /* SUPPORT RAIL (RTL: left). `self-stretch` so it spans the whole row: the contents
               card inside is `sticky`, and a sticky child can only travel as far as its own
               parent's box. With the rail sized to its content it would unstick after ~1000px
               of a 16,700px article — which is the same defect the strip had. */
            <aside
              className="hidden w-[300px] shrink-0 lg:block lg:self-stretch"
              aria-label="فهرس المقال ومعرض الصور"
            >
              {/* One pinned object, three parts: who stands behind the article · what the reader
                  can do with it · where they are in it. Everything the rail owes a reader while
                  they read, and nothing else. */}
              <div className="sticky top-[120px] z-30 flex flex-col gap-4">
                {/* Below xl the margin is too narrow to stand in (36px at 1200), so the tools
                    stay here; from xl up they move out to the gutter layer below. */}
                <div className="xl:hidden">
                  <ReadingTools labels={copy.tools} />
                </div>
                {article.client && (
                  <PartnerStrip
                    client={article.client}
                    cta={{
                      mode: article.client.ctaMode,
                      label: article.client.ctaLabel,
                      url: article.client.ctaUrl,
                      articleId: article.id,
                      source: "article_card",
                    }}
                  />
                )}
                <ArticleTableOfContents headings={outline.headings} />
              </div>
              {/* The partner card used to sit in this rail — 468px of cover, logo, badge, five
                  social icons and an amber button, first thing on the reading-start side.
                  Eyetracking research on right-rail content is blunt about that shape: people
                  have trained themselves to skip it ("I saw that, but it looked like an ad, so
                  I ignored it"), and the louder the graphics the harder they skip. It moved to
                  where it is actually read — under the article, at the moment the reader has a
                  reason to reach out. The rail keeps only what serves the reading. */}
              {/* The gallery used to sit here, under the pinned contents card — and slid right
                  through it: measured at scroll 500, the card held 56→653 while the gallery
                  entered at 245, a 292px overlap, because a sticky element pins while its next
                  sibling keeps scrolling and paints over it. It was also the second copy (the
                  article column rendered one for phones). One gallery now, in the article flow
                  where the images belong, on every screen. */}
            </aside>
          }
          main={
            <ArticleMainColumn data={data} />
          }
        />
        {/* MOBILE: the same bottom bar every other page uses (Khalid, 21 Aug) — «احجز الآن»
            goes to the partner's page, where the booking form and the tracked WhatsApp button
            already live, and the second door adapts to what the partner has.
            The bar it replaced was built for this page alone and rendered a SECOND full copy of
            the partner card inside a panel — so every phone paid for a 264-line card twice,
            once visible and once waiting on a tap that may never come. */}
        {article.client && (
          <ArticleCtaBar
            clientName={article.client.name}
            clientSlug={article.client.slug}
            articleSlug={article.slug}
            clientPhone={article.client.phone ?? null}
            cta={{
              mode: article.client.ctaMode,
              label: article.client.ctaLabel,
              url: article.client.ctaUrl,
            }}
          />
        )}
      </>
    );
  } catch (err) {
    // Re-throw Next.js navigation signals (notFound/redirect) untouched.
    unstable_rethrow(err);
    // CRITICAL: NEVER fall through to notFound() here.
    // A blanket catch-all that converts every transient error (cold-start DB
    // timeout, settings fetch flake, auth library throw) into 404 caused
    // Google Search Console to mark valid articles as "Not found (404)"
    // during Live Test → de-indexing risk. Instead: log + rethrow so the
    // error boundary (articles/[slug]/error.tsx) renders + Vercel logs see
    // the real cause + Google sees a transient 500 (which it retries).
    console.error(`[articles/${slug}] render failed:`, err);
    throw err;
  }
}

export default function ArticlePage(props: ArticlePageProps) {
  // No Suspense wrapper here: `loading.tsx` is the route's own boundary and Next renders it on
  // navigation already. Wrapping the same skeleton again showed it, cleared it, then showed it a
  // second time before the article appeared.
  return <ArticlePageContent {...props} />;
}
