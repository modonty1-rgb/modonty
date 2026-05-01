"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GuidelineLayout } from "../components/guideline-layout";
import {
  Building2,
  CheckCircle2,
  Search,
  Zap,
  MapPin,
  Share2,
  FileText,
  Newspaper,
  Image as ImageIcon,
  Users,
  Target,
  HelpCircle,
  MessageSquare,
  Activity,
  Settings,
  Mail,
  Megaphone,
  PenLine,
  ShieldCheck,
  TrendingUp,
  Globe,
  Sparkles,
  Network,
  ArrowLeft,
} from "lucide-react";

// ─── الباقات ─────────────────────────────────────────────────────
const tiers = [
  { name: "BASIC", arabic: "أساسي", articles: 2, color: "blue", popular: false },
  { name: "STANDARD", arabic: "قياسي", articles: 4, color: "emerald", popular: false },
  { name: "PRO", arabic: "احترافي", articles: 8, color: "violet", popular: true },
  { name: "PREMIUM", arabic: "بريميوم", articles: 12, color: "amber", popular: false },
] as const;

// ─── ما يحصل عليه العميل (Hero offer) ──────────────────────────
const heroOffer = [
  { icon: Globe, title: "صفحة عميل احترافية على modonty.com", description: "صفحة كاملة بـ 8 تبويبات (حول · تواصل · صور · متابعون · تقييمات · ريلز · إعجابات) مع Schema.org Organization markup كامل" },
  { icon: Newspaper, title: "محتوى إعلامي شهري بأسماء العميل", description: "2 إلى 12 مقال شهرياً (حسب الباقة) — مكتوب · محرَّر · مُحسَّن SEO 100% · معتمد منك قبل النشر" },
  { icon: Settings, title: "لوحة تحكم خاصة (console.modonty.com)", description: "13 صفحة لإدارة كل شيء — اعتماد المقالات، تتبع الأداء، إدارة المشتركين، مراجعة التقييمات" },
  { icon: TrendingUp, title: "حضور رقمي على دومين موثوق", description: "تستفيد من authority مودونتي المبني مسبقاً — لا تنتظر 1-3 سنوات لبناء سمعة موقع جديد" },
  { icon: Network, title: "تكامل تقني كامل", description: "GBP + GTM + GA4 + Schema.org + sameAs — مدمج وجاهز بدون تدخل تقني منك" },
  { icon: ShieldCheck, title: "Local SEO للسعودية والخليج", description: "CR Number + VAT + National Address + GeoCoordinates — عناصر معتمدة لظهور محلي قوي" },
] as const;

// ─── 13 صفحة في console (ما يستخدمه العميل) ────────────────────
const consolePages = [
  { icon: Building2, title: "بيانات شركتك (Profile)", value: "تحدّث معلومات الشركة، الشعار، الغلاف، الروابط الاجتماعية — تظهر فوراً على صفحتك في مودونتي" },
  { icon: Sparkles, title: "معلومات نشاطك (Intake)", value: "نبرة الكتابة، الجمهور المستهدف، أهدافك، سياسة المحتوى — كل مقال يُكتب وفق رؤيتك" },
  { icon: Newspaper, title: "المقالات", value: "تستلم المقالات في حالة DRAFT · تراجعها · تعتمدها أو تطلب تعديلات بضغطة زر" },
  { icon: PenLine, title: "نشاط المحتوى", value: "إحصائيات شاملة: مقالات منشورة، quota متبقية، أحدث المقالات، رابط مباشر للمعاينة" },
  { icon: ImageIcon, title: "الصور والملفات (Media)", value: "كل صورة استُخدمت في مقالاتك في مكتبة منظمة — استعرض، فلتر، حمّل" },
  { icon: Megaphone, title: "الحملات (Campaigns)", value: "حملات بريدية لجمهورك (قريباً) — يظهر اهتمام مسجَّل لدى مودونتي للمتابعة" },
  { icon: Mail, title: "مشتركو النشرة (Subscribers)", value: "كل من اشترك في نشرتك مع موافقاتهم — قابل للتصدير CSV ومتوافق مع الخصوصية" },
  { icon: Target, title: "العملاء المحتملون (Leads)", value: "Lead scoring تلقائي يصنّف الزوار حسب اهتمامهم — يحدّد مَن يستحق التواصل العاجل" },
  { icon: HelpCircle, title: "الأسئلة الشائعة (FAQs)", value: "أسئلة وصلت من زوار مقالاتك (chatbot/users) — اعتمدها لتظهر كـ Rich Result في جوجل" },
  { icon: MessageSquare, title: "آراء حول الشركة", value: "زوار يكتبون مراجعات — تراجعها وتعتمدها قبل ظهورها على صفحتك العامة" },
  { icon: Activity, title: "صحة الموقع (Site Health)", value: "تحليل أداء صفحتك على modonty.com — Google PageSpeed + روابط + SEO checks" },
  { icon: Settings, title: "الإعدادات", value: "كلمة سر، تفضيلات الإشعارات، ربط Telegram لاستقبال تنبيهات في الوقت الفعلي" },
  { icon: MessageSquare, title: "الدعم (Support)", value: "رسائل التواصل من زوار صفحتك — رد عليها مباشرة من اللوحة" },
] as const;

