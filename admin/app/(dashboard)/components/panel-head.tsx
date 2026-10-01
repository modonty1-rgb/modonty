/**
 * The heading at the top of each dashboard tab: what the tab is, one line of context, and the
 * section's own page on the far side. Replaces the collapsible-section header now that the
 * sections are tabs (30 Sep 2026 redesign).
 */
export function PanelHead({ title, hint, right }: { title: string; hint?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b pb-2.5">
      <p className="text-sm font-extrabold">
        {title}
        {hint && <span className="ms-2 text-xs font-normal text-muted-foreground">{hint}</span>}
      </p>
      {right}
    </div>
  );
}
