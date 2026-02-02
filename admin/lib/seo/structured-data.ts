import { Article, Client, Author, Category, ArticleFAQ } from "@prisma/client";
import { ArticleStructuredData } from "@/lib/types";

interface ArticleWithRelations extends Article {
  client: Client & {
    logoMedia?: { url: string } | null;
  };
  author: Author;
  category?: Category | null;
  faqs?: ArticleFAQ[];
  featuredImage?: { url: string; altText?: string | null } | null;
}

export function generateArticleStructuredData(article: ArticleWithRelations): ArticleStructuredData {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
  const articleUrl = article.canonicalUrl || `${siteUrl}/articles/${article.slug}`;

  const structuredData: ArticleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.seoDescription || article.excerpt || "",
    image: article.featuredImage?.url || undefined,
    datePublished: article.datePublished?.toISOString(),
    dateModified: article.dateModified.toISOString(),
    author: {
      "@type": "Person",
      name: article.author.name || "Modonty",
      ...(article.author.url && { url: article.author.url }),
      ...(article.author.image && { image: article.author.image }),
    },
    publisher: {
      "@type": "Organization",
      name: article.client.name,
      ...(article.client.logoMedia?.url && { logo: { "@type": "ImageObject", url: article.client.logoMedia.url } }),
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
    inLanguage: "ar",
    isAccessibleForFree: true,
  };

  if (article.faqs && article.faqs.length > 0) {
    structuredData.mainEntity = {
      "@type": "FAQPage",
      mainEntity: article.faqs.map((faq) => ({
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

export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
) {
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

import { PersonStructuredData } from "@/lib/types";

export function generateAuthorStructuredData(author: Author): PersonStructuredData {
  const structuredData: PersonStructuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    ...(author.bio && { description: author.bio }),
    ...(author.image && { image: author.image }),
    ...(author.url && { url: author.url }),
    ...(author.jobTitle && { jobTitle: author.jobTitle }),
    ...(author.expertiseAreas && author.expertiseAreas.length > 0 && {
      knowsAbout: author.expertiseAreas,
    }),
    ...(author.credentials && author.credentials.length > 0 && {
      hasCredential: author.credentials,
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

import { OrganizationStructuredData } from "@/lib/types";

export function generateOrganizationStructuredData(client: Client & {
  logoMedia?: { url: string; width?: number | null; height?: number | null } | null;
  parentOrganization?: { name: string; id?: string; url?: string } | null;
}): OrganizationStructuredData {
  const structuredData: OrganizationStructuredData = {
    "@context": "https://schema.org",
    "@type": (client.organizationType as "Organization" | "Corporation" | "LocalBusiness" | "NonProfit" | undefined) || "Organization",
    name: client.name,
    ...(client.legalName && { legalName: client.legalName }),
    ...(client.alternateName && { alternateName: client.alternateName }),
    ...(client.url && { url: client.url }),
    ...(client.slogan && { slogan: client.slogan }),
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
    ...(client.foundingDate && { foundingDate: client.foundingDate.toISOString().split("T")[0] }),
    ...(Array.isArray(client.keywords) && client.keywords.length > 0 && { keywords: client.keywords }),
    ...(Array.isArray(client.knowsLanguage) && client.knowsLanguage.length > 0 && { knowsLanguage: client.knowsLanguage }),
  };

  // Saudi Arabia & Gulf Identifiers
  const identifiers: Array<{ "@type": "PropertyValue"; name: string; value: string }> = [];
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

  // ContactPoint structure (array support)
  const contactPoints: Array<{
    "@type": "ContactPoint";
    contactType?: string;
    email?: string;
    telephone?: string;
    availableLanguage?: string[];
    areaServed?: string | string[];
  }> = [];
  
  if (client.email || client.phone) {
    const contactPoint: {
      "@type": "ContactPoint";
      contactType?: string;
      email?: string;
      telephone?: string;
      availableLanguage?: string[];
      areaServed?: string | string[];
    } = {
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
    structuredData.contactPoint = contactPoints.length === 1 ? [contactPoints[0]] : contactPoints;
  }

  // Enhanced Address structure (National Address Format)
  if (
    client.addressStreet ||
    client.addressCity ||
    client.addressCountry ||
    client.addressRegion ||
    client.addressNeighborhood ||
    client.addressBuildingNumber
  ) {
    structuredData.address = {
      "@type": "PostalAddress",
      ...(client.addressStreet && { streetAddress: client.addressStreet }),
      ...(client.addressNeighborhood && { addressNeighborhood: client.addressNeighborhood }),
      ...(client.addressCity && { addressLocality: client.addressCity }),
      ...(client.addressRegion && { addressRegion: client.addressRegion }),
      ...(client.addressCountry && { addressCountry: client.addressCountry }),
      ...(client.addressPostalCode && { postalCode: client.addressPostalCode }),
    };
  }

  // Classification
  if (client.isicV4) {
    structuredData.isicV4 = client.isicV4;
  }

  // Number of employees as QuantitativeValue
  if (client.numberOfEmployees) {
    const empValue = client.numberOfEmployees;
    if (empValue.includes("-")) {
      const [min, max] = empValue.split("-").map((v) => parseInt(v.trim()));
      if (!isNaN(min) && !isNaN(max)) {
        structuredData.numberOfEmployees = {
          "@type": "QuantitativeValue",
          minValue: min,
          maxValue: max,
        };
      }
    } else {
      const numValue = parseInt(empValue);
      if (!isNaN(numValue)) {
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

  // Parent organization relationship
  if (client.parentOrganization) {
    structuredData.parentOrganization = {
      "@type": "Organization",
      name: client.parentOrganization.name,
      ...(client.parentOrganization.id && { "@id": client.parentOrganization.id }),
      ...(client.parentOrganization.url && { url: client.parentOrganization.url }),
    };
  }

  // Social profiles
  if (Array.isArray(client.sameAs) && client.sameAs.length > 0) {
    structuredData.sameAs = client.sameAs;
  }

  return structuredData;
}

export function generateFAQPageStructuredData(faqs: ArticleFAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
