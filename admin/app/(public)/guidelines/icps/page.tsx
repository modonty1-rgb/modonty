import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GuidelineLayout } from "../components/guideline-layout";
import { getMomentumPrice } from "@/lib/pricing/format-for-guideline";
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

// ─── Tier 1 — 5 الـ Core ICPs (validated بالبحث) ───────────────
const tier1ICPs: ICP[] = [
  {
    rank: 1,
    ease: "⭐⭐⭐⭐⭐",
    icon: ShoppingBag,
    name: "متاجر التجارة الإلكترونية (Salla / Zid / Shopify)",
    size: "5–50 موظف",
    marketSize: "$31.29 مليار سوق التجارة الإلكترونية في السعودية 2026",
    growth: "+11.92% CAGR (يصل $54.87 مليار بحلول 2031)",
    pain: "المنافسة على محركات البحث قاتلة — كل متجر يبغى نفس الكلمات. CAC الإعلانات يرتفع كل ربع.",
    channelSA: "Meta + Snapchat + Google Search",
    channelEG: "Facebook + Instagram + TikTok",
    pitch: "متجرك على Salla أو Zid؟ تنافس مع 80,000 تاجر في السعودية. مدونتي تعطيك ميزة Authority Blog مدمج — مقالاتك تظهر في نتائج البحث + AI Overviews + ChatGPT Search، وتجيب لك زوار مجاناً بدل ما تدفع لـ Snapchat.",
    realData: "Salla تخدم 80,000 تاجر (44% من السوق). Zid تخدم 5,590 تاجر (12.55%). 97% من السعوديين يبحثون قبل الشراء. 72% من البحث على الجوال.",
    color: "primary",
  },
  {
    rank: 2,
    ease: "⭐⭐⭐⭐⭐",
    icon: BeautyIcon,
    name: "العيادات التجميلية + الأسنان التجميلية (NEW 🌟)",
    size: "عيادة → 5 فروع",
    marketSize: "1.5 مليار ريال سوق طب الأسنان التجميلي في السعودية",
    growth: "60%+ من البالغين السعوديين مهتمون بإجراءات التجميل",
    pain: "العميل يبحث في Google + Instagram + TikTok قبل أي حجز. المنافسة شرسة في الرياض/جدة. الترتيب على «أفضل عيادة تجميل/أسنان» = حجوزات.",
    channelSA: "Instagram + TikTok + Google + Snapchat",
    channelEG: "Instagram + TikTok + Facebook",
    pitch: "العيادة بدون مدونة Authority على Google = خسارة 70% من العملاء المحتملين. مدونتي تنشر مقالات SEO طبية متوافقة مع YMYL، تظهر في AI Overviews لما العميل يبحث «أفضل عيادة...» — وتدمج مع Instagram/TikTok للـ visual proof.",
    realData: "Saudi influencer marketing ROI 5.8× (vs 4.2× global). 99% internet penetration. سوق التجميل السعودي $7.6 مليار بحلول 2026.",
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
    pain: "المرضى يبحثون قبل الحجز. YMYL compliance حساس (Google يعاقب المحتوى الطبي ضعيف الجودة). الحاجة لـ E-E-A-T قوي.",
    channelSA: "Google Search Ads + Snapchat",
    channelEG: "Google + Facebook",
    pitch: "أول 5 نتائج في Google تأخذ 67% من النقرات. مدونتي توصلك هناك بـ 8 مقالات/شهر مكتوبة بـ E-E-A-T كامل + Schema طبي + YMYL compliance — مش أي كاتب يقدر يعمله.",
    realData: "70% من المرضى السعوديين يبحثون عن الأعراض قبل الحجز. الـ Schema الطبي مش feature تختاره — هو شرط بقاء.",
    color: "emerald",
  },
  {
    rank: 4,
    ease: "⭐⭐⭐⭐",
    icon: Scale,
    name: "مكاتب المحاماة والاستشارات",
    size: "فردي → 20 محامي",
    marketSize: "السوق ينمو مع Vision 2030 + قوانين جديدة (NEOM، استثمار أجنبي)",
    growth: "وكالات قانونية متخصصة ظهرت (Clarvia) — يثبت طلب السوق",
    pain: "السوق منافس + Authority = ثقة. المتخصصون اللي ما عندهم مدونة = ما يجيبون عملاء جدد. الـ compliance مع هيئة الإعلام السعودية حساس.",
    channelSA: "LinkedIn + Google Search + Twitter/X",
    channelEG: "LinkedIn + Google",
    pitch: "محامي بدون مدونة Authority = اسم بدون سمعة رقمية. مدونتي تنشر مقالات قانونية متوافقة مع لوائح هيئة الإعلام السعودية + E-E-A-T + Backlinks من modonty.com — تبني المرجعية في 6 شهور.",
    realData: "100% من العملاء B2B يبحثون عن المستشار قبل الاتصال. Authority content = lifetime value × 3.",
    color: "violet",
  },
  {
    rank: 5,
    ease: "⭐⭐⭐⭐",
    icon: Building2,
    name: "العقارات (وسطاء + مطورين)",
    size: "3–30 موظف",
    marketSize: "$864.85M سوق PropTech السعودي",
    growth: "+19.09% سنوياً — Vision 2030 تحرّك القطاع",
    pain: "«شقق للبيع في الياسمين» — مين يظهر يكسب. منصات Aqar (2M زائر/شهر) + Bayut تستحوذ على الـ leads. الوسيط بدون SEO = invisible.",
    channelSA: "Google + Snapchat + TikTok + Instagram",
    channelEG: "Facebook + Instagram + TikTok",
    pitch: "وسيط عقاري؟ مدونة Authority واحدة تجيب لك Leads أكثر من 10 لوحات في الشارع. مع AI-powered marketing، نستهدف نية شراء عالية. منصات الـ portals (Aqar, Bayut) تأخذ عمولة — مدونتي تجيب leads لك مباشرة بدون عمولة.",
    realData: "Aqar.fm: 2 مليون زائر شهرياً. PropTech ينمو 19% سنوياً. 78% من السعوديين على 5G — 100% mobile-first market.",
    color: "amber",
  },
  {
    rank: 6,
    ease: "⭐⭐⭐⭐",
    icon: Plane,
    name: "السياحة والسفر (NEW 🌟)",
    size: "وكالة سفر → سلسلة",
    marketSize: "هدف 150 مليون زائر للسعودية بحلول 2030",
    growth: "Vision 2030 priority — استثمارات NEOM + الخليج العربي + موسم الرياض",
    pain: "العميل يبحث «أفضل وجهة سياحية في السعودية» / «حجز عمرة + تنقلات» — مين يظهر يحجز. المنافسة مع منصات عالمية (Booking, Agoda).",
    channelSA: "Instagram + TikTok + YouTube + Google",
    channelEG: "Facebook + Instagram + YouTube",
    pitch: "وكالة سفر بدون Authority Blog = تتنازل عن السوق لـ Booking + Skyscanner. مدونتي تكتب لك مقالات SEO عربية للوجهات (NEOM، الرياض، العلا، البحر الأحمر) — تظهر في AI Overviews + Reels marketing.",
    realData: "Saudi tourism وزارة طموحة — 150M زائر بحلول 2030. سوق الإعلانات الرقمي يتسارع. الـ visual content (Reels) = الأقوى.",
    color: "cyan",
  },
  {
    rank: 7,
    ease: "⭐⭐⭐",
    icon: UtensilsCrossed,
    name: "المطاعم والضيافة (Local SEO)",
    size: "فرع → سلسلة 10",
    marketSize: "5G coverage 78% — كل بحث طعام = mobile first",
    growth: "AI Overviews تغيّر نتائج البحث — Reviews أهم من قبل",
    pain: "Google Business Profile لا يكفي. التطبيقات (HungerStation/Jahez) تأخذ 15-30% عمولة. المطاعم بدون موقع مع SEO = تخسر هامش الربح.",
    channelSA: "Instagram + TikTok + Snapchat + Google",
    channelEG: "Facebook + Instagram + TikTok",
    pitch: "مطعمك على GBP؟ ممتاز. لكن AI Overviews وReviews ranking signals — تحتاج مقالات SEO لكل وجبة + موقع مع طلبات مباشرة (بدون 30% عمولة). مدونتي تشغّل النظامين.",
    realData: "Reviews = direct ranking signal. AI Overviews تأخذ 30%+ من الـ clicks. Direct ordering يوفر 15-30% عمولة المنصات.",
    color: "indigo",
  },
];

