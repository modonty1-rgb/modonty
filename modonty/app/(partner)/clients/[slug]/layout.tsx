import { ReactNode, Suspense } from "react";
import dynamicImport from "next/dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { generateBreadcrumbStructuredData, jsonLdHtml } from "@/lib/seo";
import { IconChevronRight } from "@/lib/icons";
import { getClientIdentity } from "./helpers/get-client-identity";
import { SiteShell } from "@/app/layout/components/SiteShell";

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
 * Partner-site layout. Since 2026-08-17 it is the top of its own route group
 * `app/(partner)`, so nothing above it provides a Suspense boundary any more (the
 * partners-list `loading.tsx` used to). Everything that touches `params` therefore
 * lives in <ClientChrome/> behind its own boundary; the layout itself stays static.
 * Temporary: it mounts modonty's SiteShell so the move commit changes nothing visually —
 * the partner's own header/footer replace it in the next phase.
 */
export default function ClientLayout({ children, params }: ClientLayoutProps) {
  return (
    <SiteShell>
      <Suspense fallback={null}>
        <ClientChrome params={params} />
      </Suspense>
      <div className="mx-auto w-full max-w-[1128px] flex-1">{children}</div>
    </SiteShell>
  );
}

/** Breadcrumb (visible + JSON-LD) and GTM context — the only params-dependent part of the layout. */
async function ClientChrome({ params }: Pick<ClientLayoutProps, "params">) {
  const { slug } = await params;
  const client = await getClientIdentity(decodeURIComponent(slug));
  if (!client) notFound();

  // The visible trail below and this machine-readable one are built from ONE array —
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
    </>
  );
}
