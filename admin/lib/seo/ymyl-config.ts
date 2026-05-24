/**
 * YMYL (Your Money Your Life) category configuration.
 *
 * Single source of truth for medical / legal / financial form fields,
 * dropdown options, and schema.org types. All YMYL behavior in the app
 * (admin Client form, console dynamic form, publish gates, JSON-LD generator)
 * reads from this file.
 *
 * Adding a new field: add to the relevant category's `fields` array.
 * Adding a new country authority: extend `options` per field.
 * Adding a new category: add a new key to YMYL_CATEGORIES + extend YmylCategory union.
 *
 * The reviewer (Author) is NOT in ymylData — it lives on `Article.reviewedById`
 * because it's per-article, not per-client.
 */

export type YmylCategory = "medical" | "legal" | "financial";

/** Authority options grouped by ISO-3166 country code. */
export interface AuthorityByCountry {
  SA?: string[];
  EG?: string[];
  AE?: string[];
  default?: string[];
}

export type YmylFieldType = "text" | "dropdown" | "image" | "specialty";

export interface YmylField {
  key: string;
  type: YmylFieldType;
  label: { ar: string; en: string };
  required: boolean;
  helpText?: { ar: string; en: string };
  /** dropdown options keyed by country */
  options?: AuthorityByCountry;
  /** specialty options — each maps to a specific schema.org sub-type */
  specialties?: Array<{
    value: string;
    label: { ar: string; en: string };
    schemaSubType?: string;
  }>;
}

export interface YmylCategoryConfig {
  label: { ar: string; en: string };
  description: { ar: string; en: string };
  /** base schema.org @type — overridden by specialty.schemaSubType when present */
  schemaType: string;
  /** default-banned phrases for content of this category */
  forbiddenClaims: string[];
  fields: YmylField[];
}

