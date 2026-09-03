"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Images,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { ModontyPartnerMark } from "@modonty/shared/components/icons/modonty-partner-mark";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DraftSeoButton } from "./draft-seo-button";
import type { ProblemBreakdown, TypeCount } from "../helpers/load-groups";

export interface SeoGroupSummary {
  key: string;
  name: string;
  isModonty: boolean;
  count: number;
  avgScore: number;
  problems: number;
  breakdown: ProblemBreakdown;
  typeCounts: TypeCount[];
}

type SortKey = "problems" | "name" | "count";
/** Same three states the الحالة column already shows, so the filter reads as that
 *  column turned into a control rather than a new vocabulary to learn. */
type StatusKey = "all" | "problems" | "clean";
const PAGE_SIZE = 15;

export function SeoGroupsTable({ groups }: { groups: SeoGroupSummary[] }) {
  const [query, setQuery] = useState("");
  // Worst-first by default: clients with the most below-threshold images on top.
  const [sort, setSort] = useState<SortKey>("problems");
  const [asc, setAsc] = useState(false);
  const [status, setStatus] = useState<StatusKey>("all");
  const [page, setPage] = useState(1);

  // Search first, status second — so the chip counts describe what the search left
  // on screen. A chip reading 0 then means "clicking me shows nothing", which is the
  // whole point of putting a number on a filter.
  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? groups.filter((g) => g.name.toLowerCase().includes(q)) : groups;
  }, [groups, query]);

  const statusCounts = useMemo(
    () => ({
      all: searched.length,
      problems: searched.filter((g) => g.problems > 0).length,
      clean: searched.filter((g) => g.problems === 0).length,
    }),
    [searched],
  );

  const rows = useMemo(() => {
    const filtered =
      status === "all" ? searched : searched.filter((g) => (status === "problems" ? g.problems > 0 : g.problems === 0));
    return [...filtered].sort((a, b) => {
      // Modonty bucket always last, out of the race.
      if (a.isModonty !== b.isModonty) return a.isModonty ? 1 : -1;
      const dir = asc ? 1 : -1;
      if (sort === "name") return a.name.localeCompare(b.name, "ar") * dir;
      if (sort === "count") return (a.count - b.count) * dir;
      return (a.problems - b.problems) * dir;
    });
  }, [searched, status, sort, asc]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageRows = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const toggle = (key: SortKey) => {
    if (sort === key) setAsc(!asc);
    else {
      setSort(key);
      setAsc(key === "name");
    }
    setPage(1);
  };

  const SortHead = ({ label, k }: { label: string; k: SortKey }) => (
    <TableHead className="h-9 py-0 text-xs">
      <button
        type="button"
        onClick={() => toggle(k)}
        className="inline-flex items-center gap-1 hover:text-foreground"
      >
        {label}
        <ArrowUpDown className={`h-3 w-3 ${sort === k ? "text-foreground" : "opacity-30"}`} />
      </button>
    </TableHead>
  );

  // Clicking the ACTIVE chip clears back to «الكل» — the same behaviour as the person
  // filter on the tasks report, so one gesture undoes the filter without hunting for
  // a reset button.
  const pickStatus = (k: StatusKey) => {
    setStatus((cur) => (cur === k ? "all" : k));
    setPage(1);
  };

  const StatusChip = ({ k, label, count, icon: Icon, tone }: {
    k: StatusKey;
    label: string;
    count: number;
    icon: typeof Images;
    tone: string;
  }) => {
    const on = status === k;
    return (
      <button
        type="button"
        onClick={() => pickStatus(k)}
        aria-pressed={on}
        className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs transition-colors ${
          on ? "border-foreground/30 bg-muted font-medium text-foreground" : "border-transparent text-muted-foreground hover:bg-muted/60"
        }`}
      >
        <Icon className={`h-3.5 w-3.5 shrink-0 ${on ? tone : "opacity-60"}`} />
        {label}
        <span className="tabular-nums font-semibold text-foreground">{count}</span>
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* No `w-full` here: inside a flex row it claims the whole line and pushes the
              status chips onto a second one. A fixed width keeps search and filter side
              by side, which is where Khalid asked for them. */}
          <div className="relative w-56 shrink-0">
            <Search className="absolute start-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="ابحث باسم العميل…"
              className="h-8 ps-8 text-xs"
            />
          </div>
          {/* «فيه مشاكل» LAST, next to the action it reveals: picking it is the step before
              fixing, so the button appears at the end of the row the eye already ends on. */}
          <div className="flex shrink-0 items-center gap-1 rounded-md border p-0.5">
            {/* Labels say «عميل», not «مشاكل»: these chips filter ROWS, and the الحالة column
                beside them counts IMAGES. Two units under one word read as one number, and
                23 was taken for the size of the whole job when it was 632. */}
            <StatusChip k="all" label="كل العملاء" count={statusCounts.all} icon={Images} tone="text-primary" />
            <StatusChip
              k="clean"
              label="عميل مكتمل"
              count={statusCounts.clean}
              icon={CheckCircle2}
              tone="text-emerald-600 dark:text-emerald-400"
            />
            <StatusChip
              k="problems"
              label="عميل فيه شغل"
              count={statusCounts.problems}
              icon={AlertTriangle}
              tone="text-amber-600 dark:text-amber-500"
            />
          </div>

        </div>
        <p className="shrink-0 text-xs text-muted-foreground">
          {rows.length === groups.length ? `${groups.length} مجموعة` : `${rows.length} من ${groups.length}`}
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortHead label="العميل" k="name" />
              <SortHead label="الصور" k="count" />
              <TableHead className="h-9 py-0 text-xs">الأنواع</TableHead>
              <SortHead label="الحالة" k="problems" />
              <TableHead className="h-9 py-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-10 text-center text-xs text-muted-foreground">
                  {groups.length === 0
                    ? "لا توجد صور بعد."
                    : status === "clean"
                      ? "ولا عميل صوره كلها نظيفة بعد."
                      : status === "problems"
                        ? "ولا عميل عنده مشاكل — كله نظيف."
                        : "لا يوجد عميل يطابق البحث."}
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((g) => (
                <TableRow key={g.key} className="text-xs odd:bg-muted/40">
                  <TableCell className="max-w-[320px] py-2">
                    <Link
                      href={`/seo-images/${encodeURIComponent(g.key)}`}
                      className="flex items-center gap-1.5 hover:underline"
                    >
                      {g.isModonty ? (
                        <Images className="h-3.5 w-3.5 shrink-0 text-primary" />
                      ) : (
                        <ModontyPartnerMark className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <span className="truncate font-medium" title={g.name}>
                        {g.name}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2 text-muted-foreground">{g.count}</TableCell>
                  <TableCell className="py-2">
                    <div className="flex flex-wrap items-center gap-1">
                      {g.typeCounts.map((t) => (
                        <span
                          key={t.type}
                          className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground"
                        >
                          {t.type}
                          <span className="text-foreground">{t.count}</span>
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  {/* The state IS the control (Khalid 3 Sep). The count used to be printed
                      here and again on a button two columns away — one number, two places, and
                      a row that had to be read twice. Where there is writing to do the cell is
                      the button; where there is not, it is a plain state. */}
                  <TableCell className="whitespace-nowrap py-2">
                    {g.breakdown.noAlt > 0 ? (
                      <DraftSeoButton groupKey={g.key} groupName={g.name} count={g.breakdown.noAlt} />
                    ) : g.breakdown.aiDrafted > 0 ? (
                      /* The 🤖 stays until a person has read the text (Khalid 3 Sep:
                         «شعار الـAI لازم يكون ملازم طالما الشغل بالـAI»). Before this the row
                         jumped straight to «تحتاج تسمية» once the batch finished, and the fact
                         that a machine wrote it vanished from the screen. */
                      <span className="inline-flex items-center gap-1.5 font-medium text-violet-600 dark:text-violet-400">
                        <span aria-hidden className="text-sm leading-none">🤖</span>
                        {g.breakdown.aiDrafted} مسوّدة تنتظر مراجعتك
                      </span>
                    ) : g.problems > 0 ? (
                      <span className="inline-flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-500">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        {g.problems} صورة تحتاج تسمية
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        مكتملة
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-2 text-end">
                    <Button asChild size="sm" variant="outline" className="h-7 gap-1.5">
                      <Link href={`/seo-images/${encodeURIComponent(g.key)}`}>
                        تحسين الصور
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">
            صفحة {current} من {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1"
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
              السابق
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1"
              disabled={current >= totalPages}
              onClick={() => setPage(current + 1)}
            >
              التالي
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
