/**
 * A titled group of facts in a detail card. `spread` lays them across the group's width
 * (`flex justify-between`) instead of packing them left — Khalid, 27 Sep 2026: «وزّع الأرقام».
 */
export function FactGroup({ title, children, spread }: { title: string; children: React.ReactNode; spread?: boolean }) {
  return (
    <div className="min-w-0 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">{title}</p>
      <dl className={spread ? "flex flex-wrap justify-between gap-x-4 gap-y-2" : "flex flex-wrap gap-x-6 gap-y-2"}>{children}</dl>
    </div>
  );
}
