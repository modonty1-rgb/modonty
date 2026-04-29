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
import { getClientPublishedFaqs } from "./helpers/client-faqs";
import { getArticles } from "@/app/api/helpers/article-queries";
import { FEED_PAGE_SIZE } from "@/lib/feed-constants";
import type { FeedPost } from "@/lib/types";
import { ClientPageLeft, ClientPageFeed, ClientPageRight } from "./components/client-page";
import { ClientViewTracker } from "./components/client-view-tracker";
import { ClientCommentsSection } from "./components/client-comments-section";
import ClientLoading from "./loading";
import { CtaTrackedLink } from "@/components/cta-tracked-link";

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
    const rawSiteUrl = settings?.siteUrl || "https://www.modonty.com";
    // Normalize: modonty.com → www.modonty.com
    const siteUrl = rawSiteUrl.replace(/^(https?:\/\/)(?!www\.)modonty\.com/, "$1www.modonty.com").replace(/\/$/, "");
    const canonicalUrl = `${siteUrl}/clients/${encodeURIComponent(decodedSlug)}`;

    if (cached?.nextjsMetadata) {
      const stored = cached.nextjsMetadata as Metadata;
      if (stored.title) {
        return {
          ...stored,
          // Always regenerate description — stored value may be empty
          description: (stored.description as string | undefined) || client.seoDescription || `استكشف مقالات وخدمات ${client.name} على مودونتي`,
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
      title: (client.seoTitle || client.name)?.slice(0, 51),
      description: client.seoDescription || `استكشف مقالات ${client.name}`,
      image: client.heroImageMedia?.url || client.logoMedia?.url || undefined,
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
    const [data, articlesResult, reviewsData, followers, engagementData, cachedSeo, clientFaqs] = await Promise.all([
      getClientPageData(slug),
      getArticles({ page: 1, limit: FEED_PAGE_SIZE, client: decodedSlug }),
      getClientReviewsBySlug(slug),
      getClientFollowers(slug),
      getClientEngagementBySlug(slug),
      db.client.findUnique({
        where: { slug: decodedSlug },
        select: { jsonLdStructuredData: true },
      }),
      getClientPublishedFaqs(decodedSlug),
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
      { name: "العملاء", url: "/clients" },
      { name: client.name, url: `/clients/${encodeURIComponent(slug)}` },
    ]);

    return (
      <>
        {/* Organization JSON-LD — DB cache if available, fallback to live generation */}
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
        {/* BreadcrumbList JSON-LD — always rendered regardless of DB cache */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
        {/* FAQPage JSON-LD — only when client has published FAQs */}
        {clientFaqs.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": clientFaqs.map((faq) => ({
                  "@type": "Question",
                  "name": faq.question,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer,
                  },
                })),
              }),
            }}
          />
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

        {/* FAQ Section — aggregated published FAQs across all client articles */}
        {clientFaqs.length > 0 && (
          <section className="mt-10" aria-labelledby="client-faqs-heading">
            <h2 id="client-faqs-heading" className="text-xl font-semibold text-foreground mb-4">
              الأسئلة الشائعة
            </h2>
            <div className="space-y-3">
              {clientFaqs.map((faq) => (
                <details
                  key={faq.id}
                  className="group rounded-lg border border-border bg-card"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3 text-sm font-medium text-foreground select-none list-none [&::-webkit-details-marker]:hidden">
                    <span>{faq.question}</span>
                    <span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true">
                      ▾
                    </span>
                  </summary>
                  <div className="border-t border-border px-4 py-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                    <a
                      href={`/articles/${faq.articleSlug}`}
                      className="mt-2 inline-block text-xs text-primary hover:underline"
                    >
                      اقرأ المقال: {faq.articleTitle}
                    </a>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Client Comments Section (آراء حول الشركة) */}
        <ClientCommentsSection clientSlug={client.slug} clientName={client.name} />

        {/* JBRSEO-5: CTA — join as client */}
        <div className="mt-10 mb-4 rounded-xl border border-primary/20 bg-primary/5 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">أعجبك ما رأيت؟ نشاطك التجاري يستحق نفس الحضور</p>
            <p className="text-sm text-muted-foreground mt-0.5">انضم لعملاء مودونتي واجعل جوجل يجلب لك العملاء</p>
          </div>
          <CtaTrackedLink
            href="https://www.jbrseo.com"
            target="_blank"
            rel="noopener noreferrer"
            label="Client Page CTA — عملاء بلا إعلانات"
            type="BANNER"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            عملاء بلا إعلانات <span aria-hidden="true">↗</span>
          </CtaTrackedLink>
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
