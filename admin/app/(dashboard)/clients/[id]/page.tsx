import { redirect } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { getClientById, getClientArticles, getClientAnalytics, getClientMedia } from "../actions/clients-actions";
import { ClientHeader } from "./components/client-header";
import { ClientTabs } from "./components/client-tabs";
import { ArticleStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";

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
    if (client.nextjsMetadata) {
      try {
        const metaTags = client.nextjsMetadata as {
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

  // Calculate SEO score from cached data (same logic as list page)
  let seoScore = 0;
  const meta = client.nextjsMetadata as Record<string, any> | null;
  if (meta && typeof meta === "object") {
    const title = typeof meta.title === "string" ? meta.title.trim() : "";
    const desc = typeof meta.description === "string" ? meta.description.trim() : "";
    const ogImages = meta.openGraph?.images;
    const hasOg =
      Array.isArray(ogImages) && ogImages.length > 0 && !!(ogImages[0] as any)?.url;
    if (title) seoScore += 20;
    if (desc) seoScore += 20;
    if (hasOg) seoScore += 10;
  }
  if (client.jsonLdStructuredData) {
    try {
      const parsed = JSON.parse(client.jsonLdStructuredData);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "@context" in parsed &&
        "@graph" in parsed
      ) {
        seoScore += 30;
        const rep = client.jsonLdValidationReport as Record<string, any> | null;
        const errs =
          (Array.isArray(rep?.adobe?.errors) ? (rep.adobe.errors as unknown[]).length : 0) +
          (Array.isArray(rep?.custom?.errors) ? (rep.custom.errors as unknown[]).length : 0);
        if (errs === 0) seoScore += 20;
      }
    } catch {}
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
    <div className="p-4 sm:p-6 space-y-4">
      <ClientHeader client={client as any} seoScore={seoScore} />
      {seoScore < 80 && (
        <div className="bg-muted/30 border border-border rounded-lg p-4 flex items-center gap-4">
          <div
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 flex-shrink-0 ${
              seoScore >= 80 ? "border-green-500" : seoScore >= 50 ? "border-yellow-500" : "border-destructive"
            }`}
          >
            <span
              className={
                seoScore >= 80
                  ? "text-green-500 font-bold text-base"
                  : seoScore >= 50
                    ? "text-yellow-500 font-bold text-base"
                    : "text-destructive font-bold text-base"
              }
            >
              {seoScore}%
            </span>
            <span className="text-[9px] text-muted-foreground">SEO</span>
          </div>
          <div className="flex-1">
            <h3 className="text-foreground font-semibold text-sm">SEO data incomplete</h3>
            <p className="text-muted-foreground text-xs mt-0.5">
              Add SEO data to improve client visibility in search results
            </p>
          </div>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href={`/clients/${id}/seo`}>Setup SEO</Link>
          </Button>
        </div>
      )}
      <div>
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
