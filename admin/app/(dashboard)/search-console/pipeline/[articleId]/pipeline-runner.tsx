"use client";

import { useState } from "react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Play,
  Zap,
  ShieldCheck,
  FileText,
  Code,
  Image as ImageIcon,
  Link2,
  Globe,
  Gauge,
  Search,
  RotateCw,
  Smartphone,
  Languages,
  ListTree,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import {
  PIPELINE_STAGES,
  summarizeStage,
  type StageDefinition,
  type StageStatusSummary,
} from "@/lib/seo/pipeline-stages";

import {
  runHtmlPipelineStagesAction,
  runPageSpeedStageAction,
  runFinalIndexCheckAction,
} from "../../actions/pipeline-actions";

import type { ManualTrackState } from "../../actions/removal-tracking-actions";
import { AutoFixSchemaButton } from "../../components/auto-fix-schema-button";
import { ViewSchemaValidationButton } from "../../components/view-schema-validation-button";
import { StageDetailsDialog } from "../../components/stage-details-dialog";
import { SeoRowAction } from "../../components/seo-row-action";

import type { ValidationResult, ValidationCheck } from "@/lib/seo/article-validator";
import type { PageSpeedReport, CWVRating, ElementDetail } from "@/lib/seo/pagespeed";
import type { CruxReport } from "@/lib/seo/crux";

interface CachedInspection {
  verdict: string | null;
  coverageState: string | null;
  indexingState: string | null;
  inspectedAt: string;
  isFresh: boolean;
}

const STAGE_ICONS: Record<string, React.ReactNode> = {
  reachability: <Globe className="h-4 w-4" />,
  indexability: <ShieldCheck className="h-4 w-4" />,
  "mobile-friendliness": <Smartphone className="h-4 w-4" />,
  "document-language": <Languages className="h-4 w-4" />,
  metadata: <FileText className="h-4 w-4" />,
  content: <FileText className="h-4 w-4" />,
  schema: <Code className="h-4 w-4" />,
  media: <ImageIcon className="h-4 w-4" />,
  "internal-links": <Link2 className="h-4 w-4" />,
  "external-links": <Link2 className="h-4 w-4" />,
  "sitemap-inclusion": <ListTree className="h-4 w-4" />,
  performance: <Gauge className="h-4 w-4" />,
  "final-check": <Search className="h-4 w-4" />,
};

interface Props {
  articleId: string;
  articleUrl: string;
  indexingTrackState: ManualTrackState | null;
  cachedInspection: CachedInspection | null;
}

