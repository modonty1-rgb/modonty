"use client";

import { Input } from "@/components/ui/input";

/** A labelled amount box for the calculators — a numeric keypad on phones, the unit beside it. */
export function NumberField({
  id,
  label,
  unit,
  value,
  onChange,
}: {
  id: string;
  label: string;
  unit?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-foreground/80">
        {label}
      </label>
      <div className="mt-1 flex items-center gap-2">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 tabular-nums"
        />
        {unit && <span className="shrink-0 text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}
