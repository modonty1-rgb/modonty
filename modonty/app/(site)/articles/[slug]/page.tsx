import { Metadata } from "next";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { getPlatformDefaultImages } from "@modonty/shared/lib/platform-defaults";
import { TwoColumnLayout } from "@modonty/shared/components/column-layout/TwoColumnLayout";
import { Suspense } from "react";
import { notFound, unstable_rethrow } from "next/navigation";

import { sanitizeHtml } from "@/app/(site)/articles/[slug]/helpers/sanitize-html";
import { readArticleOutline } from "@/app/(site)/articles/[slug]/helpers/read-article-outline";
import { getArticleDefaultsFromSettings } from "@/app/(site)/articles/[slug]/helpers/get-article-defaults-from-settings";
import { getPlatformSocialLinks, getPlatformImageLicensing } from "@/lib/settings/get-platform-social-links";
import {
  generateMetadataFromSEO,
  generateBreadcrumbStructuredData,
  jsonLdHtml,
  jsonLdHtmlFromString,
} from "@/lib/seo";
import { generateArticleStructuredData } from "@/app/(site)/articles/[slug]/helpers/generate-article-structured-data";
import { generateSiteIdentityStructuredData } from "@/app/(site)/articles/[slug]/helpers/generate-site-identity-structured-data";
import { normalizeOgImages } from "@/app/(site)/articles/[slug]/helpers/normalize-og-images";
import { IconFolder } from "@/lib/icons";
import { messages } from "@/lib/i18n/messages";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";

