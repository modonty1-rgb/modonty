import { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { generateMetadataFromSEO, generateStructuredData, generateBreadcrumbStructuredData } from "@/lib/seo";
import { getClientForMetadata } from "./helpers/client-metadata";
import { getClientPageData } from "./helpers/client-page-data";
import { getClientReviewsBySlug } from "./helpers/client-reviews";
import { getClientFollowers } from "./helpers/client-followers";
import { getClientEngagementBySlug } from "./helpers/client-engagement";
import { articleToFeedPost } from "./helpers/article-to-feed-post";
import { getArticles } from "@/app/api/helpers/article-queries";
import { FEED_PAGE_SIZE } from "@/lib/feed-constants";
import type { FeedPost } from "@/lib/types";
import { ClientPageLeft, ClientPageFeed, ClientPageRight } from "./components/client-page";
import { ClientViewTracker } from "./components/client-view-tracker";
import ClientLoading from "./loading";

/** Fixes malformed JSON-LD from admin cache: renames bare "id" and "type" keys
 *  to "@id" and "@type" at every level of the @graph array.
 *  Only renames keys that are exactly "id" or "type" (not "contactType", etc.)
 */
function sanitizeJsonLd(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.["@graph"] && Array.isArray(parsed["@graph"])) {
      parsed["@graph"] = parsed["@graph"].map((node: Record<string, unknown>) => {
        const fixed: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(node)) {
          if (k === "id") fixed["@id"] = v;
          else if (k === "type") fixed["@type"] = v;
          else fixed[k] = v;
        }
        return fixed;
      });
    }
    return JSON.stringify(parsed);
  } catch {
    return raw;
  }
}

interface ClientPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const clients = await db.client.findMany({
      select: { slug: true },
    });

    if (!clients || clients.length === 0) {
      // Next.js with Cache Components requires at least one result during build-time.
      // Return a placeholder so the build can complete; the page will render `notFound()` later.
      return [{ slug: "__no_clients__" }];
    }

    return clients.map((client) => ({
      slug: client.slug,
    }));
  } catch {
    // Same reasoning as above: ensure we always return at least one param for build-time validation.
    return [{ slug: "__no_clients__" }];
  }
}

export async function generateMetadata({ params }: ClientPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const client = await getClientForMetadata(decodedSlug);

    if (!client) {
      return {
        title: "عميل غير موجود - مودونتي",
      };
    }
    // DB cache first
    const [cached, settings] = await Promise.all([
      db.client.findUnique({
        where: { slug: decodedSlug },
        select: { nextjsMetadata: true },
      }),
      db.settings.findFirst({
        select: { siteUrl: true },
      }),
    ]);
    const siteUrl = (settings?.siteUrl || "https://www.modonty.com").replace(/\/$/, "");
    const canonicalUrl = `${siteUrl}/clients/${encodeURIComponent(decodedSlug)}`;

    if (cached?.nextjsMetadata) {
      const stored = cached.nextjsMetadata as Metadata;
      if (stored.title) {
        return {
          ...stored,
          openGraph: {
            ...(stored.openGraph as object | undefined),
            url: canonicalUrl,
          },
          alternates: {
            canonical: canonicalUrl,
            languages: {
              ar: canonicalUrl,
              "x-default": canonicalUrl,
            },
          },
        };
      }
    }
    return generateMetadataFromSEO({
      title: client.seoTitle || client.name,
      description: client.seoDescription || `استكشف مقالات ${client.name}`,
      image: client.ogImageMedia?.url || client.logoMedia?.url || undefined,
      url: `${siteUrl}/clients/${encodeURIComponent(decodedSlug)}`,
      type: "website",
      languages: {
        ar: canonicalUrl,
        "x-default": canonicalUrl,
      },
    });
  } catch {
    return {
      title: "العملاء - مودونتي",
    };
  }
}

async function ClientPageContent({ params }: ClientPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  try {
    const [data, articlesResult, reviewsData, followers, engagementData, cachedSeo] = await Promise.all([
      getClientPageData(slug),
      getArticles({ page: 1, limit: FEED_PAGE_SIZE, client: decodedSlug }),
      getClientReviewsBySlug(slug),
      getClientFollowers(slug),
      getClientEngagementBySlug(slug),
      db.client.findUnique({
        where: { slug: decodedSlug },
        select: { jsonLdStructuredData: true },
      }),
    ]);

    if (!data) {
      notFound();
    }

    const { client, stats, relatedClients } = data;
    const reviews = reviewsData?.reviews ?? [];
    const engagement = engagementData ?? {
      followersCount: 0,
      favoritesCount: 0,
      articleLikesCount: 0,
    };
    const posts: FeedPost[] = articlesResult.articles.map(articleToFeedPost);

    const structuredData = generateStructuredData({
      type: "Client",
      name: client.name,
      description: (client as any).description || client.seoDescription || undefined,
      url: client.url || `/clients/${encodeURIComponent(slug)}`,
      image: client.logoMedia?.url || client.ogImageMedia?.url || undefined,
      "@type": "Organization",
      legalName: client.legalName || undefined,
      email: client.email || undefined,
      telephone: client.phone || undefined,
      sameAs: client.sameAs.length > 0 ? client.sameAs : undefined,
      foundingDate: (client as any).foundingDate ? 
        (typeof (client as any).foundingDate === "string" 
          ? (client as any).foundingDate.split("T")[0] 
          : (client as any).foundingDate.toISOString().split("T")[0]) 
        : undefined,
    });

    const breadcrumbData = generateBreadcrumbStructuredData([
      { name: "الرئيسية", url: "/" },
      { name: "العملاء", url: "/clients" },
      { name: client.name, url: `/clients/${encodeURIComponent(slug)}` },
    ]);

    return (
      <>
        {cachedSeo?.jsonLdStructuredData ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(cachedSeo.jsonLdStructuredData) }}
          />
        ) : (
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
            />
          </>
        )}
        <ClientViewTracker clientSlug={client.slug} />
        {/* 3 col: left | feed | right - grid for consistent top alignment */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6 items-start">
          <ClientPageLeft client={client} />
          <ClientPageFeed posts={posts} clientName={client.name} clientId={client.id} relatedClientsCount={relatedClients.length} />
          <ClientPageRight
          client={client}
          relatedClients={relatedClients}
          reviews={reviews}
          followers={followers ?? []}
          engagement={engagement}
        />
        </div>
      </>
    );
  } catch (error) {
    notFound();
  }
}

export default function ClientPage(props: ClientPageProps) {
  return (
    <Suspense fallback={<ClientLoading />}>
      <ClientPageContent {...props} />
    </Suspense>
  );
}
