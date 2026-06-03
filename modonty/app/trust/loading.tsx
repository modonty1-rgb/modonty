export default function TrustLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-4 h-4 w-40 animate-pulse rounded bg-muted" />
      <div className="space-y-4">
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="h-24 w-full animate-pulse bg-muted sm:h-28" />
          <div className="px-6 pb-6">
            <div className="-mt-10 h-20 w-20 animate-pulse rounded-2xl border-4 border-card bg-muted" />
            <div className="mt-4 h-6 w-48 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-muted" />
          </div>
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-40 w-full animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
