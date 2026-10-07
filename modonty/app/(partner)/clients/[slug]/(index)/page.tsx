import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { buildHreflangLanguages } from "@modonty/shared/lib/seo/build-hreflang-languages";
import {
  generateMetadataFromSEO,
  jsonLdHtml,
  jsonLdHtmlFromString,
  withHonestOpenGraphImageDimensions,
} from "@/lib/seo";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";
import { messages } from "@/lib/i18n/messages";
import { HOME_FAQ_LIMIT } from "@modonty/shared/components/partner-site/free/faq/faq-accordion";
import { PageBlocks } from "../components/page-blocks";
import { getClientSlugs } from "../helpers/get-client-slugs";
import { getClientForMetadata } from "../helpers/get-client-for-metadata";
import { getClientRobots } from "../helpers/get-client-robots";
import { buildKnownImages } from "../helpers/build-known-images";
import { buildFallbackOrganization } from "../helpers/build-fallback-organization";
import { getClientPageData } from "../helpers/get-client-page-data";
import { getClientPageFaqs } from "../helpers/get-client-page-faqs";
import { getClientGallery } from "../helpers/get-client-gallery";
import { resolveClientPageState } from "../components/client-page-state";
import { ClientNotReadyPanel } from "../components/states/client-not-ready-panel";
import { ClientViewTracker } from "../components/client-view-tracker";
import { PartnerHomeSkeleton } from "../components/home/partner-home-skeleton";
import { FEED_ALTERNATE_TYPES } from "@/lib/seo/feed-alternate-types";
import { SITE_URL } from "@/constants";

interface ClientPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getClientSlugs();
}

export async function generateMetadata({ params }: ClientPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const client = await getClientForMetadata(decodedSlug);

    if (!client) {
      return {
        title: "عميل غير موجود",
      };
    }

    // `SITE_URL` يقرأ نفس المتغيّر ويقصّ الشرطة الأخيرة (constants/brand.ts:27) — نسخةٌ ثانية
  // هنا تعني رابطين قد يفترقان، وأحدهما يصير canonical على صفحة حيّة.
    const rawSiteUrl = SITE_URL;
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
    const robots = getClientRobots(client);

    const stored = client.nextjsMetadata as Metadata | null;
    if (stored?.title) {
      const honestStored = withHonestOpenGraphImageDimensions(stored, buildKnownImages(client));

      return {
        ...honestStored,
        description:
          (honestStored.description as string | undefined) ||
          client.seoDescription ||
          messages.seo.partner.description.replace("{name}", client.name),
        ...(robots ? { robots } : {}),
        openGraph: {
          ...(honestStored.openGraph as object | undefined),
          url: canonicalUrl,
        },
        alternates: {
          canonical: canonicalUrl,
          languages: hreflangLanguages,
          types: FEED_ALTERNATE_TYPES,
        },
      };
    }
    // `await`, because `generateMetadataFromSEO` is async — spreading the promise itself
    // spreads an object with no own enumerable keys, so this branch returned {} and the page
    // fell back to the root layout's title with no canonical, no og: and no hreflang.
    //
    // It never showed: all 35 active partners carry a stored blob and take the branch above.
    // Reproduced 25 Aug 2026 by clearing one dev partner's blob — the page served
    // "مدونتي - منصة المدونات متعددة الشركاء" with canonical MISSING and hreflang 0.
    // The first partner published before their blob is generated is an indexable page with
    // no identity at all.
    return {
      ...(await generateMetadataFromSEO({
        title: (client.seoTitle || client.name)?.slice(0, 51),
        description: client.seoDescription || `استكشف مقالات ${client.name}`,
        image: mediaSrc(client.heroImageMedia) || mediaSrc(client.logoMedia) || undefined,
        url: canonicalUrl,
        type: "website",
        languages: hreflangLanguages,
      })),
      ...(robots ? { robots } : {}),
    };
  } catch {
    // Transient read failure, not a missing page: `noindex, follow` so this render does not
    // put a generic title into the index on a real URL, while the next successful crawl
    // restores the real metadata. Same reasoning as the article page.
    return {
      title: "الشركاء",
      robots: { index: false, follow: true },
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

    return (
      <>
        {client.jsonLdStructuredData ? (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtmlFromString(client.jsonLdStructuredData) }} />
        ) : (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(buildFallbackOrganization(client, slug)) }} />
        )}
        {/*
          Only the questions this page actually renders. The accordion below shows
          HOME_FAQ_LIMIT of them, and Google's structured data policy is explicit: "Don't mark
          up content that is not visible to readers of the page". Declaring all thirty while
          showing six promised Google twenty questions and answers that were nowhere in the
          HTML. The complete set is declared on the partner's /faq page, which renders it all.
        */}
        {faqs.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: jsonLdHtml({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: faqs
                  .slice(0, HOME_FAQ_LIMIT)
                  .map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
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
          <PageBlocks slug={slug} page="home" />
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
