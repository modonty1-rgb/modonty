export interface StructuredDataBase {
  "@context": string;
  "@type": string;
}

export interface ArticleStructuredData extends StructuredDataBase {
  "@type": "Article";
  headline: string;
  description?: string;
  image?: string | string[];
  datePublished?: string;
  dateModified: string;
  author: {
    "@type": "Person";
    name: string;
    url?: string;
  };
  publisher: {
    "@type": "Organization";
    name: string;
    logo?: {
      "@type": "ImageObject";
      url: string;
    };
  };
  mainEntityOfPage?: {
    "@type": "WebPage";
    "@id": string;
  };
  articleSection?: string;
  keywords?: string[];
  wordCount?: number;
  inLanguage?: string;
  isAccessibleForFree?: boolean;
  license?: string;
  mainEntity?: {
    "@type": "FAQPage";
    mainEntity: Array<{
      "@type": "Question";
      name: string;
      acceptedAnswer: {
        "@type": "Answer";
        text: string;
      };
    }>;
  };
}

export interface OrganizationStructuredData extends StructuredDataBase {
  "@type": "Organization" | "Corporation" | "LocalBusiness" | "NonProfit" | "EducationalOrganization" | "GovernmentOrganization" | "SportsOrganization" | "NGO";
  name: string;
  legalName?: string;
  alternateName?: string;
  url?: string;
  logo?: string | {
    "@type": "ImageObject";
    url: string;
    width?: number;
    height?: number;
  };
  image?: string;
  description?: string;
  slogan?: string;
  keywords?: string[];
  sameAs?: string[];

  // Identifiers
  identifier?: Array<{
    "@type": "PropertyValue";
    name: string;
    value: string;
  }>;
  vatID?: string;
  taxID?: string;

  // Contact Points (now array)
  contactPoint?: Array<{
    "@type": "ContactPoint";
    telephone?: string;
    email?: string;
    contactType?: string;
    availableLanguage?: string[];
    areaServed?: string | string[];
  }>;

  // Address (enhanced)
  address?: {
    "@type": "PostalAddress";
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    addressNeighborhood?: string;
    postalCode?: string;
    addressCountry?: string;
  };

  // Classification
  isicV4?: string;
  numberOfEmployees?: {
    "@type": "QuantitativeValue";
    value?: string | number;
    minValue?: number;
    maxValue?: number;
  };

  // Relationships
  parentOrganization?: {
    "@type": "Organization";
    name: string;
    "@id"?: string;
  };

  foundingDate?: string;
  knowsLanguage?: string[];
}

export interface PersonStructuredData extends StructuredDataBase {
  "@type": "Person";
  name: string;
  jobTitle?: string;
  worksFor?: {
    "@type": "Organization";
    name: string;
  };
  image?: string;
  url?: string;
  sameAs?: string[];
  description?: string;
  knowsAbout?: string[];
}

export interface BreadcrumbStructuredData extends StructuredDataBase {
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item?: string;
  }>;
}

export type StructuredData =
  | ArticleStructuredData
  | OrganizationStructuredData
  | PersonStructuredData
  | BreadcrumbStructuredData;
