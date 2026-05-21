/**
 * Modonty Platform Capabilities — Tier 0 content.
 * Shows the FULL value of modonty as a complete platform, not just a CMS.
 */

import type { LucideIcon } from "lucide-react";
import {
  Palette,
  Film,
  Headphones,
  Megaphone,
  PenLine,
  MapPin,
  BadgeCheck,
  Code2,
  Zap,
  Bot,
  Send,
  ShieldCheck,
  Target,
  BrainCircuit,
  Globe,
  ImageIcon,
  Scale,
  QrCode,
  Map as MapIcon,
  Store,
  Star,
} from "lucide-react";

export interface Capability {
  emoji: string;
  /** Lucide icon component (preferred — overrides emoji). */
  icon?: LucideIcon;
  /** Optional image URL replacing emoji/icon for richer presentation. */
  image?: string;
  /** Optional row of small brand logos shown below the title (for multi-platform capabilities). */
  brandLogos?: { name: string; url: string }[];
  title: string;
  body: string;
  highlight?: string;
}

export const platformCapabilities: Capability[] = [
  {
    emoji: "🎨",
    icon: Palette,
    title: "تصميم كرياتيف لصفحتك ومقالاتك",
    body: "فريق التصميم عندنا يصمم لك صفحتك على مودونتي، ويصنع creatives احترافية لكل مقال — صور بانر، خلفيات، ألوان متناسقة، عناصر بصرية جذّابة. أنت تسلّمنا شعارك، والباقي علينا.",
    highlight: "كل مقال بتصميم مختلف",
  },
  {
    emoji: "🎬",
    icon: Film,
    title: "Reels — فيديوهات قصيرة",
    body: "ننتج لك Reels (فيديوهات قصيرة مأخوذة من مقالاتك) حسب باقتك. تظهر في صفحتك على مودونتي كقسم منفصل، تجذب جيل يفضّل المحتوى المرئي السريع — Instagram/TikTok style.",
    highlight: "حسب باقتك",
  },
  {
    emoji: "🎧",
    icon: Headphones,
    title: "مقالاتك مسموعة كمان",
    body: "حسب باقتك، كل مقال يطلع معاه نسخة صوتية كاملة — الزائر يضغط play ويسمع بدلاً من القراءة. مثالي للجمهور المشغول أو اللي يفضّل المحتوى وهو في السيارة أو يتمشى.",
    highlight: "حسب باقتك",
  },
  {
    emoji: "📣",
    icon: Megaphone,
    title: "نشر تلقائي على Social Media + قنوات مباشرة",
    brandLogos: [
      { name: "Facebook", url: "/help/brands/facebook.svg" },
      { name: "X", url: "/help/brands/x.svg" },
      { name: "Instagram", url: "/help/brands/instagram.svg" },
      { name: "LinkedIn", url: "/help/brands/linkedin.svg" },
      { name: "YouTube", url: "/help/brands/youtube.svg" },
      { name: "TikTok", url: "/help/brands/tiktok.svg" },
      { name: "WhatsApp Channel", url: "/help/brands/whatsapp.svg" },
      { name: "Telegram Channel", url: "/help/brands/telegram.svg" },
    ],
    body: "كل مقال ينُشر لك يتنشر تلقائياً على حسابات وقنوات مودونتي: Facebook · X · Instagram · LinkedIn · YouTube · TikTok + قناة WhatsApp + قناة Telegram. جمهور مودونتي + جمهورك على صفحتك = وصول مضاعف، بدون أي مجهود منك.",
    highlight: "٨ قنوات نشر بدون جهد",
  },
  {
    emoji: "✍",
    icon: PenLine,
    title: "Copywriting احترافي بنبرة شركتك",
    body: "كتّاب محترفون يكتبون لك بنبرة عميلك المثالي — مش ترجمة آلية، مش محتوى عام. كل كلمة مدروسة لتطابق سوقك وجمهورك.",
    highlight: "محتوى أصلي ١٠٠٪",
  },
  {
    emoji: "📍",
    icon: MapPin,
    title: "Local + Geo SEO كامل",
    body: "نبنى لصفحتك LocalBusiness Schema بكل تفاصيلك: مدينتك، حيك، إحداثيات GPS، ساعات العمل، السجل التجاري، الرقم الضريبي، Google Business Profile. تظهر في «الخريطة» على جوجل عند البحث المحلي في بلدك.",
    highlight: "تظهر للعميل اللي جنبك",
  },
  {
    emoji: "🗺",
    icon: MapIcon,
    title: "خريطة جوجل في صفحتك",
    body: "خريطة Google Maps مدمجة في صفحتك تعرض موقع شركتك بدقة — الزائر يشوف العنوان، يضغط، يبدأ التوجيه له على جوّاله مباشرة. تظهر تلقائياً بناءً على إحداثياتك.",
    highlight: "توجيه بنقرة",
  },
  {
    emoji: "🏪",
    icon: Store,
    title: "ربط Google Business Profile",
    body: "صفحتك مربوطة بـ Google Business Profile (GBP) الرسمي تبع شركتك — الزائر يقدر يفتح GBP من صفحتك، يشوف الصور الرسمية، الساعات، التواصل، والاتجاهات. كل البيانات متطابقة.",
    highlight: "هوية موحّدة على جوجل",
  },
  {
    emoji: "⭐",
    icon: Star,
    title: "تقييمات جوجل + النجوم مباشرة",
    body: "تقييمات عملائك الحقيقية على Google Business تظهر في صفحتك على مودونتي — مع عدد النجوم، عدد المراجعات، وآخر التعليقات. social proof قوي يبني الثقة فوراً (متوفر حسب الباقة).",
    highlight: "حسب باقتك",
  },
  {
    emoji: "✅",
    icon: BadgeCheck,
    title: "موثوقية رسمية ترفع ثقتك",
    body: "عند تسجيلك معنا نوثّق بياناتك القانونية: السجل التجاري، الرقم الضريبي، العنوان الوطني، الشكل القانوني. يصير عندك «علامة شركة موثّقة» في صفحتك — الزائر يحس بالأمان، وجوجل يعطي صفحتك ثقة أعلى في الـ Schema (إشارات E-E-A-T).",
    highlight: "علامة موثّق + ثقة جوجل",
  },
  {
    emoji: "🏗",
    icon: Code2,
    title: "+٢٠ نوع Schema JSON-LD",
    body: "كل صفحة فيها schema غني يفهمه جوجل: Organization، Article، NewsArticle، FAQPage مع voice search، BreadcrumbList، AggregateRating، Review، Person، Product، ImageObject. فهم أعمق ١٠ مرات من المنافسين.",
    highlight: "Google يفهم صفحتك بدقة",
  },
  {
    emoji: "⚡",
    icon: Zap,
    title: "Core Web Vitals من زوار حقيقيين",
    body: "نقيس LCP و CLS و INP من متصفح كل زائر فعلي على صفحتك — مش من أدوات lab. تشوف الأداء الحقيقي اللي يحس فيه عميلك، مش متوسطات نظرية.",
    highlight: "بيانات حقيقية ١٠٠٪",
  },
  {
    emoji: "🤖",
    icon: Bot,
    image:
      "https://res.cloudinary.com/dfegnpgwx/image/upload/c_scale,w_96,f_auto,q_auto/v1770899986/modontyAvatar_gn8wxj.webp",
    title: "مساعد ذكي بصورة شخصية",
    body: "في صفحتك على مودونتي يظهر مساعد ذكي بـ Avatar مميز (الصورة اللي تشوفها هنا) — يجاوب زوارك على أسئلتهم المتعلقة بشركتك ومحتوى مقالاتك. كل سؤال يسأله زائر يتسجّل تلقائياً كـ FAQ تابع للمقال.",
    highlight: "خدمة ٢٤/٧ بصورة ذكية",
  },
  {
    emoji: "📱",
    icon: Send,
    image: "/help/brands/telegram.svg",
    title: "تنبيهات Telegram لحظية على جوّالك",
    body: "اربط Telegram من الكونسول مرة وحدة، وأي تفاعل في صفحتك على مودونتي يوصلك تنبيه فوري على جوّالك — مشاهدة جديدة، إعجاب، تعليق، سؤال، اشتراك في النشرة، رسالة تواصل. ٢٦ نوع تنبيه، تختار منهم اللي يهمك.",
    highlight: "تنبيه فوري على جوّالك",
  },
  {
    emoji: "🛡",
    icon: ShieldCheck,
    title: "بوابة جودة قبل النشر",
    body: "كل مقال يفحص قبل ما يصلك: SEO Score (لا ينُشر تحت ٦٠٪)، كلمات محظورة، ادعاءات غير مدعومة، تطابق مع compliance شركتك. أنت تشوف فقط الشغل الجاهز.",
    highlight: "صفر مقال ضعيف يوصلك",
  },
  {
    emoji: "🎯",
    icon: Target,
    title: "Lead Scoring تلقائي",
    body: "كل زائر يأخذ score من ١٠٠ تلقائياً (المشاهدات + الوقت + التفاعل + التحويلات). لما يوصل ٧٠+ يصير «جاهز للتواصل» — تعرف مين قريب يصير عميلك قبل ما يكلّمك.",
    highlight: "تعرف عميلك قبل ما يعرفك",
  },
  {
    emoji: "🧠",
    icon: BrainCircuit,
    title: "تحسين للذكاء الاصطناعي",
    body: "محتوى صفحتك مُحسَّن مش بس لجوجل — لكن لـ ChatGPT و Perplexity و Gemini كمان. لما المستخدم يسأل الـ AI، يقتبس من صفحتك ويذكر شركتك.",
    highlight: "تظهر في إجابات الـ AI",
  },
  {
    emoji: "🌐",
    icon: Globe,
    title: "Knowledge Graph + Wikidata",
    body: "نسجّل شركتك في Google Knowledge Graph + Wikidata — لما حد يبحث عن شركتك في جوجل، يطلع له صندوق معلومات رسمي (Knowledge Panel) باسمك ولوجوك وروابطك. أعلى مستوى ثقة.",
    highlight: "صندوق رسمي في جوجل",
  },
  {
    emoji: "🖼",
    icon: ImageIcon,
    title: "صور مفهرسة في Google Images",
    body: "كل صورة في مقالك تحصل alt text تلقائي بكلمات مفتاحية، وتُضاف لـ Image Sitemap ترسلها لجوجل. صورك تطلع في Google Images، تجيب زوار من مصدر إضافي.",
    highlight: "مصدر زيارات إضافي",
  },
  {
    emoji: "⚖",
    icon: Scale,
    title: "توافق YMYL للقطاعات الحساسة",
    body: "لو نشاطك طبي أو مالي أو قانوني، نطبّق فحوصات YMYL (Your Money Your Life) — تأكيد المؤهلات، الادعاءات المدعومة بمصادر، التحذيرات القانونية. شرط جوجل للظهور في هذي القطاعات.",
    highlight: "للقطاعات الحساسة",
  },
  {
    emoji: "📲",
    icon: QrCode,
    title: "QR Code لصفحتك جاهز للنشر",
    body: "كل عميل عنده QR code خاص بصفحته على مودونتي — تحمّله بنقرة من صفحتك، اطبعه على بزنس كارد أو بروشور أو فاترينة المحل، أو ابعته في واتساب وإيميل. الزائر يصوّره بكاميرا جوّاله ويوصل لصفحتك مباشرة.",
    highlight: "وصلة سريعة للزائر",
  },
];