// ─── Tier 2 — Resellers (Agencies) ──────────────────────────
const tier2ICP = {
  icon: Briefcase,
  name: "الوكالات الرقمية (Resellers)",
  description: "وكالة وحدة = 10–50 عميل دفعة وحدة. White-label = توسّع سريع.",
  pitch: "بدل ما توظّف 5 كتّاب، وفّرها لعملائك بـ White Label تحت اسمك. خصم خاص للوكالات + لوحة admin مخصصة.",
  realData: "السعودية فيها 200+ وكالة ديجيتال نشطة. كل وكالة = potential 10-50 client.",
} as const;

// ─── Tier 3 — Watchlist (قطاعات واعدة للمستقبل) ──────────────
const tier3Watchlist = [
  {
    name: "التعليم والتدريب الإلكتروني",
    why: "HRDF يعوّض الموظفين السعوديين على الكورسات — طلب عالي + ميزانيات حكومية",
    when: "بعد ما نختبر الـ 7 ICPs الأساسية (Q3 2026)",
    color: "violet",
  },
  {
    name: "Tech Startups (B2B SaaS)",
    why: "السعودية تستثمر بقوة في الـ tech sector — Vision 2030 + NEOM",
    when: "Q4 2026 — يحتاج ICP profile مختلف (B2B SaaS marketing مختلف عن SMB)",
    color: "blue",
  },
  {
    name: "المنشآت العامة والحكومية",
    why: "Vision 2030 = مشاريع ضخمة + ميزانيات تواصل",
    when: "بعد ما نبني case studies كبيرة — 2027",
    color: "emerald",
  },
  {
    name: "البناء والمقاولات",
    why: "قطاع ضخم في السعودية — لكن digital adoption أبطأ",
    when: "Watchlist — نراقب نضوج digital transformation",
    color: "amber",
  },
] as const;

// ─── Saudi Market Data (2026) ────────────────────────────────
const saudiMarketData = [
  { metric: "$31.29 مليار", label: "حجم سوق التجارة الإلكترونية 2026", source: "Mordor Intelligence" },
  { metric: "97%", label: "من السعوديين يبحثون قبل الشراء", source: "Saudi Digital Report 2026" },
  { metric: "72%", label: "من البحث يحصل على الجوال", source: "Saudi Digital Report 2026" },
  { metric: "78%", label: "تغطية 5G في السعودية", source: "Saudi Telecom" },
  { metric: "5.8×", label: "ROI الـ Influencer Marketing (السعودية)", source: "Sprinklr 2026" },
  { metric: "150M", label: "هدف الزوار السياحيين بحلول 2030", source: "Vision 2030" },
] as const;