export function PipelineRunner({ articleId, articleUrl, indexingTrackState, cachedInspection }: Props) {
  const { toast } = useToast();
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [pageSpeed, setPageSpeed] = useState<PageSpeedReport | null>(null);
  const [crux, setCrux] = useState<CruxReport | null>(null);
  const [cruxError, setCruxError] = useState<string | null>(null);
  const [inspection, setInspection] = useState<CachedInspection | null>(cachedInspection);
  const [runningStage, setRunningStage] = useState<string | null>(null);
  const [detailsStage, setDetailsStage] = useState<{
    stage: StageDefinition;
    summary: StageStatusSummary;
    checks: ValidationCheck[];
  } | null>(null);

  const runHtmlStages = () => {
    setRunningStage("html");
    runHtmlPipelineStagesAction(articleId)
      .then((res) => {
        if (res.ok && res.validation) {
          setValidation(res.validation);
          toast({
            title: "Stages 1-7 + 11 complete",
            description: `${res.validation.passedCount}/${res.validation.totalChecks} checks passed`,
          });
        } else {
          toast({ title: "Pipeline run failed", description: res.error, variant: "destructive" });
        }
      })
      .finally(() => setRunningStage(null));
  };

  const runPageSpeed = () => {
    setRunningStage("performance");
    runPageSpeedStageAction(articleId)
      .then((res) => {
        if (res.ok && res.report) {
          setPageSpeed(res.report);
          setCrux(res.crux ?? null);
          setCruxError(res.cruxError ?? null);
          const cruxNote = res.crux
            ? ` · Field data: ${res.crux.scope === "url" ? "URL-level" : "origin-level"}`
            : res.cruxError
              ? ` · CrUX: ${res.cruxError.slice(0, 60)}`
              : " · CrUX: no field data yet";
          toast({
            title: "Performance check complete",
            description: `Lab score ${res.report.performanceScore}/100${cruxNote}`,
          });
        } else {
          toast({ title: "PageSpeed failed", description: res.error, variant: "destructive" });
        }
      })
      .finally(() => setRunningStage(null));
  };

  const runFinalCheck = () => {
    setRunningStage("final-check");
    runFinalIndexCheckAction(articleId, { forceRefresh: true })
      .then((res) => {
        if (res.ok && res.inspection) {
          setInspection({
            verdict: res.inspection.verdict,
            coverageState: res.inspection.coverageState,
            indexingState: res.inspection.indexingState,
            inspectedAt: res.inspection.inspectedAt.toISOString(),
            isFresh: true,
          });
          const friendly = friendlyVerdictToast(res.inspection.verdict);
          toast({ title: friendly.title, description: friendly.description });
        } else {
          toast({
            title: "Couldn't reach Google",
            description: res.error ?? "Try again in a moment.",
            variant: "destructive",
          });
        }
      })
      .finally(() => setRunningStage(null));
  };

  // Translate technical GSC verdicts into plain language for the toast.
  function friendlyVerdictToast(verdict: string | null): { title: string; description: string } {
    switch (verdict) {
      case "PASS":
        return {
          title: "✅ Page is on Google",
          description: "Google has indexed this page — it can appear in search results.",
        };
      case "NEUTRAL":
        return {
          title: "⚠️ Page is healthy but not indexed yet",
          description: "Google fetched it without errors but hasn't added it to search results. Use Stage 14 below to ask Google to index it.",
        };
      case "FAIL":
        return {
          title: "❌ Google found a problem",
          description: "There's a blocker preventing indexing. Check Stage 13 details and fix the issue.",
        };
      case "PARTIAL":
        return {
          title: "⚠️ Partial result",
          description: "Some checks passed and some didn't — review Stage 13 details.",
        };
      default:
        return {
          title: "Final check done",
          description: "Google's response didn't match a known status. See details below.",
        };
    }
  }

  const checkResults = validation
    ? validation.checks.map((c) => ({ id: c.id, passed: c.passed, severity: c.severity }))
    : null;

  const stageStates = PIPELINE_STAGES.map((stage) => {
    let summary = summarizeStage(stage, checkResults);
    if (stage.key === "performance") {
      // Prefer CrUX field data (real users) over PSI lab data when available.
      const source = crux ?? pageSpeed;
      if (source) {
        const lcpOk = (crux?.lcp?.rating ?? pageSpeed?.lcp?.rating) === "good";
        const clsOk = (crux?.cls?.rating ?? pageSpeed?.cls?.rating) === "good";
        const inpOk = crux
          ? crux.inp?.rating === "good"
          : pageSpeed?.inp?.rating === "good" || pageSpeed?.fid?.rating === "good";
        const passes = [lcpOk, clsOk, inpOk].filter(Boolean).length;
        const total = 3;
        summary = {
          status: passes === total ? "ready" : passes >= 2 ? "warnings" : "critical",
          passed: passes,
          failed: total - passes,
          total,
          hasCritical: passes < 2,
        };
      } else {
        summary = { status: "not-run", passed: 0, failed: 0, total: 3, hasCritical: false };
      }
    }
    if (stage.key === "final-check") {
      if (inspection) {
        const isPass = inspection.verdict === "PASS";
        summary = {
          status: isPass ? "ready" : "critical",
          passed: isPass ? 1 : 0,
          failed: isPass ? 0 : 1,
          total: 1,
          hasCritical: !isPass,
        };
      } else {
        summary = { status: "not-run", passed: 0, failed: 0, total: 1, hasCritical: false };
      }
    }
    return { stage, summary };
  });

  const allCriticalReady = stageStates.every(({ stage, summary }) => {
    if (stage.placeholder) return true;
    return summary.status === "ready";
  });

  return (
    <div className="space-y-4">
      {(() => {
        const auditDone = validation !== null;
        const speedDone = pageSpeed !== null;
        const askGoogleReady = auditDone && speedDone;
        const askGoogleDisabledReason = !auditDone && !speedDone
          ? "Run Step 1 + Step 2 first"
          : !auditDone
            ? "Run Step 1 first (Audit the page)"
            : !speedDone
              ? "Run Step 2 first (Check page speed)"
              : "";

        return (
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-sm">Run the checks (in order)</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Run Steps 1 and 2 first to find any local issues. Step 3 (Ask Google) uses your daily Google API quota — don&apos;t spend it until the page is clean.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {/* Step 1 — Audit */}
              <RunStepButton
                stepNumber={1}
                done={auditDone}
                running={runningStage === "html"}
                disabled={runningStage !== null}
                onClick={runHtmlStages}
                tone="violet"
                icon={<Play className="h-3.5 w-3.5" />}
                label="Audit the page"
                subtitle="HTML, schema, links, sitemap"
                description="Free · runs locally · no API cost"
              />

              {/* Step 2 — Speed */}
              <RunStepButton
                stepNumber={2}
                done={speedDone}
                running={runningStage === "performance"}
                disabled={runningStage !== null}
                onClick={runPageSpeed}
                tone="amber"
                icon={<Gauge className="h-3.5 w-3.5" />}
                label="Check page speed"
                subtitle="Core Web Vitals (LCP, CLS, INP)"
                description="Uses PageSpeed quota (cached 1h)"
              />

              {/* Step 3 — Ask Google (gated) */}
              <RunStepButton
                stepNumber={3}
                done={inspection !== null && inspection.isFresh}
                running={runningStage === "final-check"}
                disabled={runningStage !== null || !askGoogleReady}
                onClick={runFinalCheck}
                tone="blue"
                icon={<RotateCw className="h-3.5 w-3.5" />}
                label="Ask Google"
                subtitle="Search Console URL Inspection"
                description={
                  askGoogleReady
                    ? "Costs 1 of 2,000/day URL Inspection quota"
                    : `🔒 ${askGoogleDisabledReason}`
                }
                locked={!askGoogleReady}
              />
            </div>
          </div>
        );
      })()}

      <div className="space-y-2">
        {stageStates.map(({ stage, summary }) => (
          <StageCard
            key={stage.key}
            stage={stage}
            summary={summary}
            checks={
              checkResults && !stage.placeholder && stage.key !== "final-check" && stage.key !== "performance"
                ? validation!.checks.filter((c) => stage.checkIds.includes(c.id))
                : null
            }
            inspection={stage.key === "final-check" ? inspection : null}
            pageSpeed={stage.key === "performance" ? pageSpeed : null}
            crux={stage.key === "performance" ? crux : null}
            cruxError={stage.key === "performance" ? cruxError : null}
            articleId={articleId}
            onAutoFix={runHtmlStages}
            onViewDetails={(s, sum, ch) => setDetailsStage({ stage: s, summary: sum, checks: ch })}
          />
        ))}
      </div>

      <div
        className={`rounded-lg border-2 p-5 ${
          allCriticalReady
            ? "border-emerald-500/40 bg-emerald-500/5"
            : "border-dashed border-muted-foreground/30 bg-muted/20"
        }`}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Stage 14: Request Indexing
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {allCriticalReady
                ? "All quality gates passed. Click below to open Google Search Console URL Inspection — paste the URL, click 'Request Indexing', then come back and Mark done."
                : "Locked until all 13 stages return ✓ ready. Fix the issues above first."}
            </p>
          </div>
          {allCriticalReady ? (
            <SeoRowAction url={articleUrl} action="index" size="md" trackState={indexingTrackState} />
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium opacity-50 cursor-not-allowed"
            >
              <Lock className="h-4 w-4" />
              Locked
            </button>
          )}
        </div>
      </div>

      <StageDetailsDialog
        open={detailsStage !== null}
        onOpenChange={(open) => !open && setDetailsStage(null)}
        stage={detailsStage?.stage ?? null}
        summary={detailsStage?.summary ?? null}
        checks={detailsStage?.checks ?? []}
      />
    </div>
  );
}

