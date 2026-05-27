import { Metadata } from "next";
import { Suspense } from "react";
import { notFound, unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { generateMetadataFromSEO, generateBreadcrumbStructuredData, generateArticleStructuredData } from "@/lib/seo";
import { getArticleDefaultsFromSettings } from "@/lib/seo/get-article-defaults-from-settings";
import { getPlatformSocialLinks } from "@/lib/settings/get-platform-social-links";
import { sanitizeHtml } from "@/lib/sanitize-html";
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
import {
  ArticleHeader,
  ArticleTags,
  ArticleEngagementMetrics,
  ArticleFeaturedImage,
  ArticleAuthorBio,
  ArticleImageGallery,
  ArticleFaq,
  ArticleCitations,
  ArticleManualRelated,
  ArticleFooter,
  ArticleComments,
  MoreFromAuthor,
  MoreFromClient,
  RelatedArticles,
  ReadingProgressBar,
  ArticleTableOfContents,
  ArticleClientCard,
  CommentFormDialog,
} from "./components";
// Client-only lazy wrappers — ssr:false must live in a 'use client' file
import {
  GTMClientTracker,
  ArticleViewTracker,
  ArticleBodyLinkTracker,
  ArticleMobileLayout,
  NewsletterCTA,
  ArticleFeaturedImageNewsletter,
  ArticleSidebarEngagement,
} from "./components/client-lazy";
import ArticleLoading from "./loading";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
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
        title: "مقال غير موجود - مودونتي",
      };
    }

    if (article.nextjsMetadata) {
      try {
        const stored = article.nextjsMetadata as Metadata;
        if (stored.title) {
          // Always regenerate canonical + hreflang — stored values may be stale/truncated.
          // Source of truth: NEXT_PUBLIC_SITE_URL env (mirror of admin Settings.siteUrl).
          // No more www workaround — admin canonical generator now always emits www host.
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";
          // URL constructor percent-encodes non-ASCII slug for consistency with JSON-LD + sitemap
          const canonicalUrl = new URL(`/articles/${slug}`, siteUrl).href;
          return {
            ...stored,
            openGraph: {
              ...(stored.openGraph as object | undefined),
              url: canonicalUrl,
            },
            alternates: {
              ...(stored.alternates as object | undefined),
              canonical: canonicalUrl,
              languages: { ar: canonicalUrl, "x-default": canonicalUrl },
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

    const languages: Record<string, string> = { ar: canonicalUrlFull, "x-default": canonicalUrlFull };
    if (Array.isArray(articleDefaults.alternateLanguages)) {
      for (const a of articleDefaults.alternateLanguages as Array<{ hreflang?: string; url?: string }>) {
        if (a.hreflang?.trim() && a.url?.trim()) {
          const href = a.url.startsWith("http") ? a.url : `${siteUrl}${a.url.startsWith("/") ? a.url : `/${a.url}`}`;
          languages[a.hreflang.trim()] = href;
        }
      }
    }

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
      title: "مقال - مودونتي",
    };
  }
}

async function ArticlePageContent({ params }: ArticlePageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  // Per Next.js 16 official docs: with cacheComponents enabled, `connection()` is the
  // recommended way to explicitly opt out of static prerender + caching for THIS route.
  // Source: https://nextjs.org/docs/app/api-reference/functions/connection
  // Why we need it: PPR auto-generates `x-next-cache-tags` HTTP header from the route path.
  // Arabic slugs (e.g. /articles/دليلك-الشامل-...) contain non-ASCII chars → throws
  // `TypeError: Invalid character in header content` (ERR_INVALID_CHAR) on every request.
  // Reproduced 10/10 origin failures. `connection()` marks response as not-cacheable,
  // skipping the auto-tag write that crashes.
  // Known Next.js limitation tracked at https://github.com/vercel/next.js/issues/73965
  await connection();

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

    // Get cached JSON-LD from database (Phase 6)
    let jsonLdGraph: object | null = null;
    if (article.jsonLdStructuredData) {
      try {
        jsonLdGraph = JSON.parse(article.jsonLdStructuredData);
      } catch {
        // Invalid JSON-LD, fall through to generate live
      }
    }
    // SEO-A2: fallback — generate live when DB cache not yet built
    if (!jsonLdGraph) {
      jsonLdGraph = generateArticleStructuredData(article);
    }

    const breadcrumbJsonLd = generateBreadcrumbStructuredData([
      { name: "الرئيسية", url: "/" },
      { name: "العملاء", url: "/clients" },
      { name: article.client.name, url: `/clients/${article.client.slug}` },
      { name: article.title, url: `/articles/${article.slug}` },
    ]);

    return (
      <>
        {/* Single unified JSON-LD @graph from database cache (Phase 6) */}
        {jsonLdGraph && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLdGraph),
            }}
          />
        )}
        {/* BreadcrumbList JSON-LD — SEO-A1 fix */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        {/* FAQPage JSON-LD — injected when article has published FAQs */}
        {articleFaqsForJsonLd.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": articleFaqsForJsonLd.map((faq) => ({
                  "@type": "Question",
                  "name": faq.question,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer,
                  },
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

        <>
          <ReadingProgressBar />
          {/* Bar before breadcrumb — sticky top-14 kicks in immediately from scrollY=0 */}
          <ArticleMobileLayout
            barProps={{
              title: article.title,
              articleId: article.id,
              articleSlug: article.slug,
              clientId: article.clientId ?? undefined,
              clientLogo: article.client?.logoMedia?.url ?? null,
              clientName: article.client?.name ?? null,
              clientSlug: article.client?.slug ?? null,
              articleTitle: article.title,
              user: session?.user
                ? { name: session.user.name ?? null, email: session.user.email ?? null }
                : null,
              commentsCount: article._count.comments,
              likes: article._count.likes,
              dislikes: article._count.dislikes,
              favorites: article._count.favorites,
              userLiked: article.userLiked,
              userDisliked: article.userDisliked,
              userFavorited: article.userFavorited,
            }}
            sheetProps={{
              client: article.client,
              askClientProps: article.client
                ? {
                    articleId: article.id,
                    clientId: article.clientId,
                    articleTitle: article.title,
                    user: session?.user
                      ? {
                          name: session.user.name ?? null,
                          email: session.user.email ?? null,
                        }
                      : null,
                  }
                : null,
              content: article.content,
              citations: article.citations,
              clientId: article.clientId,
              articleId: article.id,
              articleTitle: article.title,
              platformSocialLinks,
              newsletterCtaText: article.client?.newsletterCtaText,
            }}
          />
          <Breadcrumb
            items={[
              { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
              { label: "العملاء", href: "/clients" },
              { label: article.client.name, href: `/clients/${article.client.slug}` },
              { label: article.title },
            ]}
          />
          <div className="container mx-auto max-w-[1128px] px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-20 lg:pb-8 flex-1">
            <div className="flex flex-col lg:grid lg:grid-cols-[240px_1fr_280px] lg:items-start gap-6 md:gap-8">
              {/* Left sidebar – مشاركة وتفاعل + العميل */}
              <aside className="hidden lg:block w-[240px] sticky top-[3.5rem] self-start h-[calc(100dvh-4rem)]" role="complementary" aria-label="مشاركة وتفاعل">
                <div className="flex flex-col gap-6">
                  {article.client ? (
                    <ArticleClientCard
                      client={article.client}
                      askClientProps={{
                        articleId: article.id,
                        clientId: article.clientId,
                        articleTitle: article.title,
                        user: session?.user
                          ? { name: session.user.name ?? null, email: session.user.email ?? null }
                          : null,
                      }}
                    />
                  ) : null}
                  <ArticleSidebarEngagement
                    title={article.title}
                    articleId={article.id}
                    articleSlug={article.slug}
                    clientId={article.clientId ?? undefined}
                    commentsCount={article._count.comments}
                    questionsCount={article._count.faqs}
                    userId={userId}
                    likes={article._count.likes}
                    dislikes={article._count.dislikes}
                    favorites={article._count.favorites}
                    userLiked={article.userLiked}
                    userDisliked={article.userDisliked}
                    userFavorited={article.userFavorited}
                  />
                </div>
              </aside>
              <div className="w-full min-w-0">

                {/* Article content - JSON-LD is source of truth (no Microdata) */}
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

                  {article.featuredImage && (
                    <ArticleFeaturedImage
                      image={article.featuredImage}
                      title={article.title}
                    >
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
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          🎧 نسخة صوتية
                        </span>
                      </div>
                      <audio
                        controls
                        src={article.audioUrl}
                        className="w-full h-10"
                        preload="none"
                      />
                    </div>
                  )}

                  <ArticleTags
                    client={article.client}
                    category={article.category}
                    tags={article.tags}
                  />

                  <div
                    id="article-content"
                    className="prose prose-base md:prose-lg max-w-none mb-8 md:mb-12 text-right [&_h2]:text-right [&_h3]:text-right [&_h4]:text-right [&_li]:text-right"
                    style={{ lineHeight: '1.6', direction: 'rtl' }}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
                  />
                  <ArticleBodyLinkTracker articleId={article.id} />

                  <ArticleImageGallery gallery={article.gallery} />

                  <ArticleFaq
                    articleId={article.id}
                    faqsCount={article._count.faqs}
                    faqs={articleFaqsForJsonLd}
                    pendingFaqs={pendingFaqs}
                  />

                  {/* Comments (lazy-loaded on open) */}
                  <ArticleComments
                    comments={article.comments}
                    commentsCount={article._count.comments}
                    articleId={article.id}
                    articleSlug={article.slug}
                    userId={userId}
                  />

                  {/* More from Author — server-rendered for SEO */}
                  {article.author && (
                    <MoreFromAuthor
                      authorId={article.authorId}
                      articleId={article.id}
                      authorName={article.author.name}
                      articles={moreFromAuthor}
                    />
                  )}

                  {/* More from Client — server-rendered for SEO */}
                  {article.client && (
                    <MoreFromClient
                      clientId={article.clientId}
                      articleId={article.id}
                      clientName={article.client.name}
                      articles={moreFromClient}
                    />
                  )}

                  <ArticleManualRelated
                    articleId={article.id}
                    clientId={article.clientId ?? undefined}
                    relatedArticles={article.relatedTo}
                  />

                  {/* Related Articles (lazy-loaded on open) */}
                  <RelatedArticles
                    articleId={article.id}
                    clientId={article.clientId ?? undefined}
                    relatedArticles={relatedArticles}
                  />

                  <ArticleFooter
                    client={article.client}
                    dateModified={article.dateModified}
                    lastReviewed={article.lastReviewed}
                    contentDepth={article.contentDepth}
                    license={article.license}
                  />
                </article>
              </div>

              {/* Right sidebar – Author → TOC → Newsletter */}
              <aside className="hidden lg:block sticky top-[3.5rem] self-start h-[calc(100dvh-4rem)]" role="complementary" aria-label="جدول المحتويات">
                <div className="flex flex-col gap-6">
                  <div className="[&_section]:my-0">
                    <ArticleAuthorBio author={article.author} platformSocialLinks={platformSocialLinks} />
                  </div>
                  <ArticleTableOfContents content={article.content} />
                  {article.citations?.length ? (
                    <div className="[&_section]:my-0">
                      <ArticleCitations citations={article.citations} />
                    </div>
                  ) : null}
                  <div className="[&>div]:mt-0 [&>div]:mb-0">
                    <NewsletterCTA clientId={article.clientId} articleId={article.id} ctaText={article.client?.newsletterCtaText} />
                  </div>
                  <CommentFormDialog
                    articleId={article.id}
                    articleSlug={article.slug}
                    userId={userId}
                    clientId={article.clientId ?? undefined}
                  />
                </div>
              </aside>
            </div>
          </div>

        </>
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
