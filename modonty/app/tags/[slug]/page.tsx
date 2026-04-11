import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArticleStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { generateMetadataFromSEO, generateBreadcrumbStructuredData } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { CategoryArticleCard } from "@/app/categories/[slug]/components/category-article-card";
import type { ArticleResponse } from "@/lib/types";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const tags = await db.tag.findMany({ select: { slug: true } });
    if (!tags || tags.length === 0) return [{ slug: "__no_tags__" }];
    return tags.map((tag) => ({ slug: tag.slug }));
  } catch {
    return [{ slug: "__no_tags__" }];
  }
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const tag = await db.tag.findUnique({
      where: { slug: decodedSlug },
      select: {
        name: true,
        seoTitle: true,
        seoDescription: true,
        socialImage: true,
        nextjsMetadata: true,
      },
    });

    if (!tag) return { title: "وسم غير موجود - مودونتي" };

    if (tag.nextjsMetadata) {
      const { robots: _r, ...stored } = tag.nextjsMetadata as Metadata & { robots?: unknown };
      if (stored.title) return stored;
    }

    return generateMetadataFromSEO({
      title: (tag.seoTitle || `مقالات وسم: ${tag.name}`)?.slice(0, 51),
      description:
        tag.seoDescription ||
        `استكشف جميع المقالات المصنّفة تحت وسم "${tag.name}" في مودونتي`,
      url: `/tags/${decodedSlug}`,
      type: "website",
      image: tag.socialImage || undefined,
    });
  } catch {
    return { title: "الوسوم - مودونتي" };
  }
}

export default async function TagPage({ params }: TagPageProps) {
  await connection(); // dynamic — articles change, new Date() needed for scheduled check
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  try {
    const [tag, rawArticles] = await Promise.all([
      db.tag.findUnique({
        where: { slug: decodedSlug },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          jsonLdStructuredData: true,
        },
      }),
      db.article.findMany({
        where: {
          status: ArticleStatus.PUBLISHED,
          OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
          tags: { some: { tag: { slug: decodedSlug } } },
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoMedia: { select: { url: true } },
            },
          },
          author: {
            select: { id: true, name: true, slug: true, image: true },
          },
          featuredImage: {
            select: { url: true, altText: true },
          },
          _count: {
            select: {
              likes: true,
              dislikes: true,
              favorites: true,
              comments: true,
              views: true,
            },
          },
        },
        orderBy: { datePublished: "desc" },
        take: 50,
      }),
    ]);

    if (!tag) notFound();

    const articles: ArticleResponse[] = rawArticles.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt ?? undefined,
      publishedAt: (a.datePublished ?? a.createdAt).toISOString(),
      readingTimeMinutes: a.readingTimeMinutes ?? undefined,
      client: {
        id: a.client.id,
        name: a.client.name,
        slug: a.client.slug,
        logo: a.client.logoMedia?.url,
      },
      author: {
        id: a.author.id,
        name: a.author.name ?? "مودونتي",
        slug: a.author.slug ?? undefined,
        image: a.author.image ?? undefined,
      },
      featuredImage: a.featuredImage
        ? { url: a.featuredImage.url, altText: a.featuredImage.altText ?? undefined }
        : undefined,
      interactions: {
        likes: a._count.likes,
        dislikes: a._count.dislikes,
        favorites: a._count.favorites,
        comments: a._count.comments,
        views: a._count.views,
      },
    }));

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.modonty.com";

    const breadcrumbData = generateBreadcrumbStructuredData([
      { name: "الرئيسية", url: "/" },
      { name: "الوسوم", url: "/tags" },
      { name: tag.name, url: `/tags/${decodedSlug}` },
    ]);

    const collectionData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `مقالات وسم: ${tag.name}`,
      description: tag.description ?? `مقالات مصنّفة تحت وسم ${tag.name}`,
      url: `${siteUrl}/tags/${decodedSlug}`,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: articles.slice(0, 10).map((article, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Article",
            headline: article.title,
            url: `${siteUrl}/articles/${article.slug}`,
          },
        })),
      },
    };

    return (
      <>
        {tag.jsonLdStructuredData ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: tag.jsonLdStructuredData }}
          />
        ) : (
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionData) }}
            />
          </>
        )}

        <Breadcrumb
          items={[
            { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
            { label: "الوسوم", href: "/tags" },
            { label: tag.name },
          ]}
        />

        <div className="border-b bg-gradient-to-br from-primary/10 via-primary/5 to-background">
          <div className="container mx-auto max-w-[1128px] px-4 py-10">
            <h1 className="text-3xl font-bold mb-2">{tag.name}</h1>
            {tag.description && (
              <p className="text-muted-foreground max-w-2xl">{tag.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-3">
              {articles.length} مقال
            </p>
          </div>
        </div>

        <div className="container mx-auto max-w-[1128px] px-4 py-8">
          <section aria-labelledby="tag-articles-heading">
            <h2 id="tag-articles-heading" className="sr-only">
              مقالات {tag.name}
            </h2>
            {articles.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">لا توجد مقالات بهذا الوسم حتى الآن.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article, index) => (
                  <CategoryArticleCard
                    key={article.id}
                    article={article}
                    preload={index === 0}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </>
    );
  } catch {
    notFound();
  }
}
