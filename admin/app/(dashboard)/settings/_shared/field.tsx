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
  children: ReactNode;
}

export function Field({ label, hint, counter, counterMax, children }: Props) {
  const overLimit = typeof counter === "number" && typeof counterMax === "number" && counter > counterMax;
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
        {typeof counter === "number" && typeof counterMax === "number" && (
          <span className={`text-[10px] tabular-nums ${overLimit ? "text-rose-500" : "text-muted-foreground/60"}`}>
            {counter}/{counterMax}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
