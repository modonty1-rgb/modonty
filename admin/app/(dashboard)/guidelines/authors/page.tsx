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
  User,
  Shield,
  Zap,
  Star,
  Eye,
  Award,
  BookOpen,
  Link2,
  Image as ImageIcon,
} from "lucide-react";

const profileFields = [
  {
    field: "الاسم (Name)",
    required: true,
    description: "اسم الكاتب — يظهر في كل المقالات وصفحة الكاتب",
    tip: "استخدم اسم العلامة التجارية: \"مدونتي\"",
  },
  {
    field: "الرابط (Slug)",
    required: false,
    description: "يُولّد تلقائياً من الاسم — لا يحتاج تعديل",
    tip: "مثال: modonty",
  },
  {
    field: "المسمى الوظيفي (Job Title)",
    required: true,
    description: "يظهر بجانب الاسم في المقالات وفي بيانات Google",
    tip: "مثال: \"منصة محتوى رقمي\" أو \"منصة تقنية متخصصة\"",
  },
  {
    field: "النبذة التعريفية (Bio)",
    required: false,
    description: "وصف تفصيلي عن الكاتب — يُنصح بـ 100 حرف أو أكثر",
    tip: "اكتب نبذة تعكس خبرة المنصة ومجالات تخصصها",
  },
  {
    field: "صورة الكاتب (Profile Image)",
    required: false,
    description: "صورة مربعة تظهر بجانب المقالات — المقاس: 200×200",
    tip: "استخدم شعار المنصة أو صورة احترافية واضحة",
  },
  {
    field: "عنوان SEO (SEO Title)",
    required: false,
    description: "عنوان صفحة الكاتب في نتائج البحث — 30-60 حرف",
    tip: "مثال: \"مدونتي — منصة محتوى رقمي موثوق\"",
  },
  {
    field: "وصف SEO (SEO Description)",
    required: false,
    description: "وصف صفحة الكاتب في نتائج البحث — 120-160 حرف",
    tip: "صف خبرة المنصة ومجالاتها بشكل مختصر وجذاب",
  },
];

const eeatPillars = [
  {
    letter: "E",
    name: "Experience — الخبرة",
    icon: Eye,
    color: "text-blue-500",
    description: "هل الكاتب لديه خبرة فعلية في الموضوع؟",
    actions: [
      "اكتب نبذة تعكس خبرة المنصة الحقيقية",
      "اذكر المجالات التي تغطيها المنصة",
      "وضّح منذ متى تنشر المنصة المحتوى",
    ],
  },
  {
    letter: "E",
    name: "Expertise — التخصص",
    icon: Award,
    color: "text-violet-500",
    description: "هل الكاتب متخصص في هذا المجال؟",
    actions: [
      "حدد مجالات التخصص بوضوح في النبذة",
      "استخدم مسمى وظيفي يعكس التخصص",
      "اربط الملف الشخصي بحسابات المنصة الرسمية",
    ],
  },
  {
    letter: "A",
    name: "Authority — المصداقية",
    icon: Shield,
    color: "text-emerald-500",
    description: "هل الكاتب مصدر معروف وموثوق؟",
    actions: [
      "أضف روابط حسابات السوشال ميديا",
      "اربط الملف بموقع المنصة الرسمي",
      "حافظ على تحديث المعلومات باستمرار",
    ],
  },
  {
    letter: "T",
    name: "Trust — الثقة",
    icon: Star,
    color: "text-amber-500",
    description: "هل يمكن للزائر الوثوق بهذا المحتوى؟",
    actions: [
      "أكمل جميع حقول الملف الشخصي",
      "استخدم صورة احترافية واضحة",
      "تأكد من دقة كل المعلومات المذكورة",
    ],
  },
];

const adminChecklist = [
  "أكمل جميع حقول الملف الشخصي — خاصة الاسم والمسمى والنبذة",
  "اكتب نبذة قوية (100+ حرف) تعكس خبرة المنصة",
  "أضف صورة احترافية بمقاس 200×200",
  "أضف روابط حسابات السوشال ميديا الرسمية",
  "راجع عنوان ووصف SEO لصفحة الكاتب",
  "حدّث المعلومات عند أي تغيير في هوية المنصة",
];

const autoFeatures = [
  { feature: "Schema.org Person", detail: "بيانات منظمة تُولّد تلقائياً — تساعد Google في فهم هوية الكاتب" },
  { feature: "الرابط (Slug)", detail: "يُولّد تلقائياً من الاسم" },
  { feature: "ربط المقالات", detail: "كل المقالات تُنسب تلقائياً لحساب الكاتب الموحد" },
  { feature: "OG Tags", detail: "بيانات المشاركة تُملأ تلقائياً من بيانات الكاتب" },
];

