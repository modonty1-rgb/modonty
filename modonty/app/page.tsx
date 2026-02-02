import { Metadata } from "next";
import { FeedContainer } from "@/components/FeedContainer";
import { getArticles } from "@/app/api/helpers/article-queries";
import { generateMetadataFromSEO } from "@/lib/seo";
import { getSettingsSeoForRoute } from "@/lib/get-settings-seo";
import type { ArticleResponse } from "@/app/api/helpers/types";

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await getSettingsSeoForRoute("home");
  if (metadata?.title ?? metadata?.description) return metadata;
  return generateMetadataFromSEO({
    title: "أحدث المقالات والمدونات",
    description: "استكشف أحدث المقالات والمدونات الاحترافية من أفضل الكتّاب والمؤلفين. محتوى عالي الجودة في التقنية، التصميم، التسويق، والابتكار.",
    keywords: ["مقالات", "مدونات", "محتوى", "تقنية", "تصميم", "تسويق"],
    type: "website",
    locale: "ar_SA",
  });
}

export default async function HomePage() {
  const [{ jsonLd: storedJsonLd }, { articles }] = await Promise.all([
    getSettingsSeoForRoute("home"),
    getArticles({ limit: 10 }),
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

  const collectionPageStructuredDataFallback = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "أحدث المقالات والمدونات",
    description: "مجموعة من أحدث المقالات والمدونات الاحترافية",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.map((article: ArticleResponse, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Article",
          headline: article.title,
          description: article.excerpt,
          url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com"}/articles/${article.slug}`,
          datePublished: article.publishedAt,
          author: {
            "@type": "Person",
            name: article.author.name || "Modonty",
          },
          publisher: {
            "@type": "Organization",
            name: article.client.name,
          },
        },
      })),
    },
  };

  const jsonLdToRender = storedJsonLd?.trim() || JSON.stringify(collectionPageStructuredDataFallback);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdToRender,
        }}
      />
      <FeedContainer posts={posts} />
    </>
  );
}

