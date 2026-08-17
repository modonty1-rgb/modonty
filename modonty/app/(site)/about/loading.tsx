export default function AboutLoading() {
  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="h-72 animate-pulse rounded-2xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
