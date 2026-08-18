"use client";

import type { ReactNode } from "react";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TemplateOption<K extends string> {
  key: K;
  name: string;
}

interface TemplateRadioPickerProps<K extends string> {
  label: string;
  idPrefix: string;
  options: readonly TemplateOption<K>[];
  value: K;
  onChange: (key: K) => void;
  renderPreview: (key: K) => ReactNode;
}

/**
 * Full-width previews, one radio beside each with the name under it, nothing above the
 * preview — the partner looks at the bar itself and imagines it on his site (Khalid
 * 2026-08-17). Clicking the preview picks it too. Shared by the header and footer pickers.
 */
export function TemplateRadioPicker<K extends string>({ label, idPrefix, options, value, onChange, renderPreview }: TemplateRadioPickerProps<K>) {
  return (
    // dir="rtl": Radix stamps `dir="ltr"` on its roving-focus root by default, which
    // flipped every preview inside. The page is RTL.
    <RadioGroup dir="rtl" value={value} onValueChange={(v) => onChange(v as K)} aria-label={label} className="gap-4">
      {options.map((t) => {
        const selected = t.key === value;
        const id = `${idPrefix}-${t.key}`;
        return (
          <div key={t.key} className="flex items-center gap-3">
            <div className="flex w-16 shrink-0 flex-col items-center gap-1">
              <RadioGroupItem id={id} value={t.key} aria-label={t.name} className="h-5 w-5" />
              <Label htmlFor={id} className="cursor-pointer text-center text-[11px] leading-tight text-muted-foreground">
                {t.name}
              </Label>
            </div>
            <Label
              htmlFor={id}
              className={cn(
                // ring, not border: thickness changes without the box moving (design-system §2);
                // press feedback on pointer-down, reduced-motion safe.
                "block min-w-0 flex-1 cursor-pointer overflow-hidden rounded-lg ring-1 transition-[box-shadow,transform] motion-safe:active:scale-[0.995]",
                selected ? "ring-2 ring-primary" : "ring-border hover:ring-foreground/40",
              )}
            >
              <div className="pointer-events-none select-none" aria-hidden>
                {renderPreview(t.key)}
              </div>
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
}
