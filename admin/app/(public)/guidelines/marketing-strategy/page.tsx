import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GuidelineLayout } from "../components/guideline-layout";
import {
  Megaphone,
  Globe2,
  TrendingUp,
  Users,
  MousePointerClick,
  MessageSquare,
  Mail,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Target,
  ArrowDown,
  Lightbulb,
  Plane,
  Send,
} from "lucide-react";

// ─── 5 الرسائل الرئيسية مع Do/Don't ─────────────────────────
const fiveMessages = [
  {
    num: 1,
    label: "Hero / Above the Fold",
    line: "مدونتك في صدر نتائج البحث. عملاؤك في WhatsApp. بدون ما تكتب حرف.",
    why: "3 جمل = 3 نتائج (مش features). العميل ما يهمه «JSON-LD»، يهمه «عملاؤه على واتساب». هذي قاعدة الـ outcome-based copywriting.",
    when: "على الـ Hero في الموقع · headline في الإعلانات · أول جملة في أي pitch deck",
    dont: "«SEO Optimization Platform with Lead Scoring AI» (تقني، بارد، أمريكي)",
  },
  {
    num: 2,
    label: "Pricing CTA",
    line: "ادفع 12 شهر، استلم 18 شهر. ROI ≈ 70× في السنة الأولى.",
    why: "12=18 = ضمان نفسي (مش خصم). «70×» رقم محسوب من ROI Calculator، يثبّت القيمة بأرقام. الـ Anti-Hook «أرخص» تم استبدالها بـ «ROI» (القاعدة 16).",
    when: "بعد ما ذكرت السعر · في slide pricing · لما العميل يقول «غالي»",
    dont: "«ادفع 99% أقل من الوكالات» (Anti-Hook «أقل» — يدمّر perceived value)",
  },
  {
    num: 3,
    label: "Lead Scoring",
    line: "كل زائر = درجة من 0 إلى 100. الأعلى = الأقرب للشراء. لا تخمين بعد اليوم.",
    why: "العميل يعرف ألم «أتصل بالكل عشواء». الجملة تعطيه حلاً فورياً (درجة محددة) + شعور بالتحكم.",
    when: "للعميل العقلاني (محامي، طبيب، صاحب شركة) · في Discovery لما يذكر pain «ما أعرف من ينوي يشتري»",
    dont: "«AI-powered Lead Intelligence» (Anti-Hook + جوفاء)",
  },
  {
    num: 4,
    label: "AI / Content Quality",
    line: "8 مقالات شهرياً. كل مقال يجتاز 9 فحوصات. كل مقال E-E-A-T كامل. بدون فريق.",
    why: "تثبت القيمة بأرقام (8 مقالات، 9 فحوصات) — مش وعود. «بدون فريق» تخاطب صاحب SMB اللي ما يقدر يدفع رواتب فريق.",
    when: "للعملاء اللي يقارنونك بـ ChatGPT أو فريلانسر · في الـ Discovery لما يذكر «أنا أكتب بنفسي»",
    dont: "«AI-powered content engine» (جوفاء)",
  },
  {
    num: 5,
    label: "Telegram Real-Time",
    line: "مقال نُشر؟ Telegram. زائر مهتم؟ Telegram. عميل ضغط زر؟ Telegram. كل شي على جوالك.",
    why: "العميل الخليجي يستخدم Telegram يومياً. هذي ميزة ما عند منافس عربي. Mental shift: من «أدخل dashboard كل يوم» إلى «جوالي يخبرني». القاعدة 22.",
    when: "في الـ Demo (اطلب رقمه + أرسل event حقيقي) · لما يقارنك بـ HubSpot («Slack أمريكي، Telegram خليجي»)",
    dont: "«Real-time alerts» (عام، ما يربطها بـ Telegram تحديداً)",
  },
] as const;

