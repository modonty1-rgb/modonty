/**
 * Client Field Mapping - Single Source of Truth
 * 
 * This file documents how each client database field maps to MetaTags and JSON-LD properties.
 * Based on actual generation logic in:
 * - generate-client-seo.ts (MetaTags generation)
 * - generate-complete-organization-jsonld.ts (JSON-LD generation)
 * 
 * This serves as the authoritative reference for field mappings, transformations, and SEO best practices.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface FieldMetaTagsMapping {
  /** Which MetaTags property this field maps to */
  metaTagsProperty?: string;
  /** Full path in metaTags object (e.g., 'openGraph.images[0].url') */
  metaTagsPath?: string;
  /** Transformation applied (e.g., 'truncate:60', 'date:ISO') */
  transformation?: string;
  /** Whether field is required for MetaTags */
  required?: boolean;
}

export interface FieldJsonLdMapping {
  /** Which JSON-LD node this field maps to (e.g., '@graph[0]', 'organizationNode') */
  jsonLdNode?: string;
  /** Which JSON-LD property this field maps to */
  jsonLdProperty?: string;
  /** Full path in JSON-LD structure (e.g., '@graph[0].logo.url') */
  jsonLdPath?: string;
  /** Transformation applied (e.g., 'date:YYYY-MM-DD', 'url:absolute') */
  transformation?: string;
  /** Schema.org type (e.g., 'ImageObject', 'ContactPoint', 'PostalAddress') */
  schemaType?: string;
  /** Whether field is required for JSON-LD */
  required?: boolean;
}

export interface FieldMapping {
  /** Database field name */
  field: string;
  /** Field category/group */
  category: string;
  /** Field description */
  description: string;
  /** MetaTags mapping */
  metaTags?: FieldMetaTagsMapping;
  /** JSON-LD mapping */
  jsonLd?: FieldJsonLdMapping;
  /** Recommended length for SEO (in characters) or dimensions for media (in pixels) */
  recommendedLength?:
  | { min?: number; max?: number; optimal?: number } // For text fields
  | { width?: number; height?: number; optimal?: { width?: number; height?: number } }; // For media fields
  /** SEO score configuration - defines how this field contributes to SEO score */
  score?: {
    /** Score when field is optimal/good (e.g., meets all requirements) */
    optimal?: number;
    /** Score when field is adequate/warning (e.g., partially filled) */
    adequate?: number;
    /** Score when field is missing or invalid */
    missing?: number;
    /** Whether this field is required (affects missing score) */
    required?: boolean;
  };
  /** Marketing/SEO benefits */
  marketingBenefits?: string[];
  /** Example value */
  example?: string;
}

// ============================================================================
// FIELD MAPPINGS
// ============================================================================

