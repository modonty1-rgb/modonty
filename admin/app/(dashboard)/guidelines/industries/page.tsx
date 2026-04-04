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
  Briefcase,
  AlertCircle,
  Users,
  Search,
  Zap,
  Lightbulb,
} from "lucide-react";

const formFields = [
  {
    field: "الاسم",
    key: "name",
    required: true,
    description: "اسم القطاع — يجب أن يكون واضحاً ومعروفاً",
    example: "التقنية، الرعاية الصحية، التعليم",
  },
  {
    field: "الرابط (Slug)",
    key: "slug",
    required: false,
    description: "يُولّد تلقائياً من الاسم — لا يحتاج إدخال يدوي",
    example: "technology, healthcare, education",
  },
  {
    field: "الوصف",
    key: "description",
    required: false,
    description: "وصف مختصر للقطاع — 50 حرف على الأقل",
    example: "يظهر في صفحة القطاع ويساعد في تعريف نوع النشاط",
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
    description: "صورة تظهر عند مشاركة صفحة القطاع — ترفع عبر Cloudinary",
    example: "المقاس المطلوب: 1200×630",
  },
];

const bestPractices = [
  { tip: "استخدم أسماء قطاعات معروفة ومتعارف عليها", detail: "\"التقنية\" أفضل من \"تكنولوجيا المعلومات والاتصالات\" — البساطة أولاً" },
  { tip: "حافظ على قائمة مركزة (10 إلى 20 قطاع)", detail: "قائمة طويلة جداً تُصعّب الاختيار على فريق العمل وتُشتت التصنيف" },
  { tip: "تجنب التداخل بين أسماء القطاعات", detail: "لا تنشئ \"التقنية\" و\"تكنولوجيا المعلومات\" — اختر اسماً واحداً" },
  { tip: "كل عميل يُصنّف في قطاع واحد", detail: "عند إضافة عميل جديد، تختار له القطاع الأنسب لنشاطه التجاري" },
  { tip: "راجع القطاعات دورياً", detail: "إذا كان قطاع فيه عميل واحد فقط — فكّر في دمجه مع قطاع أقرب" },
];

const autoFeatures = [
  { feature: "الرابط (Slug)", detail: "يُولّد تلقائياً من الاسم" },
  { feature: "عنوان SEO", detail: "يُولّد تلقائياً عند الحفظ إذا لم يُدخل" },
  { feature: "وصف SEO", detail: "يُولّد تلقائياً عند الحفظ إذا لم يُدخل" },
];

const industryExamples = [
  { name: "التقنية", clients: "شركات البرمجيات، التطبيقات، الاستضافة" },
  { name: "الرعاية الصحية", clients: "المستشفيات، العيادات، شركات الأدوية" },
  { name: "التعليم", clients: "المدارس، الجامعات، منصات التعلم" },
  { name: "التجارة الإلكترونية", clients: "المتاجر الإلكترونية، منصات البيع" },
  { name: "العقارات", clients: "شركات التطوير، الوساطة العقارية" },
  { name: "الأغذية والمشروبات", clients: "المطاعم، المصانع الغذائية" },
];

export default function IndustriesGuidelinesPage() {
  return (
    <GuidelineLayout
      title="Industries"
      description="دليل إدارة القطاعات — الحقول، العلاقة بالعملاء، وأفضل الممارسات"
    >
      {/* Form Fields Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base">حقول نموذج القطاع</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            الحقول المتاحة عند إنشاء أو تعديل قطاع
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

      {/* Purpose & Relationship */}
      <Card className="border-blue-500/20 bg-blue-500/[0.03]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base">الغرض والعلاقة بالعملاء</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              القطاعات تُصنّف العملاء حسب نوع نشاطهم التجاري — كل عميل يُربط بقطاع واحد عند إنشائه
            </p>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              التصنيف يساعد في تنظيم العملاء، تصفيتهم بسهولة، وعرضهم في الموقع حسب القطاع
            </p>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              صفحة كل قطاع تعرض جميع العملاء المنتمين له — تأكد أن التصنيف دقيق
            </p>
          </div>
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
                كل قطاع يُنشئ صفحة خاصة به في الموقع — تأكد من كتابة وصف واضح
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
                صورة المشاركة تظهر عند نشر رابط صفحة القطاع في وسائل التواصل
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Industry Examples */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base">أمثلة على قطاعات مقترحة</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            قائمة استرشادية — اختر القطاعات المناسبة لعملائك الفعليين
          </p>
        </CardHeader>
        <CardContent className="p-0">
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
                  <TableCell>
                    <span className="font-medium text-sm">{ind.name}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{ind.clients}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </GuidelineLayout>
  );
}
