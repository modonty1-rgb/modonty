import { Metadata } from "next";
import { FeedContainer } from "@/components/FeedContainer";
import { getArticles } from "@/app/api/helpers/article-queries";
import type { ArticleResponse } from "@/app/api/helpers/types";
import { getHomePageSeo } from "@/lib/seo/home-page-seo";

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await getHomePageSeo();
  return metadata ?? {};
}

export default async function HomePage() {
  const [{ jsonLd }, { articles }] = await Promise.all([
    getHomePageSeo(),
    getArticles({ limit: 8 }),
  ]);

  const posts = articles.map((article: ArticleResponse) => ({
    id: article.id,
    title: article.title,
    content: article.excerpt || "",
    excerpt: article.excerpt ?? undefined,
    image: article.image,
    slug: article.slug,
    publishedAt: new Date(article.publishedAt),
    clientName: article.client.name,
    clientSlug: article.client.slug,
    clientLogo: article.client.logo,
    readingTimeMinutes: article.readingTimeMinutes,
    author: {
      id: article.author.id,
      name: article.author.name || "Modonty",
      title: "",
      company: article.client.name,
      avatar: article.author.image || "",
    },
    likes: article.interactions.likes,
    dislikes: article.interactions.dislikes,
    comments: article.interactions.comments,
    favorites: article.interactions.favorites,
    status: "published" as const,
  }));

  const jsonLdToRender = jsonLd?.trim() || "";

  return (
    <>
      {jsonLdToRender && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdToRender,
          }}
        />
      )}
      <FeedContainer posts={posts} />
    </>
  );
}

