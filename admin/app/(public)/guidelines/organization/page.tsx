"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GuidelineLayout } from "../components/guideline-layout";
import {
  FolderTree,
  Tag,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Network,
  Zap,
  Lightbulb,
} from "lucide-react";

// ─── Shared fields (identical across all 3 entities) ─────────────────────────
const sharedFields = [
  { field: "الاسم", required: true, description: "اسم واضح ومحدد — يظهر للزائر وفي نتائج البحث" },
  { field: "الرابط (Slug)", required: false, description: "يُولّد تلقائياً — يُشكّل رابط الصفحة في الموقع" },
  { field: "الوصف", required: false, description: "50 حرف على الأقل — يشرح المحتوى للزائر ولجوجل" },
  { field: "عنوان SEO", required: false, description: "50-60 حرف — يُولّد تلقائياً إذا لم تُدخله يدوياً" },
  { field: "وصف SEO", required: false, description: "160 حرف كحد أقصى — يُولّد تلقائياً إذا لم تُدخله يدوياً" },
  { field: "صورة المشاركة", required: false, description: "1200×630px — تظهر عند مشاركة الرابط في وسائل التواصل" },
];

// ─── Category vs Tag vs Industry ─────────────────────────────────────────────
const comparisonRows = [
  {
    aspect: "الغرض",
    category: "تصنيف رئيسي للمقالات — كل مقال ينتمي لفئة واحدة",
    tag: "ربط المقالات المتشابهة عبر فئات مختلفة",
    industry: "تصنيف العملاء حسب نوع نشاطهم التجاري",
  },
  {
    aspect: "التنظيم",
    category: "هرمي — فئة أب وفئة ابن (مستويان كحد أقصى)",
    tag: "مسطح — بدون تسلسل",
    industry: "مسطح — كل عميل يُربط بقطاع واحد",
  },
  {
    aspect: "العدد الموصى به",
    category: "5-15 فئة رئيسية",
    tag: "3-5 وسوم لكل مقال",
    industry: "10-20 قطاع كحد أقصى",
  },
  {
    aspect: "مثال",
    category: "التقنية ← تطوير المواقع",
    tag: "SEO · Google · أدوات مجانية",
    industry: "الرعاية الصحية · التعليم · العقارات",
  },
];

// ─── Category best practices ──────────────────────────────────────────────────
const categoryPractices = [
  { tip: "أسماء واضحة ومحددة", detail: "\"تطوير المواقع\" أفضل من \"تطوير\" — الوضوح يساعد الزائر وجوجل" },
  { tip: "لا تتعمق أكثر من مستويين", detail: "أب ← ابن — التعمق أكثر يُربك الزائر ويضعف بنية الـ URL" },
  { tip: "كل فئة تحتاج 3 مقالات على الأقل", detail: "فئة فارغة أو بمقال واحد تُضعف SEO الموقع كله" },
  { tip: "استخدم الوسوم للمواضيع المتداخلة", detail: "موضوع يناسب فئتين = وسم، ليس فئتين — الفئة للتصنيف الرئيسي فقط" },
];

// ─── Tag best practices ───────────────────────────────────────────────────────
const tagPractices = [
  { tip: "محدد وليس عام", detail: "\"SEO\" وسم جيد — \"مقالات\" أو \"معلومات\" وسوم عامة لا تفيد" },
  { tip: "لا تكرر اسم الفئة كوسم", detail: "إذا الفئة هي \"التسويق\" لا تضف وسم بنفس الاسم" },
  { tip: "أعد استخدام الوسوم الموجودة", detail: "قبل إنشاء وسم جديد تحقق أنه غير موجود مسبقاً — التكرار يُشتت التصنيف" },
];

const tagExamples = [
  { tag: "SEO", good: true, reason: "محدد ويبحث عنه الزوار" },
  { tag: "تصميم UI", good: true, reason: "واضح ومرتبط بمحتوى محدد" },
  { tag: "مقالات", good: false, reason: "عام جداً — كل المحتوى مقالات" },
  { tag: "2025", good: false, reason: "سنة فقط — لا يصف محتوى" },
];

// ─── Industry best practices ──────────────────────────────────────────────────
const industryPractices = [
  { tip: "أسماء قطاعات معروفة ومتعارف عليها", detail: "\"التقنية\" أفضل من \"تكنولوجيا المعلومات والاتصالات\" — البساطة أولاً" },
  { tip: "تجنب التداخل بين أسماء القطاعات", detail: "لا تنشئ \"التقنية\" و\"تكنولوجيا المعلومات\" معاً — اختر اسماً واحداً" },
  { tip: "قطاع بعميل واحد؟ فكر في دمجه", detail: "إذا قطاع فيه عميل واحد فقط — فكر في دمجه مع قطاع أقرب" },
];

const industryExamples = [
  { name: "التقنية", clients: "شركات البرمجيات، التطبيقات، الاستضافة" },
  { name: "الرعاية الصحية", clients: "المستشفيات، العيادات، شركات الأدوية" },
  { name: "التعليم", clients: "المدارس، الجامعات، منصات التعلم" },
  { name: "التجارة الإلكترونية", clients: "المتاجر الإلكترونية، منصات البيع" },
  { name: "العقارات", clients: "شركات التطوير، الوساطة العقارية" },
];

