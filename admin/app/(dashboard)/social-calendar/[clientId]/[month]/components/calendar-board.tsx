"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { SocialPostFormat, SocialPostStatus } from "@prisma/client";
import { AlarmClock, CalendarRange, ClipboardCheck, ImageOff } from "lucide-react";

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
import { DataTable, type Column } from "@/components/admin/data-table";
import { KpiToggle, type KpiMeta } from "@/components/admin/kpi-toggle";
import { FilterRow } from "@/components/shared/advanced-table";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { archiveSocialPost } from "../../../actions";
import { ChannelIcon } from "../../../components/channel-icon";
import { dayName } from "../../../helpers/dates";
import { postHref } from "../../../helpers/post-href";
import type { SocialPostRow } from "../../../helpers/queries";
import { FORMAT_LABEL, FORMAT_ORDER, STATUS_DOT, STATUS_LABEL, STATUS_ORDER } from "../../../helpers/social-labels";
import { CreativeCell } from "./creative-cell";
import { PostActions } from "./post-actions";
import { PostDetails } from "./post-details";

export interface CalendarPermissions {
  editBrief: boolean;
  produce: boolean;
  review: boolean;
  publish: boolean;
  archive: boolean;
}

type Row = SocialPostRow & { searchText: string; dayIndex: number };
type KpiKey = "review" | "late" | "week" | "noCreative";

const DAY_MS = 86_400_000;

const STATUS_TEXT: Record<SocialPostStatus, string> = {
  IN_PRODUCTION: "text-muted-foreground",
  READY_FOR_REVIEW: "text-amber-600 dark:text-amber-400",
  READY_TO_PUBLISH: "text-blue-600 dark:text-blue-400",
  PUBLISHED: "text-green-600 dark:text-green-400",
};

