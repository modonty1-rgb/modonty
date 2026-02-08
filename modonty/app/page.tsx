import { Metadata } from "next";
import { FeedContainer } from "@/components/FeedContainer";
import { getArticles } from "@/app/api/helpers/article-queries";
import type { ArticleResponse } from "@/app/api/helpers/types";
import { getHomePageSeo } from "@/lib/seo/home-page-seo";
import { getLcpOptimizedImageUrl } from "@/lib/image-utils";

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await getHomePageSeo();
  return metadata ?? {};
}

function buildLcpPreloadHref(imageUrl: string): string {
  const optimized = getLcpOptimizedImageUrl(imageUrl);
  if (!optimized) return "";
  return `/_next/image?url=${encodeURIComponent(optimized)}&w=1200&q=65`;
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
  const lcpPreloadHref = posts[0]?.image ? buildLcpPreloadHref(posts[0].image) : "";

  return (
    <>
      {lcpPreloadHref && (
        <link rel="preload" as="image" href={lcpPreloadHref} />
      )}
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

