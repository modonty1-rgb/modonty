/**
 * الشرائح المستهدفة — صفحة يشترك فيها قسمان.
 *
 * خالد، ١٣ سبتمبر ٢٠٢٦: «أبغى الشرائح المستهدفة … على صفحة، عشان تستفيد منها المبيعات
 * ويستفيد منها قسم التسويق». وكانت قسمًا داخل صفحة المبيعات، فلا يراها من يبني الحملة.
 * وهذا هو الاستثناء من قاعدة «كل حاجة في قسمها»: مادةٌ لها مستهلكان في قسمين تُرفع
 * إلى صفحة أساس، ويشير إليها القسمان.
 */
import { DocLayout } from "@/app/(public)/components/doc-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFeaturedPlanPrice } from "@/lib/pricing/get-featured-plan-price";
import { getPlaybookCatalogCopy } from "../helpers/get-playbook-catalog-copy";
import {
  ShoppingBag,
  Stethoscope,
  Scale,
  Building2,
  UtensilsCrossed,
  Sparkles as BeautyIcon,
  Plane,
  Briefcase,
  Users,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  CalendarRange,
  TrendingUp,
  Smartphone,
  Globe,
  Lightbulb,
  Target,
  ListChecks,
} from "lucide-react";

// ─── ICP type ──────────────────────────────────────────────────
interface ICP {
  rank: number;
  ease: string;
  icon: React.ElementType;
  name: string;
  size: string;
  marketSize: string;
  growth: string;
  pain: string;
  channelSA: string;
  channelEG: string;
  pitch: string;
  realData: string;
  color: string;
}