export default function AuthorsGuidelinesPage() {
  return (
    <GuidelineLayout
      title="Authors"
      description="دليل إدارة ملف الكاتب — نموذج الكاتب الموحد، حقول الملف، ومعايير E-E-A-T"
    >
      {/* Singleton Model Explanation */}
      <Card className="border-blue-500/20 bg-blue-500/[0.03]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base">نموذج الكاتب الموحد</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">
            مدونتي تستخدم <strong>كاتب واحد موحد</strong> — كل المحتوى يُنشر باسم العلامة التجارية &quot;مدونتي&quot;، وليس بأسماء أفراد.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "هوية موحدة", detail: "كل المقالات تظهر باسم واحد — تجربة متسقة للزائر" },
              { label: "إدارة أبسط", detail: "ملف شخصي واحد تديره بدل عدة ملفات" },
              { label: "SEO أقوى", detail: "Google يركز إشارات الثقة في كاتب واحد بدل تشتيتها" },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg border bg-background">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profile Fields Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-500" />
            <CardTitle className="text-base">حقول ملف الكاتب</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            أكمل الحقول المطلوبة أولاً — الحقول الاختيارية تحسّن ظهورك في محركات البحث
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الحقل</TableHead>
                <TableHead>الشرح</TableHead>
                <TableHead>نصيحة</TableHead>
                <TableHead className="w-20">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profileFields.map((f) => (
                <TableRow key={f.field}>
                  <TableCell>
                    <span className="font-medium text-sm">{f.field}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[250px]">
                    {f.description}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                    {f.tip}
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

      {/* E-E-A-T Explanation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-violet-500" />
            <CardTitle className="text-base">معايير E-E-A-T — لماذا ملف الكاتب مهم؟</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Google يقيّم المحتوى بناءً على أربعة معايير — ملف الكاتب المكتمل يحسّن ترتيبك في النتائج
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eeatPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.name} className="p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-4 w-4 ${pillar.color}`} />
                    <span className="font-semibold text-sm">
                      <span className="font-mono">{pillar.letter}</span> — {pillar.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{pillar.description}</p>
                  <ul className="space-y-1">
                    {pillar.actions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Admin Checklist */}
        <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-base">المطلوب منك كمدير</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {adminChecklist.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="h-4 w-4 rounded border border-muted-foreground/30 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Auto Features */}
        <Card className="border-violet-500/20 bg-violet-500/[0.03]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-violet-500" />
              <CardTitle className="text-base">خصائص تلقائية</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              هذه الخصائص يعالجها النظام تلقائياً — لا تحتاج إدخال يدوي
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
      </div>

      {/* Profile Image Guide */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base">مواصفات صورة الكاتب</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03]">
              <p className="text-xs font-semibold text-emerald-600 mb-2">المواصفات المطلوبة</p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>المقاس: 200×200 بكسل (مربع)</li>
                <li>الصيغة: JPG أو PNG</li>
                <li>الحجم: أقل من 50 كيلوبايت</li>
                <li>الجودة: واضحة واحترافية</li>
              </ul>
            </div>
            <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.03]">
              <p className="text-xs font-semibold text-amber-600 mb-2">نصائح</p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>استخدم شعار المنصة بخلفية واضحة</li>
                <li>تجنب الصور المعقدة أو المزدحمة</li>
                <li>تأكد من وضوح الصورة في الحجم الصغير</li>
                <li>نفس الصورة تظهر في المقالات وصفحة الكاتب</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="border-blue-500/20 bg-blue-500/[0.03]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base">روابط السوشال ميديا</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            إضافة روابط الحسابات الرسمية تعزز مصداقية الكاتب عند Google وتسهّل على الزوار متابعة المنصة.
          </p>
          <div className="space-y-2">
            {[
              { platform: "LinkedIn", tip: "رابط صفحة المنصة الرسمية" },
              { platform: "Twitter/X", tip: "حساب المنصة الرسمي (@username)" },
              { platform: "Facebook", tip: "صفحة المنصة الرسمية" },
              { platform: "الموقع الرسمي", tip: "رابط الموقع الرئيسي (مثال: https://modonty.com)" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-0">
                <span className="font-medium">{item.platform}</span>
                <span className="text-muted-foreground">{item.tip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </GuidelineLayout>
  );
}