export default function OrganizationGuidelinesPage() {
  return (
    <GuidelineLayout
      title="Content Organization"
      description="الفئات · الوسوم · القطاعات — كيف ينظّم النظام المحتوى والعملاء"
    >

      {/* ── Entity Comparison ────────────────────────────────────────────── */}
      <Card className="border-blue-500/20 bg-blue-500/[0.03]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base">متى تستخدم كل واحدة؟</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            الثلاثة تعمل معاً لكن لكل منها هدف مختلف
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">الجانب</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1.5">
                    <FolderTree className="h-3.5 w-3.5 text-blue-500" />
                    <span>الفئة (Category)</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-violet-500" />
                    <span>الوسم (Tag)</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-amber-500" />
                    <span>القطاع (Industry)</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonRows.map((row) => (
                <TableRow key={row.aspect}>
                  <TableCell className="font-medium text-xs">{row.aspect}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.category}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.tag}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.industry}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Shared Fields ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-500" />
            <CardTitle className="text-base">الحقول المشتركة — الثلاثة لها نفس الهيكل</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            الفئات والوسوم والقطاعات تشترك في نفس الحقول — الـ Slug وSEO Title وSEO Description تُولَّد تلقائياً
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الحقل</TableHead>
                <TableHead>الشرح</TableHead>
                <TableHead className="w-20">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sharedFields.map((f) => (
                <TableRow key={f.field}>
                  <TableCell className="font-medium text-sm">{f.field}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{f.description}</TableCell>
                  <TableCell>
                    {f.required ? (
                      <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-500">مطلوب</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] border-muted-foreground/30 text-muted-foreground">اختياري</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      <Card className="border-blue-500/20 bg-blue-500/[0.02]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FolderTree className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base">الفئات (Categories)</CardTitle>
            <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400">للمقالات</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            التصنيف الرئيسي للمقالات — هرمي بمستويين (أب ← ابن)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hierarchy visual */}
          <div className="rounded-lg border border-border/50 bg-background/60 p-3 space-y-2">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">التسلسل الهرمي</p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-medium">التقنية</span>
                <span className="text-muted-foreground text-[10px]">← فئة رئيسية (أب)</span>
              </div>
              <div className="flex items-center gap-2 ps-4">
                <span className="text-muted-foreground text-[10px]">↳</span>
                <span className="text-blue-300">تطوير المواقع</span>
                <span className="text-muted-foreground text-[10px]">← فئة فرعية (ابن)</span>
              </div>
              <div className="flex items-center gap-2 ps-4">
                <span className="text-muted-foreground text-[10px]">↳</span>
                <span className="text-blue-300">تصميم UI/UX</span>
                <span className="text-muted-foreground text-[10px]">← فئة فرعية (ابن)</span>
              </div>
            </div>
          </div>
          {/* Best practices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categoryPractices.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium">{item.tip}</p>
                  <p className="text-[11px] text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Tags ─────────────────────────────────────────────────────────── */}
      <Card className="border-violet-500/20 bg-violet-500/[0.02]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-violet-500" />
            <CardTitle className="text-base">الوسوم (Tags)</CardTitle>
            <Badge variant="outline" className="text-[10px] border-violet-500/30 text-violet-400">للمقالات</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            مسطحة بدون تسلسل — 3-5 وسوم لكل مقال، تربط المحتوى المتشابه عبر الفئات
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Best practices */}
          <div className="space-y-2">
            {tagPractices.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-violet-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium">{item.tip}</p>
                  <p className="text-[11px] text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Good / Bad examples */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-3">
              <p className="text-[10px] font-semibold text-emerald-400 mb-2">وسوم جيدة</p>
              <div className="space-y-1.5">
                {tagExamples.filter((t) => t.good).map((t, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[10px]">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                    <span><span className="font-medium">{t.tag}</span> — {t.reason}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-red-500/20 bg-red-500/[0.04] p-3">
              <p className="text-[10px] font-semibold text-red-400 mb-2">وسوم سيئة</p>
              <div className="space-y-1.5">
                {tagExamples.filter((t) => !t.good).map((t, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[10px]">
                    <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                    <span><span className="font-medium">{t.tag}</span> — {t.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Industries ───────────────────────────────────────────────────── */}
      <Card className="border-amber-500/20 bg-amber-500/[0.02]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base">القطاعات (Industries)</CardTitle>
            <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">للعملاء</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            تُصنّف العملاء حسب نوع نشاطهم — كل عميل يُربط بقطاع واحد عند إنشائه
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {industryPractices.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium">{item.tip}</p>
                  <p className="text-[11px] text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Examples table */}
          <div>
            <p className="text-[10px] text-muted-foreground font-medium mb-2 uppercase tracking-wide">أمثلة مقترحة</p>
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>القطاع</TableHead>
                    <TableHead>أنواع العملاء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {industryExamples.map((ind) => (
                    <TableRow key={ind.name}>
                      <TableCell className="font-medium text-sm">{ind.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{ind.clients}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Shared SEO Auto Features ─────────────────────────────────────── */}
      <Card className="border-emerald-500/20 bg-emerald-500/[0.02]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-emerald-500" />
            <CardTitle className="text-base">ما يتولاه النظام تلقائياً — الثلاثة بدون استثناء</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: "Slug", detail: "يُولّد من الاسم فور الحفظ" },
              { label: "SEO Title", detail: "يُولّد تلقائياً إذا لم تُدخله يدوياً" },
              { label: "SEO Description", detail: "يُولّد تلقائياً إذا لم تُدخله يدوياً" },
              { label: "Canonical URL", detail: "/category/[slug] · /tag/[slug] · /industry/[slug]" },
              { label: "OG Tags", detail: "تُملأ من حقول SEO + صورة المشاركة" },
              { label: "زر Revalidate", detail: "متاح في كل كيان — يُحدّث الكاش فوراً" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border/40 last:border-0">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground text-end max-w-[200px]">{item.detail}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </GuidelineLayout>
  );
}
