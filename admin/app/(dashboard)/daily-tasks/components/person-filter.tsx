"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

export interface PersonCount {
  key: string;
  name: string;
  total: number;
  late: number;
}

/**
 * The per-person chips ARE the table's filter — the admin entity standard's
 * first rule, and the one this screen shipped without: a row of counts you
 * cannot click is a label, not a control.
 *
 * Shape is `CountTab`: a two-part pill (label | count), "All" first with the
 * total, the active one inverted, and clicking the active one clears the filter.
 * State lives in the URL next to `date`, so a filtered day can be bookmarked and
 * sent to someone.
 *
 * One definition drives both halves: the number on a chip and the rows the table
 * shows come from the same grouping, so a chip can never promise a count the
 * table does not produce.
 */
export function PersonFilter({ people, total }: { people: PersonCount[]; total: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const active = params.get("person");

  const go = (key: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (key) next.set("person", key);
    else next.delete("person");
    const qs = next.toString();
    router.push(qs ? `/daily-tasks?${qs}` : "/daily-tasks");
  };

  const Pill = ({
    label,
    count,
    late,
    isActive,
    onClick,
  }: {
    label: string;
    count: number;
    late?: number;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        "inline-flex items-center overflow-hidden rounded-full border text-xs font-medium transition-colors",
        isActive ? "border-primary" : late ? "border-red-500/40 hover:bg-accent" : "border-border hover:bg-accent",
      )}
    >
      <span className={cn("px-2.5 py-1", isActive ? "bg-primary text-primary-foreground" : "text-foreground")}>
        {label}
      </span>
      <span
        className={cn(
          "border-s px-2 py-1 font-bold tabular-nums",
          isActive
            ? "border-primary-foreground/30 bg-primary-foreground text-primary"
            : "border-border bg-muted text-muted-foreground",
        )}
      >
        {count}
      </span>
      {!!late && (
        <span className="border-s border-red-500/30 bg-red-500/15 px-2 py-1 font-bold tabular-nums text-red-600 dark:text-red-400">
          {late} late
        </span>
      )}
    </button>
  );

  return (
    <div className="flex flex-wrap gap-1.5">
      <Pill label="All" count={total} isActive={!active} onClick={() => go(null)} />
      {people.map((p) => {
        const isActive = active === p.key;
        return (
          <Pill
            key={p.key}
            label={p.name}
            count={p.total}
            late={p.late}
            isActive={isActive}
            // Clicking the active chip clears the filter — the standard's rule,
            // and the only way out that does not need a second control.
            onClick={() => go(isActive ? null : p.key)}
          />
        );
      })}
    </div>
  );
}
