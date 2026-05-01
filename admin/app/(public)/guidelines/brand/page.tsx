import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GuidelineLayout } from "../components/guideline-layout";
import { ModontyIcon } from "@/components/admin/icons/modonty-icon";
import {
  Palette,
  Type,
  Megaphone,
  Eye,
  Target,
  Heart,
  Sparkles,
  XCircle,
  CheckCircle2,
  Image as ImageIcon,
  Lightbulb,
  Compass,
  ShieldCheck,
} from "lucide-react";

// ─── الهوية الاستراتيجية (Purpose/Vision/Mission) ──────────────
const strategicIdentity = [
  {
    label: "Purpose",
    title: "لماذا أُسّست Modonty؟",
    body: "تمكين رواد الأعمال السعوديين والمصريين من النمو عبر محركات البحث (Google + Bing + AI Search) بدون ضغط ولا تعقيد.",
    why: "هذا «الـ why» — السبب الجذري لوجود Modonty. لو الموظف ما يفهمه، كل قراراته اليومية تكون عشواء. كل feature، كل سطر copy، كل سعر — يجب يخدم هذا الهدف.",
    when: "اقرأها صباحاً قبل أي قرار استراتيجي. اذكرها للموظف الجديد في اليوم الأول.",
  },
  {
    label: "Vision",
    title: "إلى أين تتجه Modonty؟",
    body: "المرجع العربي الأكثر ثقة لقرارات SaaS والنمو والظهور في محركات البحث ضمن السياق السعودي.",
    why: "هدف 5-10 سنوات. كل قرار اليوم يجب يقرّبنا من «المرجع الأكثر ثقة» — مش مجرد منتج آخر في السوق.",
    when: "في خطط النمو، التوظيف، الشراكات. لما تختار بين خيارين، اختر اللي يبني الثقة أكثر.",
  },
  {
    label: "Mission",
    title: "كيف نحقّق ذلك يومياً؟",
    body: "إنتاج محتوى عربي متخصّص يراعي السوق السعودي والمصري، يستهدف كلمات بحث ذات نية شراء عالية.",
    why: "هذا الـ «how» اليومي. كل مقال، كل keyword، كل تحسين تقني — يجب يخدم هذي المعادلة (محتوى عربي + متخصص + نية شراء).",
    when: "في كل brief للكاتب، في كل review للمقال، في كل اختيار keyword.",
  },
] as const;

// ─── القيم الأساسية الخمس (Core Values) ──────────────────────
const coreValues = [
  {
    icon: Sparkles,
    titleEn: "Creative",
    titleAr: "الإبداع",
    meaning: "أفكار جديدة + حلول مبتكرة",
    example: "بدل «5 طرق لتحسين SEO» — اكتب «كيف تخدم محركات البحث عميلك بدل ما تخدم محركات البحث»",
    when: "كل قرار محتوى، تصميم، أو رسالة تسويقية",
    color: "violet",
  },
  {
    icon: Target,
    titleEn: "Accurate",
    titleAr: "الدقّة",
    meaning: "كل رقم قابل للتحقق، كل ادعاء مُسنّد بمصدر",
    example: "نقول «70× ROI لعيادة كذا» مع لقطة من GA — مش «نمو هائل»",
    when: "كل تقرير + كل ادعاء + كل رقم نعرضه على العميل",
  color: "blue",
  },
  {
    icon: Heart,
    titleEn: "Inclusive",
    titleAr: "الانفتاح",
    meaning: "تعاون + احترام + تنوّع رأي",
    example: "ندمج تجارب عملاء سعوديين ومصريين في نفس المنصة بدون تمييز — كل صوت له وزن",
    when: "في الـ team meetings، في الـ feature decisions، في الـ feedback loops",
    color: "rose",
  },
  {
    icon: Eye,
    titleEn: "Bold",
    titleAr: "الجرأة",
    meaning: "تحدّي المألوف + أهداف طموحة",
    example: "نقول للعميل «WordPress + ChatGPT ما يكفيك» بدل ما نوافق عشان نبيع",
    when: "لما العميل عنده افتراضات خاطئة — صحّحها بأدب لكن بحزم",
    color: "amber",
  },
  {
    icon: ShieldCheck,
    titleEn: "Reliable",
    titleAr: "الموثوقية",
    meaning: "ثبات + مساءلة + وفاء بالوعود",
    example: "8 مقالات شهرياً = 8 مقالات تُسلَّم في موعدها — لا تأخير، لا أعذار",
    when: "كل تسليم، كل التزام، كل وعد للعميل",
    color: "emerald",
  },
] as const;

