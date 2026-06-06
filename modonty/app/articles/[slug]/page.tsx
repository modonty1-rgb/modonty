import { Metadata } from "next";
import { Suspense } from "react";
import { notFound, unstable_rethrow } from "next/navigation";

import { auth } from "@/lib/auth";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { getArticleDefaultsFromSettings } from "@/lib/seo/get-article-defaults-from-settings";
import { getPlatformSocialLinks } from "@/lib/settings/get-platform-social-links";
import {
  generateMetadataFromSEO,
  generateBreadcrumbStructuredData,
  generateArticleStructuredData,
  generateSiteIdentityStructuredData,
  jsonLdHtml,
  normalizeOgImages,
} from "@/lib/seo";
import { IconFolder } from "@/lib/icons";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";

import {
  getArticleSlugsForStaticParams,
  getArticleBySlugMinimal,
  getArticleForMetadata,
  getArticleFaqs,
} from "./actions";
import {
  getRelatedArticlesByArticleId,
  getRelatedArticlesByClient,
  getRelatedArticlesByAuthor,
} from "./actions/article-data";
import { getPendingFaqsForCurrentUser } from "./actions/ask-client-actions";

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
// Client-only lazy wrappers — ssr:false must live in a 'use client' file
import {
  ArticleFeaturedImageNewsletter,
  GTMClientTracker,
  ArticleViewTracker,
  ArticleBodyLinkTracker,
} from "./components/client-lazy";
// Article layout components (promoted from the design lab — now the production article).
import { ArticleLabClientCard } from "./components/article-lab-client-card";
import { ArticleLabGallery } from "./components/article-lab-gallery";
import { ArticleLabReadMore } from "./components/article-lab-read-more";
import { ArticleLabEngagementStrip } from "./components/article-lab-engagement";
import { ArticleLabBottomDock } from "./components/article-lab-bottom-dock";
import { ArticleLabMobileIdentity } from "./components/article-lab-mobile-identity";
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
      getArticleForMetadata(slug),
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
      articleForGeneration.featuredImage?.url ||
      articleForGeneration.client.heroImageMedia?.url ||
      articleForGeneration.client.logoMedia?.url ||
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
    const [session, articleDefaults, platformSocialLinks] = await Promise.all([
      auth(),
      getArticleDefaultsFromSettings(),
      getPlatformSocialLinks(),
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

    const userBox = session?.user
      ? { name: session.user.name ?? null, email: session.user.email ?? null }
      : null;
    const safeHtml = sanitizeHtml(article.content);

    // derived
    const galleryImages = (article.gallery ?? [])
      .map((g) => ({
        url: g.media?.url ?? "",
        alt: g.media?.altText || article.title,
        caption: g.media?.caption || g.media?.altText || null,
      }))
      .filter((g) => g.url);
    const allTags = (article.tags ?? []).map((t) => t.tag).filter(Boolean);
    const visibleTags = allTags.slice(0, 5);
    const extraTags = Math.max(0, allTags.length - visibleTags.length);
    const keyPoints = Array.from(article.content.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi))
      .map((m) => m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, 3);

    // Consolidated "اقرأ أيضاً" — merge the 4 related sources, dedupe, NO cap (Khalid 2026-06-04:
    // "ما في انتهاء" → max internal linking for SEO; pool already bounded by source query takes).
    type RelatedLike = {
      id: string;
      title: string;
      slug: string;
      excerpt: string | null;
      featuredImage?: { url: string; altText: string | null } | null;
      client?: { name: string } | null;
    };
    const seenReadMore = new Set<string>([article.id]);
    const readMoreItems: {
      id: string;
      title: string;
      slug: string;
      excerpt: string | null;
      featuredImage?: { url: string; altText: string | null } | null;
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
    const readMoreTop = readMoreItems;

    // Generate JSON-LD live every render (pulls current author + image data from this render's
    // article object; no risk of stale DB cache). Data fetchers above are cached, so this is fast.
    const jsonLdGraph: object = generateArticleStructuredData(article);
    const breadcrumbJsonLd = generateBreadcrumbStructuredData([
      { name: "الرئيسية", url: "/" },
      { name: "العملاء", url: "/clients" },
      { name: article.client.name, url: `/clients/${article.client.slug}` },
      { name: article.title, url: `/articles/${article.slug}` },
    ]);
    // Site identity (Modonty Organization + WebSite brand entity) for knowledge-graph + AI/GEO.
    const siteIdentityJsonLd = generateSiteIdentityStructuredData({
      sameAs: platformSocialLinks.map((l) => l.href),
    });

    return (
      <>
        {jsonLdGraph && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLdGraph) }} />
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(siteIdentityJsonLd) }} />
        {articleFaqsForJsonLd.length > 0 && (
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
          <GTMClientTracker
            clientContext={{
              client_id: article.client.id,
              client_slug: article.client.slug,
              client_name: article.client.name,
            }}
            articleId={article.id}
            pageTitle={article.seoTitle || article.title}
          />
        )}

        <ArticleViewTracker articleSlug={article.slug} />

        <ReadingProgressBar />

        <Breadcrumb
          items={[
            { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
            { label: "العملاء", href: "/clients" },
            { label: article.client.name, href: `/clients/${article.client.slug}` },
            { label: article.title },
          ]}
        />

        <div className="container mx-auto max-w-[1128px] px-4 py-6 pb-24 sm:px-6 md:py-8 lg:px-8 lg:pb-8">
          <div className="flex flex-col gap-6 md:gap-8 lg:grid lg:grid-cols-[300px_1fr] lg:items-start">

            {/* RIGHT (RTL first): engagement strip + client card + TOC + gallery */}
            <aside className="hidden self-start lg:sticky lg:top-[3.5rem] lg:block" aria-label="العميل والتفاعل">
              <div className="flex flex-col gap-6">
                <ArticleLabEngagementStrip
                  likes={article._count.likes}
                  userLiked={article.userLiked}
                  userFavorited={article.userFavorited}
                  clientId={article.clientId}
                  articleId={article.id}
                  articleSlug={article.slug}
                  userId={userId}
                  ctaText={article.client?.newsletterCtaText}
                />
                {article.client && (
                  <ArticleLabClientCard
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
                )}
                <ArticleTableOfContents content={article.content} collapsible />
                <ArticleLabGallery images={galleryImages} fallbackText={article.client?.description} clientName={article.client?.name} />
              </div>
            </aside>

            {/* CENTER */}
            <div className="w-full min-w-0">
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
                />

                {/* MOBILE: client identity (engagement moved to the sticky bottom bar) */}
                {article.client && (
                  <ArticleLabMobileIdentity client={article.client} articleId={article.id} />
                )}

                {article.featuredImage && (
                  <ArticleFeaturedImage image={article.featuredImage} title={article.title}>
                    {article.client && (
                      <ArticleFeaturedImageNewsletter
                        clientId={article.clientId}
                        clientName={article.client.name}
                        articleId={article.id}
                        ctaText={article.client.newsletterCtaText}
                      />
                    )}
                  </ArticleFeaturedImage>
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
                  <ArticleTableOfContents content={article.content} collapsible />
                </div>

                {/* TL;DR — real key points from H2 headings */}
                {keyPoints.length > 0 && (
                  <div className="mt-5 rounded-xl border border-primary/25 bg-primary/5 p-4">
                    <p className="mb-2 text-sm font-bold text-primary">⚡ أهم النقاط</p>
                    <ul className="space-y-1.5 ps-5 text-sm leading-relaxed text-foreground/85 [&>li]:list-disc">
                      {keyPoints.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Category badge + capped tags */}
                {(article.category || visibleTags.length > 0) && (
                  <div className="mt-4 flex flex-wrap gap-2">
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

                <div
                  id="article-content"
                  className="article-body prose prose-base md:prose-lg mt-6 max-w-none mb-8 text-right [&_h2]:text-right [&_h3]:text-right [&_h4]:text-right [&_li]:text-right"
                  style={{ lineHeight: "1.6", direction: "rtl" }}
                  dangerouslySetInnerHTML={{ __html: safeHtml }}
                />
                <ArticleBodyLinkTracker articleId={article.id} />

                {article.citations?.length ? (
                  <div className="mb-8 [&_section]:my-0">
                    <ArticleCitations citations={article.citations} />
                  </div>
                ) : null}

                {/* MOBILE: image gallery (desktop keeps it in the aside) */}
                <div className="mb-8 lg:hidden">
                  <ArticleLabGallery images={galleryImages} fallbackText={article.client?.description} clientName={article.client?.name} />
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
                    <ArticleAuthorBio author={article.author} platformSocialLinks={platformSocialLinks} />
                  </div>
                )}

                {/* CONSOLIDATED: one "اقرأ أيضاً" grid (replaces the 4 repetitive related sections) */}
                <ArticleLabReadMore articleId={article.id} clientId={article.clientId ?? undefined} items={readMoreTop} />

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
        {/* MOBILE: sticky bottom bar — article engagement flanking the center client dock (thumb zone) */}
        {article.client && (
          <div
            className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur lg:hidden"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="mx-auto max-w-[480px]">
              <ArticleLabBottomDock
                likes={article._count.likes}
                favorites={article._count.favorites}
                userLiked={article.userLiked}
                userFavorited={article.userFavorited}
                clientId={article.clientId}
                articleId={article.id}
                articleSlug={article.slug}
                userId={userId}
                clientName={article.client.name}
                clientLogoUrl={article.client.logoMedia?.url ?? null}
                cta={{
                  mode: article.client.ctaMode,
                  label: article.client.ctaLabel,
                  url: article.client.ctaUrl,
                }}
                bookingUser={userBox}
                clientCard={
                  <ArticleLabClientCard
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
