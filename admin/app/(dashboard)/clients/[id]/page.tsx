import { redirect, notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";

// MongoDB ObjectId = 24 hex chars. Guards against reserved words / garbage ids
// (e.g. /clients/verify) hitting Prisma with a malformed id and crashing with a 500.
const isValidObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);
import { getClientById, getClientArticles, getClientAnalytics, getClientMedia } from "../actions/clients-actions";
import { ClientHeader } from "./components/client-header";
import { ClientTabs } from "./components/client-tabs";
import { ArticleStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { loadSiteUrl } from "@/lib/seo/site-url";
import { computeClientSeoScore } from "@modonty/database/lib/seo/client/seo-score";
import { clientToSeoInput } from "@modonty/database/lib/seo/client/from-client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return { title: "Client Not Found - Modonty" };
    }
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
        url: client.canonicalUrl || `${await loadSiteUrl()}/clients/${client.slug}`,
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

  if (!isValidObjectId(id)) {
    notFound();
  }

  const [client, articles, analytics, media] = await Promise.all([
    getClientById(id),
    getClientArticles(id),
    getClientAnalytics(id),
    getClientMedia(id),
  ]);

  if (!client) {
    redirect("/clients");
  }

  // SEO score — SHARED helper (single source of truth used by admin SEO page +
  // console portal) so every surface shows the SAME number from the same data.
  const { score: seoScore } = computeClientSeoScore(
    clientToSeoInput(client as unknown as Record<string, unknown>),
  );

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

  const publicBaseUrl = await loadSiteUrl();
  const promised =
    client.articlesPerMonth ?? client.subscriptionTierConfig?.articlesPerMonth ?? 0;
  const memberSince = new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
  }).format(new Date(client.createdAt));

  return (
    <div className="space-y-4">
      <ClientHeader client={client as any} publicBaseUrl={publicBaseUrl} seoScore={seoScore} />

      {/* KPI strip — content-writer focus (no billing). Dominant = total articles. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link
          href={`/articles?clientId=${id}`}
          className="rounded-xl border bg-gradient-to-br from-primary/[0.07] to-transparent p-4 hover:border-primary/40 transition-colors"
        >
          <div className="text-xs text-muted-foreground mb-1.5">📄 إجمالي المقالات</div>
          <div className="text-3xl font-extrabold leading-none">
            {client._count.articles}
            <span className="text-xs font-semibold text-muted-foreground ms-1.5">
              منشور{promised > 0 ? ` · ${promised}/شهر` : ""}
            </span>
          </div>
        </Link>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs text-muted-foreground mb-1.5">📅 هذا الشهر</div>
          <div className="text-lg font-bold">
            {articlesThisMonth}
            {promised > 0 && <span className="text-sm font-normal text-muted-foreground"> / {promised}</span>}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs text-muted-foreground mb-1.5">🏷️ الصناعة</div>
          <div className="text-base font-bold truncate">{client.industry?.name ?? "—"}</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs text-muted-foreground mb-1.5">🗓️ عميل منذ</div>
          <div className="text-base font-bold">{memberSince}</div>
        </div>
      </div>

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
