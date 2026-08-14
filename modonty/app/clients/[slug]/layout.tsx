import { ReactNode } from "react";
import dynamicImport from "next/dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { generateBreadcrumbStructuredData, jsonLdHtml } from "@/lib/seo";
import { IconChevronRight } from "@/lib/icons";
import { getClientPageData } from "./helpers/client-page-data";

// Dynamic import for GTM tracker (SSR enabled; component guards browser APIs)
const GTMClientTracker = dynamicImport(
  () => import("@/components/tracking/GTMClientTracker").then((mod) => ({ default: mod.GTMClientTracker })),
  { ssr: true }
);

interface ClientLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

/**
 * Client mini-site layout = platform chrome only (GTM + breadcrumb). The hero,
 * scroll-spy nav, sections, and mobile dock all live in the single-page shell
 * rendered by page.tsx (mockup is a single page; /about + /contact sub-routes
 * are 301-redirected here).
 */
export default async function ClientLayout({ children, params }: ClientLayoutProps) {
  const { slug } = await params;

  const data = await getClientPageData(slug);

  if (!data) {
    notFound();
  }

  const { client } = data;

  // The visible trail above and this machine-readable one are built from ONE array —
  // Google never infers the path from the rendered nav, and a sub-page opened straight
  // from search (photos, reviews) has no other way to say where it sits.
  const breadcrumbTrail = [
    { name: "الرئيسية", url: "/" },
    { name: "الشركاء", url: "/clients" },
    { name: client.name, url: `/clients/${client.slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(generateBreadcrumbStructuredData(breadcrumbTrail)),
        }}
      />
      <GTMClientTracker
        clientContext={{
          client_id: client.id,
          client_slug: client.slug,
          client_name: client.name,
        }}
        pageTitle={client.seoTitle || client.name}
      />

      {/* Mobile-only back button — breadcrumb hidden on sm: */}
      <Link
        href="/clients"
        className="sm:hidden flex items-center gap-1 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        aria-label="رجوع إلى قائمة الشركاء"
      >
        <IconChevronRight className="h-4 w-4 rtl:rotate-0" aria-hidden />
        الشركاء
      </Link>

      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "الشركاء", href: "/clients" },
          { label: client.name },
        ]}
        className="hidden sm:block"
      />

      <main className="mx-auto w-full max-w-[1128px] flex-1">{children}</main>
    </>
  );
}
