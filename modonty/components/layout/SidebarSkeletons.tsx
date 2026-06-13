export function LeftSidebarSkeleton() {
  return (
    <aside aria-hidden="true" className="hidden lg:flex flex-col w-[300px] sticky top-[3.5rem] self-start h-[calc(100dvh-5rem)] overflow-hidden gap-4">
      {/* HeroSlider — partner showcase */}
      <div className="aspect-[1200/630] w-full rounded-lg border skeleton-shimmer shrink-0" />
      {/* DiscoveryCard - الفئات | الصناعات | الوسوم */}
      <div className="flex-1 min-h-0 rounded-lg border bg-card p-3 space-y-3 overflow-hidden">
        <div className="flex gap-1">
          <div className="h-6 flex-1 skeleton-shimmer rounded-md" />
          <div className="h-6 flex-1 skeleton-shimmer rounded-md" />
          <div className="h-6 flex-1 skeleton-shimmer rounded-md" />
        </div>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-3 w-24 skeleton-shimmer rounded" />
            <div className="h-3 w-8 skeleton-shimmer rounded" />
          </div>
        ))}
      </div>
    </aside>
  );
}

export function RightSidebarSkeleton() {
  return (
    <aside aria-hidden="true" className="hidden lg:block w-[300px] sticky top-[3.5rem] self-start h-[calc(100dvh-5rem)] overflow-hidden">
      {/* NewClientsCard - الشركاء (full height) */}
      <div className="h-full rounded-lg border bg-card p-4 flex flex-col gap-2">
        <div className="flex justify-between gap-2 shrink-0">
          <div className="h-3 w-24 skeleton-shimmer rounded" />
          <div className="h-3 w-12 skeleton-shimmer rounded" />
        </div>
        <div className="space-y-1 flex-1 min-h-0 overflow-hidden">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex items-center gap-3 py-1">
              <div className="h-7 w-7 skeleton-shimmer rounded-md shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-32 skeleton-shimmer rounded" />
                <div className="h-3 w-20 skeleton-shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
