import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { generateMetadataFromSEO } from "@/lib/seo";
import { GTMClientTracker } from "@/components/gtm/GTMClientTracker";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import dynamic from "next/dynamic";
import {
  getArticleBySlug,
  getArticleComments,
  getRelatedArticlesByAuthor,
  getRelatedArticlesByClient,
  getUserArticleInteractions,
} from "./helpers/article-data";
import { getArticleDefaultsFromSettings } from "@/lib/get-article-defaults-from-settings";

export const revalidate = 300;
export const dynamicParams = true;
import { ArticleHeader } from "./components/article-header";
import { ArticleTags } from "./components/article-tags";
import { ArticleFeaturedImage } from "./components/article-featured-image";
import { ArticleAuthorBio } from "./components/article-author-bio";
import { ArticleImageGallery } from "./components/article-image-gallery";
import { ArticleFaq } from "./components/article-faq";
import { ArticleCitations } from "./components/article-citations";
import { ArticleManualRelated } from "./components/article-manual-related";
import { ArticleFooter } from "./components/article-footer";
import { ArticleComments } from "./components/article-comments";
import { MoreFromAuthor } from "./components/more-from-author";
import { MoreFromClient } from "./components/more-from-client";
import { RelatedArticles } from "./components/related-articles";
import { auth } from "@/lib/auth";

// Components that need client-side hydration but should SSR:
const ArticleShareButtons = dynamic(
  () => import("./components/article-share-buttons").then((mod) => ({ default: mod.ArticleShareButtons })),
  { ssr: true }
);

const ArticleInteractionButtons = dynamic(
  () => import("./components/article-interaction-buttons").then((mod) => ({ default: mod.ArticleInteractionButtons })),
  { ssr: true }
);

const NewsletterCTA = dynamic(
  () => import("./components/newsletter-cta").then((mod) => ({ default: mod.NewsletterCTA })),
  { ssr: true }
);

