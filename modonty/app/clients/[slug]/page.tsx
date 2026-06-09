import { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SubscriptionStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateMetadataFromSEO, generateStructuredData, generateBreadcrumbStructuredData } from "@/lib/seo";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";
import { getClientForMetadata } from "./helpers/client-metadata";
import { getClientPageData } from "./helpers/client-page-data";
import { getClientReviews, getClientReviewsBySlug } from "./helpers/client-reviews";
import { getClientPageFaqs } from "./helpers/client-faqs";
import { getClientGallery } from "./helpers/client-gallery";
import { resolveClientPageState } from "./components/client-page-state";
import { ClientPageShell, type ShellClient } from "./components/client-page/client-page-shell";
import { ClientNotReadyPanel } from "./components/states/client-not-ready-panel";
import { ClientViewTracker } from "./components/client-view-tracker";
import ClientLoading from "./loading";

interface ClientPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const clients = await db.client.findMany({
      where: { subscriptionStatus: SubscriptionStatus.ACTIVE },
      select: { slug: true },
    });

    if (!clients || clients.length === 0) {
      return [{ slug: "__no_clients__" }];
    }

    return clients.map((client) => ({
      slug: client.slug,
    }));
  } catch {
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
        title: "عميل غير موجود - مدونتي",
      };
    }
    // DB cache first
    const [cached, settings, pageData] = await Promise.all([
      db.client.findUnique({
        where: { slug: decodedSlug },
        select: { nextjsMetadata: true },
      }),
      db.settings.findUnique({
        where: SETTINGS_SINGLETON_WHERE,
        select: { siteUrl: true },
      }),
      getClientPageData(slug),
    ]);
    const rawSiteUrl = settings?.siteUrl || "https://www.modonty.com";
    // Normalize: modonty.com → www.modonty.com
    const siteUrl = rawSiteUrl.replace(/^(https?:\/\/)(?!www\.)modonty\.com/, "$1www.modonty.com").replace(/\/$/, "");
    const canonicalUrl = `${siteUrl}/clients/${encodeURIComponent(decodedSlug)}`;

    // Thin "قيد التجهيز" pages → noindex,follow (perfect-before-index golden rule).
    let robots: Metadata["robots"] | undefined;
    if (pageData) {
      const c = pageData.client;
      const ps = resolveClientPageState({
        aboutText: c.description || c.seoDescription,
        servicesCount: c.services?.length ?? 0,
        articlesCount: c._count.articles,
        teamCount: c.teamMembers?.length ?? 0,
        achievementsCount: c.achievements?.length ?? 0,
        galleryCount: 0,
        hasContact: !!(c.phone || c.email || c.addressCity),
      });
      if (ps === "not-ready") robots = { index: false, follow: true };
    }

    if (cached?.nextjsMetadata) {
      const stored = cached.nextjsMetadata as Metadata;
      if (stored.title) {
        return {
          ...stored,
          description: (stored.description as string | undefined) || client.seoDescription || `استكشف مقالات وخدمات ${client.name} على مدونتي`,
          ...(robots ? { robots } : {}),
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
    return {
      ...generateMetadataFromSEO({
        title: (client.seoTitle || client.name)?.slice(0, 51),
        description: client.seoDescription || `استكشف مقالات ${client.name}`,
        image: client.heroImageMedia?.url || client.logoMedia?.url || undefined,
        url: `${siteUrl}/clients/${encodeURIComponent(decodedSlug)}`,
        type: "website",
        languages: {
          ar: canonicalUrl,
          "x-default": canonicalUrl,
        },
      }),
      ...(robots ? { robots } : {}),
    };
  } catch {
    return {
      title: "الشركاء - مدونتي",
    };
  }
}

async function ClientPageContent({ params }: ClientPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  try {
    const [data, reviews, discussionsData, gallery, faqs, cachedSeo, session] = await Promise.all([
      getClientPageData(slug),
      getClientReviews(slug),
      getClientReviewsBySlug(slug), // ARTICLE comments → repurposed as "discussions"
      getClientGallery(decodedSlug),
      getClientPageFaqs(decodedSlug), // page-level ClientFAQ
      db.client.findUnique({
        where: { slug: decodedSlug },
        select: { jsonLdStructuredData: true },
      }),
      auth(),
    ]);

    if (!data) {
      notFound();
    }

    const { client, stats, relatedClients } = data;
    const userBox = session?.user
      ? { name: session.user.name ?? null, email: session.user.email ?? null }
      : null;

    const discussions = (discussionsData?.reviews ?? []).map((r) => ({
      id: r.id,
      content: r.content,
      createdAt: r.createdAt,
      author: { name: r.author?.name ?? null, image: r.author?.image ?? null },
      article: r.article ? { title: r.article.title, slug: r.article.slug } : null,
    }));

    const pageState = resolveClientPageState({
      aboutText: client.description || client.seoDescription,
      servicesCount: client.services?.length ?? 0,
      articlesCount: client._count.articles,
      teamCount: client.teamMembers?.length ?? 0,
      achievementsCount: client.achievements?.length ?? 0,
      galleryCount: gallery.length,
      hasContact: !!(
        client.phone ||
        client.email ||
        client.addressCity ||
        (client.addressLatitude != null && client.addressLongitude != null)
      ),
    });

    const structuredData = generateStructuredData({
      type: "Client",
      name: client.name,
      description: client.description || client.seoDescription || undefined,
      url: client.url || `/clients/${encodeURIComponent(slug)}`,
      image: client.logoMedia?.url || client.heroImageMedia?.url || undefined,
      "@type": "Organization",
      legalName: client.legalName || undefined,
      email: client.email || undefined,
      telephone: client.phone || undefined,
      sameAs: client.sameAs.length > 0 ? client.sameAs : undefined,
      foundingDate: client.foundingDate
        ? (typeof client.foundingDate === "string"
            ? (client.foundingDate as string).split("T")[0]
            : client.foundingDate.toISOString().split("T")[0])
        : undefined,
    });

    const breadcrumbData = generateBreadcrumbStructuredData([
      { name: "الرئيسية", url: "/" },
      { name: "الشركاء", url: "/clients" },
      { name: client.name, url: `/clients/${encodeURIComponent(slug)}` },
    ]);

    return (
      <>
        {/* Organization JSON-LD — DB cache (rich graph: Service/AggregateRating/Review/employee/hasCredential/image) or live fallback */}
        {cachedSeo?.jsonLdStructuredData ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: cachedSeo.jsonLdStructuredData }}
          />
        ) : (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
        {/* FAQPage JSON-LD — page-level ClientFAQ (answered + published) */}
        {faqs.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: faqs.map((faq) => ({
                  "@type": "Question",
                  name: faq.question,
                  acceptedAnswer: { "@type": "Answer", text: faq.answer },
                })),
              }),
            }}
          />
        )}
        <ClientViewTracker clientSlug={client.slug} />

        {pageState === "not-ready" ? (
          <div className="px-4 py-6">
            <ClientNotReadyPanel
              clientId={client.id}
              clientName={client.name}
              ctaMode={client.ctaMode}
              ctaUrl={client.ctaUrl}
              ctaLabel={client.ctaLabel}
              user={userBox}
            />
          </div>
        ) : (
          <ClientPageShell
            client={client as unknown as ShellClient}
            stats={stats}
            pageState={pageState}
            reviews={reviews}
            faqs={faqs}
            gallery={gallery}
            discussions={discussions}
            relatedClients={relatedClients}
            user={userBox}
            initialIsFollowing={false}
          />
        )}
      </>
    );
  } catch {
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