// ─── 8 تبويبات في الصفحة العامة ────────────────────────────────
const publicTabs = [
  "الكل (نظرة شاملة)",
  "حول (about — قصة الشركة)",
  "تواصل (إيميل + هاتف + خريطة)",
  "الصور (gallery)",
  "المتابعون (followers)",
  "التقييمات (reviews)",
  "الريلز (shorts)",
  "الإعجابات (likes)",
] as const;

// ─── رحلة العميل عبر 3 أسطح ────────────────────────────────────
const journey = [
  {
    step: "١",
    actor: "👤 الأدمن",
    location: "admin.modonty.com",
    color: "blue",
    title: "إعداد العميل + كتابة المقال",
    description: "الفريق يضيف العميل، يُعيّن الباقة، يكتب المقال بناءً على intake العميل، ثم يحفظه كـ DRAFT",
  },
  {
    step: "٢",
    actor: "🤝 العميل",
    location: "console.modonty.com",
    color: "violet",
    title: "اعتماد المقال أو طلب تعديلات",
    description: "العميل يدخل console، يراجع المقال في حالة DRAFT، ثم: ✅ يعتمد → ✗ يطلب تعديلات بملاحظات",
  },
  {
    step: "٣",
    actor: "👤 الأدمن",
    location: "admin.modonty.com",
    color: "blue",
    title: "النشر النهائي",
    description: "بعد الاعتماد، الأدمن ينشر فوراً (PUBLISHED) أو يجدول لتاريخ محدد (SCHEDULED)",
  },
  {
    step: "٤",
    actor: "🌐 الزوار",
    location: "modonty.com/clients/[slug]",
    color: "emerald",
    title: "الظهور للجمهور",
    description: "المقال يظهر على صفحة العميل العامة + يفهرس في جوجل + يدخل في sitemap. الزوار يتفاعلون (متابعة، تعليق، مشاركة)",
  },
  {
    step: "٥",
    actor: "🤝 العميل",
    location: "console.modonty.com",
    color: "violet",
    title: "متابعة الأداء",
    description: "العميل يرى الإحصائيات الحية في console: مشاهدات، تفاعل، مشتركون، leads — يقرّر استراتيجية المحتوى التالي",
  },
] as const;

// ─── التكامل التقني (للعملاء التقنيين) ─────────────────────────
const integrations = [
  {
    icon: Search,
    name: "Google Business Profile (GBP)",
    description: "نربط حساب GBP الخاص بك — Place ID، فئة الأعمال، صور — يستفيد من Local SEO القوي",
  },
  {
    icon: Zap,
    name: "Google Tag Manager (GTM)",
    description: "GTM ID مخصص لتتبع events حملات + conversions — تستلم البيانات في حساب GA4 الخاص بك",
  },
  {
    icon: TrendingUp,
    name: "Google Analytics 4 (GA4)",
    description: "GA4 Property ID + Measurement ID — كل حركة على صفحتك تذهب لتحليلاتك",
  },
  {
    icon: Share2,
    name: "Schema.org Organization",
    description: "JSON-LD مولّد تلقائياً يحتوي: name + logo + sameAs (روابط social) + foundingDate + contactPoint + address",
  },
  {
    icon: MapPin,
    name: "Local SEO (السعودية/الخليج)",
    description: "CR Number + VAT ID + National Address (رقم مبنى + حي + رقم إضافي) + GeoCoordinates للظهور المحلي القوي",
  },
  {
    icon: Building2,
    name: "Knowledge Graph entity",
    description: "صفحتك على مودونتي + sameAs المتعدد + Organization schema = مدخل لـ Google Knowledge Graph (يظهر AI Mode + Knowledge Panel)",
  },
] as const;

