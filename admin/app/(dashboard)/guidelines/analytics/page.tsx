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
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Eye,
  Globe,
  Download,
  Lightbulb,
  Target,
} from "lucide-react";

const keyMetrics = [
  {
    metric: "عدد الزيارات (Page Views)",
    icon: Eye,
    description: "عدد المرات التي شاهد فيها الزوار صفحات الموقع",
    usage: "يظهر كخط بياني على مدار الوقت — كل نقطة تمثل يوم",
    tip: "ارتفاع مفاجئ = مقال حقق انتشار | انخفاض = راجع المحتوى الأخير",
  },
  {
    metric: "الزوار الفريدون (Unique Visitors)",
    icon: Users,
    description: "عدد الأشخاص المختلفين الذين زاروا الموقع",
    usage: "الفرق عن الزيارات: شخص واحد قد يزور 5 صفحات = 5 زيارات لكن زائر فريد واحد",
    tip: "الزوار الفريدون أهم من عدد الزيارات — يعكسون حجم الجمهور الحقيقي",
  },
  {
    metric: "مصادر الزيارات (Traffic Sources)",
    icon: Globe,
    description: "من أين يأتي الزوار: محركات البحث، مباشر، سوشال ميديا، مواقع أخرى",
    usage: "يظهر كنسب مئوية أو رسم دائري",
    tip: "نسبة عالية من محركات البحث = المحتوى يعمل جيداً في SEO",
  },
  {
    metric: "أكثر المحتوى مشاهدة (Top Content)",
    icon: TrendingUp,
    description: "ترتيب المقالات حسب عدد المشاهدات",
    usage: "يساعد في معرفة أي المواضيع تهم الجمهور أكثر",
    tip: "استخدم المقالات الأكثر مشاهدة كمرجع لكتابة محتوى مشابه",
  },
];

const dashboardSections = [
  {
    section: "رسم الزيارات البياني",
    description: "خط بياني يعرض عدد الزيارات اليومية خلال الفترة المحددة",
    filter: "فلتر التاريخ (7 أيام، 30 يوم، 3 أشهر، سنة)",
  },
  {
    section: "مصادر الزيارات",
    description: "توزيع الزوار حسب المصدر: بحث، مباشر، سوشال، إحالة",
    filter: "نفس فترة التاريخ المحددة",
  },
  {
    section: "أكثر المقالات مشاهدة",
    description: "قائمة بأعلى المقالات أداءً مرتبة حسب عدد المشاهدات",
    filter: "يمكن تغيير الفترة لرؤية الأكثر رواجاً مؤخراً",
  },
  {
    section: "ملخص الأرقام",
    description: "إجمالي الزيارات، الزوار الفريدون، متوسط الزيارات اليومية",
    filter: "مقارنة مع الفترة السابقة (نسبة الزيادة أو الانخفاض)",
  },
];

const bestPractices = [
  { practice: "راجع الإحصائيات أسبوعياً", detail: "خصص وقت ثابت كل أسبوع لمراجعة الأداء — الاستمرارية أهم من التفاصيل" },
  { practice: "قارن شهر بشهر", detail: "المقارنة الشهرية تكشف الاتجاهات الحقيقية — لا تحكم على يوم واحد" },
  { practice: "ركّز على الاتجاهات وليس الأرقام اليومية", detail: "يوم واحد منخفض طبيعي — الأهم هو الاتجاه العام على مدار أسابيع" },
  { practice: "تابع المقالات الجديدة بعد النشر", detail: "راقب أداء كل مقال جديد خلال أول 7 أيام لمعرفة مدى نجاحه" },
  { practice: "استخدم البيانات في قرارات المحتوى", detail: "اكتب المزيد عن المواضيع التي يتفاعل معها الجمهور" },
];

