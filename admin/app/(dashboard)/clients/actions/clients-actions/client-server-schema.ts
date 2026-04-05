import { z } from "zod";

/**
 * Server-side Zod validation for client mutations.
 * Validates required fields + sanitizes input before DB operations.
 * The full form schema (client-form-schema.ts) handles UI validation.
 */
export const clientServerSchema = z.object({
  // Required fields
  name: z.string().min(1, "اسم العميل مطلوب").max(200, "اسم العميل طويل جداً"),
  slug: z
    .string()
    .min(1, "الرابط المختصر مطلوب")
    .max(200, "الرابط المختصر طويل جداً")
    .regex(/^[a-z0-9-]+$/, "الرابط المختصر يجب أن يحتوي على حروف صغيرة وأرقام وشرطات فقط"),
  email: z.string().email("البريد الإلكتروني غير صالح"),

  // Optional string fields — passthrough with max length
  legalName: z.string().max(200).optional().nullable(),
  url: z.string().max(500).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  password: z.string().max(100).optional().nullable(),
  contactType: z.string().max(100).optional().nullable(),
  seoTitle: z.string().max(60).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  canonicalUrl: z.string().max(500).optional().nullable(),
  businessBrief: z.string().max(5000).optional().nullable(),
  targetAudience: z.string().max(1000).optional().nullable(),
  addressStreet: z.string().max(200).optional().nullable(),
  addressCity: z.string().max(100).optional().nullable(),
  addressCountry: z.string().max(100).optional().nullable(),
  addressPostalCode: z.string().max(20).optional().nullable(),
  addressRegion: z.string().max(100).optional().nullable(),
  addressNeighborhood: z.string().max(100).optional().nullable(),
  addressBuildingNumber: z.string().max(20).optional().nullable(),
  addressAdditionalNumber: z.string().max(20).optional().nullable(),
  commercialRegistrationNumber: z.string().max(50).optional().nullable(),
  vatID: z.string().max(50).optional().nullable(),
  taxID: z.string().max(50).optional().nullable(),
  legalForm: z.string().max(50).optional().nullable(),
  businessActivityCode: z.string().max(50).optional().nullable(),
  isicV4: z.string().max(20).optional().nullable(),
  numberOfEmployees: z.string().max(50).optional().nullable(),
  licenseNumber: z.string().max(100).optional().nullable(),
  licenseAuthority: z.string().max(200).optional().nullable(),
  alternateName: z.string().max(200).optional().nullable(),
  slogan: z.string().max(200).optional().nullable(),
  organizationType: z.string().max(50).optional().nullable(),
  gtmId: z.string().max(20).optional().nullable(),
  ga4PropertyId: z.string().max(50).optional().nullable(),
  ga4MeasurementId: z.string().max(50).optional().nullable(),
  gbpProfileUrl: z.string().max(500).optional().nullable(),
  gbpPlaceId: z.string().max(100).optional().nullable(),
  gbpAccountId: z.string().max(100).optional().nullable(),
  gbpLocationId: z.string().max(100).optional().nullable(),
  gbpCategory: z.string().max(100).optional().nullable(),
  priceRange: z.string().max(50).optional().nullable(),
  googleBusinessProfileUrl: z.string().max(500).optional().nullable(),

  // Optional number fields
  addressLatitude: z.number().min(-90).max(90).optional().nullable(),
  addressLongitude: z.number().min(-180).max(180).optional().nullable(),
  articlesPerMonth: z.number().int().min(0).max(100).optional().nullable(),

  // Optional boolean fields
  competitiveMentionsAllowed: z.boolean().optional().nullable(),

  // Optional array fields
  sameAs: z.array(z.string()).optional(),
  contentPriorities: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  knowsLanguage: z.array(z.string()).optional(),
  forbiddenKeywords: z.array(z.string()).optional(),
  forbiddenClaims: z.array(z.string()).optional(),

  // Optional relation IDs
  industryId: z.string().optional().nullable(),
  parentOrganizationId: z.string().optional().nullable(),
  subscriptionTierConfigId: z.string().optional().nullable(),
  logoMediaId: z.string().optional().nullable(),
  ogImageMediaId: z.string().optional().nullable(),
  twitterImageMediaId: z.string().optional().nullable(),

  // Enums — passthrough as strings, validated by Prisma
  subscriptionTier: z.string().optional().nullable(),
  subscriptionStatus: z.string().optional().nullable(),
  paymentStatus: z.string().optional().nullable(),
  metaRobots: z.string().optional().nullable(),
  twitterCard: z.string().optional().nullable(),

  // Dates — accept string or Date
  foundingDate: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  subscriptionStartDate: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  subscriptionEndDate: z.union([z.string(), z.date(), z.null()]).optional().nullable(),

  // JSON fields
  openingHoursSpecification: z.unknown().optional().nullable(),
}).passthrough(); // Allow extra fields from form that aren't listed here
