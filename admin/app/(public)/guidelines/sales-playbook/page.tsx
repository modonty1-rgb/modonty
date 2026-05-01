import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GuidelineLayout } from "../components/guideline-layout";
import {
  Megaphone,
  Clock,
  PhoneCall,
  Presentation,
  Shield,
  CheckCircle2,
  Sparkles,
  Calculator,
  Award,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  Send,
  Plane,
} from "lucide-react";

// ─── 5 الاعتراضات الأكثر شيوعاً (مصلَّحة حسابياً) ─────────────
const objections = [
  {
    num: 1,
    severity: "common",
    q: "غالي",
    a: "1,299 ريال شهري = 43 ريال يومياً. حملة Snapchat واحدة تكلف أكثر، وتنتهي يوم الدفع. مقالات Modonty تشتغل دائماً، تجيب زوار حتى لو وقفت الدفع غداً.",
    why: "العميل يسمع «غالي» يفكر في cost. إنت تحوّل النقاش لـ value/day — 43 ريال يومياً = مشروب قهوة، لكنه يجيب lead/شهر.",
    when: "أول اعتراض في 80% من الـ Discovery Calls. اطلقها بدون تردّد.",
  },
  {
    num: 2,
    severity: "common",
    q: "أكتب بنفسي / أجيب كاتب",
    a: "كاتب junior بـ 3,000 ريال شهري + متخصص SEO 4,000 + مصمم 4,000 + مطور 7,000 = 18,000 شهري بالحد الأدنى = 216,000 سنوياً. Modonty Momentum 1,299 شهري (15,588 سنوياً) — توفير 200,412 ريال/سنة، مع منظومة أكمل من الفريق كله.",
    why: "العميل يفكر بكاتب وحيد. إنت تذكّره: المقال SEO-perfect يحتاج فريق كامل، مش شخص. الأرقام بالحد الأدنى = عميل ما يقدر يعارض.",
    when: "بعد ما يقول «أكتب بنفسي» أو «عندي كاتب على Fiverr». الجدول الكامل في القاعدة 5 من القواعد الذهبية.",
  },
  {
    num: 3,
    severity: "critical",
    q: "WordPress + ChatGPT يكفي",
    a: "تماماً، تقدر تكتب بـ ChatGPT. السؤال مو الكتابة — السؤال الجودة اللي تقبلها محركات البحث. Modonty تطلّع مقال يجتاز 9 فحوصات قبل النشر (E-E-A-T، JSON-LD، Schema، YMYL، Knowledge Graph، Citations، AI Crawler optimization، Reading level، Pre-publish audit). هذا مو AI، هذا نظام جودة محتوى. ChatGPT يكتب نص. Modonty تنشر مقال يظهر في نتائج البحث (Google + Bing + ChatGPT Search) ويجيب لك عملاء.",
    why: "80% من العملاء عندهم هذا الاعتراض. لو ما عندك رد محفوظ، تخسر الصفقة في ثانية. القاعدة: ما تحارب AI، تستخدمه. تنقل المعركة من «الكتابة» إلى «الجودة اللي تقبلها محركات البحث».",
    when: "كل مرة العميل يذكر ChatGPT أو AI أو WordPress. القاعدة 14 الأخطر — احفظ الرد حرفياً.",
  },
  {
    num: 4,
    severity: "common",
    q: "الإعلانات أسرع",
    a: "صحيح على المدى القصير. لكن: لما تبطّل تدفع → الترافيك صفر فوراً. المقال يستمر سنين بدون ميزانية إضافية. خدمات التسويق تأجير. مدونتي تملّك. مو بديل، مكمّل.",
    why: "العميل يقارن سرعة، إنت تقارن استدامة. الإعلان = إيجار، المقال = أصل. هذا تحويل عقلية cost إلى asset.",
    when: "لما يقول «أنا أعتمد على Snapchat/Meta». اطلقها مع جملة القاعدة 5: «خدمات التسويق تأجير. مدونتي تملّك».",
  },
  {
    num: 5,
    severity: "common",
    q: "ليش modonty.com مش دوميني؟",
    a: "كالبنيان يشد بعضه بعضاً (حديث نبوي شريف). modonty.com بنيان قائم بسلطة Domain Authority راسخة. أنت طوبة في بنيان قائم، مش طوبة وحيدة في الصحراء. مدونة جديدة على دومينك تحتاج 1-2 سنة لمحركات البحث تثق فيها. عندنا، تستفيد من السلطة من اليوم الأول.",
    why: "هذا الاعتراض من عميل ذكي يفهم Domain Authority. الرد بـ الإطار الديني/الثقافي = يكسر المقارنة العالمية. هذا الـ Moat الذي لا يقدر منافس صغير يقلّده.",
    when: "لما العميل يقارنك بـ WordPress أو يسأل عن الدومين. القاعدة 20 من القواعد الذهبية.",
  },
] as const;

