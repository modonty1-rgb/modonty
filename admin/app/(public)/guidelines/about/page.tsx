import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GuidelineLayout } from "../components/guideline-layout";
import { ModontyIcon } from "@/components/admin/icons/modonty-icon";
import {
  Sparkles,
  Target,
  Layers,
  Zap,
  Compass,
  Eye,
  TrendingUp,
  ShieldCheck,
  Brain,
  ArrowLeft,
  CheckCircle2,
  Heart,
  Award,
  Users,
  Swords,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";

// ─── ثوابت المؤسس ─────────────────────────────────────────
const founderConstants = [
  {
    icon: Eye,
    title: "حضور لا وعود",
    body: "ما نقول «راح نوصلك للصدارة». نقول «هذا نمو الزوار في GA».",
    color: "blue",
  },
  {
    icon: ShieldCheck,
    title: "الأرقام = الواقع 100%",
    body: "كل رقم في اللوحة قابل للتحقق من Google Analytics + Search Console.",
    color: "emerald",
  },
  {
    icon: TrendingUp,
    title: "20% منتج · 80% سوق",
    body: "التقنية انتهت. الآن المعركة في السوق.",
    color: "violet",
  },
] as const;

// ─── المنتج — 3 طبقات ─────────────────────────────────────
const productLayers = [
  {
    name: "modonty.com",
    role: "المدونة المركزية (Authority Blog)",
    audience: "زوار محتملين على محركات البحث",
    tone: "primary",
  },
  {
    name: "console.modonty.com",
    role: "لوحة العميل المشترك",
    audience: "الشركة المالكة — تنشر · تتابع · تتصل بالـ Leads",
    tone: "violet",
  },
  {
    name: "admin.modonty.com",
    role: "لوحة فريق Modonty",
    audience: "الفريق الداخلي — يدير العملاء، يولّد AI، يضمن الجودة",
    tone: "emerald",
  },
] as const;

const layerColors: Record<string, { border: string; bg: string; text: string }> = {
  primary: { border: "border-primary/30", bg: "bg-primary/[0.04]", text: "text-primary" },
  violet: { border: "border-violet-500/30", bg: "bg-violet-500/[0.04]", text: "text-violet-500" },
  emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/[0.04]", text: "text-emerald-500" },
};

// ─── 4 القوى ──────────────────────────────────────────────
const fourPowers = [
  {
    icon: Target,
    name: "كاشف العميل الجاهز للشراء",
    techName: "Smart Lead Scoring",
    body: "كل زائر يحصل على درجة من 0 إلى 100. تعرف من ينوي الشراء، من يتفرّج فقط.",
  },
  {
    icon: Zap,
    name: "الـ SEO يشتغل بنفسه",
    techName: "SEO Auto-Pilot",
    body: "JSON-LD + Schema + Sitemap + Pre-publish audit — كلها تلقائية. ما تحتاج تفهم.",
  },
  {
    icon: ShieldCheck,
    name: "أدلة الثقة المُدمجة",
    techName: "Social Proof System",
    body: "مراجعات + متابعون + شارة تحقق + E-E-A-T markup. ثقة مرئية لكل زائر.",
  },
  {
    icon: Brain,
    name: "عيون على المنافسين",
    techName: "Competitive Intelligence",
    body: "متابعة المنافسين + Keywords tracking + رصد الفجوات في محتواهم.",
  },
] as const;

// ─── 4 جدران للعميل ─────────────────────────────────────
const fourWalls = [
  "ما عنده وقت يكتب",
  "ما عنده ميزانية يوظّف كاتب أو يدفع لوكالة",
  "ما يفهم في SEO ولا الـ Schema ولا الـ Sitemap",
  "ما يقدر يقيس هل المحتوى ينفع ولا لأ",
] as const;

const colorMap: Record<string, { border: string; bg: string; text: string; iconBg: string }> = {
  primary: { border: "border-primary/30", bg: "bg-primary/[0.04]", text: "text-primary", iconBg: "bg-primary/15" },
  emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/[0.04]", text: "text-emerald-500", iconBg: "bg-emerald-500/15" },
  violet: { border: "border-violet-500/30", bg: "bg-violet-500/[0.04]", text: "text-violet-500", iconBg: "bg-violet-500/15" },
  blue: { border: "border-blue-500/30", bg: "bg-blue-500/[0.04]", text: "text-blue-500", iconBg: "bg-blue-500/15" },
  amber: { border: "border-amber-500/30", bg: "bg-amber-500/[0.04]", text: "text-amber-500", iconBg: "bg-amber-500/15" },
  rose: { border: "border-rose-500/30", bg: "bg-rose-500/[0.04]", text: "text-rose-500", iconBg: "bg-rose-500/15" },
};

export default function AboutModontyPage() {
  return (
    <GuidelineLayout
      title="عن Modonty — مقدمة الفريق"
      description="أول صفحة يقرأها الموظف الجديد — التعريف، الفلسفة، المنتج، إيش نخدم"
    >
      {/* ── Hero — الشعار + Big Idea + التعريف ─────────────────── */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/[0.06] via-background to-background">
        <CardContent className="p-8">
          <div className="rounded-xl bg-background border border-primary/30 shadow-md p-6 mb-6 flex items-center justify-center min-h-[140px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand-assets/logo-dark.svg"
              alt="شعار Modonty"
              className="max-h-24 w-auto block dark:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand-assets/logo-light.svg"
              alt="شعار Modonty"
              className="max-h-24 w-auto hidden dark:block"
            />
          </div>

          <div className="text-center mb-2">
            <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-3">
              الـ Big Idea
            </p>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">«حضور لا وعود»</h2>
            <p className="text-sm md:text-base text-muted-foreground leading-loose max-w-2xl mx-auto">
              منصة سعودية لـ <strong>المحتوى المُنتَج كخدمة</strong> — تخدم الشركات العربية الصغيرة
              والمتوسطة في محركات البحث (Google · Bing · ChatGPT Search · Perplexity)، بدون ما تكتب
              حرف بنفسك.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── التعريف بـ 8 ثواني ──────────────────────────────────── */}
      <Card className="border-amber-500/30 bg-amber-500/[0.04]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-500">احفظها كاملة</Badge>
            <h2 className="text-base font-bold">التعريف بـ 8 ثواني</h2>
          </div>

          <div className="rounded-lg border border-amber-500/30 bg-background/80 p-5">
            <p className="text-base leading-loose font-medium">
              «<strong>Modonty</strong> منصة <strong>سعودية</strong> للمحتوى العربي، <strong>تبني</strong>{" "}
              لشركتك حضور احترافي على محركات البحث (Google · Bing · ChatGPT Search · Perplexity)،{" "}
              <strong>وتعطيك لوحة ذكية</strong> تكشف الزوار اللي قريبين من الشراء — <strong>بدون ما
              تكتب حرف بنفسك</strong>.»
            </p>
          </div>

          <p className="text-xs text-muted-foreground italic mt-4 leading-relaxed text-center">
            💡 احفظها بالحرف. أول جملة تطلقها لأي عميل، في أي موقف.
          </p>
        </CardContent>
      </Card>

      {/* ── القصة — لماذا أُسّست Modonty؟ ─────────────────────── */}
      <Card className="border-rose-500/25 bg-rose-500/[0.03]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-rose-500/15">
              <Compass className="h-4 w-4 text-rose-500" />
            </div>
            <h2 className="text-base font-bold">القصة — لماذا أُسّست Modonty؟</h2>
          </div>

          <p className="text-sm leading-loose mb-4">
            صاحب الشركة الصغيرة-المتوسطة في السعودية ومصر — <strong>يعرف إن المحتوى يجيب عملاء من
            محركات البحث</strong>. لكنه يصطدم بأربع جدران:
          </p>

          <div className="space-y-2.5 mb-5">
            {fourWalls.map((w, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-md border border-rose-500/20 bg-background/60 p-3"
              >
                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed text-foreground/85">{w}</span>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.05] p-5">
            <p className="text-xs font-bold text-emerald-500 mb-2">⚡ الفكرة التي وُلدت من هذي الأزمة</p>
            <p className="text-sm leading-loose">
              منصة سحابية واحدة، تستضيف مدونة احترافية باسم كل شركة، تكتب لها مقالات SEO شهرياً،
              وتعطيها لوحة تكشف الزوار اللي ينوون الشراء —{" "}
              <strong>بسعر يبدأ من صفر، لأنها مبنية بمنطق SaaS، مش بمنطق وكالة</strong>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── ثوابت المؤسس ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-4 w-4 text-violet-500" />
          <h2 className="text-base font-bold">ما نؤمن به — ثلاثة ثوابت</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          هذي الـ 3 جمل = الفلسفة الأساسية. تختلف عن أي منتج تاني في السوق — احفظها واستخدمها.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {founderConstants.map((c, i) => {
            const Icon = c.icon;
            const cm = colorMap[c.color];
            return (
              <Card key={i} className={`${cm.border} ${cm.bg}`}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-2 rounded-lg ${cm.iconBg}`}>
                      <Icon className={`h-4 w-4 ${cm.text}`} />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">0{i + 1}</span>
                  </div>
                  <h3 className={`text-sm font-bold ${cm.text} mb-2`}>{c.title}</h3>
                  <p className="text-xs leading-relaxed text-foreground/80">{c.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── الإطار الثقافي — Hadith ───────────────────────────── */}
      <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.07] via-background to-background">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-emerald-500/15">
              <Sparkles className="h-4 w-4 text-emerald-500" />
            </div>
            <h2 className="text-base font-bold">الإطار الثقافي — كيف نعمل</h2>
          </div>

          <div className="rounded-lg border-2 border-emerald-500/40 bg-background/80 p-6 text-center mb-4">
            <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-3">
              حديث نبوي شريف
            </p>
            <p className="text-xl md:text-2xl font-bold leading-loose text-emerald-700 dark:text-emerald-400 mb-2">
              «المؤمن للمؤمن كالبنيان يشدّ بعضه بعضاً»
            </p>
            <p className="text-[11px] text-muted-foreground italic">
              رواه البخاري · حديث 2446
            </p>
          </div>

          <p className="text-sm leading-loose text-foreground/85">
            هذي القاعدة الفلسفية اللي بُنِيَت عليها Modonty. كل عميل ينضم = طوبة في البنيان. كل مقال
            يُنشر = ملاط يثبّت الطوب. <strong>البنيان كله يكبر مع كل عميل جديد</strong> — وكل عميل يستفيد
            من قوة البنيان كله.
          </p>
        </CardContent>
      </Card>

      {/* ── المنتج — 3 طبقات ───────────────────────────────────── */}
      <Card className="border-primary/25 bg-primary/[0.02]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-primary/15">
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-base font-bold">المنتج — 3 طبقات تشتغل مع بعض</h2>
          </div>

          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            Modonty مش موقع واحد — هي 3 طبقات متكاملة، كل طبقة لجمهور مختلف.
          </p>

          <div className="space-y-3">
            {productLayers.map((layer, i) => {
              const c = layerColors[layer.tone];
              return (
                <div key={i} className={`rounded-lg border ${c.border} ${c.bg} p-4`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <p className={`text-xs font-mono font-bold ${c.text} mb-1`}>{layer.name}</p>
                      <p className="text-sm font-bold mb-1">{layer.role}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{layer.audience}</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-1 rounded bg-background/60 border border-border/40 shrink-0">
                      الطبقة {i + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── القوى الأربع — إيش تسوي Modonty ─────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-amber-500" />
          <h2 className="text-base font-bold">إيش تسوي Modonty؟ — القوى الأربع</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          كل ميزة في Modonty ترجع لواحدة من هذي الـ 4. لو حفظتهم — تقدر تشرح المنتج لأي شخص.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fourPowers.map((p, i) => {
            const Icon = p.icon;
            return (
              <Card key={i} className="border-border bg-background/60 hover:border-primary/30 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground">القوة {i + 1}</span>
                  </div>
                  <h3 className="text-sm font-bold mb-1">{p.name}</h3>
                  <p className="text-[11px] font-mono text-primary mb-2">{p.techName}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── من نخدم؟ ───────────────────────────────────────────── */}
      <Card className="border-blue-500/25 bg-blue-500/[0.03]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-blue-500/15">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <h2 className="text-base font-bold">من نخدم؟</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.04] p-4">
              <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wide mb-2">✓ عميلنا</p>
              <p className="text-sm leading-relaxed">
                صاحب شركة <strong>صغيرة-متوسطة</strong> في السعودية ومصر، يعرف إن المحتوى مهم — بس ما
                عنده وقت، فريق، ولا ميزانية وكالة. <strong>Modonty الحل العملي الوحيد له</strong>.
              </p>
            </div>
            <div className="rounded-lg border border-rose-500/25 bg-rose-500/[0.04] p-4">
              <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wide mb-2">✗ مش عميلنا</p>
              <p className="text-sm leading-relaxed">
                شركة كبرى عندها فريق تسويق + ميزانية مفتوحة. هؤلاء يحتاجون منصات enterprise —{" "}
                <strong>وقتنا أهم من جمع leads ضائعة</strong>.
              </p>
            </div>
          </div>

          <Link
            href="/guidelines/icps"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-500 hover:underline"
          >
            دراسة الـ 7 شرائح الكاملة بالأرقام والمصادر
            <ArrowLeft className="h-3 w-3" />
          </Link>
        </CardContent>
      </Card>

      {/* ── Knowledge Hub Map — الخطوة التالية ────────────────── */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/[0.05] via-background to-background">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-primary/15">
              <Compass className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-base font-bold">الخطوة التالية — اختر مسارك</h2>
          </div>

          <p className="text-sm leading-relaxed mb-4">
            بعد ما قرأت هذي الصفحة، عندك تصور كامل عن <strong>ما هي Modonty + فلسفتها + المنتج</strong>.
            للتعمّق، اختر الصفحة المناسبة لدورك:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {[
              { href: "/guidelines/positioning", icon: Swords, label: "Modonty vs المنافسون", desc: "الفرق + السقف", color: "rose" },
              { href: "/guidelines/golden-rules", icon: Award, label: "القواعد الذهبية الـ 22", desc: "احفظها · اقرأها صباحاً", color: "amber" },
              { href: "/guidelines/brand", icon: Sparkles, label: "البراند", desc: "الهوية البصرية + الصوت", color: "violet" },
              { href: "/guidelines/icps", icon: Users, label: "العملاء المثاليون", desc: "7 ICPs + Egypt-Gulf + 20 مصدر", color: "blue" },
              { href: "/guidelines/sales-playbook", icon: Target, label: "دليل المبيعات", desc: "3 سكريبتات + 5 اعتراضات + ROI", color: "emerald" },
              { href: "/guidelines/marketing-strategy", icon: TrendingUp, label: "استراتيجية التسويق", desc: "Big Idea + 5 رسائل + قنوات", color: "primary" },
              { href: "/guidelines/team-onboarding", icon: Lightbulb, label: "تأهيل الفريق", desc: "3 مراحل + 4 أدوار", color: "amber" },
              { href: "/guidelines/articles", icon: CheckCircle2, label: "إنشاء المقالات", desc: "3 مراحل · من الإعداد للنشر", color: "emerald" },
            ].map((link, i) => {
              const Icon = link.icon;
              const c = colorMap[link.color];
              return (
                <Link
                  key={i}
                  href={link.href}
                  className={`flex items-center justify-between gap-3 rounded-md border ${c.border} ${c.bg} p-3 hover:opacity-90 transition-opacity`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${c.text} shrink-0`} />
                    <div>
                      <p className="text-xs font-bold mb-0.5">{link.label}</p>
                      <p className="text-[10px] text-muted-foreground">{link.desc}</p>
                    </div>
                  </div>
                  <ArrowLeft className={`h-3.5 w-3.5 ${c.text} shrink-0`} />
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── الخلاصة الكبرى ───────────────────────────────────── */}
      <Card className="border-2 border-primary/40 bg-gradient-to-br from-primary/[0.07] via-violet-500/[0.05] to-emerald-500/[0.04]">
        <CardContent className="p-7 text-center">
          <Brain className="h-8 w-8 text-primary mx-auto mb-4" />
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">الخلاصة</p>
          <p className="text-base md:text-lg leading-loose font-semibold max-w-3xl mx-auto">
            Modonty <strong>منصة سعودية</strong> تشغّل لشركتك نظام محتوى احترافي على محركات البحث —{" "}
            <strong>بدون فريق + بدون تكلفة وكالة + بأرقام قابلة للتحقق</strong>.
          </p>
          <p className="text-sm text-muted-foreground italic mt-4 leading-relaxed">
            «حضور لا وعود» — هذي ليست شعار، هذي طريقة عمل.
          </p>
        </CardContent>
      </Card>
    </GuidelineLayout>
  );
}
