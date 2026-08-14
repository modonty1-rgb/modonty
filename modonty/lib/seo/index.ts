import { Metadata } from "next";
import { safeOrganizationType } from "@modonty/shared/lib/seo/organization-schema-types";
import { buildArticleImageObjects } from "./image-aspect-ratios";
import { BUNNY_ASPECT_SUFFIX, bunnyAspectUrl, hasBunnyAspectCrops } from "@modonty/shared/lib/bunny";
import { BRAND_AR, BRAND_EN, SITE_URL, LOGO_URL } from "@/lib/brand";
import { getBrandMedia } from "@/lib/settings/get-brand-media";
import { mediaSrc } from "@modonty/shared/lib/media-src";

export { buildAlternates } from "./build-alternates";

/**
 * Serialize JSON-LD for safe inline injection inside <script type="application/ld+json">.
 * Escapes `<` → `<` so a string field containing `</script>` (or any markup) can't
 * break out of the tag (XSS / parser-breakout). Use this everywhere instead of bare JSON.stringify.
 */
export function jsonLdHtml(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Same `<` escaping for JSON-LD that is ALREADY serialized (the stored blobs the
 * admin generators write with bare JSON.stringify). Escaping `<` inside a JSON
 * string parses back to the identical value, so the graph is untouched — only the
 * markup-breakout risk dies. Apply at EVERY stored-blob injection point.
 */
export function jsonLdHtmlFromString(json: string): string {
  return json.replace(/</g, "\\u003c");
}

/**
 * The share image, resolved to a crop the platform ACTUALLY stores.
 *
 * Admin pre-generates exactly three crops per image at upload — 1:1, 4:3 and 16:9, all
 * 1200 wide (`admin/…/media/actions/generate-aspect-crops.ts:16-20`). There is no
 * 1200×630 variant and never was on Bunny: the old `toOgImage1200x630` built a
 * Cloudinary `c_fill,w_1200,h_630` url, so after the migration it early-returned and
 * every page still declared `og:image:width 1200` / `height 630` over the untouched
 * ORIGINAL. Measured on production 2026-08-14 across four articles: the declared size
 * was 1200×630 while the served file was 1920×1080 — and two of the four were PNG
 * behind a `.webp` name, ~600KB where the 16:9 crop is ~60KB.
 *
 * So the share image is the 16:9 crop: it is the widest stored ratio (1.78 vs the
 * 1.90 the OG docs suggest — both well inside what every platform renders without a
 * visible crop), it exists for every uploaded image, and its dimensions are known
 * exactly, which is what makes the declared width/height true instead of aspirational.
 */
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 675;

export interface OgImageEntry {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

/**
 * Bunny stores the crops next to the base file, so the 16:9 url is derivable. Anything
 * NOT on Bunny (an external url, a brand asset set by hand) has no crop to point at —
 * it is returned untouched and WITHOUT dimensions, because asserting a size we did not
 * measure is the exact bug this replaces.
 */
export function toShareImage(url: string): OgImageEntry {
  // NOT `isBunnyUrl(zone, …)`: that resolves a zone config and THROWS when the BUNNY_* env is
  // absent — unacceptable inside metadata generation, which runs on every page. And the real
  // question is not the zone but whether crops were generated for this file at all.
  if (!hasBunnyAspectCrops(url)) return { url };
  if (/__(?:1x1|4x3|16x9)\.webp(?:\?|$)/.test(url)) {
    return { url, width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT };
  }
  return {
    url: bunnyAspectUrl(url, BUNNY_ASPECT_SUFFIX["16:9"]),
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
  };
}

/**
 * Normalize cached og:image entries onto the stored 16:9 crop. Accepts the loose
 * `Metadata.openGraph.images` shape (string | object | array) and always returns a clean
 * array (or undefined when empty).
 */
export function normalizeOgImages(images: unknown): OgImageEntry[] | undefined {
  const list = Array.isArray(images) ? images : images ? [images] : [];
  const out = list
    .map((entry) => {
      const url = typeof entry === "string" ? entry : (entry as { url?: string } | null)?.url;
      if (!url || typeof url !== "string") return null;
      const alt = typeof entry === "object" && entry ? (entry as { alt?: string }).alt : undefined;
      return { ...toShareImage(url), ...(alt ? { alt } : {}) };
    })
    .filter((x): x is OgImageEntry => x !== null);
  return out.length > 0 ? out : undefined;
}

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  /** Alt text for OG and Twitter image (twitter:image:alt). Falls back to title. */
  imageAlt?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  siteName?: string;
  locale?: string;
  /** Alternate locales for og:locale:alternate */
  localeAlternate?: string[];
  firstName?: string;
  lastName?: string;
  twitterCreator?: string;
  // Article-specific metadata (used when type === "article")
  publishedTime?: Date | string;
  modifiedTime?: Date | string;
  authors?: string[];
  section?: string;
  tags?: string[];
  // Twitter-specific extras
  twitterSite?: string;
  /** Hreflang: { "ar": url, "x-default": url } or extended. Defaults to ar + x-default if omitted. */
  languages?: Record<string, string>;
  /** Robots directive: "index,follow" (default) or "noindex,nofollow" etc. */
  robots?: string;
}

export interface MetadataOptions {
  robots?: string;
}

export async function generateMetadataFromSEO(data: SEOData, options?: MetadataOptions): Promise<Metadata> {
  const {
    title,
    description,
    keywords,
    image,
    imageAlt,
    url,
    type = "website",
    siteName = BRAND_AR,
    locale = "ar_SA",
    firstName,
    lastName,
    twitterCreator,
    publishedTime,
    modifiedTime,
    authors,
    section,
    tags,
    twitterSite,
    localeAlternate,
    languages: languagesInput,
  } = data;

  const fullTitle = title ? `${title} - ${siteName}` : siteName;
  const siteUrl = SITE_URL;
  let canonicalUrl: string;
  if (!url) {
    canonicalUrl = siteUrl;
  } else if (/^https?:\/\//.test(url)) {
    canonicalUrl = url;
  } else {
    canonicalUrl = `${siteUrl}${url}`;
  }
  // OG/share image: page-specific image, else the admin-managed Settings.ogImageUrl
  // (single source of truth). If neither exists, og:image is OMITTED — no static fallback.
  // The admin is alerted to fill it via the EssentialSeoDialog in the admin app.
  const brandMedia = await getBrandMedia();
  const ogImageRaw = image || brandMedia.ogImageUrl || undefined;
  const imageAltResolved = imageAlt || title || brandMedia.altImage || siteName;
  // Point at the stored 16:9 crop and declare ITS size — see `toShareImage`.
  const ogImages = ogImageRaw
    ? [{ ...toShareImage(ogImageRaw), alt: imageAltResolved }]
    : undefined;

  const robotsDirective = data.robots || options?.robots || "index,follow";
  const shouldIndex = !robotsDirective.includes("noindex");
  const shouldFollow = !robotsDirective.includes("nofollow");

  const openGraph: Metadata["openGraph"] = {
    title: fullTitle,
    description: description || "",
    url: canonicalUrl,
    siteName: siteName,
    images: ogImages,
    locale: locale,
    ...(localeAlternate && localeAlternate.length > 0 && { localeAlternate }),
    type: type,
  };

  if (type === "article" && openGraph) {
    const ogArticle = openGraph as any;
    if (publishedTime) {
      ogArticle.publishedTime =
        typeof publishedTime === "string"
          ? new Date(publishedTime).toISOString()
          : publishedTime.toISOString();
    }
    if (modifiedTime) {
      ogArticle.modifiedTime =
        typeof modifiedTime === "string"
          ? new Date(modifiedTime).toISOString()
          : modifiedTime.toISOString();
    }
    if (authors && authors.length > 0) {
      ogArticle.authors = authors;
    }
    if (section) {
      ogArticle.section = section;
    }
    if (tags && tags.length > 0) {
      ogArticle.tags = tags;
    }
  }

  const twitter: Metadata["twitter"] = {
    card: "summary_large_image",
    title: fullTitle,
    description: description || "",
    images: ogImages ? [{ url: ogImages[0].url, alt: imageAltResolved }] : undefined,
  };

  if (twitterCreator) {
    const creatorHandle = twitterCreator.replace(/^@/, "");
    twitter.creator = `@${creatorHandle}`;
  }

  if (twitterSite) {
    const siteHandle = twitterSite.replace(/^@/, "");
    twitter.site = `@${siteHandle}`;
  }

  // Default = the FULL platform set (same as buildAlternates). Next.js REPLACES the
  // layout's alternates rather than merging, so a lean default here silently stripped
  // ar-SA/ar-EG from every page that relied on it (GEO audit 2026-07-13, ن١٣).
  const languages =
    languagesInput && Object.keys(languagesInput).length > 0
      ? languagesInput
      : {
          "ar-SA": canonicalUrl,
          "ar-EG": canonicalUrl,
          ar: canonicalUrl,
          "x-default": canonicalUrl,
        };

  return {
    title: fullTitle,
    description: description || "منصة مدونات احترافية لإدارة المحتوى عبر عملاء متعددين",
    keywords: keywords || [],
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph,
    twitter,
    robots: {
      index: shouldIndex,
      follow: shouldFollow,
      googleBot: {
        index: shouldIndex,
        follow: shouldFollow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export function generateStructuredData(data: {
  type: "Category" | "Client" | "Person" | "Article" | "WebPage" | "AboutPage" | "ContactPage";
  name: string;
  description?: string;
  url?: string;
  image?: string;
  [key: string]: unknown;
}): object {
  const { type, name, description, url, image, ...additionalData } = data;
  const siteUrl = SITE_URL;

  const baseSchema = {
    "@context": "https://schema.org",
    "@type": type,
    name: name,
    ...(description && { description }),
    ...(url && { url: `${siteUrl}${url}` }),
    ...(image && { image }),
    ...additionalData,
  };

  return baseSchema;
}

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
        inLanguage: "ar",
        publisher: { "@id": orgId },
      },
    ],
  };
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>): object {
  const siteUrl = SITE_URL;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      // Use URL constructor to safely percent-encode non-ASCII path segments
      item: new URL(item.url, siteUrl).href,
    })),
  };
}

