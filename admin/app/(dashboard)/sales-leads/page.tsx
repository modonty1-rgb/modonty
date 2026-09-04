import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DueToday } from "./components/due-today";
import { LeadsTable } from "./components/leads-table";
import { getSalesLeads } from "./helpers/get-sales-leads";
import { formatMoney } from "./helpers/funnel";

export const metadata = { title: "العملاء المحتملون — أدمن مدونتي" };

export default async function SalesLeadsPage() {
  const { due, rows, total, truncated, byStage, pipelineValue } = await getSalesLeads();

  const open = (byStage.NEW ?? 0) + (byStage.CONTACTED ?? 0) + (byStage.QUOTED ?? 0) + (byStage.NEGOTIATING ?? 0);
  const value = [formatMoney(pipelineValue.SAR, "SAR"), formatMoney(pipelineValue.EGP, "EGP")]
    .filter(Boolean)
    .join(" · ");

  return (
    <div dir="rtl" className="space-y-4 p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold leading-tight">العملاء المحتملون</h1>
          {/* سطرٌ واحد يقول حجم الشغل وقيمته. كان يشرح ما هي الصفحة — وهو ما تعرفه فاتن
              بعد أوّل يوم — بينما الرقم الذي يتغيّر كل صباح لم يكن مكتوباً في أي مكان. */}
          <p className="mt-0.5 text-xs text-muted-foreground">
            <span className="tabular-nums">{open}</span> صفقة مفتوحة
            {value && (
              <>
                {" · "}قيمتها <span className="font-medium text-foreground">{value}</span> في الشهر
              </>
            )}
          </p>
        </div>
        <Link href="/sales-leads/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" aria-hidden /> إضافة عميل
          </Button>
        </Link>
      </header>

      <DueToday leads={due} />

      <LeadsTable rows={rows} />

      {truncated && (
        <p className="text-xs text-muted-foreground">
          معروض أحدث <span className="tabular-nums">{rows.length}</span> من{" "}
          <span className="tabular-nums">{total}</span> — الباقي في القاعدة ولم يُحذف.
        </p>
      )}
    </div>
  );
}
