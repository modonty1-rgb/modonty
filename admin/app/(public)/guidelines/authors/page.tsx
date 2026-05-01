"use client";

import { Card, CardContent } from "@/components/ui/card";
import { GuidelineLayout } from "../components/guideline-layout";
import {
  CheckCircle2,
  Shield,
  Star,
  Award,
  BookOpen,
  Link2,
  Sparkles,
  AlertCircle,
} from "lucide-react";

// ─── السياسة: متى نستخدم مؤلف فردي vs مودونتي ─────────────────────────────
const exceptions = [
  {
    icon: Award,
    title: "سلطة المجال (Subject-Matter Authority)",
    description: "خبير معروف يعطي ثقة فورية للقارئ — مثلاً طبيب لمقال طبي، محامي لمقال قانوني، مهندس معماري لمقال عقارات",
    example: "مقال صحي → د. أحمد العلي (طبيب أسنان مرخّص)",
  },
  {
    icon: Sparkles,
    title: "شراكة استراتيجية (Brand Partnership)",
    description: "كاتب لديه brand شخصي قوي اتفقنا معه على نشر محتواه لدينا — ينقل جمهوره ويعزّز ثقة الموقع",
    example: "كاتب رأي معروف على X بـ 100K متابع",
  },
  {
    icon: BookOpen,
    title: "محتوى شخصي (Personal Voice)",
    description: "مقال رأي أو تجربة شخصية يتطلب توقيعاً فردياً — صوت الكاتب جزء من قيمة المحتوى",
    example: "مقال \"تجربتي في إطلاق متجر إلكتروني\"",
  },
] as const;

// ─── خطوات بناء سلطة المؤلف (E-E-A-T) ────────────────────────────────
const authoritySteps = [
  {
    number: "١",
    title: "ملف الكاتب الكامل في مودونتي",
    items: [
      "الاسم الكامل (يطابق ما سيظهر في byline المقال بدون تغيير)",
      "صورة شخصية احترافية 500×500 بكسل (حقيقية، مش avatar)",
      "سيرة 100-200 كلمة توضّح: من هو + مجال خبرته + سبب اعتباره مرجعاً",
      "المسمى الوظيفي (jobTitle) — مثلاً: \"طبيب أسنان مرخّص — وزارة الصحة السعودية\"",
    ],
    why: "Google يبحث عن صفحة كاتب مستقلة كإشارة E-E-A-T أساسية — الكاتب بدون صفحة = إشارة ضعيفة",
  },
  {
    number: "٢",
    title: "حقل sameAs — ابني السلطة بالترتيب من السريع للأقوى",
    items: [
      "🚀 الأسبوع الأول — LinkedIn: افتح ملف احترافي للكاتب (لو ما عنده) · أضف مودونتي كـ \"current workplace\" · اطلب من 5 زملاء يعطوه endorsement · أضف رابط profile لـ sameAs",
      "🚀 الأسبوع الأول — X/Twitter: حساب احترافي بالاسم الحقيقي · bio يذكر المسمى + رابط مودونتي · 10 تغريدات في المجال قبل النشر · ضع الرابط في sameAs",
      "📰 الشهر الأول — ذِكرات (Mentions): اكتب مقال ضيف واحد في موقع موثوق في القطاع (صحيفة، مجلة متخصصة) يذكر اسم الكاتب + رابط لصفحته على مودونتي · هذي تبني الـ web of trust",
      "🎓 إذا كان الكاتب أكاديمي — Google Scholar: أنشئ profile + ادرج المنشورات الأكاديمية · إشارة authority قوية جداً للمحتوى التخصصي",
      "🏆 الشهر الثاني-الثالث — Wikidata entry: (الأقوى على الإطلاق) أنشئ حساب على wikidata.org · اعمل 10-20 تعديلات صغيرة في عناصر أخرى لبناء history · أنشئ entry للكاتب بالحقول: instance of (Q5 = human) + occupation + country + references خارجية · انتظر مراجعة المحررين · بعد القبول → أضف الـ Q-number لـ sameAs",
      "✅ القاعدة الذهبية: 5-10 روابط عالية الجودة أحسن من 30 رابط ضعيف. كل رابط لازم يكون active + يطابق الاسم بالضبط",
    ],
    why: "sameAs = جسر بين موقعك وGoogle Knowledge Graph. Gemini AI يستخدمه للاستشهاد + ChatGPT/Perplexity يثقون فيه. Wikidata بالذات = مدخل مباشر لـ Knowledge Graph (موثّق رسمياً من Schema.org)",
  },
  {
    number: "٣",
    title: "الاتساق التام (Consistency Check)",
    items: [
      "الاسم في byline المقال = الاسم في schema = الاسم على صفحة الكاتب (حرف بحرف)",
      "المسمى الوظيفي ثابت في كل المقالات",
      "صورة الكاتب نفسها على LinkedIn + Wikidata + مودونتي",
      "روابط sameAs كلها تعمل (لا تعطي 404)",
    ],
    why: "أي تعارض = Google يتجاهل markup الكاتب. \"Jane Doe Editor at X\" في الصفحة لكن \"Jane D. Writer at Y\" في schema = warning + احتمال إهمال البيانات",
  },
] as const;

