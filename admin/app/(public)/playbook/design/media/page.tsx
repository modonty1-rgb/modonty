import Link from "next/link";
import { AlertTriangle, Film, ImageIcon, Workflow } from "lucide-react";

import { DocLayout } from "@/app/(public)/components/doc-layout";

/**
 * مقاسات الوسائط — نُقلت من `guidelines/media` وحُذفت الصفحة هناك.
 * ما لم يُنقل: الألوان والخطوط واللوقو، لأنها موجودة في `/playbook/design/brand` أصلًا، ونقلها
 * كان سيعيد التكرار الذي نزيله.
 */
const specs = [
  { name: "صورة المقال", upload: "1920 × 1080", format: "WebP / JPG", ratio: "16:9", note: "" },
  { name: "شعار الشريك", upload: "500 × 500", format: "PNG شفاف", ratio: "1:1", note: "الخلفية الشفافة إلزامية." },
  { name: "صورة الكاتب", upload: "500 × 500", format: "JPG / PNG", ratio: "1:1", note: "الوجه في المنتصف." },
  { name: "غلاف صفحة الشريك", upload: "2400 × 400", format: "WebP / JPG", ratio: "6:1", note: "لا تضع نصًّا داخل الصورة." },
  { name: "صورة الفئة", upload: "600 × 600", format: "WebP / JPG", ratio: "1:1", note: "تظهر مربّعة وبنسبة 16:9 — المنتصف آمن دائمًا." },
] as const;

const pipeline = [
  "تُخزَّن على Bunny، وهو مورّد الوسائط الوحيد عندنا.",
  "من صور المقالات تُولَّد ثلاث نسخ بمقاسات مختلفة تلقائيًّا، وهي التي تظهر للزائر.",
  "يُبنى بديل ضبابي صغير يظهر ريثما تُحمَّل الصورة الحقيقية.",
  "اسم الملف يُعاد ضبطه وصفيًّا عند كتابة سيو الصورة — لا تسمّه بيدك.",
] as const;

const safeZone = [
  ["صورة المقال", "تظهر كاملة في صفحة المقال، وتُقصّ من الجوانب في البطاقات والقوائم، وتُقصّ مربّعة في الشريط الجانبي وصفحة الشريك."],
  ["الشعارات وصور الكتّاب", "تظهر من دائرة صغيرة ٢٤ بكسل إلى صورة شخصية ١١٢ بكسل. اجعل الشعار في المنتصف وحوله مسافة من كل جهة."],
  ["القاعدة العامة", "الوجه أو العنصر المهمّ في المنتصف دائمًا، لأن القصّ يبدأ من الأطراف."],
] as const;

const video = [
  ["واجهة الصفحة", "16:9", "≤ ٦٠ ثانية", "1920×1080"],
  ["داخل المقال", "16:9", "≤ ٩٠ ثانية", "1920×1080"],
  ["ريلز وشورتس", "9:16", "≤ ٣٠ ثانية", "1080×1920"],
  ["منشور الفيد", "1:1", "≤ ٣٠ ثانية", "1080×1080"],
] as const;

