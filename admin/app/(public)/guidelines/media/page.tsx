import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { GuidelineLayout } from "../components/guideline-layout";
import { ArticlePreviewContent } from "./components/article-preview-content";
import { ClientPreviewContent } from "./components/client-preview-content";
import { PostCardPreviewContent } from "./components/postcard-preview-content";
import {
  CheckCircle2,
  ExternalLink,
  MapPin,
  Palette,
  Type,
  Shield,
  XCircle,
  FileText,
  Building2,
  LayoutGrid,
  ChevronDown,
  Film,
  Zap,
} from "lucide-react";

// ─── Quick specs ──────────────────────────────────────────────────────────────

const specs = [
  {
    name: "صورة المقال",
    upload: "1920 × 1080",
    format: "WebP / JPG",
    ratio: "16:9",
    note: "PNG بخلفية شفافة",
    warn: false,
  },
  {
    name: "لوجو العميل",
    upload: "500 × 500",
    format: "PNG شفاف",
    ratio: "1:1",
    note: "PNG بخلفية شفافة إلزامي",
    warn: true,
  },
  {
    name: "صورة الكاتب",
    upload: "500 × 500",
    format: "JPG / PNG",
    ratio: "1:1",
    note: "الوجه في المنتصف",
    warn: false,
  },
  {
    name: "غلاف صفحة العميل",
    upload: "2400 × 400",
    format: "WebP / JPG",
    ratio: "6:1",
    note: "لا تحط نصوص داخل الصورة",
    warn: true,
  },
  {
    name: "صورة الفئة",
    upload: "600 × 600",
    format: "WebP / JPG",
    ratio: "1:1",
    note: "تظهر مربعاً وكـ 16:9 — المنتصف آمن دائماً",
    warn: false,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MediaGuidelinesPage() {
  return (
    <GuidelineLayout
      title="Media & Image Standards"
      description="مرجع سريع لفريق التصميم — المقاسات وأماكن الصور"
    >

      {/* ── GOLDEN RULE ── */}
      <Collapsible defaultOpen={false}>
        <Card className="border-emerald-500/30 bg-emerald-500/[0.04]">
          <CollapsibleTrigger className="group w-full text-start">
            <div className="flex items-center justify-between gap-3 p-5 hover:bg-emerald-500/[0.06] transition-colors">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="font-bold text-base text-emerald-700 dark:text-emerald-400">
                    ارفع مرة واحدة — وخلّ الموقع يتولى الباقي
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    الموقع متصل بـ Cloudinary · ضغط + إعادة حجم تلقائي
                  </p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-5 space-y-4">
              <p className="text-sm text-muted-foreground px-1">
                ارفع الصورة بأعلى جودة عندك، النظام يضغطها ويغيّر حجمها حسب كل مكان لوحده. <strong className="text-foreground">ما تحتاج تسوّي نسخ.</strong>
              </p>

          {/* Upload table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-start px-4 py-2.5 font-semibold text-xs text-muted-foreground">نوع الصورة</th>
                  <th className="text-start px-4 py-2.5 font-semibold text-xs text-muted-foreground">ارفعها بهذا المقاس</th>
                  <th className="text-start px-4 py-2.5 font-semibold text-xs text-muted-foreground hidden sm:table-cell">الفورمات</th>
                  <th className="text-start px-4 py-2.5 font-semibold text-xs text-muted-foreground hidden md:table-cell">ملاحظة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {specs.map((row) => (
                  <tr key={row.name} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-sm">{row.name}</span>
                      <span className="ms-2 text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">{row.ratio}</span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {row.upload}
                      </code>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <code className="text-xs text-muted-foreground">{row.format}</code>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {row.warn ? (
                        <span className="text-xs text-amber-500 font-medium">⚠️ {row.note}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">{row.note}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* ── SAFE ZONE ── */}
      <Collapsible defaultOpen={false}>
        <Card className="border-amber-500/20 bg-amber-500/[0.03]">
          <CollapsibleTrigger className="group w-full text-start">
            <CardHeader className="pb-3 cursor-pointer hover:bg-amber-500/[0.05] transition-colors">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-500" />
                  <CardTitle className="text-base">المنطقة الآمنة — Safe Zone</CardTitle>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-180" />
              </div>
              <p className="text-xs text-muted-foreground text-start">
                نفس الصورة تطلع في أماكن مختلفة — اللي يهمك حطّه في المنتصف دايماً
              </p>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
          <div className="flex flex-col md:flex-row items-start gap-6">

            {/* 16:9 diagram */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <p className="text-xs font-semibold text-muted-foreground">صورة المقال الرئيسية — 16:9</p>
              <div
                className="relative rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 overflow-hidden"
                style={{ width: 240, height: 135 }}
              >
                <span className="text-[9px] text-muted-foreground/50 absolute top-1 start-1.5">1920×1080</span>
                {/* red: cropped in lists (sides) */}
                <div className="absolute inset-y-0 start-0 w-[12.5%] bg-red-500/10 border-e border-red-500/30" />
                <div className="absolute inset-y-0 end-0 w-[12.5%] bg-red-500/10 border-s border-red-500/30" />
                {/* orange: cropped as square (top/bottom) */}
                <div className="absolute inset-x-0 top-0 h-[18.75%] bg-orange-500/10 border-b border-orange-500/30" />
                <div className="absolute inset-x-0 bottom-0 h-[18.75%] bg-orange-500/10 border-t border-orange-500/30" />
                {/* green: always safe */}
                <div
                  className="absolute rounded border-2 border-emerald-500/60 bg-emerald-500/10 flex items-center justify-center"
                  style={{ top: "18.75%", bottom: "18.75%", left: "12.5%", right: "12.5%" }}
                >
                  <span className="text-[9px] text-emerald-600 font-semibold">✓ آمن دائماً</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500/20 inline-block" />تُقطع في القوائم</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-orange-500/20 inline-block" />تُقطع كمربع</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500/20 inline-block" />آمن</span>
              </div>
            </div>

            {/* Rules */}
            <div className="flex-1 space-y-3">
              <div className="p-3 rounded-lg border bg-card space-y-1.5">
                <p className="text-xs font-semibold">صورة المقال</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• في صفحة المقال: تطلع <strong>كاملة</strong> 16:9 ما تنقص منها شيء</li>
                  <li>• في البطاقات والقوائم: الجوانب تتقطع شوي</li>
                  <li>• في الشريط الجانبي وصفحة العميل: تتقطع <strong>مربع كامل</strong></li>
                  <li className="text-amber-500">⚠️ الوجه أو الشيء المهم — في المنتصف دايماً</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg border bg-card space-y-1.5">
                <p className="text-xs font-semibold">اللوجو وصور الكتّاب</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• تطلع <strong>كاملة</strong> دايماً بدون قص — بس بأحجام مختلفة حسب المكان</li>
                  <li>• من دائرة صغيرة 24px لأفاتار صفحة العميل 112px</li>
                  <li className="text-amber-500">⚠️ الشعار في المنتصف وحوله مسافة من كل جهة</li>
                </ul>
              </div>
            </div>

          </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* ── PAGE PREVIEWS (inline tabs — no external clicks) ── */}
      <Collapsible defaultOpen={false}>
        <Card className="border-primary/20">
          <CollapsibleTrigger className="group w-full text-start">
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">شوف وين تطلع كل صورة</CardTitle>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-180" />
              </div>
              <p className="text-xs text-muted-foreground text-start">
                3 أنواع صفحات (مقال · عميل · بطاقة) — كل واحدة بمقاسات صورها الفعلية
              </p>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <Tabs defaultValue="article" className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-xl mb-4">
              <TabsTrigger value="article" className="flex items-center gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5" />
                صفحة المقال
              </TabsTrigger>
              <TabsTrigger value="client" className="flex items-center gap-1.5 text-xs">
                <Building2 className="h-3.5 w-3.5" />
                صفحة العميل
              </TabsTrigger>
              <TabsTrigger value="postcard" className="flex items-center gap-1.5 text-xs">
                <LayoutGrid className="h-3.5 w-3.5" />
                بطاقة المقال
              </TabsTrigger>
            </TabsList>

            {/* Article tab */}
            <TabsContent value="article" className="mt-0">
              <div className="rounded-lg border border-border overflow-hidden">
                <ArticlePreviewContent />
              </div>
            </TabsContent>

            {/* Client tab */}
            <TabsContent value="client" className="mt-0">
              <div className="rounded-lg border border-border overflow-hidden">
                <ClientPreviewContent />
              </div>
            </TabsContent>

            {/* PostCard tab */}
            <TabsContent value="postcard" className="mt-0">
              <div className="rounded-lg border border-border overflow-hidden">
                <PostCardPreviewContent />
              </div>
            </TabsContent>
          </Tabs>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* ── CATEGORIES & INDUSTRIES ── */}
      <Collapsible defaultOpen={false}>
        <Card>
          <CollapsibleTrigger className="group w-full text-start">
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">الفئات والصناعات — Categories & Industries</CardTitle>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-180" />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-5">

          {/* Categories */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">صورة الفئة — Category Image</span>
              <Badge variant="outline" className="text-[10px] border-muted-foreground/30 text-muted-foreground">اختياري</Badge>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 overflow-hidden">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-border/50">
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-muted-foreground w-40">المقاس للرفع</td>
                    <td className="px-4 py-2.5"><code className="font-bold text-sm text-primary bg-primary/10 px-2 py-0.5 rounded">600 × 600</code> — مربع 1:1</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-muted-foreground">الفورمات</td>
                    <td className="px-4 py-2.5 text-muted-foreground">WebP / JPG</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-muted-foreground">أين تظهر</td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      في قائمة الفئات كمربع — في بطاقة الفئة كـ 16:9 — في رأس الصفحة تتغير حسب الشاشة
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-muted-foreground">المنطقة الآمنة</td>
                    <td className="px-4 py-2.5 text-amber-500 font-medium">
                      ⚠️ اللي يهمك حطّه في المنتصف — الصورة تطلع مرة مربع ومرة 16:9
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              لو ما رفعت صورة — الموقع يعرض أيقونة الفئة مع خلفية ملوّنة وتطلع كويس. الصورة تحسين مش شرط.
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-border/50" />

          {/* Industries */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">الصناعات — Industries</span>
              <Badge className="bg-muted text-muted-foreground text-[10px]">نص فقط — لا صور</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              الصناعات نص بس — اسم ورابط. ما فيها صور خالص. تطلع كأزرار فلتر في صفحة العملاء وخلاص.
            </p>
          </div>

            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* ── BRAND COLORS (unified — primary palette + greys merged) ── */}
      <Collapsible defaultOpen={false}>
        <Card>
          <CollapsibleTrigger className="group w-full text-start">
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">ألوان البراند — Brand Colors</CardTitle>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-180" />
              </div>
              <p className="text-xs text-muted-foreground text-start">
                استخدم هذه الألوان فقط · أي لون خارجها يكسر هوية البراند
              </p>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              { name: "Primary", hex: "#0e065a", role: "اللوقو + Headers" },
              { name: "Secondary", hex: "#3030ff", role: "أزرار + روابط" },
              { name: "Tertiary", hex: "#00d8d8", role: "Accents" },
              { name: "Black", hex: "#000000", role: "نصوص قوية" },
              { name: "White", hex: "#ffffff", role: "خلفيات", border: true },
              { name: "Grey 1", hex: "#5b5b5b", role: "Text muted" },
              { name: "Grey 2", hex: "#a0a0a0", role: "Borders" },
              { name: "Grey 3", hex: "#dbdbdb", role: "Soft bg" },
            ].map((c) => (
              <div key={c.name} className="rounded-lg border border-border overflow-hidden bg-card">
                <div
                  className={`h-16 ${c.border ? "border-b border-border" : ""}`}
                  style={{ backgroundColor: c.hex }}
                />
                <div className="p-2 space-y-0.5">
                  <p className="text-[11px] font-bold leading-tight">{c.name}</p>
                  <code className="text-[10px] text-muted-foreground font-mono">{c.hex}</code>
                  <p className="text-[10px] text-muted-foreground leading-tight">{c.role}</p>
                </div>
              </div>
            ))}
          </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* ── TYPOGRAPHY (compact — samples only, no redundant table) ── */}
      <Collapsible defaultOpen={false}>
        <Card>
          <CollapsibleTrigger className="group w-full text-start">
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Typography — الخطوط</CardTitle>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-180" />
              </div>
              <p className="text-xs text-muted-foreground text-start">
                <strong className="text-foreground">Montserrat</strong> للـ Latin · <strong className="text-foreground">Tajawal</strong> للعربي
              </p>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Montserrat · Latin</p>
              <p className="text-2xl font-montserrat font-bold tracking-tight">
                Modonty Hub
              </p>
              <p className="text-sm text-muted-foreground font-montserrat font-semibold">
                Sub-Header — SemiBold
              </p>
              <p className="text-xs text-muted-foreground font-montserrat">
                Body text — Regular
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tajawal · Arabic</p>
              <p className="text-2xl font-bold font-tajawal">
                مدونتي — حضور لا وعود
              </p>
              <p className="text-sm font-semibold text-muted-foreground font-tajawal">
                عنوان فرعي — SemiBold
              </p>
              <p className="text-xs text-muted-foreground font-tajawal">
                نص عادي للمحتوى — Regular
              </p>
            </div>
          </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* ── LOGO (merged: forms + assets + sizes + DON'Ts) ── */}
      <Collapsible defaultOpen={false}>
        <Card>
          <CollapsibleTrigger className="group w-full text-start">
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">اللوقو — Logo</CardTitle>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-180" />
              </div>
              <p className="text-xs text-muted-foreground text-start">
                من أهم أصول البراند · ما يتعدّل، ما يتلوّن، ما يتمدد
              </p>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-5">

          {/* Light + Dark variants — Full Logo */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Full Logo — للخلفيات الفاتحة + الغامقة</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Light variant */}
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="bg-white border-b border-border p-6 flex items-center justify-center min-h-[100px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand-assets/logo-light.svg" alt="Modonty Logo (light bg)" className="max-h-10 w-auto" />
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold">Light · للخلفيات الفاتحة</p>
                    <p className="text-[10px] text-muted-foreground">نص أزرق — استخدمه على أبيض/فاتح</p>
                  </div>
                  <a href="/brand-assets/logo-light.svg" download className="text-[11px] text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    SVG
                  </a>
                </div>
              </div>

              {/* Dark variant */}
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="bg-slate-900 border-b border-border p-6 flex items-center justify-center min-h-[100px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand-assets/logo-dark.svg" alt="Modonty Logo (dark bg)" className="max-h-10 w-auto" />
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold">Dark · للخلفيات الغامقة</p>
                    <p className="text-[10px] text-muted-foreground">نص أبيض — استخدمه على أسود/غامق</p>
                  </div>
                  <a href="/brand-assets/logo-dark.svg" download className="text-[11px] text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    SVG
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Icon (universal) */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Logomark (Icon) — للأماكن الضيقة</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-white overflow-hidden p-6 flex items-center justify-center min-h-[100px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand-assets/icon.svg" alt="Modonty Icon (light bg)" className="max-h-14 w-auto" />
              </div>
              <div className="rounded-lg border border-border bg-slate-900 overflow-hidden p-6 flex items-center justify-center min-h-[100px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand-assets/icon.svg" alt="Modonty Icon (dark bg)" className="max-h-14 w-auto" />
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <p className="text-muted-foreground">يعمل على الخلفيتين — استخدمه للـ avatars · favicons · social profiles</p>
              <a href="/brand-assets/icon.svg" download className="text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                SVG
              </a>
            </div>
          </div>

          {/* Clearspace + DON'Ts callout side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Clearspace */}
            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/[0.05]">
              <p className="text-xs font-semibold mb-1">⚠️ المسافة الآمنة — Clearspace</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                مسافة حول اللوقو خالية من أي عناصر — تحفظ قوته ووضوحه بصرياً
              </p>
            </div>

            {/* DON'Ts callout → /guidelines/prohibitions */}
            <Link
              href="/guidelines/prohibitions"
              className="p-3 rounded-lg border border-red-500/30 bg-red-500/[0.05] hover:bg-red-500/[0.1] transition-colors flex items-start gap-2"
            >
              <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-red-400 mb-1">❌ ممنوعات اللوقو</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  6 محظورات (تمدد · تدوير · container · عكس · إعادة تلوين · تشويه) — في صفحة الممنوعات الموحّدة
                </p>
                <p className="text-[10px] text-red-400 mt-1.5">عرض القائمة الكاملة ←</p>
              </div>
            </Link>
          </div>

            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* ── VIDEO ── */}
      <Collapsible defaultOpen={false}>
        <Card>
          <CollapsibleTrigger className="group w-full text-start">
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">الفيديو — Video</CardTitle>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-180" />
              </div>
              <p className="text-xs text-muted-foreground text-start">
                الفيديو يبيع في 3 ثواني — لو ما هوّيت القارئ، فقدته
              </p>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-5">

              {/* Format Matrix */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">المقاسات حسب القناة</p>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr className="text-start">
                        <th className="px-3 py-2 text-start font-semibold">القناة</th>
                        <th className="px-3 py-2 text-start font-semibold">النسبة</th>
                        <th className="px-3 py-2 text-start font-semibold">المدة</th>
                        <th className="px-3 py-2 text-start font-semibold">الحجم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-3 py-2 font-medium">Hero / Web</td>
                        <td className="px-3 py-2 font-mono text-muted-foreground">16:9</td>
                        <td className="px-3 py-2 text-muted-foreground">≤ 60 ث</td>
                        <td className="px-3 py-2 text-muted-foreground">1920×1080 · H.264</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-medium">داخل المقال</td>
                        <td className="px-3 py-2 font-mono text-muted-foreground">16:9</td>
                        <td className="px-3 py-2 text-muted-foreground">≤ 90 ث</td>
                        <td className="px-3 py-2 text-muted-foreground">1920×1080 · H.264</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-medium">Reels / TikTok / Shorts</td>
                        <td className="px-3 py-2 font-mono text-muted-foreground">9:16</td>
                        <td className="px-3 py-2 text-muted-foreground">≤ 30 ث</td>
                        <td className="px-3 py-2 text-muted-foreground">1080×1920 · H.264</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-medium">Feed Post</td>
                        <td className="px-3 py-2 font-mono text-muted-foreground">1:1</td>
                        <td className="px-3 py-2 text-muted-foreground">≤ 30 ث</td>
                        <td className="px-3 py-2 text-muted-foreground">1080×1080 · H.264</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">صيغة موحّدة: <span className="font-mono">MP4</span> · صوت <span className="font-mono">AAC 128kbps</span> · معدل ≤ 8Mbps</p>
              </div>

              {/* The 3-Second Rule — featured callout */}
              <div className="p-4 rounded-lg border-2 border-amber-500/40 bg-amber-500/[0.06]">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold">قاعدة الـ 3 ثواني</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      أول 3 ثواني = الكل. ابدأ بالـ <span className="font-bold text-foreground">hook</span> مباشرة — لا logo intros · لا fade-ins · لا "أهلاً وسهلاً". القارئ يقرر يكمّل أو يطلع في 1.5 ثانية.
                    </p>
                  </div>
                </div>
              </div>

              {/* Brand Discipline + Captions + Safe Zones — 3 mini-cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border border-border bg-muted/30">
                  <p className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                    البراند
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    اللوقو في الزاوية · ألوان البراند فقط · Tajawal عربي + Montserrat لاتيني
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-muted/30">
                  <p className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                    <Type className="h-3.5 w-3.5 text-muted-foreground" />
                    الترجمة
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Captions عربية إلزامية (RTL) · 85% يشاهدون بدون صوت · حجم نص يقرأ على mobile
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-muted/30">
                  <p className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                    <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
                    Safe Zone (9:16)
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    أعلى 10% + أسفل 15% محجوزة لـ UI المنصة — لا تحط نصوص هناك
                  </p>
                </div>
              </div>

              {/* Forbidden callout → /guidelines/prohibitions */}
              <Link
                href="/guidelines/prohibitions"
                className="p-3 rounded-lg border border-red-500/30 bg-red-500/[0.05] hover:bg-red-500/[0.1] transition-colors flex items-start gap-2"
              >
                <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-red-400 mb-1">❌ ممنوعات الفيديو</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    6 محظورات (license · intros طويلة · نصوص صغيرة · auto-play بصوت · ادعاءات · watermarks) — في صفحة الممنوعات الموحّدة
                  </p>
                  <p className="text-[10px] text-red-400 mt-1.5">عرض القائمة الكاملة ←</p>
                </div>
              </Link>

            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

    </GuidelineLayout>
  );
}