// ─── Tone of Voice (4 أصوات) ──────────────────────────────────
const toneOfVoice = [
  {
    titleEn: "Bold and Adaptable",
    titleAr: "جريء ومرن",
    meaning: "نواجه التحديات بثقة، ونتكيّف مع كل سياق",
    do: "«مدونتك تحتاج 3-6 شهور لتثمر — هذي طبيعة SEO، إحنا صريحين»",
    dont: "«النتائج فورية ومضمونة 100%»",
    when: "في الاعتراضات، الـ pitch، الـ realistic expectations",
  },
  {
    titleEn: "Sleek and Purposeful",
    titleAr: "أنيق وله غرض",
    meaning: "كل عنصر له دور — لا حشو، لا زخرفة بدون معنى",
    do: "«1,299 ريال شهرياً = 8 مقالات + لوحة + Lead Scoring»",
    dont: "«تجربة فريدة من نوعها لمحتوى لا يُضاهى يقدّم لك...»",
    when: "في كل copy، كل تصميم، كل عنصر UI",
  },
  {
    titleEn: "Collaborative",
    titleAr: "تعاوني",
    meaning: "نبسّط التعقيد، نعمل مع العميل لا فوقه",
    do: "«أعطني 5 دقائق نراجع مع بعض الـ keywords قبل النشر»",
    dont: "«نحن خبراء، اتركها لنا»",
    when: "في الـ Discovery Call، في الـ onboarding، في كل تواصل مستمر",
  },
  {
    titleEn: "Future-Driven",
    titleAr: "موجَّه للمستقبل",
    meaning: "نستكشف الفرص، نكسر الحدود — لا نكتفي بالحاضر",
    do: "«احنا أوّل منصة عربية تدعم AI Crawler Optimization لـ ChatGPT Search»",
    dont: "«احنا منصة مدونات تقليدية»",
    when: "في الـ pitch، في الـ marketing، في feature announcements",
  },
] as const;

// ─── الألوان مع context الاستخدام ───────────────────────────
const colors = [
  {
    name: "Primary — Dark Navy",
    nameAr: "كحلي داكن",
    hex: "#0e065a",
    swatch: "bg-[#0e065a]",
    use: "اللوقو + الـ headers الرئيسية + النصوص القوية",
    avoid: "خلفيات كاملة (يثقل العين) — استخدمه كـ accent",
  },
  {
    name: "Secondary — Royal Blue",
    nameAr: "أزرق ملكي",
    hex: "#3030ff",
    swatch: "bg-[#3030ff]",
    use: "الـ CTAs + الروابط + العناصر التفاعلية",
    avoid: "للنصوص الطويلة (تعب بصري)",
  },
  {
    name: "Tertiary — Cyan",
    nameAr: "سماوي",
    hex: "#00d8d8",
    swatch: "bg-[#00d8d8]",
    use: "Accents + Badges + highlights خفيفة",
    avoid: "كلون أساسي للنص (تباين منخفض)",
  },
  {
    name: "White",
    nameAr: "أبيض",
    hex: "#ffffff",
    swatch: "bg-white border border-border",
    use: "خلفيات نظيفة + cards",
    avoid: "—",
  },
  {
    name: "Black",
    nameAr: "أسود",
    hex: "#000000",
    swatch: "bg-black",
    use: "نصوص قوية + headlines",
    avoid: "خلفيات كبيرة (Modonty مش brand داكن)",
  },
  {
    name: "Grey 1",
    nameAr: "رمادي قاتم",
    hex: "#5b5b5b",
    swatch: "bg-[#5b5b5b]",
    use: "نص ثانوي (muted) + sub-titles",
    avoid: "—",
  },
  {
    name: "Grey 2",
    nameAr: "رمادي متوسط",
    hex: "#a0a0a0",
    swatch: "bg-[#a0a0a0]",
    use: "حدود (borders) + dividers",
    avoid: "للنصوص (تباين منخفض)",
  },
  {
    name: "Grey 3",
    nameAr: "رمادي فاتح",
    hex: "#dbdbdb",
    swatch: "bg-[#dbdbdb] border border-border",
    use: "خلفيات ناعمة + sections",
    avoid: "للنصوص (مش قابل للقراءة)",
  },
] as const;

