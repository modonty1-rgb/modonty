import { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { auth } from "@/lib/auth";
import { generateMetadataFromSEO } from "@/lib/seo";
import { getArticleDefaultsFromSettings } from "@/lib/seo/get-article-defaults-from-settings";
import { GTMClientTracker } from "@/components/gtm/GTMClientTracker";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";

import {
  getArticleSlugsForStaticParams,
  getArticleBySlugMinimal,
  getArticleForMetadata,
} from "./actions";
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
  ArticleSidebarEngagement,
  ArticleClientCard,
  CommentFormDialog,
  ArticleMobileLayout,
} from "./components";
import ArticleLoading from "./loading";

const NewsletterCTA = dynamic(
  () => import("./components/sidebar/newsletter-cta").then((mod) => ({ default: mod.NewsletterCTA })),
  { ssr: true }
);

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const articles = await getArticleSlugsForStaticParams();
    return articles.map((article: { slug: string }) => ({
      slug: article.slug,
    }));
  } catch {
    return [];
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
        if (stored.title) return stored;
      } catch {
        // fall through to generation
      }
    }

    const articleForGeneration = article;

    const title = articleForGeneration.seoTitle || articleForGeneration.title;
    const description = articleForGeneration.seoDescription || articleForGeneration.excerpt || "";
    const image =
      articleForGeneration.featuredImage?.url ||
      articleForGeneration.client.ogImageMedia?.url ||
      articleForGeneration.client.logoMedia?.url ||
      undefined;
    const imageAlt =
      articleForGeneration.featuredImage?.altText || title || undefined;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";

    let canonicalInput: string | undefined = articleForGeneration.canonicalUrl || undefined;

    if (canonicalInput) {
      const isAbsolute = /^https?:\/\//.test(canonicalInput);
      const sameDomain = isAbsolute && canonicalInput.startsWith(siteUrl);
      const legacyClientScoped =
        sameDomain &&
        canonicalInput.includes("/clients/") &&
        canonicalInput.includes(`/articles/${slug}`);

      // Normalize legacy internal canonicals to the public articles route
      if (legacyClientScoped) {
        canonicalInput = `/articles/${slug}`;
      }
    }

    const urlForMetadata = canonicalInput || `/articles/${slug}`;
    const canonicalUrlFull =
      urlForMetadata.startsWith("http")
        ? urlForMetadata
        : `${siteUrl}${urlForMetadata.startsWith("/") ? urlForMetadata : `/${urlForMetadata}`}`;

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
      siteName: articleForGeneration.client.name,
      locale: articleDefaults.ogLocale || "ar_SA",
      publishedTime: articleForGeneration.datePublished || undefined,
      modifiedTime: articleForGeneration.updatedAt,
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

  try {
    const [session, articleDefaults] = await Promise.all([
      auth(),
      getArticleDefaultsFromSettings(),
    ]);
    const userId = session?.user?.id;

    const articleRaw = await getArticleBySlugMinimal(slug, userId);
    if (!articleRaw) {
      notFound();
    }
    const article = { ...articleRaw, ...articleDefaults };

    // Get cached JSON-LD from database (Phase 6)
    let jsonLdGraph: object | null = null;
    if (article.jsonLdStructuredData) {
      try {
        jsonLdGraph = JSON.parse(article.jsonLdStructuredData);
      } catch {
        // Invalid JSON-LD, continue without it
      }
    }

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

        <>
          <ReadingProgressBar />
          <Breadcrumb
            items={[
              { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
              { label: "العملاء", href: "/clients" },
              { label: article.client.name, href: `/clients/${article.client.slug}` },
              { label: article.title },
            ]}
          />
          <main className="container mx-auto max-w-[1128px] px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-40 lg:pb-8 flex-1">
            <div className="flex flex-col lg:grid lg:grid-cols-[240px_1fr_280px] lg:items-start gap-6 md:gap-8">
              {/* Left sidebar – مشاركة وتفاعل + العميل */}
              <aside className="hidden lg:flex w-[240px] min-w-0 shrink-0 flex-col gap-6" role="complementary" aria-label="مشاركة وتفاعل">
                <div className="sticky top-[3.5rem] flex flex-col gap-6">
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
                    commentsCount={article._count.comments}
                    views={article._count.views}
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
                  />

                  {article.featuredImage && (
                    <ArticleFeaturedImage
                      image={article.featuredImage}
                      title={article.title}
                    />
                  )}

                  <ArticleTags
                    client={article.client}
                    category={article.category}
                    tags={article.tags}
                  />

                  <div className="lg:hidden mb-4">
                    <ArticleEngagementMetrics
                      comments={article._count.comments}
                      views={article._count.views}
                      questions={article._count.faqs}
                    />
                  </div>

                  <div
                    id="article-content"
                    className="prose prose-base md:prose-lg max-w-none mb-8 md:mb-12"
                    style={{ lineHeight: '1.6' }}
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />

                  <ArticleImageGallery gallery={article.gallery} />

                  <ArticleFaq
                    articleId={article.id}
                    faqsCount={article._count.faqs}
                  />

                  {/* Comments (lazy-loaded on open) */}
                  <ArticleComments
                    comments={article.comments}
                    commentsCount={article._count.comments}
                    articleId={article.id}
                    articleSlug={article.slug}
                    userId={userId}
                  />

                  {/* More from Author (lazy-loaded on open) */}
                  {article.author && (
                    <MoreFromAuthor
                      authorId={article.authorId}
                      articleId={article.id}
                      authorName={article.author.name}
                    />
                  )}

                  {/* More from Client (lazy-loaded on open) */}
                  {article.client && (
                    <MoreFromClient
                      clientId={article.clientId}
                      articleId={article.id}
                      clientName={article.client.name}
                    />
                  )}

                  <ArticleManualRelated relatedArticles={article.relatedTo} />

                  {/* Related Articles (lazy-loaded on open) */}
                  <RelatedArticles articleId={article.id} />

                  <ArticleFooter
                    client={article.client}
                    dateModified={article.dateModified}
                    lastReviewed={article.lastReviewed}
                    contentDepth={article.contentDepth}
                    license={article.license}
                  />
                </article>
              </div>

              {/* Right sidebar – author, TOC, etc. */}
              <aside className="hidden lg:flex min-w-0 flex-col gap-6" role="complementary" aria-label="جدول المحتويات">
                <div className="[&_section]:my-0">
                  <ArticleAuthorBio author={article.author} />
                </div>
                {article.citations?.length ? (
                  <div className="[&_section]:my-0">
                    <ArticleCitations citations={article.citations} />
                  </div>
                ) : null}
                <div className="[&>div]:mt-0 [&>div]:mb-0">
                  <NewsletterCTA clientId={article.clientId} />
                </div>
                <CommentFormDialog
                  articleId={article.id}
                  articleSlug={article.slug}
                  userId={userId}
                />
                <ArticleTableOfContents content={article.content} />
              </aside>
            </div>

            <ArticleMobileLayout
              barProps={{
                title: article.title,
                articleId: article.id,
                articleSlug: article.slug,
                userId,
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
                author: article.author,
                content: article.content,
                citations: article.citations,
                clientId: article.clientId,
                articleId: article.id,
                articleSlug: article.slug,
                userId,
              }}
            />
          </main>

        </>
      </>
    );
  } catch {
    notFound();
  }
}

export default function ArticlePage(props: ArticlePageProps) {
  return (
    <Suspense fallback={<ArticleLoading />}>
      <ArticlePageContent {...props} />
    </Suspense>
  );
}
