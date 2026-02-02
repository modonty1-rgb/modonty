import { z } from "zod";
import { SubscriptionTier, SubscriptionStatus, PaymentStatus } from "@prisma/client";

/**
 * Zod validation schema for Client form
 * Covers all 50+ schema fields with appropriate validation rules
 */

// URL validation helper
const urlSchema = z.string().url("Must be a valid URL").optional().nullable().or(z.literal(""));

// GTM ID validation (format: GTM-XXXXXXX)
const gtmIdSchema = z
  .string()
  .regex(/^GTM-[A-Z0-9]+$/, "GTM ID must be in format GTM-XXXXXXX")
  .optional()
  .nullable()
  .or(z.literal(""));

// Twitter site validation (format: @username)
const twitterSiteSchema = z
  .string()
  .regex(/^@?[\w]+$/, "Twitter site must be a valid username (e.g., @username)")
  .optional()
  .nullable()
  .or(z.literal(""));

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

// Twitter Card validation
const twitterCardSchema = z
  .enum(["summary_large_image", "summary", "auto"])
  .optional()
  .nullable();

// Legal Form validation
const legalFormSchema = z
  .enum([
    "LLC",
    "JSC",
    "Sole Proprietorship",
    "Partnership",
    "Limited Partnership",
    "Simplified Joint Stock Company",
  ])
  .optional()
  .nullable();

// Organization Type validation
const organizationTypeSchema = z
  .enum([
    "Organization",
    "Corporation",
    "LocalBusiness",
    "NonProfit",
    "EducationalOrganization",
    "GovernmentOrganization",
    "SportsOrganization",
    "NGO",
  ])
  .optional()
  .nullable();

// Region/Province validation (optional field - allows any text for international clients)
const addressRegionSchema = z
  .string()
  .max(100, "Region/Province must be less than 100 characters")
  .optional()
  .nullable()
  .or(z.literal(""));

