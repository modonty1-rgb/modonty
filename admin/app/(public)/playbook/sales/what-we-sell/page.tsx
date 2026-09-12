"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModontyPartnerMark } from "@modonty/shared/components/icons/modonty-partner-mark";
import { DocLayout } from "@/app/(public)/components/doc-layout";
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
  FileCheck2,
  LayoutPanelTop,
  SearchCheck,
} from "lucide-react";

/**
 * دفتر الوعود — نُقل من الصفحة الرئيسية `/playbook` في ١٢ سبتمبر ٢٠٢٦ بقرار خالد.
 *
 * كان يجلس تحت سؤال «ما هي مدونتي؟» وهو لا يجيب عنه: يصف ما نقدّمه للشريك، وهذا
 * سؤال بيعيّ مكانه هنا. وكان مطويّاً خلف «اقرأ التفاصيل» فبقيت بنوده الواحد والعشرون
 * غير مقروءة — وهي ما يُقال للعميل بالضبط. فتُعرض هنا مفتوحةً بلا طيّ.
 *
 * وسقطت معه مصفوفة الشارات الستّ (ميزة منصّة · فريق · قرار شريك …): كانت تُقرأ قبل أي
 * محتوى ولا تنفع إلا من يحفظها. من ينفّذ البند صار مكتوباً بالعربية تحت عنوانه.
 */
const promiseGroups = [
  {
    title: "التوثيق قبل الظهور",
    who: "الشريك يقدّم · ونحن نراجع",
    summary: "لا تدخل جهة إلى مدونتي قبل أن تثبت أنها حقيقية.",
    icon: ShieldCheck,
    items: [
      "يقدّم الشريك مستنداته الرسمية: السجل التجاري والملف الضريبي وما تتطلبه طبيعة نشاطه وبلده.",
      "نراجع البيانات الأساسية قبل الاعتماد والعرض؛ لا نضيف شركة لمجرد أنها دفعت.",
      "الوثائق تنعكس على صفحة الشريك كجدار ثقة يراه الزائر، لا كملف مخزّن عندنا فقط.",
      "التوثيق لا يعني ضماننا للخدمة. الزائر يبقى مسؤولًا عن مراجعة شروط ما يشتريه، ونقول ذلك صراحة.",
    ],
  },
  {
    title: "صفحة الشريك داخل مدونتي",
    who: "المنصّة تبنيها · والشريك يضبطها",
    summary: "صفحة رسمية على modonty.com/clients، لا موقع مستقل نبنيه له.",
    icon: LayoutPanelTop,
    items: [
      "عنوان الصفحة هو modonty.com/clients/اسم-الشريك. نحن لا نشتري له نطاقًا ولا نبني موقعًا خارج مدونتي.",
      "تحت العنوان نفسه تسع صفحات: الرئيسية، من نحن، خدماتنا، ألبوم أعمالنا، الأسئلة الشائعة، تواصل معنا، مقالاتي، احجز، آراء العملاء.",
      "من شاشة «موقعي» في الكونسول يختار الشريك لون صفحته وشريطها العلوي وذيلها، ويطفئ أي قسم لا يريده.",
      "يرى معاينة كمبيوتر وجوال قبل الحفظ، فلا يُنشر اختيار لم يره.",
      "بيانات الصفحة ليست شكلًا: تدخل في السيو وبيانات الجهة المنظّمة وطريقة ظهورها في البحث.",
      "إن كان للشريك موقعه الخاص، تبقى هناك قناة اختيارية يسحب بها مقالاته من مدونتي بحسب باقته وإذنه. هذه إضافة، لا أساس الخدمة.",
    ],
  },
  {
    title: "محتوى مقروء ومسموع ومرئي",
    who: "فريق مدونتي ينتج · والمنصّة تعتمد",
    summary: "خبرة الشريك تتحول إلى محتوى يجيب عن سؤال حقيقي، بأكثر من صيغة.",
    icon: FileCheck2,
    items: [
      "يخطّط فريقنا ويكتب ويراجع وينشر باسم الشريك، بعد أن يزوّدنا بحقيقة خدمته.",
      "المقال ليس الصيغة الوحيدة: هناك ريلز ومرئيات وصوتيات، وكلها تُنسب للشريك وترتبط بمحتواه.",
      "التصميم والمونتاج تنفيذ بشري من فريقنا، أما الرفع والاعتماد والنشر فداخل المنظومة.",
      "لا يُعتمد ريل أو مادة ناقصة العنوان أو الوصف أو الغلاف؛ هذا يحمي تجربة الزائر وبيانات البحث.",
      "يُبنى محتوى كل شريك كمنظومة مترابطة: المقال يدعم الفيديو يدعم الدليل، فيفهم محرّك البحث تخصص الجهة أوضح.",
    ],
  },
  {
    title: "سيو كامل لا بندًا واحدًا",
    who: "المنصّة تفحص · والفريق ينفّذ الخارجي",
    summary: "ما في الصفحة وما تحتها وما خارجها، في عملية واحدة.",
    icon: SearchCheck,
    items: [
      "ما في الصفحة: العنوان والوصف والرابط والعناوين الفرعية والكلمات المفتاحية والأسئلة والمصادر والروابط الداخلية والصورة الرئيسية، مع فحص قبل النشر.",
      "ما تحتها: الرابط المعياري والبيانات الوصفية والبيانات المنظّمة وخريطة الموقع وملف الروبوتس، تُدار وتُفحص من المنظومة بدل عمل يدوي متناثر.",
      "فحص الجودة يراجع المحتوى والوسائط والبيانات المنظمة والخبرة والمصداقية، ويعرض الأخطاء قبل خروج المقال.",
      "ما خارجها: السلطة والتوزيع والإشارات والمصادر. المنصة ترشد وتفحص، والتنفيذ الخارجي عمل الفريق — ولم نبدأه بعد.",
      "نتابع أدوات مالكي المواقع والفهرسة وصحة خريطة الموقع، وننبّه القنوات المدعومة عند كل رابط جديد.",
      "سيو الصور يشمل الصورة الرئيسية والنص البديل والوصف والعنوان واسم الملف، ويحدّث البيانات عند أي تغيير.",
    ],
  },
] as const;

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
  { icon: TrendingUp, title: "حضور رقمي على دومين موثوق", description: "تستفيد من authority مدونتي المبني مسبقاً — لا تنتظر 1-3 سنوات لبناء سمعة موقع جديد" },
  { icon: Network, title: "تكامل تقني كامل", description: "GBP + GTM + GA4 + Schema.org + sameAs — مدمج وجاهز بدون تدخل تقني منك" },
  { icon: ShieldCheck, title: "Local SEO للسعودية والخليج", description: "CR Number + VAT + National Address + GeoCoordinates — عناصر معتمدة لظهور محلي قوي" },
] as const;

