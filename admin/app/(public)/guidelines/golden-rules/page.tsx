import { Card, CardContent } from "@/components/ui/card";
import { getMomentumPrice, formatPriceForGuideline } from "@/lib/pricing/format-for-guideline";
import { Badge } from "@/components/ui/badge";
import { GuidelineLayout } from "../components/guideline-layout";
import { Award, Sparkles, Lightbulb, Target } from "lucide-react";

// Tier 1 (الأساسية) uses brand primary — calm authority, never threatening.
const CORE = "border-primary/30 bg-primary/[0.04]";
const AMBER = "border-amber-500/30 bg-amber-500/[0.03]";
const GREEN = "border-emerald-500/30 bg-emerald-500/[0.03]";

const sixGoldenLines = [
  {
    vs: "ضد الوكالة",
    line: "الوكالة تخدمك. مدونتي تشغّل لك نظام.",
    competitor: "الوكالة الإعلانية / وكالة المحتوى",
    competitorPitch: "نقدّم لك خدمة محتوى احترافية بفريق متخصص — مقابل ساعات عمل مدفوعة شهرياً.",
    shift: "من «خدمة» (مرتبطة بساعات بشر) إلى «نظام» (يعمل 24/7 ويتراكم).",
    customer: "اشتغلت مع وكالة سنة كاملة وما طلعت بنتائج تذكر.",
    you: "طبيعي — الوكالة تخدمك مدة محدودة، وتدفع لها كل ساعة. لما توقف الدفع، الخدمة تتوقف. مدونتي تشغّل لك نظام — يعمل 24/7 من اليوم الأول، ويتراكم مع كل مقال جديد.",
    hears: "الفرق بين توظيف موظف (مكلف، ينتهي) ومنصة (تستمر، تتطور بنفسها).",
  },
  {
    vs: "ضد الإعلانات",
    line: "خدمات التسويق تأجير. مدونتي تملّك.",
    competitor: "حملات Snapchat / Meta / Google Ads",
    competitorPitch: "ادفع X ريال، استلم Y زائر هذا الشهر — نتائج فورية مضمونة.",
    shift: "من «إنفاق متجدد» (Renting) إلى «أصل دائم» (Owning).",
    customer: "أنا أعتمد على إعلانات Snapchat، تجيب لي عملاء.",
    you: "صح، شغّالة على المدى القصير. لكن خدمات التسويق إيجار — ما إن توقف الدفع يوم واحد، الزوار صفر. مدونتي تملّك — كل مقال أصل دائم، يجيب زوار سنين حتى لو وقفت الدفع غداً.",
    hears: "تحويل العقلية من «cost» (إنفاق) إلى «asset» (استثمار يتراكم).",
  },
  {
    vs: "ضد SEO التقليدي",
    line: "خدمات SEO تعطيك نصيحة. مدونتي تنفّذها.",
    competitor: "وكالة استشارات SEO / خبير SEO",
    competitorPitch: "نعمل لك audit + تقرير 50 صفحة + توصيات للتطبيق.",
    shift: "من «التشخيص» (يقول إيش المشكلة) إلى «العلاج» (يفعلها بنفسه).",
    customer: "جابوا لي SEO audit، عرفت المشاكل، بس ما عرفت أنفّذها.",
    you: "هذي مشكلة 99% من الـ audits — تشخيص بدون علاج. خدمات SEO تعطيك نصيحة، مدونتي تنفّذها فعلياً: JSON-LD + Schema + Meta + Sitemap + Pre-publish audit — كلها أوتوماتيك بدون ما تلمس شي.",
    hears: "«دفعت 5,000 ريال لاستشارة بدون نتيجة. الحل عند مدونتي بسعر أقل + تنفيذ.»",
  },
  {
    vs: "ضد المستقل",
    line: "المستقل شخص. مدونتي مؤسسة.",
    competitor: "كاتب على Upwork / Fiverr / كاتب محلي",
    competitorPitch: "أكتب لك مقال بـ 200 ريال — جودة عالية وتسليم سريع.",
    shift: "من «شخص واحد» (Single Point of Failure) إلى «مؤسسة» (نظام + فريق + ضمانات).",
    customer: "عندي كاتب على Fiverr، يعطيني مقال بـ 150 ريال.",
    you: "المستقل شخص — لما يمرض أو يسافر أو يرفع السعر، يتوقف عملك. مدونتي مؤسسة — فريق محترفين + مراجعة مزدوجة + Pre-publish audit + ضمان الجودة. المخاطرة معدومة.",
    hears: "الفرق بين مخاطرة الاعتماد على شخص واحد، واستقرار نظام مؤسسي.",
  },
  {
    vs: "ضد WordPress",
    line: "WordPress يحتاج فريق. مدونتي تستبدل الفريق + تنفّذ بدلاً منك.",
    competitor: "موقع WordPress (مع plugins SEO مدفوعة)",
    competitorPitch: "WordPress مفتوح المصدر ومجاني — تحط plugins وتبدأ.",
    shift: "من «أداة فاضية تحتاج فريق + وقتك» إلى «نظام يشتغل بالكامل بدلاً منك — إنت بس تدفع».",
    customer: "أنا حاطّ موقعي على WordPress + Yoast SEO.",
    you: "WordPress أداة قوية، لكنها أداة فاضية — تحتاج فريق + وقتك. حتى بأقل أسعار السوق المحافظة، خل أوريك المقارنة بالأرقام:",
    hears: "WordPress = أبني بيت من الصفر (فريق + وقت + إدارة). Modonty = أستلم فيلا جاهزة مفروشة (نظام كامل، إنت بس تدفع). 14× أرخص + إنت ما تشتغل بنفسك.",
  },
  {
    vs: "ضد HubSpot",
    line: "HubSpot منصة عالمية. مدونتي للسعوديين والمصريين.",
    competitor: "HubSpot Marketing Hub / منصات عالمية مشابهة",
    competitorPitch: "أقوى منصة CRM + Content في العالم — مستخدمة من الشركات الكبرى.",
    shift: "من «حل عالمي عام» (لكنه غير مفصّل للسوق العربي) إلى «حل محلي مفصّل على السوق العربي».",
    customer: "شفت HubSpot، لكن غالي + صعب أتعامل معاه.",
    you: "طبيعي — HubSpot منصة عالمية بـ 800$ شهرياً، إنجليزي 100%، دعم بتوقيت غير عربي. مدونتي للسعوديين والمصريين: عربي 100% + تكامل مع Salla و Zid + YMYL compliance للقطاعات الحساسة + دعم بتوقيتك.",
    hears: "مدونتي ليست بديل أرخص — مصممة لسوقي تحديداً وعارفة عملائي.",
  },
] as const;

const fourPowers = [
  {
    num: "1",
    nameAr: "كاشف العميل الجاهز للشراء",
    nameEn: "Smart Lead Scoring",
    meaning: "كل زائر يدخل موقعك يحصل على درجة من 0 إلى 100 تقول لك بدقة: «هذا قريب من الشراء؟ ولا بس يتفرّج؟»",
    includes: [
      "تكرار الزيارات — كم مرة دخل الموقع؟",
      "عمق التصفّح — كم صفحة + كم وقت قعد؟",
      "التفاعل — لايك، شير، حفظ، تعليق؟",
      "التحويل — ضغط CTA، اشترك، تواصل؟",
    ],
    exampleLow: "زائر #1: درجة 15 — دخل صفحة وحدة، قعد 30 ثانية. الترجمة: «بس يتفرّج، تجاهله».",
    exampleHigh: "زائر #2: درجة 78 — 5 صفحات، 12 دقيقة، حفظ مقالين. الترجمة: «اتصل عليه فوراً، قريب من الشراء».",
    why: "بدون Lead Scoring، إنت تتصل بكل الزوار عشواء وتضيع وقتك على ناس بس يتفرّجون. مع Lead Scoring، تركّز على الـ Hot Leads فقط — معدل النجاح يرتفع من 5% إلى 30%+.",
  },
  {
    num: "2",
    nameAr: "الـ SEO يشتغل بنفسه",
    nameEn: "SEO Auto-Pilot",
    meaning: "زي طيار الطائرة الآلي — يشغّل الطائرة بدون ما الكابتن يلمس شي. مدونتي تعمل كل المهام التقنية لمحركات البحث (Google · Bing · ChatGPT Search · Perplexity) تلقائياً، إنت ما تحتاج تفهم ولا حاجة.",
    includes: [
      "JSON-LD + Schema — كود مخفي يخبر محركات البحث «هذي مقالة طبية، نُشرت تاريخ X»",
      "Meta + OG — العنوان والوصف اللي تظهر في نتائج البحث + واتساب",
      "Sitemap.xml — قائمة كل صفحاتك تستلمها محركات البحث تلقائياً",
      "Pre-publish audit — 9 فحوصات قبل النشر (عنوان · كلمات · صور · Schema)",
      "Internal linking — ربط المقالات ببعضها يساعد محركات البحث تفهم البنية",
      "AI Crawler Optimization — مقالاتك تظهر في ChatGPT Search + Perplexity أيضاً",
    ],
    exampleLow: "WordPress: إنت تكتب المقال → Yoast plugin → ضبط meta → فحص Schema → إضافة sitemap → نشر GSC = 5-10 مهام يدوية لكل مقال.",
    exampleHigh: "Modonty: إنت تكتب المقال → النظام يعمل الـ 5-10 مهام كلها تلقائياً → ينشره. صفر تدخل تقني منك.",
    why: "SEO = 80% من حضورك في محركات البحث (Google + Bing + AI Search). لو أهملته، موقعك مدفون في الصفحة 10. مدونتي تشغّل لك الطبقات التقنية كلها بدون ما تفهم ولا تتعب.",
  },
  {
    num: "3",
    nameAr: "أدلة الثقة المُدمجة",
    nameEn: "Social Proof System",
    meaning: "العميل ما يثق فيك بكلامك — يثق فيك بـ«رؤية ناس آخرين يثقون فيك». الإثبات الاجتماعي = الأدلة المرئية اللي تخلّي الزائر يقول «طيب، هذي شركة جدية».",
    includes: [
      "مراجعات وتقييمات — نجوم + تعليقات عملاء سابقين",
      "عدد المتابعين — رقم ظاهر في الموقع",
      "شارة التحقق (Verified) — على ملفك الموثوق",
      "Facepile — صور القرّاء اللي تفاعلوا",
      "إحصاءات التفاعل — مشاهدات + شيرز + تعليقات ظاهرة",
      "E-E-A-T markup — كود يخبر محركات البحث إن المؤلف خبير حقيقي",
    ],
    exampleLow: "عيادة بدون إثبات اجتماعي: عنوان عادي، صفر مراجعات، صفر متابعين → الزائر يتجاهلها في 2 ثانية.",
    exampleHigh: "نفس العيادة بـ Modonty: 4.7 نجوم + 1,200 مراجعة + شارة تحقق + المؤلف د. أحمد العلي مع شهاداته → الزائر يضغط فوراً.",
    why: "بدون إثبات اجتماعي، إنت موقع مجهول لا يثق فيه أحد. مع إثبات اجتماعي، إنت جهة موثوقة. الفرق يضاعف نسبة النقر (CTR) بحد أدنى 3×.",
  },
  {
    num: "4",
    nameAr: "عيون على المنافسين",
    nameEn: "Competitive Intelligence",
    meaning: "نظام يراقب منافسيك بدلاً منك — يقول لك بالضبط: وش الكلمات اللي يحتلوها في محركات البحث، وش المقالات اللي تجيب لهم زوار، وش الفجوات في محتواهم اللي تقدر تستفيد منها.",
    includes: [
      "متابعة المنافسين من اللوحة — تحط دومين منافسك، النظام يراقبه",
      "Keywords tracking — كل كلمة بحث منافسك يحتلها مع نية البحث",
      "Search intent analysis — وش يبغى العميل من الكلمة (شراء/معلومة/مقارنة)",
      "Content gap analysis — مواضيع منافسك ما غطاها → فرصتك",
      "Industry compliance — للقطاعات الحساسة (طب/مال/قانون) ضمان YMYL",
    ],
    exampleLow: "عيادة بدون مراقبة: تكتب عشواء «أفضل عيادة أسنان» → 50 زائر/شهر فقط لأن المنافس يحتل الكلمة بمقال أقوى.",
    exampleHigh: "نفس العيادة بـ Modonty: النظام يكتشف الفجوة → يقترح «تبييض أسنان بالليزر للحوامل» (كلمة منافسك ما غطاها) → 1,500 زائر/شهر. الفرق 30×.",
    why: "بدون مراقبة، إنت تكتب عشواء. مع مراقبة، تكتب بالضبط اللي يجيب زوار. الفرق بين مقال يجيب 50 زائر ومقال يجيب 1,500 — هذا الفرق بين شركة تنمو وشركة تذبل.",
  },
] as const;