export const YMYL_CATEGORIES: Record<YmylCategory, YmylCategoryConfig> = {
  medical: {
    label: { ar: "طبي", en: "Medical" },
    description: {
      ar: "عيادات، مستشفيات، أطباء، صيدليات، علاج نفسي، تغذية",
      en: "Clinics, hospitals, physicians, pharmacies, mental health, nutrition",
    },
    schemaType: "MedicalClinic",
    forbiddenClaims: [
      "نضمن الشفاء",
      "علاج مضمون",
      "بدون أعراض جانبية",
      "علاج نهائي",
      "بديل عن الطبيب",
      "يعالج جميع الأمراض",
    ],
    fields: [
      {
        key: "licenseNumber",
        type: "text",
        label: { ar: "رقم الترخيص الطبي", en: "Medical License Number" },
        required: true,
        helpText: {
          ar: "رقم ترخيص المنشأة الصادر من الجهة الصحية",
          en: "Facility license number issued by the health authority",
        },
      },
      {
        key: "authority",
        type: "dropdown",
        label: { ar: "الجهة المُرخِّصة", en: "Licensing Authority" },
        required: true,
        options: {
          SA: ["MOH", "SCFHS", "SFDA"],
          EG: ["MOHP", "EMS"],
          AE: ["DHA", "DoH", "MoHAP"],
          default: [],
        },
      },
      {
        key: "specialty",
        type: "specialty",
        label: { ar: "التخصص الطبي", en: "Medical Specialty" },
        required: true,
        specialties: [
          { value: "general", label: { ar: "طب عام", en: "General Medicine" }, schemaSubType: "MedicalClinic" },
          { value: "dentistry", label: { ar: "طب أسنان", en: "Dentistry" }, schemaSubType: "Dentist" },
          { value: "pediatrics", label: { ar: "طب أطفال", en: "Pediatrics" }, schemaSubType: "MedicalClinic" },
          { value: "optometry", label: { ar: "طب عيون", en: "Optometry" }, schemaSubType: "Optician" },
          { value: "psychiatry", label: { ar: "طب نفسي", en: "Mental Health" }, schemaSubType: "MedicalClinic" },
          { value: "physiotherapy", label: { ar: "علاج طبيعي", en: "Physiotherapy" }, schemaSubType: "PhysicalTherapy" },
          { value: "pharmacy", label: { ar: "صيدلية", en: "Pharmacy" }, schemaSubType: "Pharmacy" },
          { value: "nutrition", label: { ar: "تغذية", en: "Nutrition" }, schemaSubType: "Dietitian" },
          { value: "hospital", label: { ar: "مستشفى", en: "Hospital" }, schemaSubType: "Hospital" },
          { value: "laboratory", label: { ar: "مختبر", en: "Laboratory" }, schemaSubType: "DiagnosticLab" },
        ],
      },
      {
        key: "licenseImageUrl",
        type: "image",
        label: { ar: "صورة الترخيص", en: "License Image" },
        required: true,
        helpText: {
          ar: "ارفع صورة أو PDF لشهادة الترخيص",
          en: "Upload license certificate (image or PDF)",
        },
      },
    ],
  },
  legal: {
    label: { ar: "قانوني", en: "Legal" },
    description: {
      ar: "مكاتب محاماة، استشارات قانونية، توثيق",
      en: "Law firms, legal consulting, notary",
    },
    schemaType: "LegalService",
    forbiddenClaims: [
      "نضمن الفوز بالقضية",
      "نتائج مضمونة",
      "نضمن لك الحق",
      "أفضل محامي في البلد",
      "نضمن البراءة",
    ],
    fields: [
      {
        key: "barNumber",
        type: "text",
        label: { ar: "رقم القيد في النقابة", en: "Bar Registration Number" },
        required: true,
        helpText: {
          ar: "رقم قيد المكتب في نقابة المحامين",
          en: "Firm registration number with the bar association",
        },
      },
      {
        key: "barAssociation",
        type: "dropdown",
        label: { ar: "النقابة المهنية", en: "Bar Association" },
        required: true,
        options: {
          SA: ["هيئة المحامين السعودية", "وزارة العدل"],
          EG: ["نقابة المحامين المصرية"],
          AE: ["وزارة العدل الإماراتية"],
          default: [],
        },
      },
      {
        key: "specialty",
        type: "specialty",
        label: { ar: "التخصص القانوني", en: "Legal Specialty" },
        required: true,
        specialties: [
          { value: "general", label: { ar: "عام", en: "General" }, schemaSubType: "LegalService" },
          { value: "criminal", label: { ar: "جنائي", en: "Criminal" }, schemaSubType: "LegalService" },
          { value: "civil", label: { ar: "مدني", en: "Civil" }, schemaSubType: "LegalService" },
          { value: "family", label: { ar: "أحوال شخصية", en: "Family Law" }, schemaSubType: "LegalService" },
          { value: "commercial", label: { ar: "تجاري", en: "Commercial" }, schemaSubType: "LegalService" },
          { value: "real-estate", label: { ar: "عقاري", en: "Real Estate" }, schemaSubType: "LegalService" },
          { value: "labor", label: { ar: "عمالي", en: "Labor" }, schemaSubType: "LegalService" },
          { value: "tax", label: { ar: "ضرائب", en: "Tax" }, schemaSubType: "LegalService" },
          { value: "notary", label: { ar: "توثيق", en: "Notary" }, schemaSubType: "LegalService" },
        ],
      },
      {
        key: "barCertificateUrl",
        type: "image",
        label: { ar: "شهادة القيد", en: "Bar Certificate" },
        required: false,
        helpText: {
          ar: "ارفع شهادة القيد في النقابة (اختياري لكن يزيد الثقة)",
          en: "Upload bar membership certificate (optional but boosts trust)",
        },
      },
    ],
  },
  financial: {
    label: { ar: "مالي", en: "Financial" },
    description: {
      ar: "استشارات مالية، تأمين، محاسبة، عقار، عملات رقمية",
      en: "Financial advisory, insurance, accounting, real estate, crypto",
    },
    schemaType: "FinancialService",
    forbiddenClaims: [
      "عائد مضمون",
      "ربح مضمون",
      "بدون مخاطر",
      "استثمار آمن 100%",
      "نضاعف أموالك",
      "ربح يومي مؤكد",
    ],
    fields: [
      {
        key: "regulatorLicense",
        type: "text",
        label: { ar: "رقم رخصة الجهة التنظيمية", en: "Regulator License Number" },
        required: true,
        helpText: {
          ar: "رقم الترخيص من هيئة سوق المال أو ما يماثلها",
          en: "License number from capital markets authority or equivalent",
        },
      },
      {
        key: "regulator",
        type: "dropdown",
        label: { ar: "الجهة التنظيمية", en: "Regulatory Authority" },
        required: true,
        options: {
          SA: ["CMA", "SAMA", "ZATCA"],
          EG: ["FRA", "CBE"],
          AE: ["SCA", "CBUAE"],
          default: [],
        },
      },
      {
        key: "specialty",
        type: "specialty",
        label: { ar: "نوع النشاط", en: "Activity Type" },
        required: true,
        specialties: [
          { value: "advisory", label: { ar: "استشارات مالية", en: "Financial Advisory" }, schemaSubType: "FinancialService" },
          { value: "brokerage", label: { ar: "وساطة مالية", en: "Brokerage" }, schemaSubType: "FinancialService" },
          { value: "insurance", label: { ar: "تأمين", en: "Insurance" }, schemaSubType: "InsuranceAgency" },
          { value: "accounting", label: { ar: "محاسبة وضرائب", en: "Accounting & Tax" }, schemaSubType: "AccountingService" },
          { value: "real-estate", label: { ar: "وساطة عقارية", en: "Real Estate" }, schemaSubType: "RealEstateAgent" },
          { value: "crypto", label: { ar: "عملات رقمية", en: "Crypto" }, schemaSubType: "FinancialService" },
          { value: "banking", label: { ar: "خدمات مصرفية", en: "Banking" }, schemaSubType: "BankOrCreditUnion" },
        ],
      },
      {
        key: "licenseImageUrl",
        type: "image",
        label: { ar: "صورة الترخيص", en: "License Image" },
        required: false,
        helpText: {
          ar: "ارفع صورة الترخيص (اختياري لكن يزيد الثقة)",
          en: "Upload license image (optional but boosts trust)",
        },
      },
    ],
  },
};

/** Stable list of valid category keys (for runtime guards). */
export const YMYL_CATEGORY_KEYS = Object.keys(YMYL_CATEGORIES) as YmylCategory[];

/** Type guard: is the given string a valid YMYL category? */
export function isYmylCategory(value: unknown): value is YmylCategory {
  return typeof value === "string" && (YMYL_CATEGORY_KEYS as string[]).includes(value);
}
