import Link from "next/link";
import { FileText, MessageCircleQuestion, Gauge, ShieldOff, ArrowLeft } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { GuidelineLayout } from "../components/guideline-layout";

// Grounded in admin/app/(dashboard)/briefs/page.tsx: the completeness bands (>=80 ready,
// <50 thin) and the deliberate absence of any financial field are properties of that screen,
// not opinions.

const BANDS = [
  { range: "٨٠٪ فأكثر", label: "جاهز للكتابة", tone: "border-emerald-500/30 bg-emerald-500/[0.04]", note: "عندك ما يكفي لتكتب بلا تخمين." },
  { range: "٥٠–٧٩٪", label: "ناقص", tone: "border-amber-500/30 bg-amber-500/[0.04]", note: "اكتب، لكن سجّل أسئلتك للعميل قبل ما تخمّن." },
  { range: "أقل من ٥٠٪", label: "ضعيف", tone: "border-red-500/30 bg-red-500/[0.04]", note: "لا تبدأ. اسأل العميل أوّلاً — الكتابة على فراغ تُعاد كلها." },
] as const;

export default function BriefsGuidelinePage() {
  return (
    <GuidelineLayout
      title="البريفات وأسئلة العميل"
      description="مدخل الإنتاج — من وين تجي معلومات المقال قبل ما تكتب حرفاً"
    >
      <Card className="border-primary/25 bg-primary/[0.04]">
        <CardContent className="space-y-2 p-5">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-primary" />
            <h2 className="text-sm font-semibold">البريف قبل الكتابة، دائماً</h2>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            البريف هو كل ما نعرفه عن الشركة: مجالها، مدينتها، خدماتها، جمهورها، ونبرتها. المقال
            المكتوب بلا بريف يخرج عامّاً — صحيح لغوياً وفارغ من أي شيء يخصّ هذي الشركة، وهذا
            بالضبط اللي ما يميّزنا عن أي كاتب بمئة ريال.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Gauge className="h-4 w-4 text-teal-500" />
            نسبة اكتمال البريف — ووش تسوي عند كل مستوى
          </h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {BANDS.map((b) => (
              <div key={b.range} className={`rounded-lg border p-3 ${b.tone}`}>
                <div className="text-xs font-bold">{b.range}</div>
                <div className="mt-0.5 text-[11px] font-semibold">{b.label}</div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{b.note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <MessageCircleQuestion className="h-4 w-4 text-violet-500" />
            ناقصك معلومة؟ اسأل العميل — لا تخمّن
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            في قناة أسئلة للعميل: تكتب سؤالك، يجاوب من الكونسول، وتصير الإجابة جزءاً من بيانات
            الشركة لا رسالة ضائعة في واتساب. التخمين في مجال طبّي أو قانوني ليس خطأ تحريرياً فقط —
            هو مسؤولية.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <ShieldOff className="h-4 w-4 text-muted-foreground" />
            ما تشوفه هنا وما لا تشوفه
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            شاشة البريفات ما تعرض سعراً ولا حالة اشتراك ولا دفعة — بقرار في التصميم لا بإخفاء.
            قرار الكتابة يُبنى على اكتمال المعلومة لا على قيمة العميل. لو احتجت شيئاً تجارياً،
            اطلبه ممّن يملكه.
          </p>
        </CardContent>
      </Card>

      <Link
        href="/guidelines/articles"
        className="flex items-center justify-between rounded-xl border p-4 transition-shadow hover:shadow-md"
      >
        <span className="text-xs font-semibold">التالي: رحلة المقال</span>
        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
      </Link>
    </GuidelineLayout>
  );
}
