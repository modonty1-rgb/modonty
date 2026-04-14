import type { CSSProperties } from "react";
import Link from "next/link";
import { ChevronLeft, LayoutGrid, Image as ImageIcon, Info, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ─── Image Placeholder ────────────────────────────────────────────────────────

interface PlaceholderProps {
  label: string;
  sublabel?: string;
  width: number;
  height: number;
  ratio: string;
  note?: string;
  className?: string;
  shape?: "rect" | "circle";
  size?: "sm" | "md" | "lg";
  style?: CSSProperties;
}

function ImagePlaceholder({
  label,
  sublabel,
  width,
  height,
  ratio,
  note,
  className = "",
  shape = "rect",
  size = "md",
  style,
}: PlaceholderProps) {
  const isCircle = shape === "circle";

  if (isCircle) {
    const dimText = size === "sm" ? "text-[9px]" : size === "lg" ? "text-sm" : "text-xs";
    const labelText = size === "sm" ? "text-[8px]" : "text-[10px]";
    return (
      <div
        className={`relative border-2 border-dashed border-primary/40 bg-primary/[0.06] rounded-full flex flex-col items-center justify-center gap-0.5 ${className}`}
        style={style}
      >
        <span className={`font-black text-primary/70 leading-none ${dimText}`}>{width}×{height}</span>
        <span className={`font-bold text-primary/50 leading-none ${labelText}`}>{ratio}</span>
        {size !== "sm" && <span className={`text-primary/40 text-center leading-tight ${labelText}`}>{label}</span>}
      </div>
    );
  }

  const isLg = size === "lg";
  const isSm = size === "sm";

  return (
    <div
      className={`relative border-2 border-dashed border-primary/40 bg-primary/[0.06] rounded-lg flex flex-col items-center justify-center gap-1.5 overflow-hidden ${className}`}
      style={style}
    >
      <span className={`absolute top-2 start-2 bg-primary text-primary-foreground font-semibold px-2 py-0.5 rounded ${isSm ? "text-[8px]" : "text-[10px]"}`}>
        {sublabel || label}
      </span>
      <span className={`font-black text-primary/70 tracking-tight leading-none ${isLg ? "text-2xl" : isSm ? "text-sm" : "text-xl"}`}>
        {width} × {height}
      </span>
      <span className={`font-bold text-primary/60 bg-primary/10 border border-primary/30 px-3 py-0.5 rounded-full ${isLg ? "text-sm" : isSm ? "text-[9px]" : "text-xs"}`}>
        نسبة {ratio}
      </span>
      {note && (
        <span className={`text-amber-600 font-medium text-center px-4 leading-snug ${isSm ? "text-[8px]" : "text-[10px]"}`}>
          {note}
        </span>
      )}
    </div>
  );
}

// ─── Dummy data ───────────────────────────────────────────────────────────────

const dummyArticles = [
  "كيف تبني استراتيجية تسويق محتوى تُحقق نتائج على محركات البحث",
  "دليل المبتدئ لتحسين محركات البحث وبناء حضور رقمي قوي",
  "أفضل أدوات التسويق الرقمي للشركات الصغيرة في السوق السعودي",
  "أساسيات الـ SEO التقني التي يجب أن يعرفها كل صاحب موقع",
  "كيف تكتب محتوى يتصدر نتائج البحث ويجذب الزوار المستهدفين",
  "استراتيجيات بناء الروابط الخلفية وتأثيرها على ترتيب موقعك",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientPreviewPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">

      {/* ── ANNOTATION BANNER ── */}
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-500 text-white text-xs shrink-0">معاينة للمصمم</Badge>
          <div>
            <span className="text-sm font-semibold text-foreground">صفحة العميل — أماكن الصور بالمقاسات الحقيقية</span>
            <span className="block text-xs text-muted-foreground">
              ارفع كل صورة <strong>مرة واحدة</strong> بأعلى جودة — النظام يعرضها بالحجم الصح تلقائياً في كل مكان
            </span>
          </div>
        </div>
        <Link href="/guidelines/media" className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0 ms-4">
          <ChevronLeft className="h-3 w-3" />
          رجوع
        </Link>
      </div>

      {/* ── SIMULATED NAV ── */}
      <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg text-primary">modonty</span>
          <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <span className="cursor-default">الرئيسية</span>
            <span className="cursor-default">المقالات</span>
            <span className="cursor-default">العملاء</span>
          </nav>
        </div>
        <div className="w-48 h-8 rounded-full border border-border bg-muted/30 flex items-center px-3">
          <span className="text-xs text-muted-foreground">ابحث ...</span>
        </div>
      </header>

      {/* ══ CLIENT HERO SECTION ══ */}
      <div className="relative">

        {/* ══ HERO COVER ══ */}
        <ImagePlaceholder
          label="غلاف صفحة العميل"
          sublabel="Client Hero Cover"
          width={2400}
          height={400}
          ratio="6:1"
          note="⚠️ لا تحط نصوص — النظام يُضيف نص فوقها"
          size="lg"
          className="w-full"
          style={{ aspectRatio: "6/1" }}
        />

        {/* ══ CLIENT LOGO ══ */}
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative -mt-10 flex items-end gap-4 pb-4">
            <ImagePlaceholder
              label="لوجو العميل"
              sublabel="Client Logo"
              width={500}
              height={500}
              ratio="1:1"
              shape="circle"
              size="lg"
              className="w-20 h-20 md:w-28 md:h-28 shrink-0 ring-4 ring-background"
            />
            <div className="pb-2">
              <h1 className="text-xl font-bold">JBR SEO</h1>
              <p className="text-sm text-muted-foreground">وكالة تسويق رقمي متخصصة في السوق السعودي والمصري</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CLIENT PAGE BODY ── */}
      <div className="max-w-5xl mx-auto px-6 pb-12 space-y-6">

        {/* About + CTA row */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pt-2">
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            وكالة JBR SEO متخصصة في تحسين محركات البحث وتسويق المحتوى الرقمي للشركات في المملكة العربية السعودية ومصر.
            لدينا خبرة ٨ سنوات في رفع تصنيف المواقع وزيادة الزيارات العضوية.
          </p>
          <div className="bg-primary text-primary-foreground text-sm px-5 py-2 rounded-lg cursor-default shrink-0">
            تواصل مع JBR SEO
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="border-b border-border">
          <div className="flex gap-1">
            {[
              { label: "المقالات", icon: LayoutGrid, active: true },
              { label: "الصور", icon: ImageIcon, active: false },
              { label: "عن العميل", icon: Info, active: false },
              { label: "تواصل", icon: MessageSquare, active: false },
            ].map(({ label, icon: Icon, active }) => (
              <div
                key={label}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm cursor-default border-b-2 transition-colors ${
                  active
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* ── ARTICLES TAB ── */}
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            مقالات العميل — كل صورة مقال تُعرض بنسبة <strong>16:9</strong> هنا. نفس الصورة الرئيسية للمقال.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {dummyArticles.map((title, i) => (
              <article key={i} className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">

                {/* ══ ARTICLE THUMBNAIL ══ */}
                <ImagePlaceholder
                  label="صورة المقال"
                  sublabel="1920×1080"
                  width={1920}
                  height={1080}
                  ratio="16:9"
                  size="md"
                  className="w-full aspect-video"
                />

                <div className="p-3 flex flex-col gap-2 flex-1">
                  <p className="text-sm font-medium leading-snug line-clamp-2">{title}</p>
                  <p className="text-xs text-muted-foreground mt-auto">JBR SEO · تسويق رقمي</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ── PHOTOS TAB NOTE ── */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-semibold">تبويب الصور — Photos Tab</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            هذا التبويب يعرض نفس صور المقالات، لكن كمربعات <strong>1:1</strong> مقطوعة من المنتصف.
            ما تحتاج تُصمم صور خاصة للفوتوز — الكود يقطع صور المقالات تلقائياً.
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <ImagePlaceholder
                key={i}
                label="نفس صورة المقال"
                sublabel="مقطوعة 1:1"
                width={1920}
                height={1080}
                ratio="16:9→1:1"
                note={i === 0 ? "الكود يقطعها مربع" : undefined}
                size="sm"
                className="w-full aspect-square"
              />
            ))}
          </div>
        </div>

        {/* ── SUMMARY LEGEND ── */}
        <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-5">
          <p className="font-semibold text-sm mb-3">ملخص الصور في صفحة العميل</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {[
              {
                name: "غلاف الصفحة",
                dims: "2400 × 400",
                ratio: "6:1",
                where: "بنر أعلى الصفحة — يمتد كامل العرض",
                warn: "لا نصوص داخل الصورة",
              },
              {
                name: "لوجو العميل",
                dims: "500 × 500",
                ratio: "1:1 دائرة",
                where: "فوق الغلاف — 80px موبايل / 112px ديسكتوب",
                warn: "PNG بخلفية شفافة إلزامي",
              },
              {
                name: "صور المقالات",
                dims: "1920 × 1080",
                ratio: "16:9",
                where: "في تبويب المقالات 16:9 — في تبويب الصور كمربع 1:1",
                warn: "نفس الصورة الرئيسية للمقال — ما تحتاج صورة جديدة",
              },
            ].map((item) => (
              <div key={item.name} className="p-3 rounded-lg border border-border bg-card space-y-1">
                <p className="font-semibold text-foreground">{item.name}</p>
                <code className="text-[10px] bg-muted px-1 py-0.5 rounded block">{item.dims} — {item.ratio}</code>
                <p className="text-muted-foreground text-[10px]">{item.where}</p>
                <p className="text-amber-500 text-[10px] font-medium">⚠️ {item.warn}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