export function generateArticleStructuredData(article: any) {
  const siteUrl = SITE_URL;
  // Always build from current slug — never trust article.canonicalUrl (may be stale after slug rename)
  const articleUrl = new URL(`/articles/${article.slug}`, siteUrl).href;

  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.seoDescription || article.excerpt || "",
    // Google Article rich results: 3 aspect ratios (1:1, 4:3, 16:9) as ImageObject[]
    // with explicit width/height (richer than bare URLs → better Google Images + AI).
    image: mediaSrc(article.featuredImage)
      ? buildArticleImageObjects(mediaSrc(article.featuredImage) ?? article.featuredImage!.url, 1200, {
          width: article.featuredImage.width,
          height: article.featuredImage.height,
        })
      : undefined,
    datePublished: article.datePublished?.toISOString(),
    // Accurate, not noisy: real edit date → else publish date (NOT updatedAt, which bumps on any
    // DB write and would fake freshness — against Google guidelines). updatedAt only as last resort.
    dateModified: (article.dateModified || article.datePublished || article.updatedAt)?.toISOString(),
    // Author = Modonty (the platform brand). The team/writers change, but the brand is the
    // constant author. Organization type per Google's author best-practices; linked via @id
    // to the #organization entity (logo + url + sameAs) so Google resolves the full identity.
    // url = canonical site (www) — fixes the stale homepage value. Visible byline already
    // shows the same name (schema ↔ visible match, required by Google).
    author: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: article.author?.name || BRAND_EN,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: article.client.name,
      // Logo as ImageObject — data carries it at client.logoMedia.url (fallback to legacy client.logo)
      ...((mediaSrc(article.client.logoMedia) || article.client.logo) && {
        logo: { "@type": "ImageObject", url: mediaSrc(article.client.logoMedia) || article.client.logo },
      }),
      ...(article.client.url && { url: article.client.url }),
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    ...(article.category && {
      articleSection: article.category.name,
    }),
    ...(article.wordCount && { wordCount: article.wordCount }),
    // keywords = the article's visible tags (matches on-page content → safe enrichment)
    ...(Array.isArray(article.tags) && article.tags.length > 0 && {
      keywords: article.tags.map((t: any) => t?.tag?.name).filter(Boolean),
    }),
    inLanguage: article.inLanguage || "ar",
    isAccessibleForFree: article.isAccessibleForFree ?? true,
    ...(article.license && { license: article.license }),
  };

  if (article.faqs && article.faqs.length > 0) {
    structuredData.mainEntity = {
      "@type": "FAQPage",
      mainEntity: article.faqs.map((faq: any) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };
  }

  // Inject semanticKeywords (Wikidata entities) as schema.org `mentions`.
  // Each entity references its Wikidata URL via @id + sameAs for disambiguation.
  // Falls back to plain { @type: Thing, name } when no wikidataId/url is set.
  const semantics = Array.isArray(article.semanticKeywords)
    ? (article.semanticKeywords as Array<{ name?: string; wikidataId?: string | null; url?: string | null }>)
    : [];
  const mentionEntities = semantics
    .filter((s) => s && typeof s.name === "string" && s.name.trim().length > 0)
    .map((s) => {
      const wikidataUrl = s.wikidataId
        ? `https://www.wikidata.org/entity/${s.wikidataId}`
        : null;
      const entityId = s.url || wikidataUrl;
      const entity: Record<string, unknown> = {
        "@type": "Thing",
        name: s.name,
      };
      if (entityId) {
        entity["@id"] = entityId;
        entity.sameAs = entityId;
      }
      return entity;
    });
  if (mentionEntities.length > 0) {
    structuredData.mentions = mentionEntities;
  }

  return structuredData;
}

