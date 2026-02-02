import type { ClientFormSchemaType } from "./client-form-schema";
import type { SubscriptionTier } from "@prisma/client";
import { slugify } from "@/lib/utils";

interface GenerateClientTestDataOptions {
  industries: Array<{ id: string; name: string }>;
  tierConfigs: Array<{
    id: string;
    tier: SubscriptionTier;
    name: string;
    articlesPerMonth: number;
  }>;
  clients?: Array<{ id: string; name: string; slug: string }>;
}

function pick<T>(arr: T[]): T | undefined {
  return arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : undefined;
}

export function generateClientTestData(
  options: GenerateClientTestDataOptions
): Partial<ClientFormSchemaType> {
  const { industries, tierConfigs, clients = [] } = options;
  const tier = pick(tierConfigs) ?? tierConfigs[0];
  const industry = pick(industries);
  const parent = clients.length > 0 ? pick(clients) : undefined;

  const ts = new Date().toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const name = `عميل تجريبي - ${ts}`;
  const slug = slugify(name) || `عميل-تجريبي-${Date.now().toString(36)}`;

  const businessBrief =
    "هذا وصف تجريبي لمؤسسة افتراضية لأغراض التطوير والاختبار. يوضح كيفية تعبئة النموذج ببيانات ذات طول كافٍ لتجاوز حد المئة حرف المطلوب في حقل الملخص. يمكن استخدام هذا النص للتحقق من عمل التحقق من الصحة وعرض المعاينة المباشرة في SEO & Validation.";

  const vatId = "300000000000003";
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 18);

  return {
    // --- Information tab ---
    name,
    slug,
    alternateName: `الشركة التجريبية ${ts}`,
    legalName: `الشركة التجريبية ${ts}`,
    url: "https://example.com",
    email: `test-${Date.now().toString(36)}@example.com`,
    phone: "+966501234567",
    contactType: "customer service",
    sameAs: ["https://twitter.com/example", "https://linkedin.com/company/example"],
    slogan: "الابتكار beyond الحدود",
    numberOfEmployees: "50-100",
    commercialRegistrationNumber: "1234567890",
    businessBrief,
    industryId: industry?.id ?? null,
    foundingDate: new Date("2020-01-15"),
    organizationType: "Organization",
    // Address (Information tab)
    addressStreet: "شارع الملك فهد",
    addressNeighborhood: "العليا",
    addressBuildingNumber: "1234",
    addressAdditionalNumber: "5",
    addressCity: "الرياض",
    addressRegion: "الرياض",
    addressPostalCode: "12345",
    addressCountry: "المملكة العربية السعودية",
    addressLatitude: 24.7136,
    addressLongitude: 46.6753,
    // Legal (Information tab)
    legalForm: "LLC",
    vatID: vatId,
    taxID: vatId,
    licenseNumber: "HC-2024-001234",
    licenseAuthority: "وزارة الصحة",
    // --- Subscription tab ---
    subscriptionTier: tier?.tier ?? "STANDARD",
    subscriptionTierConfigId: tier?.id ?? null,
    subscriptionStartDate: startDate,
    subscriptionEndDate: endDate,
    articlesPerMonth: tier?.articlesPerMonth ?? 10,
    subscriptionStatus: "PENDING",
    paymentStatus: "PENDING",
    // --- Audience tab ---
    targetAudience: "مؤسسات صغيرة ومتوسطة، رواد أعمال، أصحاب متاجر إلكترونية",
    contentPriorities: ["مدونات", "أخبار", "دليل استخدام"],
    // --- SEO tab ---
    seoTitle: `${name} - مودونتي`,
    seoDescription: "وصف تجريبي للعميل لأغراض التطوير والاختبار. يظهر في نتائج البحث وبطاقات Open Graph.",
    description: businessBrief,
    metaRobots: "index, follow",
    canonicalUrl: `https://modonty.com/clients/${slug}`,
    gtmId: "GTM-TEST123",
    keywords: ["تكنولوجيا", "استشارات", "تحول رقمي"],
    knowsLanguage: ["Arabic", "English"],
    parentOrganizationId: parent?.id ?? null,
    businessActivityCode: "62010",
    isicV4: "6201",
    // --- Media tab (Twitter; media IDs require DB, left null) ---
    twitterCard: "summary_large_image",
    twitterTitle: name,
    twitterDescription: "وصف تجريبي لبطاقة تويتر.",
    twitterSite: "@example",
    // --- Security tab (dev-only placeholder) ---
    password: "TestPass123!",
  };
}
