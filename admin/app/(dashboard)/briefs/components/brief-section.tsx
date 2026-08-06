"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronsDownUp, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

/**
 * Foldable sections of the brief, plus one control that drives them all.
 *
 * The broadcast is a COUNTER, not a boolean. If it were a boolean, opening everything and
 * then folding one section by hand would leave the shared value stuck on "open", and the
 * next press of the same button would do nothing at all. Each bump is a fresh instruction;
 * between bumps every section owns its own state again.
 */

interface BroadcastState {
  /** Increments on every press — the only thing sections actually react to. */
  tick: number;
  wantOpen: boolean;
}

const BriefSectionsContext = createContext<{
  state: BroadcastState;
  toggleAll: () => void;
} | null>(null);

export function BriefSectionsProvider({ children }: { children: React.ReactNode }) {
  // Sections start folded, so the first press is the useful one: open everything.
  const [state, setState] = useState<BroadcastState>({ tick: 0, wantOpen: false });

  const toggleAll = useCallback(() => {
    setState((s) => ({ tick: s.tick + 1, wantOpen: !s.wantOpen }));
  }, []);

  return (
    <BriefSectionsContext.Provider value={{ state, toggleAll }}>
      {children}
    </BriefSectionsContext.Provider>
  );
}

/** Sits with the page actions. Its label says what the NEXT press will do. */
export function ToggleAllSectionsButton() {
  const ctx = useContext(BriefSectionsContext);
  if (!ctx) return null;

  const willOpen = !ctx.state.wantOpen;
  const Icon = willOpen ? ChevronsUpDown : ChevronsDownUp;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 gap-1.5"
      onClick={ctx.toggleAll}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {willOpen ? "افتح الكل" : "اقفل الكل"}
    </Button>
  );
}

/**
 * One foldable section. Same behaviour as the dashboard's `DashboardSection`: independent
 * toggles, no accordion, no persistence — state resets on reload.
 *
 * The point is scanning. The brief is long by design (a writer needs all of it eventually)
 * but nobody needs all of it AT ONCE — a designer folds the questionnaire away to reach the
 * images, a writer folds the gallery away to keep the answers on one screen.
 *
 * The header stays visible when folded, with its count on the right, so closing a section
 * never hides the fact that it has something in it.
 */
export function BriefSection({
  title,
  icon,
  meta,
  // Closed by default (Khalid 2026-08-06): the page is a reference, not a report. Landing
  // on a list of headings lets you choose what to read; landing mid-questionnaire makes
  // you scroll past it to find out what else is even here.
  defaultOpen = false,
  tone = "default",
  children,
}: {
  title: string;
  icon: React.ReactNode;
  /** Short right-hand note — a count, a date. Readable while folded. */
  meta?: React.ReactNode;
  defaultOpen?: boolean;
  /** `highlight` marks the section that must not be missed on a folded page. */
  tone?: "default" | "highlight";
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const ctx = useContext(BriefSectionsContext);
  const seenTick = useRef(ctx?.state.tick ?? 0);

  // Only a NEW tick counts. Without this guard the effect would re-assert the broadcast
  // value on every re-render and a section could never be folded on its own afterwards.
  const tick = ctx?.state.tick ?? 0;
  const wantOpen = ctx?.state.wantOpen ?? false;
  useEffect(() => {
    if (tick === seenTick.current) return;
    seenTick.current = tick;
    setOpen(wantOpen);
  }, [tick, wantOpen]);

  const highlight = tone === "highlight";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card",
        // With every section folded, the headers are all that is left — so the one
        // carrying instructions the team was already given needs to be findable without
        // reading. Colour is the only thing that survives at a glance.
        highlight && "border-primary/40 bg-primary/[0.04] ring-1 ring-primary/15",
      )}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={`${open ? "اطوِ" : "افتح"} ${title}`}
          className={cn(
            "flex w-full items-center gap-2 px-4 py-3 text-start transition-colors",
            highlight ? "hover:bg-primary/10" : "hover:bg-accent/40",
            open && "border-b",
          )}
        >
          <span
            className={cn(
              "shrink-0 [&_svg]:h-4 [&_svg]:w-4",
              highlight ? "text-primary" : "text-muted-foreground",
            )}
          >
            {icon}
          </span>
          <h2 className={cn("text-[13px] font-bold", highlight && "text-primary")}>{title}</h2>
          {meta && (
            <span
              className={cn(
                "ms-auto text-[11px]",
                highlight ? "font-semibold text-primary/80" : "text-muted-foreground",
              )}
            >
              {meta}
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-200",
              highlight ? "text-primary" : "text-muted-foreground",
              open ? "rotate-180" : "rotate-0",
              !meta && "ms-auto",
            )}
            aria-hidden="true"
          />
        </button>

        <CollapsibleContent>{children}</CollapsibleContent>
      </Collapsible>
    </div>
  );
}
