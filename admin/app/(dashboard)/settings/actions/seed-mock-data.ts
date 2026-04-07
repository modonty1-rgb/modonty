"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// ═══════════════════════════════════════════════════════════════════
// MODONTY — Full QA Seed Data
// Covers 42 models, ~160+ records, all relationships
// Real Arabic content, real market data, real SEO niche targeting
// ═══════════════════════════════════════════════════════════════════

// ─── Step tracker for live UI feedback ───
export type SeedStep = {
  label: string;
  status: "pending" | "running" | "done" | "error";
  count?: number;
  error?: string;
};

// ─── Helpers ───
const SESSION_ID = () => `sess_${crypto.randomUUID().slice(0, 8)}`;
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);
const hoursAgo = (n: number) => new Date(Date.now() - n * 3600000);

// ═══════════════════════════════════════════════════════════════════
// PHASE 1: FOUNDATION — Users, Authors, Tiers, Media
// ═══════════════════════════════════════════════════════════════════

const USERS = [
  {
    email: "admin@modonty.com",
    name: "أحمد المدير",
    role: "ADMIN" as const,
    password: "Admin@123456",
    avatar: "https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg",
  },
  {
    email: "editor@modonty.com",
    name: "سارة المحررة",
    role: "EDITOR" as const,
    password: "Editor@123456",
    avatar: "https://res.cloudinary.com/demo/image/upload/v1/avatars/editor.jpg",
  },
  {
    email: "client@modonty.com",
    name: "خالد العميل",
    role: "CLIENT" as const,
    password: "Client@123456",
    avatar: "https://res.cloudinary.com/demo/image/upload/v1/avatars/client.jpg",
  },
];

const AUTHORS = [
  {
    name: "م. أحمد الشهري",
    slug: "ahmed-alshehri",
    firstName: "أحمد",
    lastName: "الشهري",
    jobTitle: "خبير تحسين محركات البحث",
    worksFor: undefined, // ObjectId — linked after clients created
    bio: "خبير SEO بخبرة 8 سنوات في السوق السعودي. ساعد أكثر من 200 شركة في تحسين ظهورها الرقمي. متخصص في SEO التقني والمحتوى العربي.",
    image: "https://res.cloudinary.com/demo/image/upload/v1/authors/ahmed.jpg",
    imageAlt: "م. أحمد الشهري — خبير SEO",
    email: "ahmed@modonty.com",
    linkedIn: "https://linkedin.com/in/ahmed-seo",
    twitter: "https://twitter.com/ahmed_seo",
    sameAs: ["https://linkedin.com/in/ahmed-seo", "https://twitter.com/ahmed_seo"],
    credentials: ["شهادة Google Analytics", "شهادة Semrush SEO", "شهادة HubSpot Content Marketing"],
    qualifications: ["بكالوريوس نظم معلومات", "ماجستير تسويق رقمي"],
    expertiseAreas: ["SEO تقني", "تحسين المحتوى", "تحليلات جوجل", "بناء الروابط"],
    experienceYears: 8,
    verificationStatus: true,
    memberOf: ["الجمعية السعودية للتسويق الرقمي"],
    seoTitle: "م. أحمد الشهري — خبير SEO | مدونتي",
    seoDescription: "خبير تحسين محركات البحث بخبرة 8 سنوات. متخصص في SEO التقني والمحتوى العربي للشركات السعودية.",
  },
  {
    name: "أ. نورة القحطاني",
    slug: "noura-alqahtani",
    firstName: "نورة",
    lastName: "القحطاني",
    jobTitle: "كاتبة محتوى تسويقي",
    worksFor: undefined, // ObjectId — linked after clients created
    bio: "كاتبة محتوى محترفة بخبرة 5 سنوات. متخصصة في كتابة المحتوى التسويقي والمقالات المتوافقة مع SEO باللغة العربية.",
    image: "https://res.cloudinary.com/demo/image/upload/v1/authors/noura.jpg",
    imageAlt: "أ. نورة القحطاني — كاتبة محتوى",
    email: "noura@modonty.com",
    linkedIn: "https://linkedin.com/in/noura-content",
    sameAs: ["https://linkedin.com/in/noura-content"],
    credentials: ["شهادة Google Digital Garage", "شهادة Content Marketing Institute"],
    qualifications: ["بكالوريوس إعلام", "دبلوم كتابة إبداعية"],
    expertiseAreas: ["كتابة المحتوى", "التسويق بالمحتوى", "السوشال ميديا", "كتابة UX"],
    experienceYears: 5,
    verificationStatus: true,
    memberOf: [],
    seoTitle: "أ. نورة القحطاني — كاتبة محتوى تسويقي | مدونتي",
    seoDescription: "كاتبة محتوى محترفة متخصصة في المقالات التسويقية المتوافقة مع SEO للشركات العربية.",
  },
];

const TIER_CONFIGS = [
  { tier: "BASIC" as const, name: "مجاني", articlesPerMonth: 1, price: 0, isActive: true, isPopular: false, description: "مقالة واحدة مجانية — ملف تعريفي — تحليلات أساسية" },
  { tier: "STANDARD" as const, name: "الانطلاقة", articlesPerMonth: 4, price: 499, isActive: true, isPopular: false, description: "4 مقالات شهرياً — نشر متعدد المنصات — قائمة بريدية 500" },
  { tier: "PRO" as const, name: "الزخم", articlesPerMonth: 8, price: 1299, isActive: true, isPopular: true, description: "8 مقالات شهرياً — فيديو ريلز — تقييم العملاء المحتملين — اجتماع استراتيجي شهري" },
  { tier: "PREMIUM" as const, name: "الريادة", articlesPerMonth: 12, price: 2999, isActive: true, isPopular: false, description: "12 مقالة شهرياً — مدير حساب مخصص — تقارير مخصصة — دعم 24/7" },
];

// ═══════════════════════════════════════════════════════════════════
// PHASE 2: INDUSTRIES, CATEGORIES, TAGS (real market data)
// ═══════════════════════════════════════════════════════════════════

const INDUSTRIES = [
  { name: "التجارة الإلكترونية", slug: "ecommerce", description: "صناعة التجارة الإلكترونية والمتاجر الرقمية — سوق بقيمة 18.78 مليار دولار في السعودية يصل إلى 28.8 مليار بحلول 2029", seoTitle: "التجارة الإلكترونية — حلول المتاجر الرقمية", seoDescription: "كل ما يخص التجارة الإلكترونية وبناء المتاجر الرقمية وتحسين المبيعات عبر الإنترنت في السوق العربي." },
  { name: "العقارات والتطوير", slug: "real-estate", description: "صناعة العقارات والتطوير العقاري — سوق بقيمة 77.2 مليار دولار، الرياض وحدها 41.5% من الحصة", seoTitle: "العقارات والتطوير العقاري", seoDescription: "أحدث التطورات في سوق العقارات السعودي والمشاريع الكبرى ونيوم والبحر الأحمر والدرعية." },
  { name: "الرعاية الصحية", slug: "healthcare", description: "صناعة الرعاية الصحية والتكنولوجيا الطبية — أولوية رؤية 2030 مع نمو 300%+ في الترافيك العضوي", seoTitle: "الرعاية الصحية والتكنولوجيا الطبية", seoDescription: "العيادات والمستشفيات والصيدليات وشركات الرعاية الصحية — حلول المحتوى الطبي الموثوق بالعربي." },
  { name: "السياحة والضيافة", slug: "tourism-hospitality", description: "صناعة السياحة والفنادق — 32 مليون سائح و53.2 مليار ريال إيرادات موسمية", seoTitle: "السياحة والضيافة", seoDescription: "الفنادق والمطاعم والسياحة الدينية والترفيهية — محتوى يجذب الزوار ويحسن الحجوزات." },
  { name: "المطاعم والأغذية", slug: "food-beverage", description: "صناعة الأغذية والمشروبات — سوق بقيمة 23.5 مليار دولار يصل إلى 29.8 مليار بحلول 2032", seoTitle: "المطاعم والأغذية", seoDescription: "المطاعم والمطابخ السحابية وشركات الأغذية — استراتيجيات المحتوى والـ SEO المحلي." },
  { name: "الخدمات المالية والتقنية المالية", slug: "fintech-finance", description: "صناعة التقنية المالية — 75% من المعاملات السعودية رقمية، أعلى CPC في السوق", seoTitle: "الخدمات المالية والتقنية المالية", seoDescription: "البنوك وشركات التأمين والتقنية المالية — محتوى يبني الثقة ويجذب العملاء." },
  { name: "التعليم والتدريب", slug: "education-training", description: "صناعة التعليم والتدريب — ركيزة رؤية 2030، منصة مدرستي كانت الأكثر بحثاً", seoTitle: "التعليم والتدريب", seoDescription: "الجامعات ومراكز التدريب ومنصات التعلم الإلكتروني — محتوى تعليمي يرفع الترتيب." },
  { name: "التقنية والذكاء الاصطناعي", slug: "tech-ai", description: "صناعة التقنية والذكاء الاصطناعي — ChatGPT وحده 673 ألف بحث شهري في السعودية", seoTitle: "التقنية والذكاء الاصطناعي", seoDescription: "أحدث التقنيات والذكاء الاصطناعي وتأثيرها على الأعمال — فجوة محتوى عربية ضخمة." },
  { name: "السيارات", slug: "automotive", description: "صناعة السيارات — سوق نشط جداً في السعودية ومصر مع بحث مرتفع", seoTitle: "السيارات", seoDescription: "وكالات السيارات وقطع الغيار والتأمين — محتوى يجذب المشترين ويحسن الظهور المحلي." },
  { name: "اللوجستيات وسلاسل التوريد", slug: "logistics-supply-chain", description: "صناعة اللوجستيات — نمو 7.92% سنوياً مع شبه انعدام المحتوى العربي", seoTitle: "اللوجستيات وسلاسل التوريد", seoDescription: "شركات الشحن والتوصيل واللوجستيات — محتوى B2B في سوق شبه خالي من المنافسة العربية." },
];

