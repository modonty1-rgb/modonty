import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GuidelineLayout } from "../components/guideline-layout";
import {
  Layers,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Users,
  PenLine,
  Search,
  Palette,
  Target,
  ShieldCheck,
  ListChecks,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";

// ─── 3 مراحل تأهيل (بدون أيام/أسابيع — انتقل بسرعتك) ──────
const onboardingStages = [
  {
    label: "المرحلة 1",
    title: "الأساسيات — افهم Modonty قبل أي شي",
    summary: "هدف هذي المرحلة: تستوعب الـ Big Idea + التعريف + القواعد الذهبية. ما تنتقل قبل ما تحفظهم.",
    items: [
      "اقرأ عن Modonty (/guidelines/about)",
      "احفظ الـ Big Idea: «حضور لا وعود»",
      "اقرأ القواعد الذهبية الـ 22 (/guidelines/golden-rules)",
      "احفظ التعريف بالـ 8 ثواني + الـ Hero Headline",
      "Manager check-in الأولي — يتأكد إنك فاهم الأساسيات",
    ],
    color: "primary",
  },
  {
    label: "المرحلة 2",
    title: "التعمّق — اقرأ دورك واطّلع على المواد",
    summary: "هدف هذي المرحلة: تفهم دورك بدقة + تستوعب المواد الخاصة فيه + تعمل output أولي.",
    items: [
      "اقرأ صفحة دورك المحدد (مصمم/كاتب/SEO/مبيعات)",
      "اطّلع على المواد المرجعية (Brand + ICPs + Sales Playbook)",
      "ابدأ Output أولي — مقال أو تصميم أو محاكاة محادثة بيع",
      "مراجعة مستمرة مع الـ Manager — يصحّح المسار قبل التسليم",
    ],
    color: "amber",
  },
  {
    label: "المرحلة 3",
    title: "الانطلاق — Sign-off + بداية العمل المستقل",
    summary: "هدف هذي المرحلة: عملك يطابق المعايير + الـ Manager يوافق على انطلاقك للعمل المستقل.",
    items: [
      "Outputs review كاملة مع الـ Manager",
      "تطابق العمل مع المعايير (Image Specs + SEO Rules + Brand Voice)",
      "Sign-off للانتقال للعمل المستقل",
      "تحديد KPIs مستقبلية لمتابعة أدائك",
    ],
    color: "emerald",
  },
] as const;

const roles = [
  {
    icon: Palette,
    name: "المصمم",
    color: "violet",
    items: [
      "احفظ Image Specs الأساسية: 1920×1080 (مقال) · 500×500 (لوقو/كاتب) · 2400×400 (غلاف عميل)",
      "اقرأ ممنوعات اللوقو الـ 7 — لا تشوّه، لا تدوّر، لا تعكس",
      "الألوان: Primary #0e065a · Secondary #3030ff · Tertiary #00d8d8",
      "الخطوط: Tajawal (عربي) + Montserrat (Latin)",
      "اقرأ /guidelines/brand قبل أي تصميم",
    ],
    cta: { href: "/guidelines/brand", label: "دليل البراند" },
  },
  {
    icon: PenLine,
    name: "كاتب المحتوى",
    color: "emerald",
    items: [
      "كل مقال = 3 خطوات: Basic + Content + SEO",
      "Title 50–60 حرف · Excerpt 140–160 · Slug إنجليزي + كلمات مفتاحية",
      "H2/H3 واضحة · كلمة مفتاحية في أول 100 كلمة · 800 كلمة حد أدنى",
      "SEO Title + SEO Description + 1 رئيسية + 2-4 LSI ثانوية",
      "اقرأ Anti-Hooks — كلمات ممنوعة («مدوّنة»، «أرخص»، «AI-powered»، «Easy»)",
    ],
    cta: { href: "/guidelines/articles", label: "دليل المقالات" },
  },
  {
    icon: Search,
    name: "متخصص SEO",
    color: "blue",
    items: [
      "اعرف الـ 3 أركان: Technical (تلقائي 95%) · On-Page (الكاتب) · Off-Page (الـ Authority Blog)",
      "JSON-LD + Meta + Sitemap + Schema = تلقائي — لا تحاول تعدّلها يدوياً",
      "Pre-publish Audit: 9 فحوصات قبل أي مقال (E-E-A-T + Schema + YMYL...)",
      "تابع GSC + PageSpeed + Coverage % + Core Web Vitals",
      "هدف: Article Quality >70/100 · GSC Coverage >95% · LCP <2.5s · CLS <0.1",
    ],
    cta: { href: "/guidelines/seo-visual", label: "معاينة البحث" },
  },
  {
    icon: Target,
    name: "المبيعات",
    color: "rose",
    items: [
      "احفظ الـ 3 سكريبتات: Elevator (30 ث) · Discovery (5 د) · Full Demo (30 د)",
      "احفظ الـ 5 ICPs بترتيب سهولة الإغلاق",
      "احفظ الـ 8 اعتراضات + ردودها — خاصة «WordPress + ChatGPT يكفي»",
      "احفظ ROI Calculator: 1,299 → 92,000 (70x)",
      "قاعدة 12=18 + جمل الإغلاق الأربع",
    ],
    cta: { href: "/guidelines/sales-playbook", label: "دليل المبيعات" },
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

const universalRules = [
  "اقرأ القواعد الذهبية الـ 20 صباحاً — كل يوم",
  "كل قرار يخص العميل = ارجع لـ ICP ثم Pain Point ثم الحل",
  "الأرقام = الواقع 100% — لا تضخيم في أي تقرير أو رسالة",
  "أي شك — اسأل قبل ما تنفّذ. غلطة سريعة = خسارة عميل",
  "احفظ مكان كل دليل في الـ Knowledge Hub — توفير وقت للفريق كله",
] as const;

const onboardingChecklist = [
  "قرأت /guidelines/about (التصور الكامل)",
  "حفظت التعريف بالـ 8 ثواني",
  "حفظت الـ Big Idea «حضور لا وعود»",
  "قرأت القواعد الذهبية الـ 22",
  "قرأت دليل الدور الخاص بي (مصمم/كاتب/SEO/مبيعات)",
  "قرأت /guidelines/icps (الـ 7 ICPs + 7 نقاط ألم + Egypt-Gulf tier)",
  "Manager check-in الأولي تم (المرحلة 1)",
  "Output أولي تم مراجعته (المرحلة 2)",
  "Sign-off للانتقال للعمل المستقل (المرحلة 3)",
] as const;

export default function TeamOnboardingPage() {
  return (
    <GuidelineLayout
      title="تأهيل الموظف الجديد — رحلة 3 مراحل"
      description="3 مراحل (الأساسيات + التعمّق + الانطلاق) — انتقل بسرعتك حسب الإنجاز، مش حسب الوقت"
    >
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/[0.06] via-background to-background">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/30 shrink-0">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold mb-2">أهلاً بك في Modonty 👋</h2>
              <p className="text-sm leading-relaxed mb-3">
                هذي الصفحة <strong>الأولى</strong> اللي تفتحها لما تنضم للفريق. تنتقل بين <strong>3 مراحل
                </strong> حسب الإنجاز — مش حسب الوقت. لما تستوعب مرحلة، تنتقل للي بعدها. بعد المرحلة الـ
                3، حتفهم: ما هي Modonty، كيف نتكلّم، ودورك بالضبط في النظام.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">3 مراحل</Badge>
                <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-500">4 أدوار</Badge>
                <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-500">checklist 9 بنود</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground italic mt-3 leading-relaxed">
                💡 <strong>القاعدة:</strong> كل موظف بسرعته. الأهم إنك تستوعب فعلياً، مش إنك تركض. الـ
                Manager يقرّر متى أنت جاهز للانتقال.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 3 مراحل التأهيل ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Layers className="h-4 w-4 text-primary" />
          <h2 className="text-base font-bold">المراحل الـ 3 — حسب الإنجاز</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          كل مرحلة لها هدف واضح. ما تنتقل للي بعدها قبل ما تحقّق هدف الحالية. لا توجد مدة ثابتة —
          تنتقل لما الـ Manager يصدّق.
        </p>

        <div className="space-y-3">
          {onboardingStages.map((s, i) => {
            const c = colorMap[s.color];
            return (
              <Card key={i} className={`${c.border} ${c.bg}`}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className={`shrink-0 px-3 py-1 rounded-md ${c.iconBg} border ${c.border} text-[10px] font-bold ${c.text}`}>
                      {s.label}
                    </span>
                    <h3 className="text-sm font-bold flex-1 min-w-[200px]">{s.title}</h3>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-3 ps-1">
                    {s.summary}
                  </p>

                  <ul className="space-y-2 ps-1">
                    {s.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className={`h-4 w-4 ${c.text} shrink-0 mt-0.5`} />
                        <span className="leading-relaxed flex-1 min-w-0">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── أدوار الفريق ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-violet-500" />
          <h2 className="text-base font-bold">أدوار الفريق — اقرأ المخصص لدورك</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          كل دور له صفحة مخصّصة — هذي ملخّصها. افتح الرابط في نهاية كل بطاقة للتفاصيل الكاملة.
        </p>

        <div className="space-y-3">
          {roles.map((r) => {
            const Icon = r.icon;
            const c = colorMap[r.color];
            return (
              <Card key={r.name} className={`${c.border} ${c.bg}`}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${c.iconBg}`}>
                      <Icon className={`h-5 w-5 ${c.text}`} />
                    </div>
                    <h3 className={`text-base font-bold ${c.text}`}>{r.name}</h3>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {r.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs">
                        <span className={`${c.text} shrink-0 mt-0.5`}>→</span>
                        <span className="leading-relaxed text-foreground/85">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={r.cta.href}
                    className={`inline-flex items-center gap-2 text-xs font-semibold ${c.text} hover:underline`}
                  >
                    {r.cta.label}
                    <ArrowLeft className="h-3 w-3" />
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── قواعد عامة لكل الأدوار ─────────────────────────── */}
      <Card className="border-amber-500/25 bg-amber-500/[0.03]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-amber-500/15">
              <ShieldCheck className="h-4 w-4 text-amber-500" />
            </div>
            <h2 className="text-base font-bold">قواعد عامة لكل الأدوار</h2>
          </div>

          <ul className="space-y-2.5">
            {universalRules.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 rounded-md border border-amber-500/20 bg-background/60 p-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-500 flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed text-foreground/85">{r}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* ── Checklist إنجازات التأهيل ─────────────────────────── */}
      <Card className="border-emerald-500/30 bg-emerald-500/[0.04]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-emerald-500/15">
              <ListChecks className="h-4 w-4 text-emerald-500" />
            </div>
            <h2 className="text-base font-bold">Checklist إنجازات التأهيل — هل أنت جاهز؟</h2>
          </div>

          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            علّم على كل بند بعد إنجازه. لو في بند ما زال مش واضح → اسأل قبل الانتقال للعمل المستقل.
            الترتيب يطابق المراحل الـ 3.
          </p>

          <ul className="space-y-2">
            {onboardingChecklist.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 rounded-md border border-emerald-500/20 bg-background/60 p-3">
                <div className="shrink-0 w-5 h-5 rounded border-2 border-emerald-500/40 bg-background mt-0.5" />
                <span className="text-sm leading-relaxed flex-1 min-w-0">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* ── تحذير ──────────────────────────────────────────── */}
      <Card className="border-rose-500/25 bg-rose-500/[0.03]">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold mb-2">القاعدة الذهبية للموظف الجديد</p>
              <p className="text-xs leading-relaxed text-foreground/85">
                <strong>لا تنفّذ شي ما تفهمه.</strong> الأخطاء الصغيرة في مرحلة التأهيل = درس مجاني.
                الأخطاء الصغيرة بعد الـ Sign-off = خسارة عميل. لو في شك — اسأل، حتى لو يبدو السؤال
                «بدائي». الفريق هنا عشان يساعدك.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Footer pointer ──────────────────────────────────────── */}
      <Card className="border-border bg-card/40">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold mb-1">جاهز للعمل المستقل؟</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ابدأ يومك بـ{" "}
                <a href="/guidelines/golden-rules" className="text-primary font-semibold hover:underline">
                  القواعد الذهبية الـ 22
                </a>
                {" "}— اقرأها صباحاً، احفظ منها 5 على الأقل لتعتاد على الأسلوب.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </GuidelineLayout>
  );
}
