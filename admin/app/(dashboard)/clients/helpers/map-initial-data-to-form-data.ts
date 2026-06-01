import type { ClientFormData, MediaPreview } from "@/lib/types";
import type { ClientWithRelations } from "@/lib/types";

/**
 * Maps ClientWithRelations (from database) to ClientFormData (for form)
 * This is used to initialize the form with existing client data
 */
export function mapInitialDataToFormData(
  initialData?: Partial<ClientWithRelations>
): Partial<ClientFormData> {
  // Always return default values to ensure controlled inputs
  // Required fields must always have values (not undefined)
  const defaults: Partial<ClientFormData> = {
    name: "",
    slug: "",
    legalName: "",
    url: "",
    email: "",
    phone: "",
    seoTitle: "",
    seoDescription: "",
    businessBrief: "",
    targetAudience: "",
    sameAs: [],
    contentPriorities: [],
    keywords: [],
    knowsLanguage: [],
    subscriptionStatus: "PENDING",
    paymentStatus: "PENDING",
    // Ensure all string fields have empty string defaults
    description: "",
    contactType: "",
    addressStreet: "",
    addressCity: "",
    addressCountry: "",
    addressPostalCode: "",
    commercialRegistrationNumber: "",
    vatID: "",
    taxID: "",
    addressRegion: "",
    addressNeighborhood: "",
    addressBuildingNumber: "",
    addressAdditionalNumber: "",
    addressLatitude: null,
    addressLongitude: null,
    businessActivityCode: "",
    isicV4: "",
    numberOfEmployees: "",
    alternateName: "",
    slogan: "",
    newsletterCtaText: "",
    canonicalUrl: "",
    // YMYL defaults
    isYmyl: false,
    ymylCategory: null,
    ymylData: null,
    // Google Business Profile + Local SEO
    gbpProfileUrl: "",
    gbpPlaceId: "",
    gbpAccountId: "",
    gbpLocationId: "",
    gbpCategory: "",
    priceRange: "",
  };

  if (!initialData) {
    return defaults;
  }

  return {
    ...defaults,
    // Basic fields
    name: initialData.name || "",
    slug: initialData.slug || "",
    legalName: initialData.legalName || "",
    url: initialData.url || "",

    // Media IDs
    logoMediaId: initialData.logoMediaId || null,
    heroImageMediaId: initialData.heroImageMediaId || null,
    // Media snapshots for the live SEO preview (so it shows the REAL logo/hero
    // instead of falsely reporting "Logo missing"). Hero doubles as the OG image.
    logoMedia: (initialData.logoMedia as MediaPreview | null | undefined) ?? null,
    heroImageMedia: (initialData.heroImageMedia as MediaPreview | null | undefined) ?? null,
    ogImageMedia: (initialData.heroImageMedia as MediaPreview | null | undefined) ?? null,

    // Social profiles
    sameAs: initialData.sameAs || [],

    // Contact
    email: initialData.email || "",
    phone: initialData.phone || "",
    contactType: initialData.contactType || null,

    // SEO
    seoTitle: initialData.seoTitle || "",
    seoDescription: initialData.seoDescription || "",
    description: initialData.description || null,
    canonicalUrl: initialData.canonicalUrl || "",

    // Business Information
    businessBrief: initialData.businessBrief || "",
    industryId: initialData.industryId || initialData.industry?.id || null,
    targetAudience: initialData.targetAudience || "",
    contentPriorities: initialData.contentPriorities || [],
    foundingDate: initialData.foundingDate || null,

    // Address (for Local SEO)
    addressStreet: initialData.addressStreet || null,
    addressCity: initialData.addressCity || null,
    addressCountry: initialData.addressCountry || null,
    addressPostalCode: initialData.addressPostalCode || null,

    // Saudi Arabia & Gulf Identifiers
    commercialRegistrationNumber: initialData.commercialRegistrationNumber || null,
    vatID: initialData.vatID || null,
    taxID: initialData.taxID || initialData.vatID || null, // Fallback to VAT ID only if Tax ID is not provided
    legalForm: initialData.legalForm || null,

    // Address Enhancement (National Address Format)
    addressRegion: initialData.addressRegion || null,
    addressNeighborhood: initialData.addressNeighborhood || null,
    addressBuildingNumber: initialData.addressBuildingNumber || null,
    addressAdditionalNumber: initialData.addressAdditionalNumber || null,
    addressLatitude: initialData.addressLatitude || null,
    addressLongitude: initialData.addressLongitude || null,

    // Classification & Business Info
    businessActivityCode: initialData.businessActivityCode || null,
    isicV4: initialData.isicV4 || null,
    numberOfEmployees: initialData.numberOfEmployees || null,

    // Additional Properties
    alternateName: initialData.alternateName || null,
    slogan: initialData.slogan || null,
    newsletterCtaText: initialData.newsletterCtaText || null,
    keywords: initialData.keywords || [],
    knowsLanguage: initialData.knowsLanguage || [],
    organizationType: initialData.organizationType || null,

    // Relationships
    parentOrganizationId: initialData.parentOrganizationId || null,

    // Google Business Profile + Local SEO
    gbpProfileUrl: (initialData as { gbpProfileUrl?: string | null }).gbpProfileUrl || "",
    gbpPlaceId: (initialData as { gbpPlaceId?: string | null }).gbpPlaceId || "",
    gbpAccountId: (initialData as { gbpAccountId?: string | null }).gbpAccountId || "",
    gbpLocationId: (initialData as { gbpLocationId?: string | null }).gbpLocationId || "",
    gbpCategory: (initialData as { gbpCategory?: string | null }).gbpCategory || "",
    priceRange: (initialData as { priceRange?: string | null }).priceRange || "",

    // YMYL verification
    isYmyl: (initialData as { isYmyl?: boolean }).isYmyl ?? false,
    ymylCategory: (initialData as { ymylCategory?: "medical" | "legal" | "financial" | null }).ymylCategory ?? null,
    ymylData: (initialData as { ymylData?: Record<string, unknown> | null }).ymylData ?? null,

    // Subscription Management
    subscriptionTier: initialData.subscriptionTier || null,
    subscriptionTierConfigId: (initialData as any).subscriptionTierConfigId || null,
    subscriptionStartDate: initialData.subscriptionStartDate || null,
    subscriptionEndDate: initialData.subscriptionEndDate || null,
    articlesPerMonth: initialData.articlesPerMonth ?? undefined,
    subscriptionStatus: initialData.subscriptionStatus || "PENDING",
    paymentStatus: initialData.paymentStatus || "PENDING",
  };
}