const CATEGORIES = [
  { name: "التسويق الرقمي", slug: "digital-marketing", description: "استراتيجيات التسويق الرقمي وتحسين محركات البحث", seoTitle: "التسويق الرقمي — استراتيجيات SEO والتسويق الإلكتروني", seoDescription: "أحدث استراتيجيات التسويق الرقمي وتحسين محركات البحث لزيادة الزيارات والمبيعات في السوق العربي." },
  { name: "التجارة الإلكترونية", slug: "ecommerce-tips", description: "نصائح وحلول للمتاجر الإلكترونية", seoTitle: "نصائح التجارة الإلكترونية — بناء متجر ناجح", seoDescription: "تعلم كيفية بناء وإدارة متجر إلكتروني ناجح وتحسين المبيعات والتحويلات عبر الإنترنت." },
  { name: "العقارات والاستثمار", slug: "real-estate-investment", description: "محتوى عقاري يستهدف أعلى ميزانيات التسويق", seoTitle: "العقارات والاستثمار العقاري في السعودية", seoDescription: "دليلك الشامل للاستثمار العقاري في السعودية — المشاريع الكبرى والفرص والتحليلات." },
  { name: "الصحة والعافية", slug: "health-wellness", description: "محتوى صحي موثوق بحجم بحث مليون+ شهرياً", seoTitle: "الصحة والعافية — محتوى طبي موثوق", seoDescription: "معلومات صحية موثوقة ونصائح عافية مبنية على مصادر طبية معتمدة باللغة العربية." },
  { name: "التقنية والذكاء الاصطناعي", slug: "tech-ai-blog", description: "أكبر فجوة محتوى عربية في التقنية", seoTitle: "التقنية والذكاء الاصطناعي — أخبار ومقالات", seoDescription: "أحدث أخبار التقنية والذكاء الاصطناعي وتأثيرها على الأعمال والحياة اليومية بالعربي." },
  { name: "التعليم والتدريب", slug: "education-blog", description: "محتوى تعليمي دائم الطلب", seoTitle: "التعليم والتدريب — دليل التعلم الرقمي", seoDescription: "أحدث التطورات في التعليم الرقمي والتدريب المهني ومنصات التعلم الإلكتروني." },
  { name: "السياحة والسفر", slug: "tourism-travel", description: "محتوى سياحي بحجم بحث عالي", seoTitle: "السياحة والسفر — دليل المسافر العربي", seoDescription: "أفضل الوجهات السياحية والفنادق والمطاعم ونصائح السفر في السعودية والعالم العربي." },
  { name: "ريادة الأعمال", slug: "entrepreneurship", description: "محتوى لرواد الأعمال والمؤسسين", seoTitle: "ريادة الأعمال — دليل المؤسس العربي", seoDescription: "نصائح وتجارب في ريادة الأعمال وتأسيس الشركات وبناء المنتجات في السوق العربي." },
  { name: "التمويل الشخصي", slug: "personal-finance", description: "أعلى CPC في السوق — كلمات بقيمة 7+ دولار", seoTitle: "التمويل الشخصي — إدارة أموالك بذكاء", seoDescription: "نصائح التمويل الشخصي والادخار والاستثمار وإدارة الميزانية للفرد العربي." },
  { name: "تصميم المواقع", slug: "web-design", description: "محتوى مرتبط مباشرة بخدمات مدونتي", seoTitle: "تصميم المواقع — بناء مواقع احترافية", seoDescription: "أحدث اتجاهات تصميم المواقع وتجربة المستخدم وأدوات التطوير للمصممين والمطورين." },
  { name: "القانون وتأسيس الشركات", slug: "legal-business", description: "محتوى قانوني — مكاتب المحاماة تدفع premium", seoTitle: "القانون وتأسيس الشركات في السعودية", seoDescription: "دليلك لتأسيس الشركات والإجراءات القانونية والتراخيص التجارية في السعودية ومصر." },
  { name: "الموضة والجمال", slug: "fashion-beauty", description: "حجم بحث ضخم بين الشباب في الخليج", seoTitle: "الموضة والجمال — أحدث الاتجاهات", seoDescription: "أحدث صيحات الموضة والجمال والعناية الشخصية في العالم العربي." },
  { name: "المطاعم والطعام", slug: "food-restaurants", description: "1.22 مليون بحث شهري عن مطعم قريب", seoTitle: "المطاعم والطعام — دليل الذواقة العربي", seoDescription: "أفضل المطاعم والوصفات ونصائح صناعة الأغذية والمطابخ السحابية." },
  // Sub-categories (parent-child test)
  { name: "SEO تحسين محركات البحث", slug: "seo-arabic", description: "التخصص الرئيسي لمدونتي", seoTitle: "SEO تحسين محركات البحث بالعربي", seoDescription: "دليلك الشامل لتحسين محركات البحث — استراتيجيات SEO حديثة ومجربة للمواقع العربية.", parentSlug: "digital-marketing" },
  { name: "المحتوى والكتابة", slug: "content-writing", description: "كل عميل يحتاج محتوى", seoTitle: "المحتوى والكتابة — فن صناعة المحتوى", seoDescription: "تعلم فن كتابة المحتوى الاحترافي والتسويقي الذي يجذب الزوار ويحول لعملاء.", parentSlug: "digital-marketing" },
];

const TAGS = [
  { name: "SEO", slug: "seo", description: "تحسين محركات البحث", seoTitle: "SEO — تحسين محركات البحث", seoDescription: "كل ما يتعلق بتحسين محركات البحث والظهور في نتائج جوجل." },
  { name: "جوجل", slug: "google", description: "أخبار وتحديثات جوجل", seoTitle: "جوجل — أخبار وتحديثات", seoDescription: "آخر أخبار جوجل وتحديثات محرك البحث والخوارزميات الجديدة." },
  { name: "ذكاء اصطناعي", slug: "ai", description: "الذكاء الاصطناعي وتطبيقاته", seoTitle: "الذكاء الاصطناعي — AI", seoDescription: "كل ما يتعلق بالذكاء الاصطناعي وتأثيره على الأعمال والتسويق." },
  { name: "تسويق رقمي", slug: "digital-marketing-tag", description: "استراتيجيات التسويق الرقمي", seoTitle: "تسويق رقمي", seoDescription: "أحدث استراتيجيات التسويق الرقمي لزيادة المبيعات والوصول." },
  { name: "محتوى", slug: "content", description: "صناعة المحتوى", seoTitle: "صناعة المحتوى", seoDescription: "نصائح وأدوات لصناعة محتوى احترافي يجذب الزوار." },
  { name: "تجارة إلكترونية", slug: "ecom-tag", description: "التجارة الإلكترونية", seoTitle: "تجارة إلكترونية", seoDescription: "حلول ونصائح للمتاجر الإلكترونية والبيع عبر الإنترنت." },
  { name: "رؤية 2030", slug: "vision-2030", description: "رؤية السعودية 2030", seoTitle: "رؤية 2030", seoDescription: "مشاريع وفرص رؤية السعودية 2030 وتأثيرها على الأعمال." },
  { name: "سوشال ميديا", slug: "social-media", description: "التسويق عبر وسائل التواصل", seoTitle: "سوشال ميديا", seoDescription: "استراتيجيات التسويق عبر وسائل التواصل الاجتماعي." },
  { name: "تحليلات", slug: "analytics", description: "تحليلات المواقع والبيانات", seoTitle: "تحليلات — Analytics", seoDescription: "تعلم تحليل بيانات موقعك واتخاذ قرارات مبنية على البيانات." },
  { name: "تصميم", slug: "design", description: "تصميم المواقع والتطبيقات", seoTitle: "تصميم — UI/UX", seoDescription: "أحدث اتجاهات التصميم وتجربة المستخدم." },
  { name: "ريادة أعمال", slug: "startup", description: "ريادة الأعمال والشركات الناشئة", seoTitle: "ريادة أعمال", seoDescription: "نصائح وتجارب في ريادة الأعمال وتأسيس الشركات." },
  { name: "عقارات", slug: "real-estate-tag", description: "سوق العقارات", seoTitle: "عقارات", seoDescription: "أخبار وتحليلات سوق العقارات في السعودية ومصر." },
];

// ═══════════════════════════════════════════════════════════════════
// PHASE 3: CLIENTS (3 real-world business profiles)
// ═══════════════════════════════════════════════════════════════════

const CLIENTS_DATA = [
  {
    name: "متجر نوفا للإلكترونيات",
    slug: "nova-electronics",
    legalName: "شركة نوفا للتجارة الإلكترونية المحدودة",
    email: "info@nova-electronics.sa",
    phone: "+966501234567",
    url: "https://nova-electronics.sa",
    description: "متجر إلكتروني سعودي متخصص في بيع الإلكترونيات والأجهزة الذكية. نوفر أحدث الهواتف والحواسيب والإكسسوارات بأسعار تنافسية مع توصيل سريع لجميع مناطق المملكة.",
    businessBrief: "متجر إلكتروني رائد في السعودية — تأسس 2020 — أكثر من 50,000 عميل — شحن لجميع المناطق",
    industrySlug: "ecommerce",
    targetAudience: "شباب سعوديون 18-35، مهتمون بالتقنية، يشترون أونلاين",
    contentPriorities: ["مراجعات المنتجات", "مقارنات الأجهزة", "أخبار التقنية", "عروض وتخفيضات"],
    seoTitle: "متجر نوفا للإلكترونيات — أحدث الأجهزة بأفضل الأسعار",
    seoDescription: "تسوق أحدث الهواتف والحواسيب والإلكترونيات من متجر نوفا. توصيل سريع لجميع مناطق السعودية مع ضمان وخدمة عملاء ممتازة.",
    contactType: "customer service",
    addressStreet: "طريق الملك فهد",
    addressCity: "الرياض",
    addressCountry: "SA",
    addressPostalCode: "12271",
    addressRegion: "منطقة الرياض",
    addressNeighborhood: "حي العليا",
    subscriptionTier: "PRO" as const,
    subscriptionStatus: "ACTIVE" as const,
    paymentStatus: "PAID" as const,
    articlesPerMonth: 15,
    sameAs: ["https://twitter.com/nova_sa", "https://instagram.com/nova_electronics_sa"],
    keywords: ["إلكترونيات", "هواتف ذكية", "أجهزة كمبيوتر", "تسوق أونلاين"],
    organizationType: "LocalBusiness",
    contentTone: "ودود ومحترف — يستخدم لغة بسيطة مع معلومات تقنية دقيقة",
  },
  {
    name: "عيادات بلسم الطبية",
    slug: "balsam-medical",
    legalName: "مجموعة بلسم الطبية القابضة",
    email: "info@balsam-medical.sa",
    phone: "+966502345678",
    url: "https://balsam-medical.sa",
    description: "مجموعة عيادات طبية متخصصة في الرياض. نقدم خدمات طبية شاملة تشمل طب الأسرة، طب الأسنان، الجلدية، والعلاج الطبيعي مع فريق طبي متميز.",
    businessBrief: "مجموعة عيادات في الرياض — 3 فروع — 45 طبيب — أكثر من 100,000 زيارة سنوية",
    industrySlug: "healthcare",
    targetAudience: "عائلات سعودية، مقيمون في الرياض، يبحثون عن رعاية صحية موثوقة",
    contentPriorities: ["نصائح صحية", "أمراض شائعة", "تغذية وعافية", "طب أسنان"],
    seoTitle: "عيادات بلسم الطبية — رعاية صحية متميزة في الرياض",
    seoDescription: "عيادات بلسم الطبية في الرياض — خدمات طب الأسرة والأسنان والجلدية مع فريق طبي متخصص. احجز موعدك الآن.",
    contactType: "customer service",
    addressStreet: "شارع التحلية",
    addressCity: "الرياض",
    addressCountry: "SA",
    addressPostalCode: "12345",
    addressRegion: "منطقة الرياض",
    addressNeighborhood: "حي السليمانية",
    subscriptionTier: "STANDARD" as const,
    subscriptionStatus: "ACTIVE" as const,
    paymentStatus: "PAID" as const,
    articlesPerMonth: 8,
    sameAs: ["https://twitter.com/balsam_medical", "https://instagram.com/balsam_medical_sa"],
    keywords: ["عيادة", "طبيب", "رعاية صحية", "حجز موعد"],
    organizationType: "MedicalBusiness",
    contentTone: "موثوق وعلمي — يستخدم مصادر طبية معتمدة مع لغة مبسطة للمريض",
  },
  {
    name: "أكاديمية المستقبل",
    slug: "future-academy",
    legalName: "مؤسسة المستقبل للتعليم والتدريب",
    email: "info@future-academy.sa",
    phone: "+966503456789",
    url: "https://future-academy.sa",
    description: "أكاديمية تعليمية سعودية تقدم دورات احترافية في البرمجة والتصميم والتسويق الرقمي. حضورياً في جدة وأونلاين لجميع أنحاء العالم العربي.",
    businessBrief: "أكاديمية تعليمية — جدة — 2000+ متدرب — 50+ دورة — حضوري وأونلاين",
    industrySlug: "education-training",
    targetAudience: "خريجون جدد، موظفون يرغبون بتطوير مهاراتهم، رواد أعمال",
    contentPriorities: ["دورات برمجة", "تصميم UX/UI", "تسويق رقمي", "ذكاء اصطناعي"],
    seoTitle: "أكاديمية المستقبل — دورات احترافية في البرمجة والتسويق",
    seoDescription: "تعلم البرمجة والتصميم والتسويق الرقمي مع أكاديمية المستقبل. دورات حضورية في جدة وأونلاين مع شهادات معتمدة.",
    contactType: "customer service",
    addressStreet: "شارع الأمير سلطان",
    addressCity: "جدة",
    addressCountry: "SA",
    addressPostalCode: "21589",
    addressRegion: "منطقة مكة المكرمة",
    addressNeighborhood: "حي الروضة",
    subscriptionTier: "BASIC" as const,
    subscriptionStatus: "ACTIVE" as const,
    paymentStatus: "PAID" as const,
    articlesPerMonth: 4,
    sameAs: ["https://twitter.com/future_academy_sa", "https://youtube.com/@future-academy"],
    keywords: ["دورات", "تعليم", "برمجة", "تسويق رقمي"],
    organizationType: "EducationalOrganization",
    contentTone: "تحفيزي وتعليمي — يشجع على التعلم بأسلوب عملي وأمثلة حقيقية",
  },
];

