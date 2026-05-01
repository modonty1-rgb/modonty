"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GuidelineLayout } from "../components/guideline-layout";
import {
  CheckCircle2,
  XCircle,
  FileText,
  Pen,
  PenLine,
  Search,
  Zap,
  Clock,
  CircleHelp,
  Link2,
  Hash,
  AlignLeft,
  ShieldCheck,
} from "lucide-react";

// ─── SEO writing rules (collapsible) ─────────────────────────────────────────
const seoWritingRules = [
  {
    icon: Hash,
    title: "الخطوة 1 — Basic: العنوان والملخص والرابط",
    color: "text-emerald-400",
    rules: [
      {
        label: "Title — عنوان المقال",
        do: "بين 50 و 60 حرف — ضع الكلمة المفتاحية في بداية العنوان. النظام يعرض عداد الحروف مباشرة",
        dont: "لا تكتب عنواناً عاماً مثل «مقال جديد» — ولا تكرر نفس العنوان في مقالين",
      },
      {
        label: "Excerpt — ملخص المقال",
        do: "بين 140 و 160 حرف — هذا الملخص يظهر في بطاقات المقالات وقوائم التصفح على الموقع",
        dont: "لا تتركه فارغاً — الملخص الفارغ يُعرض اسم العميل فقط",
      },
      {
        label: "Slug — رابط المقال",
        do: "يتولّد تلقائياً — راجعه وتأكد أنه بالإنجليزي وبه كلمات مفتاحية",
        dont: "لا تواريخ، لا أرقام عشوائية، لا عربي في الرابط",
      },
    ],
  },
  {
    icon: AlignLeft,
    title: "الخطوة 2 — Content: المحتوى",
    color: "text-violet-400",
    rules: [
      {
        label: "العناوين الفرعية H2 و H3",
        do: "استخدم أزرار H2 و H3 في شريط المحرر — قسّم المقال بعناوين واضحة، ضع كلمات مفتاحية فيها",
        dont: "لا تكتب المقال كتلة نص واحدة بدون عناوين — يضر بالقراءة وبـ SEO",
      },
      {
        label: "الكلمة المفتاحية في المحتوى",
        do: "الكلمة المفتاحية تظهر في أول 100 كلمة وتتكرر بشكل طبيعي وفي السياق — بدون نسبة مئوية محددة",
        dont: "لا تكررها بشكل مصطنع — جوجل يعاقب على حشو الكلمات المفتاحية ولا يعترف بمفهوم «نسبة الكثافة»",
      },
      {
        label: "طول المقال",
        do: "800 كلمة حد أدنى — 1500+ للمواضيع التنافسية. فقرات قصيرة 3-5 أسطر",
        dont: "المقالات أقل من 500 كلمة نادراً تظهر في الصفحة الأولى",
      },
    ],
  },
  {
    icon: Search,
    title: "الخطوة 3 — SEO: حقول محركات البحث",
    color: "text-blue-400",
    rules: [
      {
        label: "SEO Title — عنوان جوجل",
        do: "50 إلى 60 حرف — هذا هو العنوان الذي يظهر في نتائج جوجل. يختلف عن عنوان المقال",
        dont: "لا تتركه فارغاً — جوجل يستخدم عنوان المقال بدلاً منه وقد لا يكون مثالياً",
      },
      {
        label: "SEO Description — وصف جوجل",
        do: "140 إلى 160 حرف — هذا هو الوصف الذي يظهر تحت الرابط في جوجل. جملة تشويقية تدفع للنقر",
        dont: "لا تنسخ الـ Excerpt هنا مباشرة — اكتب جملة مخصصة لجوجل تحتوي الكلمة المفتاحية",
      },
      {
        label: "SEO Keywords — الكلمات المفتاحية",
        do: "أضف الكلمة المفتاحية الرئيسية أولاً ثم كلمات ثانوية مرتبطة — مثال: «تسويق المحتوى», «كتابة مقالات SEO»",
        dont: "لا تضع عشرات الكلمات غير المرتبطة — 3 إلى 5 كلمات مفتاحية محددة أفضل من 20 عامة",
      },
    ],
  },
  {
    icon: Link2,
    title: "الروابط والصور",
    color: "text-amber-400",
    rules: [
      {
        label: "الروابط الداخلية",
        do: "استخدم زر الرابط 🔗 في المحرر لإضافة 2-3 روابط لمقالات أخرى داخل نفس الموقع",
        dont: "لا تنشر مقالاً بدون أي رابط داخلي — يضعف بنية الموقع ويقلل وقت القراءة",
      },
      {
        label: "Alt Text للصور",
        do: "عند إضافة صورة من زر 🖼️ في المحرر — اكتب وصفاً حقيقياً للصورة يتضمن الكلمة المفتاحية",
        dont: "لا تترك Alt Text فارغاً ولا تكتب «صورة» — جوجل يقرأ الـ Alt Text لفهم محتوى الصورة",
      },
      {
        label: "قبل النشر",
        do: "نقطة SEO لازم 60% أو أكثر — راجع الـ SEO HEALTH في أعلى الصفحة قبل النشر",
        dont: "لا تنشر بنقطة أقل من 60% — النظام سيمنع النشر ويجب تحسين الحقول الناقصة",
      },
    ],
  },
];

