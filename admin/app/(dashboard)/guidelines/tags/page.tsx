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
  CheckCircle2,
  Tag,
  AlertCircle,
  Layers,
  Search,
  Lightbulb,
  Zap,
} from "lucide-react";

const formFields = [
  {
    field: "الاسم",
    key: "name",
    required: true,
    description: "اسم الوسم — يجب أن يكون واضحاً ومحدداً",
    example: "SEO، تصميم مواقع، تسويق رقمي",
  },
  {
    field: "الرابط (Slug)",
    key: "slug",
    required: false,
    description: "يُولّد تلقائياً من الاسم — لا يحتاج إدخال يدوي",
    example: "seo, web-design, digital-marketing",
  },
  {
    field: "الوصف",
    key: "description",
    required: false,
    description: "وصف مختصر للوسم — 50 حرف على الأقل",
    example: "يظهر في صفحة الوسم ويساعد الزائر على فهم المحتوى المرتبط",
  },
  {
    field: "عنوان SEO",
    key: "seoTitle",
    required: false,
    description: "العنوان الذي يظهر في نتائج البحث — 50 إلى 60 حرف",
    example: "يُولّد تلقائياً عند الحفظ إذا لم يُدخل يدوياً",
  },
  {
    field: "وصف SEO",
    key: "seoDescription",
    required: false,
    description: "الوصف الذي يظهر في نتائج البحث — حتى 160 حرف",
    example: "يُولّد تلقائياً عند الحفظ إذا لم يُدخل يدوياً",
  },
  {
    field: "صورة المشاركة",
    key: "socialImage",
    required: false,
    description: "صورة تظهر عند مشاركة صفحة الوسم — ترفع عبر Cloudinary",
    example: "المقاس المطلوب: 1200×630",
  },
];

const categoryVsTag = [
  { aspect: "التنظيم", category: "هرمي (فئة رئيسية ← فئة فرعية)", tag: "مسطح (بدون تسلسل)" },
  { aspect: "العلاقة بالمقال", category: "فئة واحدة لكل مقال", tag: "3-5 وسوم لكل مقال" },
  { aspect: "الغرض", category: "تصنيف رئيسي للمحتوى", tag: "ربط المحتوى المتشابه عبر الفئات" },
  { aspect: "مثال", category: "التسويق الرقمي → تحسين محركات البحث", tag: "SEO، Google، أدوات مجانية" },
];

const bestPractices = [
  { tip: "استخدم 3 إلى 5 وسوم لكل مقال", detail: "كثرة الوسوم تُضعف فعاليتها — اختر الأكثر صلة فقط" },
  { tip: "اجعل الوسوم محددة وليست عامة", detail: "\"SEO\" وسم جيد — \"مقالات\" وسم عام جداً لا يفيد" },
  { tip: "لا تكرر اسم الفئة كوسم", detail: "إذا كانت الفئة \"التسويق الرقمي\" لا تضف وسم بنفس الاسم" },
  { tip: "أعد استخدام الوسوم الموجودة", detail: "قبل إنشاء وسم جديد، تأكد أنه غير موجود مسبقاً — تجنب التكرار" },
  { tip: "استخدم وسوم تعكس بحث الزوار", detail: "اختر كلمات يبحث عنها جمهورك — الوسوم تساعد في الربط الداخلي" },
];

const autoFeatures = [
  { feature: "الرابط (Slug)", detail: "يُولّد تلقائياً من الاسم" },
  { feature: "عنوان SEO", detail: "يُولّد تلقائياً عند الحفظ إذا لم يُدخل" },
  { feature: "وصف SEO", detail: "يُولّد تلقائياً عند الحفظ إذا لم يُدخل" },
  { feature: "إعادة التحقق", detail: "زر Revalidate متاح لتحديث صفحة الوسم فوراً" },
];

const tagExamples = [
  { tag: "SEO", quality: "good", reason: "محدد ويبحث عنه الزوار" },
  { tag: "تصميم UI", quality: "good", reason: "واضح ومرتبط بمحتوى محدد" },
  { tag: "أدوات مجانية", quality: "good", reason: "يربط مقالات متعددة حول نفس الموضوع" },
  { tag: "مقالات", quality: "bad", reason: "عام جداً — كل المحتوى مقالات" },
  { tag: "معلومات", quality: "bad", reason: "غير محدد — لا يضيف قيمة للتصنيف" },
  { tag: "2025", quality: "bad", reason: "سنة فقط — لا يصف محتوى" },
];

export default function TagsGuidelinesPage() {
  return (
    <GuidelineLayout
      title="Tags"
      description="دليل إنشاء الوسوم — الحقول، الفرق عن الفئات، وأفضل الممارسات"
    >
      {/* Form Fields Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-violet-500" />
            <CardTitle className="text-base">حقول نموذج الوسم</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            الحقول المتاحة عند إنشاء أو تعديل وسم
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الحقل</TableHead>
                <TableHead>الشرح</TableHead>
                <TableHead>ملاحظة</TableHead>
                <TableHead className="w-20">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formFields.map((f) => (
                <TableRow key={f.key}>
                  <TableCell>
                    <span className="font-medium text-sm">{f.field}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[250px]">
                    {f.description}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                    {f.example}
                  </TableCell>
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

      {/* Category vs Tag Comparison */}
      <Card className="border-violet-500/20 bg-violet-500/[0.03]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-violet-500" />
            <CardTitle className="text-base">الفرق بين الوسوم والفئات</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            الوسوم مسطحة (بدون تسلسل) وتُستخدم لربط المحتوى المتشابه عبر فئات مختلفة
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الجانب</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>الوسم</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryVsTag.map((row) => (
                <TableRow key={row.aspect}>
                  <TableCell>
                    <span className="font-medium text-sm">{row.aspect}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.category}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.tag}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <CardTitle className="text-base">أفضل الممارسات</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {bestPractices.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{item.tip}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Auto SEO Features */}
        <Card className="border-blue-500/20 bg-blue-500/[0.03]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-base">خصائص تلقائية</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              النظام يعالج هذه الخصائص تلقائياً — لا تحتاج إدخال يدوي
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {autoFeatures.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-0">
                <span className="font-medium">{item.feature}</span>
                <span className="text-muted-foreground text-end max-w-[200px]">{item.detail}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* SEO Note */}
        <Card className="border-amber-500/20 bg-amber-500/[0.03]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-base">ملاحظات SEO</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                كل وسم يُنشئ صفحة خاصة به — تأكد أن كل وسم يحتوي مقالات كافية (3 على الأقل)
              </p>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                عنوان SEO ووصف SEO يُولّدان تلقائياً عند الحفظ — يمكنك تعديلهما لاحقاً
              </p>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                بعد تعديل الوسم، استخدم زر Revalidate لتحديث الصفحة فوراً في الموقع
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tag Examples */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base">أمثلة على وسوم جيدة وسيئة</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03]">
              <p className="text-xs font-semibold text-emerald-600 mb-2">وسوم جيدة</p>
              <div className="space-y-2">
                {tagExamples.filter((t) => t.quality === "good").map((t, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">{t.tag}</span>
                      <span className="text-muted-foreground"> — {t.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/[0.03]">
              <p className="text-xs font-semibold text-red-500 mb-2">وسوم سيئة</p>
              <div className="space-y-2">
                {tagExamples.filter((t) => t.quality === "bad").map((t, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <AlertCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">{t.tag}</span>
                      <span className="text-muted-foreground"> — {t.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </GuidelineLayout>
  );
}
