"use client";

import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface Props {
  label: string;
  hint?: string;
  counter?: number;
  counterMax?: number;
  counterMin?: number; // ideal lower bound — when set, the counter turns green/amber/red
  children: ReactNode;
}

export function Field({ label, hint, counter, counterMax, counterMin, children }: Props) {
  const hasCounter = typeof counter === "number" && typeof counterMax === "number";
  const overLimit = hasCounter && (counter as number) > (counterMax as number);
  const graded = hasCounter && typeof counterMin === "number";
  const underIdeal = graded && (counter as number) < (counterMin as number);
  const gradedCls = overLimit
    ? "bg-rose-500/15 text-rose-600"
    : underIdeal
      ? "bg-amber-500/15 text-amber-600"
      : "bg-emerald-500/15 text-emerald-600";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-medium text-foreground/80 inline-flex items-center gap-1.5">
          {label}
          {hint && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground/60 hover:text-foreground transition-colors">
                  <Info className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">
                {hint}
              </TooltipContent>
            </Tooltip>
          )}
        </Label>
        {hasCounter && (
          graded ? (
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium tabular-nums ${gradedCls}`}>
              {counter}/{counterMax}
            </span>
          ) : (
            <span className={`text-[10px] tabular-nums ${overLimit ? "text-rose-500" : "text-muted-foreground/60"}`}>
              {counter}/{counterMax}
            </span>
          )
        )}
      </div>
      {children}
    </div>
  );
}