// ─── 4 الباقات (الأسعار شهرية!) ──────────────────────────────
const fourPackages = [
  { name: "Free", price: "0", period: "30 يوم تجربة", when: "عميل متردد · تجربة · ICP صغير", featured: false },
  { name: "Launch", price: "499", period: "شهري", when: "محامي مستقل · عيادة فردية · متجر صغير", featured: false },
  { name: "Momentum", price: "1,299", period: "شهري", when: "الأكثر شعبية — معظم الـ ICPs", featured: true },
  { name: "Leadership", price: "2,999", period: "شهري", when: "عيادات كبيرة · شركات · B2B serious", featured: false },
] as const;

// ─── 4 جمل إغلاق (مع متى تستخدمها) ───────────────────────────
const closingLines = [
  {
    type: "ناعم",
    icon: Sparkles,
    line: "تبغى نبدأ بالـ Free tier 30 يوم تجرّب؟",
    when: "للعميل المتردد، أو في نهاية Discovery لطيفة بدون ضغط",
    color: "primary",
  },
  {
    type: "بالـ ROI",
    icon: Calculator,
    line: "لو حصلت 2 عملاء بس من مقال واحد، تكون استرجعت السعر. متى نبدأ؟",
    when: "للعميل العقلاني الذي يحب الأرقام (محامي، طبيب، صاحب شركة)",
    color: "emerald",
  },
  {
    type: "بإلغاء المخاطرة",
    icon: Shield,
    line: "12 شهر دفع = 18 شهر خدمة. وفيه Free tier للتجربة. أي مخاطرة فعلية ما فيه.",
    when: "للعميل الحذر الذي يخشى الالتزام طويل المدى",
    color: "violet",
  },
  {
    type: "بالاستعجال (للوكالات)",
    icon: Award,
    line: "حالياً نقبل 5 وكالات للـ Reseller program. 3 منهم انضموا الأسبوع الماضي.",
    when: "حصرياً للوكالات (Tier 2). لا تستخدمها مع SMB — تبدو إعلان تجاري",
    color: "amber",
  },
] as const;

// ─── Demo timeline ──────────────────────────────────────────
const fullDemoTimeline = [
  { time: "0–3", title: "افتتاح", body: "تحدد المدة، تطلب إذن للأسئلة، تثبّت الـ tone" },
  { time: "3–8", title: "Discovery", body: "5 أسئلة عميقة لفهم وضعه (الـ pain points الـ 7)" },
  { time: "8–12", title: "عرض المشكلة", body: "اربط ألمه بالحل — قل «زي ما قلت لي...»" },
  { time: "12–22", title: "Live Demo", body: "افتح console.modonty.com لـ demo client + أرسل Telegram event حقيقي" },
  { time: "22–25", title: "العرض + ROI", body: "حاسبة (1,299 شهري → 92,000 سنوي عائد)" },
  { time: "25–28", title: "معالجة الاعتراضات", body: "استخدم جدول الـ 5 اعتراضات أدناه" },
  { time: "28–30", title: "Closing", body: "اختر جملة الإغلاق المناسبة لشخصيته" },
] as const;