export function generateAuthorStructuredData(author: any) {
  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    ...(author.bio && { description: author.bio }),
    ...(author.image && { image: author.image }),
    ...(author.url && { url: author.url }),
    ...(author.email && { email: author.email }),
    ...(author.firstName && { givenName: author.firstName }),
    ...(author.lastName && { familyName: author.lastName }),
    ...(author.jobTitle && { jobTitle: author.jobTitle }),
    ...(author.worksFor && {
      worksFor: {
        "@type": "Organization",
        "@id": author.worksFor,
      },
    }),
    ...(author.expertiseAreas && author.expertiseAreas.length > 0 && {
      knowsAbout: author.expertiseAreas,
    }),
    ...(author.credentials && author.credentials.length > 0 && {
      hasCredential: author.credentials,
    }),
    ...(author.memberOf && author.memberOf.length > 0 && {
      memberOf: author.memberOf.map((org: string) => ({
        "@type": "Organization",
        name: org,
      })),
    }),
  };

  const sameAs: string[] = [];
  if (author.linkedIn) sameAs.push(author.linkedIn);
  if (author.twitter) sameAs.push(author.twitter);
  if (author.facebook) sameAs.push(author.facebook);
  if (author.sameAs && author.sameAs.length > 0) {
    sameAs.push(...author.sameAs);
  }
  if (sameAs.length > 0) {
    structuredData.sameAs = sameAs;
  }

  return structuredData;
}