// رحلة المقال — 3 مراحل تجمع 5 تبويبات الأدمن (مصدر الحقيقة: STEP_CONFIGS)
const journey = [
  {
    ordinal: "الأولى",
    number: "١",
    phase: "الإعداد",
    color: "violet",
    description: "تبدأ هنا — اسم المقال، الكاتب، العميل، الفئة. هذا التبويب يُحدّد هوية المقال قبل أي شيء.",
    tabs: [
      {
        admin: "Basic",
        arabic: "الأساسيات",
        icon: FileText,
        required: true,
        fields: ["العنوان", "الملخص", "العميل", "الكاتب", "الفئة", "الوسوم", "الرابط (Slug)"],
        note: "🔗 الرابط (Slug): يُولَّد تلقائياً من العنوان · يجب أن يكون بالإنجليزي وفيه الكلمة المفتاحية · ممنوع تواريخ أو أرقام عشوائية · بعد النشر، أي تغيير في الرابط يحتاج 301 redirect وإلا يفقد المقال ترتيبه في جوجل",
      },
    ],
  },
  {
    ordinal: "الثانية",
    number: "٢",
    phase: "الكتابة",
    color: "emerald",
    description: "قلب المقال — تكتب المحتوى وترتب صوره، ثم تحدّد كيف يظهر في جوجل.",
    tabs: [
      {
        admin: "Content",
        arabic: "المحتوى والصور",
        icon: Pen,
        required: true,
        fields: ["محرر النصوص (H2 · H3 · قوائم · جداول · اقتباسات)", "الصورة الرئيسية", "معرض الصور (Gallery)", "مسار التنقل (Breadcrumb)"],
        note: "🖼️ الصور: 1200×630 الأساسي + Google يفضّل 3 نسب (16:9 · 4:3 · 1:1) للظهور في Google Discover · حد أدنى 50,000 بكسل (عرض × طول). 🤖 AI Assistant داخل المحرر يولّد مسودة — راجعها وأضف لمستك",
      },
      {
        admin: "SEO",
        arabic: "حقول البحث",
        icon: Search,
        required: true,
        fields: ["SEO Title (50-60 حرف)", "SEO Description (140-160 حرف)", "الكلمات المفتاحية", "الكلمات الدلالية"],
        note: "هذي الحقول تظهر في نتائج جوجل والمنصات — راجع صفحة معاينة البحث والمشاركة",
      },
    ],
  },
  {
    ordinal: "الثالثة",
    number: "٣",
    phase: "النشر والاعتماد",
    color: "amber",
    description: "اللمسات الأخيرة + اعتماد العميل من console.modonty.com — المقال ما ينشر إلا بعد موافقة العميل.",
    tabs: [
      {
        admin: "FAQs & Related",
        arabic: "أسئلة ومقالات ذات صلة",
        icon: CircleHelp,
        required: false,
        fields: ["الأسئلة الشائعة (FAQs)", "مقالات مرتبطة (3 أنواع)"],
        note: "FAQs تظهر كبطاقة موسَّعة في جوجل (FAQ Rich Result). Related Articles لها 3 أنواع علاقات: related (مرتبط بنفس الموضوع) · similar (مشابه في النوع) · recommended (مقترح للقراءة التالية). أضف 3-5 مقالات لتحسين التنقل ومدة بقاء الزائر",
      },
      {
        admin: "Publish",
        arabic: "إعدادات النشر (الأدمن)",
        icon: Clock,
        required: true,
        fields: ["نوع النشر (فوري / مجدول)", "تاريخ الجدولة", "Canonical URL", "Twitter Tags", "المصادر (Citations)", "Sitemap Priority"],
        note: "👤 شغل الأدمن: يحدّد طريقة النشر (فوري أو مجدول لتاريخ معين) ثم يحفظ المقال كـ DRAFT لإرسالها للعميل. النشر الفعلي يتم من هنا بعد رجوع اعتماد العميل",
      },
      {
        admin: "Client Approval",
        arabic: "اعتماد العميل (في console.modonty.com)",
        icon: ShieldCheck,
        required: true,
        fields: ["معاينة المقال كاملة", "زر الاعتماد فقط", "زر طلب تعديلات + ملاحظات"],
        note: "🤝 شغل العميل: يدخل console.modonty.com ويراجع المقال. دوره يقتصر على: (1) اعتماد المحتوى → يفتح للأدمن طريق النشر · (2) طلب تعديلات → يكتب ملاحظات ويرجع المقال. ⚠️ العميل لا ينشر — مجرد يعتمد. النشر الفعلي يبقى مع الأدمن",
      },
      {
        admin: "Final Publish",
        arabic: "النشر النهائي (الأدمن)",
        icon: Clock,
        required: true,
        fields: ["نشر فوري", "أو تنفيذ الجدولة التلقائية"],
        note: "👤 شغل الأدمن: بعد رجوع اعتماد العميل، الأدمن ينقل المقال للحالة النهائية — PUBLISHED (فوراً) أو SCHEDULED (تنشر تلقائياً في الموعد المحدد). هذي الخطوة النهائية تخلّي المقال يظهر للزوار",
      },
    ],
  },
] as const;

