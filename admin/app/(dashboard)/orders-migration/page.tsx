import { redirect } from "next/navigation";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { db } from "@/lib/db";
import { checkOrdersMigrationGate } from "@/lib/orders-migration-gate";
import { planRebuild } from "./helpers/plan-rebuild";
import { RebuildOrdersPanel } from "./components/rebuild-orders-panel";

/**
 * **ترحيلُ الطلبات — صفحةٌ لمرّةٍ واحدة، في قسم System.**
 *
 * نزلت من قائمة أدوات المطوّر في الشريط العلويّ (خالد ١٨ سبتمبر ٢٠٢٦: «شيله من هنا
 * وحطّه في الـsystem»). موضعُها هناك كان يقول إنّها أداةُ تطوير، وهي عمليّةٌ تُجرى على
 * الإنتاج مرّةً واحدة: العملاءُ القدامى الذين وُلدوا قبل نظام الطلبات هناك لا عندنا.
 *
 * **وتختفي بنفسها متى تمّت** — لا بعلامةٍ تُرفع بيد بل بالواقع، والشرطُ في
 * `lib/orders-migration-gate.ts` يقرؤه المسارُ نفسُه فلا تقول الشاشةُ غيرَ ما يفعله الخادم.
 *
 * وسابقتُها في القسم نفسه: «Bunny Migration» — ترحيلٌ لمرّةٍ واحدة يُحذف ملفُّه متى تمّ.
 */
export const dynamic = "force-dynamic";

export default async function OrdersMigrationPage() {
  const gate = await checkOrdersMigrationGate();
  if (!gate.allowed && gate.reason === "unauthenticated") redirect("/login");
  if (!gate.allowed && gate.reason === "forbidden") redirect("/");

  // الجردُ يُحسب هنا لا في المتصفّح — يصل مع الرسمة الأولى بلا انتظار.
  const [clients, plan] = await Promise.all([db.client.count(), gate.allowed ? planRebuild() : Promise.resolve(null)]);

  return (
    <div dir="rtl" className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <header className="space-y-1">
        <h1 className="text-lg font-bold">ترحيل الطلبات</h1>
        <p className="text-sm text-muted-foreground">
          يُصنع لكلّ عميلٍ قائمٍ طلبٌ من بياناته، فيصير للجميع مصدرٌ واحدٌ للباقة والمبلغ والمدّة.
        </p>
      </header>

      {!gate.allowed ? (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-emerald-700 dark:text-emerald-300">تمّ الترحيل — لا يُعاد.</p>
            <p className="text-muted-foreground">
              في الجدول <b className="tabular-nums">{gate.orders}</b> طلباً لـ
              <b className="tabular-nums">{clients}</b> عميلاً. إعادةُ البناء تمسح الطلبات والفواتير،
              فلا تُتاح بعد أن صار فيها مال. وما احتاج تصحيحاً يُصحَّح من صفحة الطلب نفسه.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-amber-700 dark:text-amber-300">
                تُمسح الطلبات والفواتير كلُّها ثمّ تُبنى من جديد.
              </p>
              <p className="text-muted-foreground">
                لا يُعدَّل عميلٌ ولا يُحذف. وما لا يُعرف يُكتب صفراً ويُوسم «يحتاج مراجعة» — ويظهر وسمُه
                في جدول الاشتراكات فتُصحَّح صفوفُه من هناك.
                {gate.isDev ? " · قاعدةُ التجارب: يُعاد ما شئت." : " تُجرى مرّةً واحدة ثمّ تختفي هذه الصفحة."}
              </p>
            </div>
          </div>
          {plan && <RebuildOrdersPanel plan={plan} />}
        </>
      )}
    </div>
  );
}
