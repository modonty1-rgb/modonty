import { Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImagePlaceholder } from "./image-placeholder";

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

export function PostCardPreviewContent() {
  return (
    <div className="bg-background" dir="rtl">
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h2 className="text-xl font-bold">أحدث المقالات</h2>
          <p className="text-sm text-muted-foreground mt-1">كل بطاقة تحتوي على صورتين: صورة المقال (16:9) + لوجو العميل (دائرة)</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card, i) => (
            <article key={i} className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
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
              <div className="p-4 flex flex-col flex-1 gap-3">
                <div className="flex items-center gap-2">
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

                <h3 className="font-semibold text-sm leading-snug line-clamp-2 flex-1">{card.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{card.excerpt}</p>

                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t border-border/50">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{card.time} قراءة</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{card.views}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

      </main>
    </div>
  );
}