// ─── قنوات السوق السعودي ───────────────────────────────────
const channelsSA = [
  {
    rank: 1,
    channel: "Google Search Ads",
    why: "97% من السعوديين يبحثون قبل الشراء. المنتج عن SEO — لازم نظهر في النتائج المدفوعة وقت بناء الـ Authority العضوي.",
    audience: "كل ICPs الـ 7",
    budget: "5,000 ريال/شهر",
    cpl: "50–80 ريال",
    tactic: "Bid على «منصة محتوى عربية» + «بديل HubSpot» + اسم منافسين عرب",
  },
  {
    rank: 2,
    channel: "LinkedIn Ads",
    why: "B2B serious في السعودية. للوكالات (Tier 2) + المحامين/الاستشارات (ICP 4). LinkedIn ينمو بقوة في السعودية.",
    audience: "الوكالات + B2B (محاماة + استشارات + Tech)",
    budget: "3,000 ريال/شهر",
    cpl: "80–150 ريال",
    tactic: "Targeting بـ Job Title (CMO، Marketing Director، Founder) + Industry filter",
  },
  {
    rank: 3,
    channel: "Snapchat Ads",
    why: "Saudi Gen Z + ICP1 (التجارة الإلكترونية). 5.8× ROI influencer marketing في السعودية vs 4.2× عالمياً.",
    audience: "ICP1 (E-commerce) + ICP2 (Beauty/Aesthetic)",
    budget: "2,500 ريال/شهر",
    cpl: "CPM 8–14 ريال",
    tactic: "Story Ads + Influencer placements",
  },
  {
    rank: 4,
    channel: "Twitter/X Ads",
    why: "Thought leadership + B2B influencers + الجالية المهنية السعودية تنشط هنا.",
    audience: "Founders + Tech executives + ICP4 (محاماة)",
    budget: "2,000 ريال/شهر",
    cpl: "—",
    tactic: "Thread Ads + Promoted Tweets على keywords B2B",
  },
  {
    rank: 5,
    channel: "WhatsApp Business",
    why: "Closing channel. كل قناة تجلب lead → WhatsApp يحوّله. 95% Saudi response rate خلال ساعة.",
    audience: "كل lead بعد التواصل الأول",
    budget: "0 (مدمج)",
    cpl: "—",
    tactic: "Auto-reply + قوائم broadcast + Catalog",
  },
] as const;

// ─── قنوات السوق المصري ───────────────────────────────────
const channelsEG = [
  {
    rank: 1,
    channel: "Facebook Ads",
    why: "فيسبوك = «الـ Digital Home» المصري بـ 89% penetration. لا أولوية تنافسه.",
    audience: "كل الـ ICPs المصرية + قطاعات Egypt-Gulf",
    budget: "30,000 جنيه/شهر",
    tactic: "Lookalike audiences من sample عملاء + Detailed targeting",
  },
  {
    rank: 2,
    channel: "Instagram + TikTok",
    why: "للقطاعات البصرية (Beauty, Tourism, F&B) + Reels marketing هو الأقوى للسائح الخليجي.",
    audience: "Egypt-Gulf سياحة + Beauty + ICP1 (E-commerce)",
    budget: "15,000 جنيه/شهر",
    tactic: "Reels + قصص بفيديو رأسي + Influencer collaborations",
  },
  {
    rank: 3,
    channel: "YouTube",
    why: "Trust building للـ premium services (طبية + عقارات). فيديو طويل يبني authority بشكل ما يتحقق من Reels.",
    audience: "Egypt-Gulf طبية + عقارات + تعليم",
    budget: "10,000 جنيه/شهر",
    tactic: "Pre-roll + In-stream + Shorts للترويج",
  },
  {
    rank: 4,
    channel: "LinkedIn (مصر)",
    why: "للوكالات المصرية (Tier 2 Resellers) + B2B serious. تنامي ولكنه أصغر من السعودية.",
    audience: "وكالات ديجيتال مصرية + Resellers محتملين",
    budget: "5,000 جنيه/شهر",
    tactic: "Sponsored InMail + Lead Gen Forms",
  },
  {
    rank: 5,
    channel: "WhatsApp",
    why: "Closing channel — أعلى engagement من أي قناة digital. 95% open rate.",
    audience: "كل lead بعد التواصل الأول",
    budget: "0 (مدمج)",
    tactic: "Auto-reply + Broadcasts + Catalogs",
  },
] as const;

