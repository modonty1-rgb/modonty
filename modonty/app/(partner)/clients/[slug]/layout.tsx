import { ReactNode, Suspense } from "react";
import dynamicImport from "next/dynamic";
import { notFound } from "next/navigation";
import { hexToHslTriplet } from "@modonty/shared/lib/partner-site";
import { getHeaderTemplate } from "@modonty/shared/components/partner-site/free/header";
import { getFooterTemplate } from "@modonty/shared/components/partner-site/free/footer";
import { generateBreadcrumbStructuredData, jsonLdHtml } from "@/lib/seo";
import { getPartnerSite } from "./helpers/get-partner-site";
import { buildChromeData } from "./helpers/build-chrome-data";
import { getCopyrightYear } from "./helpers/get-copyright-year";
import { PlatformBar } from "./components/chrome/platform-bar";
import { StickyChrome } from "./components/chrome/sticky-chrome";

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
 * The partner's site shell: modonty's thin platform bar, then HIS header, his pages,
 * his footer — the header and footer are whichever templates he picked in the console
 * («إعدادات الموقع» → ClientSite), rendered from the shared registries with his data:
 * the same components the console previewed, so what he saw is what ships.
 * This layout is the top of its own route group, so everything that reads `params`
 * lives in <PartnerChrome/> behind its own Suspense boundary and the layout stays static.
 */
export default function ClientLayout({ children, params }: ClientLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<div className="h-[108px]" aria-hidden />}>
        <PartnerChrome params={params} slot="header" />
      </Suspense>
      <main id="main-content" className="flex-1">{children}</main>
      <Suspense fallback={null}>
        <PartnerChrome params={params} slot="footer" />
      </Suspense>
    </div>
  );
}

interface PartnerChromeProps extends Pick<ClientLayoutProps, "params"> {
  slot: "header" | "footer";
}

/** One cached read serves both slots (React dedups within the request). */
async function PartnerChrome({ params, slot }: PartnerChromeProps) {
  const { slug } = await params;
  const site = await getPartnerSite(decodeURIComponent(slug));
  if (!site) notFound();

  const { header, footer } = buildChromeData(site, await getCopyrightYear());

  if (slot === "footer") {
    const Footer = getFooterTemplate(site.site?.footerTemplate).Component;
    return (
      <div data-partner-theme>
        <Footer data={footer} />
      </div>
    );
  }

  const Header = getHeaderTemplate(site.site?.headerTemplate).Component;
  const isVerified = Boolean(site.commercialRegistrationNumber || site.legalName || site.verificationImageUrl);
  // Visible trail lives in the partner header's home link; this machine-readable one tells
  // Google where a sub-page opened straight from search (photos, reviews) sits.
  const breadcrumbTrail = [
    { name: "الرئيسية", url: "/" },
    { name: "الشركاء", url: "/clients" },
    { name: site.name, url: `/clients/${site.slug}` },
  ];
  // The partner's colour re-points Tailwind's `primary` inside HIS site only — main, his
  // header, his footer — never the platform bar. Same value in dark mode (every palette
  // colour keeps ≥ 4.5:1 under white button text as-is; see partner-site-palette.ts).
  const primaryHsl = header.primaryColor ? hexToHslTriplet(header.primaryColor) : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(generateBreadcrumbStructuredData(breadcrumbTrail)) }}
      />
      {primaryHsl && (
        <style>{`#main-content,[data-partner-theme]{--primary:${primaryHsl};--ring:${primaryHsl}}`}</style>
      )}
      <GTMClientTracker
        clientContext={{ client_id: site.id, client_slug: site.slug, client_name: site.name }}
        pageTitle={site.seoTitle || site.name}
      />
      {/* One sticky block: slides up by the bar's height on scroll-down, so the partner header stays. */}
      <StickyChrome>
        <PlatformBar isVerified={isVerified} />
        <div data-partner-theme>
          <Header data={header} />
        </div>
      </StickyChrome>
    </>
  );
}
