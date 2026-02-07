import { Metadata } from "next";

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
}

export interface MetadataOptions {
  robots?: string;
}

export function generateMetadataFromSEO(data: SEOData, options?: MetadataOptions): Metadata {
  const {
    title,
    description,
    keywords,
    image,
    imageAlt,
    url,
    type = "website",
    siteName = "مودونتي",
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
    languages: languagesInput,
  } = data;

  const fullTitle = title ? `${title} - ${siteName}` : siteName;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
  let canonicalUrl: string;
  if (!url) {
    canonicalUrl = siteUrl;
  } else if (/^https?:\/\//.test(url)) {
    canonicalUrl = url;
  } else {
    canonicalUrl = `${siteUrl}${url}`;
  }
  const ogImage = image || `${siteUrl}/og-image.jpg`;
  const imageAltResolved = imageAlt || title || siteName;

  const robotsDirective = options?.robots || "index,follow";
  const shouldIndex = !robotsDirective.includes("noindex");
  const shouldFollow = !robotsDirective.includes("nofollow");

  const openGraph: Metadata["openGraph"] = {
    title: fullTitle,
    description: description || "",
    url: canonicalUrl,
    siteName: siteName,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: imageAltResolved,
      },
    ],
    locale: locale,
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
    images: [{ url: ogImage, alt: imageAltResolved }],
  };

  if (twitterCreator) {
    const creatorHandle = twitterCreator.replace(/^@/, "");
    twitter.creator = `@${creatorHandle}`;
  }

  if (twitterSite) {
    const siteHandle = twitterSite.replace(/^@/, "");
    twitter.site = `@${siteHandle}`;
  }

  const languages =
    languagesInput && Object.keys(languagesInput).length > 0
      ? languagesInput
      : { ar: canonicalUrl, "x-default": canonicalUrl };

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";

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

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>): object {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  };
}

export function generateArticleStructuredData(article: any) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
  const articleUrl = article.canonicalUrl || `${siteUrl}/articles/${article.slug}`;

  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.seoDescription || article.excerpt || "",
    image: article.featuredImage?.url || article.ogImage || undefined,
    datePublished: article.datePublished?.toISOString(),
    dateModified: article.dateModified?.toISOString() || article.updatedAt?.toISOString(),
    author: {
      "@type": "Person",
      name: article.author.name || "Modonty",
      ...(article.author.url && { url: article.author.url }),
      ...(article.author.image && { image: article.author.image }),
    },
    publisher: {
      "@type": "Organization",
      name: article.client.name,
      ...(article.client.logo && { logo: { "@type": "ImageObject", url: article.client.logo } }),
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
    "@type": client.organizationType || "Organization",
    name: client.name,
    ...(client.legalName && { legalName: client.legalName }),
    ...(client.alternateName && { alternateName: client.alternateName }),
    ...(client.url && { url: client.url }),
    ...(client.slogan && { slogan: client.slogan }),
    ...(client.logo && { logo: { "@type": "ImageObject", url: client.logo } }),
    ...(client.logoMedia?.url && {
      logo: {
        "@type": "ImageObject",
        url: client.logoMedia.url,
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
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

