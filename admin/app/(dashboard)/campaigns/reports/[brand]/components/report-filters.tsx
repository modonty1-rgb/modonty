"use client";

import { usePathname, useRouter } from "next/navigation";
import { useOptimistic, type ReactNode } from "react";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@modonty/shared/components/ui/toggle-group";
import { IconFacebook, IconGrid, IconInstagram, IconPause, IconPlay, IconUsers } from "@modonty/shared/lib/icons";
import { cn } from "@/lib/utils";
import { useReportTransition } from "./report-pending";

export type StatusFilter = "all" | "running" | "stopped";
export type PlatformFilter = "all" | "facebook" | "instagram";
type Filters = { period: string; status: StatusFilter; by: string; platform: PlatformFilter };

const ar = new Intl.NumberFormat("ar-EG");

/**
 * The shared toggle marks «on» as white on light grey — Khalid could not tell which was picked
 * (29 Sep 2026: «تحتاج تحسين التباين»). Here «on» is a white chip ringed in the brand blue, and the rest
 * fade — not a solid blue fill, because the registry marks (grid · pause) are drawn in a fixed navy that
 * would vanish on blue. Every group is the same height so the row reads as one strip.
 */
const GROUP = "h-8 shrink-0 gap-0.5 rounded-md border bg-muted/60 p-0.5";
const ITEM =
  "h-7 min-h-0 gap-1 rounded px-2 text-xs opacity-55 hover:opacity-100 data-[state=on]:bg-background data-[state=on]:font-semibold data-[state=on]:text-primary data-[state=on]:opacity-100 data-[state=on]:ring-2 data-[state=on]:ring-primary data-[state=on]:shadow-sm";

function Choice({ value, label, children, className }: { value: string; label: string; children: ReactNode; className?: string }) {
  return (
    <ToggleGroupItem value={value} aria-label={label} title={label} className={cn(ITEM, className)}>
      {children}
    </ToggleGroupItem>
  );
}

function useFilterUpdate(current: Filters) {
  const pathname = usePathname();
  const router = useRouter();
  const { isPending, start: startTransition } = useReportTransition();
  // The pressed button shows at once — not ~10 s later when Meta answers and the URL settles.
  const [shown, setShown] = useOptimistic(current, (prev: Filters, next: Partial<Filters>) => ({ ...prev, ...next }));
  function update(next: Partial<Filters>) {
    const merged = { ...current, ...next };
    const params = new URLSearchParams({ period: merged.period, status: merged.status });
    if (merged.by) params.set("by", merged.by);
    if (merged.platform !== "all") params.set("platform", merged.platform);
    startTransition(() => {
      setShown(next);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }
  return { update, isPending, shown };
}

/**
 * المنصة · الحالة · الفترة — بأيقونات، في نفس صفّ «مين أعلن» فوق الجدول (خالد ٢٩ سبتمبر ٢٠٢٦: «كل
 * التوجلز في صف واحد حتى تستخدم أيقون»). «كل المنصات» يشمل شبكة ميتا وثريدز وماسنجر أيضاً.
 */
export function ReportFilters({ period, status, by, platform, months }: Filters & { months: { value: string; label: string }[] }) {
  const { update, isPending, shown } = useFilterUpdate({ period, status, by, platform });

  return (
    <div className="flex shrink-0 items-center gap-2" aria-label="فلاتر التقرير">
      <ToggleGroup
        type="single"
        value={shown.platform}
        onValueChange={(v) => {
          if (v) update({ platform: v as PlatformFilter });
        }}
        disabled={isPending}
        aria-label="المنصة"
        className={GROUP}
      >
        <Choice value="all" label="كل المنصات">
          <IconGrid className="size-3.5" aria-hidden />
        </Choice>
        <Choice value="facebook" label="فيسبوك">
          <IconFacebook className="size-3.5" aria-hidden />
        </Choice>
        <Choice value="instagram" label="إنستقرام">
          <IconInstagram className="size-3.5" aria-hidden />
        </Choice>
      </ToggleGroup>
      <ToggleGroup
        type="single"
        value={shown.status}
        onValueChange={(v) => {
          if (v) update({ status: v as StatusFilter });
        }}
        disabled={isPending}
        aria-label="الحالة"
        className={GROUP}
      >
        <Choice value="all" label="كل الحالات">
          <IconGrid className="size-3.5" aria-hidden />
        </Choice>
        <Choice value="running" label="شغّالة">
          <IconPlay className="size-3.5" aria-hidden />
        </Choice>
        <Choice value="stopped" label="موقوفة">
          <IconPause className="size-3.5" aria-hidden />
        </Choice>
      </ToggleGroup>
      <Select value={shown.period} onValueChange={(v) => update({ period: v })} disabled={isPending}>
        <SelectTrigger aria-label="الفترة" className="h-8 w-36 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">كل الفترة</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>الأشهر</SelectLabel>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <p className="sr-only" aria-live="polite">{isPending ? "يتم تحديث التقرير" : ""}</p>
    </div>
  );
}

/** «مين أعلن» — أوّل الصفّ فوق الجدول (خالد ٢٩ سبتمبر ٢٠٢٦)، ويحصر الصفحة كلّها على حملات الشخص. */
export function MakerFilter({ period, status, by, platform, makers }: Filters & { makers: { name: string; count: number }[] }) {
  const { update, isPending, shown } = useFilterUpdate({ period, status, by, platform });
  if (makers.length < 2) return null;
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <IconUsers className="size-4 shrink-0 text-muted-foreground" aria-label="مين أعلن" />
      <ToggleGroup
        type="single"
        value={shown.by || "__all"}
        onValueChange={(v) => {
          if (v) update({ by: v === "__all" ? "" : v });
        }}
        disabled={isPending}
        aria-label="مين أعلن"
        className={GROUP}
      >
        <Choice value="__all" label="كل من أعلن">
          الكل
        </Choice>
        {makers.map((m) => (
          <Choice key={m.name} value={m.name} label={`${m.name} — ${ar.format(m.count)} حملة`}>
            {m.name} <span className="tabular-nums opacity-70">{ar.format(m.count)}</span>
          </Choice>
        ))}
      </ToggleGroup>
      {isPending ? <span className="shrink-0 animate-pulse text-xs text-muted-foreground">يحدّث…</span> : null}
    </div>
  );
}
