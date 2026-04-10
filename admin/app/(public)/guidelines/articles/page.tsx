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
  FileText,
  Pen,
  Image as ImageIcon,
  Search,
  Settings,
  Zap,
  Clock,
  CircleHelp,
  Link2,
  Globe,
  BarChart3,
} from "lucide-react";

const articleSteps = [
  {
    step: 1,
    name: "Basic",
    icon: FileText,
    fields: "العنوان، العميل، الكاتب، الفئة",
    required: true,
    description: "أساسيات المقال — العنوان يُولّد الرابط تلقائياً",
  },
  {
    step: 2,
    name: "Keywords",
    icon: Search,
    fields: "الكلمات المفتاحية المستهدفة",
    required: false,
    description: "كلمات مرجعية للكاتب — تساعد في توجيه المحتوى",
  },
  {
    step: 3,
    name: "Content",
    icon: Pen,
    fields: "محتوى المقال (محرر نصوص)",
    required: true,
    description: "المحرر يدعم: عناوين، قوائم، جداول، روابط، صور، اقتباسات",
  },
  {
    step: 4,
    name: "Media",
    icon: ImageIcon,
    fields: "الصورة الرئيسية + معرض الصور",
    required: false,
    description: "اختر من مكتبة صور العميل — المقاس المطلوب: 1200×630",
  },
  {
    step: 5,
    name: "FAQs",
    icon: CircleHelp,
    fields: "أسئلة وأجوبة",
    required: false,
    description: "أسئلة متعلقة بالمقال — تظهر كـ FAQ Schema في Google",
  },
  {
    step: 6,
    name: "Meta Tags",
    icon: Search,
    fields: "عنوان SEO + الوصف",
    required: true,
    description: "العنوان: 30-60 حرف | الوصف: 120-160 حرف",
  },
  {
    step: 7,
    name: "Semantic",
    icon: Globe,
    fields: "كيانات ومفاهيم",
    required: false,
    description: "ربط المقال بمفاهيم محددة (مثل: اسم شركة، تقنية، مصطلح)",
  },
  {
    step: 8,
    name: "Citations",
    icon: Link2,
    fields: "المصادر والمراجع",
    required: false,
    description: "روابط المصادر الموثوقة — تُستخرج تلقائياً من محتوى المقال",
  },
  {
    step: 9,
    name: "Related",
    icon: FileText,
    fields: "مقالات ذات صلة",
    required: false,
    description: "ربط مقالات مشابهة — يحسّن التنقل ومدة بقاء الزائر",
  },
  {
    step: 10,
    name: "Publication",
    icon: Clock,
    fields: "حالة النشر، الجدولة، المراجعة",
    required: true,
    description: "مسودة → قيد الكتابة → مراجعة → منشور",
  },
  {
    step: 11,
    name: "Technical SEO",
    icon: Settings,
    fields: "معاينة Google + Social + Canonical",
    required: false,
    description: "معاينة حية لشكل المقال في نتائج البحث والسوشال",
  },
  {
    step: 12,
    name: "Meta & JSON-LD",
    icon: BarChart3,
    fields: "البيانات المنظمة",
    required: false,
    description: "يُولّد تلقائياً — لا يحتاج تعديل يدوي",
  },
];

const contentTips = [
  { tip: "العنوان القوي يبدأ برقم أو سؤال", example: "\"7 طرق لتحسين ظهور موقعك في Google\"" },
  { tip: "استخدم عناوين فرعية (H2, H3) كل 200-300 كلمة", example: "يسهّل القراءة ويحسّن SEO" },
  { tip: "أضف صورة واحدة على الأقل مع Alt Text", example: "الصور تزيد التفاعل بنسبة 94%" },
  { tip: "اكتب مقدمة قوية في أول 100 كلمة", example: "Google يعرض أول 160 حرف في النتائج" },
  { tip: "أضف روابط داخلية لمقالات أخرى", example: "يحسّن التنقل ويزيد مدة بقاء الزائر" },
  { tip: "استخدم قوائم مرقمة ونقطية", example: "القوائم أسهل في القراءة من الفقرات الطويلة" },
];

const autoFeatures = [
  { feature: "الرابط (Slug)", detail: "يُولّد تلقائياً من العنوان" },
  { feature: "عدد الكلمات", detail: "يُحسب تلقائياً أثناء الكتابة" },
  { feature: "وقت القراءة", detail: "يُحسب تلقائياً (200 كلمة/دقيقة)" },
  { feature: "عمق المحتوى", detail: "قصير / متوسط / طويل — حسب عدد الكلمات" },
  { feature: "المصادر", detail: "تُستخرج تلقائياً من الروابط الخارجية في المحتوى" },
  { feature: "البيانات المنظمة", detail: "JSON-LD يُولّد تلقائياً عند النشر" },
  { feature: "Canonical URL", detail: "يُعيّن تلقائياً: /articles/{slug}" },
  { feature: "OG Tags", detail: "تُملأ تلقائياً من عنوان SEO والوصف والصورة" },
];

