/** مَن يملك بيانات القسم: الشريك نفسه · الأدمن · نصٌّ ثابت من مدونتي. */
export type BlockOwner = "client" | "admin" | "modonty";

export interface BlockSource {
  /** اسم الشاشة كما يراها الشريك في قائمته. */
  where: string;
  /** رابط الشاشة — فارغ حين لا يملك الشريك تعديل القسم. */
  href: string;
  owner: BlockOwner;
}

/**
 * أين تُدخَل بيانات كل قسم، ومَن يملكها. مقيس من `get-home-data.ts` سطراً سطراً:
 * ما يكتبه `updateProfile` في الكونسول ملك الشريك، وصورة الغلاف والشعار يضبطهما من
 * «الوسائط» (`setClientBrandingMedia`) لا من الأدمن — و«احجز» وحده ملك الأدمن
 * (`ctaMode` · `ctaLabel` · `ctaUrl`)، فلا يُطالَب به الشريك.
 *
 * ملفّه الخاصّ لأنّ له قارئَين: قائمة النواقص في «تصميم الموقع»، وعرض الصفحة في
 * «محتوى الموقع». نسخةٌ ثانية منه تعني رابطاً يشير إلى شاشة خطأ بعد أوّل تعديل.
 */
export const BLOCK_SOURCE: Record<string, BlockSource> = {
  services: { where: "محتوى الموقع", href: "/dashboard/page-content", owner: "client" },
  team: { where: "محتوى الموقع", href: "/dashboard/page-content", owner: "client" },
  stats: { where: "محتوى الموقع", href: "/dashboard/page-content", owner: "client" },
  trust: { where: "محتوى الموقع", href: "/dashboard/page-content", owner: "client" },
  video: { where: "محتوى الموقع", href: "/dashboard/page-content", owner: "client" },
  gallery: { where: "معرض الصور", href: "/dashboard/gallery", owner: "client" },
  // مقيس في `get-home-data.ts:137`: أسئلة الصفحة أوّلاً ثم أسئلة المقالات — شاشتان لا واحدة.
  faq: { where: "أسئلة صفحتك + أسئلة مقالاتك", href: "/dashboard/page-faq", owner: "client" },
  testimonials: { where: "تقييمات نشاطك", href: "/dashboard/client-reviews", owner: "client" },
  blog: { where: "المقالات · مقالاتك على موقعك", href: "/dashboard/articles", owner: "client" },
  // «حسابك» اسمٌ لا وجود له في القائمة — الشاشة اسمها «بيانات نشاطك»، والوسم يسمّي
  // البطاقة والحقول بأسمائها كما يقرأها الشريك (خالد ٣١ أغسطس): «من فين؟» يستحقّ
  // عنواناً يُمشى عليه، لا إشارة إلى شاشة كاملة.
  about: { where: "بيانات نشاطك · البيانات الأساسية: وصف النشاط + الاسم القانوني", href: "/dashboard/profile", owner: "client" },
  contact: { where: "بيانات نشاطك · البيانات الأساسية + العنوان", href: "/dashboard/profile", owner: "client" },
  map: { where: "بيانات نشاطك · العنوان", href: "/dashboard/profile", owner: "client" },
  // الشعار والوصف والمدينة من «بيانات نشاطك»، وصورة الغلاف والشعار من «الصور والملفات».
  hero: { where: "بيانات نشاطك · الصور والملفات", href: "/dashboard/profile", owner: "client" },
  booking: { where: "الأدمن", href: "", owner: "admin" },
  cta: { where: "نصّ مدونتي", href: "", owner: "modonty" },
  newsletter: { where: "نصّ مدونتي", href: "", owner: "modonty" },
  "lead-form": { where: "نصّ مدونتي", href: "", owner: "modonty" },
};
