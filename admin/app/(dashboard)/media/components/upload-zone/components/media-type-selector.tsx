"use client";

import type { CSSProperties } from "react";
import type { MediaType } from "@prisma/client";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { MEDIA_SPECS, MEDIA_TYPE_ORDER, specSummary } from "@/lib/media/media-specs";

interface MediaTypeSelectorProps {
  value: MediaType | "";
  onChange: (type: MediaType) => void;
  disabled?: boolean;
}

// Fit the true aspect-ratio rectangle inside a fixed 110×40 preview box so the
// designer literally sees the shape (wide 6:1 bar vs 16:9 vs square logo).
function ratioBoxStyle(ratio: number | null): CSSProperties {
  if (ratio === null) {
    return { width: 38, height: 38, borderStyle: "dashed" };
  }
  const maxW = 110;
  const maxH = 40;
  let w = maxW;
  let h = maxW / ratio;
  if (h > maxH) {
    h = maxH;
    w = maxH * ratio;
  }
  return { width: Math.round(w), height: Math.round(h) };
}

export function MediaTypeSelector({ value, onChange, disabled }: MediaTypeSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {MEDIA_TYPE_ORDER.map((type) => {
        const spec = MEDIA_SPECS[type];
        const isSelected = value === type;
        return (
          <button
            key={type}
            type="button"
            disabled={disabled}
            onClick={() => onChange(type)}
            aria-pressed={isSelected}
            className={cn(
              "group relative flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSelected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:border-primary/40 hover:bg-muted/40",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            {isSelected && (
              <span className="absolute end-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-2.5 w-2.5" />
              </span>
            )}

            {/* Ratio shape preview */}
            <div className="flex h-10 w-full items-center justify-center">
              <div
                className={cn(
                  "rounded-sm border",
                  isSelected ? "border-primary/50 bg-primary/20" : "border-muted-foreground/30 bg-muted-foreground/10"
                )}
                style={ratioBoxStyle(spec.ratio)}
              />
            </div>

            <div className="space-y-0.5">
              <p className="text-xs font-semibold leading-tight">{spec.label}</p>
              <p className="text-[10px] leading-tight text-muted-foreground">{specSummary(type)}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
