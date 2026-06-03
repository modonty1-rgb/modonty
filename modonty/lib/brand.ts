/**
 * SINGLE SOURCE OF TRUTH for Modonty brand identity.
 *
 * Plain string constants → zero client-JS / bundle / runtime cost when imported into
 * Server Components, layout, email templates, or edge. Change a value HERE and it
 * propagates everywhere — no more scattered hardcoded literals or spelling drift.
 *
 * RULE: never hardcode the brand name / site URL / logo / contact email inline again —
 * import from here. Admin-editable content (SEO titles, social links, banner) stays in the
 * DB Settings table; this file is for the FIXED identity facts only.
 */

// Display name — Arabic UI. Official spelling = «مدونتي» (from «مدوّنة»), NOT «مودونتي» (wrong transliteration).
export const BRAND_AR = "مدونتي";

// Latin name — used in JSON-LD Organization/WebSite name, og:site_name, email "from".
export const BRAND_EN = "Modonty";

// Canonical site URL (www-consistent, no trailing slash). Env wins; constant is the fallback.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com").replace(/\/+$/, "");

// Brand logo (square PNG) — used in nav, email, JSON-LD logo.
export const LOGO_URL =
  "https://res.cloudinary.com/dfegnpgwx/image/upload/v1769683590/modontyLogo_ftf4yf.png";

// Brand character/avatar (used in feed fallback + some OG contexts).
export const CHARACTER_URL =
  "https://res.cloudinary.com/dfegnpgwx/image/upload/v1770899986/modontyAvatar_gn8wxj.webp";

// NOTE: the OG/share image is NOT a static constant — it lives in Settings (admin-managed,
// single source of truth). Read it via `getBrandMedia()` (lib/settings/get-brand-media.ts).
// If empty → og:image is omitted and the admin is alerted (EssentialSeoDialog).

// Official contact email (per project_prod_business_info_values — corrects legacy support@jbrseo.com).
export const CONTACT_EMAIL = "modonty@modonty.com";

// Transactional email "from" header.
export const NOREPLY_FROM = `${BRAND_EN} <no-reply@modonty.com>`;

// Legal entity facts — VERIFIED from the official Ministry of Commerce commercial-registration
// certificate via its QR (qr.saudibusiness.gov.sa) on 2026-06-03. «جبر الجنوبية» هي الكيان المظلّة
// المُشغِّل لمنصّة مدونتي (وحديقة البستان تحتها). تُستهلك في /trust + شريط الثقة و JSON-LD في /story.
export const LEGAL = {
  legalName: "شركة جبر الجنوبية للمقاولات",
  dba: "شركة جبر الجنوبية للمقاولات", // back-compat alias used by /story trust strip
  cr: "4030524305", // رقم السجل التجاري
  unifiedNumber: "7036024383", // الرقم الوطني الموحّد للمنشأة
  entityType: "شركة ذات مسؤولية محدودة",
  status: "نشط",
  capital: "8,000,000",
  city: "جدة",
  country: "السعودية",
  countryCode: "SA",
  region: "منطقة مكة المكرمة",
  district: "حي الشرفية",
  street: "شارع أبو بكر الصديق",
  foundedYear: "2023",
  registrationDateAr: "١٣ سبتمبر ٢٠٢٣",
  // Official MC certificate image (basic data + verification QR) — served from /public.
  certificateImage: "/trust/jabr-cr-certificate.png",
  // Public verification — Saudi Business Center authentication inquiry.
  verifyUrl: "https://eauthenticate.saudibusiness.gov.sa/inquiry",
} as const;
