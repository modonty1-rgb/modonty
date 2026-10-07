import type { Metadata } from "next";
import { Suspense } from "react";

import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { jsonLdHtml, jsonLdHtmlFromString } from "@/lib/seo";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { messages } from "@/lib/i18n/messages";

import { UserAgreementBody } from "./components/user-agreement-body/UserAgreementBody";
import { LegalPageSkeleton } from "@/components/shared/legal-page-skeleton/LegalPageSkeleton";
import { getUserAgreementPageForMetadata } from "./helpers/get-user-agreement-page-for-metadata";
import { getUserAgreementPageContent } from "./helpers/get-user-agreement-page-content";
import { buildFallbackStructuredData } from "./helpers/build-fallback-structured-data";

const text = messages.userAgreement;

// Tags come from this page's row, then the Settings defaults, then these literals —
// one builder for every editable page so the chain can never lose its middle link.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getUserAgreementPageForMetadata(), {
    path: "/legal/user-agreement",
    fallbackTitle: "اتفاقية المستخدم",
    fallbackDescription: messages.seo.userAgreement.description,
  });
}

async function UserAgreementContent() {
  let page;
  let hasContent = false;

  try {
    page = await getUserAgreementPageContent();
    if (page && page.content) {
      hasContent = true;
    }
  } catch (error) {
    console.error("Error fetching user agreement page:", error);
  }

  const pageTitle = page?.title || text.fallbackTitle;
  const pageContent = hasContent ? page!.content : text.fallbackContent;

  // Prefer the stored, admin-validated card; build live ONLY when it is absent.
  const storedJsonLd = page?.jsonLdStructuredData?.trim();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: storedJsonLd
            ? jsonLdHtmlFromString(storedJsonLd)
            : jsonLdHtml(buildFallbackStructuredData(pageTitle)),
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
        <UserAgreementBody title={pageTitle} html={pageContent} updatedAt={page?.updatedAt} />
      </div>
    </>
  );
}

export default function UserAgreementPage() {
  return (
    <Suspense fallback={<LegalPageSkeleton crumbs={3} />}>
      <UserAgreementContent />
    </Suspense>
  );
}