const fourPackages = [
  { name: "Free", price: "0", when: "عميل متردد · تجربة · ICP صغير", featured: false },
  { name: "Launch", price: "499", when: "محامي مستقل · عيادة فردية · متجر صغير", featured: false },
  { name: "Momentum ⭐", price: "1,299", when: "الأكثر شعبية — معظم الـ ICPs", featured: true },
  { name: "Leadership", price: "2,999", when: "عيادات كبيرة · شركات · B2B serious", featured: false },
] as const;

const fourClosingLines = [
  { type: "ناعم", line: "تبغى نبدأ بالـ Free tier 30 يوم تجرّب؟" },
  { type: "بالـ ROI", line: "لو حصلت 2 عملاء بس من مقال واحد، تكون استرجعت السعر. متى نبدأ؟" },
  { type: "بإلغاء المخاطرة", line: "12 شهر دفع = 18 شهر خدمة. وفيه Free tier للتجربة. أي مخاطرة فعلية ما فيه." },
  { type: "بالاستعجال (للوكالات)", line: "حالياً نقبل 5 وكالات للـ Reseller program. 3 منهم انضموا الأسبوع الماضي." },
] as const;

const antiHooks = [
  { word: "«مدوّنة» بمفردها", reason: "يستهلك من قيمة المنتج" },
  { word: "«أرخص»", reason: "يقلّل perceived value (استخدم ROI)" },
  { word: "«AI-powered»", reason: "كل المنتجات تقولها (استخدم النتيجة)" },
  { word: "«Easy»", reason: "السعودي ما يبحث عن easy، يبحث عن نتيجة" },
] as const;

const fiveICPs = [
  { rank: "⭐⭐⭐⭐⭐", name: "متاجر سلة + Zid", note: "الأسهل في الإغلاق" },
  { rank: "⭐⭐⭐⭐", name: "العيادات + القطاع الصحي", note: "YMYL · compliance gating" },
  { rank: "⭐⭐⭐⭐", name: "مكاتب المحاماة والاستشارات", note: "Authority = ثقة" },
  { rank: "⭐⭐⭐", name: "العقارات", note: "وسطاء + مطورين" },
  { rank: "⭐⭐⭐", name: "المطاعم", note: "يحتاجون Local SEO" },
] as const;

const sevenPainPoints = [
  "ما عندي وقت أكتب",
  "ما عندي ميزانية وكالة",
  "ما أعرف SEO",
  "ما أعرف هل المحتوى ينفع",
  "ما أعرف إيش يكتب",
  "ينقصني تنبيهات لحظية",
  "ما أتابع Google Search Console",
] as const;

interface RuleProps {
  num: number;
  badge: string;
  title: string;
  children: React.ReactNode;
  why: React.ReactNode;
  when: React.ReactNode;
  borderClass: string;
}

