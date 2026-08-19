import { Metadata } from "next";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { getPlatformDefaultImages } from "@modonty/shared/lib/platform-defaults";
import { StickyRail } from "@modonty/shared/components/sticky-rail/StickyRail";
import { Suspense } from "react";
import { notFound, unstable_rethrow } from "next/navigation";

import { auth } from "@/lib/auth";
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
import { getPendingFaqsForCurrentUser } from "./data/get-pending-faqs-for-current-user";

// Reused content components.
import {
  ArticleHeader,
  ArticleFeaturedImage,
  ArticleFaq,
  ArticleFooter,
  ArticleComments,
  ReadingProgressBar,
  ArticleCitations,
  ArticleTableOfContents,
  ArticleAuthorBio,
} from "./components";
// Client-only wrappers — `ssr: false` is only legal inside a 'use client' file, so each one
// sits beside the component it defers.
import { GtmTrackerLazy } from "./components/gtm-tracker/GtmTrackerLazy";
import { ArticleViewTrackerLazy } from "./components/view-tracker/ViewTrackerLazy";
import { ArticleBodyLinkTrackerLazy } from "./components/body-link-tracker/BodyLinkTrackerLazy";

import { AskModoCard } from "./components/ask-modo-card/AskModoCard";
import { PartnerCard } from "./components/partner-card/PartnerCard";
import { Gallery } from "./components/gallery/Gallery";
import { ReadMore } from "./components/read-more/ReadMore";
import { BottomDock } from "./components/bottom-dock/BottomDock";
import { ArticleTopEngagementBar } from "./components/top-engagement-bar/TopEngagementBar";
import { PartnerCardMobile } from "./components/partner-card/PartnerCardMobile";
import ArticleLoading from "./loading";

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
    const [session, articleDefaults, platformSocialLinks, platformImageLicensing] = await Promise.all([
      auth(),
      getArticleDefaultsFromSettings(),
      getPlatformSocialLinks(),
      getPlatformImageLicensing(),
    ]);
    const userId = session?.user?.id;

    const articleRaw = await getArticleBySlugMinimal(slug, userId);
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
      pendingFaqs,
    ] = await Promise.all([
      articleRaw._count.faqs > 0 ? getArticleFaqs(articleRaw.id) : Promise.resolve([]),
      getRelatedArticlesByArticleId(articleRaw.id),
      articleRaw.clientId
        ? getRelatedArticlesByClient(articleRaw.clientId, articleRaw.id)
        : Promise.resolve([]),
      articleRaw.authorId
        ? getRelatedArticlesByAuthor(articleRaw.authorId, articleRaw.id)
        : Promise.resolve([]),
      userId ? getPendingFaqsForCurrentUser(articleRaw.id) : Promise.resolve([]),
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

    const userBox = session?.user
      ? { name: session.user.name ?? null, email: session.user.email ?? null }
      : null;
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

        <div className="container mx-auto max-w-[1128px] px-4 py-6 pb-8 sm:px-6 md:py-8 lg:px-8">
          {/* The article takes the reading-start side. In Arabic the eye lands top-right, and
              that corner used to hold the sponsor card — «سجّل مجاناً», like/save, then two
              partner buttons — while the title and the text sat off to the left. The rail is
              support, so it moves to the far side. DOM order follows: the article is first. */}
          <div className="flex flex-col gap-6 md:gap-8 lg:grid lg:grid-cols-[1fr_300px] lg:items-start">

            {/* SUPPORT RAIL (RTL: left): engagement strip + client card + TOC + gallery.
                StickyRail, not a plain `sticky top-14`: this rail is TALLER than the
                viewport (966px against 889px, and 1466px with the contents open), so a
                fixed top pins its head and puts its tail — the gallery — permanently out
                of reach. The rail scrolls with the page until its bottom meets the fold. */}
            <StickyRail
              label="العميل والتفاعل"
              offset={56}
              className="hidden self-start lg:order-2 lg:sticky lg:block"
            >
              <div className="flex flex-col gap-6">
                {/* The engagement strip used to sit here too — a second copy of the same four
                    actions, and the copy that scrolled away. One strip now, sticky above the
                    article on every screen. */}
                {/* The partner card used to sit here — 468px of cover, logo, badge, five social
                    icons and an amber button, first thing on the reading-start side. Eyetracking
                    research on right-rail content is blunt about that shape: people have trained
                    themselves to skip it ("I saw that, but it looked like an ad, so I ignored
                    it"), and the louder the graphics the harder they skip. So it moved to where
                    it is actually read — under the article, at the moment the reader has a
                    reason to reach out. The rail keeps only what serves the reading. */}
                <ArticleTableOfContents headings={outline.headings} />
                <Gallery images={galleryImages} fallbackText={article.client?.description} clientName={article.client?.name} />
              </div>
            </StickyRail>

            {/* THE ARTICLE — first track, which in RTL is the right-hand side */}
            <div className="w-full min-w-0 lg:order-1">
              {/* The engagement bar, sticky under the navbar (h-14) — on every screen now.
                  It used to live at the top of the rail on desktop, and the rail is taller
                  than the viewport, so StickyRail pushes it 376px up to keep the rail's
                  bottom on the fold: measured on a 16,700px article, like/save/comment/share
                  were reachable in the FIRST SCREEN ONLY and gone for the rest of the read.
                  Full-bleed on phones, aligned to the reading column from lg. */}
              <div className="sticky top-14 z-30 -mx-4 mb-3 shadow-sm sm:-mx-6 lg:mx-0">
                <ArticleTopEngagementBar
                  likes={article._count.likes}
                  favorites={article._count.favorites}
                  userLiked={article.userLiked}
                  userFavorited={article.userFavorited}
                  articleId={article.id}
                  articleSlug={article.slug}
                  userId={userId}
                  clientId={article.clientId}
                />
              </div>
              <article>
                <ArticleHeader
                  title={article.title}
                  excerpt={article.excerpt}
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
                  <PartnerCardMobile client={article.client} articleId={article.id} />
                )}

                {/* The summary sits ABOVE the image, not below it. It is the first thing on the
                    page that answers anything, so it should not wait behind 412 pixels of
                    artwork — the visitor gets the gist in the first screen and reads on by
                    choice. Three sentences, one per opening section. */}
                {keyPoints.length > 0 && (
                  <div className="mb-5 rounded-xl border border-primary/25 bg-primary/5 p-4">
                    <p className="mb-2 text-sm font-bold text-primary">⚡ باختصار</p>
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

                {article.audioUrl && (
                  <div className="my-4 rounded-lg border border-border bg-muted/30 p-3">
                    <span className="mb-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      🎧 نسخة صوتية
                    </span>
                    <audio controls src={article.audioUrl} className="h-10 w-full" preload="none" />
                  </div>
                )}

                {/* MOBILE: collapsible table of contents */}
                <div className="mt-4 lg:hidden">
                  <ArticleTableOfContents headings={outline.headings} collapsible />
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
                <ArticleBodyLinkTrackerLazy articleId={article.id} />

                {article.citations?.length ? (
                  <div className="mb-8 [&_section]:my-0">
                    <ArticleCitations citations={article.citations} />
                  </div>
                ) : null}

                {/* First thing after the last sentence: the question. «عندك سؤال عن المقال؟»
                    is never more alive than the second a reader finishes — it used to sit
                    third here, behind tags and comments. */}
                <AskModoCard slug={article.slug} />

                {/* Then who stands behind it, and how to reach them. The card that was in the
                    rail lands here at full size, where the reader has a reason to act on it. */}
                {article.client && (
                  <div className="mb-8">
                    <PartnerCard
                      client={article.client}
                      askClientProps={{
                        articleId: article.id,
                        clientId: article.clientId,
                        articleTitle: article.title,
                        user: userBox,
                        pendingFaqs,
                      }}
                      cta={{
                        mode: article.client.ctaMode,
                        label: article.client.ctaLabel,
                        url: article.client.ctaUrl,
                        articleId: article.id,
                        source: "article_card",
                        user: userBox,
                      }}
                    />
                  </div>
                )}

                {/* Category badge + capped tags — AFTER the article, not before it. Tags are
                    where you go once you have finished reading; in front of the first
                    sentence they are one more block between the visitor and what they came
                    for (measured: the first word of the article sat at y=1081). */}
                {(article.category || visibleTags.length > 0) && (
                  <div className="mb-8 flex flex-wrap gap-2">
                    {article.category && (
                      <a
                        href={`/categories/${article.category.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        <IconFolder className="h-3.5 w-3.5" />
                        {article.category.name}
                      </a>
                    )}
                    {visibleTags.map((t) => (
                      <a key={t.id} href={`/tags/${t.slug}`} className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs text-primary">
                        #{t.name}
                      </a>
                    ))}
                    {extraTags > 0 && (
                      <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">+{extraTags} وسوم</span>
                    )}
                    {allTags.length > 0 && (
                      <a href="/tags" className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
                        عرض كل الوسوم
                      </a>
                    )}
                  </div>
                )}

                {/* MOBILE: image gallery (desktop keeps it in the aside) */}
                <div className="mb-8 lg:hidden">
                  <Gallery images={galleryImages} fallbackText={article.client?.description} clientName={article.client?.name} />
                </div>

                <ArticleFaq articleId={article.id} faqsCount={article._count.faqs} faqs={articleFaqsForJsonLd} pendingFaqs={pendingFaqs} />

                <div id="article-comments">
                  <ArticleComments
                    comments={article.comments}
                    commentsCount={article._count.comments}
                    articleId={article.id}
                    articleSlug={article.slug}
                    userId={userId}
                  />
                </div>

                {/* E-E-A-T: author bio */}
                {article.author && (
                  <div className="mt-8 [&_section]:my-0">
                    <ArticleAuthorBio
                      author={article.author}
                      platformSocialLinks={platformSocialLinks}
                      reviewer={
                        article.client
                          ? { name: article.client.name, slug: article.client.slug, reviewedAt: article.lastReviewed }
                          : null
                      }
                    />
                  </div>
                )}

                {/* CONSOLIDATED: one "اقرأ أيضاً" grid (replaces the 4 repetitive related sections) */}
                <ReadMore articleId={article.id} clientId={article.clientId ?? undefined} items={readMoreTop} />

                <ArticleFooter
                  client={article.client}
                  dateModified={article.dateModified}
                  lastReviewed={article.lastReviewed}
                  contentDepth={article.contentDepth}
                  license={article.license}
                />
              </article>
            </div>

          </div>
        </div>
        {/* MOBILE: sticky conversion bar — احجز الآن · واتساب · logo (thumb zone) */}
        {article.client && (
          <div
            className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur lg:hidden"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="mx-auto max-w-[480px]">
              <BottomDock
                clientId={article.clientId}
                articleId={article.id}
                clientName={article.client.name}
                clientLogoUrl={mediaSrc(article.client.logoMedia)}
                clientPhone={article.client.phone ?? null}
                cta={{
                  mode: article.client.ctaMode,
                  label: article.client.ctaLabel,
                  url: article.client.ctaUrl,
                }}
                bookingUser={userBox}
                clientCard={
                  <PartnerCard
                    client={article.client}
                    askClientProps={{
                      articleId: article.id,
                      clientId: article.clientId,
                      articleTitle: article.title,
                      user: userBox,
                      pendingFaqs,
                    }}
                    cta={{
                      mode: article.client.ctaMode,
                      label: article.client.ctaLabel,
                      url: article.client.ctaUrl,
                      hideOwnCta: true,
                      source: "article_dock",
                      user: userBox,
                    }}
                  />
                }
              />
            </div>
          </div>
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
  return (
    <Suspense fallback={<ArticleLoading />}>
      <ArticlePageContent {...props} />
    </Suspense>
  );
}
