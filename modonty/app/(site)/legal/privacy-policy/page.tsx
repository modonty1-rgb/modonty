import { Metadata } from "next";
import { Suspense } from "react";

import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { generateStructuredData, normalizeStoredSiteEntityIds } from "@/lib/seo";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { messages } from "@/lib/i18n/messages";

import { PrivacyPolicyBody } from "./components/privacy-policy-body/PrivacyPolicyBody";
import { PrivacyPolicyFallback } from "./components/privacy-policy-fallback/PrivacyPolicyFallback";
import { getPrivacyPolicyPageForMetadata } from "./helpers/privacy-policy-metadata";
import { getPrivacyPolicyPageContent } from "./helpers/privacy-policy-content";

const text = messages.privacyPolicy;

// Tags come from this page's row, then the Settings defaults, then these literals —
// one builder for every editable page so the chain can never lose its middle link.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getPrivacyPolicyPageForMetadata(), {
    path: "/legal/privacy-policy",
    fallbackTitle: "سياسة الخصوصية",
    fallbackDescription: "تعرف على كيفية جمع واستخدام وحماية معلوماتك الشخصية في منصة مدونتي",
  });
}


function sanitizeJsonLd(json: object): string {
  return JSON.stringify(json).replace(/</g, '\\u003c');
}

async function PrivacyPolicyContent() {
  let page;
  let hasContent = false;

  try {
    page = await getPrivacyPolicyPageContent();
    if (page && page.content) {
      hasContent = true;
    }
  } catch (error) {
    console.error("Error fetching privacy policy page:", error);
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
    description: "تعرف على كيفية جمع واستخدام وحماية معلوماتك الشخصية في منصة مدونتي",
    url: "/legal/privacy-policy",
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
            { label: text.breadcrumbLegal, href: "/legal" },
            { label: pageTitle },
          ]}
        />
        <PrivacyPolicyBody title={pageTitle} html={pageContent} updatedAt={page?.updatedAt} />
      </div>
    </>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <Suspense fallback={<PrivacyPolicyFallback />}>
      <PrivacyPolicyContent />
    </Suspense>
  );
}
