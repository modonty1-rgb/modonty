// منسوخ من jbrseo.com/lib/site-settings.types.ts — إدارة محتوى موقع جبر سيو من أدمن مودونتي.
// يحرّر نفس صفوف القاعدة التي يحرّرها أدمن جبر سيو (قاعدة واحدة، نماذج مرآة).
// ⚠️ مرآة: أي تغيير في شكل الحقول يُطبَّق هنا وفي jbrseo.com معاً.

/**
 * Single source of truth for the primary CTA label used throughout the site.
 * The DB value (`LandingSection.section="ctaLabel"`) still wins when present;
 * this constant is the fallback used everywhere the DB is empty or unreachable.
 * If you change the wording, change it here — nowhere else.
 */
export const DEFAULT_CTA_LABEL = "اختر باقتك";

export type SiteSettingsSeo = {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  ogLocale: string;
};

export type SiteSettingsTracking = {
  gtmId: string;
};

export type GlobalSiteSettings = {
  gtmId: string;
  whatsappNumber: string;
};

export type SiteSettingsSite = {
  showSectionCounter: boolean;
  ctaLabel: string;
  /** Optional WhatsApp number for wa.me links (per country). Digits only when building link. */
  whatsappNumber?: string;
};

export type SiteSettingsPricingTeaser = {
  cta: string;
  sectionHeadings: {
    eyebrow: string;
    title: string;
    highlightBadge: string;
  };
};

export type SiteSettingsJson = {
  seo: SiteSettingsSeo;
  tracking: SiteSettingsTracking;
  site: SiteSettingsSite;
  pricingTeaser: SiteSettingsPricingTeaser;
};

export const DEFAULT_SITE_SETTINGS_JSON: SiteSettingsJson = {
  seo: {
    title: "",
    description: "",
    canonical: "",
    ogImage: "",
    ogLocale: "ar_SA",
  },
  tracking: { gtmId: "" },
  site: { showSectionCounter: false, ctaLabel: DEFAULT_CTA_LABEL, whatsappNumber: "" },
  pricingTeaser: {
    cta: "",
    sectionHeadings: { eyebrow: "الخطط", title: "اختر خطتك", highlightBadge: "الأكثر شيوعاً" },
  },
};