export const clientFormSchema = z
  .object({
    // Basic fields (required)
    name: z.string().min(1, "Name is required").max(200, "Name must be less than 200 characters"),
    slug: z.string().min(1, "Slug is required").max(200, "Slug must be less than 200 characters"),
    legalName: z.string().max(200, "Legal name must be less than 200 characters").optional().nullable().or(z.literal("")),
    url: urlSchema,

    // Media
    logoMediaId: z.string().optional().nullable(),
    ogImageMediaId: z.string().optional().nullable(),
    twitterImageMediaId: z.string().optional().nullable(),

    // Social profiles
    sameAs: stringArraySchema,

    // Contact
    email: emailSchema,
    phone: z.string().max(50, "Phone must be less than 50 characters").optional().nullable().or(z.literal("")),

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
    seoTitle: z.string().max(60, "SEO title must be less than 60 characters").optional().nullable().or(z.literal("")),
    seoDescription: z
      .string()
      .max(160, "SEO description must be less than 160 characters")
      .optional()
      .nullable()
      .or(z.literal("")),
    description: z
      .string()
      .max(1000, "Description must be less than 1000 characters")
      .optional()
      .nullable()
      .or(z.literal("")),
    metaRobots: metaRobotsSchema,
    canonicalUrl: urlSchema,

    // Business Information
    businessBrief: z
      .string()
      .min(100, "Business brief must be at least 100 characters")
      .max(5000, "Business brief must be less than 5000 characters"),
    industryId: z.string().optional().nullable(),
    targetAudience: z
      .string()
      .max(1000, "Target audience must be less than 1000 characters")
      .optional()
      .nullable()
      .or(z.literal("")),
    contentPriorities: stringArraySchema,
    foundingDate: dateSchema,

    // Address (for Local SEO)
    addressStreet: z.string().max(200, "Street address must be less than 200 characters").optional().nullable().or(z.literal("")),
    addressCity: z.string().max(100, "City must be less than 100 characters").optional().nullable().or(z.literal("")),
    addressCountry: z.string().max(100, "Country must be less than 100 characters").optional().nullable().or(z.literal("")),
    addressPostalCode: z.string().max(20, "Postal code must be less than 20 characters").optional().nullable().or(z.literal("")),

    // Saudi Arabia & Gulf Identifiers
    commercialRegistrationNumber: z
      .string()
      .max(50, "Commercial registration number must be less than 50 characters")
      .optional()
      .nullable()
      .or(z.literal("")),
    vatID: z.string().max(50, "VAT ID must be less than 50 characters").optional().nullable().or(z.literal("")),
    taxID: z.string().max(50, "Tax ID must be less than 50 characters").optional().nullable().or(z.literal("")),
    legalForm: legalFormSchema,

    // Address Enhancement (National Address Format)
    addressRegion: addressRegionSchema,
    addressNeighborhood: z
      .string()
      .max(100, "Neighborhood must be less than 100 characters")
      .optional()
      .nullable()
      .or(z.literal("")),
    addressBuildingNumber: z
      .string()
      .max(20, "Building number must be less than 20 characters")
      .optional()
      .nullable()
      .or(z.literal("")),
    addressAdditionalNumber: z
      .string()
      .max(20, "Additional number must be less than 20 characters")
      .optional()
      .nullable()
      .or(z.literal("")),
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
    numberOfEmployees: z
      .string()
      .max(50, "Number of employees must be less than 50 characters")
      .optional()
      .nullable()
      .or(z.literal("")),
    licenseNumber: z
      .string()
      .max(100, "License number must be less than 100 characters")
      .optional()
      .nullable()
      .or(z.literal("")),
    licenseAuthority: z
      .string()
      .max(200, "License authority must be less than 200 characters")
      .optional()
      .nullable()
      .or(z.literal("")),

    // Additional Properties
    alternateName: z
      .string()
      .max(200, "Alternate name must be less than 200 characters")
      .optional()
      .nullable()
      .or(z.literal("")),
    slogan: z.string().max(200, "Slogan must be less than 200 characters").optional().nullable().or(z.literal("")),
    keywords: stringArraySchema,
    knowsLanguage: stringArraySchema,
    organizationType: organizationTypeSchema,

    // Relationships
    parentOrganizationId: z.string().optional().nullable(),

    // Twitter Cards
    twitterCard: twitterCardSchema,
    twitterTitle: z.string().max(70, "Twitter title must be less than 70 characters").optional().nullable().or(z.literal("")),
    twitterDescription: z
      .string()
      .max(200, "Twitter description must be less than 200 characters")
      .optional()
      .nullable()
      .or(z.literal("")),
    twitterSite: twitterSiteSchema,

    // GTM Integration
    gtmId: gtmIdSchema,

    // Subscription Management
    subscriptionTier: subscriptionTierSchema,
    subscriptionTierConfigId: z.string().optional().nullable(),
    subscriptionStartDate: dateSchema,
    subscriptionEndDate: dateSchema,
    articlesPerMonth: z.number().int().min(0).max(100).optional().nullable(),
    subscriptionStatus: subscriptionStatusSchema,
    paymentStatus: paymentStatusSchema,
  })
  .refine(
    (data) => {
      // Business brief is required - must be at least 100 characters
      return data.businessBrief && data.businessBrief.trim().length >= 100;
    },
    {
      message: "Business brief is required and must be at least 100 characters long",
      path: ["businessBrief"],
    }
  )
  .refine(
    (data) => {
      // If GTM ID is provided, it must be valid format
      if (data.gtmId && data.gtmId.trim() !== "") {
        return /^GTM-[A-Z0-9]+$/.test(data.gtmId);
      }
      return true;
    },
    {
      message: "GTM ID must be in format GTM-XXXXXXX",
      path: ["gtmId"],
    }
  );

export type ClientFormSchemaType = z.infer<typeof clientFormSchema>;