// ─── خطة بناء سلطة مودونتي كـ Organization (3 مراحل عملية) ──────────────
const modontyAuthorityPlan = [
  {
    phase: "المرحلة الأولى — الأساس (الأسبوع الأول)",
    icon: "🏗️",
    color: "blue",
    actions: [
      { task: "صفحة \"عن مودونتي\" كاملة", how: "اكتب: المهمة + الرؤية + الفريق + تاريخ التأسيس + موقع المكتب. لا تتركها قالب جاهز", impact: "Google يقرأها ويبني فهم للهوية" },
      { task: "صفحة سياسة التحرير (Editorial Policy)", how: "اكتب كيف نختار المواضيع + كيف نتحقق من الحقائق + كيف نراجع المقالات + كيف نصحّح الأخطاء", impact: "إشارة Trust قوية لـ E-E-A-T — Google يقدّر الشفافية" },
      { task: "صفحة تواصل واضحة", how: "إيميل + رقم هاتف + عنوان مكتب فعلي + ساعات العمل. الموقع الفعلي مهم", impact: "الـ Trust يعتمد على إمكانية الوصول الحقيقي للمؤسسة" },
    ],
  },
  {
    phase: "المرحلة الثانية — الحضور الرقمي (الأسبوع الثاني-الثالث)",
    icon: "🌐",
    color: "violet",
    actions: [
      { task: "Google Business Profile (GBP)", how: "سجّل المؤسسة على Google Business + تحقّق من العنوان + أضف الفئة + الصور + ساعات العمل", impact: "إشارة authority محلية للسوق السعودي/المصري" },
      { task: "LinkedIn Company Page", how: "صفحة الشركة (مش شخصية) + شعار + كوفر + bio + موقع الويب + موظفين مرتبطين", impact: "أقوى إشارة authority B2B" },
      { task: "X/Twitter للمؤسسة", how: "حساب @modonty_sa مثلاً + bio احترافي + تغريدات منتظمة + رابط الموقع", impact: "إشارة نشاط + وصول لجمهور" },
      { task: "Organization Schema في الكود", how: "JSON-LD في كل صفحة بـ: name + logo + url + sameAs (روابط الحسابات أعلاه) + foundingDate + contactPoint + address", impact: "Google يفهم مودونتي ككيان موحَّد عبر الويب" },
    ],
  },
  {
    phase: "المرحلة الثالثة — Knowledge Graph (الشهر الثاني-الثالث)",
    icon: "🏆",
    color: "emerald",
    actions: [
      { task: "اطلب ذكرات (mentions) من مواقع القطاع", how: "تواصل مع 5-10 مواقع موثوقة في الإعلام السعودي/العربي + اطلب نشر خبر إطلاق منصتك. لا backlinks مدفوعة — ذكرات حقيقية", impact: "كل ذكر = إشارة authority + مدخل محتمل لـ Knowledge Graph" },
      { task: "Wikidata entry لـ مودونتي", how: "أنشئ حساب → اعمل 20+ تعديل في عناصر أخرى → أنشئ entry لـ Modonty بحقول: instance of (Q1115791 = software platform) + country + foundingDate + official website + references خارجية + sameAs لكل حساباتك", impact: "🏆 الجائزة الكبرى — مدخل مباشر لـ Google Knowledge Graph + Gemini AI يستشهد بمودونتي" },
      { task: "تابع مع Knowledge Panel", how: "بعد 2-4 أسابيع من Wikidata + الذكرات، ابحث في Google عن \"مودونتي\" — لو ظهر Knowledge Panel = نجحت في بناء الـ Knowledge Graph entity", impact: "ظهور تلقائي في AI Mode + Knowledge Panel + Rich Results" },
    ],
  },
] as const;