// ─── ممنوعات اللوقو ─────────────────────────────────────────
const logoRules = {
  donts: [
    "تمدد اللوقو (stretch)",
    "تدوّر اللوقو (rotate)",
    "تعكسه أفقياً (mirror)",
    "تعكسه عمودياً (flip)",
    "تشوّهه (distort)",
    "تعيد تلوينه",
    "تضعه داخل container إضافي",
  ],
  dos: [
    "استخدم النسخة الأصلية بدون تعديل",
    "احفظ نسبة الأبعاد الأصلية (1:1)",
    "اترك مساحة بيضاء (clear space) حول اللوقو",
    "استخدم النسخة الفاتحة على خلفية داكنة + العكس",
    "حجم أدنى 24px لقابلية التعرّف",
  ],
};

// ─── Anti-Hooks مع البديل المقترح ─────────────────────────
const antiHooks = [
  {
    word: "«مدوّنة» بمفردها",
    reason: "يستهلك من قيمة المنتج (مدونتي SaaS متكامل، مش مدونة)",
    alternative: "«منصة» / «نظام محتوى» / «SaaS»",
    wrong: "«نقدّم لك مدوّنة احترافية»",
    right: "«نقدّم لك منصة محتوى احترافية»",
  },
  {
    word: "«أرخص»",
    reason: "يقلّل perceived value — العميل يفكّر «شي رخيص = جودة منخفضة»",
    alternative: "«ROI» / «توفير» / «استثمار ذكي»",
    wrong: "«نحن أرخص من الوكالات»",
    right: "«نوفّر لك 95% من تكلفة الوكالة بنفس الجودة»",
  },
  {
    word: "«AI-powered» بمفردها",
    reason: "كل المنتجات تقولها — صارت كلمة جوفاء بدون قيمة",
    alternative: "اذكر النتيجة، مش الأداة (مثلاً «يكتشف نية الشراء»)",
    wrong: "«منصتنا AI-powered»",
    right: "«تكشف لك الزائر اللي قريب من الشراء»",
  },
  {
    word: "«Easy»",
    reason: "الجمهور السعودي/المصري ما يبحث عن «easy» — يبحث عن «نتيجة»",
    alternative: "«تلقائي» / «بدون تدخل منك» / «تشتغل بنفسها»",
    wrong: "«SEO سهل وبسيط»",
    right: "«SEO تلقائي — ما تحتاج تفهم ولا حاجة»",
  },
] as const;

