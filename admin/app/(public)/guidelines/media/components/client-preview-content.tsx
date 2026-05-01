import { LayoutGrid, Image as ImageIcon, Info, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImagePlaceholder } from "./image-placeholder";

const dummyArticles = [
  "كيف تبني استراتيجية تسويق محتوى تُحقق نتائج على محركات البحث",
  "دليل المبتدئ لتحسين محركات البحث وبناء حضور رقمي قوي",
  "أفضل أدوات التسويق الرقمي للشركات الصغيرة في السوق السعودي",
  "أساسيات الـ SEO التقني التي يجب أن يعرفها كل صاحب موقع",
  "كيف تكتب محتوى يتصدر نتائج البحث ويجذب الزوار المستهدفين",
  "استراتيجيات بناء الروابط الخلفية وتأثيرها على ترتيب موقعك",
];

export function ClientPreviewContent() {
  return (
    <div className="bg-background" dir="rtl">
      {/* ══ CLIENT HERO SECTION ══ */}
      <div className="relative">
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

        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pt-2">
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            وكالة JBR SEO متخصصة في تحسين محركات البحث وتسويق المحتوى الرقمي للشركات في المملكة العربية السعودية ومصر.
            لدينا خبرة ٨ سنوات في رفع تصنيف المواقع وزيادة الزيارات العضوية.
          </p>
          <div className="bg-primary text-primary-foreground text-sm px-5 py-2 rounded-lg cursor-default shrink-0">
            تواصل مع JBR SEO
          </div>
        </div>

        {/* Tabs (visual only) */}
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

        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            مقالات العميل — كل صورة مقال تُعرض بنسبة <strong>16:9</strong> هنا. نفس الصورة الرئيسية للمقال.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {dummyArticles.map((title, i) => (
              <article key={i} className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
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

      </div>
    </div>
  );
}
