import { Suspense, ReactNode } from "react";
import dynamicImport from "next/dynamic";
import { notFound } from "next/navigation";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { ClientHero } from "./components/hero/client-hero";
import { ClientStickyProvider } from "./components/client-tabs-nav";
import { getClientPageData } from "./helpers/client-page-data";

// Dynamic import for GTM tracker (SSR enabled; component guards browser APIs)
const GTMClientTracker = dynamicImport(
  () => import("@/components/gtm/GTMClientTracker").then((mod) => ({ default: mod.GTMClientTracker })),
  { ssr: true }
);

interface ClientLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function ClientLayout({ children, params }: ClientLayoutProps) {
  const { slug } = await params;

  const data = await getClientPageData(slug);

  if (!data) {
    notFound();
  }

  const { client, stats } = data;

  return (
    <>
      <GTMClientTracker
        clientContext={{
          client_id: client.id,
          client_slug: client.slug,
          client_name: client.name,
        }}
        pageTitle={client.seoTitle || client.name}
      />

      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "العملاء", href: "/clients" },
          { label: client.name },
        ]}
      />

      <ClientHero
        client={client}
        stats={{
          followers: stats.followers,
          articles: client._count.articles,
          totalViews: stats.totalViews,
        }}
        initialIsFollowing={false}
      />

      <main className="container mx-auto max-w-[1128px] px-4 py-8 flex-1">
        <ClientStickyProvider clientSlug={client.slug} clientName={client.name}>
          <Suspense fallback={<div className="h-64 bg-muted rounded-md animate-pulse" />}>
            {children}
          </Suspense>
        </ClientStickyProvider>
      </main>
    </>
  );
}