// ──────────────────────────────────────────────────────────────────────────
// 25 Engagement Events — Compact view (after the 7 Before/After cards)
// ──────────────────────────────────────────────────────────────────────────

export interface EngagementEventGroup {
  emoji: string;
  groupTitle: string;
  events: EngagementEventCompact[];
}

export interface EngagementEventCompact {
  name: string;
  description: string;
}

export const allEngagementEvents: EngagementEventGroup[] = [
  {
    emoji: "📰",
    groupTitle: "تفاعل مع مقالاتك",
    events: [
      { name: "مشاهدة المقال", description: "كل فتحة للمقال تُسجّل مع المتصفح + المصدر + الوقت" },
      { name: "إعجاب", description: "زائر يضغط لايك" },
      { name: "عدم إعجاب", description: "إشارة سلبية تساعدك تعرف إيش ما عجب" },
      { name: "حفظ للقراءة لاحقاً", description: "زائر يحفظ المقال للرجوع له" },
      { name: "مشاركة", description: "WhatsApp · Twitter · LinkedIn · Facebook · Email · Copy" },
      { name: "تعليق", description: "زائر يكتب تعليقه (يحتاج موافقتك)" },
      { name: "رد على تعليق", description: "زائر يرد على تعليق آخر — محادثة على صفحتك" },
    ],
  },
  {
    emoji: "🏢",
    groupTitle: "تفاعل مع صفحة شركتك",
    events: [
      { name: "زيارة صفحتك", description: "زائر يفتح modonty.com/clients/[شركتك]" },
      { name: "متابعة", description: "زائر يصير من متابعينك (community)" },
      { name: "إعجاب بشركتك", description: "لايك على ملفك كامل" },
      { name: "تقييم شركتك", description: "زائر يكتب رأيه في شركتك (يحتاج موافقتك)" },
      { name: "مشاركة صفحتك", description: "زائر يبعت رابطك لشخص آخر" },
    ],
  },
  {
    emoji: "💰",
    groupTitle: "التحويلات (٧ أنواع)",
    events: [
      { name: "اشتراك في النشرة", description: "أرخص قناة جلب عملاء (مجانية مدى الحياة)" },
      { name: "تواصل معك", description: "رسالة عميل محتمل عبر النموذج" },
      { name: "تسجيل دخول", description: "زائر مهتم درجة إنه يسجل" },
      { name: "تحميل", description: "ملف PDF/كتيب من صفحتك" },
      { name: "طلب عرض تجريبي", description: "demo request" },
      { name: "بدء فترة تجريبية", description: "trial start" },
      { name: "شراء", description: "purchase + الـ value" },
    ],
  },
  {
    emoji: "👆",
    groupTitle: "النقرات والتفاعل المتقدم",
    events: [
      { name: "نقرة على CTA", description: "زر «اطلب الآن»، «اشترك»، «اتصل بنا» — نعرف أيهم يجيب نتيجة" },
      { name: "نقرة على رابط داخل المقال", description: "نميّز Internal vs External vs Affiliate vs Citation" },
      { name: "محادثة chatbot", description: "كل سؤال للمساعد الذكي يتسجّل ويصير مرجع" },
    ],
  },
  {
    emoji: "📊",
    groupTitle: "الأداء وسلوك القراءة",
    events: [
      { name: "Core Web Vitals", description: "LCP + CLS + INP من متصفح كل زائر — أرقام real" },
      { name: "وقت القراءة الفعلي", description: "بدون idle time — كم ركّز فعلياً" },
      { name: "عمق القراءة", description: "وصل لنهاية المقال أم وقف في النص" },
    ],
  },
];

export const engagementStats = {
  totalEvents: 25,
  schemaTypes: 20,
  conversionTypes: 7,
  realTimeMetrics: 3, // LCP, CLS, INP
};
