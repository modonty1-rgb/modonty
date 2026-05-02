import { Card, CardContent } from "@/components/ui/card";
import { getMomentumPrice } from "@/lib/pricing/format-for-guideline";
import { Badge } from "@/components/ui/badge";
import { GuidelineLayout } from "../components/guideline-layout";
import { ModontyIcon } from "@/components/admin/icons/modonty-icon";
import {
  Swords,
  Shield,
  TrendingUp,
  Lightbulb,
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Layers,
  Compass,
  Rocket,
  ArrowDown,
  Award,
} from "lucide-react";

// ─── 6 معارك تنافسية مع Detail ─────────────────────────────
const sixBattles = [
  {
    num: 1,
    rival: "الوكالة الإعلانية",
    rivalCost: "96,000–360,000 ريال/سنة",
    rivalWeakness: "ساعات بشرية مكلفة + تنتهي لما توقف الدفع + لا Authority Blog",
    modontyEdge: "__EDGE_PRICE__",
    keyLine: "«الوكالة تخدمك. مدونتي تشغّل لك نظام.»",
    deepWhy: "الوكالة بنموذج Service-as-a-Service — يبيعون ساعات بشرية. Modonty بنموذج SaaS — يبيع منظومة. الفرق فلسفي، لا يُختزل في السعر.",
    icon: Shield,
    color: "rose",
  },
  {
    num: 2,
    rival: "الكاتب المستقل (Freelancer)",
    rivalCost: "36,000–60,000 ريال/سنة (للكاتب وحده)",
    rivalWeakness: "Single point of failure (يمرض/يسافر/يرفع السعر) + لا Schema/SEO تقني + جودة متذبذبة",
    modontyEdge: "فريق محترف + Pre-publish audit بـ 9 فحوصات + ضمان جودة + استمرارية",
    keyLine: "«المستقل شخص. مدونتي مؤسسة.»",
    deepWhy: "المستقل يكتب نص. Modonty تطلّع مقال يجتاز فحوصات Google. الفرق بين «أنتجت محتوى» و «أنتجت أصلاً تسويقياً».",
    icon: Shield,
    color: "amber",
  },
  {
    num: 3,
    rival: "WordPress + Plugins",
    rivalCost: "__WORDPRESS_YEARLY__",
    rivalWeakness: "أداة فاضية تحتاج فريق كامل لتشغيلها + لا Authority Blog + Backlinks تحتاج 2 سنة",
    modontyEdge: "نظام متكامل — يحلّ محل الفريق كله + يستفيد من Domain Authority راسخة من اليوم الأول",
    keyLine: "«WordPress يحتاج فريق. مدونتي تستبدل الفريق.»",
    deepWhy: "WordPress = أداة بناء بيت من الصفر. Modonty = استئجار فيلا جاهزة مفروشة. 14× أرخص + إنت ما تشتغل بنفسك.",
    icon: Swords,
    color: "violet",
  },
  {
    num: 4,
    rival: "ChatGPT / أدوات AI",
    rivalCost: "20–200 دولار/شهر (240–2,400 ريال/سنة)",
    rivalWeakness: "يكتب نص فقط — بدون Schema، بدون E-E-A-T، بدون Lead Scoring، بدون Authority، بدون publish system",
    modontyEdge: "نظام جودة محتوى — مقال يجتاز 9 فحوصات + ينشر تلقائياً + Lead Scoring لكل زائر",
    keyLine: "«ChatGPT يكتب نص. Modonty تنشر مقال يظهر في محركات البحث ويجيب عملاء.»",
    deepWhy: "AI أداة كتابة. Modonty منظومة نشر. بين «النص» و «المقال الناجح» 9 فحوصات + Authority Blog + Lead Scoring + analytics. هذي القاعدة 14 الأخطر.",
    icon: Swords,
    color: "primary",
  },
  {
    num: 5,
    rival: "HubSpot / SaaS عالمي",
    rivalCost: "$9,600–$24,000/سنة (36K–90K ريال)",
    rivalWeakness: "إنجليزي بطبيعته + dashboard غير عربي + ما يفهم Salla/Zid + ما يدعم YMYL سعودي + Slack مش Telegram",
    modontyEdge: "عربي 100% + تكامل Salla/Zid + YMYL compliance + Saudi-first + Telegram (مش Slack الغربي)",
    keyLine: "«HubSpot منصة عالمية. Modonty للسعوديين والمصريين.»",
    deepWhy: "HubSpot منتج عظيم في سياقه العالمي. لكن سياقه غير عربي. Modonty مصممة لـ MENA — كل قرار في النظام يأخذ السعودي والمصري بعين الاعتبار.",
    icon: Swords,
    color: "emerald",
  },
  {
    num: 6,
    rival: "أدوات SEO وحدها (SEMrush · Ahrefs · Moz)",
    rivalCost: "$1,500–$5,000/سنة (5,600–18,750 ريال)",
    rivalWeakness: "تحليل فقط — لا تنشر، لا تكتب، لا توفر فريق + إنجليزية + تحتاج خبير SEO ليفهمها",
    modontyEdge: "نظام تنفيذ كامل — تحليل + كتابة + نشر + Schema + audit — كل شي تلقائي",
    keyLine: "«خدمات SEO تعطيك نصيحة. مدونتي تنفّذها.»",
    deepWhy: "SEMrush/Ahrefs أدوات للمحترفين. Modonty منظومة لأصحاب الشركات اللي ما يفهمون SEO. الفرق بين «مرجع علمي» و «خدمة جاهزة».",
    icon: Swords,
    color: "blue",
  },
] as const;

