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
  Settings,
  Eye,
  Users,
  Globe,
  Zap,
  AlertCircle,
  Target,
  Monitor,
} from "lucide-react";

// ─── GTM data ─────────────────────────────────────────────────────────────────
const setupSteps = [
  { step: 1, title: "احصل على معرّف الحاوية (Container ID)", detail: "من حسابك في Google Tag Manager — الصيغة: GTM-XXXXXXX" },
  { step: 2, title: "ادخل المعرّف في الإعدادات", detail: "الإعدادات ← تبويب GTM ← أدخل المعرّف واحفظ" },
  { step: 3, title: "النظام يتكفل بالباقي", detail: "الكود يُضاف تلقائياً لجميع صفحات الموقع — لا تحتاج تعديل أي شيء" },
];

const autoTrackedEvents = [
  { event: "مشاهدة الصفحة", description: "يُسجّل تلقائياً عند زيارة أي صفحة في الموقع", scope: "جميع الصفحات" },
  { event: "قراءة مقال", description: "يُسجّل عند فتح صفحة مقال — يشمل عنوان المقال والعميل", scope: "صفحات المقالات" },
  { event: "زيارة صفحة عميل", description: "يُسجّل عند زيارة صفحة العميل الرئيسية", scope: "صفحات العملاء" },
];

const settingsLocations = [
  { location: "GTM العام للموقع", path: "الإعدادات ← تبويب GTM", description: "يُطبّق على جميع صفحات الموقع", type: "عام" },
  { location: "GTM لعميل محدد", path: "العملاء ← اختر العميل ← الإعدادات", description: "يُطبّق على صفحات العميل ومقالاته فقط", type: "خاص" },
];

// ─── Analytics data ───────────────────────────────────────────────────────────
const keyMetrics = [
  {
    metric: "عدد الزيارات (Page Views)",
    icon: Eye,
    description: "عدد مرات مشاهدة الصفحات — خط بياني يومي",
    tip: "ارتفاع مفاجئ = مقال حقق انتشار · انخفاض = راجع المحتوى الأخير",
  },
  {
    metric: "الزوار الفريدون (Unique Visitors)",
    icon: Users,
    description: "عدد الأشخاص المختلفين — شخص واحد قد يزور 5 صفحات لكنه زائر فريد واحد",
    tip: "أهم من عدد الزيارات — يعكس حجم الجمهور الحقيقي",
  },
  {
    metric: "مصادر الزيارات",
    icon: Globe,
    description: "من أين يأتي الزوار: بحث، مباشر، سوشال، إحالة",
    tip: "نسبة عالية من محركات البحث = المحتوى يعمل جيداً في SEO",
  },
  {
    metric: "أكثر المحتوى مشاهدة",
    icon: TrendingUp,
    description: "ترتيب المقالات حسب عدد المشاهدات",
    tip: "استخدم المقالات الأكثر مشاهدة كمرجع لكتابة محتوى مشابه",
  },
];

