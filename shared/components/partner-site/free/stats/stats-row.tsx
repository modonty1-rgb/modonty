import type { HomeData } from "../home/home-data";

/** «أرقامنا» — a row of big numbers with small labels (Tailwind "stats"). Hairlines between, no cards. */
export function StatsRow({ data }: { data: HomeData; preview?: boolean }) {
  const items = data.stats.slice(0, 4);
  return (
    <section id="stats" className="border-y">
      <dl className="mx-auto grid max-w-[1128px] grid-cols-2 gap-y-8 px-6 py-12 sm:flex sm:divide-x sm:divide-x-reverse sm:divide-border">
        {items.map((s) => (
          <div key={s.label} className="px-4 text-center sm:flex-1 sm:px-6">
            <dd className="text-4xl font-bold tabular-nums text-primary">{s.value}</dd>
            <dt className="mt-1 text-sm text-muted-foreground">{s.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
