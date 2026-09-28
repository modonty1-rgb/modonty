import { Fragment } from "react";

/**
 * The card under an opened row: its own surface (not the row's tint), groups side by side
 * with a thin rule between them, and an optional footer (a stage bar, action links).
 * `columns` is the lg grid template — one `1px` track per rule, e.g.
 * `lg:grid-cols-[auto_1px_minmax(0,1fr)_1px_auto]`.
 */
export function DetailCard({
  groups,
  columns,
  footer,
}: {
  groups: React.ReactNode[];
  columns: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="ms-8 space-y-3 rounded-md border bg-card p-3 shadow-sm">
      <div className={`grid gap-4 lg:items-start ${columns}`}>
        {groups.map((g, i) => (
          <Fragment key={i}>
            {i > 0 ? <div className="hidden h-full bg-border lg:block" aria-hidden /> : null}
            {g}
          </Fragment>
        ))}
      </div>
      {footer}
    </div>
  );
}
