import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { generateBreadcrumbStructuredData, jsonLdHtml } from "@/lib/seo";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { IconChevronLeft } from "@/lib/icons";

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

const legalPages = [
  {
    href: "/legal/privacy-policy",
    title: "سياسة الخصوصية",
    description: "كيف نجمع بياناتك ونستخدمها ونحميها",
  },
  {
    href: "/legal/cookie-policy",
    title: "سياسة ملفات تعريف الارتباط",
    description: "كيف نستخدم ملفات الارتباط (Cookies) على منصتنا",
  },
  {
    href: "/legal/copyright-policy",
    title: "سياسة حقوق النشر",
    description: "حقوق الملكية الفكرية وضوابط استخدام المحتوى",
  },
  {
    href: "/legal/user-agreement",
    title: "اتفاقية المستخدم",
    description: "الشروط والأحكام الخاصة باستخدام منصة مدونتي",
  },
];

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
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "القانونية" },
        ]}
      />
      <h1 className="text-3xl font-bold mb-2">الصفحات القانونية</h1>
      <p className="text-muted-foreground mb-8">
        تعرف على سياساتنا واتفاقياتنا المتعلقة بخصوصيتك وحقوقك.
      </p>
      <ul className="space-y-4">
        {legalPages.map((page) => (
          <li key={page.href}>
            <Link
              href={page.href}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
            >
              <div>
                <p className="font-semibold text-foreground">{page.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{page.description}</p>
              </div>
              <IconChevronLeft className="h-4 w-4 text-muted-foreground ltr:rotate-180 shrink-0" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