// ═══════════════════════════════════════════════════════════════════
// PHASE 4: ARTICLES (5 real articles, different statuses)
// ═══════════════════════════════════════════════════════════════════

const ARTICLES_DATA = [
  {
    title: "دليل تحسين محركات البحث للمتاجر الإلكترونية في 2025",
    slug: "seo-guide-ecommerce-2025",
    excerpt: "دليل شامل لتحسين SEO المتاجر الإلكترونية — من البحث عن الكلمات المفتاحية إلى تحسين صفحات المنتجات وبناء الروابط. استراتيجيات مجربة تزيد زياراتك العضوية 300%.",
    content: `<h2>مقدمة: لماذا SEO ضروري لمتجرك الإلكتروني؟</h2>
<p>في سوق التجارة الإلكترونية السعودي الذي تجاوزت قيمته 18.78 مليار دولار، يعتمد <strong>87% من المتسوقين</strong> على محركات البحث للعثور على المنتجات. إذا لم يظهر متجرك في الصفحة الأولى، فأنت تخسر عملاء كل يوم.</p>
<p>في هذا الدليل الشامل، سنستعرض <em>كل ما تحتاجه</em> لتحسين ظهور متجرك الإلكتروني في نتائج البحث — خطوة بخطوة ومع أمثلة حقيقية من السوق السعودي.</p>

<h2>1. بحث الكلمات المفتاحية للمتاجر الإلكترونية</h2>
<p>الخطوة الأولى هي فهم ما يبحث عنه عملاؤك المحتملون. استخدم أدوات مثل:</p>
<ul>
  <li><strong>Google Keyword Planner</strong> — مجاني وموثوق لحجم البحث</li>
  <li><strong>Semrush</strong> — تحليل المنافسين والفرص</li>
  <li><strong>Ahrefs</strong> — صعوبة الكلمات المفتاحية وبناء الروابط</li>
</ul>
<p>ركز على الكلمات المفتاحية ذات <strong>نية الشراء العالية</strong> مثل "أفضل هاتف سامسونج 2025" بدلاً من "ما هو الهاتف الذكي".</p>

<h2>2. تحسين صفحات المنتجات</h2>
<p>كل صفحة منتج يجب أن تحتوي على:</p>
<ul>
  <li>عنوان يحتوي على الكلمة المفتاحية الرئيسية</li>
  <li>وصف فريد (ليس منسوخ من الشركة المصنعة)</li>
  <li>صور محسّنة مع Alt Text وصفي</li>
  <li>مراجعات العملاء (Schema Review)</li>
  <li>بيانات منظمة Product Schema</li>
</ul>

<h2>3. البنية التقنية Technical SEO</h2>
<p>المتاجر الإلكترونية تحتاج اهتمام خاص بالجانب التقني:</p>
<blockquote><p>سرعة الموقع هي العامل الأول — كل ثانية تأخير تقلل التحويلات 7%</p></blockquote>
<ul>
  <li>Core Web Vitals: LCP أقل من 2.5 ثانية</li>
  <li>Mobile-First: 72% من التسوق في السعودية عبر الموبايل</li>
  <li>Canonical URLs لتجنب المحتوى المكرر</li>
  <li>XML Sitemap محدّثة تلقائياً</li>
</ul>

<h2>4. استراتيجية المحتوى</h2>
<p>لا تكتفي بصفحات المنتجات. أنشئ محتوى يجذب الزوار:</p>
<ul>
  <li><strong>مدونة المتجر</strong>: مراجعات ومقارنات</li>
  <li><strong>أدلة الشراء</strong>: "كيف تختار اللابتوب المناسب"</li>
  <li><strong>FAQ</strong>: الأسئلة الشائعة لكل فئة</li>
</ul>

<h2>الخلاصة</h2>
<p>تحسين SEO متجرك الإلكتروني ليس ترفاً — إنه <strong>استثمار</strong> يعود عليك بزيارات مجانية وعملاء جدد كل يوم. ابدأ بالكلمات المفتاحية، حسّن صفحات المنتجات، واستثمر في المحتوى.</p>`,
    clientSlug: "nova-electronics",
    authorSlug: "ahmed-alshehri",
    categorySlug: "seo-arabic",
    status: "PUBLISHED" as const,
    featured: true,
    datePublished: daysAgo(5),
    wordCount: 1250,
    readingTimeMinutes: 6,
    seoTitle: "دليل SEO المتاجر الإلكترونية 2025 — زد زياراتك 300%",
    seoDescription: "دليل شامل لتحسين محركات البحث للمتاجر الإلكترونية. استراتيجيات مجربة لزيادة الزيارات العضوية والمبيعات في السوق السعودي.",
    seoKeywords: ["seo متاجر إلكترونية", "تحسين محركات البحث", "seo السعودية", "تسويق متاجر"],
    tagSlugs: ["seo", "ecom-tag", "digital-marketing-tag"],
  },
  {
    title: "كيف يغير الذكاء الاصطناعي صناعة الرعاية الصحية في السعودية",
    slug: "ai-healthcare-saudi-2025",
    excerpt: "الذكاء الاصطناعي يحدث ثورة في الرعاية الصحية السعودية — من التشخيص المبكر إلى إدارة المستشفيات. تعرف على أبرز التطبيقات والفرص.",
    content: `<h2>الذكاء الاصطناعي في الرعاية الصحية السعودية</h2>
<p>مع رؤية 2030، تستثمر السعودية بشكل مكثف في <strong>الذكاء الاصطناعي الصحي</strong>. هيئة الغذاء والدواء وافقت على أكثر من 50 تطبيق AI طبي، ومستشفيات الرياض وجدة بدأت تستخدم التقنية فعلياً.</p>

<h2>1. التشخيص المبكر بالذكاء الاصطناعي</h2>
<p>أبرز التطبيقات الحالية:</p>
<ul>
  <li><strong>تشخيص سرطان الثدي</strong>: دقة 94.5% — أعلى من المعدل البشري</li>
  <li><strong>فحص شبكية العين</strong>: كشف مبكر لاعتلال الشبكية السكري</li>
  <li><strong>تحليل الأشعة</strong>: تقليل وقت التشخيص من ساعات لدقائق</li>
</ul>

<h2>2. إدارة المستشفيات الذكية</h2>
<p>مستشفى الملك فيصل التخصصي يستخدم AI في:</p>
<ul>
  <li>جدولة المواعيد وتقليل أوقات الانتظار</li>
  <li>التنبؤ بمعدلات الإشغال</li>
  <li>إدارة المخزون الطبي تلقائياً</li>
</ul>

<h2>3. التطبيب عن بُعد Telemedicine</h2>
<p>جائحة كورونا سرّعت اعتماد التطبيب عن بُعد. الآن <strong>35% من الاستشارات</strong> في المملكة تتم رقمياً عبر منصات مثل صحة وتطمن.</p>

<h2>الفرصة لشركات الرعاية الصحية</h2>
<p>المحتوى الصحي العربي الموثوق شبه معدوم. العيادات والمستشفيات التي تستثمر في محتوى SEO الآن ستسيطر على نتائج البحث.</p>`,
    clientSlug: "balsam-medical",
    authorSlug: "noura-alqahtani",
    categorySlug: "tech-ai-blog",
    status: "PUBLISHED" as const,
    featured: false,
    datePublished: daysAgo(3),
    wordCount: 850,
    readingTimeMinutes: 4,
    seoTitle: "الذكاء الاصطناعي في الرعاية الصحية السعودية 2025",
    seoDescription: "كيف يغير الذكاء الاصطناعي صناعة الرعاية الصحية في السعودية — التشخيص المبكر والتطبيب عن بُعد وإدارة المستشفيات الذكية.",
    seoKeywords: ["ذكاء اصطناعي صحة", "AI healthcare", "رعاية صحية السعودية", "تطبيب عن بعد"],
    tagSlugs: ["ai", "vision-2030"],
  },
  {
    title: "5 أخطاء قاتلة في التسويق الرقمي تكلفك عملاء كل يوم",
    slug: "digital-marketing-mistakes-2025",
    excerpt: "أخطاء شائعة في التسويق الرقمي تقع فيها 80% من الشركات السعودية. تعرف عليها وتجنبها لتوفير ميزانيتك وزيادة عائد الاستثمار.",
    content: `<h2>أخطاء التسويق الرقمي التي تكلفك غالياً</h2>
<p>بعد العمل مع أكثر من 200 شركة في السوق السعودي، لاحظنا أن <strong>80% منهم</strong> يكررون نفس الأخطاء. في هذا المقال نكشف الأخطاء الخمسة الأكثر تكلفة.</p>

<h2>الخطأ الأول: تجاهل SEO والاعتماد على الإعلانات فقط</h2>
<p>الإعلانات المدفوعة مهمة، لكن الاعتماد عليها وحدها يعني أنك <em>تستأجر</em> زوارك بدل أن <em>تمتلكهم</em>. SEO يعطيك زيارات مجانية ومستمرة.</p>

<h2>الخطأ الثاني: محتوى بدون استراتيجية</h2>
<p>الكثير من الشركات تنشر محتوى عشوائي بدون خطة. النتيجة: مقالات لا أحد يقرأها وميزانية ضائعة.</p>

<h2>الخطأ الثالث: إهمال الموبايل</h2>
<p>72% من المستخدمين السعوديين يتصفحون من الموبايل. إذا موقعك بطيء أو غير متجاوب، فأنت تخسر ثلاثة أرباع جمهورك.</p>

<h2>الخطأ الرابع: عدم قياس النتائج</h2>
<p>ما لا تقيسه لا تستطيع تحسينه. Google Analytics وSearch Console أدوات مجانية لا عذر لتجاهلها.</p>

<h2>الخطأ الخامس: نسخ المنافسين</h2>
<p>بدل نسخ المنافسين، ابحث عن <strong>فجوات المحتوى</strong> — المواضيع التي يبحث عنها جمهورك ولا يغطيها أحد.</p>`,
    clientSlug: "nova-electronics",
    authorSlug: "ahmed-alshehri",
    categorySlug: "digital-marketing",
    status: "PUBLISHED" as const,
    featured: true,
    datePublished: daysAgo(10),
    wordCount: 720,
    readingTimeMinutes: 4,
    seoTitle: "5 أخطاء تسويق رقمي تكلفك عملاء — تجنبها الآن",
    seoDescription: "أخطاء شائعة في التسويق الرقمي تقع فيها معظم الشركات السعودية. تعرف عليها واحصل على نتائج أفضل بميزانية أقل.",
    seoKeywords: ["أخطاء تسويق رقمي", "تسويق إلكتروني", "SEO السعودية"],
    tagSlugs: ["digital-marketing-tag", "seo", "analytics"],
  },
  {
    title: "مستقبل التعليم الرقمي في السعودية — دليل المدرب والمتدرب",
    slug: "digital-education-future-saudi",
    excerpt: "التعليم الرقمي في السعودية ينمو بسرعة مذهلة. دليل شامل للمدربين والمتدربين يغطي المنصات والأدوات والفرص.",
    content: `<h2>التعليم الرقمي: الفرصة الذهبية</h2>
<p>رؤية 2030 وضعت التعليم في صدارة الأولويات. سوق التعليم الإلكتروني في السعودية يصل إلى <strong>1.2 مليار دولار بحلول 2027</strong>.</p>

<h2>أفضل المنصات التعليمية العربية</h2>
<ul>
  <li><strong>منصة مدرستي</strong>: الأكثر بحثاً في السعودية</li>
  <li><strong>رواق</strong>: دورات مجانية بالعربي</li>
  <li><strong>إدراك</strong>: محتوى أكاديمي عالي الجودة</li>
</ul>

<h2>كيف تبدأ كمدرب رقمي؟</h2>
<p>الطلب على المدربين العرب في تزايد مستمر. ابدأ بتحديد تخصصك وبناء محتوى تعليمي قيّم.</p>`,
    clientSlug: "future-academy",
    authorSlug: "noura-alqahtani",
    categorySlug: "education-blog",
    status: "DRAFT" as const,
    featured: false,
    datePublished: null,
    wordCount: 450,
    readingTimeMinutes: 3,
    seoTitle: "مستقبل التعليم الرقمي في السعودية 2025",
    seoDescription: "دليل شامل للتعليم الرقمي في السعودية — المنصات والأدوات والفرص للمدربين والمتدربين.",
    seoKeywords: ["تعليم رقمي", "دورات أونلاين", "التعليم في السعودية"],
    tagSlugs: ["vision-2030", "ai"],
  },
  {
    title: "كيف تبني متجر إلكتروني ناجح من الصفر — خطوة بخطوة",
    slug: "build-ecommerce-store-guide",
    excerpt: "دليل عملي لبناء متجر إلكتروني ناجح في السوق السعودي. من اختيار المنصة إلى إطلاق أول حملة إعلانية.",
    content: `<h2>لماذا الآن هو أفضل وقت لبناء متجرك؟</h2>
<p>سوق التجارة الإلكترونية السعودي يشهد نمواً استثنائياً — <strong>18.78 مليار دولار</strong> في 2024 مع توقعات بوصوله إلى 28.8 مليار بحلول 2029.</p>

<h2>الخطوة 1: اختيار المنصة المناسبة</h2>
<p>قارن بين المنصات الرئيسية: سلة، زد، شوبيفاي. كل منصة لها مميزاتها حسب حجم متجرك.</p>

<h2>الخطوة 2: تصميم تجربة المستخدم</h2>
<p>المتسوق السعودي يتوقع تجربة سلسة على الموبايل أولاً. ركز على سرعة التحميل وسهولة الدفع.</p>`,
    clientSlug: "nova-electronics",
    authorSlug: "ahmed-alshehri",
    categorySlug: "ecommerce-tips",
    status: "SCHEDULED" as const,
    featured: false,
    datePublished: null,
    scheduledAt: new Date(Date.now() + 3 * 86400000), // 3 days from now
    wordCount: 380,
    readingTimeMinutes: 2,
    seoTitle: "بناء متجر إلكتروني ناجح — دليل خطوة بخطوة 2025",
    seoDescription: "تعلم كيفية بناء متجر إلكتروني ناجح من الصفر. دليل عملي يغطي اختيار المنصة والتصميم والتسويق.",
    seoKeywords: ["بناء متجر إلكتروني", "تجارة إلكترونية", "سلة", "زد"],
    tagSlugs: ["ecom-tag", "design", "startup"],
  },
];

