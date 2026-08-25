import { Metadata } from "next";
import { Suspense } from "react";

import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { generateStructuredData, normalizeStoredSiteEntityIds } from "@/lib/seo";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { messages } from "@/lib/i18n/messages";

import { TermsBody } from "./components/terms-body/TermsBody";
import { TermsFallback } from "./components/terms-fallback/TermsFallback";
import { getTermsPageForMetadata } from "./helpers/terms-metadata";
import { getTermsPageContent } from "./helpers/terms-content";

const text = messages.terms;

// Tags come from this page's row, then the Settings defaults, then these literals —
// one builder for every editable page so the chain can never lose its middle link.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getTermsPageForMetadata(), {
    path: "/terms",
    fallbackTitle: "الشروط والأحكام",
    fallbackDescription: "اقرأ شروط وأحكام استخدام منصة مدونتي",
  });
}


function sanitizeJsonLd(json: object): string {
  return JSON.stringify(json).replace(/</g, '\\u003c');
}

async function TermsContent() {
  let page;
  let hasContent = false;

  try {
    page = await getTermsPageContent();
    if (page && page.content) {
      hasContent = true;
    }
  } catch (error) {
    console.error("Error fetching terms page:", error);
  }

  const pageTitle = page?.title || text.fallbackTitle;
  const pageContent = hasContent ? page!.content : text.fallbackContent;

  // Prefer the stored, admin-validated card; build live ONLY when it is absent.
  const storedJsonLd = page?.jsonLdStructuredData?.includes('"@type":"WebPage"')
    ? page.jsonLdStructuredData.trim()
    : undefined;
  const buildFallbackStructuredData = () => generateStructuredData({
    type: "WebPage",
    name: `${pageTitle} - مدونتي`,
    description: "اقرأ شروط وأحكام استخدام منصة مدونتي",
    url: "/terms",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: storedJsonLd
            ? normalizeStoredSiteEntityIds(storedJsonLd)
            : sanitizeJsonLd(buildFallbackStructuredData()),
        }}
      />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumb
          items={[
            { label: text.breadcrumbHome, href: "/", icon: <BreadcrumbHome /> },
            { label: pageTitle },
          ]}
        />
        <TermsBody title={pageTitle} html={pageContent} updatedAt={page?.updatedAt} />
      </div>
    </>
  );
}

export default function TermsPage() {
  return (
    <Suspense fallback={<TermsFallback />}>
      <TermsContent />
    </Suspense>
  );
}
