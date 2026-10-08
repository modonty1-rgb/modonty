"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { SocialPostFormat, SocialPostStatus } from "@prisma/client";
import { ArrowDown, ArrowUp, ArrowUpDown, Columns, Search, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { archiveSocialPost } from "../../../actions";
import { ChannelIcon } from "../../../components/channel-icon";
import { StatusBadge } from "../../../components/status-badge";
import { dayName, daysInMonth } from "../../../helpers/dates";
import { postHref } from "../../../helpers/post-href";
import type { SocialPostRow } from "../../../helpers/queries";
import {
  FORMAT_LABEL,
  FORMAT_ORDER,
  FUNNEL_LABEL,
  STATUS_BADGE,
  STATUS_LABEL,
  STATUS_ORDER,
  STATUS_ROW_BORDER,
} from "../../../helpers/social-labels";
import { CreativeCell } from "./creative-cell";
import { RowActions } from "./row-actions";

export interface CalendarPermissions {
  editBrief: boolean;
  produce: boolean;
  review: boolean;
  publish: boolean;
  archive: boolean;
}

type SortCol = "idea" | "status" | "format" | "funnel";
type ToggleCol = "format" | "funnel" | "channels" | "status";

const COL_TOGGLES: { id: ToggleCol; label: string }[] = [
  { id: "format", label: "النوع" },
  { id: "funnel", label: "نوع الحملة" },
  { id: "channels", label: "القنوات" },
  { id: "status", label: "الحالة" },
];

function isStatus(v: string | null): v is SocialPostStatus {
  return !!v && (STATUS_ORDER as readonly string[]).includes(v);
}
function isFormat(v: string | null): v is SocialPostFormat {
  return !!v && (FORMAT_ORDER as readonly string[]).includes(v);
}

function DayCell({
  year,
  month,
  day,
  muted,
  isToday,
}: {
  year: number;
  month: number;
  day: number;
  muted?: boolean;
  isToday?: boolean;
}) {
  if (muted) {
    return (
      <div className="flex items-center justify-center gap-1.5">
        <span className="w-5 text-center text-[11px] font-medium tabular-nums text-muted-foreground/30">{day}</span>
        <span className="text-[10px] text-muted-foreground/25">{dayName(year, month, day)}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center gap-1.5">
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          isToday ? "bg-primary text-primary-foreground ring-2 ring-primary/30" : "bg-primary/10 text-primary",
        )}
      >
        {day}
      </div>
      <span className={cn("text-[10px] font-medium", isToday ? "font-semibold text-primary" : "text-muted-foreground")}>
        {dayName(year, month, day)}
      </span>
    </div>
  );
}

/**
 * جدول الشهر — صفّ لكل يوم (القديم `CalendarTable.tsx:565-1059`): الأيام الفارغة مطويّة أو
 * مخفيّة، فلاتر الحالة والنوع بعدّادات، إظهار/إخفاء أعمدة، فرز يحوّل العرض لقائمة مسطّحة، بحث
 * في الفكرة والنص، وشريط ملخّص سفلي.
 *
 * الفرق المفروض: الفلاتر والبحث و«إخفاء الفارغة» في الرابط (`?status=&format=&q=&compact=1`)
 * لا في حالة الصفحة — معيار الأدمن (CountTab مدفوع بـ URL). تُكتب بـ`history.replaceState`
 * فلا يعيد الخادم رسم الصفحة مع كل حرف بحث.
 */
