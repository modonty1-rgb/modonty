import { Metadata } from "next";
import { Suspense } from "react";

import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { generateStructuredData } from "@/lib/seo";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { messages } from "@/lib/i18n/messages";

import { CopyrightPolicyBody } from "./components/copyright-policy-body/CopyrightPolicyBody";
import { CopyrightPolicyFallback } from "./components/copyright-policy-fallback/CopyrightPolicyFallback";
import { getCopyrightPolicyPageForMetadata } from "./helpers/copyright-policy-metadata";
import { getCopyrightPolicyPageContent } from "./helpers/copyright-policy-content";

const text = messages.copyrightPolicy;

// Tags come from this page's row, then the Settings defaults, then these literals —
// one builder for every editable page so the chain can never lose its middle link.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getCopyrightPolicyPageForMetadata(), {
    path: "/legal/copyright-policy",
    fallbackTitle: "سياسة حقوق النشر",
    fallbackDescription: "سياسة حقوق النشر والملكية الفكرية لمنصة مدونتي",
  });
}


function sanitizeJsonLd(json: object): string {
  return JSON.stringify(json).replace(/</g, '\\u003c');
}

async function CopyrightPolicyContent() {
  let page;
  let hasContent = false;

  try {
    page = await getCopyrightPolicyPageContent();
    if (page && page.content) {
      hasContent = true;
    }
  } catch (error) {
    console.error("Error fetching copyright policy page:", error);
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
    description: "سياسة حقوق النشر والملكية الفكرية لمنصة مدونتي",
    url: "/legal/copyright-policy",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: storedJsonLd ?? sanitizeJsonLd(buildFallbackStructuredData()) }}
      />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumb
          items={[
            { label: text.breadcrumbHome, href: "/", icon: <BreadcrumbHome /> },
            { label: text.breadcrumbLegal, href: "/legal" },
            { label: pageTitle },
          ]}
        />
        <CopyrightPolicyBody title={pageTitle} html={pageContent} updatedAt={page?.updatedAt} />
      </div>
    </>
  );
}

export default function CopyrightPolicyPage() {
  return (
    <Suspense fallback={<CopyrightPolicyFallback />}>
      <CopyrightPolicyContent />
    </Suspense>
  );
}
