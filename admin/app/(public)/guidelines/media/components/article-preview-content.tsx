import {
  Clock,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  MessageSquare,
  Share2,
  Twitter,
  Linkedin,
  Facebook,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImagePlaceholder } from "./image-placeholder";

const dummyTitle =
  "كيف تختار كلمات مفتاحية تسويقية تستهدف العملاء المحتملين وتحقق نتائج ملموسة على محركات البحث";
const dummyParagraph1 =
  "اختيار الكلمات المفتاحية الصحيحة هو حجر الأساس في أي استراتيجية تسويق رقمي ناجحة. لا يكفي أن تكتب محتوى جيداً، بل يجب أن يصل هذا المحتوى إلى الجمهور المستهدف في اللحظة التي يبحث فيها عن خدماتك أو منتجاتك.";
const dummyParagraph2 =
  "في هذا المقال، سنتناول بالتفصيل كيفية اختيار الكلمات المفتاحية المناسبة، وكيف تحلل المنافسة، وكيف تبني محتوى يتصدر نتائج البحث ويجذب الزوار المهتمين فعلاً بما تقدمه.";
const dummyParagraph3 =
  "تبدأ رحلة البحث عن الكلمات المفتاحية بفهم جمهورك المستهدف. من هم؟ ماذا يبحثون عنه؟ ما المشكلات التي يواجهونها؟ الإجابة على هذه الأسئلة تمنحك قائمة أولية من الموضوعات التي يجب أن تتناولها في محتواك.";
const dummyParagraph4 =
  "بعد تحديد الموضوعات الأساسية، انتقل إلى أدوات البحث عن الكلمات المفتاحية مثل Google Keyword Planner وAhrefs وSEMrush. ابحث عن الكلمات التي يستخدمها جمهورك فعلاً، وركز على تلك ذات الحجم البحثي المعقول مع منافسة منخفضة.";

