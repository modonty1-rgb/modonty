"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ar } from "@/lib/ar";
import { Calendar, Loader2 } from "lucide-react";

const OPTIONS = [
  { value: 7, label: ar.analytics.timeframe7 },
  { value: 30, label: ar.analytics.timeframe30 },
  { value: 90, label: ar.analytics.timeframe90 },
] as const;

export function TimeframeSelector({ value }: { value: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function setDays(d: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("days", String(d));
    startTransition(() => {
      router.push(`/dashboard/analytics?${params.toString()}`);
    });
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-sm">
      <Calendar className="ms-1 h-4 w-4 text-muted-foreground" />
      {OPTIONS.map((o) => (
        <Button
          key={o.value}
          size="sm"
          variant={value === o.value ? "default" : "ghost"}
          onClick={() => setDays(o.value)}
          disabled={isPending}
          className="h-7 px-3 text-xs"
        >
          {isPending && value === o.value ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            o.label
          )}
        </Button>
      ))}
    </div>
  );
}