// ─── 13 صفحة في console (ما يستخدمه العميل) ────────────────────
const consolePages = [
  { icon: Building2, title: "بيانات شركتك (Profile)", value: "تحدّث معلومات الشركة، الشعار، الغلاف، الروابط الاجتماعية — تظهر فوراً على صفحتك في مدونتي" },
  { icon: Sparkles, title: "معلومات نشاطك (Intake)", value: "نبرة الكتابة، الجمهور المستهدف، أهدافك، سياسة المحتوى — كل مقال يُكتب وفق رؤيتك" },
  { icon: Newspaper, title: "المقالات", value: "تستلم المقالات في حالة DRAFT · تراجعها · تعتمدها أو تطلب تعديلات بضغطة زر" },
  { icon: PenLine, title: "نشاط المحتوى", value: "إحصائيات شاملة: مقالات منشورة، quota متبقية، أحدث المقالات، رابط مباشر للمعاينة" },
  { icon: ImageIcon, title: "الصور والملفات (Media)", value: "كل صورة استُخدمت في مقالاتك في مكتبة منظمة — استعرض، فلتر، حمّل" },
  { icon: Megaphone, title: "الحملات (Campaigns)", value: "حملات بريدية لجمهورك (قريباً) — يظهر اهتمام مسجَّل لدى مدونتي للمتابعة" },
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
    description: "صفحتك على مدونتي + sameAs المتعدد + Organization schema = مدخل لـ Google Knowledge Graph (يظهر AI Mode + Knowledge Panel)",
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
    <DocLayout
      parentHref="/playbook"
      parentLabel="دليل الفريق"
      title="ما يحصل عليه العميل"
      description="ما تشمله الباقة، ورحلة العميل عبر أسطح مدونتي، والأدوات التي يستعملها في الكونسول."
    >

      {/* ── HERO: ما يحصل عليه العميل ─────────────────────────── */}
      <Card className="border-primary/30 bg-primary/[0.04] overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-lg bg-primary/15 border border-primary/30">
              <ModontyPartnerMark className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">باقة العميل — كل شيء في مكان واحد</h2>
              <p className="text-sm text-muted-foreground mt-1">بدل أن يبني فريق محتوى وموقعًا وسيو وتحليلات، يجدها كلها في باقة واحدة.</p>
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
            هذا ما يراه الزوار حين يبحثون عن العميل في جوجل ويصلون لصفحته على مدونتي:
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
            هذا ما يميّز مدونتي عن "موقع وردبريس عادي" — تكامل مدمج جاهز يُكتب تلقائياً بدون تدخل تقني:
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

      {/* ── الميزة الفنية الكبرى: Publisher Authority Transfer ─────────────── */}
      <Card className="border-violet-500/30 bg-violet-500/[0.04]">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-violet-500/15 border border-violet-500/30 shrink-0">
              <ShieldCheck className="h-5 w-5 text-violet-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h3 className="text-base font-bold text-violet-400">🚀 كل مقال = authority للعميل في Google (ميزة Schema.org)</h3>
                <Badge variant="outline" className="border-violet-500/40 text-violet-300 bg-violet-500/10 text-[10px]">
                  SEO ميزة قوية
                </Badge>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed mb-3">
                مع كل مقال يُنشر، Google يقرأ في JSON-LD أن <strong>الـ publisher = العميل نفسه</strong> (مش مدونتي).
                هذا يبني <strong>domain authority للعميل تلقائياً</strong> مع مرور الوقت — وهي ميزة فنية لا توفّرها مدوّنات WordPress العادية.
              </p>
              <div className="rounded-lg border border-violet-500/30 bg-background/50 p-3 mb-3 font-mono text-[11px] leading-relaxed">
                <div className="text-muted-foreground mb-1">{"// مثال JSON-LD لمقال على modonty.com"}</div>
                <div>{"\"publisher\": {"}</div>
                <div className="ps-3">{"\"@type\": \"Organization\","}</div>
                <div className="ps-3">{"\"@id\": \"https://modonty.com/clients/كيما-زون#organization\","}</div>
                <div className="ps-3">{"\"name\": \"كيما زون\","}<span className="text-violet-300 ms-1">{"// ← اسم العميل، مش مدونتي"}</span></div>
                <div className="ps-3">{"\"logo\": { \"width\": 200, \"height\": 205, ... }"}</div>
                <div>{"}"}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Google يربط كل مقال بالعميل</strong> — يبني domain authority للعميل، مش لمدونتي فقط</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Brand awareness في نتائج البحث</strong> — اسم العميل + شعاره يظهران في rich results</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">E-E-A-T signal تراكمي</strong> — كل مقال يقوّي مصداقية العميل في عيون Google</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">صفر شغل تقني للعميل</strong> — JSON-LD يُولَّد تلقائياً مع كل مقال</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mt-3 pt-3 border-t border-violet-500/20">
                💡 <strong>للسيلز:</strong> عندما يسأل العميل "ليش أكتب على مدونتي بدل موقعي؟" — الإجابة: <em>"مدونتي تعطيك authority + traffic + Google يربط المقال باسم شركتك مش باسمنا. مع 24 مقال في السنة، كل مقال = brick في authority شركتك على Google."</em>
              </p>
            </div>
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
                  <span>"مدونتي تعطيك authority جاهز + فريق متخصص + 13 أداة في console"</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>"كل مقال يُعتمد منك — أنت السيد على المحتوى، ومدونتي تنفّذ"</span>
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

      {/* ── دفتر الوعود: تفصيل ما نقدّمه، مفتوحًا ─────────────── */}
      <section id="promises" className="scroll-mt-6">
        <div className="mb-3">
          <h2 className="text-lg font-bold">دفتر الوعود — ما نقدّمه بالتفصيل</h2>
          <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
            هذه البنود هي ما يجوز قوله للعميل. ما ليس هنا لا يُوعد به.
          </p>
        </div>

        <div className="grid gap-3 xl:grid-cols-2">
          {promiseGroups.map((group) => {
            const Icon = group.icon;
            return (
              <Card key={group.title} className="bg-card">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-bold leading-5">{group.title}</h3>
                      <p className="text-[11.5px] font-bold text-muted-foreground">{group.who}</p>
                    </div>
                  </div>
                  <p className="mt-2.5 text-[13px] leading-6 text-muted-foreground">{group.summary}</p>
                  <ul className="mt-3 space-y-2 border-t pt-3">
                    {group.items.map((item) => (
                      <li key={item} className="flex gap-2 text-[13px] leading-6 text-foreground/85">
                        <CheckCircle2 className="mt-1.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

    </DocLayout>
  );
}