// ─── Tier1 — 5 الـ Core ICPs (validated بالبحث) ───────────────
const tier1ICPs: ICP[] = [
  {
    rank: 1,
    ease: "⭐⭐⭐⭐⭐",
    icon: ShoppingBag,
    name: "متاجر التجارة الإلكترونية (Salla / Zid / Shopify)",
    size: "5–50 موظف",
    marketSize: "$31.29 مليار سوق التجارة الإلكترونية في السعودية 2026",
    growth: "+11.92% نمو سنوي مركّب (يصل $54.87 مليار بحلول 2031)",
    pain: "المنافسة على محركات البحث قاتلة — كل متجر يبغى نفس الكلمات. تكلفة اكتساب العميل الإعلانات يرتفع كل ربع.",
    channelSA: "Meta + Snapchat + بحث Google",
    channelEG: "Facebook + Instagram + TikTok",
    pitch: "متجرك على Salla أو Zid؟ تنافس مع 80,000 تاجر في السعودية. مدونتي تعطيك ميزة مدوّنة السلطة مدمج — مقالاتك تظهر في نتائج البحث + ملخّصات الذكاء الاصطناعي + ChatGPT Search، وتجيب لك زوار مجاناً بدل ما تدفع لـ Snapchat.",
    realData: "Salla تخدم 80,000 تاجر (44% من السوق). Zid تخدم 5,590 تاجر (12.55%). 97% من السعوديين يبحثون قبل الشراء. 72% من البحث على الجوال.",
    color: "primary",
  },
  {
    rank: 2,
    ease: "⭐⭐⭐⭐⭐",
    icon: BeautyIcon,
    name: "العيادات التجميلية + الأسنان التجميلية (جديد 🌟)",
    size: "عيادة → 5 فروع",
    marketSize: "1.5 مليار ريال سوق طب الأسنان التجميلي في السعودية",
    growth: "60%+ من البالغين السعوديين مهتمون بإجراءات التجميل",
    pain: "العميل يبحث في Google + Instagram + TikTok قبل أي حجز. المنافسة شرسة في الرياض/جدة. الترتيب على «أفضل عيادة تجميل/أسنان» = حجوزات.",
    channelSA: "Instagram + TikTok + Google + Snapchat",
    channelEG: "Instagram + TikTok + Facebook",
    pitch: "العيادة بدون مدونة الثقة على Google = خسارة 70% من العملاء المحتملين. مدونتي تنشر مقالات السيو طبية متوافقة مع القطاعات الحسّاسة، تظهر في ملخّصات الذكاء الاصطناعي لما العميل يبحث «أفضل عيادة...» — وتدمج مع Instagram/TikTok للـ دليل بصري.",
    realData: "التسويق بالمؤثّرين في السعودية العائد 5.8× (مقابل 4.2× عالمي). 99% انتشار الإنترنت. سوق التجميل السعودي $7.6 مليار بحلول 2026.",
    color: "rose",
  },
  {
    rank: 3,
    ease: "⭐⭐⭐⭐",
    icon: Stethoscope,
    name: "العيادات والقطاع الصحي العام",
    size: "عيادة → 10 فروع",
    marketSize: "$1.1 مليار سوق طب الأسنان الرقمي في السعودية",
    growth: "90.9% من العيادات السعودية تستخدم أنظمة رقمية",
    pain: "المرضى يبحثون قبل الحجز. القطاعات الحسّاسة الالتزام حساس (Google يعاقب المحتوى الطبي ضعيف الجودة). الحاجة للخبرة والمصداقية قوي.",
    channelSA: "إعلانات بحث Google + Snapchat",
    channelEG: "Google + Facebook",
    pitch: "أول 5 نتائج في Google تأخذ 67% من النقرات. مدونتي توصلك هناك بـ 8 مقالات/شهر مكتوبة بالخبرة والمصداقية كامل + البيانات المنظّمة طبي + القطاعات الحسّاسة الالتزام — مش أي كاتب يقدر يعمله.",
    realData: "70% من المرضى السعوديين يبحثون عن الأعراض قبل الحجز. البيانات المنظّمة الطبي مش ميزة تختاره — هو شرط بقاء.",
    color: "emerald",
  },
  {
    rank: 4,
    ease: "⭐⭐⭐⭐",
    icon: Scale,
    name: "مكاتب المحاماة والاستشارات",
    size: "فردي → 20 محامي",
    marketSize: "السوق ينمو مع رؤية 2030 + قوانين جديدة (NEOM، استثمار أجنبي)",
    growth: "وكالات قانونية متخصصة ظهرت (Clarvia) — يثبت طلب السوق",
    pain: "السوق منافس + الثقة = ثقة. المتخصصون اللي ما عندهم مدونة = ما يجيبون عملاء جدد. الالتزام مع هيئة الإعلام السعودية حساس.",
    channelSA: "LinkedIn + بحث Google + Twitter/X",
    channelEG: "LinkedIn + Google",
    pitch: "محامي بدون مدونة الثقة = اسم بدون سمعة رقمية. مدونتي تنشر مقالات قانونية متوافقة مع لوائح هيئة الإعلام السعودية + الخبرة والمصداقية + الروابط الخارجية من modonty.com — تبني المرجعية في 6 شهور.",
    realData: "100% من العملاء بين الشركات يبحثون عن المستشار قبل الاتصال. محتوى يبني الثقة = قيمة العميل الكلّية × 3.",
    color: "violet",
  },
  {
    rank: 5,
    ease: "⭐⭐⭐⭐",
    icon: Building2,
    name: "العقارات (وسطاء + مطورين)",
    size: "3–30 موظف",
    marketSize: "$864.85M سوق تقنية العقار السعودي",
    growth: "+19.09% سنوياً — رؤية 2030 تحرّك القطاع",
    pain: "«شقق للبيع في الياسمين» — مين يظهر يكسب. منصات Aqar (2M زائر/شهر) + Bayut تستحوذ على المهتمّين. الوسيط بدون السيو = غير مرئي.",
    channelSA: "Google + Snapchat + TikTok + Instagram",
    channelEG: "Facebook + Instagram + TikTok",
    pitch: "وسيط عقاري؟ مدونة الثقة واحدة تجيب لك المهتمّين أكثر من 10 لوحات في الشارع. مع تسويق بالذكاء الاصطناعي، نستهدف نية شراء عالية. منصات البوّابات (Aqar, Bayut) تأخذ عمولة — مدونتي تجيب المهتمّين لك مباشرة بدون عمولة.",
    realData: "Aqar.fm: 2 مليون زائر شهرياً. تقنية العقار ينمو 19% سنوياً. 78% من السعوديين على 5G — 100% سوق الجوّال أوّلًا.",
    color: "amber",
  },
  {
    rank: 6,
    ease: "⭐⭐⭐⭐",
    icon: Plane,
    name: "السياحة والسفر (جديد 🌟)",
    size: "وكالة سفر → سلسلة",
    marketSize: "هدف 150 مليون زائر للسعودية بحلول 2030",
    growth: "رؤية 2030 أولوية — استثمارات NEOM + الخليج العربي + موسم الرياض",
    pain: "العميل يبحث «أفضل وجهة سياحية في السعودية» / «حجز عمرة + تنقلات» — مين يظهر يحجز. المنافسة مع منصات عالمية (Booking, Agoda).",
    channelSA: "Instagram + TikTok + YouTube + Google",
    channelEG: "Facebook + Instagram + YouTube",
    pitch: "وكالة سفر بدون مدوّنة السلطة = تتنازل عن السوق لـ Booking + Skyscanner. مدونتي تكتب لك مقالات السيو عربية للوجهات (NEOM، الرياض، العلا، البحر الأحمر) — تظهر في ملخّصات الذكاء الاصطناعي + تسويق الريلز.",
    realData: "السياحة السعودية وزارة طموحة — 150M زائر بحلول 2030. سوق الإعلانات الرقمي يتسارع. محتوى بصري (الريلز) = الأقوى.",
    color: "cyan",
  },
  {
    rank: 7,
    ease: "⭐⭐⭐",
    icon: UtensilsCrossed,
    name: "المطاعم والضيافة (سيو محلّي)",
    size: "فرع → سلسلة 10",
    marketSize: "5G التغطية 78% — كل بحث طعام = الجوّال أوّلًا",
    growth: "ملخّصات الذكاء الاصطناعي تغيّر نتائج البحث — التقييمات أهم من قبل",
    pain: "ملفّ النشاط على Google لا يكفي. التطبيقات (HungerStation/Jahez) تأخذ 15-30% عمولة. المطاعم بدون موقع مع السيو = تخسر هامش الربح.",
    channelSA: "Instagram + TikTok + Snapchat + Google",
    channelEG: "Facebook + Instagram + TikTok",
    pitch: "مطعمك على ملفّ النشاط على Google؟ ممتاز. لكن ملخّصات الذكاء الاصطناعي والتقييمات إشارة ترتيب — تحتاج مقالات السيو لكل وجبة + موقع مع طلبات مباشرة (بدون 30% عمولة). مدونتي تشغّل النظامين.",
    realData: "التقييمات = إشارة ترتيب مباشرة. ملخّصات الذكاء الاصطناعي تأخذ 30%+ من نقرات. الطلب المباشر يوفر 15-30% عمولة المنصات.",
    color: "indigo",
  },
];