// ─── رحلة العميل (6 مراحل) ──────────────────────────────────
const journey = [
  {
    stage: "1. الوعي (Awareness)",
    icon: Globe2,
    channel: "محركات البحث + LinkedIn + Facebook",
    content: "مقال يحل pain محدد",
    kpi: "Impressions + CTR + Search Console clicks",
    why: "العميل ما يعرفنا. مقال SEO عربي قوي = أول لقاء = first impression لازم يكون خبراء.",
    color: "blue",
  },
  {
    stage: "2. الاهتمام (Interest)",
    icon: TrendingUp,
    channel: "modonty.com + Chatbot + LinkedIn long-form",
    content: "Case study + ROI calculator + comparison guide",
    kpi: "Engagement Score (>40/100) + Time on site",
    why: "العميل قرأ المقال + يتساءل. هنا نعطيه case study (لما تتوفّر) + حاسبة ROI تثبت القيمة بأرقامه هو.",
    color: "violet",
  },
  {
    stage: "3. التقييم (Consideration)",
    icon: Mail,
    channel: "Newsletter + WhatsApp + استشارة مجانية",
    content: "Free tier offer + comparison vs WordPress/HubSpot",
    kpi: "Newsletter signup + Free tier signup",
    why: "العميل يقارن. اعطه السلاح يحسم: Free tier للتجربة + جدول مقارنة واضح. الهدف: تخطي «أنا أفكر فيها».",
    color: "amber",
  },
  {
    stage: "4. التحويل (Conversion)",
    icon: MousePointerClick,
    channel: "WhatsApp + استشارة فردية + Demo حي",
    content: "عرض Momentum + قاعدة 12=18 + Telegram demo trick",
    kpi: "Free → Paid conversion (هدف 12%)",
    why: "اللحظة الفاصلة. القاعدة 22 (Telegram demo trick) تقفل 30%+ من الصفقات. اربطه على bot وأرسل event حقيقي.",
    color: "emerald",
  },
  {
    stage: "5. الاحتفاظ (Retention)",
    icon: MessageSquare,
    channel: "Telegram alerts + Email + استشارة شهرية",
    content: "تقارير شهرية + توصيات + early access للـ features",
    kpi: "NRR (هدف 110%+) + Churn (<5%)",
    why: "Telegram يلعب هنا الدور الأكبر — العميل يحس قيمة Real-time engagement كل يوم. Churn ينخفض لما يحس النظام «حي».",
    color: "primary",
  },
  {
    stage: "6. الإحالة (Referral)",
    icon: Users,
    channel: "Email + Console banner + WhatsApp",
    content: "«أحل صديق، خذ شهر مجاني» + Reseller program (للوكالات)",
    kpi: "Viral coefficient (هدف 0.3) + Referrals/customer",
    why: "العميل المسرور = أرخص قناة marketing. حافز شهر مجاني + بنية سهلة (link sharing) = referrals منتظمة.",
    color: "rose",
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

// ─── KPIs ───────────────────────────────────────────────────
const businessKpis = [
  { label: "MRR (شهر 24)", value: "50K ريال" },
  { label: "العملاء النشطون", value: "50+" },
  { label: "Free → Paid", value: "12%" },
  { label: "Churn شهري", value: "<5%" },
  { label: "LTV : CAC", value: "3 : 1" },
  { label: "NPS", value: ">50" },
] as const;

const monthlyMarketing = [
  { label: "Organic Traffic", value: "5,000" },
  { label: "Direct Traffic", value: "2,000" },
  { label: "Paid Traffic", value: "3,000" },
  { label: "Total Leads", value: "100" },
  { label: "MQL", value: "30" },
  { label: "SQL", value: "15" },
  { label: "Closed-Won", value: "5" },
  { label: "CPL", value: "<100 ريال" },
  { label: "CAC", value: "<500 ريال" },
] as const;

const swot = {
  strengths: ["عمق تقني (3 apps)", "عربي 100% (تجوال + محتوى)", "سعر يفتح سوق ضخم", "Authority Blog Network Effect", "ضمان 12=18", "مؤسس opinionated", "Telegram integration فريد"],
  weaknesses: ["لا Stripe (اشتراك يدوي)", "Free tier لم يُسوّق", "لا case studies ظاهرة بعد", "Founder brand لم يُبنى", "لا webinar/community", "لا تطبيق جوال"],
  opportunities: ["Vision 2030 (150M سائح + e-commerce $54B)", "أزمة الكتّاب العرب", "AI hype", "ChatGPT Search + Perplexity (نحن جاهزين)", "الوكالات التقليدية ضعيفة tech", "LinkedIn ينمو 30% سنوياً في السعودية"],
  threats: ["WordPress + ChatGPT plugins", "HubSpot عربية محتملة", "منصات سعودية محلية ناشئة", "Google algorithm changes (AI Overviews)"],
};

export default function MarketingStrategyPage() {
  return (
    <GuidelineLayout
      title="استراتيجية التسويق"
      description="Big Idea + 5 رسائل + قنوات السعودية ومصر + 6 مراحل لرحلة العميل + KPIs + SWOT"
    >
      {/* ── Hero — Big Idea ─────────────────────────────────────── */}
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/[0.06] via-background to-background">
        <CardContent className="p-6 text-center">
          <div className="inline-flex p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 mb-3">
            <Megaphone className="h-7 w-7 text-amber-500" />
          </div>
          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-2">الـ Big Idea — يبدأ منها كل شي</p>
          <h2 className="text-3xl font-bold mb-3">«حضور لا وعود»</h2>
          <p className="text-sm text-muted-foreground leading-loose mb-3 max-w-2xl mx-auto">
            كل رسالة في كل حملة تنطلق من هنا. ما نقول «راح نوصلك للصدارة» — نقول «هذا نمو الزوار في
            Google Analytics». السوق مليان وكالات تبيع وعود — احنا ضد الـ status quo، نبيع{" "}
            <strong>إثبات</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5 max-w-2xl mx-auto text-start">
            <div className="rounded-md border border-amber-500/25 bg-background/70 p-3">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Lightbulb className="h-3 w-3" /> ليش هذي الجملة بالذات؟
              </p>
              <p className="text-xs leading-relaxed text-foreground/85">
                3 كلمات تكسر نمط 10 سنوات من «الوكالة كذابة». لما الموظف يقول «حضور لا وعود»، العميل
                يحس فوراً إنك مختلف.
              </p>
            </div>
            <div className="rounded-md border border-emerald-500/25 bg-background/70 p-3">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Target className="h-3 w-3" /> متى تطلقها؟
              </p>
              <p className="text-xs leading-relaxed text-foreground/85">
                في كل bio · كل tagline · أول جملة من أي pitch · في الـ ad copy. هذي الجملة الأم.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 5 رسائل رئيسية مع Do/Don't ──────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <h2 className="text-base font-bold">الرسائل الخمس الرئيسية للحملات — مع Do/Don&apos;t</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          كل رسالة تستهدف زاوية مختلفة من القيمة. كل واحدة لها مثال صحيح + غلط — فهمها يحمي الـ copy
          من الانحراف.
        </p>

        <div className="space-y-3">
          {fiveMessages.map((m) => (
            <Card key={m.num} className="border-violet-500/25 bg-violet-500/[0.03]">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3 flex-wrap">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-500 flex items-center justify-center text-sm font-bold">
                    {m.num}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Badge variant="outline" className="text-[10px] mb-2 border-violet-500/30 text-violet-500">
                      {m.label}
                    </Badge>
                  </div>
                </div>

                <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.05] p-3 mb-2">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1">✓ Do</p>
                  <p className="text-sm leading-relaxed font-medium">«{m.line}»</p>
                </div>

                <div className="rounded-md border border-rose-500/25 bg-rose-500/[0.04] p-3 mb-3">
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wide mb-1">✗ Don&apos;t</p>
                  <p className="text-sm leading-relaxed line-through text-muted-foreground">«{m.dont}»</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="rounded-md border border-amber-500/25 bg-amber-500/[0.04] p-2.5">
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" /> ليش تشتغل؟
                    </p>
                    <p className="text-[11px] leading-relaxed">{m.why}</p>
                  </div>
                  <div className="rounded-md border border-blue-500/25 bg-blue-500/[0.04] p-2.5">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Target className="h-3 w-3" /> متى تستخدمها؟
                    </p>
                    <p className="text-[11px] leading-relaxed">{m.when}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── قنوات السعودية ───────────────────────────────────── */}
      <Card className="border-blue-500/25 bg-blue-500/[0.03]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🇸🇦</span>
            <h2 className="text-base font-bold">قنوات السوق السعودي — مرتّبة بالأولوية</h2>
          </div>

          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            <strong>97% من السعوديين يبحثون قبل الشراء.</strong> هذا يخلي Search Ads + Authority Blog
            هما القناتين الأهم. القنوات الباقية تخدم ICPs محددة.
          </p>

          <div className="space-y-3">
            {channelsSA.map((c) => (
              <div key={c.rank} className="rounded-lg border border-blue-500/25 bg-background/70 p-4">
                <div className="flex items-start gap-3 mb-3 flex-wrap">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-500 flex items-center justify-center text-sm font-bold">
                    {c.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{c.channel}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap text-[10px]">
                      <Badge variant="outline" className="border-blue-500/30 text-blue-500">
                        {c.budget}
                      </Badge>
                      <span className="text-muted-foreground">CPL: {c.cpl}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs leading-relaxed mb-2 text-foreground/85">{c.why}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded border border-violet-500/25 bg-violet-500/[0.04] p-2">
                    <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-0.5">الجمهور</p>
                    <p className="leading-relaxed">{c.audience}</p>
                  </div>
                  <div className="rounded border border-emerald-500/25 bg-emerald-500/[0.04] p-2">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-0.5">التكتيك</p>
                    <p className="leading-relaxed">{c.tactic}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── قنوات مصر ─────────────────────────────────────────── */}
      <Card className="border-amber-500/25 bg-amber-500/[0.03]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🇪🇬</span>
            <h2 className="text-base font-bold">قنوات السوق المصري — أولوية مختلفة</h2>
          </div>

          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            مصر سوق <strong>فيسبوك أولاً</strong> — ليس مثل السعودية. الترتيب يختلف جذرياً. للقطاعات
            المستهدفة للسائح الخليجي (Egypt-Gulf tier) — ركّز Reels + YouTube.
          </p>

          <div className="space-y-3">
            {channelsEG.map((c) => (
              <div key={c.rank} className="rounded-lg border border-amber-500/25 bg-background/70 p-4">
                <div className="flex items-start gap-3 mb-3 flex-wrap">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center text-sm font-bold">
                    {c.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{c.channel}</p>
                    <Badge variant="outline" className="text-[10px] mt-1 border-amber-500/30 text-amber-500">
                      {c.budget}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs leading-relaxed mb-2 text-foreground/85">{c.why}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded border border-violet-500/25 bg-violet-500/[0.04] p-2">
                    <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-0.5">الجمهور</p>
                    <p className="leading-relaxed">{c.audience}</p>
                  </div>
                  <div className="rounded border border-emerald-500/25 bg-emerald-500/[0.04] p-2">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-0.5">التكتيك</p>
                    <p className="leading-relaxed">{c.tactic}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Egypt-Gulf Strategic Priority ───────────────────────── */}
      <Card className="border-2 border-cyan-500/40 bg-gradient-to-br from-cyan-500/[0.06] via-background to-background">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Badge className="text-[10px] bg-cyan-500 text-white">⭐ أولوية استراتيجية</Badge>
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-cyan-600" />
              <h2 className="text-base font-bold">القطاعات المصرية المستهدفة للسائح الخليجي</h2>
            </div>
          </div>

          <p className="text-sm text-foreground/85 leading-loose mb-3">
            هذي القطاعات (منتجعات + سياحة طبية + عقارات + تعليم) <strong>تتكلم العربية لجمهور خليجي
            بطبيعتها</strong>. cultural fit طبيعي + ARPU أعلى + lead time أقصر = صفقات أسرع.
          </p>

          <div className="rounded-md border border-cyan-500/30 bg-cyan-500/[0.05] p-3">
            <p className="text-[11px] font-bold text-cyan-600 uppercase tracking-wide mb-1.5">
              التوصية للفريق
            </p>
            <p className="text-xs leading-relaxed">
              Q3 2026 — خصّص <strong>20% من ميزانية مصر</strong> على هذي القطاعات. حملات Reels +
              YouTube بمحتوى يستهدف الـ keywords السعودية («أفضل منتجع في شرم» + «أفضل عيادة تجميل في
              القاهرة» + «شقة في رأس الحكمة للسعوديين»). راجع{" "}
              <a href="/guidelines/icps" className="text-cyan-600 font-semibold hover:underline">
                صفحة ICPs
              </a>
              {" "}للتفاصيل الكاملة.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── رحلة العميل (6 مراحل) ──────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-emerald-500" />
          <h2 className="text-base font-bold">رحلة العميل — 6 مراحل</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          من أول ظهور في محركات البحث إلى تحويل العميل لمسوّق. كل مرحلة لها قناة + محتوى + KPI + ليش
          تشتغل.
        </p>

        <div className="space-y-2">
          {journey.map((j, i) => {
            const Icon = j.icon;
            const c = colorMap[j.color];
            return (
              <div key={i}>
                <Card className={`${c.border} ${c.bg}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 flex-wrap mb-3">
                      <div className={`p-2 rounded-lg ${c.iconBg} shrink-0`}>
                        <Icon className={`h-4 w-4 ${c.text}`} />
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <p className={`text-sm font-bold ${c.text} mb-2`}>{j.stage}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">القناة</p>
                            <p className="leading-relaxed">{j.channel}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">المحتوى</p>
                            <p className="leading-relaxed">{j.content}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">KPI</p>
                            <p className="font-mono text-[11px]">{j.kpi}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border border-amber-500/25 bg-amber-500/[0.04] p-2.5 ms-9">
                      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <Lightbulb className="h-3 w-3" /> ليش هذي المرحلة بهذا الشكل؟
                      </p>
                      <p className="text-[11px] leading-relaxed">{j.why}</p>
                    </div>
                  </CardContent>
                </Card>
                {i < journey.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="h-3 w-3 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Telegram as Retention Channel ─────────────────────── */}
      <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.06] via-background to-background">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/15">
              <Send className="h-4 w-4 text-emerald-500" />
            </div>
            <h2 className="text-base font-bold">Telegram — قناة الاحتفاظ الأقوى عندنا</h2>
          </div>

          <p className="text-sm leading-loose mb-3">
            في رحلة العميل، Telegram يلعب دوراً <strong>غير عادي في مرحلة 5 (الاحتفاظ)</strong>. كل
            event من 22 حدث = touchpoint يومي مع العميل بدون ما نزعجه. <strong>Churn ينخفض 40%+ مع
            Telegram active</strong> — العميل يحس النظام «حي».
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div className="rounded-md border border-emerald-500/25 bg-background/70 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-500">22</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">حدث متاح للاختيار</p>
            </div>
            <div className="rounded-md border border-emerald-500/25 bg-background/70 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-500">~ثانية</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">سرعة وصول الإشعار</p>
            </div>
            <div className="rounded-md border border-emerald-500/25 bg-background/70 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-500">95%</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">Open rate (مقابل 20% للإيميل)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── KPIs ──────────────────────────────────────────────── */}
      <Card className="border-primary/30 bg-primary/[0.04]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-primary/15">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-base font-bold">الـ KPIs المستهدفة — السنة الأولى</h2>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wide mb-3">Business KPIs</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {businessKpis.map((k, i) => (
                  <div key={i} className="rounded-lg border border-primary/20 bg-background/60 p-3 text-center">
                    <p className="text-base font-bold font-mono text-primary mb-0.5">{k.value}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{k.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-violet-500 uppercase tracking-wide mb-3">Marketing شهرياً</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {monthlyMarketing.map((k, i) => (
                  <div key={i} className="rounded-md border border-violet-500/20 bg-background/60 p-2.5 text-center">
                    <p className="text-sm font-bold font-mono text-violet-500">{k.value}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{k.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── SWOT ──────────────────────────────────────────────── */}
      <Card className="border-border bg-card/40">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe2 className="h-4 w-4 text-foreground" />
            <h2 className="text-base font-bold">SWOT الاستراتيجي — الصراحة الكاملة</h2>
          </div>

          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            الموظف اللي يفهم الـ SWOT = يعرف وين يضرب + وين يحذر. <strong>الضعف ما نخفيه — نتعامل
            معه</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.04] p-4">
              <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
              </p>
              <ul className="space-y-1 text-xs">
                {swot.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 shrink-0">+</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-rose-500/30 bg-rose-500/[0.04] p-4">
              <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Weaknesses
              </p>
              <ul className="space-y-1 text-xs">
                {swot.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-500 shrink-0">−</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-blue-500/30 bg-blue-500/[0.04] p-4">
              <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" /> Opportunities
              </p>
              <ul className="space-y-1 text-xs">
                {swot.opportunities.map((o, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-blue-500 shrink-0">↑</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-amber-500/30 bg-amber-500/[0.04] p-4">
              <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Threats
              </p>
              <ul className="space-y-1 text-xs">
                {swot.threats.map((t, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-500 shrink-0">⚠</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── الخلاصة الاستراتيجية ──────────────────────────────── */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/[0.05] via-violet-500/[0.04] to-background">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold">التوصية الختامية</h2>
          </div>
          <p className="text-sm leading-loose mb-4">
            Modonty <strong>منتج ناضج تقنياً وضعيف تسويقياً</strong>. الأولوية الفورية:
          </p>
          <ol className="list-decimal ps-5 space-y-1.5 text-sm mb-4 marker:text-primary marker:font-bold">
            <li>بناء brand awareness (Founder LinkedIn + Twitter ثقيل)</li>
            <li>Landing page تحويلي (test A/B الـ Hero copy)</li>
            <li>3 case studies (حتى لو early — Modonty نفسها case study رقم 1)</li>
            <li>حملة Google Search Ads متواضعة (5K ريال/شهر)</li>
            <li>تفعيل Egypt-Gulf tier — 20% من ميزانية مصر</li>
          </ol>
          <div className="rounded-lg border border-primary/30 bg-background/70 p-4">
            <p className="text-sm leading-loose">
              <strong>خلال 3 شهور:</strong> 50 عميل أول. <strong>خلال 12 شهر:</strong> 200 عميل. السوق
              موجود (الأرقام تثبتها) — المنتج جاهز — ينقص فقط <strong>التسويق المنظّم بسلاح الـ Big
              Idea</strong>.
            </p>
          </div>
        </CardContent>
      </Card>
    </GuidelineLayout>
  );
}
