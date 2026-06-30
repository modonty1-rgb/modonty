import { db } from "@/lib/db";
import { ArticleStatus, SocialPlatform, SocialPostStatus } from "@prisma/client";
import FacebookPageClient from "./_components/facebook-page-client";
import type { ArticleRow, PublishedRow } from "./_components/facebook-page-client";

export const dynamic = "force-dynamic";

export default async function FacebookPage() {
  const [articles, pending, thisMonth, total, failed, publishedPosts] = await Promise.all([
    db.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        NOT: {
          socialPosts: {
            some: {
              platform: SocialPlatform.FACEBOOK,
              status: { in: [SocialPostStatus.PUBLISHED, SocialPostStatus.SKIPPED] },
            },
          },
        },
      },
      orderBy: { datePublished: "desc" },
      take: 100,
      select: {
        id: true,
        title: true,
        slug: true,
        seoTitle: true,
        seoDescription: true,
        datePublished: true,
        featuredImage: { select: { url: true } },
        tags: { select: { tag: { select: { name: true } } } },
        client: { select: { name: true } },
      },
    }),
    db.article.count({
      where: {
        status: ArticleStatus.PUBLISHED,
        NOT: {
          socialPosts: {
            some: {
              platform: SocialPlatform.FACEBOOK,
              status: { in: [SocialPostStatus.PUBLISHED, SocialPostStatus.SKIPPED] },
            },
          },
        },
      },
    }),
    db.socialPost.count({
      where: {
        platform: SocialPlatform.FACEBOOK,
        status: SocialPostStatus.PUBLISHED,
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
    db.socialPost.count({
      where: { platform: SocialPlatform.FACEBOOK, status: SocialPostStatus.PUBLISHED },
    }),
    db.socialPost.count({
      where: { platform: SocialPlatform.FACEBOOK, status: SocialPostStatus.FAILED },
    }),
    db.socialPost.findMany({
      where: { platform: SocialPlatform.FACEBOOK, status: SocialPostStatus.PUBLISHED },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        platformPostId: true,
        createdAt: true,
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            featuredImage: { select: { url: true } },
            client: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  const mapped: ArticleRow[] = articles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    seoTitle: a.seoTitle,
    seoDescription: a.seoDescription,
    imageUrl: a.featuredImage?.url ?? null,
    tags: a.tags.map((t) => t.tag.name),
    clientName: a.client?.name ?? null,
    datePublished: a.datePublished?.toISOString() ?? null,
  }));

  const mappedPublished: PublishedRow[] = publishedPosts.map((p) => ({
    id: p.id,
    platformPostId: p.platformPostId,
    postedAt: p.createdAt.toISOString(),
    articleId: p.article.id,
    articleTitle: p.article.title,
    articleSlug: p.article.slug,
    imageUrl: p.article.featuredImage?.url ?? null,
    clientName: p.article.client?.name ?? null,
  }));

  return (
    <FacebookPageClient
      articles={mapped}
      publishedPosts={mappedPublished}
      stats={{ pending, thisMonth, total, failed }}
    />
  );
}