// ─── Tier2 — Resellers (Agencies) ──────────────────────────
const tier2ICP = {
  icon: Briefcase,
  name: "الوكالات الرقمية (الوكلاء)",
  description: "وكالة وحدة = 10–50 عميل دفعة وحدة. بعلامة الوكيل = توسّع سريع.",
  pitch: "بدل ما توظّف 5 كتّاب، وفّرها لعملائك بـ بعلامة الوكيل تحت اسمك. خصم خاص للوكالات + لوحة الأدمن مخصصة.",
  realData: "السعودية فيها 200+ وكالة ديجيتال نشطة. كل وكالة = محتمَل 10-50 الشريك.",
} as const;

// ─── 7 Pain Points (validated) ────────────────────────────────
const sevenPains = [
  { pain: "ما عندي وقت أكتب", solution: "فريق مدونتي يكتب نيابة عنك — كل المحتوى يدوي ومحترف، __ARTICLES__" },
  { pain: "ما عندي ميزانية وكالة", solution: "__BUDGET_SOLUTION__" },
  { pain: "ما أعرف السيو", solution: "البيانات المنظّمة + Meta + خريطة الموقع + البيانات المنظّمة — كلها تلقائية للظهور في محركات البحث + ملخّصات الذكاء الاصطناعي" },
  { pain: "ما أعرف هل المحتوى ينفع", solution: "ترتيب المهتمّين 0–100 لكل زائر + تحليلات تحليلات Google شفافة" },
  { pain: "ما أعرف إيش يكتب", solution: "استبيان استمارة السيو + تتبّع منافسين + اقتراحات الذكاء الاصطناعي — نقترح المواضيع بناءً على نية البحث" },
  { pain: "ينقصني تنبيهات لحظية", solution: "تنبيهات Telegram على 26 حدث — مقال نُشر، المهتمّ جديد، تعليق..." },
  { pain: "ما أتابع لوحة Google للمواقع", solution: "تكامل مباشر مع لوحة Google للمواقع + سرعة الصفحة + تهيئة لزواحف الذكاء الاصطناعي — كل شي في لوحة واحدة" },
] as const;

