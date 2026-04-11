import type { Metadata } from "next";
import Link from "@/components/link";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { IconChevronLeft } from "@/lib/icons";

export const metadata: Metadata = {
  title: "الصفحات القانونية - مودونتي",
  description: "اطلع على سياسات مودونتي القانونية: سياسة الخصوصية، سياسة ملفات الارتباط، حقوق النشر، واتفاقية المستخدم.",
  robots: { index: true, follow: true },
};

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
    description: "الشروط والأحكام الخاصة باستخدام منصة مودونتي",
  },
];

export default function LegalIndexPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
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
