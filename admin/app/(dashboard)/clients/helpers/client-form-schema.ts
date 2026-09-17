import { z } from "zod";
import { SubscriptionStatus, PaymentStatus, ClientCtaMode } from "@prisma/client";
import { LEGAL_FORM_VALUES, ORGANIZATION_TYPE_VALUES } from "@modonty/shared/lib/constants/client-classification";

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
// `subscriptionTierSchema` سقط: لا شاشةَ تجمع الباقة بعد اليوم — تأتي من الطلب
// الساري (`planName`) عند التفعيل.

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

// Legal Form validation — values come from the shared shared source of truth
const legalFormSchema = z.enum(LEGAL_FORM_VALUES).optional().nullable();

// Organization Type validation — values come from the shared shared source of truth
const organizationTypeSchema = z.enum(ORGANIZATION_TYPE_VALUES).optional().nullable();

// Console-owned text fields: the CLIENT edits these from the console profile (which enforces
// no length cap) and the admin form does NOT render them. The admin must impose NO length
// validation here — otherwise a long console value blocks EVERY admin save on a field the
// admin can't see or fix. Completes the field-ownership migration (admin caps were left behind).
const consoleOwnedText = z.string().optional().nullable().or(z.literal(""));

/**
 * الشكل الخام — بلا تنقيح. مفصولٌ لأنّ `.superRefine()` يُرجع `ZodEffects` لا
 * `ZodObject`، و`ZodEffects` لا يقبل `.extend()` ولا إعادةَ تنقيحٍ مختلف. والشاشتان
 * (الإنشاء والتعديل) صارتا تطلبان حقولاً مختلفة، فلزم أصلٌ واحدٌ يتفرّعان عنه.
 */
const clientFormObject = z
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
    // Origin: MODONTY POLICY, not Google — 51 = our 60-char display budget minus the
    // "- مودونتي" suffix. Google sets no title length limit (Title links doc).
    // https://developers.google.com/search/docs/appearance/title-link
    seoTitle: z.string().max(51, "SEO title is longer than 51 chars — shorten it. Modonty appends \"- مودونتي\" (60 total): MODONTY POLICY for title display, not a Google requirement").optional().nullable().or(z.literal("")),
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
    salesRepId: z.string().nullable().optional(),
    editorId: z.string().nullable().optional(),
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
    // Which button from the shared list — identity. The wording lives in ctaLabel.
    ctaPresetId: z.string().optional().nullable().or(z.literal("")),
    ctaLabel: z.string().max(40, "Button label must be 40 characters or less").optional().nullable().or(z.literal("")),
    ctaUrl: z.string().max(500, "Link must be less than 500 characters").optional().nullable().or(z.literal("")),

    // Subscription Management
    subscriptionTierConfigId: z.string().optional().nullable(),
    subscriptionStartDate: dateSchema,
    subscriptionEndDate: dateSchema,
    articlesPerMonth: z.number().int().min(0).max(100).optional().nullable(),
    subscriptionStatus: subscriptionStatusSchema,
    paymentStatus: paymentStatusSchema,
    isFeatured: z.boolean().optional().default(false),
    isVerified: z.boolean().optional().default(true),
    // Defaults to true — the tab is already visible to every client, so an unset value
    // must mean "keep showing it", never "hide it".
    showSchedule: z.boolean().optional().default(true),
    isInternal: z.boolean().optional().default(false),

    // Publishing to the client's own website. `articlesBaseUrl` must be an absolute
    // http(s) URL — every canonical URL of that client's articles is built from it,
    // so a bare domain or a typo would bake a broken address into published pages.
    canPublishToOwnSite: z.boolean().optional().default(false),
    articlesBaseUrl: z
      .string()
      .max(500, "Link must be less than 500 characters")
      .url("Enter a full address including https://")
      .optional()
      .nullable()
      .or(z.literal("")),
    apiKeySuspended: z.boolean().optional().default(false),

    // Opening balance (CREATE only) — the founding payment («تأسيسه معناه دفع»). Persisted
    // سقط `openingBalance` و`billingCycle` (١٧ سبتمبر ٢٠٢٦): المبلغُ والمدّة يعيشان
    // على الطلب المدفوع، لا على كرت العميل. ولا شاشةَ تجمعهما بعد اليوم.
  });

