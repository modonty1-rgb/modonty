import type { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";

// The full settings object returned at runtime (richer than the exported SEOSettings type).
type AllSettings = Awaited<ReturnType<typeof getAllSettings>>;

// The single source for the Modonty author's stored SEO — used by BOTH the author-form
// save (update-author) and the /seo maintenance step (regenerate-modonty-author-seo), so
// the two can never drift. Modonty is the platform-brand Organization author: the SAME
// entity as the site #organization node and every article's author node (shared @id), so
// Google resolves ONE authoritative Modonty entity (E-E-A-T). Author-as-Organization is
// official (Google: link to the org's home page). Individual writers, if added later,
// stay Person — Person is correct for a person, not the brand.
export interface ModontyAuthorSeoSource {
  name: string;
  slug: string;
  bio?: string | null;
  image?: string | null;
  email?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  linkedIn?: string | null;
  twitter?: string | null;
  facebook?: string | null;
  sameAs?: string[];
}

export function buildModontyAuthorSeo(a: ModontyAuthorSeoSource, settings: AllSettings) {
  const siteUrl = settings.siteUrl || "https://www.modonty.com";
  const siteName = settings.siteName || "مدونتي";
  const inLanguage = settings.inLanguage || "ar";
  const ogLocale = settings.defaultOgLocale || "ar_SA";
  const twitterCard = settings.defaultTwitterCard || "summary_large_image";
  const metaRobots = settings.defaultMetaRobots || "index, follow";
  const title = a.seoTitle || `${a.name} — ${siteName}`;
  const description = a.seoDescription || a.bio || "";

  // sameAs = the org's verified profiles. Settings social (the brand's 11 official
  // channels) is authoritative; union with anything set on the author record. De-duped.
  const sameAs = [
    ...new Set(
      [
        settings.facebookUrl,
        settings.instagramUrl,
        settings.linkedInUrl,
        settings.tiktokUrl,
        settings.snapchatUrl,
        settings.twitterUrl,
        settings.youtubeUrl,
        settings.pinterestUrl,
        settings.whatsappChannelUrl,
        settings.telegramChannelUrl,
        settings.googleBusinessProfileUrl,
        a.linkedIn,
        a.twitter,
        a.facebook,
        ...(a.sameAs || []),
      ].filter((v): v is string => typeof v === "string" && v.trim().length > 0),
    ),
  ];

  // ContactPoint / PostalAddress — the org's real-world presence (Business Info in Settings).
  const contactPoint =
    settings.orgContactTelephone || settings.orgContactEmail
      ? {
          "@type": "ContactPoint",
          ...(settings.orgContactType && { contactType: settings.orgContactType }),
          ...(settings.orgContactTelephone && { telephone: settings.orgContactTelephone }),
          ...(settings.orgContactEmail && { email: settings.orgContactEmail }),
          ...(settings.orgContactAvailableLanguage && { availableLanguage: settings.orgContactAvailableLanguage }),
        }
      : undefined;

  const address =
    settings.orgStreetAddress || settings.orgAddressLocality
      ? {
          "@type": "PostalAddress",
          ...(settings.orgStreetAddress && { streetAddress: settings.orgStreetAddress }),
          ...(settings.orgAddressLocality && { addressLocality: settings.orgAddressLocality }),
          ...(settings.orgAddressRegion && { addressRegion: settings.orgAddressRegion }),
          ...(settings.orgPostalCode && { postalCode: settings.orgPostalCode }),
          ...(settings.orgAddressCountry && { addressCountry: settings.orgAddressCountry }),
        }
      : undefined;

  const orgEmail = settings.orgContactEmail || a.email || undefined;
  const orgLogo = settings.logoUrl || settings.orgLogoUrl || undefined;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: a.name,
    url: siteUrl,
    ...(orgLogo && { logo: { "@type": "ImageObject", url: orgLogo } }),
    ...(a.bio && { description: a.bio }),
    ...(orgEmail && { email: orgEmail }),
    ...(contactPoint && { contactPoint }),
    ...(address && { address }),
    ...(settings.orgAreaServed && { areaServed: settings.orgAreaServed }),
    ...(sameAs.length > 0 && { sameAs }),
  };

  const metadata: Record<string, unknown> = {
    title,
    description: a.seoDescription || a.bio || `Articles by ${a.name}`,
    robots: metaRobots,
    alternates: {
      canonical: `${siteUrl}/authors/${a.slug}`,
      languages: { [inLanguage]: `${siteUrl}/authors/${a.slug}` },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteUrl}/authors/${a.slug}`,
      siteName,
      locale: ogLocale,
      ...(a.image && {
        images: [{ url: a.image, width: settings.defaultOgImageWidth || 1200, height: settings.defaultOgImageHeight || 630 }],
      }),
    },
    twitter: {
      card: twitterCard,
      title,
      description,
      ...(settings.twitterSite && { site: settings.twitterSite }),
      ...(settings.twitterCreator && { creator: settings.twitterCreator }),
      ...(a.image && { images: [a.image] }),
    },
  };

  return { jsonLd, metadata };
}