// ─── Egypt-Gulf scripts (NEW) ──────────────────────────────
const egyptGulfScripts = [
  {
    sector: "منتجعات البحر الأحمر (شرم/الغردقة)",
    scenario: "صاحب منتجع مصري يستهدف السائح الخليجي",
    pitch: "احنا نشوف 3M+ سعودي يبحثون «أفضل منتجع شرم» على Google السعودي شهرياً. Modonty تنشر لك مقالات بلهجة خليجية، تظهر في AI Overviews + تربط بـ Authority السعودي حقنا. خلال 6 شهور — تظهر فوق Booking.com للعميل السعودي.",
    closing: "تبغى نعمل audit مجاني نوريك keywords منافسيك المصريين والسعوديين؟",
  },
  {
    sector: "السياحة العلاجية (مستشفيات/عيادات)",
    scenario: "مستشفى مصري يستقبل مرضى سعوديين/خليجيين",
    pitch: "السوق المصري في boom — نمو 76% في 2025. لكن 90% من المراكز ما يظهرون في بحث «أفضل عيادة في القاهرة». مدونتي تكتب لك مقالات طبية بـ E-E-A-T كامل + متوافقة مع لوائح الإعلام السعودية. العميل السعودي يلقاك مباشرة بدون عمولة وسيط سياحة طبية.",
    closing: "أعطني تخصصك الرئيسي — أوريك keywords سعودية تستحق المنافسة عليها.",
  },
  {
    sector: "العقارات الخليجية (الساحل الشمالي/NAC)",
    scenario: "مطوّر مصري يستهدف مشترين سعوديين/إماراتيين",
    pitch: "$1.4 مليار تدفقات خليجية للعقارات المصرية في 2025 — منهم $403M سعودي. لكن الوكالات المصرية تستهدف العميل المحلي. مدونتي تنشر مقالات SEO عربية تستهدف «شقة في رأس الحكمة للسعوديين» — keywords ما يستهدفها أحد من المنافسين.",
    closing: "تبغى نوريك في 5 دقائق كم سعودي يبحث عن مشروعك الآن؟",
  },
] as const;

// ─── Color map ─────────────────────────────────────────────
const colorMap: Record<string, { border: string; bg: string; text: string; iconBg: string }> = {
  primary: { border: "border-primary/30", bg: "bg-primary/[0.04]", text: "text-primary", iconBg: "bg-primary/15" },
  emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/[0.04]", text: "text-emerald-500", iconBg: "bg-emerald-500/15" },
  violet: { border: "border-violet-500/30", bg: "bg-violet-500/[0.04]", text: "text-violet-500", iconBg: "bg-violet-500/15" },
  amber: { border: "border-amber-500/30", bg: "bg-amber-500/[0.04]", text: "text-amber-500", iconBg: "bg-amber-500/15" },
};

