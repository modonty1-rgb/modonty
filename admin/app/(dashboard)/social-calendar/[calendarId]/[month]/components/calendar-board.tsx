"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { SocialChannel, SocialPostFormat, SocialPostStatus } from "@prisma/client";
import { Search, SlidersHorizontal } from "lucide-react";

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
import { CountTab } from "@/components/admin/count-tab";
import { FilterRow } from "@/components/shared/advanced-table";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { archiveSocialPost } from "../../../actions";
import type { SocialPostRow } from "../../../helpers/queries";
import { CHANNEL_META, CHANNEL_ORDER, FORMAT_LABEL, FORMAT_ORDER, STATUS_DOT, STATUS_LABEL, STATUS_ORDER } from "../../../helpers/social-labels";
import { DaysTable, postsLabel, type DayRow } from "./days-table";

export interface CalendarPermissions {
  editBrief: boolean;
  produce: boolean;
  review: boolean;
  publish: boolean;
  archive: boolean;
}

type Row = DayRow & { searchText: string };
type KpiKey = "late" | "noCreative" | "week" | "published";

const DAY_MS = 86_400_000;

function isStatus(v: string | null): v is SocialPostStatus {
  return !!v && (STATUS_ORDER as readonly string[]).includes(v);
}
function isFormat(v: string | null): v is SocialPostFormat {
  return !!v && (FORMAT_ORDER as readonly string[]).includes(v);
}
function isChannel(v: string | null): v is SocialChannel {
  return !!v && (CHANNEL_ORDER as readonly string[]).includes(v);
}

/**
 * التقويم الشهري — موكب خالد وكودكس (١١ أكتوبر ٢٠٢٦، `scratch/calendar-current.html`):
 * أربع بطاقات أرقام تُرشِّح · شريط الحالات · «تصفية حسب النوع والقناة» يُظهر المرشّحات الإضافية ·
 * بحث · ثم جدول الأيام (`days-table.tsx`): صفّ لكل يوم يُفتح على منشوراته.
 * لا «كل المنشورات» في البطاقات: المجموع في «الكل» وحده — كان الرقم نفسه يتكرّر ثلاث مرّات.
 * ولا «تحتاج مراجعة»: هي تبويب «جاهز للمراجعة» نفسه — مكانها «تم النشر».
 * المرشّحات في الرابط (`?status=&format=&channel=&kpi=`) كباقي الأدمن.
 */