export function generateOrganizationStructuredData(client: any) {
  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": safeOrganizationType(client.organizationType),
    name: client.name,
    ...(client.legalName && { legalName: client.legalName }),
    ...(client.alternateName && { alternateName: client.alternateName }),
    ...(client.url && { url: client.url }),
    ...(client.slogan && { slogan: client.slogan }),
    ...(client.logo && { logo: { "@type": "ImageObject", url: client.logo } }),
    ...(mediaSrc(client.logoMedia) && {
      logo: {
        "@type": "ImageObject",
        url: mediaSrc(client.logoMedia) ?? client.logoMedia.url,
        ...(client.logoMedia.width && { width: client.logoMedia.width }),
        ...(client.logoMedia.height && { height: client.logoMedia.height }),
      },
    }),
    ...(client.description && { description: client.description }),
    ...(!client.description && client.seoDescription && { description: client.seoDescription }),
    ...(client.foundingDate && {
      foundingDate:
        typeof client.foundingDate === "string"
          ? client.foundingDate.split("T")[0]
          : client.foundingDate.toISOString().split("T")[0],
    }),
    ...(Array.isArray(client.keywords) && client.keywords.length > 0 && { keywords: client.keywords }),
    ...(Array.isArray(client.knowsLanguage) && client.knowsLanguage.length > 0 && { knowsLanguage: client.knowsLanguage }),
  };

  const identifiers: any[] = [];
  if (client.commercialRegistrationNumber) {
    identifiers.push({
      "@type": "PropertyValue",
      name: "Commercial Registration Number",
      value: client.commercialRegistrationNumber,
    });
  }
  if (identifiers.length > 0) {
    structuredData.identifier = identifiers;
  }
  if (client.vatID) {
    structuredData.vatID = client.vatID;
  }
  if (client.taxID) {
    structuredData.taxID = client.taxID;
  }

  const contactPoints: any[] = [];
  if (client.email || client.phone) {
    const contactPoint: any = {
      "@type": "ContactPoint",
    };
    if (client.contactType) {
      contactPoint.contactType = client.contactType;
    } else if (client.email && client.phone) {
      contactPoint.contactType = "customer service";
    }
    if (client.email) {
      contactPoint.email = client.email;
    }
    if (client.phone) {
      contactPoint.telephone = client.phone;
    }
    contactPoint.areaServed = client.addressCountry || "SA";
    contactPoint.availableLanguage = Array.isArray(client.knowsLanguage) && client.knowsLanguage.length > 0
      ? client.knowsLanguage
      : ["Arabic", "English"];
    contactPoints.push(contactPoint);
  }
  if (contactPoints.length > 0) {
    structuredData.contactPoint = contactPoints.length === 1 ? contactPoints[0] : contactPoints;
  }

  if (
    client.addressStreet ||
    client.addressCity ||
    client.addressCountry ||
    client.addressRegion ||
    client.addressNeighborhood ||
    client.addressBuildingNumber
  ) {
    const address: any = {
      "@type": "PostalAddress",
    };
    if (client.addressStreet) address.streetAddress = client.addressStreet;
    if (client.addressNeighborhood) address.addressNeighborhood = client.addressNeighborhood;
    if (client.addressCity) address.addressLocality = client.addressCity;
    if (client.addressRegion) address.addressRegion = client.addressRegion;
    if (client.addressCountry) address.addressCountry = client.addressCountry;
    if (client.addressPostalCode) address.postalCode = client.addressPostalCode;
    structuredData.address = address;
  }

  if (client.isicV4) {
    structuredData.isicV4 = client.isicV4;
  }

  if (client.numberOfEmployees) {
    const empValue = client.numberOfEmployees;
    if (typeof empValue === "string" && empValue.includes("-")) {
      const [min, max] = empValue.split("-").map((v) => parseInt(v.trim()));
      if (!isNaN(min) && !isNaN(max)) {
        structuredData.numberOfEmployees = {
          "@type": "QuantitativeValue",
          minValue: min,
          maxValue: max,
        };
      }
    } else {
      const numValue = typeof empValue === "string" ? parseInt(empValue) : empValue;
      if (!isNaN(numValue as number)) {
        structuredData.numberOfEmployees = {
          "@type": "QuantitativeValue",
          value: numValue,
        };
      } else {
        structuredData.numberOfEmployees = {
          "@type": "QuantitativeValue",
          value: empValue,
        };
      }
    }
  }

  if (client.parentOrganization) {
    structuredData.parentOrganization = {
      "@type": "Organization",
      name: client.parentOrganization.name,
      ...(client.parentOrganization.id && { "@id": client.parentOrganization.id }),
      ...(client.parentOrganization.url && { url: client.parentOrganization.url }),
    };
  }

  if (client.sameAs && client.sameAs.length > 0) {
    structuredData.sameAs = client.sameAs;
  }

  return structuredData;
}

