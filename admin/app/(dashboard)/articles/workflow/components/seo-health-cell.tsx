import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { ValidationResult } from "@/lib/seo/article-validator";

interface Props {
  articleId: string;
  result: ValidationResult;
}

/**
 * SEO health pill — same size/shape as the Send for Approval button (sm).
 * Links to the dedicated Quality Check page.
 */
export function SeoHealthCell({ articleId, result }: Props) {
  const errors = result.failedCount;
  const ready = errors === 0;

  const tone = ready
    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20"
    : "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20";

  const Icon = ready ? CheckCircle2 : AlertCircle;

  // Name the actual problem on the list — admin shouldn't have to click in to
  // find out what's wrong. Show the first issue's plain-language description
  // (detail), falling back to the check name, + a "+N" when there's more.
  const firstIssue = result.checks.find((c) => !c.passed);
  const issueText = firstIssue?.detail || firstIssue?.label;
  const label = ready
    ? "Ready to send"
    : issueText
      ? `${issueText}${errors > 1 ? ` +${errors - 1} more` : ""}`
      : `${errors} to fix`;
  const hoverHint = ready
    ? "All checks passed — ready to send"
    : firstIssue
      ? `${firstIssue.label}: ${firstIssue.detail ?? ""}`.trim()
      : "Click to see what to fix";

  return (
    <Link
      href={`/articles/workflow/quality-check/${articleId}`}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md border h-8 px-3 text-xs font-medium transition-colors ${tone}`}
      title={hoverHint}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="max-w-[15rem] truncate">{label}</span>
    </Link>
  );
}
