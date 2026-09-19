import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { checkOrdersMigrationGate } from "@/lib/orders-migration-gate";
import { planRebuild } from "../orders-migration/helpers/plan-rebuild";
import { RebuildOrdersPanel } from "../orders-migration/components/rebuild-orders-panel";
import { planDocuments } from "./helpers/plan-documents";
import { DocumentsMigrationPanel } from "./components/documents-migration-panel";

/**
 * **الترحيلاتُ لمرّةٍ واحدة — صفحةٌ واحدةٌ تجمعها.**
 *
 * خالد (١٩ سبتمبر ٢٠٢٦): «فكرة الترحيل هذه كمان في نفس البطن اللي عملناه لترحيل
 * الأوردرز».
 *
 * وكان الراوتُ `/orders-migration` — اسمٌ يصف ترحيلاً واحداً. فلمّا صارا اثنين خرج
 * الاسمُ عن محتواه، والقاعدةُ عندنا أن يقول الاسمُ نطاقَه لا أوسعَ منه ولا أضيق. فصار
 * `/migrations`، والقديمُ يحوّل إليه فلا يُكسر رابطٌ محفوظ.
 *
 * ── وكلاهما يضيف ولا يمسح ──
 * كان ترحيلُ الطلبات يمسح الطلباتِ والفواتيرَ ثمّ يعيد بناءها، فكان حارسُه يرفض بعد أوّل
 * طلب. وسقط المسحُ (خالد ١٩ سبتمبر ٢٠٢٦) فسقط المنعُ معه: صار يتخطّى كلَّ عميلٍ له طلب،
 * وإعادتُه بلا أثر. وترحيلُ الوثائق كذلك يضيف فقط والمصدرُ يبقى مكانَه، والتكرارُ يُمنع
 * بالرابط نفسِه لا بعلامةٍ تُرفع.
 */
export const dynamic = "force-dynamic";

export default async function MigrationsPage() {
  const gate = await checkOrdersMigrationGate();
  if (!gate.allowed && gate.reason === "unauthenticated") redirect("/login");
  if (!gate.allowed && gate.reason === "forbidden") redirect("/");

  const [plan, docs] = await Promise.all([planRebuild(), planDocuments()]);

  return (
    <div dir="rtl" className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <header className="space-y-1">
        <h1 className="text-lg font-bold">الترحيلات</h1>
        <p className="text-sm text-muted-foreground">
          عمليّاتٌ تُجرى مرّةً على بياناتٍ قديمة. كلٌّ منها تقول ما ستفعله قبل أن تفعله.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-bold">ترحيل الطلبات</h2>
        {plan.toBuild > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-amber-700 dark:text-amber-300">
              يُبنى طلبٌ لكلّ عميلٍ لا طلبَ له — ولا يُمسح شيء.
            </p>
            <p className="text-muted-foreground">
              مَن عنده طلبٌ بالفعل يُتخطّى، فلا تُمسّ طلباتُ صفحة الدفع ولا الفواتير ولا المعاملات.
              ولا يُعدَّل عميلٌ ولا يُحذف. وما لا يُعرف يُكتب صفراً ويُوسم «يحتاج مراجعة» — ويظهر
              وسمُه في جدول الاشتراكات فتُصحَّح صفوفُه من هناك. وإعادةُ التشغيل بلا أثر: الثانيةُ
              تتخطّى الجميع.
            </p>
          </div>
        </div>
        )}
        <RebuildOrdersPanel plan={plan} />
      </section>

      <DocumentsMigrationPanel plan={docs} />
    </div>
  );
}