const AMBER = { tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400", ring: "ring-amber-500" };

function isStatus(v: string | null): v is SocialPostStatus {
  return !!v && (STATUS_ORDER as readonly string[]).includes(v);
}
function isFormat(v: string | null): v is SocialPostFormat {
  return !!v && (FORMAT_ORDER as readonly string[]).includes(v);
}

/**
 * التقويم الشهري بجدول Advanced Table (خالد ١٠ أكتوبر ٢٠٢٦: «زغلة… في عندنا الأدفانس»).
 * كان صفّاً لكل يوم بحدود ملوّنة وشارات وأزرار تظهر عند المرور وشريط سفلي يكرّر الرأس.
 * صار وصفة العملاء المحتملين: المرشّحات بعدّاداتها والأرقام المرشِّحة فوق، صفٌّ واحد لكل
 * منشور بالأساسيّات، و«+» للبريف وبيانات النشر والأفعال بأسمائها.
 * المرشّحات في الرابط (`?status=&format=&kpi=`) كباقي الأدمن.
 */
export function CalendarBoard({
  posts,
  clientId,
  year,
  month,
  monthLabel,
  today,
  permissions,
}: {
  posts: SocialPostRow[];
  clientId: string;
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

  const statusParam = params.get("status");
  const formatParam = params.get("format");
  const status = isStatus(statusParam) ? statusParam : null;
  const format = isFormat(formatParam) ? formatParam : null;

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

  const KPIS: Record<KpiKey, KpiMeta & { icon: React.ComponentType<{ className?: string }>; test: (r: Row) => boolean }> = {
    review: { label: "تنتظر المراجعة", ...AMBER, icon: ClipboardCheck, test: (r) => r.status === "READY_FOR_REVIEW" },
    late: {
      label: "فات موعدها",
      tone: "bg-red-500/15 text-red-600 dark:text-red-400",
      ring: "ring-red-500",
      icon: AlarmClock,
      test: (r) => r.status !== "PUBLISHED" && r.dayIndex < todayIndex,
    },
    week: {
      label: "خلال ٧ أيام",
      tone: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
      ring: "ring-blue-500",
      icon: CalendarRange,
      test: (r) => r.status !== "PUBLISHED" && r.dayIndex >= todayIndex && r.dayIndex < todayIndex + 7 * DAY_MS,
    },
    noCreative: { label: "بلا إبداع", ...AMBER, icon: ImageOff, test: (r) => r.assets.length === 0 && r.status !== "PUBLISHED" },
  };
  const kpiParam = params.get("kpi");
  const kpi = kpiParam && kpiParam in KPIS ? (kpiParam as KpiKey) : null;

  // كل صفّ مرشّحات يعدّ داخل ما فوقه: الحالة داخل المربّع المختار، والنوع داخل الحالة.
  const byKpi = kpi ? rows.filter(KPIS[kpi].test) : rows;
  const byStatus = status ? byKpi.filter((r) => r.status === status) : byKpi;
  const visible = format ? byStatus.filter((r) => r.format === format) : byStatus;

  const columns: Column<Row>[] = [
    {
      key: "dayIndex",
      header: "اليوم",
      className: "w-[1%]",
      render: (r) => {
        const d = r.scheduledFor.getUTCDate();
        const isToday = r.dayIndex === todayIndex;
        return (
          <span className={cn("inline-flex items-baseline gap-1.5 tabular-nums", isToday && "text-primary")}>
            <span className="w-5 text-end font-semibold">{d}</span>
            <span className={cn("text-xs", isToday ? "font-semibold" : "text-muted-foreground")}>
              {isToday ? "اليوم" : dayName(year, month, d)}
            </span>
          </span>
        );
      },
    },
    {
      key: "idea",
      header: "الفكرة",
      render: (r) => (
        <Link
          href={postHref(clientId, r.id)}
          onClick={(e) => e.stopPropagation()}
          title={r.idea}
          className="block max-w-[420px] truncate font-medium hover:text-primary hover:underline"
        >
          {r.idea || <span className="text-muted-foreground">بدون فكرة</span>}
        </Link>
      ),
    },
    {
      key: "status",
      header: "الحالة",
      className: "w-[1%]",
      sortFn: (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
      render: (r) => (
        <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", STATUS_TEXT[r.status])}>
          <span className={cn("size-1.5 rounded-full", STATUS_DOT[r.status])} aria-hidden />
          {STATUS_LABEL[r.status]}
        </span>
      ),
    },
    {
      key: "format",
      header: "النوع",
      className: "w-[1%]",
      render: (r) => (r.format ? FORMAT_LABEL[r.format] : <span className="text-muted-foreground">—</span>),
    },
    {
      key: "channels",
      header: "القنوات",
      sortable: false,
      className: "w-[1%]",
      render: (r) => {
        const links = (r.channelLinks ?? {}) as Partial<Record<string, string>>;
        return (
          <span className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {r.channels.length ? (
              r.channels.map((ch) => <ChannelIcon key={ch} channel={ch} href={links[ch]} />)
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </span>
        );
      },
    },
    {
      key: "assets",
      header: "الإبداع",
      sortable: false,
      className: "w-[1%]",
      render: (r) => (
        <span onClick={(e) => e.stopPropagation()} className="inline-flex">
          <CreativeCell post={r} />
        </span>
      ),
    },
  ];

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
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
        <section aria-label="المرشّحات" className="flex flex-col justify-center gap-2 rounded-lg border bg-card px-4 py-2.5">
          <FilterRow label="الحالة">
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
          </FilterRow>
          <FilterRow label="النوع">
            <CountTab label="الكل" count={byStatus.length} active={!format} onClick={() => setParam("format", null)} />
            {FORMAT_ORDER.map((f) => {
              const n = byStatus.filter((r) => r.format === f).length;
              return (
                <CountTab
                  key={f}
                  label={FORMAT_LABEL[f]}
                  count={n}
                  active={format === f}
                  disabled={n === 0 && format !== f}
                  onClick={() => setParam("format", f)}
                />
              );
            })}
          </FilterRow>
        </section>
        <section aria-label="الأرقام" className="grid auto-rows-fr grid-cols-2 gap-2">
          {(Object.keys(KPIS) as KpiKey[]).map((key) => {
            const k = KPIS[key];
            const n = rows.filter(k.test).length;
            return (
              <KpiToggle
                variant="tile"
                key={key}
                meta={k}
                icon={k.icon}
                value={n}
                active={kpi === key}
                disabled={n === 0 && kpi !== key}
                onClick={() => setParam("kpi", key)}
              />
            );
          })}
        </section>
      </div>

      <DataTable
        arabic
        data={visible}
        columns={columns}
        searchKey="searchText"
        searchPlaceholder="ابحث في الفكرة أو النص…"
        pageSize={100}
        emptyText="لا منشور يطابق المرشّحات"
        renderExpanded={(r) => (
          <PostDetails
            post={r}
            actions={
              <PostActions
                post={r}
                clientId={clientId}
                permissions={permissions}
                onArchive={() => setArchiveTargetId(r.id)}
                onChanged={refresh}
              />
            }
          />
        )}
        expandLabel={(r) => `تفاصيل ${r.idea || "المنشور"}`}
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