export function CalendarTable({
  posts,
  clientId,
  clientName,
  year,
  month,
  monthLabel,
  todayDay,
  permissions,
}: {
  posts: SocialPostRow[];
  clientId: string;
  clientName: string;
  year: number;
  month: number;
  monthLabel: string;
  todayDay: number | null;
  permissions: CalendarPermissions;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [refreshing, startRefresh] = useTransition();
  const [archiveTargetId, setArchiveTargetId] = useState<string | null>(null);
  const [sortCol, setSortCol] = useState<SortCol | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [hiddenCols, setHiddenCols] = useState<Set<ToggleCol>>(new Set());

  const statusParam = searchParams.get("status");
  const formatParam = searchParams.get("format");
  const filterStatus: SocialPostStatus | "all" = isStatus(statusParam) ? statusParam : "all";
  const filterFormat: SocialPostFormat | "all" = isFormat(formatParam) ? formatParam : "all";
  const searchQ = searchParams.get("q") ?? "";
  const hideEmpty = searchParams.get("compact") === "1";

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }

  function refresh() {
    startRefresh(() => router.refresh());
  }

  function toggleSort(col: SortCol) {
    if (sortCol === col) {
      if (sortDir === "asc") setSortDir("desc");
      else {
        setSortCol(null);
        setSortDir("asc");
      }
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  }

  const visible = (id: ToggleCol) => !hiddenCols.has(id);
  function toggleCol(id: ToggleCol) {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const isFiltered = filterStatus !== "all" || filterFormat !== "all" || searchQ.trim() !== "";

  const filtered = useMemo(() => {
    let list = posts;
    if (filterStatus !== "all") list = list.filter((p) => p.status === filterStatus);
    if (filterFormat !== "all") list = list.filter((p) => p.format === filterFormat);
    const q = searchQ.trim().toLowerCase();
    if (q) list = list.filter((p) => p.idea.toLowerCase().includes(q) || (p.text ?? "").toLowerCase().includes(q));
    return list;
  }, [posts, filterStatus, filterFormat, searchQ]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    const value = (p: SocialPostRow): string => {
      if (sortCol === "idea") return p.idea;
      if (sortCol === "status") return String(STATUS_ORDER.indexOf(p.status));
      if (sortCol === "format") return p.format ? FORMAT_LABEL[p.format] : "";
      return p.funnelStages.map((s) => FUNNEL_LABEL[s]).join(",");
    };
    return [...filtered].sort((a, b) => {
      const cmp = value(a).localeCompare(value(b), "ar");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir]);

  const byDay = useMemo(() => {
    const map = new Map<number, SocialPostRow[]>();
    for (const p of filtered) {
      const d = p.scheduledFor.getUTCDate();
      map.set(d, [...(map.get(d) ?? []), p]);
    }
    return map;
  }, [filtered]);

  const allDays = useMemo(() => Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1), [year, month]);

  const statusCounts = useMemo(() => {
    const c: Record<SocialPostStatus, number> = { IN_PRODUCTION: 0, READY_FOR_REVIEW: 0, READY_TO_PUBLISH: 0, PUBLISHED: 0 };
    for (const p of posts) c[p.status] += 1;
    return c;
  }, [posts]);

  const colSpan = 3 + (["status", "channels", "format", "funnel"] as ToggleCol[]).filter(visible).length;

  async function confirmArchive() {
    if (!archiveTargetId) return;
    const id = archiveTargetId;
    setArchiveTargetId(null);
    const res = await archiveSocialPost(id);
    if (res.success) {
      toast({ title: "تمت الأرشفة", variant: "success" });
      refresh();
    } else {
      toast({ title: res.error, variant: "destructive" });
    }
  }

  function sortHead(col: SortCol, label: string) {
    return (
      <button
        type="button"
        onClick={() => toggleSort(col)}
        className="inline-flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-foreground"
      >
        {label}
        {sortCol === col ? (
          sortDir === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-30" />
        )}
      </button>
    );
  }

  function postRow(p: SocialPostRow, day: number, firstOfDay: boolean) {
    const links = (p.channelLinks ?? {}) as Partial<Record<string, string>>;
    return (
      <TableRow
        key={p.id}
        className={cn(
          "group/row relative border-r-2 transition-all duration-150 hover:bg-muted/40",
          STATUS_ROW_BORDER[p.status],
        )}
      >
        <TableCell className="px-3 py-2.5 text-center">
          <DayCell year={year} month={month} day={day} muted={!firstOfDay} isToday={day === todayDay} />
        </TableCell>
        <TableCell className="px-3 py-2.5">
          <p className="text-sm font-medium leading-snug text-foreground" title={p.idea}>
            {p.idea || <span className="text-xs italic text-muted-foreground">بدون فكرة</span>}
          </p>
        </TableCell>
        {visible("status") && (
          <TableCell className="px-3 py-2.5">
            <StatusBadge status={p.status} href={postHref(clientId, p.id, { stage: p.status })} />
          </TableCell>
        )}
        {visible("channels") && (
          <TableCell className="px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              {p.channels.map((ch) => (
                <ChannelIcon key={ch} channel={ch} href={links[ch]} />
              ))}
            </div>
          </TableCell>
        )}
        <TableCell className="px-2 py-2.5 text-center">
          <CreativeCell post={p} />
        </TableCell>
        {visible("format") && (
          <TableCell className="px-3 py-2.5">
            {p.format ? (
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {FORMAT_LABEL[p.format]}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground/40">—</span>
            )}
          </TableCell>
        )}
        {visible("funnel") && (
          <TableCell className="px-3 py-2.5">
            <div className="flex flex-wrap gap-1">
              {p.funnelStages.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[10px] font-semibold text-violet-600 dark:bg-violet-950 dark:text-violet-300"
                >
                  {FUNNEL_LABEL[s]}
                </span>
              ))}
            </div>
          </TableCell>
        )}
        <TableCell className="w-0 p-0">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center gap-0.5 border-r border-border bg-card px-3 opacity-0 shadow-[-4px_0_8px_rgba(0,0,0,0.04)] transition-opacity duration-150 group-hover/row:pointer-events-auto group-hover/row:opacity-100 group-focus-within/row:pointer-events-auto group-focus-within/row:opacity-100">
            <RowActions
              post={p}
              clientId={clientId}
              permissions={permissions}
              onArchive={() => setArchiveTargetId(p.id)}
              onChanged={refresh}
            />
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {/* شريط الأدوات */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="ms-1 shrink-0 text-[10px] font-semibold text-muted-foreground/60">الحالة</span>
            {(["all", ...STATUS_ORDER] as const).map((s) => {
              const active = filterStatus === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setParam("status", s === "all" ? null : s)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all",
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-transparent bg-transparent text-muted-foreground hover:border-border hover:text-foreground",
                  )}
                >
                  {s === "all" ? "الكل" : STATUS_LABEL[s]}
                  <span
                    className={cn(
                      "min-w-4 rounded-full px-1 text-center text-[10px] font-bold leading-4 tabular-nums",
                      active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {s === "all" ? posts.length : statusCounts[s]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="h-5 w-px bg-border" />

          <div className="flex items-center gap-1">
            <span className="ms-1 shrink-0 text-[10px] font-semibold text-muted-foreground/60">النوع</span>
            {(["all", ...FORMAT_ORDER] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setParam("format", f === "all" ? null : f)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all",
                  filterFormat === f
                    ? "border-foreground bg-foreground text-background shadow-sm"
                    : "border-transparent bg-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                {f === "all" ? "الكل" : FORMAT_LABEL[f]}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-border" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                <Columns className="h-3.5 w-3.5" />
                الأعمدة
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {COL_TOGGLES.map((c) => (
                <DropdownMenuCheckboxItem key={c.id} checked={visible(c.id)} onCheckedChange={() => toggleCol(c.id)}>
                  {c.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                const next = new URLSearchParams(searchParams.toString());
                ["status", "format", "q"].forEach((k) => next.delete(k));
                const qs = next.toString();
                window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
              }}
              className="flex items-center gap-1 rounded-md border border-dashed border-border px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              <X className="h-3 w-3" />
              إعادة تعيين
            </button>
          )}

          <span className="me-auto text-[11px] tabular-nums text-muted-foreground">{sorted.length} منشور</span>
        </div>

        {/* الجدول */}
        <div className={cn("overflow-hidden rounded-xl border border-border", refreshing && "opacity-60 transition-opacity")}>
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 bg-card py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-border text-muted-foreground/30">
                <Search className="h-7 w-7" />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-sm font-semibold text-foreground">
                  {monthLabel} {year} — لا يوجد محتوى بعد
                </p>
                <p className="text-xs text-muted-foreground">
                  {permissions.editBrief
                    ? "ابدأ بإضافة أول منشور لهذا الشهر من الزر في الشريط الجانبي"
                    : "لم يُضف كاتب المحتوى منشورات لهذا الشهر بعد"}
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow className="border-b border-border bg-muted/60">
                  <TableHead className="w-24 px-3 py-3 text-center text-xs font-bold text-muted-foreground">اليوم</TableHead>
                  <TableHead className="px-3 py-3 text-xs font-bold text-muted-foreground">{sortHead("idea", "الفكرة")}</TableHead>
                  {visible("status") && (
                    <TableHead className="w-36 px-3 py-3 text-xs font-bold text-muted-foreground">
                      {sortHead("status", "الحالة")}
                    </TableHead>
                  )}
                  {visible("channels") && (
                    <TableHead className="w-24 px-3 py-3 text-xs font-bold text-muted-foreground">القنوات</TableHead>
                  )}
                  <TableHead className="w-12 px-2 py-3 text-center text-xs font-bold text-muted-foreground">إبداع</TableHead>
                  {visible("format") && (
                    <TableHead className="w-20 px-3 py-3 text-xs font-bold text-muted-foreground">
                      {sortHead("format", "النوع")}
                    </TableHead>
                  )}
                  {visible("funnel") && (
                    <TableHead className="w-28 px-3 py-3 text-xs font-bold text-muted-foreground">
                      {sortHead("funnel", "نوع الحملة")}
                    </TableHead>
                  )}
                  <TableHead className="w-0 p-0" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortCol !== null ? (
                  sorted.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={colSpan} className="p-6 text-center text-sm text-muted-foreground">
                        لا توجد نتائج
                      </TableCell>
                    </TableRow>
                  ) : (
                    sorted.map((p) => postRow(p, p.scheduledFor.getUTCDate(), true))
                  )
                ) : isFiltered && filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={colSpan} className="p-6 text-center text-sm text-muted-foreground">
                      لا توجد نتائج
                    </TableCell>
                  </TableRow>
                ) : (
                  allDays.map((day) => {
                    const dayPosts = byDay.get(day) ?? [];
                    if (dayPosts.length === 0) {
                      if (isFiltered || hideEmpty) return null;
                      return (
                        <TableRow
                          key={`empty-${day}`}
                          className="h-6 border-r-2 border-r-transparent transition-colors hover:bg-muted/20"
                        >
                          <TableCell className="px-3 py-0 text-center">
                            <DayCell year={year} month={month} day={day} muted />
                          </TableCell>
                          <TableCell colSpan={colSpan - 1} className="p-0" />
                        </TableRow>
                      );
                    }
                    return <Fragment key={day}>{dayPosts.map((p, idx) => postRow(p, day, idx === 0))}</Fragment>;
                  })
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* شريط الملخّص — ثابت خارج التمرير */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 border-t border-border bg-card px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <span className="shrink-0 text-xs font-semibold text-muted-foreground">الإجمالي</span>
        <span className="text-sm font-bold tabular-nums text-foreground">{posts.length} منشور</span>
        <div className="h-4 w-px shrink-0 bg-border" />
        {STATUS_ORDER.map((s) =>
          statusCounts[s] === 0 ? null : (
            <div key={s} className="flex items-center gap-2">
              <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-bold tabular-nums", STATUS_BADGE[s])}>
                {statusCounts[s]}
              </span>
              <span className="text-xs text-muted-foreground">{STATUS_LABEL[s]}</span>
            </div>
          ),
        )}
        {posts.length > 0 && (
          <>
            <div className="me-auto h-4 w-px shrink-0 bg-border" />
            <div className="relative min-w-40 flex-1">
              <Search className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="بحث..."
                value={searchQ}
                onChange={(e) => setParam("q", e.target.value)}
                className="h-8 w-full pl-7 pr-8 text-xs"
                aria-label={`بحث في منشورات ${clientName}`}
              />
              {searchQ && (
                <button
                  type="button"
                  onClick={() => setParam("q", null)}
                  aria-label="مسح البحث"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <label className="flex shrink-0 cursor-pointer select-none items-center gap-2">
              <input
                type="checkbox"
                checked={hideEmpty}
                onChange={(e) => setParam("compact", e.target.checked ? "1" : null)}
                className="h-3.5 w-3.5 cursor-pointer rounded accent-primary"
              />
              <span className="text-[11px] font-medium text-muted-foreground">{hideEmpty ? "عرض الكل" : "إخفاء الفارغة"}</span>
            </label>
          </>
        )}
      </div>

      <AlertDialog open={archiveTargetId !== null} onOpenChange={(o) => !o && setArchiveTargetId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الأرشفة</AlertDialogTitle>
            <AlertDialogDescription>
              سيُخفى هذا المحتوى من الجدول ويُحفظ في الأرشيف. يمكنك استرجاعه في أي وقت.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel type="button">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void confirmArchive()}
            >
              أرشفة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
