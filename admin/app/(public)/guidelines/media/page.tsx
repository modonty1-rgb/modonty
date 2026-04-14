import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GuidelineLayout } from "../components/guideline-layout";
import { CheckCircle2, ExternalLink, MapPin } from "lucide-react";

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
      <Card className="border-emerald-500/30 bg-emerald-500/[0.04]">
        <CardContent className="pt-5 pb-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
            </div>
            <div>
              <p className="font-bold text-base text-emerald-700 dark:text-emerald-400">
                ارفع مرة واحدة — وخلّ الموقع يتولى الباقي
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                الموقع متصل بـ Cloudinary. ارفع الصورة بأعلى جودة عندك، وهو يضغطها ويغيّر حجمها حسب كل مكان لوحده.
                <strong className="text-foreground"> ما تحتاج تسوّي نسخ.</strong>
              </p>
            </div>
          </div>

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
      </Card>

      {/* ── SAFE ZONE ── */}
      <Card className="border-amber-500/20 bg-amber-500/[0.03]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base">المنطقة الآمنة — Safe Zone</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            نفس الصورة تطلع في أماكن مختلفة بأشكال مختلفة — اللي يهمك حطّه في المنتصف دايماً
          </p>
        </CardHeader>
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
      </Card>

      {/* ── PAGE PREVIEWS ── */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">شوف وين تطلع كل صورة</CardTitle>
          <p className="text-xs text-muted-foreground">
            نفس تصميم الموقع — بس في مكان كل صورة مكتوب المقاس بالضبط
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            {/* Article preview — LIVE */}
            <Link
              href="/guidelines/media/article-preview"
              className="group rounded-xl border border-primary/30 bg-primary/[0.03] p-5 flex flex-col gap-3 hover:bg-primary/[0.07] hover:border-primary/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <Badge className="bg-primary/15 text-primary border-primary/20 text-xs">متاح الآن</Badge>
                <ExternalLink className="h-4 w-4 text-primary/50 group-hover:text-primary transition-colors" />
              </div>
              <div>
                <p className="font-semibold text-sm">صفحة المقال</p>
                <p className="text-xs text-muted-foreground mt-0.5">Article Page</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                صورة Hero، صورة الكاتب، غلاف العميل، اللوجو، المعرض — كل شيء موضّح بالمقاس
              </p>
            </Link>

            {/* Client preview — LIVE */}
            <Link
              href="/guidelines/media/client-preview"
              className="group rounded-xl border border-primary/30 bg-primary/[0.03] p-5 flex flex-col gap-3 hover:bg-primary/[0.07] hover:border-primary/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <Badge className="bg-primary/15 text-primary border-primary/20 text-xs">متاح الآن</Badge>
                <ExternalLink className="h-4 w-4 text-primary/50 group-hover:text-primary transition-colors" />
              </div>
              <div>
                <p className="font-semibold text-sm">صفحة العميل</p>
                <p className="text-xs text-muted-foreground mt-0.5">Client Page</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                الغلاف العريض، اللوجو الكبير، المقالات، وتبويب الصور المربعة
              </p>
            </Link>

            {/* PostCard preview — LIVE */}
            <Link
              href="/guidelines/media/postcard-preview"
              className="group rounded-xl border border-primary/30 bg-primary/[0.03] p-5 flex flex-col gap-3 hover:bg-primary/[0.07] hover:border-primary/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <Badge className="bg-primary/15 text-primary border-primary/20 text-xs">متاح الآن</Badge>
                <ExternalLink className="h-4 w-4 text-primary/50 group-hover:text-primary transition-colors" />
              </div>
              <div>
                <p className="font-semibold text-sm">بطاقة المقال</p>
                <p className="text-xs text-muted-foreground mt-0.5">PostCard</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                صورة المقال 16:9 واللوجو الصغير اللي يطلع في كل كارت
              </p>
            </Link>

          </div>
        </CardContent>
      </Card>

      {/* ── CATEGORIES & INDUSTRIES ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">الفئات والصناعات — Categories & Industries</CardTitle>
        </CardHeader>
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
      </Card>

    </GuidelineLayout>
  );
}