function StageCard({
  stage,
  summary,
  checks,
  inspection,
  pageSpeed,
  crux,
  cruxError,
  articleId,
  onAutoFix,
  onViewDetails,
}: {
  stage: StageDefinition;
  summary: StageStatusSummary;
  checks: ValidationCheck[] | null;
  inspection: CachedInspection | null;
  pageSpeed: PageSpeedReport | null;
  crux: CruxReport | null;
  cruxError: string | null;
  articleId: string;
  onAutoFix: () => void;
  onViewDetails: (
    stage: StageDefinition,
    summary: StageStatusSummary,
    checks: ValidationCheck[],
  ) => void;
}) {
  const showAutoFix =
    stage.key === "schema" &&
    (summary.status === "warnings" || summary.status === "critical");
  const showSchemaTools = stage.key === "schema";
  const showDetailsButton =
    !stage.placeholder &&
    stage.key !== "schema" &&
    stage.key !== "performance" &&
    stage.key !== "final-check" &&
    checks !== null &&
    checks.length > 0 &&
    (summary.status === "warnings" || summary.status === "critical");

  const statusBadge = (() => {
    switch (summary.status) {
      case "ready":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
            <CheckCircle2 className="h-3 w-3" />
            READY
          </span>
        );
      case "warnings":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">
            <AlertTriangle className="h-3 w-3" />
            WARNINGS
          </span>
        );
      case "critical":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/20 text-[10px] font-bold">
            <XCircle className="h-3 w-3" />
            CRITICAL
          </span>
        );
      case "placeholder":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/20 text-[10px] font-bold">
            COMING SOON
          </span>
        );
      case "locked":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border text-[10px] font-bold">
            <Lock className="h-3 w-3" />
            LOCKED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border text-[10px] font-bold">
            NOT RUN
          </span>
        );
    }
  })();

  const borderColor = (() => {
    switch (summary.status) {
      case "ready":
        return "border-emerald-500/30 bg-emerald-500/5";
      case "warnings":
        return "border-amber-500/30 bg-amber-500/5";
      case "critical":
        return "border-red-500/30 bg-red-500/5";
      case "placeholder":
        return "border-slate-500/20 bg-slate-500/5 opacity-70";
      default:
        return "border-border";
    }
  })();

  // Show inline checks ONLY for the schema stage (which uses inline + auto-fix).
  // Other failing stages use the dialog (View details button).
  const showHtmlChecks =
    !stage.placeholder &&
    stage.key === "schema" &&
    (summary.status === "warnings" || summary.status === "critical");

  return (
    <div className={`rounded-lg border ${borderColor}`}>
      <div className="flex items-center justify-between gap-3 px-4 py-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tabular-nums text-muted-foreground w-5">{stage.id}.</span>
            <span className="text-foreground/80">{STAGE_ICONS[stage.key] ?? null}</span>
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm">{stage.name}</div>
            <div className="text-xs text-muted-foreground line-clamp-1">{stage.description}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showDetailsButton && checks && (
            <button
              type="button"
              onClick={() => onViewDetails(stage, summary, checks)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 text-[11px] font-medium"
            >
              View details
            </button>
          )}
          {!stage.placeholder && summary.total > 0 && summary.status !== "not-run" && (
            <span className="text-xs tabular-nums text-muted-foreground">
              {summary.passed}/{summary.total}
            </span>
          )}
          {statusBadge}
        </div>
      </div>

      {showHtmlChecks && checks && checks.length > 0 && (
        <div className="border-t px-4 py-3 space-y-2">
          {checks.map((c) => (
            <div key={c.id} className="flex items-start gap-2 text-xs">
              {c.passed ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle
                  className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${
                    c.severity === "critical" ? "text-red-500" : "text-amber-500"
                  }`}
                />
              )}
              <div className="flex-1 min-w-0 space-y-1">
                <div className={c.passed ? "text-muted-foreground" : "font-medium"}>{c.label}</div>
                {c.detail && <div className="text-[10px] text-muted-foreground">{c.detail}</div>}
                {!c.passed && c.fix && (
                  <div className="text-[10px] flex items-start gap-1.5 px-2 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">
                    <span className="font-bold shrink-0">💡 How to fix:</span>
                    <span>{c.fix}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {showAutoFix && (
            <div className="flex items-center justify-between gap-2 pt-2 border-t mt-2">
              <p className="text-[10px] text-muted-foreground italic">
                Schema is auto-generated from article data. Click to regenerate the cached JSON-LD now.
              </p>
              <AutoFixSchemaButton articleId={articleId} onSuccess={onAutoFix} />
            </div>
          )}
        </div>
      )}

      {showSchemaTools && (
        <div className="border-t px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
          <p className="text-[10px] text-muted-foreground italic">
            Inspect the cached JSON-LD against schema.org (read-only — does not modify the article).
          </p>
          <ViewSchemaValidationButton articleId={articleId} />
        </div>
      )}

      {stage.key === "performance" && pageSpeed && (
        <div className="border-t px-4 py-3 space-y-4">
          {/* Field data (CrUX) — what Google ACTUALLY uses for ranking */}
          {crux ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    🌍 Field Data (real users · 28-day window)
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {crux.scope === "url" ? "URL-level data" : "Origin-level (URL has low traffic)"} · what Google ranks on
                  </div>
                </div>
                {crux.collectionPeriod && (
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {crux.collectionPeriod.firstDate} → {crux.collectionPeriod.lastDate}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <CwvBox label="LCP" rating={crux.lcp?.rating ?? null} value={formatMs(crux.lcp?.p75)} target="≤ 2.5s" />
                <CwvBox label="CLS" rating={crux.cls?.rating ?? null} value={crux.cls?.p75.toFixed(3) ?? "—"} target="≤ 0.1" />
                <CwvBox label="INP" rating={crux.inp?.rating ?? null} value={formatMs(crux.inp?.p75)} target="≤ 200ms" />
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-amber-700 dark:text-amber-400 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                ℹ️ No Field Data Yet — Here&apos;s Why
              </div>
              {cruxError ? (
                <div className="text-amber-800 dark:text-amber-300">{cruxError}</div>
              ) : (
                <>
                  <p className="text-foreground/80 leading-relaxed">
                    This is <strong>not an SEO problem.</strong> modonty.com is indexed by Google ✅ (you can see indexed URLs in the Coverage card on /search-console). What&apos;s missing is something different called <strong>CrUX (Chrome UX Report)</strong>.
                  </p>
                  <div className="rounded-md bg-amber-500/10 px-3 py-2 space-y-1.5">
                    <div className="font-bold text-[11px] uppercase tracking-wide">What is CrUX?</div>
                    <p className="text-foreground/80 leading-relaxed">
                      Google&apos;s public dataset that collects <strong>real-user performance metrics</strong> from Chrome browsers (with telemetry opt-in). It powers Core Web Vitals scoring used in ranking.
                    </p>
                  </div>
                  <div className="rounded-md bg-amber-500/10 px-3 py-2 space-y-1.5">
                    <div className="font-bold text-[11px] uppercase tracking-wide">Why no data?</div>
                    <p className="text-foreground/80 leading-relaxed">
                      CrUX requires a <strong>minimum number of unique Chrome visitors</strong> over a 28-day rolling window — typically a few hundred per day. New or low-traffic sites simply don&apos;t cross that threshold yet.
                    </p>
                  </div>
                  <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 space-y-1.5 text-emerald-700 dark:text-emerald-400">
                    <div className="font-bold text-[11px] uppercase tracking-wide">What happens automatically</div>
                    <p className="leading-relaxed">
                      Once traffic grows, Field Data will appear here on its own — <strong>no code changes required</strong>. Until then, <strong>Lab Data below</strong> is your reliable source for diagnosing performance issues.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Lab data (PSI) — diagnostic, varies between runs */}
          <div className="space-y-2 pt-2 border-t border-dashed">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-muted-foreground">
                  🔬 Lab Data (PSI simulation · diagnostic only)
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Single simulated run · ~10-15% variance · use for debugging fixes, not for ranking signals
                </div>
              </div>
              <span className="text-sm font-extrabold tabular-nums">
                {pageSpeed.performanceScore}
                <span className="text-[10px] text-muted-foreground font-normal">/100</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <CwvBox label="LCP" rating={pageSpeed.lcp?.rating ?? null} value={formatMs(pageSpeed.lcp?.value)} target="≤ 2.5s" />
              <CwvBox label="CLS" rating={pageSpeed.cls?.rating ?? null} value={pageSpeed.cls?.value.toFixed(3) ?? "—"} target="≤ 0.1" />
              <CwvBox
                label="INP"
                rating={pageSpeed.inp?.rating ?? pageSpeed.fid?.rating ?? null}
                value={formatMs(pageSpeed.inp?.value ?? pageSpeed.fid?.value)}
                target="≤ 200ms"
              />
            </div>
          </div>

          {/* Element identification — tells admin if the issue is article content or template */}
          {(pageSpeed.lcpElement || pageSpeed.clsElements.length > 0) && (
            <div className="space-y-2 pt-2 border-t border-dashed">
              <div className="text-xs font-bold text-muted-foreground">
                🎯 Which elements are causing this?
              </div>
              {pageSpeed.lcpElement && (
                <ElementBox label="LCP element (largest visible)" element={pageSpeed.lcpElement} />
              )}
              {pageSpeed.clsElements.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground">
                    CLS-causing elements ({pageSpeed.clsElements.length}):
                  </div>
                  {pageSpeed.clsElements.map((el, i) => (
                    <ElementBox key={i} label={`#${i + 1}`} element={el} compact />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Fix hints based on the SOURCE OF TRUTH (Field if available, else Lab) */}
          {((crux?.lcp?.rating ?? pageSpeed.lcp?.rating) ?? "good") !== "good" && (
            <CwvFix
              metric="LCP"
              fix="Optimize the hero/featured image: add `priority` to next/image, use modern format (WebP/AVIF), keep size <200KB, set explicit width/height. Defer non-critical scripts."
            />
          )}
          {((crux?.cls?.rating ?? pageSpeed.cls?.rating) ?? "good") !== "good" && (
            <CwvFix
              metric="CLS"
              fix="Reserve space for late-loading content: set width/height on all <img>/<iframe>, avoid injecting content above existing content, preload web fonts to prevent FOIT shift."
            />
          )}
          {((crux?.inp?.rating ?? pageSpeed.inp?.rating) ?? "good") !== "good" && (
            <CwvFix
              metric="INP"
              fix="Reduce JS execution on interaction: use ssr:false dynamic imports for heavy widgets, avoid long-running event handlers, defer analytics with strategy='lazyOnload'."
            />
          )}
        </div>
      )}

      {stage.key === "final-check" && inspection && (
        <div className="border-t px-4 py-3 text-xs space-y-3">
          {/* Google's answer — plain English */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Google&apos;s Answer
            </div>
            <FriendlyVerdict verdict={inspection.verdict} />
          </div>

          {/* Where it stands now */}
          {inspection.coverageState && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Where this URL stands
              </div>
              <FriendlyCoverage state={inspection.coverageState} />
            </div>
          )}

          {/* Can it be indexed? */}
          {inspection.indexingState && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Can Google add it to search?
              </div>
              <FriendlyIndexing state={inspection.indexingState} />
            </div>
          )}

          <div className="flex justify-between text-[10px] text-muted-foreground pt-2 border-t">
            <span>Last checked</span>
            <span>{new Date(inspection.inspectedAt).toLocaleString("en-US")}</span>
          </div>

          {inspection.verdict !== "PASS" && (
            <div className="text-[11px] flex items-start gap-1.5 px-3 py-2 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">
              <span className="font-bold shrink-0">💡 What to do:</span>
              <span>
                {inspection.verdict === "NEUTRAL"
                  ? "Google hasn't visited this page yet. Click Request Indexing below to send it to Google — it will check the page and update this status."
                  : "Fix any issues from the earlier checks, then click Ask Google again. The status will update with Google's new answer."}
              </span>
            </div>
          )}
        </div>
      )}

      {stage.placeholder && (
        <div className="border-t px-4 py-2 text-[11px] text-muted-foreground italic">
          Implementation pending — this stage will be enabled in a future update.
        </div>
      )}
    </div>
  );
}

function RunStepButton({
  stepNumber,
  done,
  running,
  disabled,
  onClick,
  tone,
  icon,
  label,
  subtitle,
  description,
  locked,
}: {
  stepNumber: number;
  done: boolean;
  running: boolean;
  disabled: boolean;
  onClick: () => void;
  tone: "violet" | "amber" | "blue";
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  description: string;
  locked?: boolean;
}) {
  const baseToneCls =
    tone === "violet"
      ? "bg-violet-600 hover:bg-violet-700 text-white border-violet-600"
      : tone === "amber"
        ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
        : "bg-blue-600 hover:bg-blue-700 text-white border-blue-600";

  const stateCls = locked
    ? "border-dashed border-muted-foreground/30 bg-muted/30 text-muted-foreground cursor-not-allowed"
    : disabled
      ? `${baseToneCls} opacity-50 cursor-not-allowed`
      : baseToneCls;

  const numberBadge = done ? (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
      ✓
    </span>
  ) : locked ? (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted-foreground/20 text-muted-foreground text-[10px] font-bold">
      <Lock className="h-2.5 w-2.5" />
    </span>
  ) : (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-current text-[10px] font-bold">
      {stepNumber}
    </span>
  );

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-start gap-1.5 px-3 py-2.5 rounded-md border-2 text-left transition-colors disabled:cursor-not-allowed ${stateCls}`}
    >
      <div className="flex items-center justify-between w-full gap-2">
        <div className="flex items-center gap-2">
          {numberBadge}
          {running ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            icon
          )}
          <span className="font-bold text-xs">{label}</span>
        </div>
        {done && !running && (
          <span className="text-[9px] uppercase font-bold opacity-80">Done</span>
        )}
      </div>
      <div className="text-[10px] opacity-80 leading-tight">{subtitle}</div>
      <div className="text-[10px] opacity-70 leading-tight">{description}</div>
    </button>
  );
}

/** Translate Google's technical verdict codes into plain English with an icon. */
function FriendlyVerdict({ verdict }: { verdict: string | null }) {
  const config = (() => {
    switch (verdict) {
      case "PASS":
        return {
          icon: "✅",
          title: "All good — Google likes this page",
          description: "The page is healthy and indexed in search results.",
          tone: "emerald",
        };
      case "FAIL":
        return {
          icon: "❌",
          title: "Has issues — Google won't index it",
          description: "Something is preventing Google from adding this page to search. Fix the issues below.",
          tone: "red",
        };
      case "PARTIAL":
        return {
          icon: "⚠️",
          title: "Mostly okay — but has small issues",
          description: "The page is in search, but some checks failed (often mobile usability). Worth fixing.",
          tone: "amber",
        };
      case "NEUTRAL":
        return {
          icon: "🟡",
          title: "Not checked yet by Google",
          description: "Google hasn't visited this page yet. Send it via Stage 14 below — Google will check it within hours/days.",
          tone: "amber",
        };
      default:
        return {
          icon: "⚪",
          title: "Unknown — try Run stage 13 again",
          description: "We couldn't get a clear answer from Google. Try refreshing the check.",
          tone: "slate",
        };
    }
  })();

  const cls =
    config.tone === "emerald"
      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
      : config.tone === "red"
        ? "border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-400"
        : config.tone === "amber"
          ? "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400"
          : "border-slate-500/20 bg-slate-500/5 text-slate-700 dark:text-slate-400";

  return (
    <div className={`rounded-md border ${cls} px-3 py-2 space-y-0.5`}>
      <div className="font-bold text-sm">
        {config.icon} {config.title}
      </div>
      <div className="text-[11px] opacity-90 leading-relaxed">{config.description}</div>
    </div>
  );
}

/** Translate Google's coverage states into plain English. */
function FriendlyCoverage({ state }: { state: string }) {
  const lower = state.toLowerCase();
  const friendly = (() => {
    if (lower.includes("submitted") && lower.includes("indexed")) {
      return { icon: "✅", text: "Live in Google search results", tone: "emerald" };
    }
    if (lower.includes("crawled") && lower.includes("not indexed")) {
      return {
        icon: "❌",
        text: "Google saw the page but chose not to add it to search",
        tone: "red",
      };
    }
    if (lower.includes("discovered") && lower.includes("not indexed")) {
      return {
        icon: "⏳",
        text: "Google knows the URL exists but hasn't visited it yet",
        tone: "amber",
      };
    }
    if (lower.includes("redirect")) {
      return { icon: "↪️", text: "This URL redirects to another address", tone: "amber" };
    }
    if (lower.includes("soft 404")) {
      return { icon: "⚠️", text: "Looks like an empty/missing page (Soft 404)", tone: "red" };
    }
    if (lower.includes("not found") || lower.includes("404")) {
      return { icon: "❌", text: "Page not found (404)", tone: "red" };
    }
    if (lower.includes("blocked")) {
      return { icon: "🚫", text: "Blocked from Google", tone: "red" };
    }
    if (lower.includes("لم يتعرّف") || lower.includes("not recognize")) {
      return { icon: "🔍", text: "Google has not discovered this URL yet", tone: "amber" };
    }
    return { icon: "ℹ️", text: state, tone: "slate" };
  })();

  const cls =
    friendly.tone === "emerald"
      ? "text-emerald-700 dark:text-emerald-400"
      : friendly.tone === "red"
        ? "text-red-700 dark:text-red-400"
        : friendly.tone === "amber"
          ? "text-amber-700 dark:text-amber-400"
          : "text-foreground";

  return (
    <div className={`text-xs ${cls}`}>
      <span className="me-1">{friendly.icon}</span>
      {friendly.text}
    </div>
  );
}

/** Translate Google's indexing state codes into plain English. */
function FriendlyIndexing({ state }: { state: string }) {
  const friendly = (() => {
    switch (state) {
      case "INDEXING_ALLOWED":
        return { icon: "✅", text: "Yes — Google can add this page to search", tone: "emerald" };
      case "BLOCKED_BY_META_TAG":
        return {
          icon: "🚫",
          text: "No — blocked by a noindex meta tag in your code",
          tone: "red",
        };
      case "BLOCKED_BY_HTTP_HEADER":
        return {
          icon: "🚫",
          text: "No — blocked by an X-Robots-Tag HTTP header",
          tone: "red",
        };
      case "BLOCKED_BY_ROBOTS_TXT":
        return { icon: "🚫", text: "No — blocked by robots.txt", tone: "red" };
      case "INDEXING_STATE_UNSPECIFIED":
        return {
          icon: "🟡",
          text: "Status not yet known (Google hasn't fully evaluated)",
          tone: "amber",
        };
      default:
        return { icon: "ℹ️", text: state, tone: "slate" };
    }
  })();

  const cls =
    friendly.tone === "emerald"
      ? "text-emerald-700 dark:text-emerald-400"
      : friendly.tone === "red"
        ? "text-red-700 dark:text-red-400"
        : friendly.tone === "amber"
          ? "text-amber-700 dark:text-amber-400"
          : "text-foreground";

  return (
    <div className={`text-xs ${cls}`}>
      <span className="me-1">{friendly.icon}</span>
      {friendly.text}
    </div>
  );
}

function ElementBox({
  label,
  element,
  compact,
}: {
  label: string;
  element: ElementDetail;
  compact?: boolean;
}) {
  const scopeBadge =
    element.scope === "article"
      ? { text: "ARTICLE", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" }
      : element.scope === "template"
        ? { text: "TEMPLATE", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20" }
        : { text: "UNKNOWN", cls: "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20" };
  return (
    <div className={`rounded-md border bg-muted/20 ${compact ? "px-2 py-1.5" : "px-3 py-2"} space-y-1`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wide">{label}</span>
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full border text-[9px] font-bold ${scopeBadge.cls}`}>
          {scopeBadge.text}
        </span>
      </div>
      {element.selector && (
        <div className="font-mono text-[10px] text-blue-600 dark:text-blue-400 break-all" dir="ltr">
          {element.selector}
        </div>
      )}
      {element.snippet && (
        <div className="font-mono text-[10px] text-muted-foreground break-all line-clamp-2" dir="ltr">
          {element.snippet}
        </div>
      )}
    </div>
  );
}

function CwvFix({ metric, fix }: { metric: string; fix: string }) {
  return (
    <div className="text-[10px] flex items-start gap-1.5 px-2 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">
      <span className="font-bold shrink-0">💡 Fix {metric}:</span>
      <span>{fix}</span>
    </div>
  );
}

function CwvBox({
  label,
  rating,
  value,
  target,
}: {
  label: string;
  rating: CWVRating | null;
  value: string;
  target: string;
}) {
  const tone = rating === "good" ? "emerald" : rating === "needs-improvement" ? "amber" : "red";
  const cls =
    tone === "emerald"
      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
      : tone === "amber"
        ? "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400"
        : "border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-400";
  return (
    <div className={`rounded-md border p-2 text-center ${cls}`}>
      <div className="text-[10px] font-bold uppercase tracking-wide opacity-80">{label}</div>
      <div className="text-lg font-extrabold tabular-nums leading-tight">{value}</div>
      <div className="text-[10px] opacity-70">{target}</div>
    </div>
  );
}

function formatMs(value: number | undefined): string {
  if (value === undefined) return "—";
  if (value >= 1000) return `${(value / 1000).toFixed(2)}s`;
  return `${Math.round(value)}ms`;
}
