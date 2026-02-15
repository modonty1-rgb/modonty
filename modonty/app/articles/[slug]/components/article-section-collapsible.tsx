"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ArticleSectionCollapsibleProps {
  title: string;
  headingId: string;
  icon: LucideIcon;
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ArticleSectionCollapsible({
  title,
  headingId,
  icon: Icon,
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ArticleSectionCollapsibleProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined && controlledOnOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

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
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
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
                  {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
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
