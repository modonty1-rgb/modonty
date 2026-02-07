"use server";

import { db } from "@/lib/db";
import { MODONTY_AUTHOR_SLUG } from "@/lib/constants/modonty-author";
import { revalidatePath } from "next/cache";
import { getAllSettings, getSameAsFromSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { generateModontyPageJsonLd, type ModontySiteConfig } from "../helpers/generate-modonty-page-jsonld";
import { normalizeModontyJsonLd } from "../helpers/jsonld-normalize";
import { validateModontyPageJsonLdComplete } from "../helpers/modonty-jsonld-validator";
import { getPageConfig } from "../helpers/page-config";
import { buildMetaFromPageLike } from "../helpers/build-meta-from-page";

export async function generateModontyPageSEO(slug: string) {
  try {
    const [page, singletonAuthor, settings] = await Promise.all([
      db.modonty.findUnique({
        where: { slug },
        select: {
          slug: true,
          title: true,
          seoTitle: true,
          seoDescription: true,
          canonicalUrl: true,
          inLanguage: true,
          heroImage: true,
          heroImageAlt: true,
          socialImage: true,
          socialImageAlt: true,
          ogImage: true,
          updatedAt: true,
          metaRobots: true,
          ogTitle: true,
          ogDescription: true,
          ogType: true,
          ogUrl: true,
          ogSiteName: true,
          ogLocale: true,
          alternateLanguages: true,
          sitemapPriority: true,
          sitemapChangeFreq: true,
          twitterCard: true,
          twitterTitle: true,
          twitterDescription: true,
          twitterSite: true,
          twitterCreator: true,
          metaTags: true,
        },
      }),
      db.author.findUnique({
        where: { slug: MODONTY_AUTHOR_SLUG },
        select: { name: true, firstName: true, lastName: true },
      }),
      getAllSettings(),
    ]);

    if (!page) return { success: false, error: "Page not found" };

    const siteUrl = (settings.siteUrl?.trim() || "https://modonty.com").replace(/\/$/, "");
    const existingMeta = (page.metaTags ?? {}) as Record<string, unknown>;
    const defaultAuthorString = singletonAuthor
      ? (singletonAuthor.name ?? ([singletonAuthor.firstName, singletonAuthor.lastName].filter(Boolean).join(" ").trim() || ""))
      : "";
    const authorValue = (existingMeta.author as string) || settings.siteAuthor?.trim() || defaultAuthorString;
    const ogLocaleAlternateRaw = existingMeta.ogLocaleAlternate;
    const ogLocaleAlternateStr = typeof ogLocaleAlternateRaw === "string" ? ogLocaleAlternateRaw : undefined;

    const metaTags = buildMetaFromPageLike(page, {
      siteUrl,
      existingMeta,
      author: authorValue,
      ogLocaleAlternateStr,
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
      defaultOgImageType: settings.defaultOgImageType?.trim() || undefined,
      defaultOgImageWidth: settings.defaultOgImageWidth ?? undefined,
      defaultOgImageHeight: settings.defaultOgImageHeight ?? undefined,
      defaultHreflang: settings.defaultHreflang?.trim() || undefined,
      defaultPathname: settings.defaultPathname?.trim() || undefined,
      titleMaxLength: settings.seoTitleMax ?? undefined,
      descriptionMaxLength: settings.seoDescriptionMax ?? undefined,
      defaultTruncationSuffix: settings.defaultTruncationSuffix?.trim() || undefined,
    }) as Record<string, unknown>;

    const localeAlternateArray = ogLocaleAlternateStr?.trim()
      ? ogLocaleAlternateStr.split(",").map((s) => s.trim()).filter(Boolean)
      : Array.isArray(page.alternateLanguages) && page.alternateLanguages.length > 0
        ? (page.alternateLanguages as { hreflang?: string }[]).map((a) => (a.hreflang ?? "").trim()).filter(Boolean)
        : undefined;

    const defaultInLanguage = page.inLanguage || settings.inLanguage?.trim() || (page.ogLocale || "ar_SA").split("_")[0] || "ar";
    const knowsLanguage = localeAlternateArray?.length
      ? [defaultInLanguage, ...localeAlternateArray]
      : [defaultInLanguage];

    const sameAs = await getSameAsFromSettings();
    const hasContact = settings.orgContactType?.trim() || settings.orgContactEmail?.trim() || settings.orgContactTelephone?.trim();
    const areaServed = settings.orgAreaServed?.trim() || "SA, AE, KW, BH, OM, QA, EG";
    const logoUrl = settings.orgLogoUrl?.trim() || settings.logoUrl?.trim();
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
      slug: page.slug,
      title: page.title,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
      canonicalUrl: page.canonicalUrl,
      inLanguage: defaultInLanguage,
      heroImage: page.heroImage,
      socialImage: page.socialImage,
      ogImage: page.ogImage,
      socialImageAlt: page.socialImageAlt ?? page.heroImageAlt,
      updatedAt: page.updatedAt,
    };

    const rawJsonLd = generateModontyPageJsonLd(siteConfig, pageForJsonLd);
    const normalizedJsonLd = await normalizeModontyJsonLd(rawJsonLd);
    const validationReport = await validateModontyPageJsonLdComplete(normalizedJsonLd);
    const jsonLdString = JSON.stringify(rawJsonLd, null, 2);

    await db.modonty.update({
      where: { slug },
      data: {
        metaTags: JSON.parse(JSON.stringify(metaTags)) as object,
        jsonLdStructuredData: jsonLdString,
        jsonLdLastGenerated: new Date(),
        jsonLdValidationReport: JSON.parse(JSON.stringify(validationReport)) as object,
      },
    });

    revalidatePath("/modonty/setting", "page");
    const pageConfig = getPageConfig(slug);
    if (pageConfig?.modontyPath) {
      const modontyUrl = settings.siteUrl?.trim() || "https://modonty.com";
      if (modontyUrl) {
        fetch(
          `${modontyUrl}/api/revalidate?path=${pageConfig.modontyPath}&secret=${process.env.REVALIDATE_SECRET}`,
          { method: "POST" }
        ).catch(() => {});
      }
    }
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