// ─── Comparison Matrix ─────────────────────────────────────
const comparisonRows = [
  { criterion: "التكلفة السنوية", agency: "96K–360K ريال", freelance: "36K–60K", wordpress: "216K+ (مع فريق)", chatgpt: "240–2.4K", hubspot: "36K–90K", modonty: "15.6K (Momentum)" },
  { criterion: "محتوى عربي يدوي محترف", agency: "✓", freelance: "✓", wordpress: "✗ تحتاج كاتب", chatgpt: "✗ AI فقط", hubspot: "✗ إنجليزي", modonty: "✓ بفريق" },
  { criterion: "Authority Blog مدمج", agency: "✗", freelance: "✗", wordpress: "✗ مدونة جديدة", chatgpt: "✗", hubspot: "✗", modonty: "✓ modonty.com" },
  { criterion: "JSON-LD + Schema تلقائي", agency: "يدوي مكلف", freelance: "✗", wordpress: "محدود (plugins)", chatgpt: "✗", hubspot: "✓", modonty: "✓ كامل" },
  { criterion: "Lead Scoring 0–100", agency: "✗", freelance: "✗", wordpress: "✗", chatgpt: "✗", hubspot: "✓", modonty: "✓ مدمج" },
  { criterion: "Telegram Real-Time alerts", agency: "✗", freelance: "✗", wordpress: "✗", chatgpt: "✗", hubspot: "Slack/Email فقط", modonty: "✓ 22 حدث" },
  { criterion: "AI Crawler Optimization", agency: "✗", freelance: "✗", wordpress: "✗", chatgpt: "❓", hubspot: "✗", modonty: "✓ ChatGPT Search + Perplexity" },
  { criterion: "YMYL compliance (طبي/مالي)", agency: "✗ يدوي", freelance: "✗", wordpress: "✗", chatgpt: "✗", hubspot: "✗ غير عربي", modonty: "✓ مبني للسوق السعودي" },
  { criterion: "Egypt-Gulf cultural fit", agency: "محدود", freelance: "محدود", wordpress: "✗", chatgpt: "✗ إنجليزي", hubspot: "✗", modonty: "✓ عربي 100%" },
  { criterion: "Pre-publish audit (9 فحوصات)", agency: "✗", freelance: "✗", wordpress: "✗", chatgpt: "✗", hubspot: "محدود", modonty: "✓ كامل" },
] as const;

