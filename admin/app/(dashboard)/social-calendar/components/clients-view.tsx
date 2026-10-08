"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, LayoutGrid, Table2 } from "lucide-react";

import { CountTab } from "@/components/admin/count-tab";
import { DataTable, type Column } from "@/components/admin/data-table";
import { cn } from "@/lib/utils";

import { MONTH_LABELS, parseMonthParam } from "../helpers/dates";
import type { CalendarClientRow } from "../helpers/queries";
import { ClientAvatar } from "./client-avatar";

type ViewMode = "cards" | "table";
type Filter = "all" | "active";
const STORAGE_KEY = "social-calendar:clients-view";

/** أين يفتح الكرت: الشهر الحالي إن كان فيه منشور، وإلّا آخر شهر نشط، وإلّا الشهر الحالي (القديم `resolveFirstMonth`). */
function firstMonth(client: CalendarClientRow, currentMonth: string): string {
  if (client.activeMonths.includes(currentMonth)) return currentMonth;
  return client.activeMonths[client.activeMonths.length - 1] ?? currentMonth;
}

function monthLabel(param: string | undefined): string {
  if (!param) return "—";
  const m = parseMonthParam(param);
  return m ? `${MONTH_LABELS[m.month]} ${m.year}` : param;
}

/**
 * عرض كروت/جدول، والاختيار محفوظ في المتصفّح كالقديم (`ClientsView.tsx:72-93`).
 * فلتر «النوع» (وسائل تواصل/مقالات) سقط مع حقل النوع (س١٢)؛ مكانه «الكل / لهم منشورات» —
 * عملاء مدونتي كلّهم يظهرون هنا، ومَن لم يُكتب له منشور بعد يُخفى بنقرة.
 */
export function ClientsView({ clients, currentMonth }: { clients: CalendarClientRow[]; currentMonth: string }) {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("cards");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "cards" || saved === "table") setView(saved);
    } catch (error) {
      console.warn("[social-calendar] could not read saved view", error);
    }
  }, []);

  function switchView(v: ViewMode) {
    setView(v);
    try {
      window.localStorage.setItem(STORAGE_KEY, v);
    } catch (error) {
      console.warn("[social-calendar] could not save view", error);
    }
  }

  const activeCount = useMemo(() => clients.filter((c) => c.totalPosts > 0).length, [clients]);
  const shown = useMemo(
    () => (filter === "all" ? clients : clients.filter((c) => c.totalPosts > 0)),
    [clients, filter],
  );

  const columns: Column<CalendarClientRow>[] = [
    {
      key: "name",
      header: "الاسم",
      sortable: true,
      render: (c) => (
        <span className="flex items-center gap-2">
          <ClientAvatar name={c.name} logoUrl={c.logoUrl} className="h-6 w-6 rounded-md text-[11px]" />
          <span className="font-semibold text-foreground">{c.name}</span>
        </span>
      ),
    },
    {
      key: "totalPosts",
      header: "منشورات",
      sortable: true,
      className: "text-center",
      render: (c) => <span className="tabular-nums">{c.totalPosts}</span>,
    },
    {
      key: "months",
      header: "شهور",
      sortable: true,
      sortFn: (a, b) => a.activeMonths.length - b.activeMonths.length,
      className: "text-center",
      render: (c) => <span className="tabular-nums">{c.activeMonths.length}</span>,
    },
    {
      key: "lastMonth",
      header: "آخر شهر",
      sortable: true,
      sortFn: (a, b) => (a.activeMonths.at(-1) ?? "").localeCompare(b.activeMonths.at(-1) ?? ""),
      className: "text-center",
      render: (c) => <span className="text-muted-foreground">{monthLabel(c.activeMonths.at(-1))}</span>,
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <CountTab label="الكل" count={clients.length} active={filter === "all"} onClick={() => setFilter("all")} />
          <CountTab
            label="لهم منشورات"
            count={activeCount}
            active={filter === "active"}
            onClick={() => setFilter(filter === "active" ? "all" : "active")}
          />
        </div>

        <div className="inline-flex overflow-hidden rounded-lg border border-border bg-card">
          {(
            [
              { v: "cards", label: "كروت", Icon: LayoutGrid },
              { v: "table", label: "جدول", Icon: Table2 },
            ] as const
          ).map(({ v, label, Icon }) => (
            <button
              key={v}
              type="button"
              onClick={() => switchView(v)}
              aria-pressed={view === v}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {view === "table" ? (
        <DataTable
          arabic
          data={shown}
          columns={columns}
          searchKey="name"
          searchPlaceholder="ابحث بالاسم..."
          emptyText="لا توجد نتائج"
          onRowClick={(c) => router.push(`/social-calendar/${c.id}/${firstMonth(c, currentMonth)}`)}
        />
      ) : shown.length === 0 ? (
        <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          لا عميل له منشورات بعد
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {shown.map((c) => (
            <Link
              key={c.id}
              href={`/social-calendar/${c.id}/${firstMonth(c, currentMonth)}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex flex-1 flex-col gap-3 p-3">
                <div className="flex min-w-0 items-center gap-2">
                  <ClientAvatar name={c.name} logoUrl={c.logoUrl} />
                  <div className="min-w-0">
                    <h2 className="truncate text-xs font-semibold leading-snug text-foreground">{c.name}</h2>
                    <p className="truncate font-mono text-[10px] text-muted-foreground" dir="ltr">
                      {c.slug}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-lg font-bold leading-none tabular-nums text-foreground">{c.totalPosts}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">منشور</p>
                  </div>
                  <div className="h-6 w-px bg-border" />
                  <div>
                    <p className="text-lg font-bold leading-none tabular-nums text-foreground">{c.activeMonths.length}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">شهر نشط</p>
                  </div>
                </div>
                {c.activeMonths.length > 0 && (
                  <p className="line-clamp-2 text-[10px] text-muted-foreground">
                    {c.activeMonths.slice(-4).map(monthLabel).join(" · ")}
                  </p>
                )}
                <span className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-xs font-semibold text-foreground transition-colors group-hover:bg-muted">
                  <Calendar className="h-3.5 w-3.5" />
                  فتح الكالندر
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