function Rule({ num, badge, title, children, why, when, borderClass }: RuleProps) {
  return (
    <Card className={borderClass}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="shrink-0 w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center text-sm font-bold font-mono">
            {num}
          </span>
          <Badge variant="outline" className="text-[10px] shrink-0">{badge}</Badge>
          <h3 className="text-sm font-bold flex-1 min-w-0">{title}</h3>
        </div>

        {/* The rule statement */}
        <div className="ps-12 space-y-2 text-sm leading-relaxed mb-4">{children}</div>

        {/* Why + When (the human-voice explanation) */}
        <div className="ps-12 space-y-2.5 mt-4 pt-4 border-t border-border/40">
          <div className="rounded-md border border-amber-500/25 bg-amber-500/[0.04] p-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1.5">
                  ليش مهمة؟
                </p>
                <p className="text-xs leading-loose text-foreground/85">{why}</p>
              </div>
            </div>
          </div>
          <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.04] p-3">
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1.5">
                  متى تستخدمها؟
                </p>
                <p className="text-xs leading-loose text-foreground/85">{when}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function GoldenRulesPage() {
  const [launch, m, leadership] = await Promise.all([
    formatPriceForGuideline("starter", "SA"),
    getMomentumPrice("SA"),
    formatPriceForGuideline("scale", "SA"),
  ]);

  const launchPrice = launch?.monthly ?? "499";
  const momentumPrice = m?.monthly ?? "1,299";
  const momentumYearly = m?.yearly ?? "15,588";
  const leadershipPrice = leadership?.monthly ?? "2,999";

  // WordPress comparison math (live)
  const wpMonthly = 18000;
  const wpYearly = wpMonthly * 12; // 216,000
  const monthlyNum = m?.monthly ? Number(m.monthly.replace(/,/g, "")) : 1299;
  const monthlyYearly = monthlyNum * 12; // 15,588
  const savings = wpYearly - monthlyYearly; // 200,412
  const annualReturn = 92000;
  const roiMultiplier = Math.round(annualReturn / monthlyNum);

  // Map plan names → live prices
  const priceMap: Record<string, string> = {
    Free: "0",
    Launch: launchPrice,
    "Momentum ⭐": momentumPrice,
    Leadership: leadershipPrice,
  };
  const resolvedPackages = fourPackages.map((p) => ({
    ...p,
    price: priceMap[p.name] ?? p.price,
  }));

  const wpComparisonRow = `${wpMonthly.toLocaleString("en-GB")} ريال`;
  const wpYearlyRow = `${wpYearly.toLocaleString("en-GB")} ريال`;
  const savingsText = `${savings.toLocaleString("en-GB")} ريال`;
  const roiPreBlock = `${momentumPrice} ريال (Momentum، عيادة أسنان)
↓
8 مقالات × 12 شهر = 96 مقال
↓
46 مريض جديد/سنة
↓
${annualReturn.toLocaleString("en-GB")} ريال عائد
↓
ROI = ${roiMultiplier}x`;

  return (
    <GuidelineLayout
      title="القواعد الذهبية"
      description="20 قاعدة non-negotiable — كل قاعدة فيها 3 طبقات: الجملة الفعلية + ليش مهمة + متى تستخدمها"
    >
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/[0.06] via-background to-background">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 shrink-0">
              <Award className="h-7 w-7 text-amber-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold mb-2">اقرأها صباحاً — افهم قبل ما تحفظ</h2>
              <p className="text-sm text-foreground/85 leading-loose mb-3">
                لو إنت مقتنع بالقاعدة، حتقنع العميل بسهولة. لو إنت بس حافظها بدون فهم — العميل يحس فوراً
                إنك تكرّر كلام محفوظ. هذي الصفحة مصمّمة عشان تفهم <strong>الـ logic</strong> ورا كل جملة،
                مش عشان تحفظها بس.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                مرتّبة بالأولوية:{" "}
                <span className="text-primary font-semibold">🥇 أساسية (15)</span> ·{" "}
                <span className="text-amber-400 font-semibold">🟡 مهمة (3)</span> ·{" "}
                <span className="text-emerald-400 font-semibold">🟢 داعمة (4)</span>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 🥇 Core Rules (1-15) ────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🥇</span>
          <h2 className="text-base font-bold text-primary">القواعد الأساسية (15)</h2>
        </div>

        <div className="space-y-3">
          {/* Rule 1 */}
          <Rule
            num={1}
            badge="Big Idea"
            title="تعريف الشركة بكلمتين"
            borderClass={CORE}
            why={
              <>
                كل وكالة في السوق تبيع نفس الجملة: «راح نوصلك للصدارة». العميل سمعها 100 مرة، ومحدش وصّله.
                لما تقول <strong>«حضور لا وعود»</strong>، إنت تكسر النمط — العميل يحس فوراً إنك مختلف، إنك
                فاهم عذابه السابق مع الوكالات.
              </>
            }
            when={
              <>
                في أول 8 ثواني من أي محادثة. لما العميل متشكك. لما يسألك «وش يميزكم عن غيركم؟».
              </>
            }
          >
            <p className="text-base font-bold text-primary">«حضور لا وعود»</p>
          </Rule>

          {/* Rule 2 */}
          <Rule
            num={2}
            badge="8–12 ثانية"
            title="التعريف الذي تحفظه"
            borderClass={CORE}
            why={
              <>
                <strong>«سعودية» = trust signal</strong>، مش مجرد بلد منشأ. الجمهور العربي يثق بالمنتج
                السعودي تلقائياً — جودة + رقابة + Vision 2030 brand قوي إقليمياً. <strong>عززها دائماً</strong>،
                لا تخفّفها بكلمة «عربية» العامة. كذلك <strong>الجمهور يبحث في 4 محركات اليوم</strong>: Google
                (95% بالسعودية) · Bing (يتعافى مع Microsoft Copilot) · ChatGPT Search · Perplexity. لو قلت
                «نظهر في Google» بس، إنت تقلّل نطاق الخدمة 30%. مدونتي بنت <strong>AI Crawler Optimization</strong>{" "}
                خصيصاً لمحركات الـ AI. كذلك «<strong>تبني</strong>» أوضح من «تحط» — تعطي إحساس بالنظام
                والاستمرارية، لا الإيداع لمرة واحدة.
              </>
            }
            when={
              <>
                مصعد · حدث · WhatsApp lead · اتصال بارد. أي موقف عندك أقل من دقيقة لتكسب اهتمام. لو عند
                30 ثانية، استخدم <strong>التفكيك</strong> أدناه لتشرح كل عنصر.
              </>
            }
          >
            <div className="space-y-3">
              <p className="font-medium leading-loose">
                «<strong>مدونتي</strong> منصة <strong>سعودية</strong> للمحتوى العربي،{" "}
                <strong>تبني</strong> لشركتك حضور احترافي على محركات البحث (Google · Bing · ChatGPT Search ·
                Perplexity)، <strong>وتعطيك لوحة ذكية</strong> تكشف الزوار اللي قريبين من الشراء —{" "}
                <strong>بدون ما تكتب حرف بنفسك</strong>.»
              </p>

              <div className="rounded-md border border-primary/25 bg-background/70 p-4">
                <p className="text-[11px] font-bold text-primary uppercase tracking-wide mb-3">
                  تفكيك الجملة — الموظف لازم يفهم كل كلمة
                </p>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-mono shrink-0 mt-0.5">▸</span>
                    <span>
                      <strong>«منصة سعودية»</strong> → كلمة الثقة الذهبية. السوق العربي يثق بالمنتج
                      السعودي تلقائياً (جودة + رقابة + Vision 2030). عززها <strong>دائماً</strong> — لا
                      تستبدلها بـ «عربية» العامة.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-mono shrink-0 mt-0.5">▸</span>
                    <span>
                      <strong>«للمحتوى العربي»</strong> → نخدم السوق العربي كامل (السعودية أولاً، ومصر
                      والخليج). مش حصراً على بلد واحد، لكن نقطة الانطلاق سعودية.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-mono shrink-0 mt-0.5">▸</span>
                    <span>
                      <strong>«تبني لشركتك»</strong> → نظام يشتغل بدلاً منك. مش «نسلّمك صورة»، إحنا نُنشئ
                      الهيكل (مدونة + مقالات + Schema + Sitemap) ونشغّله شهرياً.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-mono shrink-0 mt-0.5">▸</span>
                    <span>
                      <strong>«حضور احترافي»</strong> → مش مجرد ظهور — حضور بمقاييس محركات البحث:
                      E-E-A-T، JSON-LD، Pre-publish audit. كل مقال يجتاز 9 فحوصات قبل النشر.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-mono shrink-0 mt-0.5">▸</span>
                    <span>
                      <strong>«محركات البحث» (مش Google فقط)</strong> → Google + Bing + ChatGPT Search +
                      Perplexity. مدونتي عندها AI Crawler Optimization تخلّي مقالاتك تظهر في AI Search،
                      الميزة هذي ما عند المنافسين.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-mono shrink-0 mt-0.5">▸</span>
                    <span>
                      <strong>«لوحة ذكية تكشف الزوار»</strong> → Lead Scoring 0–100. تعرف بالضبط مين
                      ينوي الشراء قبل ما يكلمك. تحوّل الـ Marketing من تخمين إلى علم.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-mono shrink-0 mt-0.5">▸</span>
                    <span>
                      <strong>«بدون ما تكتب حرف»</strong> → الميزة الأقوى ضد ChatGPT. كل المنافسين يعطونك
                      أداة كتابة، إحنا نعفيك من الكتابة كلياً.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </Rule>

          {/* Rule 3 */}
          <Rule
            num={3}
            badge="منصة، مش مدونة"
            title="ثبّت هويتك في كل جملة"
            borderClass={CORE}
            why={
              <>
                هذي قاعدة <strong>Categorization النفسية</strong>: عقل العميل يصنّفك
                خلال أول 5 ثواني، والتصنيف يحدّد ثلاث أشياء:{" "}
                <strong>(1) السعر اللي يقبله</strong> · <strong>(2) المنافسين اللي يقارنك بهم</strong> ·{" "}
                <strong>(3) التوقعات اللي يبنيها</strong>.
                <br />
                <br />
                لو صنّفك «مدونة» → يقارنك بـ Blogger و WordPress (مجاني)، يقبل سعر 100 ريال شهري بحد
                أقصى، ويتوقّع منك «نص بسيط». لو صنّفك «منصة SaaS» → يقارنك بـ HubSpot، يقبل 1,000+ ريال
                شهري، ويتوقّع نظام كامل. <strong>التصنيف يحصل مرة واحدة وصعب يتغيّر</strong> — لازم
                تثبّت من الجملة الأولى.
              </>
            }
            when={
              <>
                <strong>5 سيناريوهات</strong> تحتاج فيها صياغة فورية:
                <br />
                ① لما يقول «أها، يعني مدونة...» → صحّحه فوراً
                <br />
                ② قبل ذكر السعر → ثبّت «منصة SaaS» قبل الرقم
                <br />
                ③ لما يقارنك بـ WordPress / Blogger → اشرح الفرق
                <br />
                ④ لما يقول «أنا أكتب بنفسي» → فرّق بين «الكتابة» و «المنظومة»
                <br />
                ⑤ في كل copy تكتبه — موقع، إعلان، رسالة
              </>
            }
          >
            <div className="space-y-3">
              <p className="leading-loose">
                <strong>Modonty ليست منصة تدوين.</strong> Modonty <strong>منصة SaaS سعودية للمحتوى العربي</strong>{" "}
                — تشغّل لشركتك نظام محتوى ذكي (مقالات + SEO + Lead Scoring + AI Crawler). اللي يقول
                «مدونة» بمفردها يقلّل القيمة <strong>80% في ثانيتين</strong>.
              </p>

              <div className="rounded-md border border-primary/25 bg-background/70 p-4">
                <p className="text-[11px] font-bold text-primary uppercase tracking-wide mb-3">
                  3 سيناريوهات + الرد المعتمد
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      <strong className="text-foreground">العميل:</strong> «طيب، يعني مدونة...»
                    </p>
                    <p className="text-xs leading-relaxed">
                      <strong className="text-primary">إنت:</strong> «أكثر من مدونة. Modonty منصة محتوى
                      تشغّل لك نظام كامل: مقالات + SEO تلقائي + Lead Scoring يكشف العميل قبل ما يكلّمك.»
                    </p>
                  </div>
                  <div className="pt-3 border-t border-primary/15">
                    <p className="text-xs text-muted-foreground mb-1.5">
                      <strong className="text-foreground">العميل:</strong> «كم تكلف مدونتكم؟»
                    </p>
                    <p className="text-xs leading-relaxed">
                      <strong className="text-primary">إنت:</strong> «المنصة فيها 4 باقات تبدأ من Free
                      tier. لكن دعني أوضّح أولاً وش تشغّل المنصة فعلياً — مش بس كتابة، نظام كامل...»{" "}
                      <em>(لا تذكر السعر قبل ما تثبّت أنها منصة)</em>
                    </p>
                  </div>
                  <div className="pt-3 border-t border-primary/15">
                    <p className="text-xs text-muted-foreground mb-1.5">
                      <strong className="text-foreground">العميل:</strong> «تدوّنوا لي شهرياً؟»
                    </p>
                    <p className="text-xs leading-relaxed">
                      <strong className="text-primary">إنت:</strong> «نشغّل لك نظام محتوى احترافي شهرياً
                      — بمقاييس محركات البحث (Google + Bing + AI Search) + Lead Scoring + توزيع تلقائي
                      على السوشيال. الكتابة جزء صغير من المنظومة.»
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.04] p-3">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-2">
                  بدائل آمنة لكلمة «مدونة»
                </p>
                <p className="text-xs leading-relaxed">
                  ✓ منصة · ✓ منصة SaaS · ✓ نظام محتوى · ✓ منظومة · ✓ منصة محتوى ذكي · ✓ Modonty (الاسم
                  بحد ذاته بدل التصنيف)
                </p>
              </div>
            </div>
          </Rule>

          {/* Rule 4 */}
          <Rule
            num={4}
            badge="ثوابت المؤسس (3)"
            title="ما نؤمن به"
            borderClass={CORE}
            why={
              <>
                هذي الـ 3 ثوابت ضد الـ status quo (الكلام التقليدي للوكالات). لما تقولها للعميل، يكسب ثقتك
                فوراً — لأنك تحكي بصراحة، مش تبيع وعود. خصوصاً «الأرقام = الواقع 100%»: في سوق مليء
                بالتضخيم، الصراحة بحد ذاتها ميزة تنافسية.
              </>
            }
            when={
              <>
                لما العميل يبدأ يسألك عن سياسة الشركة. أو لما تشرح الفلسفة. أو لما يقارنك بوكالة كذابة
                وعدته بالصدارة وما وصّلته.
              </>
            }
          >
            <ol className="list-decimal ps-5 space-y-1.5">
              <li>
                <strong>حضور لا وعود</strong> — ما نقول «راح نوصلك»، نقول «هذا نمو الزوار في GA»
              </li>
              <li>
                <strong>الأرقام = الواقع 100%</strong> — كل رقم في اللوحة قابل للتحقق من Google Analytics + Search Console
              </li>
              <li>
                <strong>20% منتج، 80% سوق</strong> — التقنية انتهت. الآن المعركة في السوق
              </li>
            </ol>
          </Rule>

          {/* Rule 5 */}
          <Rule
            num={5}
            badge="6 جمل ذهبية"
            title="ضد المنافسين — كل جملة تنقذ صفقة"
            borderClass={CORE}
            why={
              <>
                <strong>هذي القاعدة الأهم في كل المبيعات.</strong> العميل ما يقولك مباشرة «أنا أقارنك
                بالوكالة» — لكن عقله يقارنك بـ 5-6 خيارات ثانية في نفس الثانية. لو ما عندك جملة جاهزة لكل
                مقارنة، تخسر الصفقة بصمت — العميل يقفل بدون ما يسألك. هذي الـ 6 جمل تجاوب على كل مقارنة
                محتملة <strong>قبل ما يطرحها بنفسه</strong>. كل جملة تختصر 10 دقائق نقاش في 8 كلمات.{" "}
                <strong>القاعدة الذهبية:</strong> استخدمها استباقياً، مش بعد ما يسأل — لأن الجملة تشتغل
                أقوى لما تأتي قبل الاعتراض.
              </>
            }
            when={
              <>
                ① في Discovery لما تسأله «جربت قبل تكتب محتوى أو SEO؟» — استمع لجوابه واطلق الجملة
                المناسبة فوراً.
                <br />
                ② لما يذكر منافس محدد (وكالة سابقة، Fiverr، WordPress).
                <br />
                ③ لما تشعر بالتردد — يعني عقله يقارن بدون ما يقول.
                <br />
                ④ في الـ Pitch Deck — slide مخصصة للمقارنة.
              </>
            }
          >
            <div className="space-y-3">
              {sixGoldenLines.map((g, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-primary/25 bg-background/70 p-4 space-y-3"
                >
                  {/* Line + competitor badge */}
                  <div>
                    <Badge variant="outline" className="text-[10px] mb-2 border-primary/40 text-primary font-semibold">
                      {g.vs}
                    </Badge>
                    <p className="text-base font-bold leading-relaxed text-primary">«{g.line}»</p>
                  </div>

                  {/* Context: who's the competitor */}
                  <div className="rounded-md border border-border/40 bg-background/60 p-3 text-xs">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                      من هو المنافس؟
                    </p>
                    <p className="leading-relaxed mb-1.5">
                      <strong>{g.competitor}</strong>
                    </p>
                    <p className="text-muted-foreground italic leading-relaxed">
                      عرضه التقليدي: «{g.competitorPitch}»
                    </p>
                  </div>

                  {/* The shift */}
                  <div className="rounded-md border border-violet-500/25 bg-violet-500/[0.04] p-3 text-xs">
                    <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-1.5">
                      الفرق الجوهري
                    </p>
                    <p className="leading-relaxed">{g.shift}</p>
                  </div>

                  {/* Live scenario */}
                  <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.04] p-3 text-xs">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-2">
                      السيناريو — كيف تطلقها في محادثة حقيقية
                    </p>
                    <div className="space-y-2">
                      <p className="leading-relaxed">
                        <strong className="text-foreground">العميل:</strong> «{g.customer}»
                      </p>
                      <p className="leading-relaxed ps-3 border-s-2 border-emerald-500/40">
                        <strong className="text-emerald-500">إنت:</strong> «{g.you}»
                      </p>
                    </div>

                    {/* WordPress-specific: comparison table + deliverables checklist */}
                    {g.vs === "ضد WordPress" && (
                      <div className="mt-4 pt-4 border-t border-emerald-500/30 space-y-3">
                        {/* Cost comparison table */}
                        <div className="overflow-x-auto rounded-md bg-background/80 border border-emerald-500/20">
                          <table className="w-full text-[11px]">
                            <thead>
                              <tr className="border-b border-emerald-500/30 bg-emerald-500/[0.05]">
                                <th className="text-start p-2 font-bold">البند</th>
                                <th className="text-end p-2 font-bold text-rose-500">فريق WordPress<br/><span className="text-[9px] font-normal text-muted-foreground">(الحد الأدنى)</span></th>
                                <th className="text-end p-2 font-bold text-emerald-500">Modonty Momentum<br/><span className="text-[9px] font-normal text-muted-foreground">(الأكثر شعبية)</span></th>
                              </tr>
                            </thead>
                            <tbody className="font-mono">
                              <tr className="border-b border-emerald-500/15">
                                <td className="p-2">Developer (junior)</td>
                                <td className="p-2 text-end">7,000 ريال/شهر</td>
                                <td className="p-2 text-end">—</td>
                              </tr>
                              <tr className="border-b border-emerald-500/15">
                                <td className="p-2">Designer (basic)</td>
                                <td className="p-2 text-end">4,000 ريال/شهر</td>
                                <td className="p-2 text-end">—</td>
                              </tr>
                              <tr className="border-b border-emerald-500/15">
                                <td className="p-2">كاتب محتوى (junior)</td>
                                <td className="p-2 text-end">3,000 ريال/شهر</td>
                                <td className="p-2 text-end">—</td>
                              </tr>
                              <tr className="border-b border-emerald-500/15">
                                <td className="p-2">متخصص SEO (junior)</td>
                                <td className="p-2 text-end">4,000 ريال/شهر</td>
                                <td className="p-2 text-end">—</td>
                              </tr>
                              <tr className="border-b border-emerald-500/30 font-bold bg-background">
                                <td className="p-2">المجموع شهرياً</td>
                                <td className="p-2 text-end text-rose-500">{wpComparisonRow}</td>
                                <td className="p-2 text-end text-emerald-500">{momentumPrice} ريال</td>
                              </tr>
                              <tr className="border-b border-emerald-500/30 font-bold bg-background">
                                <td className="p-2">المجموع سنوياً (× 12)</td>
                                <td className="p-2 text-end text-rose-500">{wpYearlyRow}</td>
                                <td className="p-2 text-end text-emerald-500">{momentumYearly} ريال</td>
                              </tr>
                              <tr className="bg-emerald-500/[0.08] font-bold">
                                <td className="p-2 text-emerald-600">التوفير السنوي</td>
                                <td className="p-2 text-end" colSpan={2}>
                                  <span className="text-emerald-600">{savingsText}</span>{" "}
                                  <span className="text-muted-foreground font-normal">(~14× أرخص)</span>
                                </td>
                              </tr>
                              <tr className="bg-amber-500/[0.06] font-bold border-t border-amber-500/30">
                                <td className="p-2 text-amber-600">+ بقاعدة 12 = 18 (دفع 12 شهر، خدمة 18 شهر)</td>
                                <td className="p-2 text-end" colSpan={2}>
                                  <span className="text-amber-600">866 ريال/شهر فعلياً</span>{" "}
                                  <span className="text-muted-foreground font-normal">(20× أرخص من الفريق)</span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <p className="text-[10px] text-muted-foreground italic p-2 leading-relaxed border-t border-emerald-500/15">
                            * الرواتب بالحد الأدنى للسوق السعودي (junior/freelance). أي عميل يقدر يحسبها أعلى — هذي الأرضية اللي ما تتزحزح.
                          </p>
                        </div>

                        {/* Deliverables checklist — what Modonty does */}
                        <div className="rounded-md bg-background/80 border border-primary/25 p-3">
                          <p className="text-[10px] font-bold text-primary uppercase tracking-wide mb-2">
                            والأهم — مدونتي تعمل كل هذا بدلاً منك (إنت بس تدفع)
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-[11px]">
                            {[
                              "كتابة المقالات (8 شهرياً، يدوية احترافية)",
                              "تصميم الصور (Hero + OG + Social Cards)",
                              "JSON-LD + Schema + Sitemap التلقائي",
                              "Pre-publish audit (9 فحوصات قبل النشر)",
                              "النشر التلقائي على السوشيال",
                              "Lead Scoring (0–100 لكل زائر)",
                              "Dashboard متابعة + GA4 + GSC",
                              "Telegram alerts (26 حدث)",
                            ].map((item, idx) => (
                              <div key={idx} className="flex items-start gap-1.5">
                                <span className="text-emerald-500 shrink-0 font-bold">✓</span>
                                <span className="leading-relaxed">{item}</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] text-muted-foreground italic mt-3 pt-2 border-t border-primary/15 leading-relaxed">
                            في WordPress إنت تشتغل كل هذا بنفسك أو بفريقك. في Modonty — إنت بس تدفع.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* What customer hears */}
                  <div className="rounded-md border border-amber-500/25 bg-amber-500/[0.04] p-3 text-xs">
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1.5">
                      إيش يسمع العميل (في عقله)
                    </p>
                    <p className="leading-relaxed">{g.hears}</p>
                  </div>
                </div>
              ))}
            </div>
          </Rule>

          {/* Rule 6 */}
          <Rule
            num={6}
            badge="الخلاصة الكبرى"
            title="الفرق الجوهري"
            borderClass={CORE}
            why={
              <>
                هذي الجملة لما تقولها، العميل يصمت. لأنه ما فكّر فيها قبل. <strong>كل المنافسين يبيعون وقت
                بشري</strong> (ساعة وكالة، ساعة freelancer). إنت تبيع <strong>منظومة تشتغل بدون بشر</strong>.
                ده فرق فلسفي مش سعري — والفرق الفلسفي يكسر أي مقارنة سعرية.
              </>
            }
            when={
              <>
                لما العميل يشتكي من السعر. أو يقارنك بـ freelancer. أو يقول «الكاتب أرخص».
              </>
            }
          >
            <p>
              Modonty <strong>مو وكالة بسعر أرخص</strong>. Modonty <strong>فئة جديدة</strong> اسمها{" "}
              <em>«Productized Content + SEO»</em>. كل البقية يبيعون <strong>وقت بشري</strong>. Modonty تبيع{" "}
              <strong>منظومة</strong>.
            </p>
          </Rule>

          {/* Rule 7 */}
          <Rule
            num={7}
            badge="القوى الأربع"
            title="أركان المنتج — الموظف يفهم الـ 4 قبل ما يشرحها للعميل"
            borderClass={CORE}
            why={
              <>
                لما العميل يسأل «وش الفرق فعلياً؟»، إنت تعدّ له <strong>4 قوى</strong>. مش 1، مش 10.
                أربعة بالضبط. السبب: عقل العميل يحفظ 4 بسهولة، أكثر من 4 يضيع، أقل من 4 يبدو ضعيف. هذي
                قاعدة نفسية معروفة في المبيعات (Rule of Four). <strong>المهم</strong>: قبل ما تشرحها
                للعميل، إنت لازم تفهمها بالكامل — كل قوة بمعناها + إيش تشمل + ليش مهمة. الموظف اللي بس
                يحفظ الأسماء بدون فهم، يفشل في أول سؤال يطرحه العميل.
              </>
            }
            when={
              <>
                في الـ Discovery Call (الدقائق 8-12 عرض القيمة). لما يسأل «وش يميزكم؟». في الـ Pitch
                Deck — slide مخصصة لكل قوة. لما العميل يستفسر عن feature محدد.
              </>
            }
          >
            <div className="space-y-3">
              {fourPowers.map((p, i) => (
                <div key={i} className="rounded-lg border border-primary/30 bg-background/70 p-4 space-y-3">
                  {/* Power header */}
                  <div className="flex items-start gap-3 flex-wrap">
                    <span className="shrink-0 w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary">
                      {p.num}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold leading-tight">{p.nameAr}</p>
                      <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{p.nameEn}</p>
                    </div>
                  </div>

                  {/* Meaning */}
                  <div className="rounded-md border border-primary/20 bg-primary/[0.04] p-3 text-xs">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wide mb-1.5">
                      إيش يعني؟
                    </p>
                    <p className="leading-relaxed">{p.meaning}</p>
                  </div>

                  {/* What's included */}
                  <div className="rounded-md border border-violet-500/25 bg-violet-500/[0.04] p-3 text-xs">
                    <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-2">
                      إيش يشمل؟
                    </p>
                    <ul className="space-y-1">
                      {p.includes.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                          <span className="text-violet-500 shrink-0 mt-0.5">▸</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tangible example — before/after */}
                  <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.04] p-3 text-xs">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-2">
                      مثال محسوس
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-rose-400 shrink-0">✗</span>
                        <p className="leading-relaxed text-foreground/85">{p.exampleLow}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-500 shrink-0">✓</span>
                        <p className="leading-relaxed">{p.exampleHigh}</p>
                      </div>
                    </div>
                  </div>

                  {/* Why it matters */}
                  <div className="rounded-md border border-amber-500/25 bg-amber-500/[0.04] p-3 text-xs">
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1.5">
                      ليش مهمة للعميل؟
                    </p>
                    <p className="leading-relaxed">{p.why}</p>
                  </div>

                  {/* SPECIAL: Reality-check warning for Competitive Intelligence (i === 3) */}
                  {i === 3 && (
                    <div className="rounded-md border-2 border-rose-500/40 bg-rose-500/[0.05] p-4 text-xs">
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <span>⚠️</span>
                        <span>تحذير صريح للموظف — اختبار الواقع لهذي القوة</span>
                      </p>

                      <p className="leading-loose mb-3">
                        عميلك الفطن راح يطلب البرهان الفوري:{" "}
                        <strong className="text-rose-500">
                          «وريني report واحد لمنافس راقبتموه. إيش الفجوة اللي اكتشفتوها؟ إيش الـ ROI
                          الفعلي؟»
                        </strong>
                        <br />
                        ورقم «30×» اللي ذكرناه يحتاج توضيح صادق — مش حالة Modonty محددة.
                      </p>

                      <div className="rounded-md bg-background/80 border border-rose-500/30 p-3 mb-3">
                        <p className="text-[10px] font-bold text-foreground uppercase tracking-wide mb-1.5">
                          الحقيقة (3 طبقات شفافة):
                        </p>
                        <ul className="space-y-1.5 leading-relaxed">
                          <li>
                            <strong>① الـ tech شغّال:</strong> Keywords tracking + competitor
                            monitoring + content gap analysis مدمجين في console.modonty.com — متاحة
                            لكل عميل في dashboard.
                          </li>
                          <li>
                            <strong>② الـ data ما تنتشر علناً:</strong> NDA مع العملاء + احنا في
                            مرحلة بناء portfolio. ما عندنا public competitor reports بعد.
                          </li>
                          <li>
                            <strong>③ رقم «30×»:</strong> مرجعي من أبحاث صناعية معتمدة (Ahrefs · SEMrush
                            · Google Search Central) — ليس حالة Modonty محددة. الفرق الفعلي بين مقال
                            عشواء ومقال مدروس بالـ keywords.
                          </li>
                        </ul>
                      </div>

                      <div className="rounded-md bg-emerald-500/[0.06] border border-emerald-500/40 p-3 mb-3">
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1.5">
                          الرد المعتمد — اعرض، لا تَعِد
                        </p>
                        <p className="leading-loose">
                          «الـ system شغّال — وأنا أوريك Live الآن. أعطني دومينك + دومين منافس واحد
                          عندك في بالك، ونعمل audit مجاني خلال الـ Discovery Call: keywords مشتركة،
                          فجوات في محتواه، فرص لك. تشوف الـ data بنفسك في 10 دقائق. الـ 30× رقم صناعي
                          مرجعي — لكن أوريك أرقامك إنت بدل ما تتخيلها.»
                        </p>
                      </div>

                      <div className="rounded-md bg-amber-500/[0.06] border border-amber-500/30 p-3">
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1.5">
                          📋 Action للفريق — Free Audit = أقوى Closing Tool
                        </p>
                        <ul className="space-y-1 leading-relaxed">
                          <li className="flex items-start gap-1.5">
                            <span className="text-amber-500 shrink-0">▸</span>
                            <span>
                              <strong>في كل Discovery Call:</strong> اعرض free competitor audit مباشرة —
                              يثبت الـ tech فعلياً، ويعطي العميل قيمة فورية حتى لو ما يشترك.
                            </span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-amber-500 shrink-0">▸</span>
                            <span>
                              بعد كل إغلاق صفقة، اطلب تفويض لنشر «competitor case study» (anonymized
                              OK) في عقد الاشتراك.
                            </span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-amber-500 shrink-0">▸</span>
                            <span>
                              وثّق 3 audits تجارية فعلية بأرقام حقيقية (قبل/بعد، 6 شهور) — هدف Q3 2026
                              للنشر علناً.
                            </span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-amber-500 shrink-0">▸</span>
                            <span>
                              بناء صفحة methodology عامة على modonty.com تشرح كيف نعمل competitor audit
                              (يبني credibility حتى بدون case studies).
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* SPECIAL: Self-gap warning for Social Proof power (i === 2) */}
                  {i === 2 && (
                    <div className="rounded-md border-2 border-rose-500/40 bg-rose-500/[0.05] p-4 text-xs">
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <span>⚠️</span>
                        <span>تحذير صريح للموظف — الفجوة الذاتية في Modonty</span>
                      </p>

                      <p className="leading-loose mb-3">
                        لما تشرح هذي القوة للعميل، عقله الذكي يقلب السؤال عليك فوراً:{" "}
                        <strong className="text-rose-500">
                          «طيب، Modonty نفسها — وين case studies تبعكم؟ وين شهادات عملائكم؟ ليش ما أشوف
                          نتائج لشركات سعودية حقيقية على موقعكم؟»
                        </strong>
                        <br />
                        لو ما عندك رد جاهز، تخسر الصفقة في ثانية.
                      </p>

                      <div className="rounded-md bg-background/80 border border-rose-500/30 p-3 mb-3">
                        <p className="text-[10px] font-bold text-foreground uppercase tracking-wide mb-1.5">
                          الحقيقة (لا تكذب — كذبة وحدة تخسرك العميل والسمعة)
                        </p>
                        <p className="leading-relaxed">
                          Modonty في <strong>مرحلة التأسيس</strong>. حسب SWOT الداخلي:{" "}
                          <em>«لا case studies ظاهرة بعد · Founder brand لم يُبنى · لا webinar/community»</em>{" "}
                          — هذي نقاط ضعف معروفة، ونعمل عليها. <strong>الأرقام = الواقع 100%</strong> (القاعدة 4).
                        </p>
                      </div>

                      <div className="rounded-md bg-emerald-500/[0.06] border border-emerald-500/40 p-3 mb-3">
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1.5">
                          الرد المعتمد — حوّل الضعف لميزة
                        </p>
                        <p className="leading-loose">
                          «صراحة، احنا في مرحلة التأسيس — لو طلبت case studies تجارية مفصّلة الآن، الحقيقة
                          ما عندي. لكن:
                          <br />
                          ① أوريك الـ tech تشتغل live — Dashboard لعميل tester، GSC integration، Lead
                          Scoring فعلي.
                          <br />
                          ② أوريك مدونة modonty.com نفسها — نطبّق نفس النظام علينا، تشوف الأرقام مباشرة.
                          <br />
                          ③ <strong>الـ Early Adopter Advantage:</strong> العملاء الأوائل يحصلون على سعر
                          متجمد + وصول مباشر للمؤسس + يصيرون هم case studies الأولى. بدل ما تنتظر دليل
                          بعد سنة، كن إنت الدليل — والباقة تبقى بسعرك للأبد.»
                        </p>
                      </div>

                      <div className="rounded-md bg-amber-500/[0.06] border border-amber-500/30 p-3">
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1.5">
                          📋 Action للفريق — هذي القوة لازم نبنيها لأنفسنا أولاً
                        </p>
                        <ul className="space-y-1 leading-relaxed">
                          <li className="flex items-start gap-1.5">
                            <span className="text-amber-500 shrink-0">▸</span>
                            <span>كل عميل جديد = case study محتمل. وثّق الأرقام (قبل/بعد) من اليوم الأول.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-amber-500 shrink-0">▸</span>
                            <span>اطلب تفويض كتابي للنشر في عقد الاشتراك (لا تنسى هذي البند).</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-amber-500 shrink-0">▸</span>
                            <span>اجمع testimonials بعد 3 شهور من الاشتراك (وقت كافي للنتائج).</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-amber-500 shrink-0">▸</span>
                            <span>اعرض نمو modonty.com نفسها كـ proof (Authority Blog يكبر يومياً).</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-amber-500 shrink-0">▸</span>
                            <span>هدف Q3 2026: 3 case studies منشورة + 10 testimonials مرئية.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Rule>

          {/* Rule 8 */}
          <Rule
            num={8}
            badge="عبارة التموضع"
            title="احفظها كاملة"
            borderClass={CORE}
            why={
              <>
                هذي الجملة الـ <strong>Master</strong>. تحوي كل القيمة في فقرة واحدة: الجمهور (MENA SMB) +
                الوعي (المحتوى = عملاء) + المشكلة (ما يقدر يدفع وكالة) + الحل (مدونتي) + الميكانيكا (SaaS
                لا وكالة). لو حفظتها وقلتها بدقة، العميل يفهم Modonty في دقيقة.
              </>
            }
            when={
              <>
                في الـ Pitch Deck slide الأولى. على الموقع كـ tagline ثانوية. في الإعلانات الطويلة (LinkedIn).
              </>
            }
          >
            <p className="leading-loose">
              «لشركات الـ MENA الصغيرة والمتوسطة اللي تعرف إن المحتوى = عملاء، لكن ما تقدر تحط 100 ألف ريال
              بالسنة على وكالة، <strong>مدونتي تقدّم لك مدونة احترافية + SEO تلقائي + Lead Intelligence
              بسعر يبدأ من صفر</strong> — لأنها مبنية بمنطق SaaS مو بمنطق وكالة.»
            </p>
          </Rule>

          {/* Rule 9 */}
          <Rule
            num={9}
            badge="Hero Headline"
            title="الرسالة الرئيسية في الواجهة"
            borderClass={CORE}
            why={
              <>
                ثلاث جمل. كل جملة <strong>نتيجة</strong>، مش feature. العميل ما يهمه «JSON-LD» ولا «Schema
                validation» — يهمه «عملاؤه على واتساب». هذي القاعدة الذهبية للـ copywriting: تكلم العميل
                بلغة <strong>النتيجة النهائية</strong> اللي يعيشها، مش بلغة الأدوات اللي توصّله لها.
              </>
            }
            when={
              <>
                على الـ Hero في الموقع. كـ headline في الإعلانات. في أول جملة من أي pitch.
              </>
            }
          >
            <p className="text-base font-bold leading-loose text-primary">
              «مدونتك في صدر نتائج البحث.<br />
              عملاؤك في WhatsApp.<br />
              بدون ما تكتب حرف.»
            </p>
          </Rule>

          {/* Rule 10 */}
          <Rule
            num={10}
            badge="السلاح الأقوى"
            title="قاعدة 12 = 18"
            borderClass={CORE}
            why={
              <>
                هذي <strong>مش خصم</strong>. هذي <strong>ضمان</strong>. الفرق نفسي 100%: لو قلت «خصم 50%»،
                العميل يحس إن المنتج كان مبالغ في سعره أصلاً (perceived value تنخفض). لو قلت «18 شهر بسعر
                12 شهر»، العميل يحس إنه <strong>كسب 6 شهور إضافية</strong> هدية. نفس الفلوس، نفس الخدمة،
                إحساس مختلف تماماً.
              </>
            }
            when={
              <>
                لما تذكر السعر لأول مرة. لما العميل يقول «غالي». في الـ Pricing slide.
              </>
            }
          >
            <p className="font-semibold mb-2">العميل يدفع 12 شهر، يستلم خدمة 18 شهر.</p>
            <ul className="space-y-1 text-xs">
              <li>❌ <strong>ممنوع:</strong> «خصم 50%»</li>
              <li>✅ <strong>المطلوب:</strong> «ادفع لمدة سنة، استلم خدمة سنة ونصف»</li>
              <li>
                <strong>السبب:</strong> المحتوى يحتاج وقت يثمر (3–6 شهور). نعطيك 6 شهور إضافية لتشوف الـ
                ROI كامل قبل التجديد.
              </li>
            </ul>
          </Rule>

          {/* Rule 11 */}
          <Rule
            num={11}
            badge="ROI Pitch"
            title="الأرقام تحفظها"
            borderClass={CORE}
            why={
              <>
                العميل العقلاني يحتاج برهان رياضي قبل ما يدفع. لما تعرض رقم <strong>70x ROI</strong>، عقله
                يحسب: «حتى لو حصلت 10% بس من الرقم، يبقى 7x». الجملة الذهبية «لو حصلت 2 عملاء بس...» تخلي
                القرار يبدو سهل: <strong>مغامرة بسيطة بمكاسب كبيرة</strong>.
              </>
            }
            when={
              <>
                في الـ Full Demo (الدقيقة 22-25). في Discovery لما العميل يحب الأرقام. في الـ Closing.
              </>
            }
          >
            <pre className="text-[11px] bg-background/60 border border-primary/20 rounded p-3 overflow-x-auto leading-loose">
{roiPreBlock}
            </pre>
            <p className="text-xs mt-2">
              <strong>جملة جاهزة:</strong> «لو حصلت 2 عملاء بس من مقال واحد، تكون استرجعت السعر.»
            </p>
          </Rule>

          {/* Rule 12 */}
          <Rule
            num={12}
            badge="الباقات الأربع"
            title="متى تقترح أيهم"
            borderClass={CORE}
            why={
              <>
                الباقات صُمّمت بحيث Momentum (الأكثر شعبية) في النص. هذي تكتيك <strong>Anchoring</strong>{" "}
                المعروف في المبيعات: العميل يقارن Momentum بـ Free فيتحمس للقيمة، ويقارنها بـ Leadership
                فيحس إنها معقولة. <strong>دائماً اقترح Momentum أولاً</strong>، ثم اعرض البقية كخيارات
                لتخفيض/ترقية.
              </>
            }
            when={
              <>
                في الـ Pricing slide. في الـ Closing. لما العميل يسأل «أي باقة تنصحوني فيها؟».
              </>
            }
          >
            <div className="space-y-1.5">
              {resolvedPackages.map((p, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-md border p-2.5 ${
                    p.featured ? "border-primary/40 bg-primary/[0.06]" : "border-primary/20 bg-background/60"
                  }`}
                >
                  <span className={`text-xs font-bold shrink-0 w-24 ${p.featured ? "text-primary" : ""}`}>{p.name}</span>
                  <span className="text-xs font-mono shrink-0 w-16 text-muted-foreground">{p.price} ريال</span>
                  <span className="text-[11px] text-muted-foreground flex-1 min-w-0">{p.when}</span>
                </div>
              ))}
            </div>
          </Rule>

          {/* Rule 13 */}
          <Rule
            num={13}
            badge="جمل الإغلاق (4)"
            title="جمل الإغلاق المعتمدة"
            borderClass={CORE}
            why={
              <>
                4 جمل لـ 4 شخصيات: <strong>المتردد</strong> يحتاج ضغط ناعم · <strong>العقلاني</strong> يحتاج
                ROI · <strong>الحذر</strong> يحتاج إلغاء مخاطرة · <strong>البطيء</strong> يحتاج استعجال.
                الخطأ القاتل: استخدام نفس الجملة لكل العملاء. أنت <strong>تختار الجملة</strong> بناءً على
                شخصية العميل اللي قدامك، مش عشواء.
              </>
            }
            when={
              <>
                بعد ما تجاوب اعتراضاته. لما تحس النقاش وصل لـ «طيب، إيش الخطوة الجاية؟».
              </>
            }
          >
            <div className="space-y-1.5">
              {fourClosingLines.map((c, i) => (
                <div key={i} className="rounded-md border border-primary/20 bg-background/60 p-2.5">
                  <p className="text-[10px] font-bold text-primary mb-1">{c.type}</p>
                  <p className="text-xs">{c.line}</p>
                </div>
              ))}
            </div>
          </Rule>

          {/* Rule 14 */}
          <Rule
            num={14}
            badge="الاعتراض الأخطر"
            title="«WordPress + ChatGPT يكفي»"
            borderClass={CORE}
            why={
              <>
                <strong>80% من العملاء</strong> يطرحون هذا الاعتراض. لو ما عندك رد محفوظ، خسرت الصفقة في
                ثانية. الرد المعتمد <strong>ما يحارب AI</strong> — يستخدمه: «صح، AI يكتب نص. مدونتي تطلّع
                منظومة جودة». <strong>تنقل المعركة من «الكتابة» إلى «الجودة»</strong>. لأنك ما تقدر تربح
                معركة «من يكتب أسرع»، لكن تربح معركة «من ينشر مقال يجتاز فحوصات محركات البحث».
              </>
            }
            when={
              <>
                لما يقول العميل «أنا عندي ChatGPT» أو «صديقي يكتب لي على WordPress». غالباً في الـ Discovery
                Call.
              </>
            }
          >
            <p className="font-semibold mb-2">الرد الكامل (احفظه حرفياً):</p>
            <p className="leading-loose">
              «تماماً، تقدر تكتب بـ ChatGPT. السؤال مو <strong>الكتابة</strong> — السؤال{" "}
              <strong>الجودة اللي تقبلها محركات البحث</strong>. Modonty ما تكتب لك مقال — Modonty{" "}
              <strong>تطلّع لك مقال يجتاز 9 فحوصات قبل النشر</strong>: E-E-A-T، JSON-LD، Schema validation،
              YMYL، Knowledge Graph، Citations، AI Crawler optimization، Reading level، Pre-publish audit.{" "}
              <strong>هذا مو AI، هذا نظام جودة محتوى.</strong> ChatGPT يكتب نص. Modonty تنشر مقال يظهر في
              نتائج البحث (Google + Bing + ChatGPT Search) ويجيب لك عملاء. الفرق <strong>كوني</strong>.»
            </p>
          </Rule>

          {/* Rule 15 */}
          <Rule
            num={15}
            badge="قاعدة AI"
            title="قاعدة الـ AI الذهبية"
            borderClass={CORE}
            why={
              <>
                هذي قاعدة عامة فوق رد القاعدة 14. المبدأ: <strong>لو العميل يحب AI، ما تواجهه</strong>. توافقه
                ثم تتجاوزه. هذا الـ <strong>Aikido البيعي</strong>: تستخدم قوة الخصم ضده. لا تحاول تثبت
                ChatGPT غلط — تثبت إن Modonty أكثر من ChatGPT. الفرق: «منظومة» مو «أداة».
              </>
            }
            when={
              <>
                كل مرة يذكر AI. مرة، 5 مرات، عشر مرات — نفس الرد. لا تتعب من تكرار «صح، توافق + Modonty
                أكثر».
              </>
            }
          >
            <p>
              إذا قال العميل «أنا أستخدم ChatGPT/AI» → <strong>وافقه فوراً</strong>. ثم انقل الحوار من{" "}
              <em>«الكتابة»</em> إلى <em>«الجودة اللي تقبلها محركات البحث»</em>. ChatGPT يكتب نص. Modonty
              تنشر مقال يظهر في نتائج البحث (Google + Bing + AI Search). الفرق <strong>منظومة</strong> مو{" "}
              <strong>أداة</strong>.
            </p>
          </Rule>
        </div>
      </div>

      {/* ── 🟡 Important Rules (16-18) ──────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🟡</span>
          <h2 className="text-base font-bold text-amber-400">القواعد المهمة (3)</h2>
        </div>

        <div className="space-y-3">
          {/* Rule 16 */}
          <Rule
            num={16}
            badge="Anti-Hooks"
            title="كلمات ممنوعة في الكتابة"
            borderClass={AMBER}
            why={
              <>
                كل كلمة من هذي الـ 4 تنقص قيمة Modonty لما تستخدمها في نص. السبب: «مدوّنة» تحوّل المنتج إلى
                Blogger · «أرخص» يعكس صورة منتج رخيص · «AI-powered» شائع جداً (كل المنتجات تقولها) ·
                «Easy» مش كلمة بيع للسوق السعودي. <strong>هذي قاعدة للكتابة</strong>، مش للحديث.
              </>
            }
            when={
              <>
                كل نص للموقع. كل إعلان. كل رسالة WhatsApp جماعية. كل مقالة. عند المراجعة، استخدم Ctrl+F.
              </>
            }
          >
            <div className="space-y-1.5">
              {antiHooks.map((a, i) => (
                <div key={i} className="flex items-center gap-3 rounded-md border border-amber-500/20 bg-background/60 p-2.5">
                  <span className="text-red-400 shrink-0 text-sm">❌</span>
                  <span className="text-xs font-bold shrink-0 w-40">{a.word}</span>
                  <span className="text-[11px] text-muted-foreground flex-1 min-w-0">{a.reason}</span>
                </div>
              ))}
            </div>
          </Rule>

          {/* Rule 17 */}
          <Rule
            num={17}
            badge="ICPs الـ 5"
            title="ترتيب سهولة الإغلاق"
            borderClass={AMBER}
            why={
              <>
                الترتيب <strong>مش عبثي</strong>. التجارة الإلكترونية (سلة/زد) أسهل لأن أصحابها يفهمون
                محركات البحث ويعيشون منافسة شرسة فيها — لما تقول «نضمن لك ظهور»، يفهم القيمة فوراً.
                العيادات
                ثاني لأنها YMYL وتحتاج Authority. <strong>لو وقتك محدود</strong>، ركّز على الأول والثاني،
                تحصل على 70% من الـ revenue بـ 30% من الجهد.
              </>
            }
            when={
              <>
                في توزيع جهد الفريق. في تخطيط الحملات. لما تقرر «نروح أي ICP أولاً؟».
              </>
            }
          >
            <ol className="space-y-1.5">
              {fiveICPs.map((icp, i) => (
                <li key={i} className="flex items-center gap-3 rounded-md border border-amber-500/20 bg-background/60 p-2.5">
                  <span className="text-[10px] shrink-0">{icp.rank}</span>
                  <span className="text-xs font-bold shrink-0 w-44">{icp.name}</span>
                  <span className="text-[11px] text-muted-foreground flex-1 min-w-0">{icp.note}</span>
                </li>
              ))}
            </ol>
            <p className="text-[11px] text-muted-foreground mt-3 italic">
              Tier 2 (B2B): الوكالات الرقمية كـ Resellers — White Label.
            </p>
          </Rule>

          {/* Rule 18 */}
          <Rule
            num={18}
            badge="نقاط الألم (7)"
            title="احفظها كأسئلة"
            borderClass={AMBER}
            why={
              <>
                كل واحد من الـ 7 آلام = <strong>سؤال مباشر للعميل</strong>. لما تسأل «حالياً، تكتب بنفسك
                ولا في كاتب؟»، إنت ما تكلمه عشواء — إنت تعمل <strong>تشخيص محدد</strong>. كل جواب يقودك
                للحل المناسب. هذي طريقة الأطباء (Differential Diagnosis) — كل سؤال يستبعد احتمال ويؤكد
                آخر.
              </>
            }
            when={
              <>
                في الـ Discovery Call (الدقائق 3-8). كل واحد سؤال = ثانيتين، 7 أسئلة = 14 ثانية، لكنها
                تكشف لك كل ألمه.
              </>
            }
          >
            <ol className="list-decimal ps-5 space-y-1 marker:text-amber-400">
              {sevenPainPoints.map((p, i) => (
                <li key={i} className="text-sm">«{p}»</li>
              ))}
            </ol>
          </Rule>
        </div>
      </div>

      {/* ── 🟢 Supporting Rules (19-22) ─────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🟢</span>
          <h2 className="text-base font-bold text-emerald-400">القواعد الداعمة (4)</h2>
        </div>

        <div className="space-y-3">
          {/* Rule 19 */}
          <Rule
            num={19}
            badge="عميلنا"
            title="عميلنا مو / عميلنا هو"
            borderClass={GREEN}
            why={
              <>
                هذي القاعدة <strong>توفّر وقتك أكثر من أي قاعدة</strong>. لو دخلت محادثة مع شركة كبرى عندها
                فريق تسويق + ميزانية مفتوحة، إنت ضيّعت ساعة. هؤلاء يروحون لـ HubSpot ويدفعون 10x سعرنا.
                عميلنا الحقيقي = <strong>الحالم بالنمو، بدون الموارد</strong>. اعرف ميّزه من الثانية الأولى.
              </>
            }
            when={
              <>
                في أول 30 ثانية من المحادثة. لو اكتشفت إنه «شركة كبرى عندها فريق تسويق» → حوّله لـ
                Reseller program، أو اعتذر بأدب وانتقل للعميل التالي.
              </>
            }
          >
            <p>
              <strong className="text-red-400">عميلنا مو:</strong> شركة كبرى عندها فريق تسويق + ميزانية مفتوحة
              (يروحون لـ HubSpot).
            </p>
            <p className="mt-2">
              <strong className="text-emerald-400">عميلنا هو:</strong> صاحب شركة صغيرة-متوسطة، يعرف إن
              المحتوى مهم، بس <strong>ما عنده وقت، ما عنده فريق، ما عنده ميزانية وكالة</strong>. Modonty =
              الحل العملي الوحيد له.
            </p>
          </Rule>

          {/* Rule 20 */}
          <Rule
            num={20}
            badge="Moat"
            title="السلاح السرّي — كالبنيان يشد بعضه بعضاً"
            borderClass={GREEN}
            why={
              <>
                هذي القاعدة تجاوب على السؤال الأخطر: «ليش modonty.com مش دوميني؟». الجواب الجميل:{" "}
                <strong>
                  Modonty تطبيق عملي لقاعدة «كالبنيان يشد بعضه بعضاً» في عالم المحتوى الرقمي
                </strong>
                . مدونة جديدة على دومينك تحتاج 1-2 سنة لمحركات البحث تثق فيها — أنت طوبة وحيدة. عندنا،
                أنت طوبة في بنيان قائم بسلطة Domain Authority راسخة من اليوم الأول. والـ Moat لا يقدر
                منافس صغير يقلّده — لأنه يحتاج 100 عميل قبله ليبدأ بناء البنيان نفسه.
                <br />
                <br />
                <strong>الإطار الثقافي يفرّقنا عن HubSpot والمنصات العالمية</strong>: هم يبيعون «Network
                Effect» كمصطلح تقني بارد. إحنا نشرحها بمفهوم نبوي عميق يعرفه عميلنا في عقله الباطن.
              </>
            }
            when={
              <>
                ① لما العميل يسأل «ليش الدومين مش بإسمي؟» — أقوى رد ممكن.
                <br />
                ② لما يقارنك بـ WordPress أو Wix.
                <br />
                ③ لما يقارنك بـ HubSpot أو منصات عالمية — الإطار الثقافي يكسر المقارنة.
                <br />
                ④ في الـ Pitch Deck — slide ختامية بقوة الحديث.
              </>
            }
          >
            <div className="space-y-3">
              {/* The Hadith — the cultural anchor */}
              <div className="rounded-lg border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/[0.08] to-emerald-500/[0.03] p-5 text-center">
                <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-3">
                  حديث نبوي شريف — الإطار الثقافي للقاعدة
                </p>
                <p className="text-lg font-bold leading-loose text-emerald-700 dark:text-emerald-400 mb-2">
                  «المؤمن للمؤمن كالبنيان يشدّ بعضه بعضاً»
                </p>
                <p className="text-[11px] text-muted-foreground italic">
                  رواه البخاري عن أبي موسى الأشعري — صحيح البخاري · حديث 481 / 2446
                </p>
              </div>

              {/* The metaphor mapped to Modonty */}
              <div className="rounded-md border border-emerald-500/25 bg-background/70 p-4">
                <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wide mb-3">
                  كيف ينطبق على Modonty؟ (المجاز الدقيق)
                </p>
                <ul className="space-y-2 text-xs leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0 font-bold">▸</span>
                    <span>
                      <strong>كل عميل ينضم</strong> = طوبة جديدة تُضاف للبنيان
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0 font-bold">▸</span>
                    <span>
                      <strong>كل مقال يُنشر</strong> = ملاط يثبّت الطوب ببعضه
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0 font-bold">▸</span>
                    <span>
                      <strong>كل backlink داخلي</strong> = حديد تسليح يربط الجدران
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0 font-bold">▸</span>
                    <span>
                      <strong>Domain Authority</strong> = أساسات البنيان الراسخة في محركات البحث
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0 font-bold">▸</span>
                    <span>
                      <strong>كل عميل جديد ينضم</strong> = البنيان كله يكبر — مش طوبة وحدها
                    </span>
                  </li>
                </ul>
              </div>

              {/* Technical: the math */}
              <div className="rounded-md border border-primary/25 bg-primary/[0.04] p-4">
                <p className="text-[11px] font-bold text-primary uppercase tracking-wide mb-2">
                  الترجمة التقنية — Authority Blog Network Effect
                </p>
                <p className="text-sm leading-relaxed mb-2">
                  modonty.com مدونة مركزية واحدة، يستفيد منها كل العملاء بشكل تراكمي. عميل جديد ينضم →
                  يرفع SEO لكل العملاء.
                </p>
                <p className="text-sm leading-relaxed">
                  <strong>المعادلة:</strong> 100 عميل × 8 مقالات = <strong>800 مقالة/شهر</strong> =
                  سلطة Domain لا تُكسر.
                </p>
              </div>

              {/* How to use with customer — real scenario */}
              <div className="rounded-md border border-amber-500/30 bg-amber-500/[0.05] p-4">
                <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wide mb-2">
                  كيف تطلقها مع العميل (سيناريو حقيقي)
                </p>
                <div className="space-y-2 text-xs">
                  <p className="leading-relaxed">
                    <strong className="text-foreground">العميل:</strong> «طيب، ليش مدونتي تكون على
                    موقعكم مش موقعي؟»
                  </p>
                  <p className="leading-loose ps-3 border-s-2 border-amber-500/40">
                    <strong className="text-amber-600">إنت:</strong> «عشان نطبّق قاعدة جميلة من ديننا —
                    «المؤمن للمؤمن كالبنيان يشدّ بعضه بعضاً». لو شركتك على دومينك لوحدها، أنت طوبة
                    وحيدة في الصحراء — تحتاج سنتين عشان محركات البحث تثق فيك. عندنا، أنت طوبة في بنيان
                    قائم. كل عميل ينضم يقوّي بنياننا، وبنياننا يقوّي حضورك. <strong>هذا مش منافسة، هذا
                    تكامل.</strong> ولو يوماً ما بغيت تنقل المحتوى لدومينك، نسلّمك إياه — لكن
                    السنتين اللي وفّرتها ما ترجع.»
                  </p>
                </div>
              </div>

              {/* Why this differentiator works */}
              <div className="rounded-md border border-violet-500/25 bg-violet-500/[0.04] p-3 text-xs">
                <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-1.5">
                  ليش هذا الإطار يفرّقنا عن HubSpot/المنصات العالمية
                </p>
                <p className="leading-loose">
                  HubSpot يبيع «Network Effect» كمصطلح تقني بارد ينطبق على أي SaaS. إحنا نشرحها{" "}
                  <strong>بمفهوم نبوي عميق</strong> يعرفه عميلنا في عقله الباطن — يعطيها{" "}
                  <strong>وزناً عاطفياً + ثقافياً + روحانياً</strong> ما تقدر أي منصة عالمية تقلّده. هذي
                  ميزة Modonty الحقيقية: <strong>نتكلم لغة عميلنا، لا لغة Silicon Valley</strong>.
                </p>
              </div>
            </div>
          </Rule>

          {/* Rule 21 */}
          <Rule
            num={21}
            badge="أصل تسويقي"
            title="كل عميل = صفحة كاملة على modonty.com — مش مجرد مقالات"
            borderClass={GREEN}
            why={
              <>
                <strong>هذي القاعدة تكسر الـ stereotype إن Modonty = اشتراك مقالات.</strong> العميل
                يستلم <strong>صفحة احترافية كاملة</strong> باسمه على modonty.com — Mini-website جاهز
                بدون تكلفة موقع منفصل. هذي قيمة بيعية ضخمة معظم الفريق ينساها لأنه يفكر في «الكتابة»
                فقط. <strong>الموظف اللي يفهمها يقفل الصفقة بسرعة</strong> — لأن العميل يكتشف إنه يحصل
                على موقع كامل + Lead capture + Social proof + Analytics — كل ذلك مدمج في الاشتراك.
                <br />
                <br />
                <strong>الفرق النفسي:</strong> «اشتراك {momentumPrice} شهرياً للمقالات» = غالي. «اشتراك {momentumPrice}
                شهرياً لـ Mini-website + 8 مقالات + كل أدوات الـ social proof» = صفقة العمر.
              </>
            }
            when={
              <>
                ① في Discovery Call، بعد العميل يسأل عن المنتج — اعرض الصفحة Live.
                <br />
                ② بعد العميل يسأل عن السعر — استخدمها لتبرير القيمة.
                <br />
                ③ لما يقارنك بـ WordPress — «WordPress = أداة فاضية. عندنا = صفحة جاهزة كاملة».
                <br />
                ④ في الـ Pitch Deck — slide مخصصة بـ screenshot صفحة عميل حقيقي.
              </>
            }
          >
            <div className="space-y-3">
              <p className="leading-loose">
                «اشتراك Modonty = ما تستلم بس مقالات. تستلم{" "}
                <strong>صفحة احترافية كاملة باسمك على modonty.com</strong> — Mini-website بـ 8 tabs،
                نظام إثبات اجتماعي مدمج، lead capture tools، وكل شي محسّن لمحركات البحث + الجوال.»
              </p>

              {/* 8 tabs breakdown */}
              <div className="rounded-md border border-emerald-500/25 bg-background/70 p-4">
                <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wide mb-3">
                  الصفحة بـ 8 tabs — كل tab بقيمته
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {[
                    { tab: "🏠 الكل", desc: "landing شامل — first impression للزائر" },
                    { tab: "ℹ️ حول", desc: "معلومات الشركة + خدماتها + الـ team" },
                    { tab: "📞 تواصل", desc: "نموذج تواصل + بيانات رسمية + WhatsApp link" },
                    { tab: "🖼️ الصور", desc: "معرض كامل للأعمال + المنتجات" },
                    { tab: "👥 المتابعون", desc: "social proof — عدد + قائمة" },
                    { tab: "⭐ التقييمات", desc: "مراجعات العملاء — إثبات ثقة" },
                    { tab: "🎬 الريلز", desc: "محتوى فيديو قصير (TikTok/Reels-style)" },
                    { tab: "❤️ الإعجابات", desc: "engagement metrics ظاهرة للزائر" },
                  ].map((t, idx) => (
                    <div key={idx} className="flex items-start gap-2 rounded border border-emerald-500/15 bg-background/50 p-2">
                      <span className="font-bold shrink-0">{t.tab}</span>
                      <span className="text-muted-foreground leading-relaxed">{t.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extra features beyond tabs */}
              <div className="rounded-md border border-violet-500/25 bg-violet-500/[0.04] p-4">
                <p className="text-[11px] font-bold text-violet-500 uppercase tracking-wide mb-3">
                  + ميزات إضافية مدمجة (مش في الـ tabs)
                </p>
                <ul className="space-y-1.5 text-xs leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-violet-500 shrink-0">▸</span>
                    <span>
                      <strong>Hero بشعار + غلاف + tagline</strong> — هوية بصرية فورية
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-violet-500 shrink-0">▸</span>
                    <span>
                      <strong>Newsletter signup card</strong> — lead capture للزوار
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-violet-500 shrink-0">▸</span>
                    <span>
                      <strong>Visitor actions:</strong> Follow · Favorite · Comment · Share · Review (5
                      طرق engagement)
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-violet-500 shrink-0">▸</span>
                    <span>
                      <strong>Mobile CTA dedicated</strong> — تجربة جوال مخصصة
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-violet-500 shrink-0">▸</span>
                    <span>
                      <strong>View tracker analytics</strong> — العميل يشوف زواره وتفاعلهم
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-violet-500 shrink-0">▸</span>
                    <span>
                      <strong>Discovery integration</strong> — يُكتشف من خلال tags + categories +
                      search من زوار عملاء آخرين
                    </span>
                  </li>
                </ul>
              </div>

              {/* Why it sells */}
              <div className="rounded-md border border-amber-500/25 bg-amber-500/[0.04] p-4">
                <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wide mb-3">
                  ليش هذي قيمة بيعية ضخمة؟ (5 أسباب للموظف)
                </p>
                <ol className="space-y-2 text-xs leading-relaxed list-decimal ps-5 marker:text-amber-500 marker:font-bold">
                  <li>
                    <strong>Mini-website بدون تكلفة موقع منفصل</strong> — موقع + استضافة + أمان + SSL
                    = صفر تكلفة إضافية.
                  </li>
                  <li>
                    <strong>Domain Authority benefit</strong> — الـ subpage مدعومة بسلطة modonty.com
                    (يستفيد من اليوم الأول).
                  </li>
                  <li>
                    <strong>Discovery channels مجانية</strong> — يُكتشف من زوار آخرين عبر tags +
                    categories.
                  </li>
                  <li>
                    <strong>Social proof جاهز</strong> — followers + reviews + ratings بدون أدوات
                    خارجية مدفوعة.
                  </li>
                  <li>
                    <strong>Lead capture كامل</strong> — newsletter + contact + comment = 3 قنوات في
                    صفحة واحدة.
                  </li>
                </ol>
              </div>

              {/* Mental shift */}
              <div className="rounded-md bg-emerald-500/[0.06] border border-emerald-500/40 p-3 text-center">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1.5">
                  التحوّل الذهني المطلوب — اقتنع به أولاً قبل ما تشرحه
                </p>
                <p className="text-sm leading-relaxed">
                  من «اشتراك مقالات» إلى{" "}
                  <strong className="text-emerald-500">
                    «أصل تسويقي كامل تملكه على authority blog»
                  </strong>
                </p>
              </div>
            </div>
          </Rule>

          {/* Rule 22 — Telegram Real-Time Engagement */}
          <Rule
            num={22}
            badge="Real-time"
            title="Telegram — كل تفاعل يصل لجوال العميل في ثانية"
            borderClass={GREEN}
            why={
              <>
                هذي ميزة <strong>ما عند منافس عربي واحد</strong>. WordPress + Wix ما يرسلون. HubSpot
                يرسل لـ Slack (أداة غربية، الفريق العربي ما يستخدمها). مدونتي ترسل لـ <strong>Telegram</strong>{" "}
                — التطبيق الأكثر استخداماً في الخليج للأعمال التجارية. النتيجة:{" "}
                <strong>العميل ما يحتاج يفتح Dashboard، الـ Dashboard يفتح عليه</strong>.
                <br />
                <br />
                التحوّل الذهني: من «أدخل الموقع كل يوم وأشيّك الإحصائيات» إلى{" "}
                <strong>«جوالي يخبرني لما يصير شي مهم»</strong>. هذا فرق <strong>كوني</strong> في
                التجربة — يحوّل الـ owner من passive observer إلى active responder. عميل واحد سعيد بهذا
                = renewal مضمون.
              </>
            }
            when={
              <>
                ① لما يسأل العميل «كيف أعرف اللي يصير في الموقع؟».
                <br />
                ② لما يقارنك بـ WordPress — «هم ما يرسلون أصلاً، احنا نرسل».
                <br />
                ③ لما يقارنك بـ HubSpot — «Slack أداة غربية، Telegram فعلياً عندك».
                <br />
                ④ في Demo — اطلب رقمه + أرسل event تجريبي يوصله مباشرة.
                <br />
                ⑤ لما يستفسر عن Lead Scoring — «Lead عالي الجودة = Telegram alert فوري».
              </>
            }
          >
            <div className="space-y-3">
              <p className="leading-loose">
                «اشتراك Modonty يربط مدونتك بـ <strong>Telegram bot مخصّص</strong>. كل تفاعل، كل زائر،
                كل lead جديد — يصلك على جوالك في ثانية. <strong>إنت تختار من 22 حدث</strong> ما تبغى تعرف.»
              </p>

              {/* The 22 events grouped */}
              <div className="rounded-md border border-emerald-500/25 bg-background/70 p-4">
                <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wide mb-3">
                  الـ 22 حدث المتاحة — العميل يختار
                </p>
                <div className="space-y-3">
                  {/* Articles events */}
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wide mb-2">
                      📰 المقالات (13 حدث)
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                      {[
                        "مشاهدة مقال",
                        "لايك",
                        "ديسلايك",
                        "إضافة لمفضلة",
                        "مشاركة",
                        "ضغط CTA",
                        "ضغط رابط داخلي",
                        "تعليق جديد",
                        "رد على تعليق",
                        "لايك تعليق",
                        "ديسلايك تعليق",
                        "سؤال للعميل (FAQ)",
                        "تحويل (Conversion)",
                      ].map((e, i) => (
                        <div
                          key={i}
                          className="text-[10px] rounded border border-emerald-500/15 bg-background/60 px-2 py-1 leading-tight"
                        >
                          ✓ {e}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Client page events */}
                  <div className="pt-3 border-t border-emerald-500/15">
                    <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-2">
                      🏢 صفحة العميل (6 أحداث)
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                      {[
                        "مشاهدة الصفحة",
                        "متابعة (Follow)",
                        "حفظ كمفضّل (Favorite)",
                        "مشاركة",
                        "اشتراك بالنشرة",
                        "تعليق على الشركة",
                      ].map((e, i) => (
                        <div
                          key={i}
                          className="text-[10px] rounded border border-violet-500/15 bg-background/60 px-2 py-1 leading-tight"
                        >
                          ✓ {e}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Direct events */}
                  <div className="pt-3 border-t border-emerald-500/15">
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-2">
                      ⚡ مباشر (3 أحداث)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                      {["رسالة دعم", "اهتمام بحملة", "Lead عالي الجودة"].map((e, i) => (
                        <div
                          key={i}
                          className="text-[10px] rounded border border-amber-500/15 bg-amber-500/[0.04] px-2 py-1 leading-tight font-bold"
                        >
                          🔥 {e}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* The mental shift */}
              <div className="rounded-md border border-blue-500/25 bg-blue-500/[0.05] p-3 text-xs">
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mb-1.5">
                  💡 الفرق الذهني الذي تخلقه هذي القاعدة
                </p>
                <div className="space-y-1.5 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="text-rose-500 shrink-0">✗</span>
                    <span><strong>قبل Modonty:</strong> «أدخل الموقع كل يوم أشيّك» (passive)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0">✓</span>
                    <span><strong>مع Modonty:</strong> «جوالي يخبرني لما يصير شي مهم» (active responder)</span>
                  </div>
                </div>
              </div>

              {/* Real conversation scenario */}
              <div className="rounded-md border border-amber-500/25 bg-amber-500/[0.04] p-3 text-xs">
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-2">
                  السيناريو في محادثة حقيقية
                </p>
                <div className="space-y-2">
                  <p className="leading-relaxed">
                    <strong className="text-foreground">العميل:</strong> «طيب، لو حد سأل عن منتجي،
                    كيف أعرف؟»
                  </p>
                  <p className="leading-loose ps-3 border-s-2 border-amber-500/40">
                    <strong className="text-amber-600">إنت:</strong> «كل تفاعل يصلك على Telegram في
                    ثانية — مشاهدة، لايك، تعليق، اشتراك. <strong>إنت تختار من 22 حدث ما تبغى تعرف</strong>،
                    ما تبغى تعرف. لو تبغى عرض حقيقي — أعطني رقمك على Telegram، نربطك الآن، وأرسلك event
                    تجريبي. تشوف بنفسك.»
                  </p>
                </div>
              </div>

              {/* Cultural / strategic positioning */}
              <div className="rounded-md border border-violet-500/25 bg-violet-500/[0.04] p-3 text-xs">
                <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-1.5">
                  ليش هذا الإطار يفرّقنا عن المنافسة
                </p>
                <ul className="space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-500 shrink-0">▸</span>
                    <span><strong>WordPress + Wix:</strong> ما يرسلون أي شي. لازم تفتح dashboard.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-500 shrink-0">▸</span>
                    <span><strong>HubSpot:</strong> يرسل لـ Slack/Email. الفريق الخليجي ما يستخدم Slack.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-500 shrink-0">▸</span>
                    <span><strong>Modonty:</strong> Telegram = الواقع الخليجي. عربي 100%.</span>
                  </li>
                </ul>
              </div>
            </div>
          </Rule>
        </div>
      </div>

      {/* ── Final note ────────────────────────────────────────────── */}
      <Card className="border-primary/30 bg-primary/[0.04]">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold mb-2">لو متشكّك في محادثة — هذي الثلاث تكفيك في 95% من الحالات</h3>
              <ul className="text-xs space-y-1 text-foreground/85 list-disc ps-5 marker:text-primary mb-4">
                <li>الجمل الست الذهبية (القاعدة 5)</li>
                <li>الـ Big Idea — «حضور لا وعود» (القاعدة 1)</li>
                <li>الباقات الأربع (القاعدة 12)</li>
              </ul>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                لكن الأهم: <strong className="text-foreground">إنت لازم تكون مقتنع</strong>. لو إنت ما
                تصدّق إن «حضور لا وعود» = الحقيقة، العميل يحس فوراً. اقرأ الـ «ليش مهمة» تحت كل قاعدة
                لحد ما تقتنع. بعد كذا، الإقناع يصير سهل.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </GuidelineLayout>
  );
}
