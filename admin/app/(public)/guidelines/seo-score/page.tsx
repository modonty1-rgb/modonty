"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gauge, Link2, Tags, Braces, User, Cpu, Info } from "lucide-react";
import { GuidelineLayout } from "../components/guideline-layout";

// The numbers on this page are the SAME ones the scorer uses — dataLayer/lib/seo/article/
// (meta-score.ts · jsonld-score.ts · links-score.ts). If a weight changes there, change it
// here in the same commit: a guideline that disagrees with the code teaches the wrong thing.

type Owner = "كاتب" | "النظام";

interface Criterion {
  label: string;
  weight: number;
  owner: Owner;
  what: string;
}

const META: Criterion[] = [
  { label: "عنوان السيو", weight: 25, owner: "كاتب", what: "العنوان الأزرق في نتيجة جوجل. مكتوب وبالطول المناسب." },
  { label: "وصف السيو", weight: 25, owner: "كاتب", what: "السطران تحت العنوان في النتيجة." },
  { label: "صورة المشاركة", weight: 25, owner: "كاتب", what: "الصورة اللي تطلع لما يتشارك الرابط على واتساب أو إكس." },
  { label: "الرابط الأساسي", weight: 10, owner: "النظام", what: "يقول لجوجل: هذي النسخة الأصلية للصفحة." },
  { label: "لغات الصفحة", weight: 10, owner: "النظام", what: "يربط النسخة السعودية بالمصرية حتى لا تتنافسا." },
  { label: "نوع الصفحة وتاريخ النشر", weight: 5, owner: "النظام", what: "وسوم تقول إن هذي مقالة ومتى نُشرت." },
];

const JSONLD: Criterion[] = [
  { label: "صحّة البيانات المنظّمة", weight: 60, owner: "النظام", what: "الكود المخفي اللي يقرؤه جوجل — لازم يعدّي الفحص بلا أخطاء." },
  { label: "العنوان", weight: 7, owner: "النظام", what: "من حقول جوجل الأربعة الأساسية للبطاقة الموسّعة." },
  { label: "الصورة البارزة", weight: 7, owner: "كاتب", what: "بدونها لا بطاقة موسّعة — وهذا الحقل الوحيد هنا اللي بيدك." },
  { label: "تاريخ النشر", weight: 7, owner: "النظام", what: "من حقول جوجل الأربعة." },
  { label: "الكاتب", weight: 7, owner: "النظام", what: "من حقول جوجل الأربعة." },
  { label: "تاريخ التعديل", weight: 6, owner: "النظام", what: "موصى به من جوجل." },
  { label: "الناشر", weight: 6, owner: "النظام", what: "موصى به من جوجل." },
];

const LINKS: Criterion[] = [
  { label: "المقالات المرتبطة", weight: 100, owner: "كاتب", what: "المقالات اللي يوديها مقالك — تبويب Related في المحرّر." },
];

const LADDER = [
  { n: "٠", pts: 0, note: "القارئ يخلّص ويطلع — ما في وجهة تالية" },
  { n: "١", pts: 40, note: "بداية، والهدف ثلاثة" },
  { n: "٢", pts: 70, note: "ناقص واحد" },
  { n: "٣ فأكثر", pts: 100, note: "كامل" },
];

const DIMENSIONS = [
  { key: "meta", title: "وسوم البحث", share: 45, icon: Tags, rows: META, color: "text-sky-400", border: "border-sky-500/25", bg: "bg-sky-500/[0.03]", note: "اللي يقرؤه جوجل مباشرة من رأس الصفحة، وهو اللي يقرّر شكل نتيجتك." },
  { key: "jsonld", title: "البيانات المنظّمة", share: 45, icon: Braces, rows: JSONLD, color: "text-violet-400", border: "border-violet-500/25", bg: "bg-violet-500/[0.03]", note: "الكود المخفي اللي يفتح البطاقة الموسّعة. النظام يولّده عند الحفظ." },
  { key: "links", title: "الربط الداخلي", share: 10, icon: Link2, rows: LINKS, color: "text-emerald-400", border: "border-emerald-500/25", bg: "bg-emerald-500/[0.03]", note: "أُضيف في ١٣ أغسطس ٢٠٢٦ — قبله كان بناء قائمة المقالات المرتبطة لا يحرّك الرقم أبداً." },
] as const;

function OwnerBadge({ owner }: { owner: Owner }) {
  const isWriter = owner === "كاتب";
  return (
    <Badge
      variant="outline"
      className={
        isWriter
          ? "border-emerald-500/40 text-emerald-400 gap-1 text-[10px] font-semibold"
          : "border-border text-muted-foreground gap-1 text-[10px] font-semibold"
      }
    >
      {isWriter ? <User className="h-3 w-3" /> : <Cpu className="h-3 w-3" />}
      {owner}
    </Badge>
  );
}

