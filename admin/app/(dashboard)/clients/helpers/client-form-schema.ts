import { z } from "zod";
import { SubscriptionTier, SubscriptionStatus, PaymentStatus, ClientCtaMode } from "@prisma/client";
import { LEGAL_FORM_VALUES, ORGANIZATION_TYPE_VALUES } from "@modonty/database/lib/constants/client-classification";

/**
 * Zod validation schema for Client form
 * Covers all 50+ schema fields with appropriate validation rules
 */

// URL validation helper
const urlSchema = z.string().url("Must be a valid URL").optional().nullable().or(z.literal(""));

// Email validation (required)
const emailSchema = z.string().email("Must be a valid email address").min(1, "Email is required");

// Date validation (accepts Date object, string, or null - coerces strings to Date)
// Handles empty strings by converting to null
const dateSchema = z.preprocess(
  (val) => {
    if (val === "" || val === null || val === undefined) return null;
    if (val instanceof Date) return val;
    if (typeof val === "string") {
      const date = new Date(val);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  },
  z.date().optional().nullable()
);

// Array of strings validation
const stringArraySchema = z.array(z.string()).optional().default([]);

// Subscription Tier enum (required)
const subscriptionTierSchema = z
  .nativeEnum(SubscriptionTier, {
    required_error: "Subscription tier is required",
    invalid_type_error: "Please select a valid subscription tier",
  });

// Subscription Status enum
const subscriptionStatusSchema = z
  .nativeEnum(SubscriptionStatus)
  .optional()
  .default(SubscriptionStatus.PENDING);

// Payment Status enum
const paymentStatusSchema = z
  .nativeEnum(PaymentStatus)
  .optional()
  .default(PaymentStatus.PENDING);

// Meta Robots validation
const metaRobotsSchema = z
  .enum(["index, follow", "noindex, follow", "index, nofollow", "noindex, nofollow"])
  .optional()
  .nullable();

// Legal Form validation — values come from the shared dataLayer source of truth
const legalFormSchema = z.enum(LEGAL_FORM_VALUES).optional().nullable();

// Organization Type validation — values come from the shared dataLayer source of truth
const organizationTypeSchema = z.enum(ORGANIZATION_TYPE_VALUES).optional().nullable();

// Console-owned text fields: the CLIENT edits these from the console profile (which enforces
// no length cap) and the admin form does NOT render them. The admin must impose NO length
// validation here — otherwise a long console value blocks EVERY admin save on a field the
// admin can't see or fix. Completes the field-ownership migration (admin caps were left behind).
const consoleOwnedText = z.string().optional().nullable().or(z.literal(""));

export const clientFormSchema = z
  .object({
    // Basic fields (required)
    name: z.string().min(1, "Name is required").max(200, "Name must be less than 200 characters"),
    slug: z.string().min(1, "Slug is required").max(200, "Slug must be less than 200 characters"),
    legalName: consoleOwnedText,
    url: urlSchema,

    // Media (optional in edit mode, set via modal)
    logoMediaId: z.string().min(1, "Logo is required").optional().nullable(),
    heroImageMediaId: z.string().min(1, "Hero image is required").optional().nullable(),

    // Social profiles
    sameAs: stringArraySchema,

    // Contact
    email: emailSchema,
    phone: z.string().min(1, "Phone number is required").max(50, "Phone must be less than 50 characters"),

    // Security
    password: z
      .string()
      .max(100, "Password must be less than 100 characters")
      .optional()
      .nullable()
      .or(z.literal(""))
      .refine(
        (val) => {
          // Allow empty, null, or undefined
          if (!val || val.trim() === "") return true;
          // If provided, must be at least 8 characters
          return val.length >= 8;
        },
        {
          message: "Password must be at least 8 characters",
        }
      ),
    contactType: z
      .string()
      .max(100, "Contact type must be less than 100 characters")
      .optional()
      .nullable()
      .or(z.literal("")),

    // SEO
    seoTitle: z.string().max(51, "SEO title must be 51 characters or less (final title in Google: 60 chars)").optional().nullable().or(z.literal("")),
    seoDescription: z
      .string()
      .max(160, "SEO description must be less than 160 characters")
      .optional()
      .nullable()
      .or(z.literal("")),
    description: consoleOwnedText,
    metaRobots: metaRobotsSchema,
    canonicalUrl: urlSchema,

    // Business Information — client-owned (filled from console profile), not required at admin create
    businessBrief: consoleOwnedText,
    industryId: z.string().min(1, "Industry is required"),
    targetAudience: consoleOwnedText,
    contentPriorities: stringArraySchema,
    foundingDate: dateSchema,

    // Address (for Local SEO)
    addressStreet: consoleOwnedText,
    addressCity: consoleOwnedText,
    addressCountry: z.string().max(100, "Country must be less than 100 characters").optional().nullable().or(z.literal("")),
    addressPostalCode: consoleOwnedText,

    // Saudi Arabia & Gulf Identifiers
    commercialRegistrationNumber: consoleOwnedText,
    vatID: consoleOwnedText,
    taxID: consoleOwnedText,
    legalForm: legalFormSchema,

    // Address Enhancement (National Address Format)
    addressRegion: consoleOwnedText,
    addressNeighborhood: consoleOwnedText,
    addressBuildingNumber: consoleOwnedText,
    addressAdditionalNumber: consoleOwnedText,
    addressLatitude: z
      .number()
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90")
      .optional()
      .nullable(),
    addressLongitude: z
      .number()
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180")
      .optional()
      .nullable(),

    // Classification & Business Info
    businessActivityCode: z
      .string()
      .max(50, "Business activity code must be less than 50 characters")
      .optional()
      .nullable()
      .or(z.literal("")),
    isicV4: z.string().max(20, "ISIC V4 code must be less than 20 characters").optional().nullable().or(z.literal("")),
    numberOfEmployees: consoleOwnedText,
    // Additional Properties
    alternateName: consoleOwnedText,
    slogan: consoleOwnedText,
    newsletterCtaText: z.string().max(300, "Newsletter CTA must be less than 300 characters").optional().nullable().or(z.literal("")),
    keywords: stringArraySchema,
    knowsLanguage: stringArraySchema,
    organizationType: organizationTypeSchema,

    // Relationships
    parentOrganizationId: z.string().optional().nullable(),

    // Google Business Profile + Local SEO (feed the JSON-LD generator)
    gbpProfileUrl: z.string().max(500).optional().nullable().or(z.literal("")),
    gbpPlaceId: z.string().max(300).optional().nullable().or(z.literal("")),
    gbpAccountId: z.string().max(300).optional().nullable().or(z.literal("")),
    gbpLocationId: z.string().max(300).optional().nullable().or(z.literal("")),
    gbpCategory: z.string().max(200).optional().nullable().or(z.literal("")),
    priceRange: z.string().max(20).optional().nullable().or(z.literal("")),

    // (Twitter card/title/site/description are NOT Client columns — they live in
    // nextjsMetadata, generated from Settings + the client's hero image. No form fields.)

    // YMYL (Your Money Your Life) verification — admin-controlled per client.
    // When isYmyl=true + ymylCategory is set, ymylData carries category-specific fields
    // (license number, authority, specialty, etc.) per ymyl-config.ts.
    isYmyl: z.boolean().optional().default(false),
    ymylCategory: z.enum(["medical", "legal", "financial"]).optional().nullable(),
    ymylData: z.record(z.unknown()).optional().nullable(),

    // Primary CTA («احجز الآن» / «تسوّق الآن») — admin-controlled per client.
    // NONE = no button anywhere · FORM = booking sheet · LINK = external link.
    ctaMode: z.nativeEnum(ClientCtaMode).optional().default(ClientCtaMode.NONE),
    ctaLabel: z.string().max(40, "Button label must be 40 characters or less").optional().nullable().or(z.literal("")),
    ctaUrl: z.string().max(500, "Link must be less than 500 characters").optional().nullable().or(z.literal("")),

    // Subscription Management
    subscriptionTier: subscriptionTierSchema,
    subscriptionTierConfigId: z.string().optional().nullable(),
    subscriptionStartDate: dateSchema,
    subscriptionEndDate: dateSchema,
    articlesPerMonth: z.number().int().min(0).max(100).optional().nullable(),
    subscriptionStatus: subscriptionStatusSchema,
    paymentStatus: paymentStatusSchema,
    isFeatured: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    // LINK mode needs a destination; FORM/NONE don't.
    if (data.ctaMode === ClientCtaMode.LINK) {
      const url = (data.ctaUrl ?? "").trim();
      if (!url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ctaUrl"],
          message: "Add the action link (LINK mode is on)",
        });
      } else if (!/^(https?:\/\/|tel:|mailto:)/i.test(url)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ctaUrl"],
          message: "Link must start with https://, tel:, or mailto:",
        });
      }
    }
  });

export type ClientFormSchemaType = z.infer<typeof clientFormSchema>;

// ============================================
// MEDIA-ONLY SCHEMA (for modal use only)
// ============================================
export const clientMediaSchema = z.object({
  logoMediaId: z.string().optional().nullable(),
  heroImageMediaId: z.string().optional().nullable(),
});

export type ClientMediaSchemaType = z.infer<typeof clientMediaSchema>;