export function ArticlePreviewContent() {
  return (
    <div className="bg-background" dir="rtl">
      {/* ── MAIN LAYOUT ── */}
      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">

        {/* ── SIDEBAR ── */}
        <aside className="w-64 shrink-0 space-y-4">

          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">عن الكاتب</p>
            <div className="flex flex-col items-center gap-2 text-center">
              <ImagePlaceholder
                label="صورة الكاتب"
                sublabel="Author Avatar"
                width={500}
                height={500}
                ratio="1:1"
                shape="circle"
                size="md"
                className="w-16 h-16"
              />
              <div>
                <p className="font-semibold text-sm">محمد أحمد</p>
                <p className="text-xs text-muted-foreground">كاتب محتوى SEO</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                متخصص في كتابة المحتوى التسويقي وتحسين محركات البحث. خبرة ٥ سنوات في السوق السعودي والمصري.
              </p>
            </div>
            <div className="flex justify-center gap-2">
              {[Twitter, Linkedin, Facebook, Globe].map((Icon, i) => (
                <div key={i} className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground">
                  <Icon className="h-3 w-3" />
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs text-center text-muted-foreground cursor-default">
              صفحة الكاتب ‹
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <ImagePlaceholder
              label="غلاف صفحة العميل"
              sublabel="Client Hero Cover"
              width={2400}
              height={400}
              ratio="6:1"
              note="بنر عريض — لا تحط نصوص"
              className="w-full"
              style={{ aspectRatio: "3/1" }}
            />
            <div className="p-3 flex items-center gap-3">
              <ImagePlaceholder
                label="لوجو العميل"
                sublabel="Client Logo"
                width={500}
                height={500}
                ratio="1:1"
                shape="circle"
                size="sm"
                className="w-12 h-12 shrink-0"
              />
              <div>
                <p className="font-semibold text-sm">JBR SEO</p>
                <p className="text-xs text-muted-foreground">وكالة تسويق رقمي</p>
              </div>
            </div>
            <div className="px-3 pb-3">
              <div className="w-full bg-primary text-primary-foreground text-xs text-center py-1.5 rounded-lg cursor-default">
                اسأل JBR SEO مباشرةً
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <p className="text-xs font-semibold">اشترك في النشرة الإخبارية</p>
            <div className="h-8 rounded border border-border bg-muted/30 flex items-center px-2">
              <span className="text-xs text-muted-foreground">البريد الإلكتروني</span>
            </div>
            <div className="w-full bg-primary text-primary-foreground text-xs text-center py-1.5 rounded cursor-default">
              اشترك
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">التفاعل مع المقال</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: ThumbsUp, label: "إعجاب", count: 24 },
                { icon: ThumbsDown, label: "لا أعجبني", count: 2 },
                { icon: Bookmark, label: "حفظ", count: 18 },
                { icon: MessageSquare, label: "تعليق", count: 7 },
              ].map(({ icon: Icon, label, count }) => (
                <div key={label} className="flex flex-col items-center gap-0.5 p-2 rounded border border-border bg-muted/20 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px]">{count}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <Share2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">شارك المقال</span>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 min-w-0 space-y-5">
          <div>
            <Badge variant="outline" className="text-xs">تسويق رقمي</Badge>
          </div>

          <h1 className="text-2xl font-bold leading-snug">{dummyTitle}</h1>

          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-2">
              <ImagePlaceholder
                label=""
                sublabel=""
                width={500}
                height={500}
                ratio="1:1"
                shape="circle"
                size="sm"
                className="w-8 h-8 shrink-0"
              />
              <span className="font-medium text-foreground text-sm">محمد أحمد</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> ٤ دقائق قراءة</span>
            <span>قبل ٣ أيام</span>
            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> ١٢٤ مشاهدة</span>
          </div>

          <Separator />

          <div className="space-y-1">
            <ImagePlaceholder
              label="الصورة الرئيسية للمقال"
              sublabel="Featured Image"
              width={1920}
              height={1080}
              ratio="16:9"
              note="⚠️ نفس الصورة تظهر كمربع 1:1 في الشريط الجانبي وصفحة العميل"
              size="lg"
              className="w-full aspect-video"
            />
            <p className="text-[10px] text-muted-foreground text-center">
              هذا هو المكان الوحيد اللي تظهر فيه الصورة كاملة 16:9 — في كل مكان آخر تُقطع
            </p>
          </div>

          <div className="prose prose-sm max-w-none space-y-4 text-muted-foreground leading-relaxed">
            <p>{dummyParagraph1}</p>
            <p>{dummyParagraph2}</p>

            <div className="space-y-1">
              <ImagePlaceholder
                label="صورة داخل المقال (Gallery Image)"
                sublabel="يمكن إضافة صور داخل المحتوى"
                width={1200}
                height={675}
                ratio="16:9"
                size="md"
                className="w-full"
                style={{ aspectRatio: "16/9" }}
              />
              <p className="text-[10px] text-center text-muted-foreground">صورة توضيحية داخل المحتوى — 1200×675 — 16:9</p>
            </div>

            <p>{dummyParagraph3}</p>
            <p>{dummyParagraph4}</p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {["SEO", "كلمات مفتاحية", "تسويق محتوى", "جوجل"].map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="font-semibold text-sm">مقالات ذات صلة</p>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border border-border bg-card overflow-hidden">
                  <ImagePlaceholder
                    label="نفس صورة المقال"
                    sublabel="1920×1080 تُعرض كمربع"
                    width={1920}
                    height={1080}
                    ratio="16:9"
                    note="⚠️ الكود يقطعها كمربع — لا تحتاج صورة جديدة"
                    size="sm"
                    className="w-full aspect-square"
                  />
                  <div className="p-2 space-y-1">
                    <div className="h-2 bg-muted/60 rounded w-full" />
                    <div className="h-2 bg-muted/40 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

    </div>
  );
}
