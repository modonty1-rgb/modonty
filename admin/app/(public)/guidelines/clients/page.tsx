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
  Building2,
  CheckCircle2,
  Image as ImageIcon,
  Search,
  Zap,
  MapPin,
  Share2,
  CreditCard,
  FileText,
} from "lucide-react";

const basicFields = [
  { field: "الاسم", key: "name", required: true, description: "اسم العميل كما يظهر في الموقع والمقالات" },
  { field: "الرابط (Slug)", key: "slug", required: true, description: "يُولّد تلقائياً من الاسم — يُستخدم في رابط صفحة العميل" },
  { field: "الاسم القانوني", key: "legalName", required: false, description: "الاسم الرسمي المسجل — يظهر في البيانات المنظمة (Schema.org)" },
  { field: "البريد الإلكتروني", key: "email", required: true, description: "بريد التواصل الرسمي — يظهر في صفحة العميل" },
  { field: "رابط الموقع", key: "url", required: false, description: "رابط الموقع الرسمي للعميل" },
  { field: "رقم الهاتف", key: "phone", required: false, description: "رقم التواصل — يظهر في صفحة العميل وبيانات Schema" },
  { field: "المجال", key: "industryId", required: false, description: "مجال عمل العميل — يُحدد من قائمة المجالات المتاحة" },
  { field: "تاريخ التأسيس", key: "foundingDate", required: false, description: "تاريخ تأسيس الشركة — يظهر في البيانات المنظمة" },
  { field: "عدد الموظفين", key: "numberOfEmployees", required: false, description: "حجم فريق العمل — يُستخدم في Schema.org" },
  { field: "الشعار النصي", key: "slogan", required: false, description: "عبارة مختصرة تعبّر عن العميل — تظهر بجانب الاسم" },
];

const seoFields = [
  { field: "عنوان SEO", limit: "60 حرف كحد أقصى", description: "العنوان الذي يظهر في نتائج Google — اجعله واضحاً ويحتوي اسم العميل" },
  { field: "وصف SEO", limit: "160 حرف كحد أقصى", description: "الوصف أسفل العنوان في نتائج البحث — اكتب جملة تشرح نشاط العميل" },
  { field: "صورة OG", limit: "1200 x 630 بكسل", description: "الصورة التي تظهر عند مشاركة رابط صفحة العميل في السوشال ميديا" },
];

const mediaSpecs = [
  { type: "الشعار (Logo)", size: "400 x 400", format: "SVG / PNG", usage: "يظهر في المقالات، القوائم، وصفحة العميل" },
  { type: "صورة OG", size: "1200 x 630", format: "JPG / PNG", usage: "عند مشاركة الرابط في Facebook, LinkedIn, WhatsApp" },
  { type: "معرض الصور (Gallery)", size: "1200 x 800", format: "WebP / JPG", usage: "صور إضافية تعرض في صفحة العميل" },
];

const additionalInfo = [
  { category: "العنوان", fields: "الدولة، المدينة، العنوان التفصيلي، الرمز البريدي" },
  { category: "التواصل الاجتماعي", fields: "روابط حسابات السوشال ميديا (Twitter, LinkedIn, Facebook...)" },
  { category: "السجل التجاري", fields: "رقم السجل التجاري — يظهر في البيانات القانونية" },
  { category: "نبذة تعريفية", fields: "وصف مفصّل عن العميل — يظهر في صفحة العميل الرئيسية" },
];

const subscriptionFields = [
  { field: "الباقة", description: "نوع الاشتراك الحالي للعميل" },
  { field: "حالة الاشتراك", description: "فعّال، منتهي، أو معلّق" },
  { field: "حالة الدفع", description: "مدفوع، مستحق، أو متأخر" },
  { field: "GTM Container", description: "معرّف Google Tag Manager — لتتبع الزيارات والتحليلات" },
];

const autoFeatures = [
  { feature: "JSON-LD", detail: "يُولّد تلقائياً من بيانات العميل — يظهر لمحركات البحث" },
  { feature: "Schema.org Organization", detail: "بيانات منظمة تشمل الاسم، الشعار، العنوان، التواصل" },
  { feature: "Canonical URL", detail: "يُعيّن تلقائياً: /clients/{slug}" },
  { feature: "OG Tags", detail: "تُملأ تلقائياً من عنوان SEO والوصف وصورة OG" },
  { feature: "Breadcrumb Schema", detail: "مسار التنقل يُولّد تلقائياً في صفحة العميل" },
];

export default function ClientsGuidelinesPage() {
  return (
    <GuidelineLayout
      title="Clients"
      description="دليل إدارة العملاء — الحقول المطلوبة، إعدادات SEO، والوسائط"
    >
      {/* Basic Data Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base">البيانات الأساسية</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            الحقول الرئيسية لملف العميل — الحقول المطلوبة يجب إكمالها قبل الحفظ
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
              {basicFields.map((f) => (
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

      {/* SEO Card */}
      <Card className="border-amber-500/20 bg-amber-500/[0.03]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base">إعدادات SEO</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            تحسين ظهور صفحة العميل في محركات البحث ومنصات التواصل
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الحقل</TableHead>
                <TableHead>الحد</TableHead>
                <TableHead>الشرح</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seoFields.map((f) => (
                <TableRow key={f.field}>
                  <TableCell>
                    <span className="font-medium text-sm">{f.field}</span>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{f.limit}</code>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[250px]">
                    {f.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Media Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-violet-500" />
            <CardTitle className="text-base">الوسائط والصور</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            المقاسات والصيغ المطلوبة لصور العميل
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نوع الصورة</TableHead>
                <TableHead>المقاس (px)</TableHead>
                <TableHead>الصيغة</TableHead>
                <TableHead>الاستخدام</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mediaSpecs.map((m) => (
                <TableRow key={m.type}>
                  <TableCell>
                    <span className="font-medium text-sm">{m.type}</span>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{m.size}</code>
                  </TableCell>
                  <TableCell className="text-xs">{m.format}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px]">{m.usage}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Additional Info */}
        <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-base">معلومات إضافية</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {additionalInfo.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{item.category}</p>
                  <p className="text-xs text-muted-foreground">{item.fields}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Subscriptions */}
        <Card className="border-blue-500/20 bg-blue-500/[0.03]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-base">الاشتراكات</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {subscriptionFields.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-0">
                <span className="font-medium">{item.field}</span>
                <span className="text-muted-foreground text-end max-w-[200px]">{item.description}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

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
              <span className="text-muted-foreground text-end max-w-[250px]">{item.detail}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </GuidelineLayout>
  );
}
