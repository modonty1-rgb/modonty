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
import { getPartnerSite } from "./helpers/get-partner-site";
import { getClientPageData } from "./helpers/client-page-data";
import { getClientReviews } from "./helpers/client-reviews";
import { getClientPageFaqs } from "./helpers/client-faqs";
import { getClientGallery } from "./helpers/client-gallery";
import { resolveClientPageState } from "./components/client-page-state";
import { ClientNotReadyPanel } from "./components/states/client-not-ready-panel";
import { ClientViewTracker } from "./components/client-view-tracker";
import { PartnerHero } from "./components/home/partner-hero";
import { BookingCard, BookingCardSkeleton } from "./components/home/booking-card";
import { CredentialsStrip } from "./components/home/credentials-strip";
import { ServicesTeaser } from "./components/home/services-teaser";
import { AchievementsStrip } from "./components/home/achievements-strip";
import { GalleryTeaser } from "./components/home/gallery-teaser";
import { ArticlesTeaser } from "./components/home/articles-teaser";
import { AboutTeaser } from "./components/home/about-teaser";
import { ClientReviewsSection } from "./components/sections/client-reviews-section";
import { ContactBlock } from "./components/home/contact-block";
import { FinalCta } from "./components/home/final-cta";
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

/**
 * Hero from cached data only (no auth/cookies) so it is part of the prerendered shell:
 * the real cover + name paint immediately. The request card inside it reads session +
 * geo, so it streams behind its own boundary. Returns null for not-found / not-ready.
 */
async function ClientHeroBlock({ params }: ClientPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const [site, reviews] = await Promise.all([getPartnerSite(decodedSlug), getClientReviews(slug)]);
  if (!site) return null;

  return (
    <PartnerHero
      site={site}
      rating={{ average: reviews.averageRating, count: reviews.reviewCount }}
      requestSlot={
        <Suspense fallback={<BookingCardSkeleton />}>
          <BookingCard
            clientId={site.id}
            clientName={site.name}
            phone={site.phone ?? null}
            ctaMode={site.ctaMode}
            ctaLabel={site.ctaLabel ?? null}
            ctaUrl={site.ctaUrl ?? null}
          />
        </Suspense>
      }
    />
  );
}

async function ClientPageBody({ params }: ClientPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  try {
    const [site, data, reviews, gallery, faqs] = await Promise.all([
      getPartnerSite(decodedSlug),
      getClientPageData(slug),
      getClientReviews(slug),
      getClientGallery(decodedSlug),
      getClientPageFaqs(decodedSlug), // page-level ClientFAQ → FAQPage JSON-LD
    ]);

    if (!site || !data) {
      notFound();
    }

    const { client } = data;
    const base = `/clients/${encodeURIComponent(client.slug)}`;

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

    // Built only when the DB cache is empty — see the branch below.
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
          ? (typeof client.foundingDate === "string"
              ? (client.foundingDate as string).split("T")[0]
              : client.foundingDate.toISOString().split("T")[0])
          : undefined,
      });

    // Breadcrumb always ships — it is a separate entity, not an alternative to the graph above.
    const breadcrumbData = generateBreadcrumbStructuredData([
      { name: "الرئيسية", url: "/" },
      { name: "الشركاء", url: "/clients" },
      { name: client.name, url: `/clients/${encodeURIComponent(slug)}` },
    ]);

    const articles = client.articles.slice(0, 3).map((a) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      image: a.featuredImage ?? null,
      category: a.category?.name ?? null,
      datePublished: a.datePublished ?? null,
    }));

    return (
      <>
        {/* Organization JSON-LD — DB cache (rich graph: Service/AggregateRating/Review/employee/hasCredential/image) or live fallback */}
        {client.jsonLdStructuredData ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLdHtmlFromString(client.jsonLdStructuredData) }}
          />
        ) : (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLdHtml(buildFallbackOrganization()) }}
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbData) }}
        />
        {/* FAQPage JSON-LD — page-level ClientFAQ (answered + published) */}
        {faqs.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: jsonLdHtml({
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
              clientSlug={client.slug}
              ctaMode={client.ctaMode}
              ctaUrl={client.ctaUrl}
              ctaLabel={client.ctaLabel}
            />
          </div>
        ) : (
          <>
            <CredentialsStrip credentials={site.credentials} />
            <div className="space-y-20 pt-16">
              <ServicesTeaser services={site.services} base={base} />
              <AchievementsStrip achievements={site.achievements} />
              <GalleryTeaser images={gallery} totalCount={site._count.media} base={base} />
              <ArticlesTeaser articles={articles} totalCount={client._count.articles} base={base} />
              <AboutTeaser
                site={site}
                videoUrl={client.introVideoMedia?.mp4Url ?? client.introVideoUrl ?? null}
                videoPoster={client.introVideoMedia?.thumbnailUrl ?? null}
                base={base}
              />
              {reviews.reviewCount > 0 ? (
                <div className="mx-auto max-w-[1216px] px-4">
                  <ClientReviewsSection
                    reviews={reviews.reviews.map((r) => ({
                      id: r.id,
                      rating: r.rating,
                      comment: r.comment,
                      author: { name: r.author?.name ?? null, image: r.author?.image ?? null },
                    }))}
                    averageRating={reviews.averageRating}
                    reviewCount={reviews.reviewCount}
                    googleUrl={client.gbpProfileUrl ?? null}
                    slug={client.slug}
                    isLoggedIn={false}
                  />
                </div>
              ) : null}
              <ContactBlock site={site} />
              <FinalCta clientId={site.id} clientName={site.name} phone={site.phone ?? null} />
            </div>
          </>
        )}
      </>
    );
  } catch {
    notFound();
  }
}

export default function ClientPage(props: ClientPageProps) {
  return (
    <>
      {/* Static shell: real hero paints immediately (cached data, no auth) */}
      <ClientHeroBlock {...props} />
      {/* Deferred: the rest of the page streams in below the fold */}
      <Suspense fallback={<PartnerHomeSkeleton />}>
        <ClientPageBody {...props} />
      </Suspense>
    </>
  );
}
