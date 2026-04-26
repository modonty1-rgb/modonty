"use client";

import { Link2, ShieldAlert, Smartphone, AlertCircle } from "lucide-react";
import {
  TechHealthDialog,
  type TechHealthIssue,
  type TechHealthKind,
} from "./tech-health-dialog";

interface Props {
  kind: TechHealthKind;
  count: number;
  issues: TechHealthIssue[];
}

const ICONS: Record<TechHealthKind, React.ReactNode> = {
  canonical: <Link2 className="h-3 w-3 text-amber-500" />,
  robots: <ShieldAlert className="h-3 w-3 text-red-500" />,
  mobile: <Smartphone className="h-3 w-3 text-red-500" />,
  soft404: <AlertCircle className="h-3 w-3 text-amber-500" />,
};

const LABELS: Record<TechHealthKind, string> = {
  canonical: "Canonical",
  robots: "Robots",
  mobile: "Mobile",
  soft404: "Soft 404",
};

const TONE_OK = "text-emerald-600 dark:text-emerald-400";
const TONE_BAD: Record<TechHealthKind, string> = {
  canonical: "text-amber-600 dark:text-amber-400",
  robots: "text-red-600 dark:text-red-400",
  mobile: "text-red-600 dark:text-red-400",
  soft404: "text-amber-600 dark:text-amber-400",
};

export function TechHealthStat({ kind, count, issues }: Props) {
  const accent = count > 0 ? TONE_BAD[kind] : TONE_OK;

  return (
    <TechHealthDialog kind={kind} count={count} issues={issues}>
      {({ onClick, disabled }) => (
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={`space-y-1 text-start rounded-md p-1.5 -m-1.5 transition-colors ${
            disabled
              ? "cursor-not-allowed"
              : "hover:bg-muted/50 cursor-pointer"
          }`}
          title={
            disabled
              ? "No issues — nothing to inspect."
              : `Click to see the ${count} URL${count === 1 ? "" : "s"} with ${LABELS[kind]} ${
                  kind === "canonical" ? "issues" : kind === "soft404" ? "issues" : "problems"
                }`
          }
        >
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
            {ICONS[kind]}
            <span className="truncate">{LABELS[kind]}</span>
          </div>
          <div className={`text-2xl font-extrabold tabular-nums leading-none ${accent}`}>
            {count}
          </div>
        </button>
      )}
    </TechHealthDialog>
  );
}
