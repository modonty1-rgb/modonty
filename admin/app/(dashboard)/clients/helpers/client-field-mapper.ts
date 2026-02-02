import type { ClientFormData } from "@/lib/types";
import { validateAndNormalizeUrls } from "../actions/clients-actions/validate-and-normalize-urls";

/**
 * Maps ClientFormData to Prisma Client data object
 * This is the single source of truth for field mapping between form and database
 */
export function mapFormDataToClientData(data: ClientFormData) {
  const validatedSameAs = validateAndNormalizeUrls(data.sameAs || []);

  return {
    // Basic fields
    name: data.name,
    slug: data.slug,
    legalName: data.legalName ?? null,
    url: data.url || null,

    // Media
    logoMediaId: data.logoMediaId || null,
    ogImageMediaId: data.ogImageMediaId || null,
    twitterImageMediaId: data.twitterImageMediaId || null,

    // Social profiles
    sameAs: validatedSameAs,

    // Contact
    email: data.email,
    phone: data.phone || null,
    contactType: data.contactType || null,

    // Security
    // Note: Password will be hashed in the action before saving
    password: data.password || null,

    // SEO
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
    description: data.description || null,
    metaRobots: data.metaRobots || null,
    canonicalUrl: data.canonicalUrl || null,

    // Business Information
    businessBrief: data.businessBrief || null,
    industryId: data.industryId || null,
    targetAudience: data.targetAudience || null,
    contentPriorities: data.contentPriorities || [],
    foundingDate: data.foundingDate || null,

    // Address (for Local SEO)
    addressStreet: data.addressStreet || null,
    addressCity: data.addressCity || null,
    addressCountry: data.addressCountry || null,
    addressPostalCode: data.addressPostalCode || null,

    // Saudi Arabia & Gulf Identifiers
    commercialRegistrationNumber: data.commercialRegistrationNumber || null,
    vatID: data.vatID || null,
    taxID: data.vatID || data.taxID || null, // Use VAT ID as Tax ID if Tax ID is not provided
    legalForm: data.legalForm || null,

    // Address Enhancement (National Address Format)
    addressRegion: data.addressRegion || null,
    addressNeighborhood: data.addressNeighborhood || null,
    addressBuildingNumber: data.addressBuildingNumber || null,
    addressAdditionalNumber: data.addressAdditionalNumber || null,
    addressLatitude: data.addressLatitude || null,
    addressLongitude: data.addressLongitude || null,

    // Classification & Business Info
    businessActivityCode: data.businessActivityCode || null,
    isicV4: data.isicV4 || null,
    numberOfEmployees: data.numberOfEmployees || null,
    licenseNumber: data.licenseNumber || null,
    licenseAuthority: data.licenseAuthority || null,

    // Additional Properties
    alternateName: data.alternateName || null,
    slogan: data.slogan || null,
    keywords: data.keywords || [],
    knowsLanguage: data.knowsLanguage || [],
    organizationType: data.organizationType || null,

    // Relationships
    parentOrganizationId: data.parentOrganizationId || null,

    // Twitter Cards
    twitterCard: data.twitterCard || null,
    twitterTitle: data.twitterTitle || null,
    twitterDescription: data.twitterDescription || null,
    twitterSite: data.twitterSite || null,

    // GTM Integration
    gtmId: data.gtmId || null,

    // Subscription Management
    subscriptionTier: data.subscriptionTier || null,
    subscriptionTierConfigId: data.subscriptionTierConfigId || null,
    subscriptionStartDate: data.subscriptionStartDate || null,
    subscriptionEndDate: data.subscriptionEndDate || null,
    articlesPerMonth: data.articlesPerMonth || null,
    subscriptionStatus: data.subscriptionStatus || "PENDING",
    paymentStatus: data.paymentStatus || "PENDING",
  };
}