export default function AuthorsGuidelinesPage() {
  return (
    <GuidelineLayout
      title="سياسة الكتّاب — Authors Policy"
      description="مودونتي هي المؤلف الأساسي · المؤلف الفردي = استثناء ذو قيمة استراتيجية"
    >

      {/* ── HERO: السياسة ─────────────────────────────────────── */}
      <Card className="border-primary/30 bg-primary/[0.04] overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/15 border border-primary/30">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">القاعدة: مودونتي هي المؤلف الافتراضي</h2>
              <p className="text-xs text-muted-foreground mt-0.5">E-E-A-T على مستوى المنصة، مش الفرد — قرار استراتيجي مقصود</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            بدلاً من تشتيت ثقة القارئ بين عشرات الكتّاب، نبني <strong className="text-foreground">سلطة موحّدة لمودونتي</strong>.
            النتيجة: كل مقال جديد يستفيد من سمعة المنصة كاملة، مش يبدأ من الصفر مع كاتب جديد.
            المؤلف الفردي = استثناء له قيمة استراتيجية واضحة.
          </p>
        </CardContent>
      </Card>

      {/* ── الاستثناءات الـ 3 ─────────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4 text-amber-500" />
            <h2 className="text-base font-bold">متى نستخدم كاتب فردي؟ — 3 حالات فقط</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {exceptions.map((ex) => {
              const Icon = ex.icon;
              return (
                <div key={ex.title} className="rounded-xl border border-amber-500/25 bg-amber-500/[0.04] p-4 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-amber-400 shrink-0" />
                    <h3 className="text-sm font-bold leading-tight">{ex.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ex.description}</p>
                  <p className="text-xs italic text-amber-300/80 leading-relaxed pt-2 border-t border-amber-500/15">
                    💡 {ex.example}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">في أي حالة أخرى</strong> → استخدم <code className="text-xs bg-background border border-border rounded px-1.5 py-0.5">مودونتي</code> كمؤلف. لا تنشر مقالاً باسم كاتب جديد بدون قيمة E-E-A-T واضحة.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── خطوات بناء السلطة (E-E-A-T) ───────────────────────── */}
      <Card>
        <CardContent className="p-0">
          <div className="px-6 py-5 border-b border-border/40 bg-gradient-to-b from-background to-muted/20">
            <h2 className="text-lg font-bold">3 خطوات لبناء كاتب فردي موثوق — Person Schema</h2>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              هذي الخطوات تخصّ <strong className="text-foreground">الكاتب الفردي (@type: Person)</strong>. لما المؤلف = مودونتي، تنطبق قواعد <strong className="text-foreground">Organization</strong> المختلفة (في القسم البنفسجي تحت).
            </p>
            <div className="mt-3 rounded-lg border border-blue-500/25 bg-blue-500/[0.06] p-3 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-200/90 leading-relaxed">
                <strong>الفرق التقني:</strong> كاتب فردي = Person schema → يحتاج <code className="text-[11px] bg-background/60 border border-border rounded px-1 py-0.5">image</code> (صورة شخصية حقيقية). مودونتي = Organization schema → يستخدم <code className="text-[11px] bg-background/60 border border-border rounded px-1 py-0.5">logo</code> (لا تحتاج صورة شخصية). كلاهما مقبول رسمياً في Google كمؤلف للمقال.
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {authoritySteps.map((step, idx) => {
              const isLast = idx === authoritySteps.length - 1;
              return (
                <div key={step.number} className="relative">
                  {!isLast && (
                    <div className="absolute end-7 top-16 bottom-[-24px] w-px bg-emerald-500/30" aria-hidden />
                  )}
                  <div className="flex items-start gap-4 mb-3">
                    <div className="shrink-0 w-14 h-14 rounded-full bg-emerald-500/10 ring-4 ring-emerald-500/30 flex items-center justify-center font-bold relative z-10">
                      <span className="text-2xl text-emerald-400 leading-none">{step.number}</span>
                    </div>
                    <div className="flex-1 min-w-0 pt-1.5">
                      <h3 className="text-base font-bold leading-tight">{step.title}</h3>
                    </div>
                  </div>
                  <div className="ms-[72px] space-y-2.5">
                    <ul className="space-y-1.5">
                      {step.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] p-3">
                      <p className="text-xs text-emerald-300/90 leading-relaxed">
                        <strong className="text-emerald-400">لماذا مهم:</strong> {step.why}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── خطة بناء سلطة مودونتي كـ Organization (3 مراحل) ─────────────── */}
      <Card className="border-violet-500/25 bg-violet-500/[0.03] overflow-hidden">
        <CardContent className="p-0">
          <div className="px-6 py-5 border-b border-violet-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="h-4 w-4 text-violet-400" />
              <h2 className="text-lg font-bold text-violet-400">خطة بناء سلطة مودونتي (Organization) — 3 مراحل عملية</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              الـ schema لمودونتي = <code className="text-[11px] bg-background/60 border border-border rounded px-1 py-0.5">@type: Organization</code> + <code className="text-[11px] bg-background/60 border border-border rounded px-1 py-0.5">logo</code> بدلاً من Person + image. اتبع المراحل بالترتيب — كل مرحلة تبني على اللي قبلها.
            </p>
          </div>

          <div className="p-6 space-y-6">
            {modontyAuthorityPlan.map((phase) => {
              const colorMap: Record<string, { border: string; bg: string; text: string; iconBg: string }> = {
                blue: { border: "border-blue-500/30", bg: "bg-blue-500/[0.05]", text: "text-blue-400", iconBg: "bg-blue-500/15" },
                violet: { border: "border-violet-500/30", bg: "bg-violet-500/[0.05]", text: "text-violet-400", iconBg: "bg-violet-500/15" },
                emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/[0.05]", text: "text-emerald-400", iconBg: "bg-emerald-500/15" },
              };
              const c = colorMap[phase.color];
              return (
                <div key={phase.phase}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center text-xl`}>{phase.icon}</div>
                    <h3 className={`text-base font-bold ${c.text}`}>{phase.phase}</h3>
                  </div>
                  <div className="space-y-2.5">
                    {phase.actions.map((action) => (
                      <div key={action.task} className={`rounded-lg border ${c.border} ${c.bg} p-3 space-y-1.5`}>
                        <p className="text-sm font-bold leading-tight">{action.task}</p>
                        <div className="flex items-start gap-1.5">
                          <span className="text-[11px] font-semibold text-foreground/80 shrink-0">كيف:</span>
                          <p className="text-xs text-muted-foreground leading-relaxed">{action.how}</p>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className={`text-[11px] font-semibold ${c.text} shrink-0`}>الأثر:</span>
                          <p className="text-xs text-muted-foreground leading-relaxed">{action.impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-6 py-4 border-t border-violet-500/20 bg-amber-500/[0.04] flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/90 leading-relaxed">
              <strong>الـ ROI متراكم:</strong> المرحلة 1 (أسبوع) تعطيك أساس صحيح. المرحلة 2 (أسبوعين) تبني الحضور. المرحلة 3 (شهرين-ثلاثة) تفتح Knowledge Graph — أعلى مستوى authority على الإنترنت. لا تتوقّف بعد المرحلة 1.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── المراجع الرسمية ────────────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">مراجع رسمية</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <a href="https://developers.google.com/search/docs/appearance/structured-data/article#author-best-practices" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border/50 bg-background p-3 hover:border-primary/40 hover:bg-primary/[0.03] transition-colors">
              <p className="font-semibold text-foreground">Google Article Author Best Practices</p>
              <p className="text-muted-foreground mt-1 leading-relaxed">المرجع الرسمي لـ Person markup + sameAs + name disambiguation</p>
            </a>
            <a href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border/50 bg-background p-3 hover:border-primary/40 hover:bg-primary/[0.03] transition-colors">
              <p className="font-semibold text-foreground">Google Helpful Content + E-E-A-T</p>
              <p className="text-muted-foreground mt-1 leading-relaxed">قواعد المحتوى المفيد — البايلاين + ملف الكاتب + الشفافية</p>
            </a>
            <a href="https://schema.org/Person" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border/50 bg-background p-3 hover:border-primary/40 hover:bg-primary/[0.03] transition-colors">
              <p className="font-semibold text-foreground">Schema.org Person</p>
              <p className="text-muted-foreground mt-1 leading-relaxed">المعجم الرسمي لكل خصائص Person المدعومة</p>
            </a>
            <a href="https://www.wikidata.org" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border/50 bg-background p-3 hover:border-primary/40 hover:bg-primary/[0.03] transition-colors">
              <p className="font-semibold text-foreground">Wikidata — Knowledge Graph</p>
              <p className="text-muted-foreground mt-1 leading-relaxed">المصدر الأقوى لـ sameAs — يربط الكاتب بـ Google Knowledge Graph</p>
            </a>
          </div>
        </CardContent>
      </Card>

    </GuidelineLayout>
  );
}
