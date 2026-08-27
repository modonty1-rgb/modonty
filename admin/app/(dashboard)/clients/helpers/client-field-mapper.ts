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
    heroImageMediaId: data.heroImageMediaId || null,

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
    salesRepId: data.salesRepId || null,
    editorId: data.editorId || null,
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
    // taxID is NEVER copied from vatID. schema.org keeps them apart: taxID is "The Tax /
    // Fiscal ID of the organization or person, e.g. the TIN in the US or the CIF/NIF in
    // Spain", vatID is "The value-added Tax ID … with national prefix". Copying one into
    // the other published a fiscal number the partner never gave us.
    taxID: data.taxID || null,
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

    // Additional Properties
    alternateName: data.alternateName || null,
    slogan: data.slogan || null,
    keywords: data.keywords || [],
    knowsLanguage: data.knowsLanguage || [],
    organizationType: data.organizationType || null,

    // Relationships
    parentOrganizationId: data.parentOrganizationId || null,

    // YMYL verification (admin-controlled classification)
    isYmyl: data.isYmyl ?? false,
    ymylCategory: data.ymylCategory ?? null,
    ymylData: data.ymylData ?? null,

    // Primary CTA («احجز الآن») — admin-controlled
    ctaMode: data.ctaMode ?? "NONE",
    ctaPresetId: data.ctaPresetId || null,
    ctaLabel: data.ctaLabel || null,
    ctaUrl: data.ctaUrl || null,

    // (Twitter card/site/title/description are NOT Client columns — they live in
    // nextjsMetadata, generated from Settings + the client's hero image. No mapping.)

    // Google Business Profile + Local SEO (feed the JSON-LD generator:
    // gbpPlaceId → Maps Place-ID link, priceRange, opening hours)
    gbpProfileUrl: data.gbpProfileUrl || null,
    gbpPlaceId: data.gbpPlaceId || null,
    gbpAccountId: data.gbpAccountId || null,
    gbpLocationId: data.gbpLocationId || null,
    gbpCategory: data.gbpCategory || null,
    priceRange: data.priceRange || null,
    openingHoursSpecification: data.openingHoursSpecification || null,

    // Subscription Management
    subscriptionTier: data.subscriptionTier || null,
    subscriptionTierConfigId: data.subscriptionTierConfigId || null,
    subscriptionStartDate: data.subscriptionStartDate || null,
    subscriptionEndDate: data.subscriptionEndDate || null,
    articlesPerMonth: data.articlesPerMonth || null,
    subscriptionStatus: data.subscriptionStatus || "PENDING",
    paymentStatus: data.paymentStatus || "PENDING",

    // Featured/premium partner spotlight (admin toggle)
    isFeatured: data.isFeatured ?? false,
    showSchedule: data.showSchedule ?? true,
    // Platform/demo account — excluded from billing (admin toggle)
    isInternal: data.isInternal ?? false,
    billingCycle: data.billingCycle ?? "annual",

    // Client-site publishing. The key fields are absent on purpose — the server owns them.
    canPublishToOwnSite: data.canPublishToOwnSite ?? false,
    articlesBaseUrl: data.articlesBaseUrl || null,
    apiKeySuspended: data.apiKeySuspended ?? false,
  };
}
