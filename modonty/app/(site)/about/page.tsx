import { Metadata } from "next";
import { Suspense } from "react";
import { generateStructuredData } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { BecomePartnerBanner } from "@/components/shared/become-partner-banner/BecomePartnerBanner";
import { getClientsList } from "@/lib/queries/get-clients-list";
import { getIndustriesEnhanced } from "@/lib/queries/get-industries-enhanced";
import { getAboutPageForMetadata } from "./helpers/about-metadata";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { getAboutPageContent } from "./helpers/about-content";
import { AboutHero } from "./components/about-hero/AboutHero";
import { Cornerstones } from "./components/cornerstones/Cornerstones";
import { LiveStats } from "./components/live-stats/LiveStats";
import { AudienceChips } from "./components/audience/AudienceChips";
import { EditorialContent } from "./components/editorial-content/EditorialContent";
import { messages } from "@/lib/i18n/messages";

const text = messages.about;

// Tags come from this page's row, then the Settings defaults, then these literals —
// one builder for every editable page so the chain can never lose its middle link.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getAboutPageForMetadata(), {
    path: "/about",
    fallbackTitle: "عن مدونتي",
    fallbackDescription: "مدونتي — منظومة عربية سعودية تربط الباحث عن المعلومة بالخبير والشريك الموثوق.",
  });
}

function sanitizeJsonLd(json: object): string {
  return JSON.stringify(json).replace(/</g, "\\u003c");
}

function AboutFallback() {
  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="h-72 animate-pulse rounded-2xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

async function AboutContent() {
  const [page, partners, industries] = await Promise.all([
    getAboutPageContent().catch(() => null),
    getClientsList(),
    getIndustriesEnhanced({ sortBy: "clients" }),
  ]);

  const pageTitle = page?.title || "عن مدونتي";
  const hasEditorialContent = Boolean(page?.content?.trim());

  // Prefer the stored, admin-validated card; build live ONLY when it is absent.
  const storedJsonLd = page?.jsonLdStructuredData?.trim();
  const buildFallbackStructuredData = () =>
    generateStructuredData({
      type: "AboutPage",
      name: `${pageTitle} - مدونتي`,
      description: "مدونتي — منظومة عربية سعودية تربط الباحث عن المعلومة بالخبير والشريك الموثوق.",
      url: "/about",
    });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: storedJsonLd ?? sanitizeJsonLd(buildFallbackStructuredData()) }}
      />

      <div className="container mx-auto max-w-4xl space-y-8 px-4 py-6 sm:py-8">
        <Breadcrumb
          items={[
            { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
            { label: text.breadcrumbLabel },
          ]}
        />

        <AboutHero />
        <LiveStats partnerCount={partners.length} industryCount={industries.length} />
        <Cornerstones />
        <AudienceChips />
        {hasEditorialContent && <EditorialContent title={pageTitle} html={page!.content!} />}
        <BecomePartnerBanner source="About Page" />
      </div>
    </>
  );
}

export default function AboutPage() {
  return (
    <Suspense fallback={<AboutFallback />}>
      <AboutContent />
    </Suspense>
  );
}