export default function SalesPlaybookPage() {
  return (
    <GuidelineLayout
      title="دليل المبيعات (Sales Playbook)"
      description="3 سكريبتات + 5 اعتراضات + 4 جمل إغلاق + ROI calculator + سكريبتات Egypt-Gulf — كل ما تحتاجه قبل أي مكالمة"
    >
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.06] via-background to-background">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 shrink-0">
              <Megaphone className="h-7 w-7 text-emerald-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold mb-2">القاعدة الأساسية: 3 مستويات للعرض حسب الموقف</h2>
              <p className="text-sm text-foreground/85 leading-relaxed mb-3">
                <strong>Elevator Pitch</strong> (15–30 ثانية) للمصعد والتعارف ·{" "}
                <strong>Discovery Call</strong> (5 دقائق) للـ WhatsApp lead ·{" "}
                <strong>Full Demo</strong> (30 دقيقة) لاجتماع التقييم.
              </p>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                💡 <strong>القاعدة الذهبية:</strong> لا تستخدم سكريبت أطول مما يطلبه الموقف. عميل في
                مصعد ما يحتاج 5 دقائق Discovery — يحتاج 8 ثواني تثير اهتمامه.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── السكريبت 1 — Elevator Pitch ─────────────────────────── */}
      <Card className="border-primary/30 bg-primary/[0.04]">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="p-2 rounded-lg bg-primary/15">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-base font-bold flex-1 min-w-0">السكريبت 1 — Elevator Pitch</h2>
            <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">15–30 ثانية</Badge>
          </div>

          <div className="rounded-lg border border-primary/30 bg-background/80 p-5 mb-3">
            <p className="text-sm leading-loose">
              «نحن <strong>منصة سعودية</strong> اسمها Modonty. الفكرة: نحط لك <strong>مدونة احترافية
              </strong> باسم شركتك على modonty.com، نكتب لها مقالات شهرياً تظهر في <strong>محركات البحث
              </strong> (Google + Bing + ChatGPT Search)، ونعطيك لوحة ذكية تكشف لك الزوار اللي قريبين من
              الشراء بدرجة من 0 إلى 100 — كل هذا بسعر يبدأ من <strong>صفر</strong>، أو 1,299 ريال شهري
              للباقة الأكثر شعبية.»
            </p>
          </div>

          <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.05] p-3 mb-3">
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1">Closing</p>
            <p className="text-sm">«تبغى تشوف عرض توضيحي سريع؟»</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-4">
            <div className="rounded-md border border-amber-500/25 bg-amber-500/[0.04] p-3">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Lightbulb className="h-3 w-3" /> ليش هذي الجملة بالذات؟
              </p>
              <p className="text-xs leading-relaxed text-foreground/85">
                4 عناصر محشورة: المنشأ (سعودية = ثقة) + المنتج (مدونة احترافية + لوحة) + المنصة (محركات
                البحث، مش Google فقط) + التسعير (يبدأ من صفر). كل كلمة لها سبب.
              </p>
            </div>
            <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.04] p-3">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Target className="h-3 w-3" /> متى تستخدمها؟
              </p>
              <p className="text-xs leading-relaxed text-foreground/85">
                مصعد · حدث · WhatsApp lead · اتصال بارد. أي موقف عندك أقل من دقيقة لتكسب اهتمام.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── السكريبت 2 — Discovery Call ─────────────────────────── */}
      <Card className="border-violet-500/30 bg-violet-500/[0.04]">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="p-2 rounded-lg bg-violet-500/15">
              <PhoneCall className="h-4 w-4 text-violet-500" />
            </div>
            <h2 className="text-base font-bold flex-1 min-w-0">السكريبت 2 — Discovery Call</h2>
            <Badge variant="outline" className="text-[10px] border-violet-500/40 text-violet-500">5 دقائق</Badge>
          </div>

          <div className="space-y-3">
            <div className="rounded-md border border-violet-500/25 bg-background/70 p-4">
              <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-1.5">① الافتتاح (30 ثانية)</p>
              <p className="text-sm">
                «السلام عليكم، أنا [اسم] من Modonty. شفت طلبك. قبل ما أحكي لك أي شي، خل أفهم وضعك...»
              </p>
            </div>

            <div className="rounded-md border border-violet-500/25 bg-background/70 p-4">
              <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-2">② 3 أسئلة فقط (دقيقتين)</p>
              <ol className="list-decimal ps-5 space-y-1.5 text-sm">
                <li>«وش طبيعة شركتك؟ كم لها سنة في السوق؟»</li>
                <li>«حالياً، العملاء الجدد ييجونكم من وين أكثر شي؟»</li>
                <li>«تحاولت من قبل تكتب محتوى أو تسوي SEO؟ إيش كانت النتيجة؟»</li>
              </ol>
              <p className="text-[10px] text-muted-foreground italic mt-2">
                💡 تقنية الـ funnel: من العام للخاص. كل سؤال يستخرج معلومة + يخلق ثقة.
              </p>
            </div>

            <div className="rounded-md border border-violet-500/25 bg-background/70 p-4">
              <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-1.5">③ التشخيص (دقيقة)</p>
              <p className="text-sm leading-relaxed">
                اربط ألمه بالحل. مثال: «زي ما قلت، 80% من ترافيكك من Snapchat، يعني تدفع لكل زائر.
                Modonty تجيب لك زوار من محركات البحث <strong>مجاناً</strong> على المدى الطويل — كل مقال
                أصل دائم.»
              </p>
            </div>

            <div className="rounded-md border border-violet-500/25 bg-background/70 p-4">
              <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-1.5">④ العرض في 3 جمل (دقيقة)</p>
              <p className="text-sm">
                قدّم: <strong>الباقة الأنسب</strong> (Momentum للأغلب) + <strong>أهم 3 مميزات</strong>{" "}
                (الـ Authority Blog + Lead Scoring + Telegram alerts) + <strong>قاعدة 12=18</strong>.
              </p>
            </div>

            <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.05] p-3">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1">⑤ Closing (30 ثانية)</p>
              <p className="text-sm">«تبغى نبدأ بـ Free tier تجرّب 30 يوم قبل ما تدفع؟»</p>
            </div>

            {/* Why + When */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-4">
              <div className="rounded-md border border-amber-500/25 bg-amber-500/[0.04] p-3">
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" /> ليش هذا الترتيب؟
                </p>
                <p className="text-xs leading-relaxed text-foreground/85">
                  ① ثقة → ② تشخيص → ③ ربط بألمه → ④ حل مفصّل → ⑤ خطوة سهلة. كل خطوة تقود للي بعدها بدون
                  اعتراض.
                </p>
              </div>
              <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.04] p-3">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                  <Target className="h-3 w-3" /> متى تستخدمه؟
                </p>
                <p className="text-xs leading-relaxed text-foreground/85">
                  WhatsApp lead جاد · مكالمة مجدولة · أول لقاء حقيقي. ما يصلح للـ cold contacts.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── السكريبت 3 — Full Demo ──────────────────────────────── */}
      <Card className="border-amber-500/30 bg-amber-500/[0.04]">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="p-2 rounded-lg bg-amber-500/15">
              <Presentation className="h-4 w-4 text-amber-500" />
            </div>
            <h2 className="text-base font-bold flex-1 min-w-0">السكريبت 3 — Full Demo</h2>
            <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-500">30 دقيقة</Badge>
          </div>

          <div className="space-y-2 mb-4">
            {fullDemoTimeline.map((step, i) => (
              <div key={i} className="flex items-start gap-3 rounded-md border border-amber-500/20 bg-background/60 p-3">
                <span className="shrink-0 px-2 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-500 w-16 text-center">
                  {step.time}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold mb-0.5">{step.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Telegram demo trick */}
          <div className="rounded-md border border-cyan-500/30 bg-cyan-500/[0.05] p-4">
            <p className="text-[11px] font-bold text-cyan-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5" /> 🔥 الحركة السرّية في Live Demo
            </p>
            <p className="text-xs leading-loose">
              في الدقيقة 12-22 (Live Demo): اطلب رقم Telegram من العميل، ربطه على bot tester، ثم{" "}
              <strong>أرسل event حقيقي يستلمه على جواله الآن</strong>. التأثير: العميل يحس قيمة Real-time
              engagement فوراً. <strong>هذي الحركة وحدها أقفلت 30%+ من صفقاتي السابقة.</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── الـ 5 اعتراضات (مع 3-layer pattern) ───────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-rose-500" />
          <h2 className="text-base font-bold">الاعتراضات الخمسة الأكثر شيوعاً — رد + ليش + متى</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          الاعتراض رقم 3 (WordPress + ChatGPT) هو <strong>الأخطر</strong> — احفظ الرد حرفياً. الأرقام
          مصلَّحة بحساب صحيح: 1,299 شهري (15,588 سنوي).
        </p>

        <div className="space-y-3">
          {objections.map((o) => (
            <Card
              key={o.num}
              className={
                o.severity === "critical"
                  ? "border-red-500/40 bg-red-500/[0.04]"
                  : "border-rose-500/25 bg-rose-500/[0.03]"
              }
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      o.severity === "critical"
                        ? "bg-red-500/15 border border-red-500/40 text-red-400"
                        : "bg-rose-500/15 border border-rose-500/30 text-rose-400"
                    }`}
                  >
                    {o.num}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-bold">«{o.q}»</p>
                      {o.severity === "critical" && (
                        <Badge variant="outline" className="text-[10px] border-red-500/40 text-red-400">
                          الأخطر
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Response */}
                <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.05] p-3 ms-11 mb-2.5">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1.5">
                    ✓ الرد المعتمد
                  </p>
                  <p className="text-sm leading-relaxed">{o.a}</p>
                </div>

                {/* Why + When */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ms-11">
                  <div className="rounded-md border border-amber-500/25 bg-amber-500/[0.04] p-2.5">
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" /> ليش هذا الرد يشتغل؟
                    </p>
                    <p className="text-[11px] leading-relaxed text-foreground/85">{o.why}</p>
                  </div>
                  <div className="rounded-md border border-violet-500/25 bg-violet-500/[0.04] p-2.5">
                    <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Target className="h-3 w-3" /> متى تطلقه؟
                    </p>
                    <p className="text-[11px] leading-relaxed text-foreground/85">{o.when}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── قاعدة AI الذهبية ────────────────────────────────────── */}
      <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/[0.05] via-background to-background">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <h3 className="text-sm font-bold">قاعدة الـ AI الذهبية</h3>
          </div>
          <p className="text-sm leading-loose mb-3">
            إذا قال العميل «أنا أستخدم ChatGPT/AI» → <strong>وافقه فوراً</strong>. ثم انقل الحوار من
            «الكتابة» إلى «الجودة اللي تقبلها محركات البحث». <strong>ChatGPT يكتب نص. Modonty تنشر مقال
            يظهر في نتائج البحث (Google + Bing + AI Search).</strong> الفرق منظومة مو أداة.
          </p>
          <div className="rounded-md border border-violet-500/25 bg-background/70 p-3">
            <p className="text-[11px] font-semibold leading-relaxed">
              💡 <strong>السبب النفسي:</strong> ما تحارب أداة العميل = ما تهاجم قراره. توافق ثم تتجاوز =
              يحس بالاحترام + يفتح عقله للحل الأكبر.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── ROI Calculator (مصلَّح) ─────────────────────────────── */}
      <Card className="border-emerald-500/30 bg-emerald-500/[0.04]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-emerald-500/15">
              <Calculator className="h-4 w-4 text-emerald-500" />
            </div>
            <h2 className="text-base font-bold">ROI Calculator — للعيادات (احفظ الأرقام)</h2>
          </div>

          <div className="rounded-lg border border-emerald-500/25 bg-background/70 p-5 mb-4">
            <pre className="text-xs leading-loose font-mono overflow-x-auto">
{`الاستثمار الشهري:           1,299 ريال (Momentum)
الاستثمار السنوي:           15,588 ريال (× 12)
عدد المقالات:               96 مقال (8 × 12)
زيارات/مقال (بعد 6 شهور):    200/شهر
معدل تحويل لـ Lead:          3%
عدد Leads/سنة:              576
معدل Lead → عميل:            8%
عدد عملاء جدد/سنة:           46 مريض
متوسط قيمة المريض:           2,000 ريال
─────────────────────────────────────
عائد سنوي:                  92,000 ريال
ROI:                        ≈ 5.9× على الاستثمار السنوي

+ بقاعدة 12=18 (دفع 12 شهر، خدمة 18 شهر):
الـ effective شهري:           866 ريال/شهر
ROI الفعلي:                   ≈ 8.85×`}
            </pre>
          </div>

          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/[0.08] p-3">
            <p className="text-xs font-semibold leading-relaxed">
              <strong>جملة جاهزة:</strong> «لو حصلت 2 عملاء بس من مقال واحد، تكون استرجعت السعر السنوي.»
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── 4 الباقات (الأسعار شهرية) ────────────────────────── */}
      <Card className="border-primary/25 bg-primary/[0.03]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-primary/15">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-base font-bold">الباقات الأربع — متى تقترح أيهم</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {fourPackages.map((p) => (
              <div
                key={p.name}
                className={`rounded-lg border p-4 ${
                  p.featured ? "border-primary/50 bg-primary/[0.06]" : "border-primary/20 bg-background/60"
                }`}
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <p className={`text-base font-bold ${p.featured ? "text-primary" : ""}`}>{p.name}</p>
                  {p.featured && (
                    <Badge className="text-[10px] bg-primary text-primary-foreground">⭐ الأكثر شعبية</Badge>
                  )}
                </div>
                <p className="text-2xl font-bold font-mono mb-1">
                  {p.price}{" "}
                  <span className="text-xs font-normal text-muted-foreground">ريال</span>
                </p>
                <p className="text-[10px] text-muted-foreground mb-2 font-mono">{p.period}</p>
                <p className="text-xs text-foreground/80 leading-relaxed">{p.when}</p>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-amber-500/25 bg-amber-500/[0.04] p-3 mt-4">
            <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wide mb-1.5">
              💡 تكتيك Anchoring
            </p>
            <p className="text-xs leading-relaxed">
              دائماً اقترح <strong>Momentum أولاً</strong> (الأكثر شعبية). العميل يقارنها بـ Free فيتحمس
              للقيمة، ويقارنها بـ Leadership فيحس إنها معقولة. هذي قاعدة نفسية في المبيعات (Anchoring).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── 4 جمل الإغلاق (مع متى) ──────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <h2 className="text-base font-bold">جمل الإغلاق الأربع — اختر حسب شخصية العميل</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          الخطأ القاتل: استخدام نفس الجملة لكل العملاء. أنت تختار حسب شخصيته اللي قدامك.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {closingLines.map((c, i) => {
            const Icon = c.icon;
            const cm = colorMap[c.color];
            return (
              <Card key={i} className={`${cm.border} ${cm.bg}`}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-1.5 rounded-lg ${cm.iconBg}`}>
                      <Icon className={`h-3.5 w-3.5 ${cm.text}`} />
                    </div>
                    <p className={`text-xs font-bold ${cm.text}`}>{c.type}</p>
                  </div>
                  <p className="text-sm leading-relaxed mb-3">«{c.line}»</p>
                  <div className="rounded-md border border-amber-500/20 bg-amber-500/[0.04] p-2.5">
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                      <Target className="h-3 w-3" /> متى تستخدمها؟
                    </p>
                    <p className="text-[11px] leading-relaxed">{c.when}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── NEW: Egypt-Gulf scripts ────────────────────────────── */}
      <Card className="border-2 border-cyan-500/40 bg-gradient-to-br from-cyan-500/[0.06] via-background to-background">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Badge className="text-[10px] bg-cyan-500 text-white">⭐ Tier Strategic</Badge>
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-cyan-600" />
              <h2 className="text-base font-bold">سكريبتات Egypt-Gulf — للقطاعات المصرية المستهدفة للخليجي</h2>
            </div>
          </div>

          <p className="text-sm text-foreground/85 leading-loose mb-4">
            هذي القطاعات المصرية <strong>تتكلم عربية لجمهور خليجي</strong> = cultural fit طبيعي مع
            Modonty. ARPU أعلى + lead time أقصر + closing أسرع. <strong>راجع صفحة ICPs للسياق
            الكامل.</strong>
          </p>

          <div className="space-y-3">
            {egyptGulfScripts.map((s, i) => (
              <div key={i} className="rounded-lg border border-cyan-500/25 bg-background/70 p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px] border-cyan-500/40 text-cyan-600">
                    EG-Gulf #{i + 1}
                  </Badge>
                  <p className="text-sm font-bold">{s.sector}</p>
                </div>
                <p className="text-[11px] text-muted-foreground italic mb-3">السيناريو: {s.scenario}</p>

                <div className="rounded-md border border-cyan-500/20 bg-cyan-500/[0.05] p-3 mb-2">
                  <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-wide mb-1.5">الـ Pitch المخصّص</p>
                  <p className="text-xs leading-relaxed">«{s.pitch}»</p>
                </div>

                <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.05] p-2.5">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1">جملة Closing</p>
                  <p className="text-xs leading-relaxed">«{s.closing}»</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── تحذير ─────────────────────────────────────────────── */}
      <Card className="border-amber-500/30 bg-amber-500/[0.04]">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold mb-2">قبل أي مكالمة — اقرأ هذي القاعدة</p>
              <p className="text-xs leading-loose text-foreground/85">
                <strong>عميلنا مو</strong> شركة كبرى عندها فريق تسويق + ميزانية مفتوحة. هؤلاء يروحون
                لـ HubSpot. <strong>عميلنا هو</strong> صاحب شركة صغيرة-متوسطة، يعرف إن المحتوى مهم — بس
                ما عنده وقت، فريق، ولا ميزانية وكالة. لو اكتشفت إنك تكلم الشخص الخطأ، لا تستمر بالـ
                pitch — حوّله لـ <strong>Reseller program</strong> أو اعتذر بأدب وانتقل للعميل التالي.
                وقتك أهم من جمع leads ضائعة.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </GuidelineLayout>
  );
}
