import { Metadata } from "next";
import { Suspense } from "react";

import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { generateStructuredData, jsonLdHtmlFromString } from "@/lib/seo";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { messages } from "@/lib/i18n/messages";

import { UserAgreementBody } from "./components/user-agreement-body/UserAgreementBody";
import { UserAgreementFallback } from "./components/user-agreement-fallback/UserAgreementFallback";
import { getUserAgreementPageForMetadata } from "./helpers/user-agreement-metadata";
import { getUserAgreementPageContent } from "./helpers/user-agreement-content";

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


function sanitizeJsonLd(json: object): string {
  return JSON.stringify(json).replace(/</g, '\\u003c');
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
  const buildFallbackStructuredData = () => generateStructuredData({
    type: "WebPage",
    // بلا لاحقة الماركة: هذا اسم **الصفحة** في البيانات المنظَّمة، واسم الموقع يعيش على
    // عقدة `WebSite` وفي `og:site_name`. إلحاقه هنا كرّر الماركة وكتبها في الكود معاً.
    name: pageTitle,
    description: messages.seo.userAgreement.description,
    url: "/legal/user-agreement",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: storedJsonLd
            ? jsonLdHtmlFromString(storedJsonLd)
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
        <UserAgreementBody title={pageTitle} html={pageContent} updatedAt={page?.updatedAt} />
      </div>
    </>
  );
}

export default function UserAgreementPage() {
  return (
    <Suspense fallback={<UserAgreementFallback />}>
      <UserAgreementContent />
    </Suspense>
  );
}
