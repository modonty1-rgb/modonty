import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDown, ArrowLeft, Building2, FileText, MessageCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { DocLayout } from "@/app/(public)/components/doc-layout";

// Grounded in the flow Khalid approved on 3 Oct 2026 (documents/qa/mobile-audit/article-cta-flow.html)
// and the code that follows it: modonty ArticleCtaBar.tsx · PartnerStrip.tsx · resolve-article-cta.ts.

const CLIENT_BUTTON = [
  {
    choice: "حجز",
    shows: "«احجز الآن» (أو النص اللي كتبه الأدمن)",
    goes: "صفحة الحجز عند العميل في مدونتي",
  },
  {
    choice: "رابط",
    shows: "النص اللي كتبه الأدمن، مثل «راسلنا واتساب» أو «تسوّق الآن»",
    goes: "الرابط نفسه: متجره، أو واتساب، أو اتصال",
  },
  {
    choice: "ما اختار زر",
    shows: "«صفحة [اسم العميل]»",
    goes: "بروفايل العميل في مدونتي",
  },
] as const;

const BEFORE_AFTER = [
  { c: "العميل اختار رابط واتساب", before: "الزرّ يقول «راسلنا واتساب» ويفتح صفحة العميل", after: "يفتح واتساب فعلاً، بلا أيقونة واتساب ثانية" },
  { c: "الأدمن ما اختار زر", before: "«احجز الآن» لعميل ما عنده حجز", after: "«صفحة [اسمه]» ← بروفايله" },
  { c: "العميل اختار حجز", before: "يفتح صفحة العميل", after: "يفتح صفحة الحجز مباشرة" },
] as const;

function Step({ n, title, where, children }: { n: number; title: string; where: string; children: ReactNode }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-[12px] font-bold text-primary-foreground">{n}</span>
          <h2 className="text-sm font-semibold">{title}</h2>
          <span className="ms-auto text-[11px] text-muted-foreground">{where}</span>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export default function ArticleButtonGuidelinePage() {
  return (
    <DocLayout
      parentHref="/playbook/content"
      parentLabel="قسم المحتوى"
      title="زرّ المقال"
      description="الزرّ اللي يطلع للقارئ في صفحة المقال: من وين يجي، وإيش يكتب عليه، ووين يودّي"
    >
      <Card className="border-primary/25 bg-primary/[0.04]">
        <CardContent className="space-y-2 p-5">
          <h2 className="text-sm font-semibold">القاعدة في سطر</h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            كل مقال ياخذ زرّ عميله كما ضبطه الأدمن — إلا لو الكاتب حطّ له زرّ خاص. والزرّ يسوي اللي مكتوب
            عليه بالضبط، وواتساب ما يتكرّر.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <h2 className="text-sm font-semibold">الأساس: العميل، ومقالاته تحته</h2>
          <div className="flex flex-col items-center gap-2 text-center text-xs">
            <div className="flex items-center gap-2 rounded-lg border-2 border-emerald-500/50 px-4 py-2">
              <Building2 className="h-4 w-4 text-emerald-600" />
              <span><b>العميل</b> — زرّ واحد يضبطه الأدمن مرّة، ورقم جواله</span>
            </div>
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
            <div className="grid w-full gap-2 sm:grid-cols-3">
              <div className="rounded-lg border p-2">مقال بلا زرّ خاص ← يرث زرّ العميل</div>
              <div className="rounded-lg border p-2">مقال بلا زرّ خاص ← يرث زرّ العميل</div>
              <div className="rounded-lg border-2 border-primary/50 p-2">مقال بزرّ خاص ← زرّه بدل زرّ العميل، في هذا المقال فقط</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Step n={1} title="زرّ العميل" where="الأدمن ← العميل ← Primary Action (CTA)">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-[11px] text-muted-foreground">
                <th className="py-2 text-start font-semibold">اختيار الأدمن</th>
                <th className="py-2 text-start font-semibold">المكتوب على الزرّ</th>
                <th className="py-2 text-start font-semibold">يودّي على</th>
              </tr>
            </thead>
            <tbody>
              {CLIENT_BUTTON.map((r) => (
                <tr key={r.choice} className="border-b border-border/40 last:border-0">
                  <td className="py-2 pe-3 font-medium">{r.choice}</td>
                  <td className="py-2 pe-3 leading-relaxed text-muted-foreground">{r.shows}</td>
                  <td className="py-2 leading-relaxed">{r.goes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-muted-foreground">هذا زرّ كل مقالات العميل، وزرّ صفحته نفسها.</p>
      </Step>

      <Step n={2} title="زرّ المقال الخاص (اختياري)" where="الأدمن ← المقال ← «زر المقال»">
        <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            لمقال عن منتج أو خدمة بعينها: الكاتب يحطّ رابط المنتج ونصّاً قصيراً (مثل «اطلب العطر من أمازون»).
            يحلّ محلّ زرّ العميل في هذا المقال فقط، والضغطات تنعدّ على المقال. فاضي ← يبقى زرّ العميل.
          </span>
        </p>
      </Step>

      <Step n={3} title="أيقونة واتساب الصغيرة" where="من رقم جوال العميل">
        <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
          <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            تظهر جنب الزرّ لو للعميل رقم جوال — وتنشال لو الزرّ الكبير نفسه واتساب، أو ما فيه رقم. وشعار العميل
            يظهر دائماً بين الزرّين، ويفتح نافذة تعريفه.
          </span>
        </p>
      </Step>

      <Card>
        <CardContent className="space-y-2 p-5">
          <h2 className="text-sm font-semibold">«يظهر في» — صفحات الحجز والتسوّق</h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            تحت زرّ العميل في صفحته بالأدمن: <b>صفحة الحجز</b> (للعيادات والمراكز — تشتغل مع زرّ «احجز الآن» فقط) و
            <b>صفحة التسوّق</b> (للمتاجر). اختيار صريح، ما يُستنتج من الزرّ. عميل البراندنج ما يختار شي. وأزرار صفحة
            المجال تعرض شركاء ذاك المجال اللي اخترت لهم الصفحة، والزرّ اللي ما وراه أحد ينشال.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 text-sm font-semibold">وين يطبّق</h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            صفحة المقال: الشريط تحت الناف بار على الجوال، والكرت الجانبي على الكمبيوتر، والكرت تحت المقال. صفحة
            العميل نفسها تاخذ زرّه من الخطوة ١. صفحات مدونتي العامة (المقالات، الشركاء، المجالات) لها أزرارها
            الخاصّة وما يطبّق عليها.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 text-sm font-semibold">اللي تغيّر (٣ أكتوبر ٢٠٢٦)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-[11px] text-muted-foreground">
                  <th className="py-2 text-start font-semibold">الحالة</th>
                  <th className="py-2 text-start font-semibold">قبل</th>
                  <th className="py-2 text-start font-semibold">بعد</th>
                </tr>
              </thead>
              <tbody>
                {BEFORE_AFTER.map((r) => (
                  <tr key={r.c} className="border-b border-border/40 last:border-0">
                    <td className="py-2 pe-3 font-medium">{r.c}</td>
                    <td className="py-2 pe-3 leading-relaxed text-muted-foreground">{r.before}</td>
                    <td className="py-2 leading-relaxed">{r.after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Link
        href="/playbook/content/article-journey"
        className="flex items-center justify-between rounded-xl border p-4 transition-shadow hover:shadow-md"
      >
        <span className="text-xs font-semibold">رحلة المقال الكاملة</span>
        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
      </Link>
    </DocLayout>
  );
}