// Components that can skip SSR (browser-only features):
// These are wrapped in client components to allow ssr: false
import { ReadingProgressBar } from "./components/client-only-reading-progress";
import { ArticleTableOfContents } from "./components/client-only-table-of-contents";
import { ArticleUtilities } from "./components/client-only-utilities";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const articles = await db.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        OR: [
          { datePublished: null },
          { datePublished: { lte: new Date() } },
        ],
      },
      select: { slug: true },
      take: 100,
    });

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

    // First: Try to use stored metadata
    const article = await db.article.findFirst({
      where: {
        slug,
        status: ArticleStatus.PUBLISHED,
      },
      select: {
        nextjsMetadata: true,
        nextjsMetadataLastGenerated: true,
        // Minimal fields for fallback
        seoTitle: true,
        title: true,
        seoDescription: true,
        excerpt: true,
        canonicalUrl: true,
        featuredImageId: true,
        clientId: true,
      },
    });

    if (!article) {
      return {
        title: "مقال غير موجود - مودونتي",
      };
    }

    // Use stored metadata if available
    if (article.nextjsMetadata) {
      try {
        // Validate it's a valid Metadata object
        const stored = article.nextjsMetadata as Metadata;
        // Basic validation (has title)
        if (stored.title) {
          return stored;
        }
      } catch {
        // Invalid JSON, fall through to generation
      }
    }

    // Fallback: Generate on-the-fly (current behavior)
    const articleForGenerationRaw = await db.article.findFirst({
      where: { slug, status: ArticleStatus.PUBLISHED },
      include: {
        client: {
          select: {
            name: true,
            logoMedia: {
              select: {
                url: true,
              },
            },
            ogImageMedia: {
              select: {
                url: true,
              },
            },
          },
        },
        author: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                name: true,
              },
            },
          },
        },
        featuredImage: {
          select: {
            url: true,
            altText: true,
            width: true,
            height: true,
          },
        },
      },
    });

    if (!articleForGenerationRaw) {
      return { title: "مقال غير موجود - مودونتي" };
    }

    interface ArticleForGeneration {
      seoTitle: string | null;
      title: string;
      seoDescription: string | null;
      excerpt: string | null;
      canonicalUrl: string | null;
      featuredImage: {
        url: string | null;
        altText: string | null;
      } | null;
      client: {
        name: string;
        logoMedia: { url: string | null } | null;
        ogImageMedia: { url: string | null } | null;
      };
      author: {
        name: string | null;
      } | null;
      category: {
        name: string | null;
      } | null;
      tags:
        | {
            tag: {
              name: string;
            };
          }[]
        | null;
      datePublished: Date | null;
      updatedAt: Date;
    }

    const articleForGeneration = articleForGenerationRaw as ArticleForGeneration;

    const articleDefaults = await getArticleDefaultsFromSettings();

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

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const session = await auth();
  const userId = session?.user?.id;

  try {
    const [articleRaw, articleDefaults] = await Promise.all([
      getArticleBySlug(slug),
      getArticleDefaultsFromSettings(),
    ]);

    if (!articleRaw) {
      notFound();
    }
    const article = { ...articleRaw, ...articleDefaults };

    const [comments, moreFromAuthor, moreFromClient] = await Promise.all([
      getArticleComments(article.id),
      getRelatedArticlesByAuthor(article.authorId, article.id),
      getRelatedArticlesByClient(article.clientId, article.id),
    ]);

    let userLiked = false;
    let userDisliked = false;
    let userFavorited = false;

    if (userId) {
      const interactions = await getUserArticleInteractions(article.id, userId);
      userLiked = interactions.liked;
      userDisliked = interactions.disliked;
      userFavorited = interactions.favorited;
    }


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
          <main className="container mx-auto max-w-[1128px] px-4 sm:px-6 lg:px-8 py-6 md:py-8 flex-1">
            <div className="flex flex-col lg:flex-row lg:justify-center lg:items-start gap-6 md:gap-8">
              <div className="w-full">

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
                    commentsCount={comments.length}
                    views={article._count.views}
                    userId={userId}
                    articleId={article.id}
                    articleSlug={article.slug}
                    likes={article._count.likes}
                    dislikes={article._count.dislikes}
                    favorites={article._count.favorites}
                    userLiked={userLiked}
                    userDisliked={userDisliked}
                    userFavorited={userFavorited}
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

                  <div
                    id="article-content"
                    className="prose prose-base md:prose-lg max-w-none mb-8 md:mb-12"
                    style={{ lineHeight: '1.6' }}
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />

                  <ArticleAuthorBio author={article.author} />

                  <ArticleImageGallery gallery={article.gallery} />

                  <ArticleFaq faqs={article.faqs} />

                  <ArticleCitations citations={article.citations} />

                  {/* Comments Section */}
                  <ArticleComments
                    comments={comments}
                    articleId={article.id}
                    articleSlug={article.slug}
                    userId={userId}
                  />

                  {/* Newsletter CTA */}
                  <NewsletterCTA clientId={article.clientId} />

                  {/* More from Author */}
                  {moreFromAuthor.length > 0 && (
                    <MoreFromAuthor articles={moreFromAuthor} authorName={article.author.name} />
                  )}

                  {/* More from Client */}
                  {moreFromClient.length > 0 && (
                    <MoreFromClient articles={moreFromClient} clientName={article.client.name} />
                  )}

                  <ArticleManualRelated relatedArticles={article.relatedTo} />

                  {/* Automatic Related Articles (based on category/tags) */}
                  <RelatedArticles
                    currentArticleId={article.id}
                    categoryId={article.categoryId}
                    tagIds={article.tags.map((t: any) => t.tagId)}
                    limit={3}
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

              {/* Sidebar - Table of Contents */}
              <aside className="hidden lg:block lg:max-w-[280px]" role="complementary" aria-label="جدول المحتويات">
                <ArticleTableOfContents content={article.content} />
              </aside>
            </div>
          </main>
        </>
      </>
    );
  } catch {
    notFound();
  }
}