// ─── Color map ────────────────────────────────────────────────
const colorMap: Record<string, { border: string; bg: string; text: string; iconBg: string }> = {
  primary: { border: "border-primary/30", bg: "bg-primary/[0.04]", text: "text-primary", iconBg: "bg-primary/15" },
  emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/[0.04]", text: "text-emerald-500", iconBg: "bg-emerald-500/15" },
  violet: { border: "border-violet-500/30", bg: "bg-violet-500/[0.04]", text: "text-violet-500", iconBg: "bg-violet-500/15" },
  amber: { border: "border-amber-500/30", bg: "bg-amber-500/[0.04]", text: "text-amber-500", iconBg: "bg-amber-500/15" },
  rose: { border: "border-rose-500/30", bg: "bg-rose-500/[0.04]", text: "text-rose-500", iconBg: "bg-rose-500/15" },
  indigo: { border: "border-indigo-500/30", bg: "bg-indigo-500/[0.04]", text: "text-indigo-500", iconBg: "bg-indigo-500/15" },
  cyan: { border: "border-cyan-500/30", bg: "bg-cyan-500/[0.04]", text: "text-cyan-500", iconBg: "bg-cyan-500/15" },
  blue: { border: "border-blue-500/30", bg: "bg-blue-500/[0.04]", text: "text-blue-500", iconBg: "bg-blue-500/15" },
};

