"use client";

import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import type { ValidationCheck } from "@/lib/seo/article-validator";
import type { StageDefinition, StageStatusSummary } from "@/lib/seo/pipeline-stages";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: StageDefinition | null;
  summary: StageStatusSummary | null;
  checks: ValidationCheck[];
}

export function StageDetailsDialog({ open, onOpenChange, stage, summary, checks }: Props) {
  if (!stage || !summary) return null;

  const failedChecks = checks.filter((c) => !c.passed);
  const passedChecks = checks.filter((c) => c.passed);

  const criticalCount = failedChecks.filter((c) => c.severity === "critical").length;
  const highCount = failedChecks.filter((c) => c.severity === "high").length;
  const mediumCount = failedChecks.filter((c) => c.severity === "medium").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="text-muted-foreground tabular-nums">{stage.id}.</span>
            {stage.name}
            <StatusBadge status={summary.status} />
          </DialogTitle>
          <DialogDescription>{stage.description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <SummaryBanner
            status={summary.status}
            passed={summary.passed}
            total={summary.total}
            criticalCount={criticalCount}
            highCount={highCount}
            mediumCount={mediumCount}
          />

          {failedChecks.length > 0 && (
            <Section title="Issues to fix" tone="bad">
              {failedChecks.map((c) => (
                <CheckItem key={c.id} check={c} />
              ))}
            </Section>
          )}

          {passedChecks.length > 0 && (
            <Section title={`Passed (${passedChecks.length})`} tone="good">
              {passedChecks.map((c) => (
                <CheckItem key={c.id} check={c} />
              ))}
            </Section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatusBadge({ status }: { status: StageStatusSummary["status"] }) {
  if (status === "ready") {
    return (
      <span className="inline-flex items-center gap-1 ms-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
        <CheckCircle2 className="h-3 w-3" />
        READY
      </span>
    );
  }
  if (status === "warnings") {
    return (
      <span className="inline-flex items-center gap-1 ms-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">
        <AlertTriangle className="h-3 w-3" />
        WARNINGS
      </span>
    );
  }
  if (status === "critical") {
    return (
      <span className="inline-flex items-center gap-1 ms-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/20 text-[10px] font-bold">
        <XCircle className="h-3 w-3" />
        CRITICAL
      </span>
    );
  }
  return null;
}

function SummaryBanner({
  status,
  passed,
  total,
  criticalCount,
  highCount,
  mediumCount,
}: {
  status: StageStatusSummary["status"];
  passed: number;
  total: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
}) {
  const tone =
    status === "ready"
      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
      : status === "critical"
        ? "border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400"
        : "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400";

  return (
    <div className={`rounded-md border p-4 ${tone}`}>
      <div className="font-bold flex items-center gap-2">
        {status === "ready" ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            All {passed} checks passed
          </>
        ) : status === "critical" ? (
          <>
            <XCircle className="h-4 w-4" />
            {passed}/{total} passed · must fix critical issues before indexing
          </>
        ) : (
          <>
            <AlertTriangle className="h-4 w-4" />
            {passed}/{total} passed · warnings only (no critical blockers)
          </>
        )}
      </div>
      {(criticalCount > 0 || highCount > 0 || mediumCount > 0) && (
        <div className="text-xs mt-2 flex items-center gap-3 flex-wrap">
          {criticalCount > 0 && (
            <span>
              <strong>{criticalCount}</strong> critical
            </span>
          )}
          {highCount > 0 && (
            <span>
              <strong>{highCount}</strong> high
            </span>
          )}
          {mediumCount > 0 && (
            <span>
              <strong>{mediumCount}</strong> medium
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "good" | "bad";
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border">
      <div
        className={`px-4 py-2 border-b font-bold text-xs ${
          tone === "good"
            ? "bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
            : "bg-red-500/5 text-red-700 dark:text-red-400"
        }`}
      >
        {title}
      </div>
      <div className="divide-y">{children}</div>
    </div>
  );
}

function CheckItem({ check }: { check: ValidationCheck }) {
  return (
    <div className="px-4 py-3 flex items-start gap-3 text-sm">
      {check.passed ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
      ) : (
        <XCircle
          className={`h-4 w-4 shrink-0 mt-0.5 ${
            check.severity === "critical"
              ? "text-red-500"
              : check.severity === "high"
                ? "text-amber-500"
                : "text-slate-500"
          }`}
        />
      )}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className={check.passed ? "text-muted-foreground text-xs" : "font-medium"}>
            {check.label}
          </div>
          {!check.passed && (
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                check.severity === "critical"
                  ? "bg-red-500/15 text-red-700 dark:text-red-400"
                  : check.severity === "high"
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                    : "bg-slate-500/15 text-slate-700 dark:text-slate-400"
              }`}
            >
              {check.severity}
            </span>
          )}
        </div>
        {check.detail && <div className="text-xs text-muted-foreground">{check.detail}</div>}
        {!check.passed && check.fix && (
          <div className="text-xs flex items-start gap-1.5 px-3 py-2 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">
            <span className="font-bold shrink-0">💡 How to fix:</span>
            <span>{check.fix}</span>
          </div>
        )}
      </div>
    </div>
  );
}
