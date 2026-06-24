import { z } from "zod";

/**
 * Server-side Zod validation for client mutations.
 * Validates required fields + sanitizes input before DB operations.
 * The full form schema (client-form-schema.ts) handles UI validation.
 */

// Console-owned text fields: the CLIENT edits these from the console profile (no length cap
// there) and the admin form does NOT render them. The admin must impose NO length validation —
// otherwise a long console value blocks EVERY admin save on a field the admin can't see or fix.
const consoleOwnedText = z.string().optional().nullable();

export const clientServerSchema = z.object({
  // Required fields
  name: z.string().min(1, "Client name is required").max(200, "Client name is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200, "Slug is too long")
    .regex(
      /^[\u0600-\u06FFa-z0-9_-]+$/,
      "Slug must contain only Arabic letters, lowercase Latin letters, numbers, hyphens, or underscores"
    ),
  email: z.string().email("Invalid email address"),

  // Optional string fields. ADMIN-OWNED keep a max; CONSOLE-OWNED use consoleOwnedText (no cap).
  legalName: consoleOwnedText,
  url: z.string().max(500).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  password: z.string().max(100).optional().nullable(),
  contactType: z.string().max(100).optional().nullable(),
  seoTitle: z.string().max(51, "عنوان SEO يجب أن يكون 51 حرف أو أقل (العنوان النهائي في جوجل: 60 حرف)").optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  description: consoleOwnedText,
  canonicalUrl: z.string().max(500).optional().nullable(),
  businessBrief: consoleOwnedText,
  targetAudience: consoleOwnedText,
  addressStreet: consoleOwnedText,
  addressCity: consoleOwnedText,
  addressCountry: z.string().max(100).optional().nullable(),
  addressPostalCode: consoleOwnedText,
  addressRegion: consoleOwnedText,
  addressNeighborhood: consoleOwnedText,
  addressBuildingNumber: consoleOwnedText,
  addressAdditionalNumber: consoleOwnedText,
  commercialRegistrationNumber: consoleOwnedText,
  vatID: consoleOwnedText,
  taxID: consoleOwnedText,
  legalForm: z.string().max(50).optional().nullable(),
  businessActivityCode: z.string().max(50).optional().nullable(),
  isicV4: z.string().max(20).optional().nullable(),
  numberOfEmployees: consoleOwnedText,
  alternateName: consoleOwnedText,
  slogan: consoleOwnedText,
  organizationType: z.string().max(50).optional().nullable(),
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
  isFeatured: z.boolean().optional().nullable(), // featured/premium partner spotlight

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
  heroImageMediaId: z.string().optional().nullable(),

  // Enums — passthrough as strings, validated by Prisma
  subscriptionTier: z.string().optional().nullable(),
  subscriptionStatus: z.string().optional().nullable(),
  paymentStatus: z.string().optional().nullable(),
  metaRobots: z.string().optional().nullable(),

  // Dates — accept string or Date
  foundingDate: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  subscriptionStartDate: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  subscriptionEndDate: z.union([z.string(), z.date(), z.null()]).optional().nullable(),

  // JSON fields
  openingHoursSpecification: z.unknown().optional().nullable(),

  // YMYL verification
  isYmyl: z.boolean().optional(),
  ymylCategory: z.enum(["medical", "legal", "financial"]).optional().nullable(),
  ymylData: z.record(z.unknown()).optional().nullable(),

  // Primary CTA («احجز الآن») — admin-controlled
  ctaMode: z.enum(["NONE", "FORM", "LINK"]).optional().nullable(),
  ctaLabel: z.string().max(40).optional().nullable(),
  ctaUrl: z.string().max(500).optional().nullable(),
}).passthrough(); // Allow extra fields from form that aren't listed here