export default async function SegmentsPage() {
  /**
   * السعر من كتالوج البيع وحده؛ وإن غاب (الباقة غير منشورة أو بلا سعرٍ سعودي) تُقال
   * الجملة بلا رقم، كما في compare-section.tsx — لا رقمٌ احتياطيٌّ ليس معروضاً للبيع.
   * ٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد.
   */
  const [m, { articles }] = await Promise.all([getFeaturedPlanPrice("SA"), getPlaybookCatalogCopy()]);
  const monthly = m?.monthly ?? null;
  // اسمُ الباقة المميَّزة من الكتالوج — لا «Momentum» مكتوبةً (٢٣ سبتمبر ٢٠٢٦ · خالد: مصدرٌ واحد).
  const planName = m?.name ?? "الأكثر اختياراً";
  const wordpress = 18000;
  const budgetSolution = monthly
    ? `بأقل من 10% من سعر الوكالة (${planName} ${monthly} شهري مقابل ${wordpress.toLocaleString("en-GB")} شهري لفريق WordPress)`
    : `بأقل من 10% من سعر الوكالة (سعر باقة ${planName} الشهري مقابل ${wordpress.toLocaleString("en-GB")} شهري لفريق WordPress)`;
  const discoveryQuestion = monthly
    ? `2. هل يقدر يدفع ${monthly} ريال شهرياً (${planName})؟`
    : `2. هل يقدر يدفع سعر الباقة الشهري (${planName})؟`;

  const resolvedPains = sevenPains.map((p) => ({
    ...p,
    solution:
      p.solution === "__BUDGET_SOLUTION__"
        ? budgetSolution
        : // حصّةُ المقالات من الكتالوج لا «8» مكتوبة — `getPlaybookCatalogCopy`.
          p.solution.replace("__ARTICLES__", articles ?? "مقالات كل شهر"),
  }));

  return (
    <DocLayout
      parentHref="/playbook"
      parentLabel="دليل الفريق"
      title="الشرائح المستهدفة"
      description="من نبيع له ومن نخاطبه: الشرائح بترتيب سهولة الإغلاق، وشجرة قرار قبل أن تعطي المهتمّ وقتك، ونقاط الألم كأسئلة اكتشاف."
    >
      {/* ── 🌟 Tier Strategic — القطاعات المصرية التي تستهدف السائح الخليجي ── */}
      <Card className="border-2 border-cyan-500/40 bg-cyan-500/[0.04]">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge className="text-[10px] bg-cyan-500 text-white">⭐ الشريحة الاستراتيجية</Badge>
            <h2 className="text-[14.5px] font-bold flex-1 min-w-0">
              القطاعات المصرية التي تستهدف السائح الخليجي — أسهل إقفال
            </h2>
          </div>

          <div className="rounded-md border border-cyan-500/30 bg-cyan-500/[0.05] p-2.5 mb-2">
            <p className="text-[11px] font-bold text-cyan-600 uppercase tracking-wide mb-2">
              🎯 ليش هذا فئة استراتيجي؟
            </p>
            <p className="text-sm leading-6 mb-1.5">
              هذي القطاعات المصرية <strong>تتكلم العربية للجمهور الخليجي بطبيعتها</strong>. يعني:
            </p>
            <ul className="space-y-1.5 text-xs leading-6 text-foreground/85">
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 shrink-0 font-bold">①</span>
                <span>
                  <strong>محتواهم بالفعل عربي خليجي</strong> → ما نحتاج نعدّل لغتنا، نحن جاهزين
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 shrink-0 font-bold">②</span>
                <span>
                  <strong>يستفيدون مباشرة من الثقة modonty.com السعودي</strong> → نطاقنا يخدمهم،
                  مش يضرّهم
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 shrink-0 font-bold">③</span>
                <span>
                  <strong>الكلمات المفتاحية التي يستهدفونها = نفس الكلمات المفتاحية السعودية</strong> (خليجي يبحث في
                  Google السعودي عن وجهات/خدمات في مصر)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 shrink-0 font-bold">④</span>
                <span>
                  <strong>متوسّط دخل العميل أعلى</strong> → يخدمون عملاء أصحاب الثروات خليجيين (ميزانياتهم أعلى من المصريين
                  المحليين)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 shrink-0 font-bold">⑤</span>
                <span>
                  <strong>بداية سهلة</strong> — تقارب ثقافي طبيعي، لا حاجة لتعليمهم سياق السوق
                  السعودي
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-1.5">
            {[
              {
                num: 1,
                icon: Plane,
                color: "cyan",
                name: "منتجعات البحر الأحمر (شرم الشيخ · الغردقة · مرسى علم)",
                marketSize: "19M سائح في مصر 2025 · 3M+ زائر لشرم وحدها",
                growth: "65-75% الإشغال خلال مواسم الذروة (حتى رمضان)",
                gulfFocus: "السائح الخليجي = نسبة كبيرة من نزلاء المنتجعات + السعودية insurance agreements في شرم",
                pain: "المنتجع المصري يخسر الحجوزات لـ Booking.com + Agoda. ما يظهر في «أفضل منتجع شرم» على Google السعودي.",
                pitch: "منتجعك يستهدف الخليجيين؟ مدونتي تكتب لك مقالات السيو عربية بلهجة خليجية تظهر لما السعودي يبحث «أفضل منتجع في شرم» — مع مدوّنة السلطة السعودي يعطيك ميزة فورية على المنافسين المحليين والمنصات العالمية.",
                ease: "⭐⭐⭐⭐⭐",
              },
              {
                num: 2,
                icon: Stethoscope,
                color: "rose",
                name: "السياحة العلاجية (مستشفيات + عيادات تستقبل خليجيين)",
                marketSize: "نمو 75-76% في 2025 — أسرع نمو في القطاع",
                growth: "أسعار 30-50% أقل من الخليج بنفس الجودة (أطباء مدرّبين غربياً)",
                gulfFocus: "اتفاقيات تأمين مع شركات سعودية. تخصصات: تجميل · أسنان · إخصاب · أورام · قلب",
                pain: "العيادة المصرية ما تظهر في بحث السعودي عن «أفضل عيادة تجميل في القاهرة». المنافسة مع وسطاء سياحة طبية يأخذون عمولات.",
                pitch: "مركزك يستقبل مرضى خليجيين؟ السوق المصري في طفرة (نمو 76%). مدونتي تكتب لك مقالات طبية بالخبرة والمصداقية + القطاعات الحسّاسة — العميل السعودي يبحث «أفضل عيادة في مصر» ويلقاك مباشرة بدون عمولة وسيط.",
                ease: "⭐⭐⭐⭐⭐",
              },
              {
                num: 3,
                icon: Building2,
                color: "amber",
                name: "العقارات الخليجية في مصر (الساحل الشمالي · رأس الحكمة · العنوان الوطني)",
                marketSize: "$1.4 مليار تدفقات خليجية ($709M الإمارات + $403M السعودية)",
                growth: "العائد 8-14% · رأس الحكمة +15% تقدير في 2025",
                gulfFocus: "51% من المشترين GCC HNWI يستخدمونها كـ second home. 56% من السعوديين يستهدفون New Administrative Capital",
                pain: "المطوّر المصري بدون السيو عربي = غير مرئي للمشتري السعودي. المنافسة مع وسطاء وصفحات Facebook عشواء.",
                pitch: "تطوّر مشاريع في الساحل أو العنوان الوطني؟ المشتري السعودي/الإماراتي يبحث الآن. مدونتي تنشر مقالات السيو عربية تستهدف «شقة في رأس الحكمة للسعوديين» — الكلمات المفتاحية اللي ما تستهدفها وكالات مصرية محلية.",
                ease: "⭐⭐⭐⭐",
              },
              {
                num: 4,
                icon: Briefcase,
                color: "violet",
                name: "التعليم والبرامج الصيفية الأكاديمية للخليجيين",
                marketSize: "2.9M عامل مصري في السعودية = جالية ضخمة + روابط ثقافية",
                growth: "هدف مصر: 6% طلاب دوليين بحلول 2030 (رؤية مصر)",
                gulfFocus: "البرامج الصيفية والمدارس الخاصة الموجّهة للسعوديين/الإماراتيين تتنامى",
                pain: "البرنامج الصيفي المصري ما يصل للأهل السعوديين على Google. Marketing عبر Facebook ضعيف جداً للعميل الخليجي متميّز.",
                pitch: "برنامج صيفي للطلاب الخليجيين؟ الأهالي السعوديون يبحثون «أفضل برنامج صيفي في مصر للأبناء». مدونتي تنشر مقالات بالبيانات المنظّمة تعليمي + ملفّات الكتّاب + التقييمات — تظهر فورياً في Google السعودي.",
                ease: "⭐⭐⭐⭐",
              },
            ].map((s) => {
              const Icon = s.icon;
              const c = colorMap[s.color];
              return (
                <Card key={s.num} className={`${c.border} ${c.bg}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2 mb-1.5 flex-wrap">
                      <div className={`p-2 rounded-lg ${c.iconBg} shrink-0`}>
                        <Icon className={`h-5 w-5 ${c.text}`} />
                      </div>
                      <div className="flex-1 min-w-[180px]">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-[10px] font-mono font-bold ${c.text}`}>EG-Gulf #{s.num}</span>
                          <span className="text-[10px]">{s.ease}</span>
                        </div>
                        <h3 className="text-sm font-bold leading-tight">{s.name}</h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-1.5 text-xs">
                      <div className="rounded-md bg-background/60 border border-border/40 p-2.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">حجم السوق</p>
                        <p className="leading-6">{s.marketSize}</p>
                      </div>
                      <div className="rounded-md bg-background/60 border border-border/40 p-2.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">النمو</p>
                        <p className="leading-6">{s.growth}</p>
                      </div>
                    </div>

                    <div className="rounded-md border border-cyan-500/25 bg-cyan-500/[0.05] p-3 mb-1.5">
                      <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-wide mb-1">🎯 الزاوية الخليجية</p>
                      <p className="text-xs leading-6">{s.gulfFocus}</p>
                    </div>

                    <div className="rounded-md border border-amber-500/25 bg-amber-500/[0.05] p-3 mb-1.5">
                      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1">نقطة الألم</p>
                      <p className="text-xs leading-6">{s.pain}</p>
                    </div>

                    <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.05] p-3">
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1">جملة افتتاحية جاهزة</p>
                      <p className="text-xs leading-6">«{s.pitch}»</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/[0.06] p-2.5 mt-3">
            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide mb-2">
              ✓ التوصية الاستراتيجية للفريق
            </p>
            <p className="text-sm leading-6">
              في الربع الثالث 2026، خصّص <strong>20% من جهد المبيعات على هذا فئة</strong>. السبب: تقارب ثقافي + متوسّط دخل العميل أعلى + مهلة التنفيذ أقصر. يعني صفقات أسرع وأكبر بدون تكلفة تكيّف.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Tier1 — 7 الـ Core ICPs ─────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">الفئة الأولى</Badge>
          <h2 className="text-[14.5px] font-bold">الشرائح الأساسية الـ 7 — مرتّبة بسهولة الإغلاق</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-2 leading-6">
          كل الشريحة المستهدفة فيه: حجم السوق · معدل النمو · القناة المثلى · التعريف جاهز · بيانات حقيقية. <strong>التركيز
          التسويقي يبدأ من الشريحة المستهدفة 1.</strong>
        </p>

        <div className="space-y-1.5">
          {tier1ICPs.map((icp) => {
            const Icon = icp.icon;
            const c = colorMap[icp.color];
            return (
              <Card key={icp.rank} className={`${c.border} ${c.bg}`}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-2 mb-2 flex-wrap">
                    <div className={`p-2.5 rounded-lg ${c.iconBg} shrink-0`}>
                      <Icon className={`h-5 w-5 ${c.text}`} />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[10px] font-mono font-bold ${c.text}`}>ICP #{icp.rank}</span>
                        <span className="text-[10px]">{icp.ease}</span>
                      </div>
                      <h3 className="text-[14.5px] font-bold leading-tight">{icp.name}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-1.5">
                    <div className="rounded-md bg-background/60 border border-border/40 p-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">حجم الشركة</p>
                      <p className="text-xs">{icp.size}</p>
                    </div>
                    <div className="rounded-md bg-background/60 border border-border/40 p-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">حجم السوق</p>
                      <p className="text-xs leading-6">{icp.marketSize}</p>
                    </div>
                    <div className="rounded-md bg-background/60 border border-border/40 p-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">النمو</p>
                      <p className="text-xs leading-6">{icp.growth}</p>
                    </div>
                  </div>

                  <div className="rounded-md bg-background/60 border border-border/40 p-3 mb-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">القنوات المثلى</p>
                    <p className="text-[11px] leading-6">
                      🇸🇦 {icp.channelSA}
                      <br />
                      🇪🇬 {icp.channelEG}
                    </p>
                  </div>

                  <div className="rounded-md border border-amber-500/25 bg-amber-500/[0.05] p-3 mb-1.5">
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1">نقطة الألم</p>
                    <p className="text-sm leading-6">{icp.pain}</p>
                  </div>

                  <div className="rounded-md border border-blue-500/25 bg-blue-500/[0.05] p-3 mb-1.5">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mb-1">📊 بيانات حقيقية للتعريف</p>
                    <p className="text-xs leading-6">{icp.realData}</p>
                  </div>

                  <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.05] p-3">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1">جملة افتتاحية جاهزة</p>
                    <p className="text-sm leading-6">«{icp.pitch}»</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Tier2 — الوكالات ───────────────────────────────────── */}
      <Card className={`${colorMap.indigo.border} ${colorMap.indigo.bg}`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="outline" className="text-[10px] border-indigo-500/40 text-indigo-500">
              الفئة الثانية · بين الشركات استراتيجية (الوكلاء)
            </Badge>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/15">
                <tier2ICP.icon className="h-4 w-4 text-indigo-500" />
              </div>
              <h2 className="text-[14.5px] font-bold">{tier2ICP.name}</h2>
            </div>
          </div>

          <p className="text-sm leading-6 mb-1.5">{tier2ICP.description}</p>

          <div className="rounded-md border border-indigo-500/25 bg-background/60 p-2.5 mb-1.5">
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide mb-1.5">العرض المخصّص</p>
            <p className="text-sm leading-6">«{tier2ICP.pitch}»</p>
          </div>

          <div className="rounded-md border border-blue-500/25 bg-blue-500/[0.05] p-3">
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mb-1">📊 الفرصة</p>
            <p className="text-xs leading-6">{tier2ICP.realData}</p>
          </div>
        </CardContent>
      </Card>

      {/* ── Decision Tree للموظف ─────────────────────────────────── */}
      <Card className="border-primary/30 bg-primary/[0.04]">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <ListChecks className="h-4 w-4 text-primary" />
            <h2 className="text-[14.5px] font-bold">شجرة القرار — هل يستحقّ هذا المهتمّ وقتك؟</h2>
          </div>

          <p className="text-xs text-muted-foreground mb-2 leading-6">
            في أول 30 ثانية من المحادثة، اسأل نفسك هذي الأسئلة بالترتيب:
          </p>

          <div className="space-y-1.5">
            {[
              {
                q: "1. هل هو في إحدى الـ 7 العملاء المثاليون الأساسية؟",
                yes: "→ كمل الاكتشاف",
                no: "→ الفئة الثالثة قائمة المراقبة؟ احتفظ بمعلوماته للمستقبل",
              },
              {
                q: discoveryQuestion,
                yes: "→ كمل بثقة",
                no: "→ اقترح الباقة المجّانية تجربة 30 يوم",
              },
              {
                q: "3. هل عنده فريق تسويق داخلي + ميزانية مفتوحة؟",
                yes: "→ ⚠️ هذا عميل HubSpot — ما هو عميلنا. اعتذر بأدب أو حوّله الفئة الثانية (Reseller)",
                no: "→ ممتاز، عميلنا الذهبي",
              },
              {
                q: "4. هل عنده موقع نشط الآن؟ + هل عنده ترافيك حالي؟",
                yes: "→ الاكتشاف كامل + اقترح audit مجاني",
                no: "→ اقترح ابدأ بـ Modonty من اليوم الأول، توفر سنتين بناء",
              },
            ].map((step, i) => (
              <div key={i} className="rounded-lg border border-primary/20 bg-background/60 p-2.5">
                <p className="text-sm font-bold text-primary mb-2">{step.q}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.04] p-2.5">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-0.5">✓ نعم</p>
                    <p className="leading-6">{step.yes}</p>
                  </div>
                  <div className="rounded-md border border-rose-500/25 bg-rose-500/[0.04] p-2.5">
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wide mb-0.5">✗ لا</p>
                    <p className="leading-6">{step.no}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Pain Points ─────────────────────────────────────────── */}
      <Card className="border-rose-500/30 bg-rose-500/[0.03]">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-rose-500/15">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
            </div>
            <h2 className="text-[14.5px] font-bold">نقاط الألم السبع — احفظها كأسئلة اكتشاف</h2>
          </div>

          <p className="text-xs text-muted-foreground leading-6 mb-2">
            كل واحدة منهم سؤال للعميل في مكالمة الاكتشاف. لما يجاوب «نعم»، انتقل للحل التالي.
          </p>

          <div className="space-y-2">
            {resolvedPains.map((p, i) => (
              <div key={i} className="rounded-lg border border-rose-500/20 bg-background/60 p-2.5">
                <div className="flex items-start gap-2 mb-2">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-[10px] font-bold text-rose-500 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm font-bold flex-1">«{p.pain}»</p>
                </div>
                <div className="flex items-start gap-2 ps-8">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground/85 leading-6">
                    <strong className="text-emerald-500">الحل:</strong> {p.solution}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2.5 border-t border-rose-500/20">
            <p className="text-[11px] font-bold text-rose-500 mb-1.5">المشكلة الأم — في جملة واحدة</p>
            <p className="text-sm leading-6 italic">
              «أنا صاحب شركة، أعرف إن المحتوى يجيب لي عملاء من محركات البحث، بس{" "}
              <strong>ما عندي وقت أكتب</strong>، <strong>ما عندي ميزانية أوظّف كاتب</strong>، و
              <strong>ما أفهم في السيو</strong>.»
            </p>
          </div>
        </CardContent>
      </Card>

    </DocLayout>
  );
}