import {
  getArticleSlugsForStaticParams,
  getArticleBySlugMinimal,
  getArticleContentBySlug,
  getArticleFaqs,
  getRelatedArticlesByArticleId,
  getRelatedArticlesByClient,
  getRelatedArticlesByAuthor,
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
        title: "مقال غير موجود - مدونتي",
      };
    }

    if (article.nextjsMetadata) {
      try {
        const stored = article.nextjsMetadata as Metadata;
        if (stored.title) {
          // Always regenerate canonical + hreflang — stored values may be stale/truncated.
          // Source of truth: NEXT_PUBLIC_SITE_URL env (mirror of admin Settings.siteUrl).
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";
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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";

    // Always build canonical from current slug — ignore DB articleForGeneration.canonicalUrl
    // (prevents stale URL when slug was renamed; URL constructor handles percent-encoding)
    const urlForMetadata = `/articles/${slug}`;
    const canonicalUrlFull = new URL(urlForMetadata, siteUrl).href;

    const languages = buildLanguagesMap(
      articleDefaults.alternateLanguages,
      canonicalUrlFull,
      siteUrl,
    );

    return generateMetadataFromSEO({
      title,
      description,
      image,
      imageAlt,
      url: urlForMetadata,
      type: "article",
      siteName: articleDefaults.siteName,
      locale: articleDefaults.ogLocale || "ar_SA",
      localeAlternate: ["ar_EG", "en_US"],
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
    return {
      title: "مقال - مدونتي",
    };
  }
}

async function ArticlePageContent({ params }: ArticlePageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  try {
    // No `auth()` here, deliberately. Next is explicit that touching the session at the top of a
    // route «forces the entire page into dynamic rendering» — and this article is the same bytes
    // for every reader. The five parts that genuinely differ per person read the session inside
    // their own Suspense boundaries below, so the article prerenders and only they stream.
    const [articleDefaults, platformSocialLinks, platformImageLicensing] = await Promise.all([
      getArticleDefaultsFromSettings(),
      getPlatformSocialLinks(),
      getPlatformImageLicensing(),
    ]);

    const articleRaw = await getArticleBySlugMinimal(slug);
    if (!articleRaw) {
      // Archived → 410 handled by proxy.ts (Next.js 16 — proxy runs before page).
      // Reaching here means slug genuinely doesn't exist → 404.
      notFound();
    }
    const article = { ...articleRaw, ...articleDefaults };

    // Fetch FAQs + related articles + pending FAQs server-side
    // → Q&A text + internal links appear in raw HTML (Googlebot + AI engines can read them)
    const [
      articleFaqsForJsonLd,
      relatedArticles,
      moreFromClient,
      moreFromAuthor,
    ] = await Promise.all([
      articleRaw._count.faqs > 0 ? getArticleFaqs(articleRaw.id) : Promise.resolve([]),
      getRelatedArticlesByArticleId(articleRaw.id),
      articleRaw.clientId
        ? getRelatedArticlesByClient(articleRaw.clientId, articleRaw.id)
        : Promise.resolve([]),
      articleRaw.authorId
        ? getRelatedArticlesByAuthor(articleRaw.authorId, articleRaw.id)
        : Promise.resolve([]),
    ]);

    // No featured image → platform default (admin /settings/defaults). Fetched only when
    // actually missing — the common path pays nothing.
    const defaultImages = article.featuredImage ? null : await getPlatformDefaultImages();
    const featuredImage =
      article.featuredImage ??
      (defaultImages?.post
        ? {
            url: defaultImages.post,
            bunnyUrl: defaultImages.post,
            altText: article.title,
            // The resolver returns a url only, so there is no stored blur for this branch.
            blurDataURL: null,
          }
        : null);

    // One pass over the body gives the three things derived from its structure: heading ids,
    // the outline the contents list links to, and the summary box's lines.
    const outline = readArticleOutline(sanitizeHtml(article.content));
    const safeHtml = outline.html;

    // derived
    const galleryImages = (article.gallery ?? [])
      .filter((g) => g.media && mediaSrc(g.media))
      .map((g) => ({
        // The media ROW goes through untouched. Two separate bugs lived in this mapping:
        // it read `.url` and dropped the Bunny copy (2026-07-30), then it resolved to a
        // string and dropped the stored blur (2026-08-07). Neither is possible now — the
        // component receives the row and resolves both itself.
        media: g.media!,
        alt: g.media?.altText || article.title,
        caption: g.media?.caption || g.media?.altText || null,
      }));
    // Every string modonty writes itself on this page comes from one file (see lib/i18n).
    const copy = messages.article;
    const allTags = (article.tags ?? []).map((t) => t.tag).filter(Boolean);
    const visibleTags = allTags.slice(0, 5);
    const extraTags = Math.max(0, allTags.length - visibleTags.length);
    // Was the first three H2s copied verbatim — a box called "أهم النقاط" that asked three
    // questions and answered none, and repeated the contents list word for word. Now it is the
    // first sentence of each of those sections: the answer, not the question.
    const keyPoints = outline.summary;

    // Consolidated "اقرأ أيضاً" — merge the 4 related sources, dedupe, NO cap (Khalid 2026-06-04:
    // "ما في انتهاء" → max internal linking for SEO; pool already bounded by source query takes).
    type RelatedLike = {
      id: string;
      title: string;
      slug: string;
      excerpt: string | null;
      // `bunnyUrl` MUST stay on this type. Narrowing it away silently strips the Bunny copy
      // before `mediaSrc()` ever sees it — the component still calls mediaSrc, gets undefined,
      // and falls back to Cloudinary. tsc is happy either way (2026-07-30).
      featuredImage?: { url: string; bunnyUrl: string | null; blurDataURL: string | null; altText: string | null } | null;
      client?: { name: string } | null;
    };
    const seenReadMore = new Set<string>([article.id]);
    const readMoreItems: {
      id: string;
      title: string;
      slug: string;
      excerpt: string | null;
      // `bunnyUrl` MUST stay on this type. Narrowing it away silently strips the Bunny copy
      // before `mediaSrc()` ever sees it — the component still calls mediaSrc, gets undefined,
      // and falls back to Cloudinary. tsc is happy either way (2026-07-30).
      featuredImage?: { url: string; bunnyUrl: string | null; blurDataURL: string | null; altText: string | null } | null;
      clientName?: string | null;
    }[] = [];
    const collectReadMore = (arr: RelatedLike[] | undefined, fallbackClient?: string | null) => {
      for (const a of arr ?? []) {
        if (!a || seenReadMore.has(a.id)) continue;
        seenReadMore.add(a.id);
        readMoreItems.push({
          id: a.id,
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt ?? null,
          featuredImage: a.featuredImage ?? null,
          clientName: a.client?.name ?? fallbackClient ?? null,
        });
      }
    };
    collectReadMore(article.relatedTo?.map((r) => r.related), article.client?.name);
    collectReadMore(moreFromClient, article.client?.name);
    collectReadMore(moreFromAuthor);
    collectReadMore(relatedArticles);
    // Trimmed to a whole number of rows. The grid is three across, and an uncapped pool left a
    // seventh card alone on the last row — measured 3+3+1.
    const READ_MORE_COLUMNS = 3;
    const readMoreTop = readMoreItems.slice(
      0,
      Math.floor(readMoreItems.length / READ_MORE_COLUMNS) * READ_MORE_COLUMNS || readMoreItems.length
    );

    // The stored knowledge-graph card (admin-generated on publish/update) is the designed
    // model: publisher = the CLIENT, YMYL doctor reviewer, citations. Serve it when present —
    // the live generator below is only the fallback for articles that predate generation.
    // (GEO audit 2026-07-13, القسم ٣ — the rich card was stored but never served.)
    const storedCard = article.jsonLdStructuredData?.trim() || null;
    // The stored @graph carries its own BreadcrumbList + FAQPage nodes — suppress the
    // separate live scripts when serving it, or the same entities ship twice. The live
    // FAQPage still ships when visitor questions were approved AFTER the last regeneration.
    const storedHasFaq = storedCard?.includes('"FAQPage"') ?? false;

    // Live fallback JSON-LD, built ONLY when no stored card exists (see the branch below).
    // Every published article carries a stored card, so on the normal path this never runs —
    // and it is the heaviest builder on the page (three image crops + tags + semantic keywords).
    // No featured image → substitute the platform POST default (already resolved above as
    // `featuredImage`) so Article JSON-LD never ships without `image` — Google Article
    // rich results require it. The default is admin-enforced 1200×630 (/settings/defaults).
    const buildFallbackArticleJsonLd = (): object =>
      generateArticleStructuredData(
        article.featuredImage || !featuredImage
          ? article
          : { ...article, featuredImage: { ...featuredImage, width: 1200, height: 630 } }
      );
    const buildFallbackBreadcrumb = () =>
      generateBreadcrumbStructuredData([
        { name: "الرئيسية", url: "/" },
        { name: "الشركاء", url: "/clients" },
        { name: article.client.name, url: `/clients/${article.client.slug}` },
        { name: article.title, url: `/articles/${article.slug}` },
      ]);
    // Site identity (Modonty Organization + WebSite brand entity) for knowledge-graph + AI/GEO.
    // Always emitted: its @id (/#organization) does not collide with the stored card's
    // nodes (client publisher + /authors/... author).
    const siteIdentityJsonLd = generateSiteIdentityStructuredData({
      sameAs: platformSocialLinks.map((l) => l.href),
      imageLicenseUrl: platformImageLicensing.imageLicenseUrl,
      imageAcquireLicensePageUrl: platformImageLicensing.imageAcquireLicensePageUrl,
      inLanguage: articleDefaults.inLanguage,
    });

    return (
      <>
        {storedCard ? (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtmlFromString(storedCard) }} />
        ) : (
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: jsonLdHtml(buildFallbackArticleJsonLd()) }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: jsonLdHtml(buildFallbackBreadcrumb()) }}
            />
          </>
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(siteIdentityJsonLd) }} />
        {articleFaqsForJsonLd.length > 0 && !storedHasFaq && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: jsonLdHtml({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: articleFaqsForJsonLd.map((f) => ({
                  "@type": "Question",
                  name: f.question,
                  acceptedAnswer: { "@type": "Answer", text: f.answer },
                })),
              }),
            }}
          />
        )}

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
            <div className="w-full min-w-0">
              {/* MOBILE: the same four tabs, sticky under the navbar. Desktop draws them on the
                  contents card in the rail instead — there is no rail on a phone. */}
              {/* MOBILE only: no rail on a phone, so the tabs ride the article column. */}
              {/* The five tabs used to open the page. They now sit under the article, where the
                  actions they offer become possible (Khalid, 21 Aug — mobile refactor).
                  Like, save, comment and share are things a reader does when they have FINISHED;
                  nobody saves an article they have not read. In front of the first sentence they
                  were 55px of the path to the answer and the loudest thing on the screen.
                  «استمع» is a before-reading choice, so it did not follow them down — it moved
                  into the outline bar instead, beside the reading tools. That bar sits exactly
                  where the article starts AND pins while the reader scrolls, so the offer to
                  listen is there at the moment it makes sense and stays reachable after it. */}
              <article>
                <ArticleHeader
                  title={article.title}
                  excerpt={article.excerpt}
                  hasKeyPoints={keyPoints.length > 0}
                  author={article.author}
                  datePublished={article.datePublished}
                  createdAt={article.createdAt}
                  readingTimeMinutes={article.readingTimeMinutes}
                  wordCount={article.wordCount}
                  views={article._count.views}
                  questionsCount={article._count.faqs}
                  reviewer={
                    article.client
                      ? {
                          name: article.client.name,
                          slug: article.client.slug,
                          // `description` first: it is the one field that says what they DO
                          // («علاج آلام العمود الفقري…»). `slogan` is a brand line and on this
                          // partner it reads "Pain cure" — Latin, and it tells a reader nothing
                          // about why this name is worth trusting on this subject.
                          credential:
                            article.client.description?.trim() ||
                            article.client.businessBrief?.trim() ||
                            article.client.slogan?.trim() ||
                            null,
                        }
                      : null
                  }
                />

                {/* MOBILE: client identity (engagement lives in the sticky top bar; conversion in the bottom bar) */}
                {article.client && (
                  <PartnerCardMobile
                    client={article.client}
                    articleId={article.id}
                    labels={copy.partner}
                    // Same field, same order as the header's desktop byline — one merged block
                    // on a phone instead of that line plus this card saying it twice.
                    credential={
                      article.client.description?.trim() ||
                      article.client.businessBrief?.trim() ||
                      article.client.slogan?.trim() ||
                      null
                    }
                    // Only what the row does not already say: their channels, their number,
                    // their site, and asking them about this article. The full card repeated the
                    // logo, name, ✓, city and brief that are two lines above it — and its cover
                    // image was 200px of artwork for a panel the reader opened to find a link.
                    details={
                      <Suspense fallback={<div className="h-11" aria-hidden />}>
                        <ReaderPartnerDetails
                          client={article.client}
                          articleId={article.id}
                          articleTitle={article.title}
                          clientId={article.clientId}
                        />
                      </Suspense>
                    }
                  />
                )}

                {/* The summary sits ABOVE the image, not below it. It is the first thing on the
                    page that answers anything, so it should not wait behind 412 pixels of
                    artwork — the visitor gets the gist in the first screen and reads on by
                    choice. Three sentences, one per opening section. */}
                {keyPoints.length > 0 && (
                  <div className="mb-5 rounded-xl border border-primary/25 bg-primary/5 p-4">
                    <p className="mb-2 text-sm font-bold text-primary">⚡ {copy.summary}</p>
                    <ul className="space-y-1.5 ps-5 text-sm leading-relaxed text-foreground/85 [&>li]:list-disc">
                      {keyPoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* The image carried a second newsletter ask on mobile — a dark scrim over the
                    bottom third with «جديد … في بريدك 🔔 · اشترك الآن ←». Gone with the strip
                    button for the same reason, and the artwork is no longer half-covered. */}
                {featuredImage && (
                  <ArticleFeaturedImage image={featuredImage} title={article.title} />
                )}

                {/* The audio card used to sit here. It scrolled out of reach the moment the
                    reader started reading, and a second <audio> on the page could play over the
                    tab's. The listen tab is the one player now. */}

                {/* MOBILE: the outline bar carries the reading tools (Khalid, 21 Aug) — both
                    belong to the article body and nothing else, so they share one bar instead of
                    the tools standing as a block of their own above the title.
                    It pins at 56, directly under the navbar: it is now the only thing pinned over
                    the article, since the action tabs stopped sticking.
                    Sticky is the whole point — the tools used to sit still while the page moved,
                    so from the middle of an 18,917px article the only way to reach the text size
                    was to scroll all the way back to the top. */}
                <div className="sticky top-[var(--sticky-chrome)] z-30 mt-4 lg:hidden">
                  <ArticleTableOfContents
                    headings={outline.headings}
                    collapsible
                    // Only the listen tab rides the bar now (Khalid, 21 Aug): the text controls
                    // moved into the corner button, where every control the reader owns sits
                    // together and the bar goes back to being an outline with one offer on it.
                    actions={
                      <span className="flex shrink-0 items-center gap-1">
                        <Suspense fallback={<div className="h-11 w-[188px]" aria-hidden />}>
                          <ReaderActions
                            articleId={article.id}
                            articleSlug={article.slug}
                            clientId={article.clientId}
                            likes={article._count.likes}
                            favorites={article._count.favorites}
                            audioUrl={article.audioUrl}
                            audioDurationSeconds={article.audioDurationSeconds}
                            labels={copy.actions}
                            show="engagement"
                            size="compact"
                          />
                        </Suspense>
                        <ArticleAudioPlayer
                          src={article.audioUrl}
                          slug={article.slug}
                          durationSeconds={article.audioDurationSeconds}
                          // Sized to the tools beside it, not to the old 48px tab row.
                          tabClassName="relative flex size-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl text-[9px] font-semibold leading-none shadow-sm transition-transform active:scale-[0.94] motion-reduce:active:scale-100"
                        />
                      </span>
                    }
                  />
                </div>

                {/* The reading tools ride the body, not the page (Khalid, 19 Aug). This wrapper
                    starts where the text starts and ends where it ends, so the icons are simply
                    below the fold until the reader reaches the article, and gone again once it
                    is over — no observer, no state, no client component doing the deciding.
                    `sticky` inside an `absolute` box that spans the body is the whole mechanism.
                    Only from xl, where the margin is wide enough to stand in. */}
                <div className="relative">
                  {/* An overlay the exact height of the article body: the corner button inside it
                      is sticky, so it rides the reading and leaves when the reading ends. */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-end lg:hidden">
                    <EngagementFab label={copy.actions.open} closeLabel={copy.actions.close}>
                  <div className="flex flex-col items-center gap-2">
                    {/* The text controls, in the `bare` column shape they were already built for
                        — the boxed row is 106px wide and this stack is one tab across. */}
                    <div className="rounded-2xl border border-border bg-card p-2 shadow-lg">
                      <ReadingTools bare labels={copy.tools} />
                    </div>
                  </div>
                </EngagementFab>
                  </div>
                  <div className="absolute -start-14 top-0 hidden h-full xl:block" aria-hidden={false}>
                    <div className="sticky top-[150px]">
                      <ReadingTools bare labels={copy.tools} />
                    </div>
                  </div>

                <div
                  id="article-content"
                  // Typography ships lists with `list-style: none`, so an ordered list the
                  // writer created rendered here as plain paragraphs — the reader lost the
                  // sequence and Google got an <ol> with nothing to show. Markers sit in the
                  // inline-start padding, hence `ps-*`: in Arabic the number belongs right.
                  // `68ch`, not the full column: at 732px the line ran ~90 characters, and past
                  // about 75 the eye loses the start of the next line on every return. The
                  // heading, image and summary keep the full width — only the running text is
                  // capped, which is the ordinary editorial shape.
                  className="article-body prose prose-base md:prose-lg mt-6 max-w-[68ch] mb-8 text-right [&_h2]:text-right [&_h3]:text-right [&_h4]:text-right [&_li]:text-right [&_ol]:list-decimal [&_ol]:ps-6 [&_ul]:list-disc [&_ul]:ps-6 [&_li]:my-1"
                  // Leading is the typography plugin's now (config: 1.8, and per-element
                  // values for headings) — an inline 1.6 here would silently outrank it.
                  style={{ direction: "rtl" }}
                  dangerouslySetInnerHTML={{ __html: safeHtml }}
                />
                </div>
                <ArticleBodyLinkTrackerLazy articleId={article.id} />

                {article.citations?.length ? (
                  <div className="mb-8 [&_section]:my-0">
                    <MobileSection title={copy.sections.citations} count={article.citations.length}>
                      <ArticleCitations citations={article.citations} />
                    </MobileSection>
                  </div>
                ) : null}

                {/* First thing after the last sentence: the question. «عندك سؤال عن المقال؟»
                    is never more alive than the second a reader finishes — it used to sit
                    third here, behind tags and comments. */}
                {/* Desktop only (Khalid, 21 Aug): on a phone Modo already sits in the bottom
                    bar, and this card was the same character asking the same question a second
                    time. The bar's Modo now carries the article with it. */}
                <div className="hidden lg:block">
                  <AskModoCard slug={article.slug} />
                </div>

                {/* Then who stands behind it, and how to reach them. The card that was in the
                    rail lands here at full size, where the reader has a reason to act on it.
                    Desktop only since the mobile refactor (Khalid, 21 Aug): on a phone the same
                    card opens from the identity row above, and conversion sits in the bottom bar
                    — three partner blocks in one column was the reader meeting one name three
                    times and reading the third as an ad. */}
                {article.client && (
                  <div className="mb-8 hidden lg:block">
                    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" aria-hidden />}>
                      <ReaderPartnerCard
                        client={article.client}
                        articleId={article.id}
                        articleTitle={article.title}
                        clientId={article.clientId}
                        cta={{ mode: article.client.ctaMode, label: article.client.ctaLabel, url: article.client.ctaUrl }}
                      />
                    </Suspense>
                  </div>
                )}

                {/* Category badge + capped tags — AFTER the article, not before it. Tags are
                    where you go once you have finished reading; in front of the first
                    sentence they are one more block between the visitor and what they came
                    for (measured: the first word of the article sat at y=1081). */}
                {(article.category || visibleTags.length > 0) && (
                  <MobileSection title={copy.sections.tags} count={allTags.length}>
                  <div className="mb-8 flex flex-wrap gap-2">
                    {article.category && (
                      <a
                        href={`/categories/${article.category.slug}`}
                        className="inline-flex max-lg:min-h-11 items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        <IconFolder className="h-3.5 w-3.5" />
                        {article.category.name}
                      </a>
                    )}
                    {visibleTags.map((t) => (
                      <a key={t.id} href={`/tags/${t.slug}`} className="inline-flex max-lg:min-h-11 items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs text-primary">
                        #{t.name}
                      </a>
                    ))}
                    {extraTags > 0 && (
                      <span className="inline-flex max-lg:min-h-11 items-center rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">+{extraTags} {copy.moreTagsSuffix}</span>
                    )}
                    {allTags.length > 0 && (
                      <a href="/tags" className="inline-flex max-lg:min-h-11 items-center rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
                        {copy.allTags}
                      </a>
                    )}
                  </div>
                  </MobileSection>
                )}

                {/* «معرض صور المقال» — one copy, every screen, in the reading flow. */}
                <div className="mb-8">
                  <MobileSection title={copy.sections.gallery} count={galleryImages.length} defaultOpen>
                    <Gallery images={galleryImages} fallbackText={article.client?.description} clientName={article.client?.name} />
                  </MobileSection>
                </div>

                <Suspense fallback={<div className="h-11 rounded-xl bg-muted/40" aria-hidden />}>
                  <ReaderFaq articleId={article.id} faqsCount={article._count.faqs} faqs={articleFaqsForJsonLd} />
                </Suspense>

                <div id="article-comments">
                  <Suspense fallback={<div className="h-11 rounded-xl bg-muted/40" aria-hidden />}>
                    <ReaderComments
                      comments={article.comments}
                      commentsCount={article._count.comments}
                      articleId={article.id}
                      articleSlug={article.slug}
                      sectionTitle={copy.sections.comments}
                    />
                  </Suspense>
                </div>

                {/* CONSOLIDATED: one "اقرأ أيضاً" grid (replaces the 4 repetitive related sections) */}
                <MobileSection title={copy.sections.readMore} count={readMoreTop.length}>
                  <ReadMore articleId={article.id} clientId={article.clientId ?? undefined} items={readMoreTop} />
                </MobileSection>

                {/* The «عن الكاتب» card used to stand on its own above this footer, and repeated
                    what the footer already says — who reviewed it, and when. Khalid, 19 Aug: the
                    publisher belongs IN the footer, as its second column. One block now answers
                    «من كتبه ومن راجعه ومتى», instead of two stacked blocks answering it twice. */}
                <ArticleFooter
                  client={article.client}
                  author={article.author}
                  platformSocialLinks={platformSocialLinks}
                  dateModified={article.dateModified}
                  lastReviewed={article.lastReviewed}
                  contentDepth={article.contentDepth}
                  license={article.license}
                />
              </article>
            </div>
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
