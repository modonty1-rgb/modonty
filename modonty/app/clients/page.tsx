import { Metadata } from "next";
import { getClientsWithCounts, getClientPageStats } from "@/app/api/helpers/client-queries";
import { getIndustriesWithCounts } from "@/app/api/helpers/industry-queries";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { ClientsHero } from "./components/clients-hero";
import { getClientsPageSeo, getB2bPanelSettings } from "@/lib/seo/clients-page-seo";
import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { ClientsSection } from "./components/clients-section";

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await getClientsPageSeo();
  return {
    description: "اكتشف أبرز العلامات التجارية والشركات الناشرة على مودونتي — محتوى عربي متخصص وموثوق من مصادر معتمدة في السعودية ومصر والخليج.",
    ...(metadata ?? {}),
  };
}

export default async function ClientsPage() {
  const [{ jsonLd: storedJsonLd }, clients, stats, industries, b2b] = await Promise.all([
    getClientsPageSeo(),
    getClientsWithCounts(),
    getClientPageStats(),
    getIndustriesWithCounts(),
    getB2bPanelSettings(),
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

      <ClientsHero {...stats} b2b={b2b} />

      <div>
        <ClientsSection
          featuredClients={featuredClients}
          allClients={clients}
          industries={industries}
        />

        {/* JBRSEO-2: CTA — join as client */}
        <section aria-labelledby="join-cta-heading" className="container mx-auto max-w-[1128px] px-4 py-12 mt-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-primary to-primary/80 px-8 py-12 text-center text-primary-foreground shadow-lg">
            {/* decorative circles */}
            <span className="pointer-events-none absolute -start-10 -top-10 h-40 w-40 rounded-full bg-white/5" aria-hidden="true" />
            <span className="pointer-events-none absolute -bottom-10 -end-10 h-56 w-56 rounded-full bg-white/5" aria-hidden="true" />

            <h2 id="join-cta-heading" className="relative text-2xl font-bold leading-snug sm:text-3xl">
              هل تريد عملاء من جوجل — بدون إعلانات؟
            </h2>
            <p className="relative mt-3 text-base text-primary-foreground/80 sm:text-lg">
              انضم لعملاء مودونتي واجعل المحتوى يبيع لصالحك على مدار الساعة
            </p>
            <CtaTrackedLink
              href="https://www.jbrseo.com"
              target="_blank"
              rel="noopener noreferrer"
              label="Clients Page Bottom CTA — عملاء بلا إعلانات"
              type="BANNER"
              className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-bold text-primary shadow-md hover:bg-white/90 transition-colors"
            >
              عملاء بلا إعلانات
              <span aria-hidden="true">↗</span>
            </CtaTrackedLink>
          </div>
        </section>
      </div>
    </>
  );
}




