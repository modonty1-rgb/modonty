"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  HelpCircle,
  Flame,
  TrendingUp,
  Snowflake,
  Award,
  Target,
} from "lucide-react";
import { ar } from "@/lib/ar";

export type KpiInfoKey = "high" | "medium" | "low" | "qualified" | "avg";
export type KpiIconKey = "flame" | "trending-up" | "snowflake" | "award" | "target";

const ICONS: Record<KpiIconKey, React.ComponentType<{ className?: string }>> = {
  flame: Flame,
  "trending-up": TrendingUp,
  snowflake: Snowflake,
  award: Award,
  target: Target,
};

interface Props {
  iconKey: KpiIconKey;
  tone: "red" | "amber" | "slate" | "primary" | "muted";
  label: string;
  value: number;
  hint: string;
  infoKey: KpiInfoKey;
}

export function KpiInfoCard({
  iconKey,
  tone,
  label,
  value,
  hint,
  infoKey,
}: Props) {
  const Icon = ICONS[iconKey];
  const [open, setOpen] = useState(false);

  const toneClasses = {
    red: "bg-red-50 text-red-700 ring-red-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
    primary: "bg-primary/10 text-primary ring-primary/20",
    muted: "bg-muted text-muted-foreground ring-border",
  }[tone];

  return (
    <>
      <Card className="relative shadow-sm">
        <CardContent className="flex items-center gap-3 p-4">
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ${toneClasses}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold leading-tight tabular-nums">
              {value}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">{hint}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            className="absolute end-2 top-2 h-7 w-7 text-muted-foreground hover:text-foreground"
            aria-label={ar.leads.infoButton}
            title={ar.leads.infoButton}
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <KpiInfoSheet open={open} onOpenChange={setOpen} infoKey={infoKey} />
    </>
  );
}

// ─── Sheet content ───────────────────────────────────────────────────

function KpiInfoSheet({
  open,
  onOpenChange,
  infoKey,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  infoKey: KpiInfoKey;
}) {
  const l = ar.leads;
  const content = renderInfo(infoKey);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{content.title}</SheetTitle>
          <SheetDescription className="text-foreground/90">
            {content.lead}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Per-key behavior list */}
          {content.example && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {content.example}
            </p>
          )}

          {content.note && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-sm leading-relaxed text-foreground">
                💡 {content.note}
              </p>
            </div>
          )}

          {content.interpret && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {content.interpret}
            </p>
          )}

          {/* Compact formula reminder at the bottom */}
          <FormulaBlock />

          <p className="text-[11px] text-muted-foreground">{l.windowNote}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function FormulaBlock() {
  const l = ar.leads;
  return (
    <Section title={l.howScoreWorksTitle}>
      <p className="text-sm text-foreground">{l.howScoreWorksIntro}</p>
      <ul className="space-y-1.5 ps-1 text-sm leading-relaxed text-foreground">
        <li>{l.factor1}</li>
        <li>{l.factor2}</li>
        <li>{l.factor3}</li>
        <li>{l.factor4}</li>
      </ul>
      <p className="rounded-md bg-muted/50 px-3 py-2 text-xs font-medium text-foreground">
        {l.formulaLine}
      </p>
    </Section>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function renderInfo(key: KpiInfoKey): {
  title: string;
  lead: string;
  example?: string;
  note?: string;
  interpret?: string;
} {
  const l = ar.leads;
  switch (key) {
    case "high":
      return {
        title: l.infoHighTitle,
        lead: l.infoHighDesc,
        example: l.infoHighExample,
      };
    case "medium":
      return {
        title: l.infoMediumTitle,
        lead: l.infoMediumDesc,
        example: l.infoMediumExample,
      };
    case "low":
      return {
        title: l.infoLowTitle,
        lead: l.infoLowDesc,
        example: l.infoLowExample,
      };
    case "qualified":
      return {
        title: l.infoQualifiedTitle,
        lead: l.infoQualifiedDesc,
        note: l.infoQualifiedNote,
      };
    case "avg":
      return {
        title: l.infoAvgTitle,
        lead: l.infoAvgDesc,
        example: l.infoAvgExample,
        interpret: l.infoAvgInterpret,
      };
  }
}
