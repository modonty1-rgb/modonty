import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LeadsTable } from "./components/leads-table";
import { getSalesLeads } from "./helpers/get-sales-leads";

export const metadata = { title: "العملاء المحتملون — أدمن مدونتي" };

/**
 * شاشة فاتن. المحتمَل يعيش هنا حتى يُعتمد فيصير عميلاً على مدونتي — ولهذا هو جدول مستقلّ
 * لا صفوف في `clients`: ذاك الموديل يطلب `slug` فريداً وبريداً وباقة، والمحتمَل لا يملك
 * واحداً منها بعد.
 *
 * الشاشة عربية كلّها وفيها `dir="rtl"` (خالد ٤ سبتمبر ٢٠٢٦: «فاتن مش كويسة في الإنجليزي»).
 * والأدمن إنجليزيّ في الأصل، فالاتّجاه يُضبط هنا لا في التخطيط الجذر — نفس ما تفعله شاشات
 * المقالات العربية.
 */
export default async function SalesLeadsPage() {
  const { rows, total, truncated, byStatus } = await getSalesLeads();

  return (
    <div dir="rtl" className="space-y-5 p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold leading-tight">العملاء المحتملون</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            الناس اللي بنكلّمهم — قبل ما يصيروا عملاء على مدونتي.
          </p>
        </div>
        <Link href="/sales-leads/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" aria-hidden /> إضافة عميل
          </Button>
        </Link>
      </header>

      <LeadsTable rows={rows} />

      {/* الأعداد محسوبة في القاعدة لا من الصفوف المعروضة، فتبقى صحيحة مهما طالت القائمة.
          وتُقارَن بما عرضته الشريحة: اختلافهما معناه أن القائمة مقصوصة، فيُقال ذلك صراحةً
          بدل أن ينتهي السرد عند رقم لم يخترْه أحد. */}
      {truncated && (
        <p className="text-xs text-muted-foreground">
          معروض أحدث <span className="tabular-nums">{rows.length}</span> من{" "}
          <span className="tabular-nums">{total}</span> — الباقي في القاعدة ولم يُحذف.
        </p>
      )}
      {!truncated && total > 0 && (
        <p className="text-xs text-muted-foreground">
          <span className="tabular-nums">{total}</span> عميل ·{" "}
          <span className="tabular-nums">{byStatus.PROSPECT ?? 0}</span> منهم لسه محتمل.
        </p>
      )}
    </div>
  );
}
