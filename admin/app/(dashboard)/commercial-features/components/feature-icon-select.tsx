"use client";

import { useState } from "react";
import type { ComponentType, SVGProps } from "react";
import * as Icons from "@modonty/shared/lib/icons";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NONE = "none";
type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;
const REGISTRY = Icons as unknown as Record<string, IconComponent>;

/**
 * Picks a feature icon by NAME from the shared registry and shows the glyph itself next to
 * each name, so the admin sees what the /pay card will draw. Submits through a hidden
 * input bound to `formId`: the row's fields live in separate table cells, and Radix's own
 * hidden <select> only submits when it sits inside the <form> element.
 */
export function FeatureIconSelect({ formId, names, defaultValue }: { formId: string; names: readonly string[]; defaultValue: string | null }) {
  const [value, setValue] = useState(defaultValue ?? NONE);
  const Current = value !== NONE ? REGISTRY[value] : null;
  return <>
    <input type="hidden" name="icon" form={formId} value={value} />
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger className="h-9 w-44" aria-label="أيقونة الميزة">
        <span className="flex items-center gap-2">{Current ? <Current className="size-4 shrink-0" aria-hidden /> : null}<SelectValue /></span>
      </SelectTrigger>
      <SelectContent className="max-h-72">
        <SelectItem value={NONE}>بلا أيقونة</SelectItem>
        {names.map((name) => { const Glyph = REGISTRY[name]; return <SelectItem key={name} value={name}><span className="flex items-center gap-2"><Glyph className="size-4 shrink-0" aria-hidden />{name.replace(/^Icon/, "")}</span></SelectItem>; })}
      </SelectContent>
    </Select>
  </>;
}

/** Read-only glyph for lists — null when the feature has no icon or the name left the registry. */
export function FeatureIcon({ name, className }: { name: string | null; className?: string }) {
  const Glyph = name ? REGISTRY[name] : null;
  return Glyph ? <Glyph className={className ?? "size-4"} aria-hidden /> : null;
}
