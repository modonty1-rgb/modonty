"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

/**
 * A dashboard section whose header toggles its body (shadcn/Radix Collapsible).
 * Mirrors SectionHead's look exactly, adds a chevron, and keeps `right` OUTSIDE the
 * trigger so an interactive action there never becomes a button-in-button.
 * The icon is passed already-rendered (iconNode) — a LucideIcon component cannot
 * cross the server→client boundary as a prop.
 */
export function CollapsibleSection({
  iconNode,
  title,
  subtitle,
  right,
  defaultOpen = false,
  children,
}: {
  iconNode: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b pb-2">
        <CollapsibleTrigger className="group flex flex-1 items-center gap-x-2 text-start">
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
              open ? "" : "-rotate-90"
            }`}
          />
          {iconNode}
          <h2 className="flex flex-wrap items-center gap-x-2 text-sm font-bold">
            {title}
            {subtitle && (
              <span className="text-[11.5px] font-normal text-muted-foreground">{subtitle}</span>
            )}
          </h2>
        </CollapsibleTrigger>
        {right}
      </div>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}