// النظام يُعالجها تلقائياً — لا تتدخّل
const autoHandled = [
  "الرابط (Slug) من العنوان",
  "عدد الكلمات ووقت القراءة",
  "البيانات المنظَّمة (JSON-LD)",
  "Canonical URL",
  "OG Tags للمشاركة",
  "المصادر من الروابط الخارجية",
] as const;

export default function ArticlesGuidelinesPage() {
  // mapping discipline color → tailwind classes
  const colorMap = {
    violet: { ring: "ring-violet-500/40", bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/30", line: "bg-violet-500/40" },
    emerald: { ring: "ring-emerald-500/40", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", line: "bg-emerald-500/40" },
    amber: { ring: "ring-amber-500/40", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", line: "bg-amber-500/40" },
  } as const;

  return (
    <GuidelineLayout
      title="Articles — رحلة المقال"
      description="3 مراحل · 5 تبويبات في الأدمن · من فكرة إلى مقال منشور"
    >

      {/* ── HERO: Journey Timeline (3 phases × 5 admin tabs) ─────────────── */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="px-6 py-5 border-b border-border/40 bg-gradient-to-b from-background to-muted/20">
            <h2 className="text-lg font-bold leading-tight">رحلة المقال — من الفكرة إلى النشر</h2>
            <p className="text-sm text-muted-foreground mt-1">3 مراحل واضحة. كل مرحلة فيها تبويب أو اثنين في الأدمن.</p>
          </div>

          <div className="p-6 space-y-8">
            {journey.map((stage, stageIdx) => {
              const c = colorMap[stage.color];
              const isLast = stageIdx === journey.length - 1;
              return (
                <div key={stage.ordinal} className="relative">
                  {/* Vertical connector to next phase */}
                  {!isLast && (
                    <div className={`absolute end-7 top-16 bottom-[-32px] w-px ${c.line}`} aria-hidden />
                  )}

                  {/* Phase header */}
                  <div className="flex items-start gap-4 mb-5">
                    <div className={`shrink-0 w-14 h-14 rounded-full ${c.bg} ring-4 ${c.ring} flex flex-col items-center justify-center font-bold relative z-10 bg-background`}>
                      <span className={`text-2xl ${c.text} leading-none`}>{stage.number}</span>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className={`text-xs font-semibold uppercase tracking-wider ${c.text}`}>المرحلة {stage.ordinal}</span>
                      </div>
                      <h3 className="text-xl font-bold mt-0.5">{stage.phase}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-1.5">{stage.description}</p>
                    </div>
                  </div>

                  {/* Tab cards inside this phase */}
                  <div className="ms-[72px] space-y-3">
                    {stage.tabs.map((tab) => {
                      const TabIcon = tab.icon;
                      return (
                        <div key={tab.admin} className={`rounded-xl border ${c.border} bg-card overflow-hidden`}>
                          <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap border-b border-border/40 bg-muted/30">
                            <div className="flex items-center gap-2.5">
                              <div className={`p-1.5 rounded-lg ${c.bg}`}>
                                <TabIcon className={`h-4 w-4 ${c.text}`} />
                              </div>
                              <div>
                                <p className="font-bold text-sm leading-tight">
                                  {tab.arabic} <span className="text-muted-foreground font-mono text-xs">({tab.admin})</span>
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={tab.required
                                ? "text-xs border-red-500/40 text-red-400 bg-red-500/[0.06]"
                                : "text-xs border-muted-foreground/30 text-muted-foreground"}
                            >
                              {tab.required ? "مطلوب" : "اختياري"}
                            </Badge>
                          </div>
                          <div className="px-4 py-3 space-y-2.5">
                            <div className="flex flex-wrap gap-1.5">
                              {tab.fields.map((field) => (
                                <span key={field} className="text-xs px-2 py-1 rounded-md bg-muted border border-border/50">
                                  {field}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5 pt-1 border-t border-border/30">
                              <span className="text-amber-400 shrink-0">💡</span>
                              <span>{tab.note}</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Auto-handled footer */}
          <div className="px-6 py-4 border-t border-border/40 bg-muted/20">
            <div className="flex items-center gap-2 mb-2.5">
              <Zap className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <p className="text-xs font-semibold text-blue-400">يُعالجه النظام تلقائياً — لا تتدخّل</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {autoHandled.map((item) => (
                <span key={item} className="text-xs px-2 py-1 rounded-md bg-blue-500/[0.06] border border-blue-500/20 text-blue-300/90">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── E-E-A-T Quality Boosters (verified Google Article schema 2026) ── */}
      <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <h2 className="text-base font-bold text-emerald-400">معزّزات الجودة (E-E-A-T) — اللمسة اللي تفرّق</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            هذي الحقول اختيارية لكنها <strong className="text-foreground">اللي تفرّق</strong> بين مقال عادي ومقال يظهر في البطاقة الموسَّعة لجوجل. كلها يكتبها النظام تلقائياً <strong className="text-emerald-400">بشرط</strong> إن البيانات مكتملة في الأدمن.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                title: "📚 المصادر (Citations)",
                source: "تبويب Publish › Citations",
                description: "روابط مصادر خارجية موثوقة. تُستخرج تلقائياً من الروابط في المحتوى — راجعها قبل النشر. تدخل في schema كـ isBasedOn — إشارة E-E-A-T قوية لجوجل",
              },
              {
                title: "👤 ملف الكاتب الكامل",
                source: "تعديل الكاتب › الاسم + السيرة + الصورة + الروابط الاجتماعية",
                description: "Google يطلب: name (الاسم فقط) + url (صفحة الكاتب) + sameAs (روابط اجتماعية). كاتب بدون بروفايل = ضعف E-E-A-T",
              },
              {
                title: "📅 تاريخ آخر مراجعة (lastReviewed)",
                source: "يُحدَّث تلقائياً عند تعديل المقال",
                description: "إشارة freshness لجوجل — المقالات اللي تتحدّث دورياً ترتّب أعلى. راجع المقالات القديمة كل 6 أشهر وحدّث المعلومات",
              },
              {
                title: "🎯 الكلمات الدلالية (Semantic Keywords)",
                source: "تبويب SEO › Semantic Keywords",
                description: "كيانات Wikidata (مثل: اسم شركة، تقنية، مفهوم) تساعد جوجل ومحركات الـ AI (ChatGPT, Perplexity) في فهم المقال + ربطه بمواضيع أوسع",
              },
              {
                title: "🎙️ نسخة صوتية (Audio Version)",
                source: "حقل audioUrl",
                description: "رابط نسخة صوتية للمقال (Podcast / Text-to-Speech). يُحسِّن إمكانية الوصول + يفتح فرصة الظهور في Google Podcasts",
              },
              {
                title: "🍞 مسار التنقل (Breadcrumb)",
                source: "يُولَّد تلقائياً من الفئة + الرابط",
                description: "BreadcrumbList schema يظهر فوق العنوان في نتائج جوجل (Modonty › الفئة › عنوان المقال). يحسّن الـ CTR لأنه أوضح من الرابط الكامل",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-border/50 bg-background/50 p-3 space-y-1.5">
                <p className="text-sm font-bold">{item.title}</p>
                <p className="text-[11px] font-mono text-emerald-400 leading-relaxed">{item.source}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Article Status Lifecycle (real ArticleStatus enum) ──────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base">دورة حياة المقال — مَن يفعل ماذا؟</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            <strong className="text-emerald-400">مفهوم أساسي:</strong> العميل <strong>يعتمد</strong> فقط — الأدمن هو من <strong>ينشر</strong>. الفصل بين الدورين مقصود.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[
              { label: "WRITING", arabic: "قيد الكتابة", actor: "👤 الأدمن", color: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
              { label: "→", color: "text-muted-foreground" },
              { label: "DRAFT", arabic: "جاهز للاعتماد", actor: "👤 الأدمن أرسلها", color: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
              { label: "→", color: "text-muted-foreground", note: "🤝 العميل يعتمد" },
              { label: "SCHEDULED", arabic: "مجدول", actor: "👤 الأدمن نَشَر", color: "bg-violet-500/10 text-violet-400 border border-violet-500/20" },
              { label: "→", color: "text-muted-foreground", note: "🤖 آلي في الموعد" },
              { label: "PUBLISHED", arabic: "منشور", actor: "✅ يظهر للقارئ", color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
              { label: "→", color: "text-muted-foreground" },
              { label: "ARCHIVED", arabic: "مؤرشف", actor: "👤 لاحقاً", color: "bg-slate-500/10 text-slate-400 border border-slate-500/20" },
            ].map((item, i) =>
              item.label === "→" ? (
                <div key={i} className="flex flex-col items-center gap-0.5 px-1">
                  <span className={`text-lg ${item.color}`}>{item.label}</span>
                  {item.note && <span className="text-[10px] text-amber-400 font-medium whitespace-nowrap">{item.note}</span>}
                </div>
              ) : (
                <div key={i} className={`px-3 py-2 rounded-lg flex flex-col items-center text-center ${item.color}`}>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wide leading-none">{item.label}</span>
                  <span className="text-xs leading-none mt-1">{item.arabic}</span>
                  {item.actor && <span className="text-[10px] opacity-70 leading-none mt-1">{item.actor}</span>}
                </div>
              )
            )}
          </div>

          {/* Role separation explainer */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.05] p-3">
              <p className="font-semibold text-blue-400 mb-1.5">🤝 دور العميل: الاعتماد فقط</p>
              <p className="text-muted-foreground leading-relaxed">
                العميل يدخل <strong className="text-foreground">console.modonty.com</strong> ويراجع المقال. خياراته:
                <br />
                ✓ <strong>اعتماد</strong> → يفتح الباب للأدمن لينشر
                <br />
                ✗ <strong>طلب تعديلات</strong> → يرجع للأدمن مع ملاحظات
                <br />
                <strong className="text-amber-400">العميل لا يقدر ينشر بنفسه — هذا ليس دوره</strong>
              </p>
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] p-3">
              <p className="font-semibold text-emerald-400 mb-1.5">👤 دور الأدمن: النشر</p>
              <p className="text-muted-foreground leading-relaxed">
                بعد رجوع اعتماد العميل، الأدمن يُحدّد طريقة النشر:
                <br />
                ⚡ <strong>PUBLISHED</strong> → نشر فوري، يظهر مباشرة
                <br />
                📅 <strong>SCHEDULED</strong> → النظام ينشره تلقائياً في الموعد المحدد
                <br />
                <strong className="text-emerald-400">النشر = شغل الأدمن، مش العميل</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* قواعد الكتابة لـ SEO — للكاتب */}
      <Card className="border-emerald-500/30 bg-emerald-500/[0.03] overflow-hidden">
        <CardContent className="p-0">
          <div className="p-5 border-b border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <PenLine className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <span className="font-bold text-base">قواعد الكتابة لـ SEO — للكاتب</span>
                <p className="text-xs text-muted-foreground">كل مقال تكتبه يحتاج هذه النقاط — اتبعها وارتفع في نتائج البحث</p>
              </div>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px] shrink-0">Content Writer</Badge>
          </div>

          <Accordion type="multiple" className="divide-y divide-border/40">
            {seoWritingRules.map((section) => {
              const SectionIcon = section.icon;
              return (
                <AccordionItem key={section.title} value={section.title} className="border-0 px-5">
                  <AccordionTrigger className="py-4 hover:no-underline gap-2 [&>svg]:text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <SectionIcon className={`h-4 w-4 ${section.color} shrink-0`} />
                      <span className={`text-sm font-semibold ${section.color}`}>{section.title}</span>
                      <span className="text-[10px] text-muted-foreground font-normal hidden sm:block">
                        — {section.rules.length} نقطة
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {section.rules.map((rule, i) => (
                        <div key={i} className="rounded-lg border border-border/50 bg-background/40 p-3 space-y-2">
                          <p className="text-xs font-bold">{rule.label}</p>
                          <div className="flex items-start gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground leading-relaxed">{rule.do}</p>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <XCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground leading-relaxed">{rule.dont}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          <div className="px-5 py-3 border-t border-emerald-500/20">
            <p className="text-[11px] text-muted-foreground">
              💡 كل ما ذُكر أعلاه موجود في الأدمن فعلاً — <strong className="text-foreground">Basic (Step 1)</strong> للعنوان والملخص والرابط · <strong className="text-foreground">Content (Step 2)</strong> للمحرر · <strong className="text-foreground">SEO (Step 3)</strong> لحقول جوجل
            </p>
          </div>
        </CardContent>
      </Card>
    </GuidelineLayout>
  );
}