const trafficSignals = [
  {
    signal: "الزيارات ترتفع باستمرار",
    meaning: "المحتوى يعمل — استمر بنفس الاستراتيجية",
    icon: TrendingUp,
    color: "text-emerald-500",
  },
  {
    signal: "الزيارات ثابتة بدون نمو",
    meaning: "تحتاج محتوى جديد أو تحسين المقالات الحالية",
    icon: Target,
    color: "text-amber-500",
  },
  {
    signal: "الزيارات تنخفض",
    meaning: "راجع: هل توقفت عن النشر؟ هل المحتوى قديم؟ هل هناك مشكلة تقنية؟",
    icon: TrendingDown,
    color: "text-red-500",
  },
];

export default function AnalyticsGuidelinesPage() {
  return (
    <GuidelineLayout
      title="Analytics"
      description="دليل لوحة الإحصائيات — كيف تقرأ الأرقام وتستخدمها لتحسين المحتوى"
    >
      {/* Dashboard Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base">ماذا تعرض لوحة الإحصائيات؟</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            لوحة الإحصائيات تعطيك نظرة شاملة على أداء الموقع والمحتوى
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>القسم</TableHead>
                <TableHead>ماذا يعرض</TableHead>
                <TableHead>الفلترة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardSections.map((s) => (
                <TableRow key={s.section}>
                  <TableCell>
                    <span className="font-medium text-sm">{s.section}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[300px]">
                    {s.description}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {s.filter}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Key Metrics Explained */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-violet-500" />
            <CardTitle className="text-base">شرح المقاييس الأساسية</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            كل مقياس يخبرك شيء مختلف — اقرأ الأربعة معاً للحصول على الصورة الكاملة
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {keyMetrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.metric} className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                <Icon className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">{m.metric}</p>
                  <p className="text-xs text-muted-foreground">{m.description}</p>
                  <p className="text-xs text-muted-foreground">{m.usage}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge variant="outline" className="text-[10px] border-violet-500/30 text-violet-500">نصيحة</Badge>
                    <span className="text-xs text-muted-foreground">{m.tip}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* How to Use */}
      <Card className="border-blue-500/20 bg-blue-500/[0.03]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base">كيف تستخدم لوحة الإحصائيات</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { step: "1", text: "اختر الفترة الزمنية من فلتر التاريخ (أسبوع، شهر، 3 أشهر، سنة)" },
            { step: "2", text: "راقب الاتجاه العام في رسم الزيارات — هل يرتفع أم ينخفض؟" },
            { step: "3", text: "تحقق من مصادر الزيارات — من أين يأتي معظم الزوار؟" },
            { step: "4", text: "راجع أكثر المقالات مشاهدة — ما المواضيع التي تجذب الجمهور؟" },
            { step: "5", text: "قارن الفترة الحالية بالسابقة لمعرفة اتجاه النمو" },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-2">
              <span className="text-xs font-mono text-muted-foreground mt-0.5">{item.step}</span>
              <p className="text-xs">{item.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="text-sm font-medium">{item.practice}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Export */}
        <Card className="border-blue-500/20 bg-blue-500/[0.03]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-base">تصدير البيانات</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              يمكنك تصدير بيانات الإحصائيات لاستخدامها في التقارير والعروض التقديمية
            </p>
            <div className="space-y-2">
              {[
                "اختر الفترة الزمنية المطلوبة",
                "اضغط على زر التصدير",
                "البيانات تشمل: الزيارات، المصادر، أداء المقالات",
                "مناسب لتقارير العملاء الشهرية",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Signals */}
      <Card className="border-amber-500/20 bg-amber-500/[0.03]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base">كيف تقرأ إشارات الزيارات</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            الأرقام تحكي قصة — تعلّم كيف تفسّرها
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {trafficSignals.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${item.color}`} />
                <div>
                  <p className="text-sm font-medium">{item.signal}</p>
                  <p className="text-xs text-muted-foreground">{item.meaning}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </GuidelineLayout>
  );
}
