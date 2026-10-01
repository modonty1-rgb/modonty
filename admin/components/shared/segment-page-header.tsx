import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * The header of every dashboard drill-down page (client · article · media · reference
 * segments): what this list is, why it matters, and the way back. It was the same block
 * copied into four pages in English; one Arabic copy now (1 Oct 2026 — the dashboard went
 * Arabic, and the page a number opens has to speak the same language).
 */
export function SegmentPageHeader({ title, description, count }: { title: string; description: string; count?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="flex items-baseline gap-2 text-2xl font-bold leading-tight">
          {title}
          {count && <span className="text-base font-bold tabular-nums text-muted-foreground">{count}</span>}
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <Link
        href="/"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted"
      >
        <ArrowRight className="size-4" aria-hidden />
        لوحة التحكم
      </Link>
    </div>
  );
}
