import type { Metadata } from "next";

import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { generateBreadcrumbStructuredData, jsonLdHtml } from "@/lib/seo";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { messages } from "@/lib/i18n/messages";

import { LegalIndexBody } from "./components/legal-index-body/LegalIndexBody";

const text = messages.legalIndex;

/**
 * Through the shared builder, like the four pages it links to. The hand-written object it
 * replaces carried a title and a description and nothing else — no canonical, no hreflang,
 * no og:, no twitter: — so the index page was the one link in the legal set Google could not
 * place. It also appended "- مدونتي" a second time on top of the layout's title template.
 */
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(null, {
    path: "/legal",
    fallbackTitle: "الصفحات القانونية",
    fallbackDescription:
      "سياسات مدونتي القانونية في مكان واحد: الخصوصية · ملفات تعريف الارتباط · حقوق النشر · اتفاقية المستخدم.",
  });
}

export default function LegalIndexPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Same trail as the visible nav below — Google reads this one, not the markup. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            generateBreadcrumbStructuredData([
              { name: "الرئيسية", url: "/" },
              { name: "القانونية", url: "/legal" },
            ])
          ),
        }}
      />
      <Breadcrumb
        items={[
          { label: text.breadcrumbHome, href: "/", icon: <BreadcrumbHome /> },
          { label: text.breadcrumbLegal },
        ]}
      />
      <LegalIndexBody />
    </div>
  );
}
