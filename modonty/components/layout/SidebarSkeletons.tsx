export function LeftSidebarSkeleton() {
  return (
    <aside aria-hidden="true" className="hidden lg:block w-[300px] sticky top-[3.5rem] self-start h-[calc(100dvh-3.5rem)] overflow-hidden">
      <div className="flex flex-col gap-4">
        {/* AnalyticsCard - بالأرقام */}
        <div className="rounded-lg border bg-card p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 skeleton-shimmer rounded" />
            <div className="h-3 w-10 skeleton-shimmer rounded" />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-md bg-muted/30 px-1 py-1.5 flex flex-col items-center gap-1">
                <div className="h-4 w-10 skeleton-shimmer rounded" />
                <div className="h-2 w-8 skeleton-shimmer rounded" />
              </div>
            ))}
          </div>
        </div>
        {/* DiscoveryCard - الفئات | الصناعات | الوسوم */}
        <div className="rounded-lg border bg-card p-3 space-y-3">
          <div className="flex gap-1">
            <div className="h-6 flex-1 skeleton-shimmer rounded-md" />
            <div className="h-6 flex-1 skeleton-shimmer rounded-md" />
            <div className="h-6 flex-1 skeleton-shimmer rounded-md" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-3 w-24 skeleton-shimmer rounded" />
              <div className="h-3 w-8 skeleton-shimmer rounded" />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function RightSidebarSkeleton() {
  return (
    <aside aria-hidden="true" className="hidden lg:block w-[300px] sticky top-[3.5rem] self-start h-[calc(100dvh-3.5rem)] overflow-hidden">
      <div className="flex flex-col gap-4">
        {/* FollowCard */}
        <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="h-3 w-16 skeleton-shimmer rounded" />
            <div className="flex gap-0.5">
              <div className="h-5 w-5 skeleton-shimmer rounded-md" />
              <div className="h-5 w-5 skeleton-shimmer rounded-md" />
              <div className="h-5 w-5 skeleton-shimmer rounded-md" />
              <div className="h-5 w-5 skeleton-shimmer rounded-md" />
            </div>
          </div>
          <div className="h-9 w-full skeleton-shimmer rounded-md" />
          <div className="h-9 w-full skeleton-shimmer rounded-md" />
        </div>
        {/* NewClientsCard - شركاء النجاح */}
        <div className="rounded-lg border bg-card p-4 flex-1 min-h-0 flex flex-col gap-2">
          <div className="flex justify-between gap-2 shrink-0">
            <div className="h-3 w-24 skeleton-shimmer rounded" />
            <div className="h-3 w-12 skeleton-shimmer rounded" />
          </div>
          <div className="space-y-1 flex-1 min-h-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 py-0.5">
                <div className="h-7 w-7 skeleton-shimmer rounded-full shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-32 skeleton-shimmer rounded" />
                  <div className="h-3 w-20 skeleton-shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
