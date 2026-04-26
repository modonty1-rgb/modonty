"use client";

import {
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
  ShieldCheck,
  Brain,
  Lock,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import type { AuditResult } from "../actions/robots-actions";

const GROUP_META: Record<
  AuditResult["group"],
  { label: string; icon: React.ReactNode; color: string }
> = {
  public: {
    label: "Public Pages (must be open)",
    icon: <Sparkles className="h-3.5 w-3.5 text-emerald-500" />,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  private: {
    label: "Private Areas (must be locked)",
    icon: <Lock className="h-3.5 w-3.5 text-red-500" />,
    color: "text-red-600 dark:text-red-400",
  },
  "ai-search": {
    label: "AI Search Bots (allow for visibility)",
    icon: <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />,
    color: "text-blue-600 dark:text-blue-400",
  },
  "ai-training": {
    label: "AI Training Bots (block to protect content)",
    icon: <Brain className="h-3.5 w-3.5 text-violet-500" />,
    color: "text-violet-600 dark:text-violet-400",
  },
};

interface AuditState {
  results: AuditResult[];
  passed: number;
  failed: number;
  fetchedAt: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  audit: AuditState | null;
}

export function RobotsAuditDialog({ open, onOpenChange, loading, audit }: Props) {
  const grouped = audit ? groupResults(audit.results) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5 text-violet-500" />
            Robots Audit
            {audit && (
              <span
                className={`inline-flex items-center gap-1 ms-2 px-2 py-0.5 rounded-full border text-xs font-bold ${
                  audit.failed === 0
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20"
                }`}
              >
                {audit.failed === 0 ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    {audit.passed}/{audit.results.length} pass
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" />
                    {audit.failed} failed
                  </>
                )}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Auto-tests 19 critical paths against the live robots.txt
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {loading && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin inline-block me-2" />
              Running audit on robots.txt…
            </div>
          )}

          {!loading && !audit && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No audit data
            </div>
          )}

          {grouped && audit && (
            <>
              <div
                className={`p-3 rounded-md border ${
                  audit.failed === 0
                    ? "bg-emerald-500/10 border-emerald-500/20"
                    : "bg-red-500/10 border-red-500/20"
                }`}
              >
                <div
                  className={`flex items-center gap-2 font-bold ${
                    audit.failed === 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {audit.failed === 0 ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      All {audit.passed} checks passed — robots.txt is configured correctly
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      {audit.failed} of {audit.results.length} checks failed
                    </>
                  )}
                </div>
              </div>

              {(["public", "private", "ai-search", "ai-training"] as const).map((g) => {
                const items = grouped[g];
                if (!items || items.length === 0) return null;
                const meta = GROUP_META[g];
                const groupPassed = items.filter((r) => r.pass).length;
                return (
                  <div key={g} className="rounded-md border">
                    <div className={`flex items-center justify-between gap-2 px-3 py-2 border-b bg-muted/30 ${meta.color}`}>
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        {meta.icon}
                        {meta.label}
                      </div>
                      <span className="text-xs tabular-nums">
                        {groupPassed}/{items.length}
                      </span>
                    </div>
                    <div className="divide-y">
                      {items.map((r, i) => (
                        <ResultRow key={`${r.userAgent}-${r.path}-${i}`} result={r} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {audit && (
          <div className="px-6 py-3 border-t text-[10px] text-muted-foreground bg-muted/20">
            Audit ran at {new Date(audit.fetchedAt).toLocaleTimeString("en-US")} on live robots.txt
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function groupResults(results: AuditResult[]): Record<AuditResult["group"], AuditResult[]> {
  const out: Record<AuditResult["group"], AuditResult[]> = {
    public: [],
    private: [],
    "ai-search": [],
    "ai-training": [],
  };
  for (const r of results) out[r.group].push(r);
  return out;
}

function ResultRow({ result }: { result: AuditResult }) {
  const expectLabel = result.expect === "allow" ? "ALLOW" : "BLOCK";
  const actualLabel = result.actual === "allow" ? "ALLOW" : "BLOCK";

  return (
    <div className="flex items-center gap-3 px-3 py-2 hover:bg-muted/40">
      <div className="shrink-0">
        {result.pass ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-xs">{result.label}</span>
          <span className="text-[10px] text-muted-foreground font-mono" dir="ltr">
            {result.userAgent} · {result.path}
          </span>
        </div>
        {!result.pass && (
          <div className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">
            Expected <strong>{expectLabel}</strong> · got <strong>{actualLabel}</strong>
            {result.matchedRule && <> · matched <span className="font-mono">{result.matchedRule}</span></>}
          </div>
        )}
        {result.pass && result.matchedRule && (
          <div className="text-[10px] text-muted-foreground mt-0.5 font-mono" dir="ltr">
            {result.matchedRule}
          </div>
        )}
      </div>
      <span
        className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold ${
          result.actual === "allow"
            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
            : "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20"
        }`}
      >
        {actualLabel}
      </span>
    </div>
  );
}
