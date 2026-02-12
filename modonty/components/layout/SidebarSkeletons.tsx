export function LeftSidebarSkeleton() {
  return (
    <aside className="hidden lg:block w-[240px] sticky top-[3.5rem] self-start">
      <div className="max-h-[calc(100vh-4rem)] overflow-y-auto space-y-4 animate-pulse">
        <div className="rounded-lg border bg-card p-3 space-y-3">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-3 w-32 bg-muted rounded" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
        <div className="rounded-lg border bg-card p-3 space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-3 w-8 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function RightSidebarSkeleton() {
  return (
    <aside className="hidden lg:block w-[300px] sticky top-[3.5rem] self-start">
      <div className="max-h-[calc(100vh-4rem)] overflow-y-auto space-y-4 animate-pulse">
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="h-6 w-28 bg-muted rounded" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-3/4 bg-muted rounded" />
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="h-10 w-10 bg-muted rounded" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-40 bg-muted rounded" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