export function generateFAQPageStructuredData(faqs: any[]) {
  const siteUrl = SITE_URL;
  const faqPageUrl = `${siteUrl}/help/faq`;

  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${faqPageUrl}#faqpage`,
    mainEntity: faqs.map((faq, index) => {
      const question: any = {
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      };

      if (faq.dateCreated) {
        question.dateCreated = new Date(faq.dateCreated).toISOString();
      }
      if (faq.datePublished) {
        question.datePublished = new Date(faq.datePublished).toISOString();
      }
      if (faq.author) {
        question.author = {
          "@type": "Person",
          name: faq.author,
        };
        question.acceptedAnswer.author = {
          "@type": "Person",
          name: faq.author,
        };
      }
      if (faq.upvoteCount !== null && faq.upvoteCount !== undefined) {
        question.upvoteCount = faq.upvoteCount;
        question.acceptedAnswer.upvoteCount = faq.upvoteCount;
      }
      if (faq.dateCreated) {
        question.acceptedAnswer.dateCreated = new Date(faq.dateCreated).toISOString();
      }

      return question;
    }),
  };

  const lastReviewedDates = faqs
    .map((f) => f.lastReviewed)
    .filter((d) => d !== null && d !== undefined)
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  if (lastReviewedDates.length > 0) {
    structuredData.lastReviewed = lastReviewedDates[0].toISOString();
  }

  const speakableSelectors: string[] = [];
  faqs.forEach((faq, index) => {
    if (faq.speakable && typeof faq.speakable === "object") {
      const speakable = faq.speakable as any;
      if (speakable.cssSelector && Array.isArray(speakable.cssSelector)) {
        speakableSelectors.push(...speakable.cssSelector);
      }
    } else {
      speakableSelectors.push(`#faq-question-${index + 1}`, `#faq-answer-${index + 1}`);
    }
  });

  if (speakableSelectors.length > 0) {
    structuredData.speakable = {
      "@type": "SpeakableSpecification",
      cssSelector: speakableSelectors,
    };
  }

  return structuredData;
}

