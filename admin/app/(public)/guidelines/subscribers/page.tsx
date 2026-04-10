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
  Mail,
  Shield,
  Users,
  AlertTriangle,
  Zap,
  Heart,
  Filter,
  Download,
  ToggleRight,
} from "lucide-react";

const subscriberFields = [
  {
    field: "البريد الإلكتروني (Email)",
    required: true,
    description: "عنوان البريد الذي سجّل به المشترك",
    note: "يجب أن يكون فريداً — لا يمكن تكراره",
  },
  {
    field: "الاسم (Name)",
    required: false,
    description: "اسم المشترك — يساعد في تخصيص الرسائل",
    note: "اختياري — بعض المشتركين يسجلون بالبريد فقط",
  },
  {
    field: "العميل (Client)",
    required: false,
    description: "العميل المرتبط بهذا المشترك",
    note: "يساعد في تصنيف المشتركين حسب المصدر",
  },
  {
    field: "حالة الاشتراك (Status)",
    required: true,
    description: "مشترك أو غير مشترك",
    note: "يمكن تغييرها من خلال زر التفعيل/الإلغاء",
  },
  {
    field: "تاريخ الاشتراك (Date)",
    required: true,
    description: "تاريخ تسجيل المشترك — يُسجّل تلقائياً",
    note: "مهم لتتبع نمو القائمة البريدية",
  },
];

const features = [
  {
    icon: ToggleRight,
    name: "تفعيل / إلغاء الاشتراك",
    detail: "غيّر حالة أي مشترك بضغطة واحدة — المشترك الملغي لا يستقبل رسائل",
  },
  {
    icon: Filter,
    name: "تصفية حسب الحالة",
    detail: "اعرض المشتركين النشطين فقط أو الملغيين فقط — لسهولة الإدارة",
  },
  {
    icon: Download,
    name: "تصدير القائمة",
    detail: "صدّر قائمة المشتركين كملف — لاستخدامها في أدوات التسويق الخارجية",
  },
];

const privacyRules = [
  {
    rule: "لا تُضف أحداً بدون إذنه",
    detail: "كل مشترك يجب أن يسجّل بنفسه — إضافة أشخاص بدون موافقتهم مخالفة لسياسة الخصوصية",
  },
  {
    rule: "احترم طلبات إلغاء الاشتراك فوراً",
    detail: "عندما يطلب شخص إلغاء اشتراكه، نفّذ الطلب فوراً — لا تؤجل أو تتجاهل",
  },
  {
    rule: "اجمع البيانات الضرورية فقط",
    detail: "البريد الإلكتروني كافٍ — لا تطلب معلومات إضافية لا تحتاجها",
  },
  {
    rule: "احمِ بيانات المشتركين",
    detail: "لا تشارك قائمة المشتركين مع أطراف خارجية — البيانات أمانة",
  },
];

const bestPractices = [
  { tip: "الجودة أهم من الكمية", detail: "100 مشترك متفاعل أفضل من 10,000 مشترك غير مهتم" },
  { tip: "نظّف القائمة دورياً", detail: "احذف العناوين المرتجعة (bounced) والحسابات غير النشطة لفترة طويلة" },
  { tip: "أرسل محتوى قيّم فقط", detail: "كل رسالة يجب أن تقدم فائدة حقيقية — الإزعاج يسبب إلغاء الاشتراك" },
  { tip: "حافظ على وتيرة منتظمة", detail: "أرسل بانتظام (أسبوعياً أو شهرياً) — لا تختفي شهوراً ثم ترسل 10 رسائل" },
  { tip: "تابع معدلات الفتح والنقر", detail: "إذا انخفض التفاعل، راجع المحتوى والتوقيت" },
  { tip: "وفّر خيار إلغاء الاشتراك دائماً", detail: "كل رسالة يجب أن تحتوي رابط إلغاء واضح" },
];

export default function SubscribersGuidelinesPage() {
  return (
    <GuidelineLayout
      title="Subscribers"
      description="دليل إدارة المشتركين — القائمة البريدية، الخصوصية، وأفضل الممارسات"
    >
      {/* What Are Subscribers */}
      <Card className="border-blue-500/20 bg-blue-500/[0.03]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base">ما هم المشتركون؟</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            المشتركون هم الأشخاص الذين سجّلوا بريدهم الإلكتروني لاستقبال إشعارات المقالات الجديدة والنشرة البريدية.
            هذه القائمة من أهم أصول المنصة — تواصل مباشر مع جمهور مهتم بمحتواك.
          </p>
        </CardContent>
      </Card>

      {/* Subscriber Fields Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-500" />
            <CardTitle className="text-base">بيانات المشترك</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            الحقول المعروضة لكل مشترك في لوحة التحكم
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
              {subscriberFields.map((f) => (
                <TableRow key={f.field}>
                  <TableCell>
                    <span className="font-medium text-sm">{f.field}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[250px]">
                    {f.description}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                    {f.note}
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

      {/* Features */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-violet-500" />
            <CardTitle className="text-base">أدوات الإدارة المتاحة</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {features.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                <Icon className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Privacy & GDPR */}
      <Card className="border-amber-500/20 bg-amber-500/[0.03]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base">الخصوصية وحماية البيانات</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            قواعد إلزامية — الالتزام بها يحمي المنصة قانونياً ويبني ثقة المشتركين
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {privacyRules.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{item.rule}</p>
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
            <Heart className="h-4 w-4 text-emerald-500" />
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

      {/* Key Takeaway */}
      <Card>
        <CardContent className="pt-6">
          <div className="p-3 rounded-lg bg-blue-500/[0.03] border border-blue-500/20 text-center">
            <p className="text-sm font-medium">
              القائمة البريدية استثمار طويل المدى — ابنِها بصبر واحترم مشتركيك
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              كل مشترك اختار أن يسمع منك — قدّم له محتوى يستحق وقته
            </p>
          </div>
        </CardContent>
      </Card>
    </GuidelineLayout>
  );
}