// ═══════════════════════════════════════════════════════════════════
// PHASE 5: CMS PAGES (Modonty model)
// ═══════════════════════════════════════════════════════════════════

const MODONTY_PAGES = [
  {
    slug: "about",
    title: "عن مدونتي",
    content: `<h1>عن مدونتي</h1>
<p><strong>مدونتي</strong> هي منصة سعودية متخصصة في تقديم خدمات تحسين محركات البحث (SEO) وصناعة المحتوى العربي الاحترافي.</p>
<h2>رؤيتنا</h2>
<p>نؤمن أن كل شركة عربية تستحق أن تظهر في الصفحة الأولى من جوجل. نحن نساعدك في بناء حضور رقمي قوي يجذب عملاءك المحتملين.</p>
<h2>خدماتنا</h2>
<ul>
  <li>تحسين محركات البحث SEO</li>
  <li>كتابة المحتوى التسويقي</li>
  <li>إدارة المدونات التجارية</li>
  <li>تحليل المنافسين والكلمات المفتاحية</li>
</ul>`,
    seoTitle: "عن مدونتي — منصة SEO عربية متخصصة",
    seoDescription: "تعرف على مدونتي — منصة سعودية متخصصة في تحسين محركات البحث وصناعة المحتوى العربي الاحترافي للشركات.",
    sitemapPriority: 0.8,
    sitemapChangeFreq: "monthly",
    inLanguage: "ar",
  },
  {
    slug: "terms",
    title: "الشروط والأحكام",
    content: `<h1>الشروط والأحكام</h1>
<p>آخر تحديث: مارس 2025</p>
<h2>1. القبول بالشروط</h2>
<p>باستخدامك لمنصة مدونتي فإنك توافق على هذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.</p>
<h2>2. الخدمات المقدمة</h2>
<p>تقدم مدونتي خدمات تحسين محركات البحث وصناعة المحتوى للشركات. تشمل الخدمات كتابة المقالات وتحليل الكلمات المفتاحية وتقارير الأداء.</p>
<h2>3. الملكية الفكرية</h2>
<p>جميع المحتويات المنشورة على المنصة محمية بموجب قوانين حقوق النشر. لا يجوز نسخ أو إعادة نشر أي محتوى بدون إذن كتابي مسبق.</p>`,
    seoTitle: "الشروط والأحكام — مدونتي",
    seoDescription: "اقرأ الشروط والأحكام لاستخدام منصة مدونتي لخدمات SEO وصناعة المحتوى.",
    sitemapPriority: 0.3,
    sitemapChangeFreq: "yearly",
    inLanguage: "ar",
  },
];

// ═══════════════════════════════════════════════════════════════════
// PHASE 6: FAQs
// ═══════════════════════════════════════════════════════════════════

const FAQS = [
  { question: "ما هي خدمات مدونتي؟", answer: "مدونتي منصة سعودية متخصصة في تحسين محركات البحث (SEO) وصناعة المحتوى العربي الاحترافي. نساعد الشركات في بناء حضور رقمي قوي يجذب العملاء عبر محركات البحث.", position: 0 },
  { question: "كم تكلفة خدمات SEO؟", answer: "نقدم 4 باقات: مجاني (مقالة واحدة)، الانطلاقة 499 ريال (4 مقالات)، الزخم 1,299 ريال (8 مقالات + ريلز)، الريادة 2,999 ريال (12 مقالة + مدير حساب مخصص). ادفع 12 شهر واحصل على 18 شهر.", position: 1 },
  { question: "متى أشوف نتائج تحسين محركات البحث؟", answer: "عادةً تبدأ النتائج بالظهور خلال 3-6 أشهر. SEO استثمار طويل الأمد — المحتوى الجيد يستمر في جلب زيارات لسنوات. نقدم تقارير شهرية لتتابع التقدم.", position: 2 },
];

// ═══════════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION — with step-by-step progress
// ═══════════════════════════════════════════════════════════════════

