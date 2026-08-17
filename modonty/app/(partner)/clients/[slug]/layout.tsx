import { ReactNode, Suspense } from "react";
import dynamicImport from "next/dynamic";
import { notFound } from "next/navigation";
import { generateBreadcrumbStructuredData, jsonLdHtml } from "@/lib/seo";
import { getPartnerSite } from "./helpers/get-partner-site";
import { PlatformBar } from "./components/chrome/platform-bar";
import { PartnerHeader } from "./components/chrome/partner-header";
import { PartnerFooter } from "./components/chrome/partner-footer";
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
 * his footer. This layout is the top of its own route group (`app/(partner)`), so
 * nothing above it provides a Suspense boundary — everything that reads `params`
 * lives in <PartnerChrome/> behind its own boundary and the layout stays static.
 * The header/footer fallbacks reserve their height so the page never jumps.
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

  if (slot === "footer") return <PartnerFooter site={site} />;

  const isVerified = Boolean(site.commercialRegistrationNumber || site.legalName || site.verificationImageUrl);
  // Visible trail lives in the partner header's home link; this machine-readable one tells
  // Google where a sub-page opened straight from search (photos, reviews) sits.
  const breadcrumbTrail = [
    { name: "الرئيسية", url: "/" },
    { name: "الشركاء", url: "/clients" },
    { name: site.name, url: `/clients/${site.slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(generateBreadcrumbStructuredData(breadcrumbTrail)) }}
      />
      <GTMClientTracker
        clientContext={{ client_id: site.id, client_slug: site.slug, client_name: site.name }}
        pageTitle={site.seoTitle || site.name}
      />
      {/* One sticky block: slides up by the bar's height on scroll-down, so the partner header stays. */}
      <StickyChrome>
        <PlatformBar isVerified={isVerified} />
        <PartnerHeader site={site} />
      </StickyChrome>
    </>
  );
}
