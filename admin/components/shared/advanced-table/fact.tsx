import { cn } from "@/lib/utils";

/**
 * One labelled figure in an «Advanced Table» detail card (see advanced-table-pattern memory).
 * `tone` colours the value by meaning; `dot` ties the label to its piece of a stage bar.
 */
export function Fact({
  label,
  value,
  hint,
  tone,
  dot,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: string;
  dot?: string;
}) {
  return (
    <div className="min-w-0" title={hint}>
      <dt className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {dot ? <span className={cn("size-2 shrink-0 rounded-full", dot)} aria-hidden /> : null}
        <span className="truncate">{label}</span>
      </dt>
      <dd className={cn("mt-0.5 text-base font-bold tabular-nums leading-tight", tone)}>{value}</dd>
    </div>
  );
}
