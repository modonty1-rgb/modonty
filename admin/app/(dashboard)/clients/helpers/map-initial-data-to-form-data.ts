import type { ClientFormData } from "@/lib/types";
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
    gtmId: "",
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
    licenseNumber: "",
    licenseAuthority: "",
    alternateName: "",
    slogan: "",
    canonicalUrl: "",
    twitterTitle: "",
    twitterDescription: "",
    twitterSite: "",
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
    ogImageMediaId: initialData.ogImageMediaId || null,
    twitterImageMediaId: initialData.twitterImageMediaId || null,

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
    metaRobots: initialData.metaRobots || null,
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
    taxID: initialData.vatID || initialData.taxID || null, // Use VAT ID as Tax ID if Tax ID is not provided
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
    licenseNumber: initialData.licenseNumber || null,
    licenseAuthority: initialData.licenseAuthority || null,

    // Additional Properties
    alternateName: initialData.alternateName || null,
    slogan: initialData.slogan || null,
    keywords: initialData.keywords || [],
    knowsLanguage: initialData.knowsLanguage || [],
    organizationType: initialData.organizationType || null,

    // Relationships
    parentOrganizationId: initialData.parentOrganizationId || null,

    // Twitter Cards
    twitterCard: initialData.twitterCard || null,
    twitterTitle: initialData.twitterTitle || null,
    twitterDescription: initialData.twitterDescription || null,
    twitterSite: initialData.twitterSite || null,

    // GTM Integration
    gtmId: initialData.gtmId || "",

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
