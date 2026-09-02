"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const value = params.get("date") ?? today;

  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="date"
        value={value}
        max={today}
        aria-label="Pick a day"
        onChange={(e) => {
          const v = e.target.value;
          router.push(v ? `/daily-tasks?date=${v}` : "/daily-tasks");
        }}
        className="h-8 w-40 text-xs"
      />
      {value !== today && (
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs"
          onClick={() => router.push("/daily-tasks")}
        >
          Today
        </Button>
      )}
    </div>
  );
}