const trafficSignals = [
  { signal: "الزيارات ترتفع باستمرار", meaning: "المحتوى يعمل — استمر بنفس الاستراتيجية", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/[0.05] border-emerald-500/20" },
  { signal: "الزيارات ثابتة بدون نمو", meaning: "تحتاج محتوى جديد أو تحسين المقالات الحالية", icon: Target, color: "text-amber-500", bg: "bg-amber-500/[0.05] border-amber-500/20" },
  { signal: "الزيارات تنخفض", meaning: "راجع: هل توقفت عن النشر؟ هل المحتوى قديم؟ هل هناك مشكلة تقنية؟", icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/[0.05] border-red-500/20" },
];

const combinedPractices = [
  { practice: "تحقق من التتبع بعد إعداد GTM", detail: "استخدم وضع المعاينة (Preview Mode) في GTM للتأكد أن البيانات تُرسل" },
  { practice: "حاوية GTM منفصلة لكل عميل", detail: "فصل البيانات يمنع الخلط ويسهّل تقارير كل عميل" },
  { practice: "راجع الإحصائيات أسبوعياً", detail: "خصص وقت ثابت — الاستمرارية أهم من مراجعة الأرقام يومياً" },
  { practice: "قارن شهر بشهر لا يوم بيوم", detail: "الاتجاه العام على أسابيع هو المقياس الصحيح — لا تحكم على يوم واحد" },
  { practice: "اكتب المزيد عن المواضيع الناجحة", detail: "أكثر المقالات مشاهدة = دليل على ما يريده جمهورك — استمر فيه" },
];

export default function TrackingGuidelinesPage() {
  return (
    <GuidelineLayout
      title="Tracking & Performance"
      description="GTM + Analytics — إعداد التتبع وقراءة البيانات لتحسين المحتوى"
    >

      {/* ── Flow ─────────────────────────────────────────────────────────── */}
      <Card className="border-blue-500/20 bg-blue-500/[0.03]">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { label: "GTM", sub: "يجمع البيانات من الموقع", color: "border-blue-500/30 bg-blue-500/[0.08] text-blue-400" },
              { label: "→" },
              { label: "Google Analytics", sub: "تستقبل وتحلل البيانات", color: "border-violet-500/30 bg-violet-500/[0.08] text-violet-400" },
              { label: "→" },
              { label: "لوحة الإحصائيات", sub: "تقرأ النتائج في الأدمن", color: "border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-400" },
            ].map((step, i) =>
              "sub" in step ? (
                <div key={i} className={`rounded-lg border px-3 py-1.5 text-center ${step.color}`}>
                  <p className="text-[10px] font-bold">{step.label}</p>
                  <p className="text-[9px] text-muted-foreground">{step.sub}</p>
                </div>
              ) : (
                <span key={i} className="text-muted-foreground text-sm">{step.label}</span>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── GTM Setup ────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-emerald-500" />
            <CardTitle className="text-base">إعداد GTM — ٣ خطوات فقط</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">الإعداد يتم مرة واحدة — النظام يتكفل بالباقي</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* What gets tracked */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-violet-500" />
              <CardTitle className="text-base">ماذا يُتتبّع تلقائياً؟</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">بدون أي إعداد إضافي</p>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الحدث</TableHead>
                  <TableHead>النطاق</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {autoTrackedEvents.map((e) => (
                  <TableRow key={e.event}>
                    <TableCell>
                      <p className="font-medium text-sm">{e.event}</p>
                      <p className="text-[10px] text-muted-foreground">{e.description}</p>
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

        {/* Settings locations */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-base">أين تجد إعدادات GTM</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {settingsLocations.map((loc) => (
              <div key={loc.location} className="flex items-start gap-2 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                <Zap className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium">{loc.location}</p>
                    <Badge variant="outline" className="text-[10px]">{loc.type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{loc.path}</p>
                  <p className="text-xs text-muted-foreground">{loc.description}</p>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.05] p-2.5">
              <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[10px] text-muted-foreground">
                بعد إضافة معرّف GTM، انتظر 24-48 ساعة لتظهر البيانات في Analytics — استخدم Preview Mode للتحقق الفوري
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Key Metrics ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base">المقاييس الأساسية — اقرأها معاً للحصول على الصورة الكاملة</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-0 divide-y divide-border/50">
          {keyMetrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.metric} className="flex items-start gap-3 py-3">
                <Icon className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{m.metric}</p>
                  <p className="text-xs text-muted-foreground">{m.description}</p>
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

      {/* ── Traffic Signals ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {trafficSignals.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.signal} className={`rounded-xl border p-4 ${item.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-4 w-4 ${item.color} shrink-0`} />
                <p className={`text-xs font-semibold ${item.color}`}>{item.signal}</p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{item.meaning}</p>
            </div>
          );
        })}
      </div>

      {/* ── Combined Best Practices ───────────────────────────────────────── */}
      <Card className="border-emerald-500/20 bg-emerald-500/[0.02]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <CardTitle className="text-base">أفضل الممارسات — GTM + Analytics</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {combinedPractices.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium">{item.practice}</p>
                <p className="text-[11px] text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

    </GuidelineLayout>
  );
}
