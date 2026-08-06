"use client";

import { useState } from "react";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HEALTH_CHECK_INFO,
  SEVERITY_LABEL,
  SEVERITY_MEANING,
  type HealthCheckId,
  type HealthSeverity,
} from "@/lib/health/article-health-types";

/**
 * The report's published rulebook.
 *
 * A finding on this screen carries weight, so whoever reads it must be able to see —
 * without asking anyone — exactly what was measured, at what severity, and what proof the
 * checker required before saying anything at all. Everything here is rendered from the
 * same constants the engine uses, so the rules shown can never drift from the rules run.
 */

const ORDER: HealthSeverity[] = ["critical", "high", "low"];

const TONE: Record<HealthSeverity, { chip: string; head: string }> = {
  critical: { chip: "bg-red-50 text-red-700 ring-red-200", head: "text-red-700" },
  high: { chip: "bg-amber-50 text-amber-700 ring-amber-200", head: "text-amber-700" },
  low: { chip: "bg-slate-50 text-slate-600 ring-slate-200", head: "text-slate-600" },
};

export function CriteriaDialog() {
  const [open, setOpen] = useState(false);

  const grouped = ORDER.map((severity) => ({
    severity,
    items: (Object.entries(HEALTH_CHECK_INFO) as [HealthCheckId, (typeof HEALTH_CHECK_INFO)[HealthCheckId]][])
      .filter(([, info]) => info.severity === severity),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
        <Info className="h-4 w-4" />
        معايير الفحص
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto" dir="rtl">
          <DialogHeader className="text-start">
            <DialogTitle className="text-xl">معايير هذا التقرير</DialogTitle>
            <DialogDescription>
              عشرة أشياء نفحصها في كل مقال، مرتّبة من الأخطر للأبسط.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {grouped.map((group) => (
              <section key={group.severity}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-bold ring-1 ${TONE[group.severity].chip}`}
                  >
                    {SEVERITY_LABEL[group.severity]}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {SEVERITY_MEANING[group.severity]}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.items.map(([id, info]) => (
                    <div key={id} className="rounded-lg border bg-muted/30 p-3">
                      <p className={`text-sm font-bold ${TONE[group.severity].head}`}>
                        {info.label}
                      </p>
                      <p className="mt-1 text-sm text-foreground/80">{info.what}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        <span className="font-semibold">لو ما اشتغل:</span> {info.impact}
                      </p>
                      {/* The authority behind the rule, so nobody has to take the report's
                          word for it. A criterion with no external source says so. */}
                      <div className="mt-2 border-t pt-2">
                        {info.basis.quote && (
                          <p dir="ltr" className="text-start text-xs italic text-foreground/70">
                            “{info.basis.quote}”
                          </p>
                        )}
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {info.basis.source}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}

          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
