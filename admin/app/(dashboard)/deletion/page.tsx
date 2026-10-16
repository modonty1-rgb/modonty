import { ShieldAlert } from "lucide-react";

import { checkFinanceAdmin } from "@/lib/require-finance-admin";

import { DeletionBoard } from "./components/deletion-board";
import { getDeletionRows } from "./helpers/get-deletion-rows";
import { getRedirectTargets } from "./helpers/get-redirect-targets";

/**
 * **الحذف — System** (خالد ١٦ أكتوبر ٢٠٢٦: «أي حذف يأثّر على السيو… وديه على السيستم عند الأدمن»).
 * المكان الوحيد لحذف العملاء والمقالات والتصنيفات والوسوم والصناعات، وللأدمن وحده.
 * كل صفّ يقول هل رابطه حيّ عند جوجل وما يمنع حذفه؛ والحذف نفسه يعيد الفحص على الخادم.
 */
export default async function DeletionPage() {
  const gate = await checkFinanceAdmin();
  if (gate.status !== "ok") {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-lg border bg-card p-6 text-center" dir="rtl">
        <ShieldAlert className="mx-auto mb-3 size-8 text-destructive" aria-hidden />
        <p className="font-semibold">الحذف للأدمن فقط</p>
        <p className="mt-1 text-sm text-muted-foreground">حسابك ما عنده صلاحية الحذف. لو تحتاج تشيل شي، اطلبه من الأدمن.</p>
      </div>
    );
  }

  const [rows, redirectTargets] = await Promise.all([getDeletionRows(), getRedirectTargets()]);
  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">الحذف</h1>
        <p className="text-sm text-muted-foreground">
          أي شي ينحذف هنا يرجع رابطه لجوجل «410 محذوف» وينشال من البحث. المربوط بغيره ما ينحذف حتى يُفكّ.
        </p>
      </div>
      <DeletionBoard rows={rows} redirectTargets={redirectTargets} />
    </div>
  );
}
