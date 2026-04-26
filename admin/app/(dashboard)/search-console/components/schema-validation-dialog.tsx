"use client";

import { Loader2, CheckCircle2, XCircle, AlertTriangle, Info, Code, ExternalLink } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import type { ValidationReport } from "@/lib/seo/jsonld-validator";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  report: ValidationReport | null;
  jsonLd: object | null;
  error: string | null;
}

export function SchemaValidationDialog({ open, onOpenChange, loading, report, jsonLd, error }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Code className="h-5 w-5 text-violet-500" />
            Schema.org Validation Report
          </DialogTitle>
          <DialogDescription>
            Read-only — runs the cached JSON-LD against{" "}
            <a
              href="https://schema.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline inline-flex items-center gap-0.5"
            >
              schema.org <ExternalLink className="h-3 w-3" />
            </a>{" "}
            via Adobe's official validator + AJV + custom rules. No changes saved.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {loading && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin inline-block me-2" />
              Validating against schema.org…
            </div>
          )}

          {!loading && error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-700 dark:text-red-400">
              <div className="font-bold mb-1 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Cannot run validation
              </div>
              <div className="text-xs">{error}</div>
            </div>
          )}

          {!loading && report && (
            <>
              <SummaryBanner report={report} />

              <ReportSection
                title="Adobe Validator (schema.org official)"
                subtitle="@adobe/structured-data-validator — same engine Google uses to validate Rich Results"
                tone={report.adobe.valid ? "good" : "bad"}
                errors={report.adobe.errors.map((e) => ({
                  message: e.message,
                  path: e.path,
                  property: e.property,
                  type: e.type,
                }))}
                warnings={report.adobe.warnings.map((w) => ({
                  message: w.message,
                  path: w.path,
                  property: w.property,
                  recommendation: w.recommendation,
                }))}
              />

              {report.ajv && (
                <ReportSection
                  title="AJV (JSON Schema structure)"
                  subtitle="Validates the document structure against JSON Schema definitions"
                  tone={report.ajv.valid ? "good" : "bad"}
                  errors={report.ajv.errors.map((m) => ({ message: m }))}
                  warnings={report.ajv.warnings.map((m) => ({ message: m }))}
                />
              )}

              {report.custom && (
                <ReportSection
                  title="Custom Rules (modonty)"
                  subtitle="Project-specific requirements (e.g., Arabic content fields, image dimensions)"
                  tone={report.custom.errors.length === 0 ? "good" : "bad"}
                  errors={report.custom.errors.map((m) => ({ message: m }))}
                  warnings={report.custom.warnings.map((m) => ({ message: m }))}
                  info={report.custom.info}
                />
              )}

              {jsonLd && (
                <details className="rounded-md border bg-muted/20">
                  <summary className="px-4 py-2 text-xs font-bold cursor-pointer hover:bg-muted/40">
                    Show raw JSON-LD that was validated
                  </summary>
                  <pre className="p-3 text-[10px] font-mono overflow-x-auto leading-relaxed">
                    {JSON.stringify(jsonLd, null, 2)}
                  </pre>
                </details>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SummaryBanner({ report }: { report: ValidationReport }) {
  const adobeErrors = report.adobe.errors.length;
  const adobeWarnings = report.adobe.warnings.length;
  const ajvErrors = report.ajv?.errors.length ?? 0;
  const ajvWarnings = report.ajv?.warnings.length ?? 0;
  const customErrors = report.custom?.errors.length ?? 0;
  const customWarnings = report.custom?.warnings.length ?? 0;

  const totalErrors = adobeErrors + ajvErrors + customErrors;
  const totalWarnings = adobeWarnings + ajvWarnings + customWarnings;

  const allClean = totalErrors === 0 && totalWarnings === 0;

  return (
    <div
      className={`rounded-md border p-4 ${
        allClean
          ? "border-emerald-500/30 bg-emerald-500/5"
          : totalErrors > 0
            ? "border-red-500/30 bg-red-500/5"
            : "border-amber-500/30 bg-amber-500/5"
      }`}
    >
      <div
        className={`flex items-center gap-2 font-bold ${
          allClean
            ? "text-emerald-600 dark:text-emerald-400"
            : totalErrors > 0
              ? "text-red-600 dark:text-red-400"
              : "text-amber-600 dark:text-amber-400"
        }`}
      >
        {allClean ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Schema is valid — passes schema.org and all checks
          </>
        ) : totalErrors > 0 ? (
          <>
            <XCircle className="h-4 w-4" />
            {totalErrors} error{totalErrors === 1 ? "" : "s"} · {totalWarnings} warning{totalWarnings === 1 ? "" : "s"}
          </>
        ) : (
          <>
            <AlertTriangle className="h-4 w-4" />
            {totalWarnings} warning{totalWarnings === 1 ? "" : "s"} (no errors)
          </>
        )}
      </div>
    </div>
  );
}

interface ReportItem {
  message: string;
  path?: string;
  property?: string;
  type?: string;
  recommendation?: string;
}

function ReportSection({
  title,
  subtitle,
  tone,
  errors,
  warnings,
  info,
}: {
  title: string;
  subtitle: string;
  tone: "good" | "bad";
  errors: ReportItem[];
  warnings: ReportItem[];
  info?: string[];
}) {
  return (
    <div className="rounded-md border">
      <div className="px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2 font-bold text-xs">
          {tone === "good" ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-red-500" />
          )}
          {title}
        </div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</div>
      </div>
      <div className="divide-y">
        {errors.length === 0 && warnings.length === 0 && (!info || info.length === 0) && (
          <div className="px-4 py-3 text-xs text-emerald-600 dark:text-emerald-400 italic">
            No errors or warnings — all checks passed.
          </div>
        )}
        {errors.map((e, i) => (
          <ItemRow key={`e${i}`} item={e} severity="error" />
        ))}
        {warnings.map((w, i) => (
          <ItemRow key={`w${i}`} item={w} severity="warning" />
        ))}
        {info?.map((m, i) => (
          <ItemRow key={`i${i}`} item={{ message: m }} severity="info" />
        ))}
      </div>
    </div>
  );
}

function ItemRow({ item, severity }: { item: ReportItem; severity: "error" | "warning" | "info" }) {
  const icon =
    severity === "error" ? (
      <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
    ) : severity === "warning" ? (
      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
    ) : (
      <Info className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
    );

  return (
    <div className="px-4 py-2 flex items-start gap-2 text-xs">
      {icon}
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="font-medium">{item.message}</div>
        {(item.path || item.property || item.type) && (
          <div className="text-[10px] text-muted-foreground font-mono space-x-2">
            {item.property && <span>property: <strong>{item.property}</strong></span>}
            {item.path && <span>path: <strong>{item.path}</strong></span>}
            {item.type && <span>type: <strong>{item.type}</strong></span>}
          </div>
        )}
        {item.recommendation && (
          <div className="text-[10px] text-muted-foreground italic">→ {item.recommendation}</div>
        )}
      </div>
    </div>
  );
}