export default function ArticlesGuidelinesPage() {
  return (
    <GuidelineLayout
      title="Articles"
      description="دليل إنشاء المقالات — الخطوات، الحقول، والنصائح لمحتوى احترافي"
    >
      {/* 12-Step Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-500" />
            <CardTitle className="text-base">خطوات إنشاء المقال (12 خطوة)</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            كل مقال يمر بـ 12 خطوة — الخطوات المطلوبة يجب إكمالها قبل النشر
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>الخطوة</TableHead>
                <TableHead>الحقول</TableHead>
                <TableHead>الشرح</TableHead>
                <TableHead className="w-20">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articleSteps.map((s) => {
                const Icon = s.icon;
                return (
                  <TableRow key={s.step}>
                    <TableCell>
                      <span className="text-xs font-mono text-muted-foreground">{s.step}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium text-sm">{s.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.fields}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[250px]">{s.description}</TableCell>
                    <TableCell>
                      {s.required ? (
                        <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-500">مطلوب</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] border-muted-foreground/30 text-muted-foreground">اختياري</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Content Writing Tips */}
      <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Pen className="h-4 w-4 text-emerald-500" />
            <CardTitle className="text-base">نصائح كتابة المحتوى</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {contentTips.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{item.tip}</p>
                <p className="text-xs text-muted-foreground">{item.example}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Auto Features */}
        <Card className="border-blue-500/20 bg-blue-500/[0.03]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-base">خصائص تلقائية</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              هذه الخصائص لا تحتاج إدخال يدوي — النظام يعالجها تلقائياً
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

        {/* AI Assistant */}
        <Card className="border-violet-500/20 bg-violet-500/[0.03]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-violet-500" />
              <CardTitle className="text-base">مساعد الذكاء الاصطناعي</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              في خطوة المحتوى، يمكنك استخدام مساعد AI لتوليد مسودة أولية:
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-xs font-mono text-muted-foreground mt-0.5">1</span>
                <p className="text-xs">أدخل الكلمات المفتاحية في خطوة Keywords أولاً</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs font-mono text-muted-foreground mt-0.5">2</span>
                <p className="text-xs">اضغط على زر &quot;AI Assistant&quot; في خطوة Content</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs font-mono text-muted-foreground mt-0.5">3</span>
                <p className="text-xs">اختر طول المقال (قصير / متوسط / طويل)</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs font-mono text-muted-foreground mt-0.5">4</span>
                <p className="text-xs">راجع المسودة وعدّلها قبل القبول</p>
              </div>
            </div>
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-600 font-medium">
                المسودة نقطة بداية فقط — راجعها وأضف لمستك الشخصية دائماً
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Publication Status Flow */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base">دورة حياة المقال</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[
              { label: "مسودة", color: "bg-muted text-muted-foreground" },
              { label: "→", color: "text-muted-foreground" },
              { label: "قيد الكتابة", color: "bg-blue-500/10 text-blue-500 border border-blue-500/20" },
              { label: "→", color: "text-muted-foreground" },
              { label: "مراجعة", color: "bg-amber-500/10 text-amber-500 border border-amber-500/20" },
              { label: "→", color: "text-muted-foreground" },
              { label: "منشور", color: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" },
            ].map((item, i) =>
              item.label === "→" ? (
                <span key={i} className={`text-lg ${item.color}`}>{item.label}</span>
              ) : (
                <span key={i} className={`px-3 py-1.5 rounded-full text-xs font-medium ${item.color}`}>
                  {item.label}
                </span>
              )
            )}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            المقال لا يظهر للزوار إلا عند تغيير الحالة إلى &quot;منشور&quot; — يمكنك أيضاً جدولة النشر لتاريخ مستقبلي
          </p>
        </CardContent>
      </Card>

      {/* SEO Checklist */}
      <Card className="border-amber-500/20 bg-amber-500/[0.03]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base">قائمة مراجعة SEO قبل النشر</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "عنوان SEO بين 30-60 حرف",
              "وصف SEO بين 120-160 حرف",
              "صورة رئيسية مع Alt Text",
              "عنوان فرعي واحد على الأقل (H2)",
              "رابط داخلي واحد على الأقل",
              "الفئة محددة",
              "3-5 وسوم (Tags) مناسبة",
              "مراجعة المعاينة في Google Preview",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="h-4 w-4 rounded border border-muted-foreground/30 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </GuidelineLayout>
  );
}
