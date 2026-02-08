import { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import dynamicImport from "next/dynamic";
import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { generateMetadataFromSEO, generateStructuredData, generateBreadcrumbStructuredData } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { ClientHero } from "./components/client-hero";
import { getClientStats, getRelatedClients } from "./helpers/client-stats";
import { getClientForMetadata } from "./helpers/client-metadata";

// Dynamic imports for client components (code splitting + SSR where possible)
const GTMClientTracker = dynamicImport(
  () => import("@/components/gtm/GTMClientTracker").then((mod) => ({ default: mod.GTMClientTracker })),
  { ssr: true } // Component already handles browser API checks internally
);

const ClientContact = dynamicImport(
  () => import("./components/client-contact").then((mod) => ({ default: mod.ClientContact })),
  { ssr: true } // Can SSR, but needs clipboard API on client
);

import { ShareClientButtonWrapper } from "./components/share-client-button-wrapper";
import { ClientTabsContainer } from "./components/client-tabs-container";
import ClientLoading from "./loading";

interface ClientPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const clients = await db.client.findMany({
      select: { slug: true },
    });

    return clients.map((client) => ({
      slug: client.slug,
    }));
  } catch {
    return [];
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

    return generateMetadataFromSEO({
      title: client.seoTitle || client.name,
      description: client.seoDescription || `استكشف مقالات ${client.name}`,
      image: client.ogImageMedia?.url || client.logoMedia?.url || undefined,
      url: `/clients/${slug}`,
      type: "website",
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
    const [client, stats] = await Promise.all([
      db.client.findUnique({
        where: { slug: decodedSlug },
        include: {
          logoMedia: {
            select: {
              url: true,
            },
          },
          ogImageMedia: {
            select: {
              url: true,
            },
          },
          twitterImageMedia: {
            select: {
              url: true,
            },
          },
          industry: {
            select: {
              name: true,
            },
          },
          articles: {
            where: {
              status: ArticleStatus.PUBLISHED,
            },
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              featuredImage: {
                select: {
                  url: true,
                  altText: true,
                },
              },
            },
            orderBy: {
              datePublished: "desc",
            },
          },
          _count: {
            select: {
              articles: {
                where: {
                  status: ArticleStatus.PUBLISHED,
                },
              },
            },
          },
        },
      }),
      (async () => {
        const tempClient = await db.client.findUnique({
          where: { slug: decodedSlug },
          select: { id: true },
        });
        return tempClient ? getClientStats(tempClient.id) : { followers: 0, totalViews: 0 };
      })(),
    ]);

    if (!client) {
      notFound();
    }

    const relatedClients = await getRelatedClients(client.id, client.industryId);

    const structuredData = generateStructuredData({
      type: "Client",
      name: client.name,
      description: (client as any).description || client.seoDescription || undefined,
      url: client.url || `/clients/${slug}`,
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
      { name: client.name, url: `/clients/${slug}` },
    ]);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
        <GTMClientTracker
          clientContext={{
            client_id: client.id,
            client_slug: client.slug,
            client_name: client.name,
          }}
          pageTitle={client.seoTitle || client.name}
        />
        <>
          <Breadcrumb
            items={[
              { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
              { label: "العملاء", href: "/clients" },
              { label: client.name },
            ]}
          />

          {/* Hero Section */}
          <ClientHero
            client={client}
            stats={{
              followers: stats.followers,
              articles: client._count.articles,
              totalViews: stats.totalViews,
            }}
            initialIsFollowing={false}
          />

          {/* Main Content with Tabs */}
          <main className="container mx-auto max-w-[1128px] px-4 py-8 flex-1">
            <div className="flex items-center justify-end mb-6">
              <ShareClientButtonWrapper
                clientName={client.name}
                clientUrl={`/clients/${client.slug}`}
              />
            </div>

            <Suspense fallback={<div className="h-64 bg-muted rounded-md animate-pulse" />}>
            <ClientTabsContainer
              articles={client.articles}
              articlesCount={client._count.articles}
              client={client}
              relatedClients={relatedClients}
            />
            </Suspense>
          </main>
        </>
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
