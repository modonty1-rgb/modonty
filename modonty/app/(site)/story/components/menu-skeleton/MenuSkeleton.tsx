/** The chapter menu's placeholder while the manifest loads. */
export function MenuSkeleton() {
  return (
    <div className="space-y-3" aria-label="جارٍ التحميل" role="status">
      {[0, 1, 2].map((cat) => (
        <div key={cat} className="space-y-1.5">
          <div className="h-3 w-24 rounded bg-muted animate-pulse mb-2" />
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              className="h-9 rounded-lg bg-muted/60 animate-pulse"
              style={{ animationDelay: `${(cat * 3 + row) * 60}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
