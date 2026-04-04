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
  Settings,
  Eye,
  Users,
  BarChart3,
  Zap,
  AlertCircle,
  Tag,
  Lightbulb,
  Monitor,
} from "lucide-react";

const autoTrackedEvents = [
  {
    event: "مشاهدة الصفحة",
    description: "يُسجّل تلقائياً عند زيارة أي صفحة في الموقع",
    scope: "جميع الصفحات",
  },
  {
    event: "قراءة مقال",
    description: "يُسجّل عند فتح صفحة مقال — يشمل عنوان المقال والعميل",
    scope: "صفحات المقالات",
  },
  {
    event: "زيارة صفحة عميل",
    description: "يُسجّل عند زيارة صفحة العميل الرئيسية",
    scope: "صفحات العملاء",
  },
];

const setupSteps = [
  {
    step: 1,
    title: "احصل على معرّف الحاوية (Container ID)",
    detail: "من حسابك في Google Tag Manager — الصيغة: GTM-XXXXXXX",
  },
  {
    step: 2,
    title: "ادخل المعرّف في الإعدادات",
    detail: "الإعدادات ← تبويب GTM ← أدخل المعرّف واحفظ",
  },
  {
    step: 3,
    title: "النظام يتكفل بالباقي",
    detail: "الكود يُضاف تلقائياً لجميع صفحات الموقع — لا تحتاج تعديل أي شيء",
  },
];

const clientTrackingSteps = [
  {
    step: 1,
    title: "افتح إعدادات العميل",
    detail: "من قائمة العملاء ← اختر العميل ← الإعدادات",
  },
  {
    step: 2,
    title: "أدخل معرّف GTM الخاص بالعميل",
    detail: "كل عميل يمكن أن يكون له حاوية GTM مستقلة",
  },
  {
    step: 3,
    title: "النتيجة",
    detail: "صفحات هذا العميل ترسل البيانات لحاوية العميل الخاصة",
  },
];

const bestPractices = [
  { practice: "حاوية واحدة لكل عميل", detail: "فصل البيانات يسهّل التحليل ويمنع الخلط بين بيانات العملاء" },
  { practice: "تحقق من التتبع بعد الإعداد", detail: "استخدم وضع المعاينة في GTM للتأكد أن البيانات تُرسل بشكل صحيح" },
  { practice: "لا تعدّل الكود يدوياً", detail: "النظام يدير كود التتبع تلقائياً — التعديل اليدوي قد يسبب مشاكل" },
  { practice: "راجع البيانات في Google Analytics", detail: "بعد الإعداد، تحقق من GA4 أن البيانات تصل خلال 24-48 ساعة" },
];

const settingsLocations = [
  {
    location: "GTM العام للموقع",
    path: "الإعدادات ← تبويب GTM",
    description: "يُطبّق على جميع صفحات الموقع",
    type: "عام",
  },
  {
    location: "GTM لعميل محدد",
    path: "العملاء ← اختر العميل ← الإعدادات",
    description: "يُطبّق على صفحات العميل ومقالاته فقط",
    type: "خاص",
  },
];

export default function GTMGuidelinesPage() {
  return (
    <GuidelineLayout
      title="Google Tag Manager (GTM)"
      description="دليل تتبع الزوار — كيف يعمل النظام وكيف تعدّه لكل عميل"
    >
      {/* What is GTM */}
      <Card className="border-blue-500/20 bg-blue-500/[0.03]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base">ما هو Google Tag Manager؟</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">
            أداة من Google تتبّع سلوك زوار الموقع — ماذا يشاهدون، من أين أتوا، وكم بقوا.
          </p>
          <div className="space-y-2">
            {[
              "يعمل في الخلفية بدون أي تأثير على سرعة الموقع",
              "لا يحتاج تعديل كود — فقط أدخل المعرّف والنظام يتكفل بالباقي",
              "البيانات تُرسل تلقائياً إلى Google Analytics",
              "كل عميل يمكن أن يكون له تتبع مستقل",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Setup Steps */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-emerald-500" />
            <CardTitle className="text-base">إعداد GTM للموقع</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            ثلاث خطوات فقط — الإعداد يتم مرة واحدة
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {setupSteps.map((s) => (
            <div key={s.step} className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold shrink-0">
                {s.step}
              </span>
              <div>
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.detail}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* What Gets Tracked */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-violet-500" />
            <CardTitle className="text-base">ماذا يُتتبّع تلقائياً؟</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            هذه الأحداث تُسجّل تلقائياً بدون أي إعداد إضافي
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الحدث</TableHead>
                <TableHead>التفاصيل</TableHead>
                <TableHead>النطاق</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {autoTrackedEvents.map((e) => (
                <TableRow key={e.event}>
                  <TableCell>
                    <span className="font-medium text-sm">{e.event}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[300px]">
                    {e.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{e.scope}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Per-Client Tracking */}
      <Card className="border-violet-500/20 bg-violet-500/[0.03]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-violet-500" />
            <CardTitle className="text-base">تتبع مستقل لكل عميل</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            كل عميل يمكن أن يكون له حاوية GTM خاصة — بيانات منفصلة تماماً
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {clientTrackingSteps.map((s) => (
            <div key={s.step} className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-violet-500/10 text-violet-500 text-xs font-semibold shrink-0">
                {s.step}
              </span>
              <div>
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.detail}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GA4 Integration */}
        <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-base">الربط مع Google Analytics</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              بعد إعداد GTM، البيانات تتدفق تلقائياً إلى Google Analytics (GA4)
            </p>
            <div className="space-y-2">
              {[
                "GTM يجمع البيانات من الموقع",
                "البيانات تُرسل إلى GA4 تلقائياً",
                "في GA4 تجد تقارير مفصلة عن الزوار",
                "يمكنك فلترة التقارير حسب العميل",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs font-mono text-muted-foreground mt-0.5">{i + 1}</span>
                  <p className="text-xs">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings Locations */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-base">أين تجد الإعدادات</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {settingsLocations.map((loc) => (
              <div key={loc.location} className="flex items-start gap-2 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                <Zap className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{loc.location}</p>
                    <Badge variant="outline" className="text-[10px]">{loc.type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{loc.path}</p>
                  <p className="text-xs text-muted-foreground">{loc.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Best Practices */}
      <Card className="border-amber-500/20 bg-amber-500/[0.03]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
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

      {/* Important Note */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">ملاحظة مهمة</p>
              <p className="text-xs text-muted-foreground">
                بعد إضافة أو تغيير معرّف GTM، قد تحتاج البيانات 24-48 ساعة لتظهر في Google Analytics.
                استخدم وضع المعاينة (Preview Mode) في GTM للتحقق الفوري من أن التتبع يعمل بشكل صحيح.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </GuidelineLayout>
  );
}