/** القواعد التي لا تختلف بين إنشاءٍ وتعديل — تُستدعى من كليهما بلا نسخةٍ ثانية. */
const refineShared: Parameters<typeof clientFormObject.superRefine>[0] = (data, ctx) => {
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

    // Publishing to the client's own site is meaningless without knowing WHERE.
    // One rule covers both directions: you cannot switch it on with an empty
    // address, and you cannot clear the address while it is on.
    if (data.canPublishToOwnSite && !(data.articlesBaseUrl ?? "").trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["articlesBaseUrl"],
        message: "Add the articles address on the client's site first",
      });
    }
};

// لم يبقَ فرقٌ بين مخطّطَي الإنشاء والتعديل بعد سقوط اشتراط الباقة — كلاهما الأصلُ
// وقواعدُه المشتركة. يبقيان باسمين لأنّ المستدعين يفرّقون بينهما اليوم.
export const clientFormSchema = clientFormObject.superRefine(refineShared);

export type ClientFormSchemaType = z.infer<typeof clientFormSchema>;

/**
 * **مخطّط الإنشاء — للحسابات الداخليّة وحدها (المرحلة ٣).**
 *
 * كان يطلب المندوبَ والرصيدَ الافتتاحيّ والباقة، لأنّ `/clients/new` كانت تؤسّس عميلاً
 * يدفع. وقد صارت الشاشة للحسابات الداخليّة فقط، ومن يدفع يُفعَّل من طلبه في `/orders`
 * حيث الأرقام مكتوبةٌ بما دفعه فعلاً.
 *
 * **وما تكفّ الشاشة عن سؤاله يكفّ المخطّط عن طلبه** — وإلّا سقط زرّ الحفظ على حقلٍ لا
 * يراه الموظّف ولا يستطيع إصلاحه:
 *
 *   الباقة   الحساب الداخليّ مجّانيّ، و`createClient` يكتب له صفّ الكتالوج المجّانيّ.
 *   المندوب  لا عمولةَ على حسابٍ لا يدفع.
 *   الرصيد   كان معفىً للداخليّ أصلاً، وصار العفو هو الحالة الوحيدة.
 *
 * والقواعد المشتركة تبقى كما هي عبر `refineShared`.
 */
export const clientCreateFormSchema = clientFormObject.superRefine(refineShared);

// ============================================
// SEO SUB-FORM SCHEMA (the /clients/[id]/seo page)
// ============================================
// The SEO page edits ONLY SEO fields but reuses the shared form + useClientForm.
// Validating the FULL clientFormSchema there blocks the save on unrelated required
// fields — Industry, Subscription Tier — that the SEO page does NOT render, so the
// admin can neither see nor fix them: the Save button silently does nothing.
// This schema validates just the SEO-editable fields; `.passthrough()` carries every
// other field through untouched, so updateClient still receives the complete client
// payload (unchanged fields diff out server-side, exactly like the full form).
// The server (clientServerSchema) is the real gate and treats industryId/tier as optional.
export const clientSeoFormSchema = z
  .object({
    // Origin: MODONTY POLICY, not Google — see clientFormSchema.seoTitle above.
    seoTitle: z
      .string()
      .max(51, "SEO title is longer than 51 chars — shorten it. Modonty appends \"- مودونتي\" (60 total): MODONTY POLICY for title display, not a Google requirement")
      .optional()
      .nullable()
      .or(z.literal("")),
    seoDescription: z
      .string()
      .max(160, "SEO description must be less than 160 characters")
      .optional()
      .nullable()
      .or(z.literal("")),
    gbpProfileUrl: z.string().max(500).optional().nullable().or(z.literal("")),
    gbpPlaceId: z.string().max(300).optional().nullable().or(z.literal("")),
    gbpAccountId: z.string().max(300).optional().nullable().or(z.literal("")),
    gbpLocationId: z.string().max(300).optional().nullable().or(z.literal("")),
    gbpCategory: z.string().max(200).optional().nullable().or(z.literal("")),
    priceRange: z.string().max(20).optional().nullable().or(z.literal("")),
    addressLatitude: z.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90").optional().nullable(),
    addressLongitude: z.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180").optional().nullable(),
    knowsLanguage: z.array(z.string()).optional(),
  })
  .passthrough();

// ============================================
// MEDIA-ONLY SCHEMA (for modal use only)
// ============================================
export const clientMediaSchema = z.object({
  logoMediaId: z.string().optional().nullable(),
  heroImageMediaId: z.string().optional().nullable(),
});

export type ClientMediaSchemaType = z.infer<typeof clientMediaSchema>;
