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
  const label = ready ? "Ready to send" : `${errors} issue${errors === 1 ? "" : "s"} to fix`;

  return (
    <Link
      href={`/articles/workflow/quality-check/${articleId}`}
      className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border h-8 px-3 text-xs font-medium transition-colors ${tone}`}
      title="View quality check details"
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </Link>
  );
}