// ─── 3 cases when Modonty is NOT the right fit ────────────
const whenNotFit = [
  {
    case: "شركة كبرى عندها فريق تسويق + ميزانية مفتوحة",
    why: "هؤلاء يستفيدون من HubSpot أكثر — يستحقّون CRM متكامل + automation enterprise-level",
    redirect: "حوّلهم إلى HubSpot أو وكالة كبيرة. لا تخسر وقتك.",
  },
  {
    case: "محتوى تقني super-niche بحاجة لخبير متخصص",
    why: "مثل: مقال عن البلوكتشين أو هندسة طيران. تحتاج كاتب خبير يعرف التفاصيل التقنية الدقيقة",
    redirect: "اقترح freelancer متخصص في المجال. Modonty تكتب محتوى عام محترف، لا متخصص دقيق.",
  },
  {
    case: "العميل يبغى control كامل على الدومين الآن",
    why: "بعض العملاء (خاصة B2B) يحتاجون الدومين بإسمهم لأسباب legal/compliance. Modonty تعطي subpage على modonty.com",
    redirect: "اقترح Leadership tier (فيها خيار دومين مخصص لاحقاً)، أو وضّح فائدة Authority Blog Network — لو ما اقتنع، حوّله لـ WordPress.",
  },
] as const;

// ─── Maturity Levels (the ceiling) ─────────────────────────
const maturityLevels = [
  {
    level: "Today",
    timeframe: "Q2 2026 — الآن",
    achievements: [
      "13-stage SEO pipeline + Pre-publish audit (9 فحوصات)",
      "AI Content Generator + Quality Scorer",
      "22-event Telegram integration (live tested)",
      "Lead Scoring 0–100 (Frequency + Depth + Interaction + Conversion)",
      "Multi-tenant architecture (admin + console + modonty.com)",
      "GSC + PageSpeed + GA4 integration كاملة",
      "JSON-LD + Schema + Sitemap + AI Crawler Optimization",
      "Image sitemap + canonical + hreflang",
    ],
    color: "emerald",
  },
  {
    level: "12 شهر",
    timeframe: "Q2 2027 — قريباً",
    achievements: [
      "Competitive Intelligence MVP (DataForSEO API)",
      "3+ case studies منشورة (proof of concept)",
      "200 عميل نشط في السعودية ومصر",
      "Reseller API للوكالات (White-label)",
      "Stripe integration (دفع تلقائي)",
      "Founder brand (LinkedIn + YouTube)",
      "Egypt-Gulf vertical تشغيل تام (4 قطاعات)",
      "Public methodology page",
    ],
    color: "blue",
  },
  {
    level: "السقف (3–5 سنوات)",
    timeframe: "Q2 2030 — الرؤية",
    achievements: [
      "1,000+ عميل عربي نشط",
      "Network Effect ضخم — Domain Authority modonty.com يصل 60+",
      "Public benchmarks (شفافية كاملة في الأرقام)",
      "Multi-language: Turkish + Persian + Urdu",
      "AI Content Brief Generator (يبني المقال من الصفر)",
      "Webinars + Community + شهادات SEO معتمدة",
      "Mobile app كامل (iOS + Android)",
      "MENA Content Authority — المرجع الأول للعربية",
    ],
    color: "violet",
  },
] as const;

