import { Metadata } from "next";
import dynamic from "next/dynamic";
import { getClientsWithCounts, getClientPageStats } from "@/app/api/helpers/client-queries";
import { getIndustriesWithCounts } from "@/app/api/helpers/industry-queries";
import { generateMetadataFromSEO } from "@/lib/seo";
import { getSettingsSeoForRoute } from "@/lib/get-settings-seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { ClientsHero } from "./components/clients-hero";

// Dynamic imports for client components (code splitting + SSR where possible)
const FeaturedClients = dynamic(
  () => import("./components/featured-clients").then((mod) => ({ default: mod.FeaturedClients })),
  { ssr: true }
);

const ClientsContent = dynamic(
  () => import("./components/clients-content").then((mod) => ({ default: mod.ClientsContent })),
  { ssr: true }
);

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await getSettingsSeoForRoute("clients");
  if (metadata?.title ?? metadata?.description) return metadata;
  return generateMetadataFromSEO({
    title: "العملاء - دليل الشركات والمؤسسات",
    description: "استكشف دليل شامل للشركات والمؤسسات الرائدة. ابحث وتصفح حسب الصناعة والمجال",
    keywords: ["عملاء", "شركات", "منظمات", "مقالات", "دليل الشركات"],
    url: "/clients",
    type: "website",
  });
}

export const revalidate = 60; // ISR: Revalidate every 60 seconds (optimized)

export default async function ClientsPage() {
  const [{ jsonLd: storedJsonLd }, clients, stats, industries] = await Promise.all([
    getSettingsSeoForRoute("clients"),
    getClientsWithCounts(),
    getClientPageStats(),
    getIndustriesWithCounts(),
  ]);

  const featuredClients = clients
    .filter(c => c.isVerified)
    .slice(0, 6);

  return (
    <>
      {storedJsonLd?.trim() && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: storedJsonLd }}
        />
      )}
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "العملاء" },
        ]}
      />

      <ClientsHero {...stats} />

      <main>
        {featuredClients.length > 0 && (
          <section aria-labelledby="featured-clients-heading">
            <h2 id="featured-clients-heading" className="sr-only">
              العملاء المميزون
            </h2>
            <FeaturedClients clients={featuredClients} />
          </section>
        )}

        <section aria-labelledby="all-clients-heading">
          <h2 id="all-clients-heading" className="sr-only">
            جميع العملاء
          </h2>
          <ClientsContent 
            initialClients={clients}
            industries={industries}
          />
        </section>
      </main>
    </>
  );
}