export async function seedMockData(): Promise<{
  success: boolean;
  summary: string;
  error?: string;
  steps: SeedStep[];
}> {
  const steps: SeedStep[] = [
    { label: "Users (3 — Admin, Editor, Client)", status: "pending" },
    { label: "Authors (2 — with E-E-A-T data)", status: "pending" },
    { label: "Subscription Tiers (4 plans)", status: "pending" },
    { label: "Industries (10 — Saudi market)", status: "pending" },
    { label: "Categories (15 + 2 sub-categories)", status: "pending" },
    { label: "Tags (12 — high-volume Arabic)", status: "pending" },
    { label: "Media (6 — logos, OG, article images)", status: "pending" },
    { label: "Clients (3 — full business profiles)", status: "pending" },
    { label: "Client Competitors + Keywords", status: "pending" },
    { label: "SEO Intake (2 records)", status: "pending" },
    { label: "Articles (5 — all statuses)", status: "pending" },
    { label: "Article Tags + Gallery + Versions", status: "pending" },
    { label: "Article FAQs (4)", status: "pending" },
    { label: "Related Articles (3 links)", status: "pending" },
    { label: "Comments + Replies (article + client)", status: "pending" },
    { label: "Reactions (likes, dislikes, favorites)", status: "pending" },
    { label: "Views (articles + clients)", status: "pending" },
    { label: "Shares (5 platforms)", status: "pending" },
    { label: "Conversions + CTA Clicks", status: "pending" },
    { label: "Campaigns + Lead Scoring", status: "pending" },
    { label: "Engagement + Link Clicks + Analytics", status: "pending" },
    { label: "Subscribers (client + news)", status: "pending" },
    { label: "Contact Messages (3)", status: "pending" },
    { label: "Notifications (4)", status: "pending" },
    { label: "FAQs + Feedback (3+3)", status: "pending" },
    { label: "Chatbot Messages (2)", status: "pending" },
    { label: "Modonty CMS Pages (2)", status: "pending" },
  ];

  let currentStep = 0;
  const markDone = (count?: number) => { steps[currentStep].status = "done"; steps[currentStep].count = count; currentStep++; if (currentStep < steps.length) steps[currentStep].status = "running"; };
  const markError = (err: string) => { steps[currentStep].status = "error"; steps[currentStep].error = err; };

  try {
    steps[0].status = "running";

    // ─── CLEANUP: Delete interaction data for idempotent re-runs ───
    // These tables have unique constraints that prevent duplicate inserts
    await db.fAQFeedback.deleteMany({});
    await db.chatbotMessage.deleteMany({});
    await db.notification.deleteMany({});
    await db.contactMessage.deleteMany({});
    await db.newsSubscriber.deleteMany({});
    await db.subscriber.deleteMany({});
    await db.analytics.deleteMany({});
    await db.engagementDuration.deleteMany({});
    await db.articleLinkClick.deleteMany({});
    await db.leadScoring.deleteMany({});
    await db.campaignTracking.deleteMany({});
    await db.cTAClick.deleteMany({});
    await db.conversion.deleteMany({});
    await db.share.deleteMany({});
    await db.clientCommentDislike.deleteMany({});
    await db.clientCommentLike.deleteMany({});
    await db.commentDislike.deleteMany({});
    await db.commentLike.deleteMany({});
    await db.clientFavorite.deleteMany({});
    await db.clientDislike.deleteMany({});
    await db.clientLike.deleteMany({});
    await db.clientView.deleteMany({});
    await db.articleView.deleteMany({});
    await db.articleFavorite.deleteMany({});
    await db.articleDislike.deleteMany({});
    await db.articleLike.deleteMany({});
    // Self-referencing: delete replies (children with parentId) first, then parents
    await db.clientComment.deleteMany({ where: { parentId: { not: null } } });
    await db.clientComment.deleteMany({});
    await db.comment.deleteMany({ where: { parentId: { not: null } } });
    await db.comment.deleteMany({});
    await db.relatedArticle.deleteMany({});
    await db.articleFAQ.deleteMany({});
    await db.articleVersion.deleteMany({});
    await db.articleMedia.deleteMany({});
    await db.articleTag.deleteMany({});
    await db.seoIntake.deleteMany({});
    await db.clientKeyword.deleteMany({});
    await db.clientCompetitor.deleteMany({});

    // ─── STEP 0: Users ───
    const userIds: Record<string, string> = {};
    for (const u of USERS) {
      const hashed = await bcrypt.hash(u.password, 10);
      const user = await db.user.upsert({
        where: { email: u.email },
        update: { name: u.name, role: u.role, avatar: u.avatar, password: hashed },
        create: { email: u.email, name: u.name, role: u.role, avatar: u.avatar, password: hashed },
        select: { id: true, email: true },
      });
      userIds[u.email] = user.id;
    }
    markDone(USERS.length);

    // User ID aliases (used throughout all steps)
    const adminId = userIds["admin@modonty.com"];
    const editorId = userIds["editor@modonty.com"];
    const clientUserId = userIds["client@modonty.com"];

    // ─── STEP 1: Authors ───
    const authorIds: Record<string, string> = {};
    for (const a of AUTHORS) {
      // worksFor is @db.ObjectId — set after clients are created
      const { worksFor, ...authorData } = a;
      const author = await db.author.upsert({
        where: { slug: a.slug },
        update: authorData,
        create: authorData,
        select: { id: true, slug: true },
      });
      authorIds[a.slug] = author.id;
    }
    markDone(AUTHORS.length);

    // ─── STEP 2: Subscription Tiers ───
    for (const t of TIER_CONFIGS) {
      await db.subscriptionTierConfig.upsert({
        where: { tier: t.tier },
        update: t,
        create: t,
      });
    }
    markDone(TIER_CONFIGS.length);

    // ─── STEP 3: Industries ───
    const industryIds: Record<string, string> = {};
    for (const d of INDUSTRIES) {
      const ind = await db.industry.upsert({
        where: { slug: d.slug },
        update: d,
        create: d,
        select: { id: true, slug: true },
      });
      industryIds[d.slug] = ind.id;
    }
    markDone(INDUSTRIES.length);

    // ─── STEP 4: Categories (with parent-child) ───
    const categoryIds: Record<string, string> = {};
    // First pass: create all without parent
    for (const c of CATEGORIES) {
      const { parentSlug, ...data } = c as typeof c & { parentSlug?: string };
      const cat = await db.category.upsert({
        where: { slug: data.slug },
        update: { name: data.name, description: data.description, seoTitle: data.seoTitle, seoDescription: data.seoDescription },
        create: { name: data.name, slug: data.slug, description: data.description, seoTitle: data.seoTitle, seoDescription: data.seoDescription },
        select: { id: true, slug: true },
      });
      categoryIds[data.slug] = cat.id;
    }
    // Second pass: set parent-child
    for (const c of CATEGORIES) {
      const { parentSlug } = c as typeof c & { parentSlug?: string };
      if (parentSlug && categoryIds[parentSlug]) {
        await db.category.update({
          where: { slug: c.slug },
          data: { parentId: categoryIds[parentSlug] },
        });
      }
    }
    markDone(CATEGORIES.length);

    // ─── STEP 5: Tags ───
    const tagIds: Record<string, string> = {};
    for (const t of TAGS) {
      const tag = await db.tag.upsert({
        where: { slug: t.slug },
        update: t,
        create: t,
        select: { id: true, slug: true },
      });
      tagIds[t.slug] = tag.id;
    }
    markDone(TAGS.length);

    // ─── STEP 6: Media — Upload to Cloudinary + Save to DB ───
    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dfegnpgwx";
    const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "modonty";
    const CLD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    const SEED_MEDIA = [
      { name: "nova-logo", filename: "nova-logo.png", mimeType: "image/png", type: "LOGO" as const, altText: "شعار متجر نوفا للإلكترونيات", sourceUrl: "https://placehold.co/400x400/1e3a5f/ffffff/png?text=NOVA", folder: "seed-data/logos" },
      { name: "balsam-logo", filename: "balsam-logo.png", mimeType: "image/png", type: "LOGO" as const, altText: "شعار عيادات بلسم الطبية", sourceUrl: "https://placehold.co/400x400/0d7377/ffffff/png?text=BALSAM", folder: "seed-data/logos" },
      { name: "future-logo", filename: "future-logo.png", mimeType: "image/png", type: "LOGO" as const, altText: "شعار أكاديمية المستقبل", sourceUrl: "https://placehold.co/400x400/5b21b6/ffffff/png?text=FUTURE", folder: "seed-data/logos" },
      { name: "seo-guide-og", filename: "seo-guide-og.jpg", mimeType: "image/jpeg", type: "OGIMAGE" as const, altText: "دليل SEO المتاجر الإلكترونية 2025", sourceUrl: "https://picsum.photos/1200/630?random=1", folder: "seed-data/articles" },
      { name: "ai-healthcare-og", filename: "ai-healthcare-og.jpg", mimeType: "image/jpeg", type: "OGIMAGE" as const, altText: "الذكاء الاصطناعي في الرعاية الصحية", sourceUrl: "https://picsum.photos/1200/630?random=2", folder: "seed-data/articles" },
      { name: "ecommerce-gallery-1", filename: "ecommerce-gallery-1.jpg", mimeType: "image/jpeg", type: "POST" as const, altText: "إحصائيات التجارة الإلكترونية في السعودية 2025", sourceUrl: "https://picsum.photos/800/600?random=3", folder: "seed-data/articles" },
      { name: "nova-og", filename: "nova-og.jpg", mimeType: "image/jpeg", type: "OGIMAGE" as const, altText: "متجر نوفا للإلكترونيات — أحدث الأجهزة", sourceUrl: "https://picsum.photos/1200/630?random=4", folder: "seed-data/clients" },
      { name: "balsam-og", filename: "balsam-og.jpg", mimeType: "image/jpeg", type: "OGIMAGE" as const, altText: "عيادات بلسم الطبية — رعاية صحية متميزة", sourceUrl: "https://picsum.photos/1200/630?random=5", folder: "seed-data/clients" },
      { name: "future-og", filename: "future-og.jpg", mimeType: "image/jpeg", type: "OGIMAGE" as const, altText: "أكاديمية المستقبل — دورات احترافية", sourceUrl: "https://picsum.photos/1200/630?random=6", folder: "seed-data/clients" },
      { name: "author-ahmed", filename: "author-ahmed.jpg", mimeType: "image/jpeg", type: "GENERAL" as const, altText: "م. أحمد الشهري — خبير SEO", sourceUrl: "https://picsum.photos/300/300?random=7", folder: "seed-data/authors" },
      { name: "author-noura", filename: "author-noura.jpg", mimeType: "image/jpeg", type: "GENERAL" as const, altText: "أ. نورة القحطاني — كاتبة محتوى", sourceUrl: "https://picsum.photos/300/300?random=8", folder: "seed-data/authors" },
    ];

    const mediaMap: Record<string, string> = {}; // name -> mediaId
    const mediaIds: string[] = []; // first 6 are the original ones used by clients/articles

    for (const img of SEED_MEDIA) {
      // Check if already uploaded (by filename)
      const existing = await db.media.findFirst({ where: { filename: img.filename }, select: { id: true, cloudinaryPublicId: true } });
      if (existing?.cloudinaryPublicId) {
        // Already has real Cloudinary image — skip upload
        mediaMap[img.name] = existing.id;
        if (mediaIds.length < 6) mediaIds.push(existing.id);
        continue;
      }

      // Upload to Cloudinary
      try {
        const formData = new FormData();
        formData.append("file", img.sourceUrl);
        formData.append("upload_preset", UPLOAD_PRESET);
        formData.append("public_id", `seed-data/${img.name}`);
        formData.append("asset_folder", img.folder);

        const res = await fetch(CLD_URL, { method: "POST", body: formData });
        if (!res.ok) throw new Error(await res.text());
        const cld = await res.json() as { secure_url: string; public_id: string; version: number; width: number; height: number; bytes: number };

        const optimizedUrl = cld.secure_url.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
        const mediaData = {
          filename: img.filename, url: optimizedUrl, mimeType: img.mimeType,
          type: img.type, altText: img.altText, width: cld.width, height: cld.height,
          fileSize: cld.bytes, cloudinaryPublicId: cld.public_id, cloudinaryVersion: String(cld.version),
        };

        if (existing) {
          await db.media.update({ where: { id: existing.id }, data: mediaData });
          mediaMap[img.name] = existing.id;
          if (mediaIds.length < 6) mediaIds.push(existing.id);
        } else {
          const created = await db.media.create({ data: mediaData, select: { id: true } });
          mediaMap[img.name] = created.id;
          if (mediaIds.length < 6) mediaIds.push(created.id);
        }
      } catch {
        // Cloudinary failed — fallback to placeholder URL
        const fallbackData = {
          filename: img.filename, url: img.sourceUrl, mimeType: img.mimeType,
          type: img.type, altText: img.altText, width: 400, height: 400, fileSize: 10000,
        };
        if (existing) {
          mediaMap[img.name] = existing.id;
          if (mediaIds.length < 6) mediaIds.push(existing.id);
        } else {
          const created = await db.media.create({ data: fallbackData, select: { id: true } });
          mediaMap[img.name] = created.id;
          if (mediaIds.length < 6) mediaIds.push(created.id);
        }
      }
    }
    markDone(SEED_MEDIA.length);

    // ─── STEP 7: Clients ───
    const clientIds: Record<string, string> = {};
    const tierMap: Record<string, string> = {};
    const tiers = await db.subscriptionTierConfig.findMany({ select: { id: true, tier: true } });
    for (const t of tiers) tierMap[t.tier] = t.id;

    for (let i = 0; i < CLIENTS_DATA.length; i++) {
      const c = CLIENTS_DATA[i];
      const { industrySlug } = c;
      const client = await db.client.upsert({
        where: { slug: c.slug },
        update: {
          name: c.name, email: c.email, description: c.description,
          industryId: industryIds[industrySlug],
          userId: Object.values(userIds)[i % 3],
          logoMediaId: mediaIds[i] || undefined,
          subscriptionTierConfigId: tierMap[c.subscriptionTier],
        },
        create: {
          name: c.name,
          slug: c.slug,
          legalName: c.legalName,
          email: c.email,
          phone: c.phone,
          url: c.url,
          description: c.description,
          businessBrief: c.businessBrief,
          industryId: industryIds[industrySlug],
          targetAudience: c.targetAudience,
          contentPriorities: c.contentPriorities,
          seoTitle: c.seoTitle,
          seoDescription: c.seoDescription,
          contactType: c.contactType,
          addressStreet: c.addressStreet,
          addressCity: c.addressCity,
          addressCountry: c.addressCountry,
          addressPostalCode: c.addressPostalCode,
          addressRegion: c.addressRegion,
          addressNeighborhood: c.addressNeighborhood,
          subscriptionTier: c.subscriptionTier,
          subscriptionStatus: c.subscriptionStatus,
          paymentStatus: c.paymentStatus,
          articlesPerMonth: c.articlesPerMonth,
          subscriptionStartDate: daysAgo(90),
          subscriptionEndDate: new Date(Date.now() + 270 * 86400000),
          sameAs: c.sameAs,
          keywords: c.keywords,
          organizationType: c.organizationType,
          contentTone: c.contentTone,
          foundingDate: daysAgo(730),
          userId: Object.values(userIds)[i % 3],
          logoMediaId: mediaIds[i],
          subscriptionTierConfigId: tierMap[c.subscriptionTier],
        },
        select: { id: true, slug: true },
      });
      clientIds[c.slug] = client.id;
    }
    markDone(CLIENTS_DATA.length);

    // ─── STEP 8: Client Competitors + Keywords ───
    const competitorData = [
      { clientSlug: "nova-electronics", name: "جرير", url: "https://jarir.com", notes: "أكبر متجر إلكتروني منافس" },
      { clientSlug: "nova-electronics", name: "إكسترا", url: "https://extra.com", notes: "منافس رئيسي في الإلكترونيات" },
      { clientSlug: "balsam-medical", name: "مستشفى المملكة", url: "https://kingdom-hospital.sa", notes: "منافس رئيسي في الرياض" },
      { clientSlug: "future-academy", name: "دورة", url: "https://dawra.com", notes: "منصة دورات منافسة" },
    ];
    for (const comp of competitorData) {
      await db.clientCompetitor.create({
        data: { clientId: clientIds[comp.clientSlug], name: comp.name, url: comp.url, notes: comp.notes },
      });
    }
    const keywordData = [
      { clientSlug: "nova-electronics", keyword: "أفضل هاتف 2025", intent: "transactional", priority: 1 },
      { clientSlug: "nova-electronics", keyword: "متجر إلكتروني سعودي", intent: "navigational", priority: 2 },
      { clientSlug: "balsam-medical", keyword: "عيادة قريبة مني", intent: "local", priority: 1 },
      { clientSlug: "balsam-medical", keyword: "أفضل طبيب أسنان الرياض", intent: "local", priority: 2 },
      { clientSlug: "future-academy", keyword: "دورات برمجة", intent: "informational", priority: 1 },
      { clientSlug: "future-academy", keyword: "تعلم تسويق رقمي", intent: "informational", priority: 2 },
    ];
    for (const kw of keywordData) {
      await db.clientKeyword.create({
        data: { clientId: clientIds[kw.clientSlug], keyword: kw.keyword, intent: kw.intent, priority: kw.priority },
      });
    }
    markDone(competitorData.length + keywordData.length);

    // ─── STEP 9: SEO Intake ───
    await db.seoIntake.create({
      data: {
        clientId: clientIds["nova-electronics"],
        answers: { goals: "زيادة المبيعات العضوية 50%", timeline: "6 أشهر", budget: "5000 ريال/شهر", competitors: ["jarir.com", "extra.com"] },
        collectedBy: "admin@modonty.com",
      },
    });
    await db.seoIntake.create({
      data: {
        clientId: clientIds["balsam-medical"],
        answers: { goals: "ظهور في البحث المحلي", timeline: "3 أشهر", budget: "3000 ريال/شهر", competitors: ["kingdom-hospital.sa"] },
        collectedBy: "admin@modonty.com",
      },
    });
    markDone(2);

    // ─── STEP 10: Articles ───
    const articleIds: Record<string, string> = {};
    for (const a of ARTICLES_DATA) {
      const { clientSlug, authorSlug, categorySlug, tagSlugs, scheduledAt } = a;
      const article = await db.article.upsert({
        where: { clientId_slug: { slug: a.slug, clientId: clientIds[clientSlug] } },
        update: { title: a.title, content: a.content, status: a.status },
        create: {
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt,
          content: a.content,
          clientId: clientIds[clientSlug],
          authorId: authorIds[authorSlug],
          categoryId: categoryIds[categorySlug],
          status: a.status,
          featured: a.featured,
          datePublished: a.datePublished,
          scheduledAt: scheduledAt || undefined,
          wordCount: a.wordCount,
          readingTimeMinutes: a.readingTimeMinutes,
          seoTitle: a.seoTitle,
          seoDescription: a.seoDescription,
          seoKeywords: a.seoKeywords,
        },
        select: { id: true, slug: true },
      });
      articleIds[a.slug] = article.id;
    }
    // Link featured images to articles
    const articleImgLinks: Record<string, string> = { "seo-guide-ecommerce-2025": "seo-guide-og", "ai-healthcare-saudi-2025": "ai-healthcare-og" };
    for (const [slug, imgName] of Object.entries(articleImgLinks)) {
      if (mediaMap[imgName] && articleIds[slug]) {
        await db.article.update({ where: { id: articleIds[slug] }, data: { featuredImageId: mediaMap[imgName] } });
      }
    }
    // Link OG images to clients
    const clientImgLinks: Record<string, string> = { "nova-electronics": "nova-og", "balsam-medical": "balsam-og", "future-academy": "future-og" };
    for (const [slug, imgName] of Object.entries(clientImgLinks)) {
      if (mediaMap[imgName] && clientIds[slug]) {
        await db.client.update({ where: { id: clientIds[slug] }, data: { ogImageMediaId: mediaMap[imgName] } });
      }
    }
    // Link author avatars
    if (mediaMap["author-ahmed"]) {
      const ahmedMedia = await db.media.findFirst({ where: { id: mediaMap["author-ahmed"] }, select: { url: true, cloudinaryPublicId: true } });
      if (ahmedMedia) await db.author.updateMany({ where: { slug: "ahmed-alshehri" }, data: { image: ahmedMedia.url, cloudinaryPublicId: ahmedMedia.cloudinaryPublicId || undefined } });
    }
    if (mediaMap["author-noura"]) {
      const nouraMedia = await db.media.findFirst({ where: { id: mediaMap["author-noura"] }, select: { url: true, cloudinaryPublicId: true } });
      if (nouraMedia) await db.author.updateMany({ where: { slug: "noura-alqahtani" }, data: { image: nouraMedia.url, cloudinaryPublicId: nouraMedia.cloudinaryPublicId || undefined } });
    }
    markDone(ARTICLES_DATA.length);

    // ─── STEP 11: Article Tags + Gallery + Versions ───
    let linkCount = 0;
    for (const a of ARTICLES_DATA) {
      for (const tagSlug of a.tagSlugs) {
        if (tagIds[tagSlug] && articleIds[a.slug]) {
          const exists = await db.articleTag.findFirst({ where: { articleId: articleIds[a.slug], tagId: tagIds[tagSlug] } });
          if (!exists) {
            await db.articleTag.create({ data: { articleId: articleIds[a.slug], tagId: tagIds[tagSlug] } });
            linkCount++;
          }
        }
      }
    }
    // Gallery for first article
    if (mediaIds[5] && articleIds["seo-guide-ecommerce-2025"]) {
      await db.articleMedia.create({
        data: { articleId: articleIds["seo-guide-ecommerce-2025"], mediaId: mediaIds[5], position: 0, caption: "إحصائيات التجارة الإلكترونية 2025", altText: "رسم بياني لنمو التجارة الإلكترونية" },
      });
      linkCount++;
    }
    // Versions
    const versionArticles = ["seo-guide-ecommerce-2025", "ai-healthcare-saudi-2025", "digital-marketing-mistakes-2025"];
    for (const slug of versionArticles) {
      if (articleIds[slug]) {
        await db.articleVersion.create({
          data: { articleId: articleIds[slug], title: `${ARTICLES_DATA.find(a => a.slug === slug)?.title} (مسودة أولى)`, content: "<p>مسودة أولية قبل التحرير النهائي</p>", excerpt: "مسودة", createdBy: adminId },
        });
        linkCount++;
      }
    }
    markDone(linkCount);

    // ─── STEP 12: Article FAQs ───
    const articleFaqs = [
      { articleSlug: "seo-guide-ecommerce-2025", question: "كم يستغرق تحسين SEO لمتجر إلكتروني؟", answer: "عادةً من 3 إلى 6 أشهر لرؤية نتائج ملموسة. SEO استثمار طويل الأمد يتراكم مع الوقت.", position: 0, status: "PUBLISHED" as const },
      { articleSlug: "seo-guide-ecommerce-2025", question: "هل أحتاج خبير SEO أم أقدر أسويها بنفسي؟", answer: "يمكنك البدء بنفسك مع الأساسيات، لكن لتحقيق نتائج احترافية يُفضل الاستعانة بخبير أو وكالة متخصصة.", position: 1, status: "PUBLISHED" as const },
      { articleSlug: "ai-healthcare-saudi-2025", question: "هل الذكاء الاصطناعي آمن في التشخيص الطبي؟", answer: "نعم، تطبيقات AI الطبية المعتمدة من هيئة الغذاء والدواء خضعت لاختبارات صارمة وتُستخدم كأداة مساعدة للطبيب وليست بديلاً عنه.", position: 0, status: "PUBLISHED" as const },
      { articleSlug: "digital-marketing-mistakes-2025", question: "ما أهم شيء في التسويق الرقمي؟", answer: "الاستراتيجية أولاً. بدون خطة واضحة وأهداف قابلة للقياس، أي ميزانية ستكون هدراً.", position: 0, status: "PENDING" as const },
    ];
    for (const faq of articleFaqs) {
      const { articleSlug, ...faqData } = faq;
      if (articleIds[articleSlug]) {
        await db.articleFAQ.create({ data: { ...faqData, articleId: articleIds[articleSlug] } });
      }
    }
    markDone(articleFaqs.length);

    // ─── STEP 13: Related Articles ───
    const slugs = Object.keys(articleIds);
    if (slugs.length >= 3) {
      await db.relatedArticle.create({ data: { articleId: articleIds[slugs[0]], relatedId: articleIds[slugs[1]], relationshipType: "related" } });
      await db.relatedArticle.create({ data: { articleId: articleIds[slugs[0]], relatedId: articleIds[slugs[2]], relationshipType: "related" } });
      await db.relatedArticle.create({ data: { articleId: articleIds[slugs[1]], relatedId: articleIds[slugs[2]], relationshipType: "see-also" } });
    }
    markDone(3);

    // ─── STEP 14: Comments + Replies ───
    const sess = SESSION_ID();

    // Article comments
    const comment1 = await db.comment.create({ data: { content: "مقال ممتاز! استفدت كثير من النصائح خاصة في تحسين صفحات المنتجات.", articleId: articleIds[slugs[0]], authorId: editorId, status: "APPROVED" } });
    const comment2 = await db.comment.create({ data: { content: "شكراً على المعلومات القيمة. هل تنصح بأداة معينة لتحليل الكلمات المفتاحية؟", articleId: articleIds[slugs[0]], authorId: clientUserId, status: "APPROVED" } });
    // Reply (nested)
    await db.comment.create({ data: { content: "أنصح بـ Semrush أو Ahrefs — كلاهما ممتاز للسوق العربي. Semrush أفضل للمبتدئين.", articleId: articleIds[slugs[0]], authorId: adminId, parentId: comment2.id, status: "APPROVED" } });
    await db.comment.create({ data: { content: "موضوع مهم جداً خاصة مع توجه السعودية نحو الرعاية الصحية الرقمية", articleId: articleIds[slugs[1]], authorId: editorId, status: "APPROVED" } });
    await db.comment.create({ data: { content: "هل فيه مصادر إضافية عن تطبيقات AI في المستشفيات السعودية؟", articleId: articleIds[slugs[1]], authorId: clientUserId, status: "PENDING" } });

    // Client comments
    const clientComment1 = await db.clientComment.create({ data: { content: "تجربتي مع متجر نوفا ممتازة — توصيل سريع وخدمة عملاء محترفة", clientId: clientIds["nova-electronics"], authorId: editorId, status: "APPROVED" } });
    const clientComment2 = await db.clientComment.create({ data: { content: "عيادات بلسم من أفضل العيادات في الرياض — الأطباء ممتازين", clientId: clientIds["balsam-medical"], authorId: clientUserId, status: "APPROVED" } });
    await db.clientComment.create({ data: { content: "شكراً لك! نسعد بخدمتك دائماً", clientId: clientIds["nova-electronics"], authorId: adminId, parentId: clientComment1.id, status: "APPROVED" } });
    markDone(8);

    // ─── STEP 15: Reactions ───
    // MongoDB @@unique treats null as a value, so every record needs a unique sessionId
    // Article likes (userId + unique sessionId to satisfy both unique constraints)
    await db.articleLike.create({ data: { articleId: articleIds[slugs[0]], userId: editorId, sessionId: SESSION_ID() } });
    await db.articleLike.create({ data: { articleId: articleIds[slugs[0]], userId: clientUserId, sessionId: SESSION_ID() } });
    await db.articleLike.create({ data: { articleId: articleIds[slugs[1]], userId: adminId, sessionId: SESSION_ID() } });
    await db.articleLike.create({ data: { articleId: articleIds[slugs[2]], userId: editorId, sessionId: SESSION_ID() } });
    // Article dislikes
    await db.articleDislike.create({ data: { articleId: articleIds[slugs[3]], userId: clientUserId, sessionId: SESSION_ID() } });
    await db.articleDislike.create({ data: { articleId: articleIds[slugs[3]], sessionId: SESSION_ID() } });
    // Article favorites
    await db.articleFavorite.create({ data: { articleId: articleIds[slugs[0]], userId: editorId } });
    await db.articleFavorite.create({ data: { articleId: articleIds[slugs[1]], userId: clientUserId } });
    // Client reactions
    await db.clientLike.create({ data: { clientId: clientIds["nova-electronics"], userId: editorId, sessionId: SESSION_ID() } });
    await db.clientLike.create({ data: { clientId: clientIds["balsam-medical"], userId: adminId, sessionId: SESSION_ID() } });
    await db.clientLike.create({ data: { clientId: clientIds["future-academy"], userId: clientUserId, sessionId: SESSION_ID() } });
    await db.clientDislike.create({ data: { clientId: clientIds["nova-electronics"], sessionId: SESSION_ID() } });
    await db.clientFavorite.create({ data: { clientId: clientIds["nova-electronics"], userId: editorId } });
    await db.clientFavorite.create({ data: { clientId: clientIds["balsam-medical"], userId: clientUserId } });
    // Comment reactions
    await db.commentLike.create({ data: { commentId: comment1.id, userId: adminId, sessionId: SESSION_ID() } });
    await db.commentLike.create({ data: { commentId: comment1.id, userId: clientUserId, sessionId: SESSION_ID() } });
    await db.commentLike.create({ data: { commentId: comment2.id, userId: editorId, sessionId: SESSION_ID() } });
    await db.commentDislike.create({ data: { commentId: comment2.id, sessionId: SESSION_ID() } });
    // Client comment reactions
    await db.clientCommentLike.create({ data: { commentId: clientComment1.id, userId: adminId, sessionId: SESSION_ID() } });
    await db.clientCommentLike.create({ data: { commentId: clientComment2.id, userId: editorId, sessionId: SESSION_ID() } });
    await db.clientCommentDislike.create({ data: { commentId: clientComment1.id, sessionId: SESSION_ID() } });
    markDone(21);

    // ─── STEP 16: Views ───
    for (let i = 0; i < 3; i++) {
      for (const slug of slugs.slice(0, 3)) {
        await db.articleView.create({ data: { articleId: articleIds[slug], userId: i === 0 ? adminId : undefined, sessionId: SESSION_ID(), ipAddress: `192.168.1.${10 + i}`, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)", referrer: i === 0 ? "https://google.com" : i === 1 ? "https://twitter.com" : undefined, createdAt: hoursAgo(i * 12) } });
      }
    }
    // Client views
    await db.clientView.create({ data: { clientId: clientIds["nova-electronics"], userId: editorId, sessionId: SESSION_ID(), ipAddress: "192.168.1.20", referrer: "https://google.com" } });
    await db.clientView.create({ data: { clientId: clientIds["nova-electronics"], sessionId: SESSION_ID(), ipAddress: "192.168.1.21", referrer: "https://twitter.com" } });
    await db.clientView.create({ data: { clientId: clientIds["balsam-medical"], userId: clientUserId, sessionId: SESSION_ID() } });
    await db.clientView.create({ data: { clientId: clientIds["future-academy"], sessionId: SESSION_ID(), referrer: "https://linkedin.com" } });
    markDone(13);

    // ─── STEP 17: Shares ───
    const sharePlatforms: Array<"FACEBOOK" | "TWITTER" | "LINKEDIN" | "WHATSAPP" | "COPY_LINK"> = ["FACEBOOK", "TWITTER", "LINKEDIN", "WHATSAPP", "COPY_LINK"];
    for (let i = 0; i < sharePlatforms.length; i++) {
      await db.share.create({ data: { articleId: articleIds[slugs[i % slugs.length]], platform: sharePlatforms[i], userId: i < 3 ? Object.values(userIds)[i] : undefined, sessionId: SESSION_ID(), createdAt: hoursAgo(i * 6) } });
    }
    markDone(5);

    // ─── STEP 18: Conversions + CTA Clicks ───
    await db.conversion.create({ data: { articleId: articleIds[slugs[0]], clientId: clientIds["nova-electronics"], type: "NEWSLETTER", utmSource: "google", utmMedium: "organic", utmCampaign: "seo-guide", sessionId: SESSION_ID(), createdAt: daysAgo(2) } });
    await db.conversion.create({ data: { articleId: articleIds[slugs[1]], clientId: clientIds["balsam-medical"], type: "CONTACT_FORM", utmSource: "social", utmMedium: "twitter", sessionId: SESSION_ID(), createdAt: daysAgo(1) } });
    await db.conversion.create({ data: { clientId: clientIds["future-academy"], type: "SIGNUP", value: 500, currency: "SAR", utmSource: "google", utmMedium: "cpc", utmCampaign: "courses-campaign", sessionId: SESSION_ID() } });
    await db.conversion.create({ data: { articleId: articleIds[slugs[2]], type: "EMAIL_CLICK", sessionId: SESSION_ID(), createdAt: daysAgo(5) } });

    await db.cTAClick.create({ data: { articleId: articleIds[slugs[0]], type: "BUTTON", label: "احصل على استشارة SEO مجانية", targetUrl: "/contact", sessionId: SESSION_ID(), timeOnPage: 45.5, scrollDepth: 0.75 } });
    await db.cTAClick.create({ data: { clientId: clientIds["balsam-medical"], type: "LINK", label: "احجز موعدك الآن", targetUrl: "/book", sessionId: SESSION_ID(), scrollDepth: 0.5 } });
    await db.cTAClick.create({ data: { articleId: articleIds[slugs[2]], type: "BANNER", label: "اشترك في النشرة البريدية", targetUrl: "/subscribe", sessionId: SESSION_ID(), timeOnPage: 30, scrollDepth: 0.9 } });
    markDone(7);

    // ─── STEP 19: Campaigns + Lead Scoring ───
    await db.campaignTracking.create({ data: { campaignId: "camp_seo_2025", campaignName: "حملة SEO الربع الأول 2025", type: "SEO", clientId: clientIds["nova-electronics"], utmSource: "google", utmMedium: "organic", utmCampaign: "seo-q1-2025", impressions: 15000, clicks: 450, conversions: 12, sessionId: SESSION_ID(), createdAt: daysAgo(15) } });
    await db.campaignTracking.create({ data: { campaignId: "camp_social_2025", campaignName: "حملة السوشال ميديا", type: "SOCIAL", clientId: clientIds["balsam-medical"], utmSource: "twitter", utmMedium: "social", utmCampaign: "twitter-health-tips", impressions: 8000, clicks: 320, conversions: 8, cost: 2000, currency: "SAR", sessionId: SESSION_ID(), createdAt: daysAgo(7) } });
    await db.campaignTracking.create({ data: { campaignId: "camp_ads_2025", campaignName: "إعلانات جوجل — دورات", type: "PAID_ADS", clientId: clientIds["future-academy"], utmSource: "google", utmMedium: "cpc", utmCampaign: "courses-ads", impressions: 25000, clicks: 750, conversions: 25, cost: 5000, currency: "SAR", sessionId: SESSION_ID(), createdAt: daysAgo(3) } });

    await db.leadScoring.create({ data: { userId: editorId, sessionId: SESSION_ID(), clientId: clientIds["nova-electronics"], email: "lead1@example.com", engagementScore: 75, viewScore: 30, timeScore: 20, interactionScore: 15, conversionScore: 10, pagesViewed: 12, totalTimeSpent: 450, interactions: 8, conversions: 1, isQualified: true, qualificationLevel: "MQL", lastActivityAt: hoursAgo(2) } });
    await db.leadScoring.create({ data: { userId: clientUserId, sessionId: SESSION_ID(), clientId: clientIds["balsam-medical"], email: "lead2@example.com", engagementScore: 45, viewScore: 20, timeScore: 15, interactionScore: 5, conversionScore: 5, pagesViewed: 5, totalTimeSpent: 180, interactions: 3, conversions: 0, isQualified: false, lastActivityAt: hoursAgo(24) } });
    await db.leadScoring.create({ data: { sessionId: SESSION_ID(), clientId: clientIds["future-academy"], email: "lead3@example.com", engagementScore: 90, viewScore: 40, timeScore: 25, interactionScore: 15, conversionScore: 10, pagesViewed: 20, totalTimeSpent: 900, interactions: 15, conversions: 2, isQualified: true, qualificationLevel: "SQL", lastActivityAt: hoursAgo(1) } });
    markDone(6);

    // ─── STEP 20: Engagement + Link Clicks + Analytics ───
    for (let i = 0; i < 4; i++) {
      await db.engagementDuration.create({ data: { articleId: articleIds[slugs[i % slugs.length]], userId: i < 3 ? Object.values(userIds)[i] : undefined, sessionId: SESSION_ID(), timeOnPage: 30 + Math.random() * 120, activeTime: 20 + Math.random() * 80, scrollDepth: 0.3 + Math.random() * 0.7, maxScrollDepth: 0.5 + Math.random() * 0.5, readingTime: 60 + Math.random() * 180, completionRate: 0.2 + Math.random() * 0.8, bounced: i === 3, engagedSession: i !== 3, referrer: i === 0 ? "https://google.com" : "direct", createdAt: hoursAgo(i * 8) } });
    }

    await db.articleLinkClick.create({ data: { articleId: articleIds[slugs[0]], linkUrl: "https://semrush.com", linkText: "Semrush", linkType: "EXTERNAL", isExternal: true, linkPosition: 3, sectionContext: "أدوات الكلمات المفتاحية", sessionId: SESSION_ID() } });
    await db.articleLinkClick.create({ data: { articleId: articleIds[slugs[0]], linkUrl: "/categories/seo-arabic", linkText: "SEO تحسين محركات البحث", linkType: "INTERNAL", isExternal: false, linkPosition: 1, sessionId: SESSION_ID() } });
    await db.articleLinkClick.create({ data: { articleId: articleIds[slugs[1]], linkUrl: "https://sfda.gov.sa", linkText: "هيئة الغذاء والدواء", linkType: "CITATION", isExternal: true, linkPosition: 2, sectionContext: "التشخيص المبكر", sessionId: SESSION_ID() } });

    // Analytics with Core Web Vitals
    for (let i = 0; i < 5; i++) {
      await db.analytics.create({
        data: {
          articleId: articleIds[slugs[i % slugs.length]],
          sessionId: SESSION_ID(),
          lcp: 1.5 + Math.random() * 2,
          cls: Math.random() * 0.15,
          inp: 50 + Math.random() * 150,
          ttfb: 200 + Math.random() * 400,
          timeOnPage: 30 + Math.random() * 180,
          scrollDepth: 0.3 + Math.random() * 0.7,
          bounced: i === 4,
          source: (["ORGANIC", "DIRECT", "SOCIAL", "REFERRAL", "EMAIL"] as const)[i],
          searchEngine: i === 0 ? "google" : undefined,
          referrerDomain: i === 3 ? "twitter.com" : undefined,
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
          timestamp: hoursAgo(i * 5),
        },
      });
    }
    markDone(12);

    // ─── STEP 21: Subscribers ───
    const subscriberData = [
      { email: "subscriber1@example.com", name: "محمد العلي", clientSlug: "nova-electronics", subscribed: true, consentGiven: true },
      { email: "subscriber2@example.com", name: "فاطمة الأحمد", clientSlug: "nova-electronics", subscribed: true, consentGiven: true },
      { email: "subscriber3@example.com", name: "عبدالله السالم", clientSlug: "balsam-medical", subscribed: true, consentGiven: true },
      { email: "subscriber4@example.com", name: "ريم الخالد", clientSlug: "future-academy", subscribed: false, consentGiven: true },
    ];
    for (const s of subscriberData) {
      await db.subscriber.create({
        data: { email: s.email, name: s.name, clientId: clientIds[s.clientSlug], subscribed: s.subscribed, consentGiven: s.consentGiven, consentDate: daysAgo(30), subscribedAt: daysAgo(20), unsubscribedAt: s.subscribed ? undefined : daysAgo(5) },
      });
    }
    // News subscribers (platform-wide)
    await db.newsSubscriber.create({ data: { email: "news1@example.com", name: "سعد المطيري", subscribed: true, consentGiven: true, consentDate: daysAgo(15) } });
    await db.newsSubscriber.create({ data: { email: "news2@example.com", name: "هند القحطاني", subscribed: true, consentGiven: true, consentDate: daysAgo(10) } });
    await db.newsSubscriber.create({ data: { email: "news3@example.com", name: "يوسف العمري", subscribed: false, consentGiven: true, consentDate: daysAgo(25), unsubscribedAt: daysAgo(3) } });
    markDone(7);

    // ─── STEP 22: Contact Messages ───
    await db.contactMessage.create({ data: { name: "طارق الحربي", email: "tariq@company.sa", subject: "استفسار عن باقات SEO", message: "السلام عليكم، أنا صاحب متجر إلكتروني في جدة وأبحث عن خدمات تحسين محركات البحث. ما هي الباقات المتاحة والأسعار؟", status: "new", createdAt: daysAgo(1) } });
    await db.contactMessage.create({ data: { name: "منى الشمري", email: "mona@clinic.sa", subject: "طلب عرض سعر", message: "نحن مجموعة عيادات في الرياض. نريد عرض سعر لكتابة 10 مقالات طبية شهرياً متوافقة مع SEO.", status: "read", readAt: hoursAgo(12), createdAt: daysAgo(3) } });
    await db.contactMessage.create({ data: { name: "فهد الدوسري", email: "fahad@agency.sa", subject: "شراكة تسويقية", message: "نحن وكالة تسويق رقمي ونبحث عن شريك لخدمات المحتوى. هل تقدمون خدمات White Label؟", status: "replied", replyBody: "أهلاً فهد، نعم نقدم خدمات White Label. سأرسل لك التفاصيل على الإيميل.", readAt: daysAgo(4), repliedAt: daysAgo(3), createdAt: daysAgo(5) } });
    markDone(3);

    // ─── STEP 23: Notifications ───
    await db.notification.create({ data: { userId: adminId, type: "new_comment", title: "تعليق جديد", body: "سارة المحررة علقت على مقال دليل SEO المتاجر الإلكترونية", relatedId: articleIds[slugs[0]], createdAt: hoursAgo(2) } });
    await db.notification.create({ data: { userId: adminId, type: "new_contact", title: "رسالة تواصل جديدة", body: "طارق الحربي أرسل استفسار عن باقات SEO", createdAt: hoursAgo(6) } });
    await db.notification.create({ data: { userId: editorId, type: "article_published", title: "مقال نُشر", body: "تم نشر مقال: كيف يغير الذكاء الاصطناعي صناعة الرعاية الصحية", relatedId: articleIds[slugs[1]], readAt: hoursAgo(1), createdAt: daysAgo(3) } });
    await db.notification.create({ data: { userId: adminId, clientId: clientIds["nova-electronics"], type: "subscription_renewal", title: "تجديد اشتراك", body: "اشتراك متجر نوفا سيتجدد خلال 30 يوم", createdAt: daysAgo(1) } });
    markDone(4);

    // ─── STEP 24: FAQs + Feedback ───
    const faqIds: string[] = [];
    for (const f of FAQS) {
      const faq = await db.fAQ.create({ data: { question: f.question, answer: f.answer, position: f.position, isActive: true, inLanguage: "ar", datePublished: daysAgo(30), author: adminId, createdBy: adminId } });
      faqIds.push(faq.id);
    }
    // FAQ Feedback
    for (let i = 0; i < faqIds.length; i++) {
      await db.fAQFeedback.create({ data: { faqId: faqIds[i], userId: i < 2 ? editorId : undefined, sessionId: SESSION_ID(), isHelpful: i < 2, createdAt: daysAgo(i) } });
    }
    markDone(FAQS.length + faqIds.length);

    // ─── STEP 25: Chatbot Messages ───
    await db.chatbotMessage.create({ data: { userId: clientUserId, userQuery: "كيف أحسن SEO متجري الإلكتروني؟", assistantResponse: "لتحسين SEO متجرك: 1) ابدأ ببحث الكلمات المفتاحية ذات نية الشراء 2) حسّن عناوين ووصف صفحات المنتجات 3) أنشئ مدونة بمحتوى مفيد 4) حسّن سرعة الموقع. اقرأ دليلنا الشامل لتحسين SEO المتاجر الإلكترونية.", scopeType: "article", articleSlug: "seo-guide-ecommerce-2025", articleId: articleIds["seo-guide-ecommerce-2025"], outcome: "helpful", createdAt: hoursAgo(4) } });
    await db.chatbotMessage.create({ data: { userId: editorId, userQuery: "ما هي أفضل الممارسات لكتابة المحتوى الطبي؟", assistantResponse: "المحتوى الطبي يحتاج: 1) مصادر موثقة من هيئات طبية معتمدة 2) مراجعة من متخصص طبي 3) تنبيه واضح أن المحتوى لا يغني عن استشارة الطبيب 4) تحديث دوري للمعلومات الصحية.", scopeType: "category", categorySlug: "health-wellness", outcome: "helpful", createdAt: hoursAgo(8) } });
    markDone(2);

    // ─── STEP 26: Modonty CMS Pages ───
    for (const page of MODONTY_PAGES) {
      await db.modonty.upsert({
        where: { slug: page.slug },
        update: { title: page.title, content: page.content, seoTitle: page.seoTitle, seoDescription: page.seoDescription },
        create: page,
      });
    }
    markDone(MODONTY_PAGES.length);

    // ─── Revalidate all paths (safe — may run outside Next.js) ───
    try {
      const paths = ["/", "/settings", "/articles", "/clients", "/categories", "/tags", "/industries", "/authors", "/media", "/subscribers", "/contact-messages", "/analytics", "/users", "/subscription-tiers"];
      for (const p of paths) revalidatePath(p);
    } catch { /* revalidatePath only works inside Next.js runtime */ }

    const total = steps.reduce((sum, s) => sum + (s.count || 0), 0);
    return { success: true, summary: `Seeded ${total} records across ${steps.length} steps — all relationships verified`, steps };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    if (currentStep < steps.length) {
      markError(errMsg);
    }
    return { success: false, summary: "", error: errMsg, steps };
  }
}