const colorMap: Record<string, { border: string; bg: string; text: string; iconBg: string }> = {
  primary: { border: "border-primary/30", bg: "bg-primary/[0.04]", text: "text-primary", iconBg: "bg-primary/15" },
  emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/[0.04]", text: "text-emerald-500", iconBg: "bg-emerald-500/15" },
  violet: { border: "border-violet-500/30", bg: "bg-violet-500/[0.04]", text: "text-violet-500", iconBg: "bg-violet-500/15" },
  amber: { border: "border-amber-500/30", bg: "bg-amber-500/[0.04]", text: "text-amber-500", iconBg: "bg-amber-500/15" },
  blue: { border: "border-blue-500/30", bg: "bg-blue-500/[0.04]", text: "text-blue-500", iconBg: "bg-blue-500/15" },
  rose: { border: "border-rose-500/30", bg: "bg-rose-500/[0.04]", text: "text-rose-500", iconBg: "bg-rose-500/15" },
};

export default async function PositioningPage() {
  const m = await getMomentumPrice("SA");
  const monthly = m?.monthly ?? "1,299";
  const yearly = m?.yearly ?? "15,588";
  const wordpressYearly = 18000 * 12; // 216,000
  const edgePrice = `نظام يشتغل 24/7 + يتراكم مع كل عميل + سعر ${monthly} شهري`;
  const wordpressYearlyText = `${wordpressYearly.toLocaleString("en-GB")}+ ريال/سنة (مع فريق Dev+Design+Writer+SEO بأقل أسعار)`;
  const footnoteText = `* الأسعار للسوق السعودي — مايو 2026. * ${monthly} شهري × 12 = ${yearly} سنوياً للـ Momentum.`;

  const resolvedBattles = sixBattles.map((b) => ({
    ...b,
    modontyEdge: b.modontyEdge === "__EDGE_PRICE__" ? edgePrice : b.modontyEdge,
    rivalCost: b.rivalCost === "__WORDPRESS_YEARLY__" ? wordpressYearlyText : b.rivalCost,
  }));

  return (
    <GuidelineLayout
      title="Modonty vs المنافسون — الفرق + السقف"
      description="مقارنة شاملة (6 معارك + جدول 10 معايير) + 3 حالات «ما هو عميلنا» + رؤية مستقبلية لـ Modonty"
    >
      {/* ── Hero — The Confident Position ─────────────────────── */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/[0.06] via-background to-background">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="p-2.5 rounded-xl bg-background border border-border shadow-sm shrink-0">
              <ModontyIcon className="h-10 w-10" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold mb-2">الفرق الجوهري — Modonty فئة بحالها</h2>
              <p className="text-sm text-foreground/85 leading-loose">
                لما تقارن Modonty بأي منتج آخر في السوق (وكالة · فريلانسر · WordPress · ChatGPT ·
                HubSpot · أدوات SEO)، <strong>القاعدة الأولى:</strong> ما تقارن أشياء من فئات مختلفة. هذي
                الصفحة تعطيك الـ <strong>أدلة الواضحة</strong> اللي تخلّيك تشرح الفرق بثقة كاملة — لأي
                عميل، في أي محادثة.
              </p>
              <p className="text-xs text-muted-foreground italic mt-3 leading-relaxed">
                💡 الـ outcome من قراءة هذي الصفحة: قناعة راسخة + معرفة عميقة + أسلحة ذهنية جاهزة لكل
                موقف.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-primary/30 bg-background/70 p-4 mb-3">
            <p className="text-[11px] font-bold text-primary uppercase tracking-wide mb-2">الإجابة في جملة</p>
            <p className="text-base font-bold leading-loose">
              Modonty <strong>مو</strong> وكالة بسعر أرخص. Modonty <strong>فئة جديدة</strong> اسمها{" "}
              <em>«Productized Content + SEO»</em> — كل البقية يبيعون <strong>وقت بشري</strong>، Modonty
              تبيع <strong>منظومة متكاملة</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.05] p-3 text-center">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1">المصلحة 1</p>
              <p className="text-xs leading-relaxed">
                <strong>أصل تسويقي</strong> — مش مصاريف
              </p>
            </div>
            <div className="rounded-md border border-violet-500/25 bg-violet-500/[0.05] p-3 text-center">
              <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-1">المصلحة 2</p>
              <p className="text-xs leading-relaxed">
                <strong>منظومة</strong> — مش أداة
              </p>
            </div>
            <div className="rounded-md border border-amber-500/25 bg-amber-500/[0.05] p-3 text-center">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1">المصلحة 3</p>
              <p className="text-xs leading-relaxed">
                <strong>تتراكم</strong> — مش تنتهي
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Comparison Matrix — 10 معايير × 6 منافسين ─────────── */}
      <Card className="border-blue-500/25 bg-blue-500/[0.03]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-blue-500/15">
              <Layers className="h-4 w-4 text-blue-500" />
            </div>
            <h2 className="text-base font-bold">جدول المقارنة الشامل — 10 معايير × 6 منافسين</h2>
          </div>

          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            هذا الجدول هو أقوى سلاحك. <strong>احفظ 5 صفوف منه</strong> — تكفيك في أي محادثة.
          </p>

          <div className="overflow-x-auto rounded-md border border-blue-500/20">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-blue-500/30 bg-blue-500/[0.05]">
                  <th className="text-start p-2 font-bold sticky right-0 bg-blue-500/[0.08] z-10 min-w-[140px]">المعيار</th>
                  <th className="text-center p-2 font-bold text-rose-500">وكالة</th>
                  <th className="text-center p-2 font-bold text-amber-500">Freelancer</th>
                  <th className="text-center p-2 font-bold text-violet-500">WordPress</th>
                  <th className="text-center p-2 font-bold text-blue-500">ChatGPT</th>
                  <th className="text-center p-2 font-bold text-foreground">HubSpot</th>
                  <th className="text-center p-2 font-bold text-emerald-500 bg-emerald-500/[0.08]">Modonty</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((r, i) => (
                  <tr key={i} className="border-b border-blue-500/15 last:border-0">
                    <td className="p-2 font-bold sticky right-0 bg-background/95 z-10 align-top">{r.criterion}</td>
                    <td className="p-2 text-center align-top text-foreground/85">{r.agency}</td>
                    <td className="p-2 text-center align-top text-foreground/85">{r.freelance}</td>
                    <td className="p-2 text-center align-top text-foreground/85">{r.wordpress}</td>
                    <td className="p-2 text-center align-top text-foreground/85">{r.chatgpt}</td>
                    <td className="p-2 text-center align-top text-foreground/85">{r.hubspot}</td>
                    <td className="p-2 text-center align-top font-bold text-emerald-600 bg-emerald-500/[0.05]">{r.modonty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[10px] text-muted-foreground italic mt-3 leading-relaxed">
            {footnoteText}
          </p>
        </CardContent>
      </Card>

      {/* ── 6 Battles — Detailed ──────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Swords className="h-4 w-4 text-rose-500" />
          <h2 className="text-base font-bold">6 معارك تنافسية — الفرق العميق</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          كل معركة فيها: المنافس + تكلفته + ضعفه + ميزة Modonty + الجملة الذهبية + السبب العميق.
        </p>

        <div className="space-y-3">
          {resolvedBattles.map((b) => {
            const Icon = b.icon;
            const c = colorMap[b.color];
            return (
              <Card key={b.num} className={`${c.border} ${c.bg}`}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <div className={`p-2 rounded-lg ${c.iconBg}`}>
                      <Icon className={`h-4 w-4 ${c.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] font-mono font-bold ${c.text}`}>المعركة {b.num}</p>
                      <h3 className="text-sm font-bold">ضد {b.rival}</h3>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-rose-500/30 text-rose-500">
                      {b.rivalCost}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-3">
                    <div className="rounded-md border border-rose-500/25 bg-rose-500/[0.05] p-3 text-xs">
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wide mb-1.5">✗ ضعفه</p>
                      <p className="leading-relaxed">{b.rivalWeakness}</p>
                    </div>
                    <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.05] p-3 text-xs">
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1.5">✓ ميزة Modonty</p>
                      <p className="leading-relaxed">{b.modontyEdge}</p>
                    </div>
                  </div>

                  <div className="rounded-md border border-primary/30 bg-background/80 p-3 mb-3 text-center">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wide mb-1">الجملة الذهبية</p>
                    <p className="text-sm font-bold leading-relaxed">{b.keyLine}</p>
                  </div>

                  <div className="rounded-md border border-violet-500/25 bg-violet-500/[0.04] p-3 text-xs">
                    <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" /> السبب العميق
                    </p>
                    <p className="leading-relaxed">{b.deepWhy}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── 3 Cases When Modonty is NOT the right fit ────────── */}
      <Card className="border-amber-500/30 bg-amber-500/[0.04]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-amber-500/15">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <h2 className="text-base font-bold">الصراحة الكاملة — متى ما يكون Modonty الحل المناسب؟</h2>
          </div>

          <p className="text-sm leading-relaxed mb-4">
            الموظف الناجح يعرف <strong>متى يقول لا</strong>. هذي 3 حالات احنا ما هم عميلنا — وش نعمل
            معاهم؟
          </p>

          <div className="space-y-3">
            {whenNotFit.map((w, i) => (
              <div key={i} className="rounded-lg border border-amber-500/25 bg-background/70 p-4">
                <p className="text-sm font-bold text-amber-600 mb-2">
                  {i + 1}. {w.case}
                </p>
                <p className="text-xs text-foreground/85 leading-relaxed mb-2">
                  <strong>ليش:</strong> {w.why}
                </p>
                <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.04] p-2.5">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-0.5">الإجراء</p>
                  <p className="text-xs leading-relaxed">{w.redirect}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-rose-500/25 bg-rose-500/[0.04] p-3 mt-4">
            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wide mb-1.5">القاعدة</p>
            <p className="text-xs leading-relaxed">
              <strong>وقتك أهم من جمع leads ضائعة.</strong> الموظف الذي يضيع 5 ساعات على عميل خاطئ = خسارة
              ساعتين على عميل مناسب. اعرف متى تعتذر بأدب.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── The Ceiling — Maturity Levels ─────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Rocket className="h-4 w-4 text-primary" />
          <h2 className="text-base font-bold">السقف — فين تقدر توصل Modonty؟</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          الموظف يحتاج يعرف الحاضر + المستقبل — يعطيه ثقة في الـ pitch، ويكشف الإمكانات. <strong>3 مستويات
          نضوج</strong>:
        </p>

        <div className="space-y-2">
          {maturityLevels.map((m, i) => {
            const c = colorMap[m.color];
            return (
              <div key={i}>
                <Card className={`${c.border} ${c.bg}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-4 flex-wrap">
                      <div className={`p-2 rounded-lg ${c.iconBg} shrink-0`}>
                        {m.level === "Today" && <CheckCircle2 className={`h-4 w-4 ${c.text}`} />}
                        {m.level === "12 شهر" && <TrendingUp className={`h-4 w-4 ${c.text}`} />}
                        {m.level === "السقف (3–5 سنوات)" && <Rocket className={`h-4 w-4 ${c.text}`} />}
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <p className={`text-base font-bold ${c.text}`}>{m.level}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{m.timeframe}</p>
                      </div>
                    </div>

                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                      {m.achievements.map((a, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-xs rounded-md border border-border/40 bg-background/50 p-2"
                        >
                          <span className={`${c.text} shrink-0 mt-0.5`}>▸</span>
                          <span className="leading-relaxed">{a}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                {i < maturityLevels.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="h-3 w-3 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Card className="border-primary/30 bg-gradient-to-br from-primary/[0.05] via-violet-500/[0.04] to-background mt-3">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Award className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-primary uppercase tracking-wide mb-2">
                  التركيب الذهني للموظف
                </p>
                <p className="text-sm leading-loose">
                  <strong>اليوم:</strong> Modonty منتج ناضج تقنياً — كل ما هو موجود في «اليوم» يشتغل
                  فعلياً، تقدر توري العميل live. <strong>12 شهر:</strong> الـ roadmap واضح ومُموّل ذاتياً.{" "}
                  <strong>السقف:</strong> رؤية لمنصة محتوى عربية تأخذ موقع HubSpot في MENA. لما الموظف
                  يفهم هذا، يبيع بثقة <strong>المستقبل</strong>، مش فقط الحاضر.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── How to explain the difference (assertive) ──────────── */}
      <Card className="border-emerald-500/30 bg-emerald-500/[0.04]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-emerald-500/15">
              <Compass className="h-4 w-4 text-emerald-500" />
            </div>
            <h2 className="text-base font-bold">كيف توضّح الفرق للعميل في 60 ثانية</h2>
          </div>

          <p className="text-sm text-foreground/85 leading-relaxed mb-4">
            لما العميل يجي ومعاه عرض من منافس (وكالة، فريلانسر، أداة)، استخدم هذا الـ flow الـ 5 خطوات.
            <strong> النتيجة: العميل يفهم الفرق بنفسه ويقتنع بدون ضغط.</strong>
          </p>

          <div className="space-y-3">
            <div className="rounded-md border border-emerald-500/30 bg-background/80 p-4">
              <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wide mb-2">5 خطوات لتوضيح الفرق</p>
              <ul className="space-y-2 text-sm leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>
                    <strong>صنّف العرض الذي معاه:</strong> هل هو خدمة (وكالة/فريلانسر) أو أداة (WordPress/ChatGPT)؟
                    استخدم جدول المقارنة فوق لتوضيح الفئة.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>
                    <strong>اطرح المعايير الـ 10:</strong> «اسأل البائع: هل عنده Authority Blog؟ Lead
                    Scoring؟ JSON-LD تلقائي؟ Telegram alerts؟ YMYL compliance؟»
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>
                    <strong>اشرح القاعدة 6 (الخلاصة الكبرى):</strong> «هم يبيعون وقت بشري. Modonty تبيع
                    منظومة. الفرق فلسفي مش سعري.»
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center text-[10px] font-bold">4</span>
                  <span>
                    <strong>أعطِه الجملة الذهبية المناسبة</strong> من المعارك الست أعلاه (مثلاً:
                    «خدمات SEO تعطيك نصيحة. مدونتي تنفّذها»).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center text-[10px] font-bold">5</span>
                  <span>
                    <strong>اعرض السقف:</strong> «خلال 12 شهر تشوف Modonty تفعل [feature]. الوكالة ما
                    تتطوّر — Modonty تتطوّر معك.»
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-md border border-primary/30 bg-primary/[0.04] p-4">
              <p className="text-[11px] font-bold text-primary uppercase tracking-wide mb-2">القاعدة الذهبية للموظف</p>
              <p className="text-sm leading-loose">
                <strong>لا تهاجم المنافس.</strong> اشرح الفرق بهدوء + ثقة + أرقام. العميل الذكي يكتشف
                الفرق بنفسه — دورك أن تعطيه الأدوات للمقارنة الصحيحة. لما تكون أنت <strong>المرجع
                الواثق</strong>، العميل يصدّقك تلقائياً.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Footer pointers ───────────────────────────────────── */}
      <Card className="border-border bg-card/40">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <Target className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-sm font-bold mb-1">للمزيد من الأسلحة الذهنية</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ارجع لـ{" "}
                <a href="/guidelines/golden-rules" className="text-primary font-semibold hover:underline">
                  القواعد الذهبية الـ 22
                </a>
                {" "}— خاصة القاعدة 5 (الجمل الست) + القاعدة 14 (الاعتراض الأخطر) + القاعدة 20 (Moat).
                وراجع{" "}
                <a href="/guidelines/sales-playbook" className="text-primary font-semibold hover:underline">
                  دليل المبيعات
                </a>
                {" "}للسكريبتات الكاملة.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </GuidelineLayout>
  );
}
