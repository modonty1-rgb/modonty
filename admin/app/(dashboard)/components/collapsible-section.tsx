"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

/**
 * A dashboard section whose header toggles its body (shadcn/Radix Collapsible).
 *
 * Collapsed → the header shows a compact icon+counter `summary` (the whole section at a
 * glance); expanded → the `subtitle`, the `right` link, and the full body. One component
 * for every section AND the Today strip (`card`) — Khalid 2026-07-23: «نفس الفكرة reusable».
 * `right` stays OUTSIDE the trigger so its link never becomes a button-in-button, and the
 * open/closed choice persists per browser when a `storageKey` is given.
 * The icon is passed already-rendered (iconNode) — a LucideIcon cannot cross the
 * server→client boundary as a prop.
 */
export function CollapsibleSection({
  iconNode,
  title,
  subtitle,
  summary,
  right,
  storageKey,
  defaultOpen = false,
  card = false,
  children,
}: {
  iconNode: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  summary?: React.ReactNode;
  right?: React.ReactNode;
  storageKey?: string;
  defaultOpen?: boolean;
  card?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (!storageKey) return;
    const saved = window.localStorage.getItem(storageKey);
    if (saved === "1") setOpen(true);
    else if (saved === "0") setOpen(false);
  }, [storageKey]);

  const change = (v: boolean) => {
    setOpen(v);
    if (storageKey) window.localStorage.setItem(storageKey, v ? "1" : "0");
  };

  const header = (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5",
        card ? "border-b px-4 py-2.5" : "mb-3 border-b pb-2",
      )}
    >
      <CollapsibleTrigger className="group flex flex-1 items-center gap-x-2 text-start transition hover:opacity-90">
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open ? "" : "-rotate-90",
          )}
        />
        {iconNode}
        <h2
          className={cn(
            "flex flex-wrap items-center gap-x-2 font-bold",
            card ? "text-[13px] font-extrabold" : "text-sm",
          )}
        >
          {title}
          {subtitle && open && (
            <span className="text-[11.5px] font-normal text-muted-foreground">{subtitle}</span>
          )}
        </h2>
        {/* Collapsed: the icon+counter summary sits inside the trigger so tapping it opens. */}
        {!open && summary && (
          <span className="ms-auto flex flex-wrap items-center justify-end gap-x-2.5 gap-y-1.5">
            {summary}
          </span>
        )}
      </CollapsibleTrigger>
      {open && right}
    </div>
  );

  if (card) {
    return (
      <Collapsible
        open={open}
        onOpenChange={change}
        className="overflow-hidden rounded-xl border bg-card shadow-sm"
      >
        {header}
        <CollapsibleContent>{children}</CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={change}>
      {header}
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}
