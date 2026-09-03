import { Bug, Lightbulb, MessageCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FeedbackRow } from "../helpers/get-feedback";

const TYPE_META: Record<string, { icon: typeof Bug; label: string; tone: string }> = {
  bug: { icon: Bug, label: "Bug", tone: "text-red-600 dark:text-red-400" },
  idea: { icon: Lightbulb, label: "Idea", tone: "text-blue-600 dark:text-blue-400" },
  other: { icon: MessageCircle, label: "Other", tone: "text-muted-foreground" },
};

// Severity is written by the sender and only ever carries these three values (see the
// dialog's SEVERITIES). An unknown value renders as plain text rather than being dropped —
// a report whose severity we cannot colour is still a report.
const SEVERITY_TONE: Record<string, string> = {
  critical: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
  bug: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  minor: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

const fmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  timeZone: "Asia/Riyadh",
});

export function FeedbackList({ rows }: { rows: FeedbackRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <MessageCircle className="mx-auto mb-3 size-8 text-muted-foreground" aria-hidden />
        <p className="text-sm font-medium">No feedback yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Anything sent from the button above lands here.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((r) => {
        const meta = TYPE_META[r.type ?? "other"] ?? TYPE_META.other;
        const Icon = meta.icon;
        return (
          <li key={r.id} className="rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Icon className={cn("size-4", meta.tone)} aria-hidden />
              <span className="font-medium">{meta.label}</span>
              <span className="text-muted-foreground">·</span>
              <span className="font-medium">{r.author}</span>
              {r.app && <Badge variant="secondary" className="text-[10px] uppercase">{r.app}</Badge>}
              {r.severity && (
                <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", SEVERITY_TONE[r.severity] ?? "")}>
                  {r.severity}
                </span>
              )}
              <span className="ms-auto text-muted-foreground">{fmt.format(r.createdAt)}</span>
            </div>

            {r.whereExactly && (
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium">Where:</span> {r.whereExactly}
              </p>
            )}

            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{r.message}</p>

            {r.steps && (
              <pre className="mt-3 overflow-x-auto rounded-md bg-muted/50 p-3 font-mono text-[11px] leading-relaxed">
                {r.steps}
              </pre>
            )}
            {r.benefit && (
              <p className="mt-3 rounded-md bg-blue-500/10 p-3 text-xs leading-relaxed">
                <span className="font-medium">Why it helps:</span> {r.benefit}
              </p>
            )}

            {(r.page || r.replyCount > 0) && (
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                {r.page && <code className="rounded bg-muted px-1.5 py-0.5">{r.page}</code>}
                {r.replyCount > 0 && <span>{r.replyCount} repl{r.replyCount === 1 ? "y" : "ies"}</span>}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
