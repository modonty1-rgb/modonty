import type { CSSProperties } from "react";
import Link from "next/link";
import { ChevronLeft, Clock, Eye } from "lucide-react";
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
    const dimText = size === "sm" ? "text-[9px]" : "text-xs";
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

const cards = [
  {
    title: "كيف تبني استراتيجية تسويق محتوى تُحقق نتائج ملموسة على محركات البحث",
    excerpt: "اختيار الكلمات المفتاحية الصحيحة هو حجر الأساس في أي استراتيجية تسويق رقمي ناجحة. لا يكفي أن تكتب محتوى جيداً بل يجب أن يصل إلى جمهورك.",
    client: "JBR SEO",
    category: "تسويق رقمي",
    time: "٤ دقائق",
    views: "٢٣٤",
  },
  {
    title: "دليل المبتدئ الشامل لتحسين محركات البحث وبناء حضور رقمي قوي",
    excerpt: "تحسين محركات البحث ليس سراً — هو منهجية واضحة تبدأ بفهم ما يبحث عنه جمهورك وتنتهي بمحتوى يجيب على أسئلتهم بشكل أفضل من المنافسين.",
    client: "Modonty",
    category: "SEO",
    time: "٦ دقائق",
    views: "١٢٧",
  },
  {
    title: "أفضل أدوات التسويق الرقمي للشركات الصغيرة في السوق السعودي",
    excerpt: "السوق السعودي له خصائص فريدة تختلف عن باقي الأسواق العربية. فهم هذه الخصائص يمنحك ميزة تنافسية حقيقية على منافسيك.",
    client: "JBR SEO",
    category: "أدوات",
    time: "٥ دقائق",
    views: "٨٩",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PostCardPreviewPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">

      {/* ── ANNOTATION BANNER ── */}
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-500 text-white text-xs shrink-0">معاينة للمصمم</Badge>
          <div>
            <span className="text-sm font-semibold text-foreground">بطاقة المقال (PostCard) — أماكن الصور بالمقاسات الحقيقية</span>
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

      {/* ── FEED ── */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* Section heading */}
        <div>
          <h2 className="text-xl font-bold">أحدث المقالات</h2>
          <p className="text-sm text-muted-foreground mt-1">كل بطاقة تحتوي على صورتين: صورة المقال (16:9) + لوجو العميل (دائرة)</p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card, i) => (
            <article key={i} className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">

              {/* ══ ARTICLE IMAGE ══ */}
              <ImagePlaceholder
                label="صورة المقال"
                sublabel="Featured Image"
                width={1920}
                height={1080}
                ratio="16:9"
                note={i === 0 ? "⚠️ أول كارت: LCP — أعلى أولوية" : undefined}
                size="md"
                className="w-full aspect-video"
              />

              {/* Card body */}
              <div className="p-4 flex flex-col flex-1 gap-3">

                {/* Client row — logo + name + category */}
                <div className="flex items-center gap-2">
                  {/* ══ CLIENT LOGO ══ */}
                  <ImagePlaceholder
                    label="لوجو"
                    width={500}
                    height={500}
                    ratio="1:1"
                    shape="circle"
                    size="sm"
                    className="w-10 h-10 shrink-0"
                  />
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-semibold truncate">{card.client}</span>
                    <span className="text-muted-foreground/40 text-xs">·</span>
                    <Badge variant="secondary" className="text-[10px] shrink-0">{card.category}</Badge>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-sm leading-snug line-clamp-2 flex-1">{card.title}</h3>

                {/* Excerpt */}
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{card.excerpt}</p>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t border-border/50">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{card.time} قراءة</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{card.views}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Annotation callouts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="rounded-lg border border-primary/20 bg-primary/[0.03] p-4 space-y-1">
            <p className="text-xs font-semibold text-primary">صورة المقال — Featured Image</p>
            <p className="text-sm font-black text-primary">1920 × 1080</p>
            <p className="text-xs text-muted-foreground">نسبة 16:9 — تظهر كاملة في الكارت بدون قص جانبي</p>
            <p className="text-[10px] text-amber-500">⚠️ نفس هذه الصورة تظهر كمربع 1:1 في الشريط الجانبي للمقال</p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/[0.03] p-4 space-y-1">
            <p className="text-xs font-semibold text-primary">لوجو العميل في الكارت</p>
            <p className="text-sm font-black text-primary">500 × 500</p>
            <p className="text-xs text-muted-foreground">دائرة 40×40px — النظام يطلب 96px من Cloudinary لجودة أفضل</p>
            <p className="text-[10px] text-amber-500">⚠️ PNG بخلفية شفافة إلزامي — JPG يظهر مربع أبيض</p>
          </div>
        </div>

      </main>
    </div>
  );
}
