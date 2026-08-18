import { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { buildHreflangLanguages } from "@modonty/shared/lib/seo/build-hreflang-languages";
import { SubscriptionStatus, ArticleStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { generateMetadataFromSEO, generateStructuredData, generateBreadcrumbStructuredData, jsonLdHtml, jsonLdHtmlFromString } from "@/lib/seo";
import { cacheTag, cacheLife } from "next/cache";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";
import { HOME_BLOCKS } from "@modonty/shared/components/partner-site/free/home";
import { PageBlocks } from "./components/page-blocks";
import { getClientPageData } from "./helpers/client-page-data";
import { getClientPageFaqs } from "./helpers/client-faqs";
import { getClientGallery } from "./helpers/client-gallery";
import { resolveClientPageState } from "./components/client-page-state";
import { ClientNotReadyPanel } from "./components/states/client-not-ready-panel";
import { ClientViewTracker } from "./components/client-view-tracker";
import { PartnerHomeSkeleton } from "./components/home/partner-home-skeleton";

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

// Cached + EXCLUSIVE to metadata (not shared with the dynamic page) so the tags land
// in the prerendered shell <head> instead of being streamed into <body>.
async function getClientForMetadata(decodedSlug: string) {
  "use cache";
  cacheTag("clients");
  cacheLife("hours");
  return db.client.findUnique({
    where: { slug: decodedSlug, subscriptionStatus: SubscriptionStatus.ACTIVE },
    select: {
      name: true,
      seoTitle: true,
      seoDescription: true,
      description: true,
      nextjsMetadata: true,
      phone: true,
      email: true,
      addressCity: true,
      achievements: true,
      logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
      heroImageMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
      _count: { select: { articles: { where: { status: ArticleStatus.PUBLISHED } } } },
    },
  });
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

    const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";
    // Normalize: modonty.com → www.modonty.com
    const siteUrl = rawSiteUrl.replace(/^(https?:\/\/)(?!www\.)modonty\.com/, "$1www.modonty.com").replace(/\/$/, "");
    const canonicalUrl = `${siteUrl}/clients/${encodeURIComponent(decodedSlug)}`;

    // From Settings, not a literal: both returns below used to spell out `{ ar, x-default }`,
    // so a partner page reached two markets while Settings listed nine.
    const hreflangLanguages = buildHreflangLanguages(
      (await getPageSeoDefaults()).alternateLanguages,
      canonicalUrl,
      siteUrl,
    );

    // Thin "قيد التجهيز" pages → noindex,follow (perfect-before-index golden rule).
    let robots: Metadata["robots"] | undefined;
    const ps = resolveClientPageState({
      aboutText: client.description || client.seoDescription,
      servicesCount: 0,
      articlesCount: client._count.articles,
      teamCount: 0,
      achievementsCount: Array.isArray(client.achievements) ? client.achievements.length : 0,
      galleryCount: 0,
      hasContact: !!(client.phone || client.email || client.addressCity),
    });
    if (ps === "not-ready") robots = { index: false, follow: true };

    const stored = client.nextjsMetadata as Metadata | null;
    if (stored?.title) {
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
          languages: hreflangLanguages,
        },
      };
    }
    return {
      ...generateMetadataFromSEO({
        title: (client.seoTitle || client.name)?.slice(0, 51),
        description: client.seoDescription || `استكشف مقالات ${client.name}`,
        image: mediaSrc(client.heroImageMedia) || mediaSrc(client.logoMedia) || undefined,
        url: canonicalUrl,
        type: "website",
        languages: hreflangLanguages,
      }),
      ...(robots ? { robots } : {}),
    };
  } catch {
    return {
      title: "الشركاء - مدونتي",
    };
  }
}

/** JSON-LD (cached bundle or live fallback) + FAQPage + view tracking + the not-ready gate — the SEO half, unchanged by the template work. */
async function ClientPageMeta({ params }: ClientPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  try {
    const [data, faqs, gallery] = await Promise.all([getClientPageData(slug), getClientPageFaqs(decodedSlug), getClientGallery(decodedSlug)]);
    if (!data) notFound();
    const { client } = data;

    const pageState = resolveClientPageState({
      aboutText: client.description || client.seoDescription,
      servicesCount: client.services?.length ?? 0,
      articlesCount: client._count.articles,
      teamCount: client.teamMembers?.length ?? 0,
      achievementsCount: client.achievements?.length ?? 0,
      galleryCount: gallery.length,
      hasContact: !!(client.phone || client.email || client.addressCity || (client.addressLatitude != null && client.addressLongitude != null)),
    });

    const buildFallbackOrganization = () =>
      generateStructuredData({
        type: "Client",
        name: client.name,
        description: client.description || client.seoDescription || undefined,
        url: client.url || `/clients/${encodeURIComponent(slug)}`,
        image: mediaSrc(client.logoMedia) || mediaSrc(client.heroImageMedia) || undefined,
        "@type": "Organization",
        legalName: client.legalName || undefined,
        email: client.email || undefined,
        telephone: client.phone || undefined,
        sameAs: client.sameAs.length > 0 ? client.sameAs : undefined,
        foundingDate: client.foundingDate
          ? (typeof client.foundingDate === "string" ? (client.foundingDate as string).split("T")[0] : client.foundingDate.toISOString().split("T")[0])
          : undefined,
      });

    const breadcrumbData = generateBreadcrumbStructuredData([
      { name: "الرئيسية", url: "/" },
      { name: "الشركاء", url: "/clients" },
      { name: client.name, url: `/clients/${encodeURIComponent(slug)}` },
    ]);

    return (
      <>
        {client.jsonLdStructuredData ? (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtmlFromString(client.jsonLdStructuredData) }} />
        ) : (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(buildFallbackOrganization()) }} />
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbData) }} />
        {faqs.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: jsonLdHtml({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
              }),
            }}
          />
        )}
        <ClientViewTracker clientSlug={client.slug} />
        {pageState === "not-ready" ? (
          <div className="px-4 py-6">
            <ClientNotReadyPanel clientId={client.id} clientName={client.name} clientSlug={client.slug} ctaMode={client.ctaMode} ctaUrl={client.ctaUrl} ctaLabel={client.ctaLabel} />
          </div>
        ) : (
          <PageBlocks slug={slug} blocks={HOME_BLOCKS} />
        )}
      </>
    );
  } catch {
    notFound();
  }
}

export default function ClientPage(props: ClientPageProps) {
  return (
    <Suspense fallback={<PartnerHomeSkeleton />}>
      <ClientPageMeta {...props} />
    </Suspense>
  );
}