export default function SeoScorePage() {
  return (
    <GuidelineLayout
      title="نتيجة سيو المقال — من وين تجي؟"
      description="الرقم اللي تشوفه جنب كل مقال: من أي معايير يتركّب، وزن كل معيار، ومين مسؤول عنه — أنت ولا النظام"
    >
      {/* ── The one thing to understand first ─────────────────────────────── */}
      <Card className="border-amber-500/25 bg-amber-500/[0.03]">
        <CardContent className="p-5 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-amber-400 shrink-0" />
            <h2 className="text-sm font-semibold text-amber-400">اقرأ هذي أول</h2>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            الرقم يقيس <b className="text-foreground">اللي انحفظ ونُشر فعلاً</b>، مو اللي مكتوب في الفورم قدّامك.
            يعني لو كتبت وما حفظت، الرقم ما يتحرّك. وهو نفس الرقم في كل شاشة — القائمة، صفحة المقال،
            الدليل التقني — من مصدر واحد، فلو اختلفوا فهذا خلل نبلّغ عنه لا فرق طبيعي.
          </p>
        </CardContent>
      </Card>

      {/* ── The three dimensions ──────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="h-4 w-4 text-primary shrink-0" />
            <h2 className="text-sm font-semibold">التركيبة — ثلاثة أبعاد</h2>
          </div>
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
            {DIMENSIONS.map((d) => (
              <div key={d.key} className={`rounded-lg border p-3 ${d.border} ${d.bg}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold">
                    <d.icon className={`h-3.5 w-3.5 ${d.color}`} />
                    {d.title}
                  </span>
                  <span className={`text-sm font-extrabold ${d.color}`}>{d.share}٪</span>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{d.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            كل بُعد يُحسب على مئة لحاله، ثم يدخل الإجمالي بوزنه. فلو سدّيت ثغرة قيمتها ٢٥ نقطة في وسوم
            البحث، الإجمالي يطلع ١١ نقطة تقريباً (٢٥ × ٤٥٪) لا ٢٥.
          </p>
        </CardContent>
      </Card>

      {/* ── Criteria, dimension by dimension ──────────────────────────────── */}
      {DIMENSIONS.map((d) => (
        <Card key={d.key} className={d.border}>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <d.icon className={`h-4 w-4 ${d.color}`} />
                {d.title}
                <span className="text-[11px] font-normal text-muted-foreground">— وزنه {d.share}٪ من الإجمالي</span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-[11px] text-muted-foreground">
                    <th className="py-2 text-start font-semibold">المعيار</th>
                    <th className="py-2 text-start font-semibold">النقاط</th>
                    <th className="py-2 text-start font-semibold">مسؤوليّة</th>
                    <th className="py-2 text-start font-semibold">وش يعني</th>
                  </tr>
                </thead>
                <tbody>
                  {d.rows.map((c) => (
                    <tr key={c.label} className="border-b border-border/40 last:border-0">
                      <td className="py-2 pe-3 font-medium">{c.label}</td>
                      <td className="py-2 pe-3 font-mono font-bold">{c.weight}</td>
                      <td className="py-2 pe-3"><OwnerBadge owner={c.owner} /></td>
                      <td className="py-2 leading-relaxed text-muted-foreground">{c.what}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* ── The related-articles ladder ───────────────────────────────────── */}
      <Card className="border-emerald-500/25 bg-emerald-500/[0.03]">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Link2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <h2 className="text-sm font-semibold text-emerald-400">سلّم المقالات المرتبطة</h2>
          </div>
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
            {LADDER.map((l) => (
              <div key={l.n} className="rounded-lg border border-border/50 bg-background/60 p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-bold">{l.n}</span>
                  <span className="font-mono text-sm font-extrabold text-emerald-400">{l.pts}</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{l.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            ثلاثة مقالات = العلامة الكاملة، ونفس الرقم اللي يقوله لك المحرّر أصلاً («اقترح ٣–٥ مقالات»).
            جوجل ما ينشر رقماً محدّداً هنا — الثلاثة قاعدة تحريرية عندنا، لا عتبة من جوجل. ونحسب
            <b className="text-foreground"> الصادر فقط</b>: المقالات اللي مقالك يوديها. أما اللي توديه غيره فهي
            قرار كتّاب ثانيين، ما ينفع نحسبها لك.
          </p>
        </CardContent>
      </Card>

      {/* ── What to actually do ───────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <User className="h-4 w-4 text-emerald-400" />
            الأربعة اللي بيدك — وبس
          </h2>
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            من كل المعايير فوق، أربعة فقط يكتبها الكاتب. الباقي يولّده النظام عند الحفظ، فلا تطارده
            ولا تحاول تعدّله يدوياً:
          </p>
          <ol className="space-y-2 text-xs">
            {[
              { t: "عنوان السيو", g: "تعديل المقال › SEO", p: "٢٥ نقطة من وسوم البحث" },
              { t: "وصف السيو", g: "تعديل المقال › SEO", p: "٢٥ نقطة من وسوم البحث" },
              { t: "الصورة الرئيسية", g: "تعديل المقال › Media", p: "٢٥ من وسوم البحث + ٧ من البيانات المنظّمة" },
              { t: "المقالات المرتبطة", g: "تعديل المقال › Related", p: "الربط الداخلي كامل — ١٠٪ من الإجمالي" },
            ].map((s, i) => (
              <li key={s.t} className="flex gap-2.5 rounded-lg border border-border/50 bg-background/60 p-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-[11px] font-bold text-emerald-400">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <div className="font-semibold">{s.t}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    مكانه: {s.g} · يستحقّ: {s.p}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </GuidelineLayout>
  );
}
