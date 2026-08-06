"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import type { RecipientOption } from "../helpers/load-recipients";

/**
 * Picks who a note is addressed to.
 *
 * The list is built from STAFF ROLES at request time, not from a hardcoded roster — hire an
 * editor tomorrow and they appear here on the next page load; change someone's role and they
 * leave it. Nothing to remember to update.
 *
 * Selecting nobody is a real answer, not an empty one: it addresses the whole group, which
 * is what most notes want, so it is the default and it is spelled out.
 */
export function RecipientPicker({
  options,
  selected,
  onChange,
  disabled,
}: {
  options: RecipientOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  // Grouped by role so the picker reads as "who does what", not as a flat name list.
  const groups = useMemo(() => {
    const byRole = new Map<string, RecipientOption[]>();
    for (const o of options) {
      const list = byRole.get(o.roleLabel) ?? [];
      list.push(o);
      byRole.set(o.roleLabel, list);
    }
    return [...byRole.entries()];
  }, [options]);

  const selectedNames = options.filter((o) => selected.includes(o.id)).map((o) => o.name);

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }

  const label =
    selectedNames.length === 0
      ? "الكل — كل المحرّرين والمصمّمين"
      : selectedNames.length <= 2
        ? selectedNames.join(" · ")
        : `${selectedNames.slice(0, 2).join(" · ")} +${selectedNames.length - 2}`;

  return (
    <Popover open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="h-9 w-full justify-between gap-2 font-normal"
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="truncate text-xs">{label}</span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" dir="rtl" className="w-[--radix-popover-trigger-width] p-1">
        <button
          type="button"
          onClick={() => onChange([])}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-2 text-start text-xs transition-colors hover:bg-accent",
            selected.length === 0 && "bg-accent",
          )}
        >
          <span className="grid h-4 w-4 shrink-0 place-items-center">
            {selected.length === 0 && <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
          </span>
          <span className="font-medium">📣 الكل</span>
          <span className="ms-auto text-[10px] text-muted-foreground">
            {options.length} شخص
          </span>
        </button>

        {options.length === 0 ? (
          <p className="px-2 py-3 text-center text-[11px] text-muted-foreground">
            ما فيه محرّرين ولا مصمّمين مفعّلين.
          </p>
        ) : (
          groups.map(([roleLabel, people]) => (
            <div key={roleLabel} className="mt-1 border-t pt-1">
              <p className="px-2 py-1 text-[10px] font-semibold text-muted-foreground">{roleLabel}</p>
              {people.map((p) => {
                const on = selected.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggle(p.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-2 text-start text-xs transition-colors hover:bg-accent",
                      on && "bg-accent",
                    )}
                  >
                    <span className="grid h-4 w-4 shrink-0 place-items-center">
                      {on && <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
                    </span>
                    <span className="truncate">{p.name}</span>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
}
