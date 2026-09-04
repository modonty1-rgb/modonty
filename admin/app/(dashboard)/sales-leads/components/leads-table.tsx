"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, Users } from "lucide-react";

import { DataTable, type Column } from "@/components/admin/data-table";
import { cn } from "@/lib/utils";
import {
  DUE_TONE, STAGES, STAGE_DOT, STAGE_LABEL, STAGE_TEXT,
  describeDue, formatMoney, LOST_LABEL, type LostReason, type Stage,
} from "../helpers/funnel";
import type { SalesLeadRow } from "../helpers/get-sales-leads";

const COUNTRY_LABEL: Record<string, string> = { SA: "السعودية", EG: "مصر" };

export function LeadsTable({ rows }: { rows: SalesLeadRow[] }) {
  const router = useRouter();
  const [stage, setStage] = useState<string>("ALL");
  const shown = stage === "ALL" ? rows : rows.filter((r) => r.stage === stage);

  const counts: Record<string, number> = { ALL: rows.length };
  for (const r of rows) counts[r.stage] = (counts[r.stage] ?? 0) + 1;

  const columns: Column<SalesLeadRow>[] = [
    {
      key: "name",
      header: "العميل",
      sortable: true,
      render: (r) => (
        <div className="min-w-0">
          <Link
            href={`/sales-leads/${r.id}`}
            onClick={(e) => e.stopPropagation()}
            className="block truncate font-medium hover:underline"
          >
            {r.name}
          </Link>
          {/* آخر ما قيل — لا اسم الشركة. حين تعود فاتن لصفٍّ بعد أسبوع فسؤالها «وصلنا لفين
              معاه؟» لا «شركته اسمها إيه؟»، والشركة موجودة في البطاقة على أي حال. */}
          <div className="truncate text-[11px] text-muted-foreground">
            {r.lastNote || r.company || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "nextActionAt",
      header: "المتابعة الجاية",
      sortable: true,
      // الفارغ ينزل آخر القائمة في الاتّجاهين: صفٌّ بلا موعد ليس «أقرب موعد»، وتصدّره
      // للترتيب يدفن ما له موعد فعلاً.
      sortFn: (a, b) =>
        (a.nextActionAt ? a.nextActionAt.getTime() : Number.MAX_SAFE_INTEGER) -
        (b.nextActionAt ? b.nextActionAt.getTime() : Number.MAX_SAFE_INTEGER),
      render: (r) => {
        const due = describeDue(r.nextActionAt);
        return (
          <div className="min-w-0">
            <div className={cn("text-xs font-medium", DUE_TONE[due.tone])}>{due.text}</div>
            {r.nextActionNote && (
              <div className="truncate text-[11px] text-muted-foreground">{r.nextActionNote}</div>
            )}
          </div>
        );
      },
    },
    {
      key: "stage",
      header: "المرحلة",
      sortable: true,
      render: (r) => (
        <div className="min-w-0">
          <span className={cn("text-xs font-medium", STAGE_TEXT[r.stage as Stage])}>
            {STAGE_LABEL[r.stage as Stage] ?? r.stage}
          </span>
          {/* السبب مُلحَق بالمرحلة لا في عمودٍ خاصّ: يخصّ صفوف «خسرناه» وحدها، وعمودٌ فارغ
              في تسعين بالمئة من الصفوف يشغل عرضاً ولا يفيد. */}
          {r.stage === "LOST" && r.lostReason && (
            <div className="truncate text-[11px] text-muted-foreground">
              {LOST_LABEL[r.lostReason as LostReason] ?? r.lostReason}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "expectedMonthly",
      header: "القيمة المتوقّعة",
      sortable: true,
      sortFn: (a, b) => (a.expectedMonthly ?? 0) - (b.expectedMonthly ?? 0),
      render: (r) => {
        const money = formatMoney(r.expectedMonthly, r.currency);
        return money ? (
          <span className="whitespace-nowrap text-xs font-medium tabular-nums">{money}</span>
        ) : (
          <span className="text-[11px] text-muted-foreground/60">مش محدّد</span>
        );
      },
    },
    {
      key: "phone",
      header: "التواصل",
      render: (r) => {
        const digits = (r.phone ?? "").replace(/[^\d]/g, "");
        return (
          <div className="min-w-0">
            {r.phone ? (
              <div className="flex items-center gap-1.5">
                <bdi dir="ltr" className="font-mono text-xs tabular-nums">{r.phone}</bdi>
                {digits && (
                  <a
                    href={`https://wa.me/${digits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`واتساب ${r.name}`}
                    className="text-emerald-600 opacity-50 transition-opacity hover:opacity-100 dark:text-emerald-400"
                  >
                    <MessageCircle className="size-3.5" aria-hidden />
                  </a>
                )}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">مافيش رقم</span>
            )}
            <div className="truncate text-[11px] text-muted-foreground">
              {[r.industryName, r.countryCode ? COUNTRY_LABEL[r.countryCode] : null]
                .filter(Boolean)
                .join(" · ") || "—"}
            </div>
          </div>
        );
      },
    },
    {
      key: "ownerName",
      header: "مسؤول عنه",
      sortable: true,
      render: (r) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">{r.ownerName ?? "—"}</span>
      ),
    },
  ];

  const filters = (
    <div className="flex flex-wrap items-center gap-1.5">
      {(["ALL", ...STAGES] as const).map((s) => {
        const n = counts[s] ?? 0;
        // المرحلة الفارغة تختفي من الشريط — إلّا «الكل». سبعة أزرار أربعةٌ منها أصفار
        // تجعل الشريط يُمسح بحثاً عمّا فيه شيء بدل أن يُقرأ.
        if (s !== "ALL" && n === 0 && stage !== s) return null;
        return (
          <button
            key={s}
            type="button"
            onClick={() => setStage(stage === s ? "ALL" : s)}
            aria-pressed={stage === s}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors",
              stage === s
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
            )}
          >
            {s !== "ALL" && <span className={cn("size-1.5 rounded-full", STAGE_DOT[s as Stage])} aria-hidden />}
            {s === "ALL" ? "الكل" : STAGE_LABEL[s as Stage]}
            <span className="tabular-nums opacity-60">{n}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-3">
      {shown.length === 0 && filters}

      {shown.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <Users className="mx-auto mb-3 size-8 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium">
            {rows.length === 0 ? "مافيش عملاء لسه" : `مافيش حد في «${STAGE_LABEL[stage as Stage] ?? stage}»`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {rows.length === 0 ? "ضيف أول عميل وابدأ." : "جرّب مرحلة تانية أو ارجع للكل."}
          </p>
        </div>
      ) : (
        <DataTable
          data={shown}
          columns={columns}
          searchKey="name"
          searchPlaceholder="دوّر بالاسم…"
          pageSize={20}
          toolbar={filters}
          onRowClick={(r) => router.push(`/sales-leads/${r.id}`)}
        />
      )}
    </div>
  );
}