export default function MediaPage() {
  return (
    <DocLayout
      parentHref="/playbook"
      parentLabel="دليل الفريق"
      title="مقاسات الصور والفيديو"
      description="ارفع المقاس الصحيح من مصدر مرخّص، والباقي يتولّاه النظام. ألوان البراند وخطوطه ولوقوه في صفحة الهوية."
    >
      <section className="rounded-lg border bg-card p-4">
        <h2 className="flex items-center gap-2 text-[15px] font-bold">
          <ImageIcon className="h-4 w-4 text-primary" />
          ارفعها بهذا المقاس
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-right text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-3 py-2.5 font-bold">نوع الصورة</th>
                <th className="px-3 py-2.5 font-bold">المقاس</th>
                <th className="px-3 py-2.5 font-bold">الصيغة</th>
                <th className="px-3 py-2.5 font-bold">النسبة</th>
                <th className="px-3 py-2.5 font-bold">ملاحظة</th>
              </tr>
            </thead>
            <tbody>
              {specs.map((row) => (
                <tr key={row.name} className="border-b last:border-0">
                  <th className="px-3 py-2.5 text-right font-semibold">{row.name}</th>
                  <td className="px-3 py-2.5 font-mono font-bold text-primary" dir="ltr">{row.upload}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{row.format}</td>
                  <td className="px-3 py-2.5 font-mono text-muted-foreground" dir="ltr">{row.ratio}</td>
                  <td className="px-3 py-2.5 leading-6 text-muted-foreground">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12.5px] leading-6 text-muted-foreground">
          أقلّ دقّة مقبولة ١٠٨٠ بكسل على الضلع الأقصر، ولا تحتاج أن تصنع نسخًا بنفسك.
        </p>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-lg border bg-card p-4">
          <h2 className="flex items-center gap-2 text-[15px] font-bold">
            <Workflow className="h-4 w-4 text-primary" />
            ما يحدث للصورة بعد الرفع
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 ps-5 text-[13px] leading-7 text-muted-foreground marker:text-foreground/40">
            {pipeline.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </article>

        <article className="rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-4">
          <h2 className="flex items-center gap-2 text-[15px] font-bold">
            <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-300" />
            المنطقة الآمنة
          </h2>
          <div className="mt-3 space-y-2">
            {safeZone.map(([title, note]) => (
              <div key={title} className="rounded-md border bg-background/60 p-3">
                <p className="text-[13px] font-bold">{title}</p>
                <p className="mt-1 text-[12.5px] leading-6 text-muted-foreground">{note}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-lg border bg-card p-4">
        <h2 className="flex items-center gap-2 text-[15px] font-bold">
          <Film className="h-4 w-4 text-primary" />
          الفيديو
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-right text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-3 py-2.5 font-bold">القناة</th>
                <th className="px-3 py-2.5 font-bold">النسبة</th>
                <th className="px-3 py-2.5 font-bold">المدّة</th>
                <th className="px-3 py-2.5 font-bold">المقاس</th>
              </tr>
            </thead>
            <tbody>
              {video.map(([channel, ratio, duration, size]) => (
                <tr key={channel} className="border-b last:border-0">
                  <th className="px-3 py-2.5 text-right font-semibold">{channel}</th>
                  <td className="px-3 py-2.5 font-mono text-muted-foreground" dir="ltr">{ratio}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{duration}</td>
                  <td className="px-3 py-2.5 font-mono font-bold text-primary" dir="ltr">{size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12.5px] leading-6 text-muted-foreground">
          صيغة موحّدة: MP4 بترميز H.264، وصوت AAC بمعدّل ١٢٨ كيلوبت، ومعدّل بيانات لا يتجاوز ٨ ميغابت.
        </p>
        <p className="mt-2.5 rounded-md bg-primary/[0.06] p-3 text-[13px] font-semibold leading-6 text-primary">
          قاعدة الثلاث ثوانٍ: إن لم تُشوّق في أول ثلاث ثوانٍ فقدت المشاهد. لا مقدّمة أطول من ذلك،
          ولا نصوص صغيرة لا تُقرأ على الجوّال، ولا تشغيل تلقائي بصوت، ولا موسيقى بلا ترخيص.
        </p>
      </section>

      <p className="rounded-lg border border-dashed p-4 text-[13px] leading-7 text-muted-foreground">
        ألوان البراند وخطوطه وقواعد استعمال الشعار في{" "}
        <Link href="/playbook/design/brand" className="font-semibold text-primary hover:underline">صفحة الهوية والنبرة</Link>،
        وسيو الصور في{" "}
        <Link href="/playbook/tech/image-seo" className="font-semibold text-primary hover:underline">الجانب التقني</Link>.
      </p>
    </DocLayout>
  );
}
