import { BRAND_AR, BRAND_EN, SITE_URL, LOGO_URL } from "@/constants";

/**
 * The site-identity @graph is emitted once, on the article page — it is the surface Google
 * crawls most and the one that needs the publisher entity resolved. Lives here rather than
 * in shared SEO because no other route emits it.
 */

/**
 * Site identity @graph: Organization (Modonty brand entity) + WebSite, linked by @id.
 * Establishes the brand/publisher entity for the knowledge graph + AI/GEO understanding.
 * NO SearchAction — Google deprecated the sitelinks searchbox (Nov 2024), so adding it
 * has zero rich-result value. sameAs = the platform's verified social profiles.
 */
export function generateSiteIdentityStructuredData(options?: {
  sameAs?: string[];
  imageLicenseUrl?: string | null;
  imageAcquireLicensePageUrl?: string | null;
  /** Settings → Content Language. Was spelled "ar" here while admin held the real value. */
  inLanguage?: string;
}): object {
  const orgId = `${SITE_URL}/#organization`;
  const siteId = `${SITE_URL}/#website`;
  const sameAs = (options?.sameAs || []).filter(
    (u) => typeof u === "string" && u.trim().length > 0,
  );
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: BRAND_EN,
        alternateName: BRAND_AR,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: LOGO_URL,
          // Same copyright policy every other Modonty-produced image carries. The
          // creator/creditText/copyrightNotice trio is what keeps Google's image-metadata
          // check clean — a licence without a copyright line is flagged.
          creator: { "@type": "Organization", name: BRAND_AR, url: SITE_URL },
          creditText: BRAND_AR,
          copyrightNotice: `© ${new Date().getFullYear()} ${BRAND_AR}`,
          ...(options?.imageLicenseUrl?.trim() && { license: options.imageLicenseUrl.trim() }),
          ...(options?.imageAcquireLicensePageUrl?.trim() && {
            acquireLicensePage: options.imageAcquireLicensePageUrl.trim(),
          }),
        },
        ...(sameAs.length > 0 && { sameAs }),
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        name: BRAND_EN,
        alternateName: BRAND_AR,
        url: SITE_URL,
        inLanguage: options?.inLanguage?.trim() || "ar",
        publisher: { "@id": orgId },
      },
    ],
  };
}
