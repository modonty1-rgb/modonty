"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, Users } from "lucide-react";

import { DataTable, type Column } from "@/components/admin/data-table";
import { cn } from "@/lib/utils";
import type { SalesLeadRow } from "../helpers/get-sales-leads";

const STATUS_LABEL: Record<string, string> = { PROSPECT: "محتمل", ACTIVE: "نشط", ARCHIVED: "مؤرشف" };

/**
 * نقطة صغيرة بدل شارة ملوّنة ممتلئة.
 *
 * الشارة الممتلئة كانت أثقل شيء في الصفّ، فتسحب العين إلى العمود الذي لا يتغيّر كثيراً
 * وتترك الاسم — وهو ما تبحث عنه فاتن فعلاً — بوزن عاديّ. النقطة تقول الحالة بلمحة،
 * ويبقى ثقل السطر لصاحبه.
 */
const STATUS_DOT: Record<string, string> = {
  PROSPECT: "bg-amber-500",
  ACTIVE: "bg-emerald-500",
  ARCHIVED: "bg-slate-400",
};

/** نفس ألوان النقاط، على الكلمة نفسها — فاللون والتسمية عنصرٌ واحد لا اثنان. */
const STATUS_TEXT: Record<string, string> = {
  PROSPECT: "text-amber-600 dark:text-amber-400",
  ACTIVE: "text-emerald-600 dark:text-emerald-400",
  ARCHIVED: "text-muted-foreground",
};

const SOURCE_LABEL: Record<string, string> = {
  REFERRAL: "إحالة", AD: "إعلان", SOCIAL: "سوشال",
  SEARCH: "بحث", PERSONAL: "معرفة شخصية", OTHER: "غير كده",
};
const COUNTRY_LABEL: Record<string, string> = { SA: "السعودية", EG: "مصر" };

const dateFmt = new Intl.DateTimeFormat("ar-EG", {
  day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Riyadh",
});

export function LeadsTable({ rows }: { rows: SalesLeadRow[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<string>("ALL");
  const shown = status === "ALL" ? rows : rows.filter((r) => r.status === status);

  const counts: Record<string, number> = { ALL: rows.length };
  for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;

  const columns: Column<SalesLeadRow>[] = [
    {
      key: "name",
      header: "العميل",
      sortable: true,
      render: (r) => (
        <div className="min-w-0">
          {/* رابط حقيقي، لا صفٌّ قابل للنقر وحده: الصفّ يفتح بالفأرة، وهذا يفتح بالكيبورد
              أيضاً ويُنسخ عنوانه بالزرّ الأيمن. `stopPropagation` كي لا يُفتح مرّتين. */}
          <Link
            href={`/sales-leads/${r.id}`}
            onClick={(e) => e.stopPropagation()}
            className="block truncate font-medium hover:underline"
          >
            {r.name}
          </Link>
          {(r.company || r.contactName) && (
            <div className="truncate text-[11px] text-muted-foreground">
              {[r.company, r.contactName].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
      ),
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
                {/* `tabular-nums` كي تصطفّ الأرقام رأسياً بين الصفوف، و`dir="ltr"` كي لا
                    يعكس محرّك الاتجاهين مجموعات الرقم داخل سطر عربيّ: الرقم يبقى صحيحاً
                    في القاعدة ويُقرأ مقلوباً على الشاشة — أسوأ خطأ في شيء يُطلَب للاتصال. */}
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
            {r.email && (
              <bdi dir="ltr" className="block truncate text-[11px] text-muted-foreground">{r.email}</bdi>
            )}
          </div>
        );
      },
    },
    {
      key: "industryName",
      header: "المجال والسوق",
      render: (r) => (
        <div className="min-w-0">
          {r.industryName ? (
            <div className="truncate text-xs">{r.industryName}</div>
          ) : (
            // ليست شرطة: خمسة صفوف وصلت من النظام القديم بتصنيف `healthcare-test` لا يقابله
            // شيء. الشرطة تقول «فاضي»، وهذه تقول «فيه قيمة لكنها لا تربط» — وهو عمل ينتظر.
            <div className="text-[11px] text-amber-600 dark:text-amber-400">مش مربوط</div>
          )}
          <div className="truncate text-[11px] text-muted-foreground">
            {[r.countryCode ? COUNTRY_LABEL[r.countryCode] : null, r.source ? SOURCE_LABEL[r.source] : null]
              .filter(Boolean)
              .join(" · ") || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "الحالة",
      sortable: true,
      // إشارة واحدة لا اثنتان: كانت نقطةٌ ملوّنة أوّل الصفّ **و** الكلمة هنا — وهما يقولان
      // الشيء نفسه، وهو الحشو عينه الذي أزلناه من صفّ العدّادات. اللون على الكلمة يجمع
      // اللمحة والتسمية في عنصر واحد، ولا يعتمد على اللون وحده كي يقرأه مَن لا يميّزه.
      render: (r) => (
        <span className={cn("text-xs font-medium", STATUS_TEXT[r.status])}>
          {STATUS_LABEL[r.status] ?? r.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "اتضاف",
      sortable: true,
      sortFn: (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      render: (r) => (
        <span className="whitespace-nowrap text-[11px] tabular-nums text-muted-foreground">
          {dateFmt.format(r.createdAt)}
        </span>
      ),
    },
  ];

  // الشرائح تُمرَّر إلى `DataTable` لتجلس في صفّ البحث نفسه. كانت في سطر مستقلّ فوقه، فصار
  // فوق الجدول ثلاثة صفوف: أعداد، ثم شرائح، ثم بحث — وكلّها تدفع الجدول لأسفل، وهو المقصود.
  const filters = (
    <div className="flex flex-wrap items-center gap-2">
      {["ALL", "PROSPECT", "ACTIVE", "ARCHIVED"].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => setStatus(status === s ? "ALL" : s)}
          aria-pressed={status === s}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors",
            status === s
              ? "border-foreground bg-foreground text-background"
              : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
          )}
        >
          {s !== "ALL" && <span className={cn("size-1.5 rounded-full", STATUS_DOT[s])} aria-hidden />}
          {s === "ALL" ? "الكل" : STATUS_LABEL[s]}
          <span className="tabular-nums opacity-60">{counts[s] ?? 0}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* الفلاتر تبقى ظاهرة حتى مع القائمة الفارغة — إخفاؤها يترك مَن فلتر بلا طريق للرجوع. */}
      {shown.length === 0 && filters}

      {shown.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <Users className="mx-auto mb-3 size-8 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium">
            {rows.length === 0 ? "مافيش عملاء لسه" : `مافيش حد في «${STATUS_LABEL[status]}»`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {rows.length === 0 ? "ضيف أول عميل وابدأ." : "جرّب فلتر تاني أو ارجع للكل."}
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
