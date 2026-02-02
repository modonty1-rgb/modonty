import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getClientById, getClientArticles, getClientAnalytics, getClientMedia } from "../actions/clients-actions";
import { ClientHeader } from "./components/client-header";
import { ClientTabs } from "./components/client-tabs";
import { ArticleStatus } from "@prisma/client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    const client = await getClientById(id);

    if (!client) {
      return {
        title: "Client Not Found - Modonty",
      };
    }

    // Use stored metaTags if available
    if (client.metaTags) {
      try {
        const metaTags = client.metaTags as {
          title: string;
          description: string;
          robots?: string;
          author?: string;
          language?: string;
          openGraph?: {
            title: string;
            description: string;
            type: string;
            url: string;
            siteName: string;
            locale: string;
            images?: Array<{
              url: string;
              secure_url: string;
              type: string;
              width: number;
              height: number;
              alt: string;
            }>;
          };
          twitter?: {
            card: string;
            title: string;
            description: string;
            image?: string;
            imageAlt?: string;
            site?: string;
            creator?: string;
          };
          canonical?: string;
          themeColor?: string;
        };

        // Build Next.js Metadata object from stored metaTags
        const metadata: Metadata = {
          title: metaTags.title || client.name,
          description: metaTags.description || "",
          authors: metaTags.author ? [{ name: metaTags.author }] : undefined,
          robots: metaTags.robots
            ? {
                index: metaTags.robots.includes("index"),
                follow: metaTags.robots.includes("follow"),
                googleBot: {
                  index: metaTags.robots.includes("index"),
                  follow: metaTags.robots.includes("follow"),
                  "max-image-preview": "large" as const,
                  "max-snippet": -1,
                  "max-video-preview": -1,
                },
              }
            : undefined,
          alternates: {
            canonical: metaTags.canonical || undefined,
          },
          openGraph: metaTags.openGraph
            ? {
                title: metaTags.openGraph.title,
                description: metaTags.openGraph.description,
                type: metaTags.openGraph.type as "website" | "article",
                url: metaTags.openGraph.url,
                siteName: metaTags.openGraph.siteName,
                locale: metaTags.openGraph.locale,
                images: metaTags.openGraph.images?.map((img) => ({
                  url: img.secure_url || img.url,
                  width: img.width,
                  height: img.height,
                  alt: img.alt,
                })),
              }
            : undefined,
          twitter: metaTags.twitter
            ? {
                card: metaTags.twitter.card as "summary" | "summary_large_image",
                title: metaTags.twitter.title,
                description: metaTags.twitter.description,
                images: metaTags.twitter.image ? [metaTags.twitter.image] : undefined,
                creator: metaTags.twitter.creator,
                site: metaTags.twitter.site,
              }
            : undefined,
          other: {},
        };

        // Inject JSON-LD via other property
        if (client.jsonLdStructuredData) {
          try {
            const jsonLd = JSON.parse(client.jsonLdStructuredData);
            metadata.other = {
              "application/ld+json": JSON.stringify(jsonLd),
            };
          } catch {
            // Invalid JSON-LD, skip
          }
        }

        return metadata;
      } catch {
        // Invalid metaTags, fall through to generation
      }
    }

    // Fallback: Generate basic metadata
    const title = client.seoTitle || client.name;
    const description = client.seoDescription || client.description || "";

    return {
      title: title,
      description: description,
      openGraph: {
        title: title,
        description: description,
        type: "website",
        url: client.canonicalUrl || `${process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com"}/clients/${client.slug}`,
        siteName: "Modonty",
        locale: "ar_SA",
      },
      other: client.jsonLdStructuredData
        ? {
            "application/ld+json": client.jsonLdStructuredData,
          }
        : {},
    };
  } catch (error) {
    return {
      title: "Client - Modonty",
    };
  }
}

export default async function ClientViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const [client, articles, analytics, media] = await Promise.all([
    getClientById(id),
    getClientArticles(id),
    getClientAnalytics(id),
    getClientMedia(id),
  ]);

  if (!client) {
    redirect("/clients");
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  const articlesThisMonth = articles.filter(
    (article) =>
      article.status === ArticleStatus.PUBLISHED &&
      article.datePublished &&
      new Date(article.datePublished) >= startOfMonth &&
      new Date(article.datePublished) <= endOfMonth
  ).length;

  return (
    <div className="container mx-auto max-w-[1128px]">
      <ClientHeader client={client} />
      <div className="mt-6">
        <ClientTabs
          client={client as any}
          articles={articles}
          articlesThisMonth={articlesThisMonth}
          analytics={analytics}
          media={media}
        />
      </div>
    </div>
  );
}
