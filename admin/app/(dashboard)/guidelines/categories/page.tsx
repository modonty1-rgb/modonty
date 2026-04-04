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
  CheckCircle2,
  Search,
  Zap,
  Lightbulb,
  AlertCircle,
  Network,
} from "lucide-react";

const formFields = [
  { field: "الاسم", key: "name", required: true, description: "اسم التصنيف — واضح ومختصر" },
  { field: "التصنيف الأب", key: "parentId", required: false, description: "لإنشاء تصنيف فرعي — اختر من القائمة المنسدلة" },
  { field: "الرابط (Slug)", key: "slug", required: true, description: "يُولّد تلقائياً من الاسم — يُستخدم في رابط صفحة التصنيف" },
  { field: "الوصف", key: "description", required: false, description: "وصف مختصر للتصنيف — يُنصح بـ 50 حرف على الأقل" },
  { field: "عنوان SEO", key: "seoTitle", required: false, description: "العنوان في نتائج البحث — الأفضل بين 50-60 حرف" },
  { field: "وصف SEO", key: "seoDescription", required: false, description: "الوصف في نتائج البحث — الأفضل 160 حرف كحد أقصى" },
  { field: "صورة التصنيف", key: "socialImage", required: false, description: "صورة تظهر عند مشاركة رابط التصنيف — تُرفع عبر Cloudinary" },
];

const hierarchyRules = [
  { rule: "تصنيف رئيسي (أب)", example: "مثل: \"التقنية\"، \"الأعمال\"، \"الصحة\"", detail: "تصنيفات عامة تُنظّم المحتوى في مجموعات كبيرة" },
  { rule: "تصنيف فرعي (ابن)", example: "مثل: \"تطوير المواقع\" تحت \"التقنية\"", detail: "تصنيفات أكثر تحديداً — تُنشئ تسلسل منطقي للمحتوى" },
  { rule: "عرض الشجرة", example: "متاح في صفحة التصنيفات", detail: "يمكنك عرض التسلسل الكامل للتصنيفات في شكل شجرة" },
];

const bestPractices = [
  { tip: "اختر أسماء واضحة ومحددة", detail: "\"تطوير المواقع\" أفضل من \"تطوير\" — الوضوح يساعد الزائر ومحركات البحث" },
  { tip: "حافظ على تسلسل منطقي", detail: "كل تصنيف فرعي يجب أن يكون جزءاً طبيعياً من التصنيف الأب" },
  { tip: "التزم بعمق ثابت", detail: "استخدم مستوى واحد أو اثنين كحد أقصى — التعمّق أكثر يُربك الزائر" },
  { tip: "لا تكرر التصنيفات", detail: "تجنّب وجود تصنيفين بنفس المعنى — استخدم الوسوم (Tags) للمواضيع المتداخلة" },
  { tip: "راجع التصنيفات دورياً", detail: "احذف التصنيفات الفارغة أو ادمج المتشابهة" },
];

const seoFeatures = [
  { feature: "البيانات المنظمة", detail: "يُولّد تلقائياً عند نشر التصنيف" },
  { feature: "Canonical URL", detail: "يُعيّن تلقائياً: /categories/{slug}" },
  { feature: "OG Tags", detail: "تُملأ من عنوان ووصف SEO وصورة التصنيف" },
  { feature: "زر إعادة التحقق", detail: "متاح في صفحة التصنيف — يُحدّث الكاش عند تعديل البيانات" },
];

const tips = [
  "العدد المثالي للتصنيفات الرئيسية: 5 إلى 15 تصنيف",
  "تجنّب التعمّق أكثر من مستويين (أب ← ابن)",
  "كل تصنيف يجب أن يحتوي 3 مقالات على الأقل ليكون مفيداً",
  "استخدم الوصف لشرح محتوى التصنيف للزائر ولمحركات البحث",
  "أضف صورة للتصنيفات الرئيسية — تُحسّن المظهر عند المشاركة",
];

export default function CategoriesGuidelinesPage() {
  return (
    <GuidelineLayout
      title="Categories"
      description="دليل إدارة التصنيفات — الحقول، التسلسل، وأفضل الممارسات"
    >
      {/* Form Fields Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FolderTree className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base">حقول التصنيف</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            الحقول المتاحة عند إنشاء أو تعديل تصنيف
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
              {formFields.map((f) => (
                <TableRow key={f.key}>
                  <TableCell>
                    <span className="font-medium text-sm">{f.field}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[300px]">
                    {f.description}
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

      {/* Hierarchy */}
      <Card className="border-blue-500/20 bg-blue-500/[0.03]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base">التسلسل الهرمي</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            التصنيفات تدعم مستوى أب وابن — لتنظيم المحتوى بشكل منطقي
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {hierarchyRules.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{item.rule}</p>
                <p className="text-xs text-muted-foreground">{item.example}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-emerald-500" />
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
        {/* SEO Auto Features */}
        <Card className="border-amber-500/20 bg-amber-500/[0.03]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-base">SEO تلقائي</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              هذه الخصائص يعالجها النظام — لا تحتاج إدخال يدوي
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {seoFeatures.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-0">
                <span className="font-medium">{item.feature}</span>
                <span className="text-muted-foreground text-end max-w-[180px]">{item.detail}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="border-violet-500/20 bg-violet-500/[0.03]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-violet-500" />
              <CardTitle className="text-base">نصائح سريعة</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                <p className="text-xs">{tip}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </GuidelineLayout>
  );
}
