"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@modonty/shared/components/ui/toggle-group";

type Platform = "all" | "facebook" | "instagram";

export function ReportFilters({ period, platform, months }: { period: string; platform: Platform; months: { value: string; label: string }[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function update(nextPeriod: string, nextPlatform: Platform) {
    const params = new URLSearchParams({ period: nextPeriod, platform: nextPlatform });
    startTransition(() => router.replace(`${pathname}?${params.toString()}`, { scroll: false }));
  }

  return <div className="grid gap-5 sm:grid-cols-2" aria-label="فلاتر التقرير">
    <div className="flex flex-col gap-1"><span id="report-period-label" className="text-sm font-medium">الفترة</span><Select value={period} onValueChange={(value) => update(value, platform)} disabled={isPending}><SelectTrigger aria-labelledby="report-period-label"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectItem value="all">كل الفترة</SelectItem></SelectGroup><SelectSeparator /><SelectGroup><SelectLabel>الأشهر</SelectLabel>{months.map((month) => <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>)}</SelectGroup></SelectContent></Select></div>
    <div className="flex flex-col gap-1"><span id="report-platform-label" className="text-sm font-medium">مكان الظهور</span><ToggleGroup type="single" value={platform} onValueChange={(value) => { if (value) update(period, value as Platform) }} disabled={isPending} aria-labelledby="report-platform-label"><ToggleGroupItem value="all">الكل</ToggleGroupItem><ToggleGroupItem value="facebook">Facebook</ToggleGroupItem><ToggleGroupItem value="instagram">Instagram</ToggleGroupItem></ToggleGroup></div>
    <p className="sr-only" aria-live="polite">{isPending ? "يتم تحديث التقرير" : ""}</p>
  </div>;
}