export function CalendarBoard({
  posts,
  calendarId,
  year,
  month,
  monthLabel,
  today,
  permissions,
}: {
  posts: SocialPostRow[];
  calendarId: string;
  year: number;
  month: number;
  monthLabel: string;
  /** اليوم بتوقيت الرياض — يحدّد «فات موعدها» و«خلال ٧ أيام». */
  today: { year: number; month: number; day: number };
  permissions: CalendarPermissions;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [refreshing, startRefresh] = useTransition();
  const [archiveTargetId, setArchiveTargetId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const statusParam = params.get("status");
  const formatParam = params.get("format");
  const channelParam = params.get("channel");
  const status = isStatus(statusParam) ? statusParam : null;
  const format = isFormat(formatParam) ? formatParam : null;
  const channel = isChannel(channelParam) ? channelParam : null;
  const [moreFilters, setMoreFilters] = useState(!!(format || channel));

  /** ضغطة على المرشّح المختار تلغيه. */
  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value === null || next.get(key) === value) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }

  const refresh = () => startRefresh(() => router.refresh());

  const todayIndex = Date.UTC(today.year, today.month, today.day);
  const rows: Row[] = useMemo(
    () =>
      posts.map((p) => ({
        ...p,
        dayIndex: p.scheduledFor.getTime(),
        searchText: `${p.idea} ${p.text ?? ""} ${p.hook ?? ""}`.toLowerCase(),
      })),
    [posts],
  );

  const KPIS: Record<KpiKey, { label: string; tone: string; test: (r: Row) => boolean }> = {
    // فات موعدها = لم يُنشر وموعده قبل اليوم — المنشور لا يُعدّ متأخّراً.
    late: { label: "فات موعدها", tone: "text-red-500", test: (r) => r.status !== "PUBLISHED" && r.dayIndex < todayIndex },
    noCreative: { label: "بلا إبداع", tone: "text-amber-500", test: (r) => r.assets.length === 0 && r.status !== "PUBLISHED" },
    week: {
      label: "خلال ٧ أيام",
      tone: "text-primary",
      test: (r) => r.status !== "PUBLISHED" && r.dayIndex >= todayIndex && r.dayIndex < todayIndex + 7 * DAY_MS,
    },
    // «تحتاج مراجعة» خرجت: كانت نسخة من تبويب «جاهز للمراجعة» تحتها مباشرة.
    published: { label: "تم النشر", tone: "text-green-500", test: (r) => r.status === "PUBLISHED" },
  };
  const kpiParam = params.get("kpi");
  const kpi = kpiParam && kpiParam in KPIS ? (kpiParam as KpiKey) : null;

  // كل صفّ مرشّحات يعدّ داخل ما فوقه: الحالة داخل البطاقة المختارة، والنوع والقناة داخل الحالة.
  const byKpi = kpi ? rows.filter(KPIS[kpi].test) : rows;
  const byStatus = status ? byKpi.filter((r) => r.status === status) : byKpi;
  const byFormat = format ? byStatus.filter((r) => r.format === format) : byStatus;
  const byChannel = channel ? byFormat.filter((r) => r.channels.includes(channel)) : byFormat;
  const q = query.trim().toLowerCase();
  const visible = q ? byChannel.filter((r) => r.searchText.includes(q)) : byChannel;
  const filtered = visible.length !== rows.length;

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

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-card py-16 text-center">
        <p className="text-sm font-semibold text-foreground">
          {monthLabel} {year} — لا يوجد محتوى بعد
        </p>
        <p className="text-xs text-muted-foreground">
          {permissions.editBrief ? "ابدأ بإضافة أول منشور من زر «منشور جديد» فوق" : "لم يُضف كاتب المحتوى منشورات لهذا الشهر بعد"}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", refreshing && "opacity-60 transition-opacity")}>
      <section aria-label="ملخّص الشهر" className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {(Object.keys(KPIS) as KpiKey[]).map((key) => {
          const k = KPIS[key];
          const n = rows.filter(k.test).length;
          const active = kpi === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              disabled={n === 0 && !active}
              onClick={() => setParam("kpi", key)}
              className={cn(
                "flex min-h-[72px] flex-col items-start justify-between rounded-lg border bg-card px-3.5 py-3 text-start transition-colors",
                "hover:border-primary/60 hover:bg-primary/5 disabled:cursor-default disabled:opacity-50 disabled:hover:border-border disabled:hover:bg-card",
                active && "border-primary bg-primary/10",
              )}
            >
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={cn("size-1.5 rounded-full bg-current", k.tone)} aria-hidden />
                {k.label}
              </span>
              <span className={cn("text-2xl font-bold leading-none tabular-nums", n > 0 ? k.tone : "text-muted-foreground")}>{n}</span>
            </button>
          );
        })}
      </section>

      <section aria-label="المرشّحات" className="space-y-2 rounded-lg border bg-card px-3 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label="الحالة">
            <CountTab label="الكل" count={byKpi.length} active={!status} onClick={() => setParam("status", null)} />
            {STATUS_ORDER.map((s) => {
              const n = byKpi.filter((r) => r.status === s).length;
              return (
                <CountTab
                  key={s}
                  label={
                    <span className="inline-flex items-center gap-1.5">
                      <span className={cn("size-1.5 rounded-full", STATUS_DOT[s])} aria-hidden />
                      {STATUS_LABEL[s]}
                    </span>
                  }
                  count={n}
                  active={status === s}
                  disabled={n === 0 && status !== s}
                  onClick={() => setParam("status", s)}
                />
              );
            })}
          </div>
          <button
            type="button"
            aria-expanded={moreFilters}
            onClick={() => setMoreFilters((v) => !v)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors",
              moreFilters || format || channel ? "border-primary/50 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {moreFilters ? "إخفاء المرشّحات الإضافية" : "تصفية حسب النوع والقناة"}
          </button>
        </div>
        {moreFilters && (
          <div className="space-y-2 border-t pt-2">
            <FilterRow label="النوع">
              <CountTab label="الكل" count={byStatus.length} active={!format} onClick={() => setParam("format", null)} />
              {FORMAT_ORDER.map((f) => {
                const n = byStatus.filter((r) => r.format === f).length;
                return (
                  <CountTab key={f} label={FORMAT_LABEL[f]} count={n} active={format === f} disabled={n === 0 && format !== f} onClick={() => setParam("format", f)} />
                );
              })}
            </FilterRow>
            <FilterRow label="القناة">
              <CountTab label="الكل" count={byFormat.length} active={!channel} onClick={() => setParam("channel", null)} />
              {CHANNEL_ORDER.map((ch) => {
                const n = byFormat.filter((r) => r.channels.includes(ch)).length;
                if (n === 0 && channel !== ch) return null;
                return <CountTab key={ch} label={CHANNEL_META[ch].label} count={n} active={channel === ch} onClick={() => setParam("channel", ch)} />;
              })}
            </FilterRow>
          </div>
        )}
      </section>

      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>
          <strong className="font-semibold text-foreground">منشورات {monthLabel}</strong> · مرتّبة حسب الموعد
        </span>
        {filtered && <span className="tabular-nums">{postsLabel(visible.length)} من {rows.length}</span>}
      </div>

      <label className="flex h-9 items-center gap-2 rounded-lg border bg-card px-3 focus-within:ring-2 focus-within:ring-ring">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث في الفكرة أو النص…"
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </label>

      <DaysTable
        rows={visible}
        year={year}
        month={month}
        todayIndex={todayIndex}
        calendarId={calendarId}
        permissions={permissions}
        autoOpen={filtered}
        onArchive={setArchiveTargetId}
        onChanged={refresh}
      />

      <AlertDialog open={archiveTargetId !== null} onOpenChange={(o) => !o && setArchiveTargetId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الأرشفة</AlertDialogTitle>
            <AlertDialogDescription>سيُخفى هذا المحتوى من الجدول ويُحفظ في الأرشيف. يمكنك استرجاعه في أي وقت.</AlertDialogDescription>
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