// ─── Egypt Market Data (2026) ────────────────────────────────
const egyptMarketData = [
  { metric: "98.2M", label: "مستخدم إنترنت في مصر (82.7%)", source: "DataReportal 2026" },
  { metric: "51.6M", label: "مستخدم سوشيال ميديا (43.4%)", source: "DataReportal 2026" },
  { metric: "$11.49B", label: "حجم سوق التجارة الإلكترونية 2026", source: "Mordor Intelligence" },
  { metric: "+11.89%", label: "CAGR (يصل $20.15B بحلول 2031)", source: "Mordor Intelligence" },
  { metric: "89%", label: "Facebook penetration — «الـ Digital Home»", source: "Sedra Media 2026" },
] as const;

// ─── 7 Pain Points (validated) ────────────────────────────────
const sevenPains = [
  { pain: "ما عندي وقت أكتب", solution: "فريق مدونتي يكتب نيابة عنك — كل المحتوى يدوي ومحترف، 8 مقالات شهرياً" },
  { pain: "ما عندي ميزانية وكالة", solution: "__BUDGET_SOLUTION__" },
  { pain: "ما أعرف SEO", solution: "JSON-LD + Meta + Sitemap + Schema — كلها تلقائية للظهور في محركات البحث + AI Overviews" },
  { pain: "ما أعرف هل المحتوى ينفع", solution: "Lead Scoring 0–100 لكل زائر + تحليلات GA4 شفافة" },
  { pain: "ما أعرف إيش يكتب", solution: "استبيان SEO Intake + تتبّع منافسين + AI suggestions — نقترح المواضيع بناءً على نية البحث" },
  { pain: "ينقصني تنبيهات لحظية", solution: "Telegram alerts على 26 حدث — مقال نُشر، Lead جديد، تعليق..." },
  { pain: "ما أتابع Google Search Console", solution: "تكامل مباشر مع GSC + PageSpeed + AI Crawler Optimization — كل شي في لوحة واحدة" },
] as const;