export const CLIENT_FIELD_MAPPINGS: FieldMapping[] = [
  // ============================================================================
  // BASIC INFORMATION FIELDS
  // ============================================================================
  {
    field: 'name',
    category: 'Basic Information',
    description: 'Primary organization name (display name)',
    metaTags: {
      metaTagsProperty: 'title',
      metaTagsPath: 'title',
      transformation: 'fallback:name (if seoTitle not set)',
    },
    jsonLd: {
      jsonLdNode: '@graph[0]',
      jsonLdProperty: 'name',
      jsonLdPath: '@graph[0].name',
      required: true,
    },
    recommendedLength: { optimal: 50, max: 100 },
    score: {
      optimal: 10,
      adequate: 8,
      missing: 0,
      required: true,
    },
    marketingBenefits: [
      'Primary identifier in search results',
      'Used as fallback when seoTitle is not set',
      'Essential for Organization schema.org structured data',
    ],
    example: 'مودونتي للتسويق الرقمي',
  },
  {
    field: 'slug',
    category: 'Basic Information',
    description: 'URL-friendly identifier for the organization',
    metaTags: {
      metaTagsPath: 'openGraph.url',
      transformation: 'url:${siteUrl}/clients/${slug}',
    },
    jsonLd: {
      jsonLdPath: '@graph[0].@id',
      transformation: 'url:${siteUrl}/clients/${slug}#organization',
    },
    marketingBenefits: [
      'Used to construct canonical URLs',
      'Creates stable, SEO-friendly URLs',
    ],
    example: 'modonty-digital-marketing',
  },
  {
    field: 'legalName',
    category: 'Basic Information',
    description: 'Legal registered name of the organization',
    jsonLd: {
      jsonLdNode: '@graph[0]',
      jsonLdProperty: 'legalName',
      jsonLdPath: '@graph[0].legalName',
    },
    recommendedLength: { max: 200 },
    marketingBenefits: [
      'Important for legal compliance in structured data',
      'Helps search engines identify official organization name',
      'Required for business verification in some regions',
    ],
    example: 'مودونتي للتسويق الرقمي المحدودة',
  },
  {
    field: 'alternateName',
    category: 'Basic Information',
    description: 'Alternative names, trade names, or DBA (Doing Business As)',
    jsonLd: {
      jsonLdNode: '@graph[0]',
      jsonLdProperty: 'alternateName',
      jsonLdPath: '@graph[0].alternateName',
    },
    recommendedLength: { max: 200 },
    marketingBenefits: [
      'Helps users find organization by alternative names',
      'Improves search visibility for trade names',
    ],
    example: 'Modonty',
  },
  {
    field: 'url',
    category: 'Basic Information',
    description: 'Organization website URL',
    jsonLd: {
      jsonLdNode: '@graph[0]',
      jsonLdProperty: 'url',
      jsonLdPath: '@graph[0].url',
      transformation: 'url:absolute:https',
    },
    score: {
      optimal: 10,
      adequate: 7,
      missing: 0,
      required: false,
    },
    marketingBenefits: [
      'Links organization to official website in structured data',
      'Important for brand verification',
    ],
    example: 'https://modonty.com',
  },

  // ============================================================================
  // SEO FIELDS
  // ============================================================================
  {
    field: 'seoTitle',
    category: 'SEO',
    description: 'SEO-optimized title for search engines',
    metaTags: {
      metaTagsProperty: 'title',
      metaTagsPath: 'title',
      transformation: 'truncate:60',
      required: true,
    },
    jsonLd: {
      jsonLdPath: '@graph[2].name',
      transformation: 'fallback:name (WebPage node)',
    },
    recommendedLength: { optimal: 50, max: 60 },
    score: {
      optimal: 20,
      adequate: 15,
      missing: 0,
      required: true,
    },
    marketingBenefits: [
      'Primary title in search engine results',
      'Truncated to 60 characters for optimal display',
      'Improves click-through rates from search results',
      'Critical for SEO performance',
    ],
    example: 'مودونتي للتسويق الرقمي - خدمات التسويق الاحترافية',
  },
  {
    field: 'seoDescription',
    category: 'SEO',
    description: 'SEO meta description for search engine snippets',
    metaTags: {
      metaTagsProperty: 'description',
      metaTagsPath: 'description',
      transformation: 'truncate:160',
    },
    jsonLd: {
      jsonLdPath: '@graph[0].description',
      transformation: 'fallback:description (if description not set)',
    },
    recommendedLength: { optimal: 150, max: 160 },
    score: {
      optimal: 18,
      adequate: 12,
      missing: 0,
      required: false,
    },
    marketingBenefits: [
      'Appears in search engine result snippets',
      'Influences click-through rates',
      'Truncated to 160 characters for optimal display',
      'Fallback for Organization description in JSON-LD',
    ],
    example: 'مودونتي للتسويق الرقمي تقدم خدمات التسويق الرقمي المتكاملة...',
  },
  {
    field: 'description',
    category: 'SEO',
    // Keep this label in sync with the UI field label to avoid confusion
    description: 'Organization Description',
    metaTags: {
      metaTagsPath: 'description',
      transformation: 'fallback:seoDescription (if seoDescription not set)',
    },
    jsonLd: {
      jsonLdNode: '@graph[0]',
      jsonLdProperty: 'description',
      jsonLdPath: '@graph[0].description',
      transformation: 'fallback:seoDescription',
    },
    recommendedLength: { min: 100, optimal: 300, max: 500 },
    score: {
      optimal: 8,
      adequate: 6,
      missing: 0,
      required: false,
    },
    marketingBenefits: [
      'Used in Organization schema.org structured data',
      'Provides rich context for search engines',
      'Fallback for seoDescription in MetaTags',
      'Important for knowledge graph understanding',
    ],
    example: 'مودونتي للتسويق الرقمي هي شركة رائدة في مجال التسويق الرقمي...',
  },
  {
    field: 'canonicalUrl',
    category: 'SEO',
    description: 'Canonical URL for the organization page',
    metaTags: {
      metaTagsProperty: 'canonical',
      metaTagsPath: 'canonical',
      transformation: 'url:absolute:https',
    },
    jsonLd: {
      jsonLdPath: '@graph[2].url',
      transformation: 'url:absolute (WebPage node)',
    },
    score: {
      optimal: 12,
      adequate: 6,
      missing: 0,
      required: false,
    },
    marketingBenefits: [
      'Prevents duplicate content issues',
      'Tells search engines the preferred URL',
      'Critical for SEO and avoiding penalties',
    ],
    example: 'https://modonty.com/clients/modonty-digital-marketing',
  },
  {
    field: 'metaRobots',
    category: 'SEO',
    description: 'Meta robots directive for search engine crawlers',
    metaTags: {
      metaTagsProperty: 'robots',
      metaTagsPath: 'robots',
      transformation: 'default:"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"',
    },
    marketingBenefits: [
      'Controls how search engines crawl and index the page',
      'Prevents indexing if set to "noindex"',
      'Affects how rich results are displayed',
    ],
    example: 'index, follow',
  },

  // ============================================================================
  // MEDIA FIELDS
  // ============================================================================
  {
    field: 'logoMedia',
    category: 'Media',
    description: 'Organization logo image',
    jsonLd: {
      jsonLdNode: '@graph[0]',
      jsonLdProperty: 'logo',
      jsonLdPath: '@graph[0].logo',
      schemaType: 'ImageObject',
      transformation: 'url:absolute:https, dimensions:min-112x112',
      required: true,
    },
    recommendedLength: { width: 112, height: 112, optimal: { width: 200, height: 200 } },
    score: {
      optimal: 13,
      adequate: 10,
      missing: 0,
      required: true,
    },
    marketingBenefits: [
      'Required for Article rich results in Google',
      'Appears in knowledge graph panels',
      'Minimum 112x112 pixels per Google guidelines',
      'Important for brand recognition in search results',
    ],
    example: '{ url: "https://...", width: 200, height: 200, altText: "Modonty Logo" }',
  },
  {
    field: 'ogImageMedia',
    category: 'Media',
    description: 'Open Graph image for social media sharing',
    metaTags: {
      metaTagsPath: 'openGraph.images[0]',
      transformation: 'url:absolute:https, dimensions:min-1200x630',
    },
    jsonLd: {
      jsonLdPath: '@graph[2].primaryImageOfPage',
      schemaType: 'ImageObject',
      transformation: 'url:absolute:https, dimensions:min-1200x630',
    },
    recommendedLength: { width: 1200, height: 630 },
    score: {
      optimal: 6,
      adequate: 3,
      missing: 0,
      required: false,
    },
    marketingBenefits: [
      'Image shown when sharing on Facebook, LinkedIn, etc.',
      'Optimal size: 1200x630 pixels',
      'Improves social media engagement',
      'Appears in WebPage primaryImageOfPage in JSON-LD',
    ],
    example: '{ url: "https://...", width: 1200, height: 630, altText: "..." }',
  },
  {
    field: 'twitterImageMedia',
    category: 'Media',
    description: 'Twitter Card image for Twitter sharing',
    metaTags: {
      metaTagsPath: 'twitter.image',
      transformation: 'url:absolute:https, dimensions:min-1200x675 (if summary_large_image)',
    },
    recommendedLength: { width: 1200, height: 675 },
    marketingBenefits: [
      'Image shown in Twitter Card previews',
      'Optimal size: 1200x675 pixels for large image cards',
      'Improves Twitter engagement and click-through',
    ],
    example: '{ url: "https://...", width: 1200, height: 675, altText: "..." }',
  },

  // ============================================================================
  // SOCIAL & CONTACT FIELDS
  // ============================================================================
  {
    field: 'sameAs',
    category: 'Social & Contact',
    description: 'Array of social media profile URLs (LinkedIn, Twitter, Facebook, etc.)',
    jsonLd: {
      jsonLdNode: '@graph[0]',
      jsonLdProperty: 'sameAs',
      jsonLdPath: '@graph[0].sameAs',
      transformation: 'url:validate:absolute:https',
    },
    score: {
      optimal: 8,
      adequate: 4,
      missing: 0,
      required: false,
    },
    marketingBenefits: [
      'Links organization to official social media profiles',
      'Helps with brand verification',
      'Improves trust signals for search engines',
      'Validated and normalized to HTTPS absolute URLs',
    ],
    example: '["https://linkedin.com/company/modonty", "https://twitter.com/modonty"]',
  },
  {
    field: 'email',
    category: 'Social & Contact',
    description: 'Organization contact email',
    jsonLd: {
      jsonLdPath: '@graph[0].contactPoint[].email',
      schemaType: 'ContactPoint',
      transformation: 'array:ContactPoint',
    },
    score: {
      optimal: 4,
      adequate: 2,
      missing: 0,
      required: false,
    },
    marketingBenefits: [
      'Included in ContactPoint structured data',
      'Helps search engines understand contact information',
      'Can enable rich results with contact information',
    ],
    example: 'info@modonty.com',
  },
  {
    field: 'phone',
    category: 'Social & Contact',
    description: 'Organization contact phone number',
    jsonLd: {
      jsonLdPath: '@graph[0].contactPoint[].telephone',
      schemaType: 'ContactPoint',
      transformation: 'array:ContactPoint',
    },
    score: {
      optimal: 4,
      adequate: 2,
      missing: 0,
      required: false,
    },
    marketingBenefits: [
      'Included in ContactPoint structured data',
      'Enables click-to-call in search results',
      'Important for local SEO',
    ],
    example: '+966501234567',
  },
  {
    field: 'contactType',
    category: 'Social & Contact',
    description: 'Type of contact point (customer service, technical support, sales, etc.)',
    jsonLd: {
      jsonLdPath: '@graph[0].contactPoint[].contactType',
      schemaType: 'ContactPoint',
      transformation: 'default:"customer service" (if email and phone both present)',
    },
    marketingBenefits: [
      'Clarifies purpose of contact information',
      'Helps search engines understand contact context',
    ],
    example: 'customer service',
  },

  // ============================================================================
  // ADDRESS FIELDS
  // ============================================================================
  {
    field: 'addressStreet',
    category: 'Address',
    description: 'Street address',
    jsonLd: {
      jsonLdPath: '@graph[0].address.streetAddress',
      schemaType: 'PostalAddress',
      transformation: 'combine:addressBuildingNumber (if present)',
    },
    score: {
      optimal: 6,
      adequate: 4,
      missing: 0,
      required: false,
    },
    marketingBenefits: [
      'Essential for local SEO',
      'Enables Google Maps integration',
      'Required for LocalBusiness schema types',
      'Combined with building number for National Address format',
    ],
    example: 'King Fahd Road, Building 123',
  },
  {
    field: 'addressBuildingNumber',
    category: 'Address',
    description: 'Building number (National Address format)',
    jsonLd: {
      jsonLdPath: '@graph[0].address.streetAddress',
      transformation: 'combine:addressStreet (prepended as "Building {number}")',
    },
    marketingBenefits: [
      'Important for Saudi Arabia National Address format',
      'Improves address accuracy for local SEO',
      'Combined with street address in structured data',
    ],
    example: '123',
  },
  {
    field: 'addressAdditionalNumber',
    category: 'Address',
    description: 'Additional building number (National Address format)',
    jsonLd: {
      jsonLdPath: '@graph[0].address.streetAddress',
      transformation: 'combine:addressStreet (appended as ", Additional {number}")',
    },
    marketingBenefits: [
      'Provides complete address information for Saudi Arabia format',
      'Improves address accuracy',
    ],
    example: '456',
  },
  {
    field: 'addressNeighborhood',
    category: 'Address',
    description: 'Neighborhood/district name',
    jsonLd: {
      jsonLdPath: '@graph[0].address.addressNeighborhood',
      schemaType: 'PostalAddress',
    },
    marketingBenefits: [
      'Provides detailed location information',
      'Important for local SEO and Google Maps',
    ],
    example: 'المنطقة الشرقية',
  },
  {
    field: 'addressCity',
    category: 'Address',
    description: 'City name',
    jsonLd: {
      jsonLdPath: '@graph[0].address.addressLocality',
      schemaType: 'PostalAddress',
    },
    marketingBenefits: [
      'Essential for local SEO',
      'Enables location-based search results',
    ],
    example: 'الرياض',
  },
  {
    field: 'addressRegion',
    category: 'Address',
    description: 'Province/region name (Saudi Arabia has 13 regions)',
    jsonLd: {
      jsonLdPath: '@graph[0].address.addressRegion',
      schemaType: 'PostalAddress',
    },
    marketingBenefits: [
      'Important for regional SEO',
      'Helps with location targeting',
    ],
    example: 'منطقة الرياض',
  },
  {
    field: 'addressCountry',
    category: 'Address',
    description: 'Country name',
    jsonLd: {
      jsonLdPath: '@graph[0].address.addressCountry',
      schemaType: 'PostalAddress',
      transformation: 'code:ISO3166-1-alpha-2 (e.g., "SA", "AE")',
    },
    marketingBenefits: [
      'Essential for international SEO',
      'Used to determine country code for ISO6523Code',
      'Default: "SA" (Saudi Arabia)',
    ],
    example: 'Saudi Arabia',
  },
  {
    field: 'addressPostalCode',
    category: 'Address',
    description: 'Postal/ZIP code',
    jsonLd: {
      jsonLdPath: '@graph[0].address.postalCode',
      schemaType: 'PostalAddress',
    },
    marketingBenefits: [
      'Improves address accuracy',
      'Important for local SEO',
    ],
    example: '11564',
  },

  // ============================================================================
  // BUSINESS IDENTIFIERS
  // ============================================================================
  {
    field: 'commercialRegistrationNumber',
    category: 'Business Identifiers',
    description: 'Commercial Registration Number (CR Number) - CRITICAL for Saudi Arabia',
    jsonLd: {
      jsonLdPath: '@graph[0].identifier[]',
      schemaType: 'PropertyValue',
      transformation: 'array:PropertyValue, iso6523code:"0199:{countryCode}{CR}"',
    },
    recommendedLength: { max: 50 },
    marketingBenefits: [
      'CRITICAL: Required for business verification in Saudi Arabia',
      'Enables business knowledge graph entries',
      'Automatically generates ISO6523Code format: "0199:SA{CR}"',
      'Stored as PropertyValue in identifier array',
      'Improves trust and authority signals',
    ],
    example: '1010123456',
  },
  {
    field: 'vatID',
    category: 'Business Identifiers',
    description: 'VAT registration number (ZATCA - Zakat, Tax and Customs Authority)',
    jsonLd: {
      jsonLdPath: '@graph[0].vatID',
    },
    recommendedLength: { max: 50 },
    marketingBenefits: [
      'Important for tax compliance in structured data',
      'Helps with business verification',
    ],
    example: '300012345600003',
  },
  {
    field: 'taxID',
    category: 'Business Identifiers',
    description: 'Tax identification number (ZATCA/Zakat)',
    jsonLd: {
      jsonLdPath: '@graph[0].taxID',
    },
    recommendedLength: { max: 50 },
    marketingBenefits: [
      'Important for tax compliance in structured data',
      'Helps with business verification',
    ],
    example: '1234567890',
  },

  // ============================================================================
  // CLASSIFICATION FIELDS
  // ============================================================================
  {
    field: 'organizationType',
    category: 'Classification',
    description: 'Schema.org organization type (Organization, Corporation, LocalBusiness, NonProfit, etc.)',
    jsonLd: {
      jsonLdPath: '@graph[0].@type',
      transformation: 'default:"Organization"',
      required: true,
    },
    marketingBenefits: [
      'Determines JSON-LD schema type',
      'Affects which properties are available',
      'Important for correct structured data interpretation',
    ],
    example: 'Organization',
  },
  {
    field: 'keywords',
    category: 'Classification',
    description: 'Array of keywords for organization classification',
    jsonLd: {
      jsonLdPath: '@graph[0].keywords',
      transformation: 'array:fallback:contentPriorities',
    },
    marketingBenefits: [
      'Helps search engines understand organization focus',
      'Used for classification and categorization',
      'Fallback to contentPriorities if not set',
    ],
    example: '["تسويق رقمي", "SEO", "إعلانات"]',
  },
  {
    field: 'knowsLanguage',
    category: 'Classification',
    description: 'Array of languages the organization supports',
    jsonLd: {
      jsonLdPath: '@graph[0].knowsLanguage',
      transformation: 'array:code:ISO639-1',
    },
    metaTags: {
      metaTagsPath: 'openGraph.locale',
      transformation: 'locale:map (e.g., "Arabic" → "ar_SA")',
    },
    marketingBenefits: [
      'Important for multilingual SEO',
      'Maps to ISO 639-1 language codes',
      'Used in ContactPoint availableLanguage',
      'Affects Open Graph locale metadata',
    ],
    example: '["Arabic", "English"]',
  },
  {
    field: 'isicV4',
    category: 'Classification',
    description: 'International Standard Industrial Classification (V4) code',
    jsonLd: {
      jsonLdPath: '@graph[0].isicV4',
    },
    marketingBenefits: [
      'Standard industry classification code',
      'Helps search engines understand industry',
    ],
    example: '7310',
  },

  // ============================================================================
  // ORGANIZATION RELATIONSHIPS
  // ============================================================================
  {
    field: 'parentOrganization',
    category: 'Organization Relationships',
    description: 'Parent company relationship',
    jsonLd: {
      jsonLdPath: '@graph[0].parentOrganization',
      schemaType: 'Organization',
      transformation: 'object:Organization (name, id, url)',
    },
    marketingBenefits: [
      'Documents organizational hierarchy',
      'Important for corporate structure understanding',
      'Helps with brand relationships in knowledge graph',
    ],
    example: '{ name: "Parent Company", id: "...", url: "..." }',
  },

  // ============================================================================
  // ADDITIONAL FIELDS
  // ============================================================================
  {
    field: 'foundingDate',
    category: 'Additional',
    description: 'Organization founding date',
    jsonLd: {
      jsonLdPath: '@graph[0].foundingDate',
      transformation: 'date:YYYY-MM-DD (ISO format, date only)',
    },
    score: {
      optimal: 3,
      adequate: 2,
      missing: 0,
      required: false,
    },
    marketingBenefits: [
      'Important for organization history in structured data',
      'Helps establish organization age/authority',
      'Formatted as YYYY-MM-DD (date only, no time)',
    ],
    example: '2020-01-15',
  },
  {
    field: 'slogan',
    category: 'Additional',
    description: 'Organization slogan or tagline',
    jsonLd: {
      jsonLdPath: '@graph[0].slogan',
    },
    recommendedLength: { max: 100 },
    marketingBenefits: [
      'Helps with brand messaging in structured data',
      'Can appear in knowledge graph panels',
    ],
    example: 'نحو مستقبل رقمي أفضل',
  },
  {
    field: 'contentPriorities',
    category: 'Additional',
    description: 'Array of content topics/priorities for content writers',
    jsonLd: {
      jsonLdPath: '@graph[0].keywords | @graph[0].knowsAbout',
      transformation: 'fallback:keywords (if keywords not set), combine:industry.name + keywords + contentPriorities (for knowsAbout)',
    },
    marketingBenefits: [
      'Used as fallback for keywords in JSON-LD if keywords field not set',
      'Combined with industry.name and keywords for knowsAbout property',
      'Helps define organization expertise areas in knowledge graph',
    ],
    example: '["تسويق محتوى", "SEO", "إعلانات جوجل"]',
  },
  {
    field: 'numberOfEmployees',
    category: 'Additional',
    description: 'Number of employees (as string, supports range format)',
    jsonLd: {
      jsonLdPath: '@graph[0].numberOfEmployees',
      schemaType: 'QuantitativeValue',
      transformation: 'parse:range (e.g., "10-50" → {minValue:10, maxValue:50}) or value',
    },
    marketingBenefits: [
      'Provides organization size information',
      'Stored as QuantitativeValue schema type',
      'Supports range format (e.g., "10-50") or single value',
    ],
    example: '10-50',
  },

  // ============================================================================
  // TWITTER CARDS FIELDS
  // ============================================================================
  {
    field: 'twitterCard',
    category: 'Twitter Cards',
    description: 'Twitter Card type (summary_large_image, summary)',
    metaTags: {
      metaTagsPath: 'twitter.card',
      transformation: 'default:"summary_large_image" (if twitterImageMedia present) or "summary"',
    },
    score: {
      optimal: 3,
      adequate: 1,
      missing: 0,
      required: false,
    },
    marketingBenefits: [
      'Controls Twitter Card appearance',
      'summary_large_image requires 1200x675 image',
      'summary is default if no image',
    ],
    example: 'summary_large_image',
  },
  {
    field: 'twitterTitle',
    category: 'Twitter Cards',
    description: 'Custom Twitter Card title',
    metaTags: {
      metaTagsPath: 'twitter.title',
      transformation: 'fallback:seoTitle or title',
    },
    recommendedLength: { max: 70 },
    marketingBenefits: [
      'Custom title for Twitter Card previews',
      'Falls back to seoTitle if not set',
    ],
    example: 'مودونتي - خدمات التسويق الرقمي',
  },
  {
    field: 'twitterDescription',
    category: 'Twitter Cards',
    description: 'Custom Twitter Card description',
    metaTags: {
      metaTagsPath: 'twitter.description',
      transformation: 'fallback:seoDescription or description',
    },
    recommendedLength: { max: 200 },
    marketingBenefits: [
      'Custom description for Twitter Card previews',
      'Falls back to seoDescription if not set',
    ],
    example: 'نقدم خدمات التسويق الرقمي المتكاملة...',
  },
  {
    field: 'twitterSite',
    category: 'Twitter Cards',
    description: 'Twitter username/handle (e.g., @username)',
    metaTags: {
      metaTagsPath: 'twitter.site',
    },
    marketingBenefits: [
      'Links organization to Twitter account',
      'Appears in Twitter Card metadata',
    ],
    example: '@modonty',
  },

  // ============================================================================
  // GTM INTEGRATION
  // ============================================================================
  {
    field: 'gtmId',
    category: 'Integration',
    description: 'Google Tag Manager container ID',
    marketingBenefits: [
      'Enables Google Tag Manager integration',
      'Used for analytics and tracking',
      'Not included in MetaTags or JSON-LD',
    ],
    example: 'GTM-XXXXXXX',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get MetaTags mapping for a specific field
 */
export function getFieldMetaTagsMapping(fieldName: string): FieldMetaTagsMapping | undefined {
  const mapping = CLIENT_FIELD_MAPPINGS.find((m) => m.field === fieldName);
  return mapping?.metaTags;
}

/**
 * Get JSON-LD mapping for a specific field
 */
export function getFieldJsonLdMapping(fieldName: string): FieldJsonLdMapping | undefined {
  const mapping = CLIENT_FIELD_MAPPINGS.find((m) => m.field === fieldName);
  return mapping?.jsonLd;
}

/**
 * Get all mappings for a specific field
 */
export function getFieldMapping(fieldName: string): FieldMapping | undefined {
  return CLIENT_FIELD_MAPPINGS.find((m) => m.field === fieldName);
}

/**
 * Get all fields in a specific category
 */
export function getFieldsByCategory(category: string): FieldMapping[] {
  return CLIENT_FIELD_MAPPINGS.filter((m) => m.category === category);
}

/**
 * Get all fields that map to MetaTags
 */
export function getMetaTagsFields(): FieldMapping[] {
  return CLIENT_FIELD_MAPPINGS.filter((m) => m.metaTags !== undefined);
}

/**
 * Get all fields that map to JSON-LD
 */
export function getJsonLdFields(): FieldMapping[] {
  return CLIENT_FIELD_MAPPINGS.filter((m) => m.jsonLd !== undefined);
}

/**
 * Get recommended length for a field (text fields) or dimensions (media fields)
 */
export function getFieldRecommendedLength(fieldName: string):
  | { min?: number; max?: number; optimal?: number }
  | { width?: number; height?: number; optimal?: { width?: number; height?: number } }
  | undefined {
  const mapping = getFieldMapping(fieldName);
  return mapping?.recommendedLength;
}

// ============================================================================
// CATEGORIES
// ============================================================================

export const FIELD_CATEGORIES = [
  'Basic Information',
  'SEO',
  'Media',
  'Social & Contact',
  'Address',
  'Business Identifiers',
  'Classification',
  'Organization Relationships',
  'Additional',
  'Twitter Cards',
  'Integration',
] as const;

export type FieldCategory = typeof FIELD_CATEGORIES[number];
