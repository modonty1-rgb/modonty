"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import type { SeoCheck } from "@modonty/database/lib/seo/client/types";

interface SeoReadinessButtonProps {
  score: number;
  checks: SeoCheck[];
}

// Compact header trigger + dialog. The score/checks are computed on the server
// (SeoReadinessCard) and passed in — this is the only client boundary.
export function SeoReadinessButton({ score, checks }: SeoReadinessButtonProps) {
  const [open, setOpen] = useState(false);

  const tone =
    score >= 80
      ? {
          btn: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 hover:text-emerald-800",
          chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
          progress: "emerald" as const,
        }
      : score >= 50
        ? {
            btn: "border-amber-500/40 bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 hover:text-amber-800",
            chip: "border-amber-200 bg-amber-50 text-amber-700",
            progress: "amber" as const,
          }
        : {
            btn: "border-red-500/40 bg-red-500/10 text-red-700 hover:bg-red-500/15 hover:text-red-800",
            chip: "border-red-200 bg-red-50 text-red-700",
            progress: "destructive" as const,
          };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={`h-8 gap-1.5 rounded-full px-3 text-xs font-medium tabular-nums ${tone.btn}`}
      >
        <Search className="h-3.5 w-3.5" />
        جاهزية SEO · {score}%
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 shrink-0 text-primary" />
              جاهزية SEO
              <Badge variant="outline" className={`tabular-nums ${tone.chip}`}>
                {score}%
              </Badge>
            </DialogTitle>
            <DialogDescription>مدى جاهزية صفحتك للظهور في نتائج البحث</DialogDescription>
          </DialogHeader>

          <Progress value={score} tone={tone.progress} />

          <ul className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
            {checks.map((c) => {
              const good = c.status === "good";
              return (
                <li key={c.key} className="flex items-center gap-1.5 text-sm" title={c.hint}>
                  {good ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  )}
                  <span className={good ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
                </li>
              );
            })}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
