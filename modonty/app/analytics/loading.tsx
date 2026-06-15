export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <div className="mb-8 h-9 w-56 animate-pulse rounded bg-muted" />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border bg-muted/40" />
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
