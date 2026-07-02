import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ArticleStatus } from "@prisma/client";
import FacebookPostClient from "./_components/facebook-post-client";

export const maxDuration = 120;

export const dynamic = "force-dynamic";

export default async function FacebookPostPage({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) {
  const { articleId } = await params;

  const article = await db.article.findUnique({
    where: { id: articleId, status: ArticleStatus.PUBLISHED },
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
  });

  if (!article) notFound();

  const pageId = process.env.META_PAGE_ID;
  const token  = process.env.META_PAGE_ACCESS_TOKEN;
  let pagePictureUrl: string | null = null;
  if (pageId && token) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v25.0/${pageId}/picture?type=square&redirect=false&access_token=${token}`,
        { cache: "force-cache" }
      );
      const json = await res.json() as { data?: { url?: string } };
      pagePictureUrl = json.data?.url ?? null;
    } catch {
      // fallback to icon
    }
  }

  return (
    <FacebookPostClient
      pagePictureUrl={pagePictureUrl}
      article={{
        id: article.id,
        title: article.title,
        slug: article.slug,
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        imageUrl: article.featuredImage?.url ?? null,
        tags: article.tags.map((t) => t.tag.name),
        clientName: article.client?.name ?? null,
        datePublished: article.datePublished?.toISOString() ?? null,
      }}
    />
  );
}
