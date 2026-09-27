/**
 * One labelled row of filter pills in an «Advanced Table» header: the label in its own
 * column, the pills wrapping inside theirs — a wrapped pill lines up under the pills.
 */
export function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-start gap-2" role="group" aria-label={label}>
      <span className="pt-1.5 text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}
