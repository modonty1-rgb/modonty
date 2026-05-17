"use client";

import { useState, type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { IconChevronDown, IconChevronUp } from "@/lib/icons";

interface ArticleSectionCollapsibleProps {
  title: string;
  headingId: string;
  /**
   * Pre-rendered icon element (e.g. `<IconAi className="h-4 w-4 ..." />`).
   * Must be a rendered React element — not a component reference —
   * so it can cross the Server→Client boundary as a serialized RSC payload.
   */
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function ArticleSectionCollapsible({
  title,
  headingId,
  icon,
  children,
  defaultOpen = false,
}: ArticleSectionCollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="my-2 md:my-3" aria-labelledby={headingId}>
      <Card className="min-w-0 hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex flex-col gap-4">
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 rounded-md hover:bg-muted/50 p-2 -m-2 transition-colors text-right"
                aria-expanded={open}
              >
                <div className="flex flex-col items-end gap-0.5">
                  <div className="flex items-center gap-2">
                    {icon}
                    <h2
                      id={headingId}
                      className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                    >
                      {title}
                    </h2>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {open ? "انقر للإخفاء" : "انقر لعرض المزيد"}
                  </span>
                </div>
                <span className="shrink-0 text-muted-foreground" aria-hidden>
                  {open ? <IconChevronUp className="h-5 w-5" /> : <IconChevronDown className="h-5 w-5" />}
                </span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-col gap-4 pt-4 border-t border-border mt-2">{children}</div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </section>
  );
}
