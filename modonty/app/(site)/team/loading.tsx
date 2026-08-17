/** Mirrors the real layout: breadcrumb → title → one section heading → a 3-up row of 4:5 cards. */
export default function TeamLoading() {
  return (
    <div className="container mx-auto max-w-4xl space-y-10 px-4 py-6 sm:py-8">
      <div className="h-4 w-40 animate-pulse rounded bg-muted" />
      <div className="space-y-3">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-5 w-full max-w-2xl animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-4">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg ring-1 ring-border">
              <div className="aspect-[4/5] animate-pulse bg-muted" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