// ─── Demographics ─────────────────────────────────────────────
const demographics = [
  { dim: "العمر", sa: "30–55", eg: "28–50" },
  { dim: "الجنس", sa: "75% رجال (مع نمو نسائي قوي في القطاعات الـ B2C)", eg: "65% رجال" },
  { dim: "التعليم", sa: "جامعي +", eg: "جامعي +" },
  { dim: "الدخل الشخصي", sa: "8K+ ريال/شهر", eg: "15K+ جنيه/شهر" },
  { dim: "المدن الرئيسية", sa: "الرياض · جدة · الدمام · الخبر", eg: "القاهرة · الجيزة · الإسكندرية" },
  { dim: "اللغة", sa: "عربية فصيحة + إنجليزية تقنية", eg: "لهجة مصرية + إنجليزية تقنية" },
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

export default async function ICPsPage() {
  const m = await getMomentumPrice("SA");
  const monthly = m?.monthly ?? "1,299";
  const wordpress = 18000;
  const budgetSolution = `بأقل من 10% من سعر الوكالة (Momentum ${monthly} شهري vs ${wordpress.toLocaleString("en-GB")} شهري لفريق WordPress)`;
  const discoveryQuestion = `2. هل يقدر يدفع ${monthly} ريال شهرياً (Momentum)؟`;

  const resolvedPains = sevenPains.map((p) => ({
    ...p,
    solution: p.solution === "__BUDGET_SOLUTION__" ? budgetSolution : p.solution,
  }));

  return (
    <GuidelineLayout
      title="العملاء المثاليون (ICPs) — دراسة سوق 2026"
      description="دراسة كاملة مع بيانات سوق موثّقة — 7 ICPs أساسية + Tier 2 الوكالات + Watchlist + decision tree"
    >
      {/* ── Hero — السياق الكلي ─────────────────────────────────── */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/[0.06] via-background to-background">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/30 shrink-0">
              <Target className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold mb-2">لماذا الآن؟ — السياق الكلي</h2>
              <p className="text-sm leading-loose text-foreground/85">
                Vision 2030 السعودية + نمو رقمي مصري متسارع = نافذة ذهبية. السوق العربي ينضج رقمياً بسرعة
                لم يسبق لها مثيل، لكن <strong>SMBs ما تقدر تواكب لوحدها</strong> — ميزانياتها محدودة،
                فرقها صغيرة، وفهمها الـ SEO ضعيف. هنا تدخل Modonty.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-red-500/30 bg-red-500/[0.04] p-4">
              <p className="text-[11px] font-bold text-red-400 uppercase tracking-wide mb-2">❌ عميلنا مو</p>
              <p className="text-sm leading-relaxed">
                شركة كبرى عندها فريق تسويق + ميزانية مفتوحة. هؤلاء يروحون لـ <strong>HubSpot</strong>.
              </p>
            </div>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.04] p-4">
              <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wide mb-2">✓ عميلنا هو</p>
              <p className="text-sm leading-relaxed">
                صاحب شركة <strong>صغيرة-متوسطة</strong> يعرف إن المحتوى مهم — بس ما عنده وقت، فريق، ولا
                ميزانية وكالة.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Saudi Market Snapshot 2026 ──────────────────────────── */}
      <Card className="border-emerald-500/25 bg-emerald-500/[0.03]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🇸🇦</span>
            <h2 className="text-base font-bold">السوق السعودي — لقطة 2026</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            البيانات من مصادر معتمدة (Mordor Intelligence · Sprinklr · DataReportal · Vision 2030).
            <strong> هذي الأرقام يحفظها الموظف ويستخدمها في الـ pitch.</strong>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {saudiMarketData.map((d, i) => (
              <div key={i} className="rounded-lg border border-emerald-500/25 bg-background/70 p-3 text-center">
                <p className="text-2xl font-bold text-emerald-500 font-mono mb-1">{d.metric}</p>
                <p className="text-[11px] text-foreground/85 leading-relaxed mb-1.5">{d.label}</p>
                <p className="text-[9px] text-muted-foreground italic">— {d.source}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Egypt Market Snapshot 2026 ──────────────────────────── */}
      <Card className="border-amber-500/25 bg-amber-500/[0.03]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🇪🇬</span>
            <h2 className="text-base font-bold">السوق المصري — لقطة 2026</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            مصر سوق فيسبوك أولاً — ليس مثل السعودية. الترتيب القناتي يختلف جذرياً.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {egyptMarketData.map((d, i) => (
              <div key={i} className="rounded-lg border border-amber-500/25 bg-background/70 p-3 text-center">
                <p className="text-2xl font-bold text-amber-500 font-mono mb-1">{d.metric}</p>
                <p className="text-[11px] text-foreground/85 leading-relaxed mb-1.5">{d.label}</p>
                <p className="text-[9px] text-muted-foreground italic">— {d.source}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── 🌟 Tier Strategic — القطاعات المصرية التي تستهدف السائح الخليجي ── */}
      <Card className="border-2 border-cyan-500/40 bg-gradient-to-br from-cyan-500/[0.06] via-background to-background">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Badge className="text-[10px] bg-cyan-500 text-white">⭐ Tier Strategic</Badge>
            <h2 className="text-base font-bold flex-1 min-w-0">
              القطاعات المصرية التي تستهدف السائح الخليجي — أسهل عملاء على الإطلاق
            </h2>
          </div>

          <div className="rounded-md border border-cyan-500/30 bg-cyan-500/[0.05] p-4 mb-5">
            <p className="text-[11px] font-bold text-cyan-600 uppercase tracking-wide mb-2">
              🎯 ليش هذا Tier استراتيجي؟
            </p>
            <p className="text-sm leading-loose mb-3">
              هذي القطاعات المصرية <strong>تتكلم العربية للجمهور الخليجي بطبيعتها</strong>. يعني:
            </p>
            <ul className="space-y-1.5 text-xs leading-relaxed text-foreground/85">
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 shrink-0 font-bold">①</span>
                <span>
                  <strong>محتواهم بالفعل عربي خليجي</strong> → ما نحتاج نعدّل لغتنا، نحن جاهزين
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 shrink-0 font-bold">②</span>
                <span>
                  <strong>يستفيدون مباشرة من Authority modonty.com السعودي</strong> → نطاقنا يخدمهم،
                  مش يضرّهم
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 shrink-0 font-bold">③</span>
                <span>
                  <strong>الـ keywords التي يستهدفونها = نفس keywords السعودية</strong> (خليجي يبحث في
                  Google السعودي عن وجهات/خدمات في مصر)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 shrink-0 font-bold">④</span>
                <span>
                  <strong>ARPU أعلى</strong> → يخدمون عملاء HNW خليجيين (ميزانياتهم أعلى من المصريين
                  المحليين)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 shrink-0 font-bold">⑤</span>
                <span>
                  <strong>Easy onboarding</strong> — Cultural fit طبيعي، لا حاجة لتعليمهم سياق السوق
                  السعودي
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            {[
              {
                num: 1,
                icon: Plane,
                color: "cyan",
                name: "منتجعات البحر الأحمر (شرم الشيخ · الغردقة · مرسى علم)",
                marketSize: "19M سائح في مصر 2025 · 3M+ زائر لشرم وحدها",
                growth: "65-75% occupancy خلال مواسم الذروة (حتى رمضان)",
                gulfFocus: "السائح الخليجي = نسبة كبيرة من نزلاء المنتجعات + Saudi insurance agreements في شرم",
                pain: "المنتجع المصري يخسر الحجوزات لـ Booking.com + Agoda. ما يظهر في «أفضل منتجع شرم» على Google السعودي.",
                pitch: "منتجعك يستهدف الخليجيين؟ مدونتي تكتب لك مقالات SEO عربية بلهجة خليجية تظهر لما السعودي يبحث «أفضل منتجع في شرم» — مع Authority Blog السعودي يعطيك ميزة فورية على المنافسين المحليين والمنصات العالمية.",
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
                pitch: "مركزك يستقبل مرضى خليجيين؟ السوق المصري في boom (نمو 76%). مدونتي تكتب لك مقالات طبية بـ E-E-A-T + YMYL — العميل السعودي يبحث «أفضل عيادة في مصر» ويلقاك مباشرة بدون عمولة وسيط.",
                ease: "⭐⭐⭐⭐⭐",
              },
              {
                num: 3,
                icon: Building2,
                color: "amber",
                name: "العقارات الخليجية في مصر (الساحل الشمالي · رأس الحكمة · NAC)",
                marketSize: "$1.4 مليار تدفقات خليجية ($709M UAE + $403M Saudi)",
                growth: "ROI 8-14% · رأس الحكمة +15% تقدير في 2025",
                gulfFocus: "51% من المشترين GCC HNWI يستخدمونها كـ second home. 56% من السعوديين يستهدفون New Administrative Capital",
                pain: "المطوّر المصري بدون SEO عربي = invisible للمشتري السعودي. المنافسة مع وسطاء وصفحات Facebook عشواء.",
                pitch: "تطوّر مشاريع في الساحل أو NAC؟ المشتري السعودي/الإماراتي يبحث الآن. مدونتي تنشر مقالات SEO عربية تستهدف «شقة في رأس الحكمة للسعوديين» — الـ keywords اللي ما تستهدفها وكالات مصرية محلية.",
                ease: "⭐⭐⭐⭐",
              },
              {
                num: 4,
                icon: Briefcase,
                color: "violet",
                name: "التعليم والبرامج الصيفية الأكاديمية للخليجيين",
                marketSize: "2.9M عامل مصري في السعودية = جالية ضخمة + روابط ثقافية",
                growth: "هدف مصر: 6% طلاب دوليين بحلول 2030 (Vision Egypt)",
                gulfFocus: "البرامج الصيفية والمدارس الخاصة الموجّهة للسعوديين/الإماراتيين تتنامى",
                pain: "البرنامج الصيفي المصري ما يصل للأهل السعوديين على Google. Marketing عبر Facebook ضعيف جداً للعميل الخليجي الـ premium.",
                pitch: "برنامج صيفي للطلاب الخليجيين؟ الأهالي السعوديون يبحثون «أفضل برنامج صيفي في مصر للأبناء». مدونتي تنشر مقالات بـ Schema تعليمي + author profiles + reviews — تظهر فورياً في Google السعودي.",
                ease: "⭐⭐⭐⭐",
              },
            ].map((s) => {
              const Icon = s.icon;
              const c = colorMap[s.color];
              return (
                <Card key={s.num} className={`${c.border} ${c.bg}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3 flex-wrap">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="rounded-md bg-background/60 border border-border/40 p-2.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">حجم السوق</p>
                        <p className="leading-relaxed">{s.marketSize}</p>
                      </div>
                      <div className="rounded-md bg-background/60 border border-border/40 p-2.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">النمو</p>
                        <p className="leading-relaxed">{s.growth}</p>
                      </div>
                    </div>

                    <div className="rounded-md border border-cyan-500/25 bg-cyan-500/[0.05] p-3 mb-3">
                      <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-wide mb-1">🎯 الزاوية الخليجية</p>
                      <p className="text-xs leading-relaxed">{s.gulfFocus}</p>
                    </div>

                    <div className="rounded-md border border-amber-500/25 bg-amber-500/[0.05] p-3 mb-3">
                      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1">نقطة الألم</p>
                      <p className="text-xs leading-relaxed">{s.pain}</p>
                    </div>

                    <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.05] p-3">
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1">جملة افتتاحية جاهزة</p>
                      <p className="text-xs leading-relaxed">«{s.pitch}»</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/[0.06] p-4 mt-5">
            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide mb-2">
              ✓ التوصية الاستراتيجية للفريق
            </p>
            <p className="text-sm leading-loose">
              في الـ Q3 2026، خصّص <strong>20% من جهد المبيعات على هذا الـ tier</strong>. السبب: cultural
              fit + ARPU أعلى + lead time أقصر. يعني صفقات أسرع وأكبر بدون تكلفة تكيّف.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Tier 1 — 7 الـ Core ICPs ─────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">Tier 1</Badge>
          <h2 className="text-base font-bold">الشرائح الأساسية الـ 7 — مرتّبة بسهولة الإغلاق</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          كل ICP فيه: حجم السوق · معدل النمو · القناة المثلى · Pitch جاهز · بيانات حقيقية. <strong>التركيز
          التسويقي يبدأ من ICP 1.</strong>
        </p>

        <div className="space-y-3">
          {tier1ICPs.map((icp) => {
            const Icon = icp.icon;
            const c = colorMap[icp.color];
            return (
              <Card key={icp.rank} className={`${c.border} ${c.bg}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4 mb-4 flex-wrap">
                    <div className={`p-2.5 rounded-lg ${c.iconBg} shrink-0`}>
                      <Icon className={`h-5 w-5 ${c.text}`} />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[10px] font-mono font-bold ${c.text}`}>ICP #{icp.rank}</span>
                        <span className="text-[10px]">{icp.ease}</span>
                      </div>
                      <h3 className="text-base font-bold leading-tight">{icp.name}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-3">
                    <div className="rounded-md bg-background/60 border border-border/40 p-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">حجم الشركة</p>
                      <p className="text-xs">{icp.size}</p>
                    </div>
                    <div className="rounded-md bg-background/60 border border-border/40 p-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">حجم السوق</p>
                      <p className="text-xs leading-relaxed">{icp.marketSize}</p>
                    </div>
                    <div className="rounded-md bg-background/60 border border-border/40 p-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">النمو</p>
                      <p className="text-xs leading-relaxed">{icp.growth}</p>
                    </div>
                  </div>

                  <div className="rounded-md bg-background/60 border border-border/40 p-3 mb-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">القنوات المثلى</p>
                    <p className="text-[11px] leading-relaxed">
                      🇸🇦 {icp.channelSA}
                      <br />
                      🇪🇬 {icp.channelEG}
                    </p>
                  </div>

                  <div className="rounded-md border border-amber-500/25 bg-amber-500/[0.05] p-3 mb-3">
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1">نقطة الألم</p>
                    <p className="text-sm leading-relaxed">{icp.pain}</p>
                  </div>

                  <div className="rounded-md border border-blue-500/25 bg-blue-500/[0.05] p-3 mb-3">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mb-1">📊 بيانات حقيقية للـ pitch</p>
                    <p className="text-xs leading-relaxed">{icp.realData}</p>
                  </div>

                  <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.05] p-3">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1">جملة افتتاحية جاهزة</p>
                    <p className="text-sm leading-relaxed">«{icp.pitch}»</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Tier 2 — الوكالات ───────────────────────────────────── */}
      <Card className={`${colorMap.indigo.border} ${colorMap.indigo.bg}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Badge variant="outline" className="text-[10px] border-indigo-500/40 text-indigo-500">
              Tier 2 · B2B Strategic (Resellers)
            </Badge>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/15">
                <tier2ICP.icon className="h-4 w-4 text-indigo-500" />
              </div>
              <h2 className="text-base font-bold">{tier2ICP.name}</h2>
            </div>
          </div>

          <p className="text-sm leading-relaxed mb-3">{tier2ICP.description}</p>

          <div className="rounded-md border border-indigo-500/25 bg-background/60 p-4 mb-3">
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide mb-1.5">العرض المخصّص</p>
            <p className="text-sm leading-relaxed">«{tier2ICP.pitch}»</p>
          </div>

          <div className="rounded-md border border-blue-500/25 bg-blue-500/[0.05] p-3">
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mb-1">📊 الفرصة</p>
            <p className="text-xs leading-relaxed">{tier2ICP.realData}</p>
          </div>
        </CardContent>
      </Card>

      {/* ── Tier 3 — Watchlist ──────────────────────────────────── */}
      <Card className="border-violet-500/25 bg-violet-500/[0.03]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="text-[10px] border-violet-500/40 text-violet-500">
              Tier 3 · Watchlist
            </Badge>
            <h2 className="text-base font-bold">قطاعات واعدة — للمستقبل القريب</h2>
          </div>

          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            هذي القطاعات يبدو إنها قوية، لكن نأجّلها للـ Q3-Q4 2026 لما نختبر الـ 7 الأساسية أولاً.
            <strong> نراقب، لا نستهدف الآن.</strong>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tier3Watchlist.map((t, i) => {
              const c = colorMap[t.color];
              return (
                <div key={i} className={`rounded-lg border ${c.border} ${c.bg} p-4`}>
                  <p className={`text-sm font-bold ${c.text} mb-2`}>{t.name}</p>
                  <p className="text-xs leading-relaxed mb-2">
                    <strong>ليش واعد:</strong> {t.why}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <strong>متى نستهدفه:</strong> {t.when}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Decision Tree للموظف ─────────────────────────────────── */}
      <Card className="border-primary/30 bg-primary/[0.04]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ListChecks className="h-4 w-4 text-primary" />
            <h2 className="text-base font-bold">شجرة قرار للموظف — هل هذا الـ Lead يستحق الوقت؟</h2>
          </div>

          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            في أول 30 ثانية من المحادثة، اسأل نفسك هذي الأسئلة بالترتيب:
          </p>

          <div className="space-y-2.5">
            {[
              {
                q: "1. هل هو في إحدى الـ 7 ICPs الأساسية؟",
                yes: "→ كمل الـ Discovery",
                no: "→ Tier 3 Watchlist؟ احتفظ بمعلوماته للمستقبل",
              },
              {
                q: discoveryQuestion,
                yes: "→ كمل بثقة",
                no: "→ اقترح Free tier تجربة 30 يوم",
              },
              {
                q: "3. هل عنده فريق تسويق داخلي + ميزانية مفتوحة؟",
                yes: "→ ⚠️ هذا عميل HubSpot — ما هو عميلنا. اعتذر بأدب أو حوّله Tier 2 (Reseller)",
                no: "→ ممتاز، عميلنا الذهبي",
              },
              {
                q: "4. هل عنده موقع نشط الآن؟ + هل عنده ترافيك حالي؟",
                yes: "→ Discovery كامل + اقترح audit مجاني",
                no: "→ اقترح ابدأ بـ Modonty من اليوم الأول، توفر سنتين بناء",
              },
            ].map((step, i) => (
              <div key={i} className="rounded-lg border border-primary/20 bg-background/60 p-4">
                <p className="text-sm font-bold text-primary mb-2">{step.q}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.04] p-2.5">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-0.5">✓ نعم</p>
                    <p className="leading-relaxed">{step.yes}</p>
                  </div>
                  <div className="rounded-md border border-rose-500/25 bg-rose-500/[0.04] p-2.5">
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wide mb-0.5">✗ لا</p>
                    <p className="leading-relaxed">{step.no}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Pain Points ─────────────────────────────────────────── */}
      <Card className="border-rose-500/30 bg-rose-500/[0.03]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-rose-500/15">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
            </div>
            <h2 className="text-base font-bold">نقاط الألم السبع — احفظها كأسئلة للـ Discovery</h2>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            كل واحدة منهم سؤال للعميل في الـ Discovery Call. لما يجاوب «نعم»، انتقل للحل التالي.
          </p>

          <div className="space-y-2">
            {resolvedPains.map((p, i) => (
              <div key={i} className="rounded-lg border border-rose-500/20 bg-background/60 p-4">
                <div className="flex items-start gap-2 mb-2">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-[10px] font-bold text-rose-500 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm font-bold flex-1">«{p.pain}»</p>
                </div>
                <div className="flex items-start gap-2 ps-8">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground/85 leading-relaxed">
                    <strong className="text-emerald-500">الحل:</strong> {p.solution}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-rose-500/20">
            <p className="text-[11px] font-bold text-rose-500 mb-1.5">المشكلة الأم — في جملة واحدة</p>
            <p className="text-sm leading-loose italic">
              «أنا صاحب شركة، أعرف إن المحتوى يجيب لي عملاء من محركات البحث، بس{" "}
              <strong>ما عندي وقت أكتب</strong>، <strong>ما عندي ميزانية أوظّف كاتب</strong>، و
              <strong>ما أفهم في SEO</strong>.»
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Demographics ────────────────────────────────────────── */}
      <Card className="border-blue-500/25 bg-blue-500/[0.03]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-blue-500/15">
              <MapPin className="h-4 w-4 text-blue-500" />
            </div>
            <h2 className="text-base font-bold">الـ Demographics — السعودية ومصر</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-500/25">
                  <th className="text-start p-2 text-[11px] font-bold text-blue-500 uppercase tracking-wide">البُعد</th>
                  <th className="text-start p-2 text-[11px] font-bold text-blue-500 uppercase tracking-wide">🇸🇦 السعودية</th>
                  <th className="text-start p-2 text-[11px] font-bold text-blue-500 uppercase tracking-wide">🇪🇬 مصر</th>
                </tr>
              </thead>
              <tbody>
                {demographics.map((d, i) => (
                  <tr key={i} className="border-b border-blue-500/15 last:border-0">
                    <td className="p-2.5 text-xs font-bold align-top">{d.dim}</td>
                    <td className="p-2.5 text-xs text-foreground/85 align-top">{d.sa}</td>
                    <td className="p-2.5 text-xs text-foreground/85 align-top">{d.eg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Sources — مع روابط للتحقق ─────────────────────────────── */}
      <Card className="border-blue-500/25 bg-blue-500/[0.03]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-blue-500/15">
              <Lightbulb className="h-4 w-4 text-blue-500" />
            </div>
            <h2 className="text-base font-bold">المصادر — Sources الموثّقة (للتحقق)</h2>
          </div>

          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            كل الأرقام والإحصاءات في هذي الصفحة <strong>مأخوذة من مصادر معتمدة</strong>. اضغط على أي
            مصدر للتحقق المباشر — مدونتي تطبّق القاعدة 4: <strong>«الأرقام = الواقع 100%»</strong>.
          </p>

          <div className="space-y-2.5">
            {[
              {
                category: "🇸🇦 السعودية — التجارة الإلكترونية",
                links: [
                  { name: "Saudi Arabia Ecommerce Market Size — Mordor Intelligence", url: "https://www.mordorintelligence.com/industry-reports/saudi-arabia-ecommerce-market" },
                  { name: "The State of Salla in 2026 — StoreLeads", url: "https://storeleads.app/reports/salla" },
                  { name: "The State of Zid in 2026 — StoreLeads", url: "https://storeleads.app/reports/zid" },
                  { name: "eCommerce Statistics in Saudi Arabia 2026 — AfterShip", url: "https://www.aftership.com/ecommerce/statistics/regions/sa" },
                ],
              },
              {
                category: "🇸🇦 السعودية — العيادات التجميلية والأسنان",
                links: [
                  { name: "Saudi Arabia Cosmetic Dentistry Market — BlueWeave", url: "https://www.blueweaveconsulting.com/report/saudi-arabia-cosmetic-dentistry-market" },
                  { name: "Saudi Arabia Beauty and Personal Care Market", url: "https://www.psmarketresearch.com/market-analysis/saudi-arabia-beauty-personal-care-products-market-report" },
                  { name: "Saudi Arabia Digital Dentistry Market — Ken Research", url: "https://www.kenresearch.com/saudi-arabia-digital-dentistry-market" },
                  { name: "Influence of Social Media on Cosmetic Decisions in Saudi Arabia — Frontiers", url: "https://www.frontiersin.org/journals/digital-health/articles/10.3389/fdgth.2026.1775085/full" },
                ],
              },
              {
                category: "🇸🇦 السعودية — السوشيال ميديا والـ Influencer Marketing",
                links: [
                  { name: "Social Media in Saudi Arabia 2026 — Sprinklr", url: "https://www.sprinklr.com/blog/social-media-in-saudi-arabia/" },
                  { name: "Top Beauty TikTok Influencers in Saudi Arabia — Heepsy", url: "https://www.heepsy.com/top-tiktok/beauty/saudi-arabia" },
                ],
              },
              {
                category: "🇸🇦 السعودية — العقارات والـ PropTech",
                links: [
                  { name: "PropTech in Saudi Arabia 2026 — Bayut", url: "https://www.bayut.sa/blog/en/marketing-intelligence/proptech-in-saudi-arabia-2026-the-digital-shift/" },
                  { name: "Saudi Real Estate Marketing 2026 — Mada Properties", url: "https://www.madaproperties.sa/en/blogs/top-real-estate-marketing-companies-in-saudi-arabia-2026" },
                  { name: "Top Real Estate Marketing Tools — Aqar Blog", url: "https://sa.aqar.fm/blog/en/real-estate-marketing/top-real-estate-marketing-tools-in-saudi-arabia/" },
                ],
              },
              {
                category: "🇸🇦 السعودية — السياحة و Vision 2030",
                links: [
                  { name: "Saudi Vision 2030 Tourism Strategy — Visit Saudi", url: "https://www.visitsaudi.com/en/stories/vision-2030" },
                  { name: "Saudi Tourism Authority — Vision & Mission", url: "https://www.sta.gov.sa/en/about" },
                  { name: "Tourism Sector in Saudi Vision 2030 — STA", url: "https://www.sta.gov.sa/en/vision2030" },
                ],
              },
              {
                category: "🇸🇦 السعودية — SEO و SMB Digital Marketing",
                links: [
                  { name: "Digital Marketing in Saudi Arabia: SMEs & Vision 2030 — Dclode", url: "https://dclode.com/digital-marketing-in-saudi-arabia/" },
                  { name: "Saudi SMEs Digital Marketing Performance Study — Tandfonline", url: "https://www.tandfonline.com/doi/full/10.1080/23311975.2024.2306974" },
                  { name: "Top 7 SEO Strategies for Saudi Businesses 2026 — Wasfa Digital", url: "https://digitalwasfa.com/top-7-seo-strategies-that-work-for-saudi-arabia-businesses-in-2026/" },
                ],
              },
              {
                category: "🇪🇬 مصر — Digital + E-commerce",
                links: [
                  { name: "Digital 2026: Egypt — DataReportal", url: "https://datareportal.com/reports/digital-2026-egypt" },
                  { name: "Egypt E-commerce Market Size — Mordor Intelligence", url: "https://www.mordorintelligence.com/industry-reports/egypt-ecommerce-market" },
                  { name: "Egypt Online Advertising Market — Ken Research", url: "https://www.kenresearch.com/egypt-online-advertising-and-social-commerce-market" },
                  { name: "Digital Marketing in Egypt 2026 — Sedra Media", url: "https://sedramedia.com/digital-marketing-in-egypt/" },
                ],
              },
              {
                category: "🇪🇬 مصر — السياحة الخليجية + منتجعات البحر الأحمر",
                links: [
                  { name: "Saudi Arabia & Egypt Boost Tourism 2026 — MICE Travel Advisor", url: "https://www.micetraveladvisor.com/news/article/saudi-arabia-egypt-boost-tourism-in-2026-visitor-numbers-soar-with-strong-growth-from-uae-india-indonesia-more/" },
                  { name: "Egypt Tourism Trends 2026 — Hurghada To Go", url: "https://www.hurghadatogo.com/egypt-tourism-trends/" },
                  { name: "Egypt Tourism Sector Historic Milestone 2025 — Egypt Today", url: "https://www.facebook.com/EgyptTodayMag/posts/egypts-tourism-sector-reached-a-historic-milestone-in-2025-welcoming-nearly-19-m/1335358798606439/" },
                ],
              },
              {
                category: "🇪🇬 مصر — السياحة العلاجية والمستشفيات",
                links: [
                  { name: "Egypt's Medical Tourism Booms 75% Growth 2025 — The Traveler", url: "https://www.thetraveler.org/egypts-medical-tourism-booms-with-75-growth-in-2025/" },
                  { name: "Egypt Medical Tourism Surges 76% — eTurboNews", url: "https://eturbonews.com/egypt-medical-tourism-growth-2025-africa-middle-east/" },
                  { name: "Egypt Medical Tourism Why Patients Choose Egypt — PyraMedicine", url: "https://pyramedicine.com/medical-tourism-why-patients-choose-egypt/" },
                  { name: "Top 5 Medical Specialties in Egypt — Macrocare", url: "https://macro.care/en/blog/top-5-medical-specialties-egypt" },
                ],
              },
              {
                category: "🇪🇬 مصر — العقارات الخليجية (الساحل + رأس الحكمة + NAC)",
                links: [
                  { name: "Gulf money fuels Egypt real estate $1.4B — Arabian Business", url: "https://www.arabianbusiness.com/industries/real-estate/gulf-money-fuels-egypt-real-estate-with-uae-saudi-leading-1-4-bn-inflows" },
                  { name: "Gulf nations betting big on Egypt's North Coast — CNN", url: "https://www.cnn.com/2025/10/16/business/egypt-north-coast-gulf-investment-spc" },
                  { name: "Egypt Coastal Real Estate Trends 2026 — Elbayt", url: "https://elbayt.com/en/real-estate/hurghada-north-coast-and-red-sea-coastal-real-estate-trends-investment-returns-2026" },
                  { name: "Foreign Investment Trends in Egyptian Real Estate 2026 — Elbayt", url: "https://elbayt.com/en/real-estate/foreign-investment-trends-in-egyptian-real-estate-for-2026" },
                ],
              },
              {
                category: "🇪🇬 مصر — التعليم والمدارس الدولية",
                links: [
                  { name: "Education in Egypt — WENR (World Education News)", url: "https://wenr.wes.org/2019/02/education-in-egypt-2" },
                  { name: "EXEGYPT Summer School Program", url: "https://exegypt.org/summer-school/" },
                  { name: "List of International Schools in Egypt", url: "https://www.international-schools-database.com/country/egypt" },
                ],
              },
              {
                category: "🌍 عام — Restaurant SEO + Local SEO",
                links: [
                  { name: "Local SEO for Restaurants 2026 — DoorDash", url: "https://merchants.doordash.com/en-us/blog/restaurant-seo-2026" },
                  { name: "Restaurant SEO Complete Guide 2026 — Chowly", url: "https://chowly.com/resources/blogs/restaurant-seo-the-complete-guide-to-getting-found-on-google/" },
                  { name: "Google Business Profile Local SEO Guide 2026 — BigRedSEO", url: "https://www.bigredseo.com/google-business-profile-local-seo/" },
                ],
              },
            ].map((group, gi) => (
              <div key={gi} className="rounded-md border border-blue-500/20 bg-background/60 p-3">
                <p className="text-[11px] font-bold text-blue-500 mb-2">{group.category}</p>
                <ul className="space-y-1.5">
                  {group.links.map((link, li) => (
                    <li key={li} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                      <span className="text-blue-500 shrink-0 mt-0.5">▸</span>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:text-blue-500 hover:underline transition-colors"
                      >
                        {link.name} <span className="text-[9px] text-muted-foreground">↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-amber-500/25 bg-amber-500/[0.04] p-3 mt-4">
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1.5">
              ⚠️ ملاحظة للموظف
            </p>
            <p className="text-[11px] text-foreground/85 leading-relaxed">
              قبل ما تستخدم أي رقم في pitch مع عميل، <strong>تأكّد منه من المصدر الأصلي</strong>. السوق
              يتطوّر بسرعة — ممكن الرقم يتحدّث منذ آخر مرة قرأنا فيه. <strong>ما نكذب على العميل، لو
              ما نقدر نوصلوه نقول له «هذي بيانات قديمة، خل أتأكد لك»</strong>.
            </p>
          </div>

          <p className="text-[10px] text-muted-foreground italic mt-3 leading-relaxed">
            آخر تحديث للمصادر: مايو 2026 · هذي الصفحة تُحدّث كل ربع — راجع التواريخ.
          </p>
        </CardContent>
      </Card>

      {/* ── Footer pointer ──────────────────────────────────────── */}
      <Card className="border-border bg-card/40">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0">
              <CalendarRange className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-bold mb-1">جاهز للمحادثة مع ICP محدد؟</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                لما تتعرف على ICP محدد، انتقل لـ{" "}
                <a href="/guidelines/sales-playbook" className="text-emerald-500 font-semibold hover:underline">
                  دليل المبيعات
                </a>
                {" "}— فيه السكريبتات + الاعتراضات + جمل الإغلاق المخصصة لكل ICP.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </GuidelineLayout>
  );
}
