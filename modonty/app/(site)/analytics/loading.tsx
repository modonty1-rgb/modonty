export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      {/* header: h1 · one intro line · the «live on Google» button — as `page.tsx` draws it. */}
      <div className="mb-8">
        <div className="h-9 w-56 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-muted/70" />
        <div className="mt-4 h-10 w-52 animate-pulse rounded-lg border bg-muted/40" />
      </div>
      {/* Five KPIs, `lg:grid-cols-5` — it drew eight in four columns until 24 Sep 2026. */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[88px] animate-pulse rounded-xl border bg-muted/40" />
        ))}
      </div>
      <div className="mb-6 h-44 animate-pulse rounded-xl border bg-muted/40" />
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl border bg-muted/40" />
        ))}
      </div>
    </main>
  );
}