// ─── سيناريوهات الـ brand voice في حوار حقيقي ─────────────
const brandVoiceScenarios = [
  {
    situation: "العميل يسأل عن السرعة",
    customer: "«طيب، خلال كم أحصل على نتائج؟»",
    wrongTone: "«نتائج فورية مضمونة من اليوم الأول!»",
    wrongWhy: "كذب — يحرق الثقة لما النتائج تتأخر",
    rightTone: "«SEO يحتاج 3-6 شهور لتثمر — هذي طبيعة Google. لكن من اليوم الأول، تشوف Lead Scoring لكل زائر.»",
    rightWhy: "صراحة + قيمة فورية + تثبيت توقعات",
    valueShown: "Bold and Adaptable + Accurate",
  },
  {
    situation: "العميل يقارنك بـ ChatGPT",
    customer: "«أنا أكتب بـ ChatGPT، ليش أحتاجكم؟»",
    wrongTone: "«ChatGPT ضعيف، مدونتي أحسن»",
    wrongWhy: "هجوم على أداة العميل = هجوم على قراره",
    rightTone: "«ChatGPT ممتاز للكتابة. لكن السؤال: هل المقال يجتاز فحوصات محركات البحث؟ هنا الفرق.»",
    rightWhy: "احترام + إعادة توجيه للسؤال الصحيح",
    valueShown: "Collaborative + Bold",
  },
  {
    situation: "العميل يتردّد في السعر",
    customer: "«1,299 شهرياً — كثير شوي»",
    wrongTone: "«احنا أرخص خيار في السوق»",
    wrongWhy: "Anti-hook: «أرخص» تدمّر perceived value",
    rightTone: "«احسبها كذا: فريق WordPress (Dev + Designer + كاتب + SEO) = 18,000 شهرياً. عندنا 1,299 — توفّر 16,701 شهرياً.»",
    rightWhy: "ROI واضح بأرقام قابلة للتحقق",
    valueShown: "Accurate + Sleek and Purposeful",
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

export default function BrandGuidelinesPage() {
  return (
    <GuidelineLayout
      title="البراند — الهوية البصرية والصوت"
      description="كل قرار تصميمي وكتابي يبدأ من هنا — Purpose/Vision/Mission + قيم + tone + ألوان + خطوط + ممنوعات"
    >
      {/* ── Hero — لماذا هذي الصفحة؟ ─────────────────────────────── */}
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/[0.06] via-background to-background">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 shrink-0">
              <Lightbulb className="h-7 w-7 text-amber-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold mb-2">لماذا تقرأ هذي الصفحة؟</h2>
              <p className="text-sm leading-loose text-foreground/85">
                البراند ليس مجرد <strong>لوقو + ألوان</strong>. البراند هو <strong>كل قرار</strong> يأخذه
                الموظف يومياً — أي كلمة يستخدمها، أي لون يضعه، أي رسالة يكتبها. لو الفريق ما يفهم
                البراند، يخسر العميل بصمت — لأن العميل يحس فوراً بعدم الانسجام، حتى لو ما يقدر يشرحه.
              </p>
              <p className="text-xs text-muted-foreground italic mt-3 leading-relaxed">
                💡 <strong>القاعدة:</strong> لو شككت في قرار، ارجع لـ Purpose/Vision/Mission. الإجابة دايماً
                هناك.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── قصة الشعار — النقطة (الفلسفة قبل التفاصيل) ───────────── */}
      <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.07] via-background to-background">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-emerald-500/15">
              <Sparkles className="h-4 w-4 text-emerald-500" />
            </div>
            <h2 className="text-base font-bold">قصة الشعار — لماذا النقطة؟</h2>
          </div>

          {/* Full logo display */}
          <div className="rounded-xl bg-background border border-emerald-500/30 shadow-sm p-8 mb-5 flex items-center justify-center min-h-[180px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand-assets/logo-dark.svg"
              alt="شعار Modonty الكامل"
              className="max-h-32 w-auto block dark:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand-assets/logo-light.svg"
              alt="شعار Modonty الكامل"
              className="max-h-32 w-auto hidden dark:block"
            />
          </div>

          <p className="text-sm text-foreground/85 leading-loose mb-5 text-center">
            النقطة الصغيرة (المربع المائل بالأسفل) <strong>ليست عنصر زخرفة</strong>. هي القصة الكاملة
            — اللي تشدّ كل ما نعمله ببعضه.
          </p>

          <div className="space-y-3">
            {/* The big idea */}
            <div className="rounded-lg border-2 border-emerald-500/30 bg-background/70 p-5 text-center">
              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-3">
                الفكرة الجوهرية
              </p>
              <p className="text-lg font-bold leading-loose text-emerald-700 dark:text-emerald-400">
                «كل نصّ في العالم يبدأ بنقطة، وينتهي بنقطة.»
              </p>
            </div>

            {/* Three universal truths */}
            <div className="rounded-lg border border-emerald-500/25 bg-background/60 p-4">
              <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wide mb-3">
                ثلاث حقائق عن النقطة في الكتابة
              </p>
              <ul className="space-y-2 text-sm leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 shrink-0 font-bold">①</span>
                  <span>
                    <strong>أول حركة قلم على ورق</strong> = نقطة. لا يبدأ نص بدونها.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 shrink-0 font-bold">②</span>
                  <span>
                    <strong>آخر علامة في الجملة</strong> = نقطة. هي الإغلاق، الإتمام، الكمال.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 shrink-0 font-bold">③</span>
                  <span>
                    <strong>الذرّة الأولى للمحتوى المكتوب</strong> = نقطة. كل حرف، كل كلمة، كل كتاب —
                    يرجع لها.
                  </span>
                </li>
              </ul>
            </div>

            {/* What it means for Modonty — 3 layers */}
            <div className="rounded-lg border border-primary/25 bg-primary/[0.04] p-4">
              <p className="text-[11px] font-bold text-primary uppercase tracking-wide mb-3">
                ماذا تعني النقطة في شعار Modonty؟
              </p>
              <ul className="space-y-2.5 text-sm leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="text-primary shrink-0 font-bold text-xs mt-0.5">📝</span>
                  <span>
                    <strong>تذكير دائم:</strong> كل ما نصنعه يبدأ من النقطة الأولى — مقال أو منصة أو
                    قرار. لا اختصارات.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-primary shrink-0 font-bold text-xs mt-0.5">🤝</span>
                  <span>
                    <strong>وعد للعميل:</strong> كل مقال نكتبه يصل لنقطته النهائية بإتقان. لا تسليم
                    ناقص، لا منتصف طريق.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-primary shrink-0 font-bold text-xs mt-0.5">🏛️</span>
                  <span>
                    <strong>رمز الأساس:</strong> مهما كبر البنيان (Authority Blog Network)، يبقى
                    مبنياً نقطة فوق نقطة. هذي قاعدة الـ Moat (القاعدة 20).
                  </span>
                </li>
              </ul>
            </div>

            {/* The poetic close */}
            <div className="rounded-md border border-violet-500/25 bg-violet-500/[0.04] p-4 text-center">
              <p className="text-sm leading-loose italic text-violet-700 dark:text-violet-300">
                «من النقطة الأولى... إلى النقطة الأخيرة.
                <br />
                كل قصة، كل مقال، كل عميل.»
              </p>
            </div>

            {/* Why this story matters for the team */}
            <div className="rounded-md border border-amber-500/25 bg-amber-500/[0.04] p-3">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Lightbulb className="h-3 w-3" /> ليش الموظف يحتاج يعرف هذي القصة؟
              </p>
              <p className="text-xs leading-relaxed text-foreground/85">
                لما العميل يسأل «وش معنى الشعار؟»، الموظف اللي يقول «نقطة جميلة» = خسر فرصة. الموظف
                اللي يحكي القصة كاملة = <strong>يبني علاقة عاطفية</strong> مع العميل. القصة
                تحوّل الـ logo من شكل بصري إلى <strong>إعلان فلسفي</strong> عن جودتنا.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── الهوية الاستراتيجية (Purpose/Vision/Mission) ──────────── */}
      <Card className="border-primary/30 bg-primary/[0.04]">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-background border border-border shadow-sm shrink-0">
              <ModontyIcon className="h-9 w-9" />
            </div>
            <div>
              <h2 className="text-base font-bold mb-1">الهوية الاستراتيجية — 3 ركائز</h2>
              <p className="text-xs text-muted-foreground">
                الـ Why · الـ Where · الـ How — احفظ الثلاثة بالحرف
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {strategicIdentity.map((s) => (
              <div key={s.label} className="rounded-lg border border-primary/25 bg-background/70 p-5 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px] border-primary/40 text-primary font-bold uppercase tracking-wide">
                    {s.label}
                  </Badge>
                  <p className="text-sm font-bold">{s.title}</p>
                </div>

                <p className="text-sm leading-loose">{s.body}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2 border-t border-primary/15">
                  <div className="rounded-md border border-amber-500/25 bg-amber-500/[0.04] p-3">
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" /> ليش مهمة؟
                    </p>
                    <p className="text-xs leading-relaxed">{s.why}</p>
                  </div>
                  <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.04] p-3">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                      <Target className="h-3 w-3" /> متى تستخدمها؟
                    </p>
                    <p className="text-xs leading-relaxed">{s.when}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── القيم الأساسية الخمس ──────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-4 w-4 text-rose-500" />
          <h2 className="text-base font-bold">القيم الأساسية الخمس — كيف تظهر يومياً</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          كل قيمة لها معنى عربي + مثال محسوس. الموظف يستوعبها لما يشوفها في موقف فعلي.
        </p>

        <div className="space-y-3">
          {coreValues.map((v) => {
            const Icon = v.icon;
            const c = colorMap[v.color];
            return (
              <Card key={v.titleEn} className={`${c.border} ${c.bg}`}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <div className={`p-2 rounded-lg ${c.iconBg}`}>
                      <Icon className={`h-4 w-4 ${c.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold">{v.titleAr}</p>
                      <p className={`text-[11px] font-mono ${c.text}`}>{v.titleEn}</p>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed mb-3">{v.meaning}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.04] p-3">
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1.5">
                        ✓ مثال في الواقع
                      </p>
                      <p className="text-xs leading-relaxed text-foreground/85">{v.example}</p>
                    </div>
                    <div className="rounded-md border border-amber-500/25 bg-amber-500/[0.04] p-3">
                      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1.5">
                        🎯 متى تظهر؟
                      </p>
                      <p className="text-xs leading-relaxed text-foreground/85">{v.when}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Tone of Voice — Do vs Don't ──────────────────────── */}
      <Card className="border-violet-500/25 bg-violet-500/[0.03]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-violet-500/15">
              <Megaphone className="h-4 w-4 text-violet-500" />
            </div>
            <h2 className="text-base font-bold">Tone of Voice — كيف نتكلّم (Do vs Don&apos;t)</h2>
          </div>

          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            4 أصوات يجب تظهر في كل copy. كل صوت له مثال محدّد لما يكون صحيح ولما يكون خاطئ.
          </p>

          <div className="space-y-3">
            {toneOfVoice.map((t) => (
              <div key={t.titleEn} className="rounded-lg border border-violet-500/25 bg-background/70 p-5">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <p className="text-sm font-bold text-violet-500">{t.titleAr}</p>
                  <p className="text-[11px] font-mono text-muted-foreground">({t.titleEn})</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{t.meaning}</p>

                <div className="space-y-2 mb-3">
                  <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.05] p-3">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1">
                      ✓ Do
                    </p>
                    <p className="text-sm leading-relaxed">«{t.do}»</p>
                  </div>
                  <div className="rounded-md border border-rose-500/25 bg-rose-500/[0.05] p-3">
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wide mb-1">
                      ✗ Don&apos;t
                    </p>
                    <p className="text-sm leading-relaxed line-through text-muted-foreground">«{t.dont}»</p>
                  </div>
                </div>

                <div className="rounded-md border border-amber-500/20 bg-amber-500/[0.04] p-2.5">
                  <p className="text-[10px] text-amber-500 font-semibold mb-0.5">🎯 متى تستخدمه</p>
                  <p className="text-[11px] leading-relaxed text-foreground/85">{t.when}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── الألوان مع context الاستخدام ──────────────────────── */}
      <Card className="border-blue-500/25 bg-blue-500/[0.03]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-blue-500/15">
              <Palette className="h-4 w-4 text-blue-500" />
            </div>
            <h2 className="text-base font-bold">الألوان — متى تستخدم أي لون؟</h2>
          </div>

          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            كل لون له <strong>استخدام محدّد</strong> — مش مجرد «حلو في العين». المصمم اللي يخلط الألوان
            عشواء يضعف الـ brand consistency.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {colors.map((c) => (
              <div
                key={c.hex}
                className="rounded-lg border border-blue-500/20 bg-background/60 p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-md ${c.swatch} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{c.nameAr}</p>
                    <p className="text-[10px] text-muted-foreground">{c.name}</p>
                    <p className="text-[11px] font-mono text-blue-500 mt-0.5">{c.hex}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-1.5 text-[11px]">
                    <span className="text-emerald-500 shrink-0 font-bold">✓</span>
                    <span className="leading-relaxed"><strong className="text-emerald-500">استخدمه:</strong> {c.use}</span>
                  </div>
                  {c.avoid !== "—" && (
                    <div className="flex items-start gap-1.5 text-[11px]">
                      <span className="text-rose-500 shrink-0 font-bold">✗</span>
                      <span className="leading-relaxed"><strong className="text-rose-500">تجنّبه:</strong> {c.avoid}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── الخطوط ─────────────────────────────────────────────── */}
      <Card className="border-emerald-500/25 bg-emerald-500/[0.03]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-emerald-500/15">
              <Type className="h-4 w-4 text-emerald-500" />
            </div>
            <h2 className="text-base font-bold">الخطوط (Typography) — متى أيهما</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="rounded-lg border border-emerald-500/25 bg-background/60 p-5">
              <p className="text-[10px] font-mono text-muted-foreground mb-1">Latin / English</p>
              <p className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-montserrat)" }}>
                Montserrat
              </p>
              <p className="text-xs text-muted-foreground mb-3">للنصوص الإنجليزية + الأرقام + المصطلحات التقنية</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <Badge variant="outline" className="text-[10px]">Bold</Badge>
                <Badge variant="outline" className="text-[10px]">SemiBold</Badge>
                <Badge variant="outline" className="text-[10px]">Regular</Badge>
              </div>
              <div className="rounded-md bg-emerald-500/[0.05] border border-emerald-500/20 p-2.5 text-[11px]">
                <p className="font-bold text-emerald-500 mb-0.5">✓ مثال:</p>
                <p>SEO · ROI · 1,299 SAR · Modonty · Dashboard</p>
              </div>
            </div>
            <div className="rounded-lg border border-emerald-500/25 bg-background/60 p-5">
              <p className="text-[10px] font-mono text-muted-foreground mb-1">Arabic</p>
              <p className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-tajawal)" }}>
                تجوال (Tajawal)
              </p>
              <p className="text-xs text-muted-foreground mb-3">للنصوص العربية + العناوين + الـ body content</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <Badge variant="outline" className="text-[10px]">Bold</Badge>
                <Badge variant="outline" className="text-[10px]">Medium</Badge>
                <Badge variant="outline" className="text-[10px]">Regular</Badge>
              </div>
              <div className="rounded-md bg-emerald-500/[0.05] border border-emerald-500/20 p-2.5 text-[11px]">
                <p className="font-bold text-emerald-500 mb-0.5">✓ مثال:</p>
                <p>«حضور لا وعود» · العنوان الرئيسي · الفقرات</p>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-amber-500/25 bg-amber-500/[0.04] p-3">
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1.5">
              🎯 القاعدة الذهبية
            </p>
            <p className="text-xs leading-relaxed">
              النص العربي = <strong>Tajawal</strong>. النص الإنجليزي + الأرقام + المصطلحات التقنية =
              <strong> Montserrat</strong>. لا تستخدم خطوط ثانية حتى في عرض تقديمي — الـ consistency
              تبني الثقة.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── ممنوعات اللوقو + المسموحات ─────────────────────── */}
      <Card className="border-rose-500/30 bg-rose-500/[0.03]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-rose-500/15">
              <XCircle className="h-4 w-4 text-rose-500" />
            </div>
            <h2 className="text-base font-bold">اللوقو — ممنوعات ومسموحات</h2>
          </div>

          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-xl bg-background border border-border shadow-sm shrink-0">
              <ModontyIcon className="h-12 w-12" />
            </div>
            <p className="text-sm text-foreground/85 leading-relaxed">
              اللوقو هو هويتنا البصرية الأولى — أي تشويه له = إضعاف للعلامة. هذي القائمتين مطلقتان، ولا
              استثناءات.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-md border border-rose-500/25 bg-rose-500/[0.04] p-4">
              <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wide mb-3">
                ✗ ممنوعات (DON&apos;Ts) — 7
              </p>
              <ul className="space-y-1.5">
                {logoRules.donts.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.04] p-4">
              <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wide mb-3">
                ✓ مسموحات (DOs) — 5
              </p>
              <ul className="space-y-1.5">
                {logoRules.dos.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Anti-Hooks مع البديل المعتمد ─────────────────────── */}
      <Card className="border-amber-500/30 bg-amber-500/[0.03]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-amber-500/15">
              <XCircle className="h-4 w-4 text-amber-500" />
            </div>
            <h2 className="text-base font-bold">Anti-Hooks — كلمات ممنوعة + البديل</h2>
          </div>

          <p className="text-sm text-foreground/85 leading-relaxed mb-4">
            هذي الكلمات تضعف الرسالة وتُسقط القيمة الـ perceived. <strong>لا تستخدمها أبداً</strong>. لكل
            كلمة ممنوعة، فيه بديل معتمد + مثال قبل/بعد.
          </p>

          <div className="space-y-3">
            {antiHooks.map((a, i) => (
              <div key={i} className="rounded-lg border border-amber-500/25 bg-background/70 p-4">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-rose-500 text-base">❌</span>
                  <p className="text-sm font-bold">{a.word}</p>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  <strong className="text-amber-500">السبب:</strong> {a.reason}
                </p>

                <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.04] p-2.5 mb-2">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1">
                    ✓ البديل
                  </p>
                  <p className="text-xs leading-relaxed">{a.alternative}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md border border-rose-500/20 bg-rose-500/[0.04] p-2.5">
                    <p className="text-[10px] font-bold text-rose-500 mb-1">قبل (غلط)</p>
                    <p className="line-through text-muted-foreground leading-relaxed">«{a.wrong}»</p>
                  </div>
                  <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.05] p-2.5">
                    <p className="text-[10px] font-bold text-emerald-500 mb-1">بعد (صحيح)</p>
                    <p className="leading-relaxed">«{a.right}»</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Brand Voice في حوار حقيقي ──────────────────────── */}
      <Card className="border-primary/30 bg-primary/[0.04]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-primary/15">
              <Compass className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-base font-bold">البراند في حوار حقيقي — 3 سيناريوهات</h2>
          </div>

          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            الفرق بين موظف يفهم البراند وموظف يحفظ الكلام = يظهر هنا. كل سيناريو فيه نسختين: الخاطئة
            والصحيحة، مع شرح ليش.
          </p>

          <div className="space-y-3">
            {brandVoiceScenarios.map((s, i) => (
              <div key={i} className="rounded-lg border border-primary/25 bg-background/70 p-5 space-y-3">
                <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
                  السيناريو {i + 1}: {s.situation}
                </Badge>

                <div className="rounded-md border border-border/50 bg-background/60 p-3 text-xs">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">
                    العميل يقول:
                  </p>
                  <p className="leading-relaxed">{s.customer}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div className="rounded-md border border-rose-500/25 bg-rose-500/[0.05] p-3">
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wide mb-1.5">
                      ✗ الموظف الخاطئ
                    </p>
                    <p className="text-xs line-through text-muted-foreground leading-relaxed mb-2">«{s.wrongTone}»</p>
                    <p className="text-[10px] text-rose-500 leading-relaxed italic">→ {s.wrongWhy}</p>
                  </div>
                  <div className="rounded-md border border-emerald-500/30 bg-emerald-500/[0.06] p-3">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1.5">
                      ✓ الموظف الذي يفهم البراند
                    </p>
                    <p className="text-xs leading-relaxed mb-2">«{s.rightTone}»</p>
                    <p className="text-[10px] text-emerald-500 leading-relaxed italic">→ {s.rightWhy}</p>
                  </div>
                </div>

                <div className="rounded-md border border-violet-500/25 bg-violet-500/[0.04] p-2.5 text-xs">
                  <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-0.5">
                    🎯 القيم/الأصوات اللي ظهرت
                  </p>
                  <p className="text-[11px] font-semibold">{s.valueShown}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── إشارة لدليل الوسائط ─────────────────────────────────── */}
      <Card className="border-border bg-card/40">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
              <ImageIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold mb-1">مقاسات الصور والمعدات البصرية</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                لكل المقاسات المعتمدة (الصورة الرئيسية للمقال، اللوقو، صورة الكاتب، الغلاف) — راجع{" "}
                <a href="/guidelines/media" className="text-primary font-semibold hover:underline">
                  دليل الوسائط
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </GuidelineLayout>
  );
}
