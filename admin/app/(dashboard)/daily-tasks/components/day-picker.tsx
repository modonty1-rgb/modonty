"use client";

import { useState } from "react";
import { CalendarRange } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/** `Date` → `yyyy-mm-dd` in LOCAL time; `toISOString()` shifts the day east of UTC. */
function toInput(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * The one option this screen starts with: pick another day.
 *
 * The day lives in the URL, not in state — so a day you are looking at can be
 * bookmarked, reloaded and sent to someone else. More filters (by person, by
 * status) come later; Khalid, 2026-09-02: start simple, expand later.
 */
export function DayPicker() {
  const router = useRouter();
  const params = useSearchParams();
  const today = toInput(new Date());
  const view = params.get("view") ?? "week";
  const from = params.get("from") ?? today;
  const to = params.get("to") ?? today;
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);
  // الأسبوعُ هو الافتراضيّ (بلا مُعامِل) — اليومُ والكلُّ تفاصيلُ.
  const setView = (next: "week" | "today" | "all") => {
    if (next === "all") router.push("/daily-tasks?view=all");
    else if (next === "today") router.push("/daily-tasks?view=today");
    else router.push("/daily-tasks");
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="inline-flex rounded-md border p-0.5">
        {([['week', 'الأسبوع'], ['today', 'اليوم'], ['all', 'الكل']] as const).map(([key, label]) => (
          <Button key={key} type="button" size="sm" variant={view === key ? "secondary" : "ghost"} className="h-7 px-2 text-xs" onClick={() => setView(key)}>{label}</Button>
        ))}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" size="sm" variant={view === "range" ? "secondary" : "outline"} className="h-8 gap-1.5 text-xs">
            <CalendarRange className="size-3.5" aria-hidden />
            {view === "range" ? `${from} — ${to}` : "فترة"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 space-y-3" dir="rtl">
          <p className="text-sm font-medium">اختَر الفترة</p>
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 text-xs text-muted-foreground">من
              <Input type="date" value={draftFrom} max={today} aria-label="من تاريخ" onChange={(e) => setDraftFrom(e.target.value)} className="h-8 text-xs" />
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">إلى
              <Input type="date" value={draftTo} min={draftFrom} max={today} aria-label="إلى تاريخ" onChange={(e) => setDraftTo(e.target.value)} className="h-8 text-xs" />
            </label>
          </div>
          <Button type="button" size="sm" className="w-full" onClick={() => { router.push(`/daily-tasks?view=range&from=${draftFrom}&to=${draftTo}`); setOpen(false); }}>
            تطبيق الفترة
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
