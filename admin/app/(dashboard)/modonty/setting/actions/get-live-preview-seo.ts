"use server";

import { db } from "@/lib/db";
import { MODONTY_AUTHOR_SLUG } from "@/lib/constants/modonty-author";
import { buildMetaFromPageLike } from "../helpers/build-meta-from-page";
import { getAllSettings, getSameAsFromSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { generateModontyPageJsonLd, type ModontySiteConfig } from "../helpers/generate-modonty-page-jsonld";
import type { PageFormData } from "../helpers/page-schema";

function formDataToPageLike(slug: string, formData: PageFormData) {
  return {
    slug,
    title: formData.title ?? null,
    seoTitle: formData.seoTitle ?? null,
    seoDescription: formData.seoDescription ?? null,
    canonicalUrl: formData.canonicalUrl ?? null,
    inLanguage: formData.inLanguage ?? null,
    heroImage: formData.heroImage ?? null,
    heroImageAlt: formData.heroImageAlt ?? null,
    socialImage: formData.socialImage ?? null,
    socialImageAlt: formData.socialImageAlt ?? null,
    ogImage: formData.ogImage ?? null,
    metaRobots: formData.metaRobots ?? null,
    ogTitle: formData.ogTitle ?? null,
    ogDescription: formData.ogDescription ?? null,
    ogType: formData.ogType ?? null,
    ogUrl: formData.ogUrl ?? null,
    ogSiteName: formData.ogSiteName ?? null,
    ogLocale: formData.ogLocale ?? null,
    alternateLanguages: formData.alternateLanguages,
    sitemapPriority: formData.sitemapPriority ?? null,
    sitemapChangeFreq: formData.sitemapChangeFreq ?? null,
    twitterCard: formData.twitterCard ?? null,
    twitterTitle: formData.twitterTitle ?? null,
    twitterDescription: formData.twitterDescription ?? null,
    twitterSite: formData.twitterSite ?? null,
    twitterCreator: formData.twitterCreator ?? null,
    twitterImage: formData.twitterImage ?? null,
    twitterImageAlt: formData.twitterImageAlt ?? null,
  };
}

export async function getLivePreviewSEO(
  slug: string,
  formData: PageFormData
): Promise<{ metaTags: Record<string, unknown>; jsonLd: string } | { error: string }> {
  try {
    const [settings, singletonAuthor] = await Promise.all([
      getAllSettings(),
      db.author.findUnique({
        where: { slug: MODONTY_AUTHOR_SLUG },
        select: { name: true, firstName: true, lastName: true },
      }),
    ]);

    const siteUrl = (settings.siteUrl?.trim() || "https://modonty.com").replace(/\/$/, "");
    const pageLike = formDataToPageLike(slug, formData);
    const ogLocaleAlternateStr = (formData.ogLocaleAlternate ?? "").trim() || undefined;
    const defaultAuthorString = singletonAuthor
      ? (singletonAuthor.name ?? ([singletonAuthor.firstName, singletonAuthor.lastName].filter(Boolean).join(" ").trim() || ""))
      : "";
    const authorValue = formData.author?.trim() || settings.siteAuthor?.trim() || defaultAuthorString || undefined;

    const metaTags = buildMetaFromPageLike(pageLike, {
      siteUrl,
      existingMeta: {},
      author: authorValue,
      ogLocaleAlternateStr,
      themeColor: settings.themeColor?.trim() || undefined,
      twitterSite: settings.twitterSite?.trim() || undefined,
      twitterCreator: settings.twitterCreator?.trim() || undefined,
      twitterSiteId: settings.twitterSiteId?.trim() || undefined,
      twitterCreatorId: settings.twitterCreatorId?.trim() || undefined,
      defaultSiteName: settings.siteName?.trim() || undefined,
      defaultMetaRobots: settings.defaultMetaRobots?.trim() || undefined,
      defaultGooglebot: settings.defaultGooglebot?.trim() || undefined,
      defaultOgType: settings.defaultOgType?.trim() || undefined,
      defaultOgLocale: settings.defaultOgLocale?.trim() || undefined,
      defaultOgDeterminer: settings.defaultOgDeterminer?.trim() || undefined,
      defaultTwitterCard: settings.defaultTwitterCard?.trim() || undefined,
      defaultSitemapPriority: settings.defaultSitemapPriority ?? undefined,
      defaultSitemapChangeFreq: settings.defaultSitemapChangeFreq?.trim() || undefined,
      defaultCharset: settings.defaultCharset?.trim() || undefined,
      defaultViewport: settings.defaultViewport?.trim() || undefined,
      defaultOgImageType: settings.defaultOgImageType?.trim() || undefined,
      defaultOgImageWidth: settings.defaultOgImageWidth ?? undefined,
      defaultOgImageHeight: settings.defaultOgImageHeight ?? undefined,
      defaultHreflang: settings.defaultHreflang?.trim() || undefined,
      defaultPathname: settings.defaultPathname?.trim() || undefined,
      titleMaxLength: settings.seoTitleMax ?? undefined,
      descriptionMaxLength: settings.seoDescriptionMax ?? undefined,
      defaultTruncationSuffix: settings.defaultTruncationSuffix?.trim() || undefined,
    }) as Record<string, unknown>;

    const localeAlternateArray = ogLocaleAlternateStr
      ? ogLocaleAlternateStr.split(",").map((s) => s.trim()).filter(Boolean)
      : Array.isArray(formData.alternateLanguages) && formData.alternateLanguages.length > 0
        ? (formData.alternateLanguages as { hreflang?: string }[]).map((a) => (a.hreflang ?? "").trim()).filter(Boolean)
        : undefined;
    const inLanguage = formData.inLanguage || settings.inLanguage?.trim() || (formData.ogLocale ?? "ar_SA").split("_")[0] || "ar";
    const knowsLanguage = localeAlternateArray?.length
      ? [inLanguage, ...localeAlternateArray]
      : [inLanguage];

    const sameAs = await getSameAsFromSettings();
    const hasContact = settings.orgContactType?.trim() || settings.orgContactEmail?.trim() || settings.orgContactTelephone?.trim();
    const areaServed = settings.orgAreaServed?.trim() || "SA, AE, KW, BH, OM, QA, EG";
    const logoUrl = formData.organizationSeo?.organizationLogoUrl?.trim() || settings.orgLogoUrl?.trim() || settings.logoUrl?.trim();
    const hasAddress = settings.orgStreetAddress?.trim() || settings.orgAddressCountry?.trim();
    const hasGeo = settings.orgGeoLatitude != null && settings.orgGeoLongitude != null;

    const siteConfig: ModontySiteConfig = {
      siteUrl,
      siteName: settings.siteName?.trim() || "Modonty",
      ...(settings.brandDescription?.trim() && { brandDescription: settings.brandDescription.trim() }),
      ...(sameAs.length > 0 && { sameAs }),
      ...(hasContact && {
        contactPoint: {
          ...(settings.orgContactType?.trim() && { contactType: settings.orgContactType.trim() }),
          ...(settings.orgContactEmail?.trim() && { email: settings.orgContactEmail.trim() }),
          ...(settings.orgContactTelephone?.trim() && { telephone: settings.orgContactTelephone.trim() }),
          ...(settings.orgAreaServed?.trim() && { areaServed: settings.orgAreaServed.trim() }),
        },
      }),
      areaServed,
      ...(logoUrl && { logo: logoUrl }),
      ...(settings.orgSearchUrlTemplate?.trim() && { searchUrlTemplate: settings.orgSearchUrlTemplate.trim() }),
      knowsLanguage,
      ...(hasAddress && {
        address: {
          ...(settings.orgStreetAddress?.trim() && { streetAddress: settings.orgStreetAddress.trim() }),
          ...(settings.orgAddressLocality?.trim() && { addressLocality: settings.orgAddressLocality.trim() }),
          ...(settings.orgAddressRegion?.trim() && { addressRegion: settings.orgAddressRegion.trim() }),
          ...(settings.orgAddressCountry?.trim() && { addressCountry: settings.orgAddressCountry.trim() }),
          ...(settings.orgPostalCode?.trim() && { postalCode: settings.orgPostalCode.trim() }),
        },
      }),
      ...(hasGeo && {
        geo: {
          latitude: Number(settings.orgGeoLatitude),
          longitude: Number(settings.orgGeoLongitude),
        },
      }),
    };

    const pageForJsonLd = {
      slug,
      title: formData.title ?? "",
      seoTitle: formData.seoTitle ?? null,
      seoDescription: formData.seoDescription ?? null,
      canonicalUrl: formData.canonicalUrl ?? null,
      inLanguage,
      heroImage: formData.heroImage ?? null,
      socialImage: formData.socialImage ?? null,
      ogImage: formData.ogImage ?? null,
      socialImageAlt: formData.socialImageAlt ?? formData.heroImageAlt ?? null,
      updatedAt: new Date(),
    };

    const rawJsonLd = generateModontyPageJsonLd(siteConfig, pageForJsonLd);
    const jsonLd = JSON.stringify(rawJsonLd, null, 2);
    return { metaTags, jsonLd };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}
