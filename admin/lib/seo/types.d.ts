/**
 * Type declarations for SEO modules
 */

declare module "html-to-text" {
  export function convert(
    html: string,
    options?: {
      wordwrap?: boolean | number;
      selectors?: Array<{
        selector: string;
        format?: string;
        options?: Record<string, unknown>;
      }>;
    }
  ): string;
}

declare module "@adobe/structured-data-validator" {
  export interface ValidationError {
    message: string;
    path?: string;
    property?: string;
    type?: string;
  }

  export interface ValidationWarning {
    message: string;
    path?: string;
    property?: string;
    recommendation?: string;
  }

  export interface ValidationResult {
    valid: boolean;
    errors?: ValidationError[];
    warnings?: ValidationWarning[];
  }

  export class Validator {
    constructor(schema: unknown);
    validate(data: unknown): Promise<ValidationResult>;
    debug?: boolean;
  }
}

declare module "@marbec/web-auto-extractor" {
  export default class WebAutoExtractor {
    constructor(options?: {
      addLocation?: boolean;
      embedSource?: ("rdfa" | "microdata")[];
    });
    parse(html: string): unknown[];
  }
}

declare module "google-auth-library" {
  export interface JWT {
    authorize(): Promise<void>;
  }
  export class JWT implements JWT {
    constructor(options: {
      email: string;
      key: string;
      scopes: string[];
    });
  }
}

// Full page validation types
export interface ExtractedData {
  jsonLd: unknown[];
  microdata: unknown[];
  rdfa: unknown[];
  all: unknown[];
  locations: Record<string, unknown>;
  raw: {
    jsonLd: unknown[];
    microdata: unknown[];
    rdfa: unknown[];
  };
}

export interface SEOAnalysis {
  metaTags: MetaTagAnalysis;
  headings: HeadingAnalysis;
  content: ContentAnalysis;
  images: ImageAnalysis;
  links: LinkAnalysis;
  issues: SEOIssue[];
  score: number;
}

export interface MetaTagAnalysis {
  title?: string;
  titleLength?: number;
  description?: string;
  descriptionLength?: number;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  language?: string;
  issues: SEOIssue[];
}

export interface HeadingAnalysis {
  h1: string[];
  h2: string[];
  h3: string[];
  h4: string[];
  h5: string[];
  h6: string[];
  hierarchyValid: boolean;
  issues: SEOIssue[];
}

export interface ContentAnalysis {
  wordCount: number;
  paragraphCount: number;
  linkCount: number;
  imageCount: number;
  readabilityScore?: number;
  issues: SEOIssue[];
}

export interface ImageAnalysis {
  images: Array<{
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
    issues: string[];
  }>;
  totalImages: number;
  imagesWithAlt: number;
  imagesWithoutAlt: number;
  issues: SEOIssue[];
}

export interface LinkAnalysis {
  internal: number;
  external: number;
  total: number;
  broken: string[];
  issues: SEOIssue[];
}

export interface SEOIssue {
  code: string;
  category: "meta" | "heading" | "content" | "image" | "link" | "structure";
  severity: "error" | "warning" | "info";
  message: string;
  fix?: string;
  element?: string;
}

export interface ValidationIssue {
  code: string;
  category: "schema" | "seo" | "content" | "media" | "structured-data";
  severity: "critical" | "warning" | "suggestion";
  message: string;
  path?: string;
  property?: string;
  fix?: string;
  location?: unknown;
}

export interface FullPageValidationResult {
  url: string;
  pageType: string;
  rendered: boolean;
  structuredData: {
    extracted: ExtractedData;
    validation: import("./jsonld-validator").ValidationReport;
    schemaErrors: number;
    schemaWarnings: number;
  };
  seo: SEOAnalysis;
  timestamp: string;
  overallScore: number;
  canPublish: boolean;
  issues: {
    critical: ValidationIssue[];
    warnings: ValidationIssue[];
    suggestions: ValidationIssue[];
  };
}

export type PageType = "article" | "client" | "category" | "user";

export interface ValidationOptions {
  baseUrl?: string;
  includeMetadata?: boolean;
  requirePublisherLogo?: boolean;
  requireHeroImage?: boolean;
  requireAuthorBio?: boolean;
  minHeadlineLength?: number;
  maxHeadlineLength?: number;
}
