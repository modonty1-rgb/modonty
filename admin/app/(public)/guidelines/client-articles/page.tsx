import Link from "next/link";
import { Globe, Split, KeyRound, AlertTriangle, ArrowLeft, Building2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { GuidelineLayout } from "../components/guideline-layout";

// Grounded in: admin/app/(dashboard)/client-articles/page.tsx (the surface itself) and the
// business-model reference §5 (the client-site integration rules). Nothing here is inferred.

const DIFFERENCES = [
  {
    q: "وين يُنشر؟",
    modonty: "modonty.com — الفيد العام",
    client: "موقع الشركة نفسه، على نطاقها",
  },
  {
    q: "مين يقرأه؟",
    modonty: "زوّار مودونتي + بحث جوجل",
    client: "زوّار موقع الشركة + بحث جوجل على نطاقها",
  },
  {
    q: "من وين يبدأ؟",
    modonty: "مقال جديد من قائمة المقالات",
    client: "من العميل — لا يوجد زرّ «مقال جديد» هنا",
  },
  {
    q: "وش يحدّد الوجهة؟",
    modonty: "الافتراضي",
    client: "إذن مستقلّ على العميل، لا الباقة وحدها",
  },
] as const;

export default function ClientArticlesGuidelinePage() {
  return (
    <GuidelineLayout
      title="مقالات العملاء"
      description="مقالات نكتبها لتُنشر على موقع الشركة نفسها — لا على مودونتي"
    >
      <Card className="border-primary/25 bg-primary/[0.04]">
        <CardContent className="space-y-2 p-5">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 shrink-0 text-primary" />
            <h2 className="text-sm font-semibold">الفكرة في سطر</h2>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            بعض الشركات تسحب مقالاتها من عندنا وتعرضها على نطاقها هي. نكتب نحن، ويستضيف موقعها.
            نفس جودة الإنتاج، ووجهة مختلفة — وهذا الفرق يغيّر طريقة عملك من أول خطوة.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Split className="h-4 w-4 text-teal-500" />
            الفرق عن مقال مودونتي العادي
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-[11px] text-muted-foreground">
                  <th className="py-2 text-start font-semibold">السؤال</th>
                  <th className="py-2 text-start font-semibold">مقال مودونتي</th>
                  <th className="py-2 text-start font-semibold">مقال العميل</th>
                </tr>
              </thead>
              <tbody>
                {DIFFERENCES.map((d) => (
                  <tr key={d.q} className="border-b border-border/40 last:border-0">
                    <td className="py-2 pe-3 font-medium">{d.q}</td>
                    <td className="py-2 pe-3 leading-relaxed text-muted-foreground">{d.modonty}</td>
                    <td className="py-2 leading-relaxed">{d.client}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Building2 className="h-4 w-4 text-violet-500" />
            ليش القائمة عملاء لا مقالات؟
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            لأن الوجهة صفة في العميل لا في المقال. تقرّر أوّلاً مَن ينشر على موقعه، وبعدها فقط
            تصير الكتابة له ذات معنى. فالعميل هو الباب: افتحه، وتلقى مقالاته وراه. ولهذا ما في زرّ
            «مقال جديد» في هذي الشاشة.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <KeyRound className="h-4 w-4 text-amber-500" />
            الإذن غير الباقة — لا تخلط بينهما
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            الباقة تصف ما بيع للعميل. أما فتح القناة فعلياً فيحكمه إذن مستقلّ على صفّ العميل. عميل
            في باقة عالية بلا إذن = لا سحب. ومعه عنوان مقالاته على موقعه، وهو ليس بالضرورة صفحته
            الرئيسية.
          </p>
          <p className="flex gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/[0.04] p-3 text-[11px] leading-relaxed text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
            <span>
              نحن لا ننشر داخل نظام العميل. موقعه هو اللي يسحب منّا. فلو ما ظهر المقال على موقعه،
              الخلل غالباً في السحب عنده لا في النشر عندنا — راجع عمود «ما سُحب أبداً» في القائمة.
            </span>
          </p>
        </CardContent>
      </Card>

      <Link
        href="/guidelines/articles"
        className="flex items-center justify-between rounded-xl border p-4 transition-shadow hover:shadow-md"
      >
        <span className="text-xs font-semibold">رحلة المقال الكاملة</span>
        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
      </Link>
    </GuidelineLayout>
  );
}