export default function ClientsGuidelinesPage() {
  const colorMap: Record<string, { border: string; bg: string; text: string; iconBg: string }> = {
    blue: { border: "border-blue-500/30", bg: "bg-blue-500/[0.05]", text: "text-blue-400", iconBg: "bg-blue-500/15" },
    violet: { border: "border-violet-500/30", bg: "bg-violet-500/[0.05]", text: "text-violet-400", iconBg: "bg-violet-500/15" },
    emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/[0.05]", text: "text-emerald-400", iconBg: "bg-emerald-500/15" },
    amber: { border: "border-amber-500/30", bg: "bg-amber-500/[0.05]", text: "text-amber-400", iconBg: "bg-amber-500/15" },
  };

  return (
    <GuidelineLayout
      title="العملاء — Clients"
      description="ما يحصل عليه العميل في باقة مودونتي · رحلته عبر 3 أسطح · ما يستخدمه في console"
    >

      {/* ── HERO: ما يحصل عليه العميل ─────────────────────────── */}
      <Card className="border-primary/30 bg-primary/[0.04] overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-lg bg-primary/15 border border-primary/30">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">باقة العميل — كل شيء في مكان واحد</h2>
              <p className="text-sm text-muted-foreground mt-1">بدلاً من بناء فريق محتوى + موقع + SEO + analytics — مودونتي تقدم الكل في باقة واحدة</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {heroOffer.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-lg border border-border/50 bg-background/60 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-sm font-bold leading-tight">{item.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── الباقات الـ 4 ─────────────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h2 className="text-base font-bold">الباقات الـ 4 — كم مقال شهرياً؟</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tiers.map((tier) => {
              const c = colorMap[tier.color];
              return (
                <div key={tier.name} className={`relative rounded-xl border-2 ${c.border} ${c.bg} p-4 text-center`}>
                  {tier.popular && (
                    <Badge className="absolute -top-2 start-1/2 -translate-x-1/2 bg-amber-500 text-amber-50 text-[10px]">الأشهر</Badge>
                  )}
                  <p className={`text-xs font-mono font-bold ${c.text}`}>{tier.name}</p>
                  <p className="text-base font-bold mt-1">{tier.arabic}</p>
                  <div className="mt-3 pt-3 border-t border-border/40">
                    <p className="text-3xl font-bold">{tier.articles}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">مقال / شهر</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
            💬 الأسعار تُعرض على العميل خلال محادثة Sales · تواصل مع فريق المبيعات للتفاصيل
          </p>
        </CardContent>
      </Card>

      {/* ── رحلة العميل عبر 3 أسطح ────────────────────────────── */}
      <Card>
        <CardContent className="p-0">
          <div className="px-6 py-5 border-b border-border/40 bg-gradient-to-b from-background to-muted/20">
            <h2 className="text-lg font-bold">رحلة العميل — 5 خطوات عبر 3 أسطح</h2>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              من إضافة العميل في الأدمن إلى ظهور المقال للزوار + متابعة الأداء — كل خطوة عند مَن وفي أي تطبيق
            </p>
          </div>
          <div className="p-6 space-y-4">
            {journey.map((step, idx) => {
              const c = colorMap[step.color];
              const isLast = idx === journey.length - 1;
              return (
                <div key={step.step} className="relative">
                  {!isLast && (
                    <div className={`absolute end-7 top-16 bottom-[-16px] w-px ${c.border.replace("border-", "bg-")}`} aria-hidden />
                  )}
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 w-14 h-14 rounded-full ${c.iconBg} ring-4 ${c.border.replace("border-", "ring-")} flex items-center justify-center font-bold relative z-10`}>
                      <span className={`text-2xl ${c.text} leading-none`}>{step.step}</span>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs font-semibold ${c.text}`}>{step.actor}</span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <code className={`text-[11px] ${c.bg} border ${c.border} rounded px-1.5 py-0.5`}>{step.location}</code>
                      </div>
                      <h3 className="text-base font-bold leading-tight">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-1.5">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── ما يستخدمه العميل في console (13 صفحة) ────────────── */}
      <Card className="border-violet-500/25 bg-violet-500/[0.03]">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-4 w-4 text-violet-400" />
            <h2 className="text-base font-bold text-violet-400">console.modonty.com — 13 صفحة في يد العميل</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            🎯 <strong className="text-foreground">للسيلز:</strong> حين تتكلم عن "console" مع العميل، هذي القيمة الفعلية اللي حياخذها — مش مجرد لوحة تحكم، 13 أداة متكاملة:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {consolePages.map((page) => {
              const Icon = page.icon;
              return (
                <div key={page.title} className="rounded-lg border border-violet-500/20 bg-background/60 p-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                    <h3 className="text-sm font-bold leading-tight">{page.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed ps-5">{page.value}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── الصفحة العامة على modonty.com ─────────────────────── */}
      <Card className="border-emerald-500/25 bg-emerald-500/[0.03]">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-4 w-4 text-emerald-400" />
            <h2 className="text-base font-bold text-emerald-400">صفحة العميل العامة — 8 تبويبات على modonty.com</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            هذا ما يراه الزوار حين يبحثون عن العميل في جوجل ويصلون لصفحته على مودونتي:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {publicTabs.map((tab, i) => (
              <div key={tab} className="rounded-lg border border-emerald-500/20 bg-background/60 px-3 py-2 flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">{i + 1}</span>
                <span className="text-xs leading-tight">{tab}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              ✦ كل صفحة عميل لها <code className="text-[11px] bg-background/60 border border-border rounded px-1 py-0.5">URL واضح: modonty.com/clients/[اسم-العميل]</code> + Schema.org Organization markup كامل + Open Graph للمشاركة على السوشال
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── التكامل التقني ─────────────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Network className="h-4 w-4 text-foreground" />
            <h2 className="text-base font-bold">التكامل التقني — 6 أنظمة مدمجة تلقائياً</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            هذا ما يميّز مودونتي عن "موقع وردبريس عادي" — تكامل مدمج جاهز يُكتب تلقائياً بدون تدخل تقني:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {integrations.map((int) => {
              const Icon = int.icon;
              return (
                <div key={int.name} className="rounded-lg border border-border/50 bg-card p-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-foreground shrink-0" />
                    <h3 className="text-sm font-bold leading-tight">{int.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed ps-5">{int.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── ملاحظة للسيلز ─────────────────────────────────────── */}
      <Card className="border-amber-500/30 bg-amber-500/[0.04]">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 shrink-0">
              <Users className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-amber-400">🎯 للسيلز — كيف تتكلم مع العميل</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                حين تشرح للعميل، ركّز على <strong className="text-foreground">القيمة المتراكمة</strong>:
              </p>
              <ul className="space-y-1.5 mt-3 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>"لو بنيت كل هذا بنفسك، تحتاج 3-5 أشخاص + 1-3 سنوات لبناء authority"</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>"مودونتي تعطيك authority جاهز + فريق متخصص + 13 أداة في console"</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>"كل مقال يُعتمد منك — أنت السيد على المحتوى، ومودونتي تنفّذ"</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>"التكامل التقني تلقائي — ما تحتاج developer ولا SEO specialist"</span>
                </li>
              </ul>
              <div className="mt-4 flex items-center gap-2 text-xs">
                <ArrowLeft className="h-3.5 w-3.5 text-amber-400 rtl:rotate-180" />
                <span className="text-amber-200">للأسعار + خطة Sales الكاملة → Task منفصل (قيد التحضير)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </GuidelineLayout>
  );
}
