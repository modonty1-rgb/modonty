export function LeftSidebarSkeleton() {
  return (
    <aside className="hidden lg:block w-[240px] sticky top-[3.5rem] self-start">
      <div className="max-h-[calc(100vh-4rem)] overflow-y-auto space-y-4">
        <div className="rounded-lg border bg-card p-3 space-y-3">
          <div className="h-4 w-24 skeleton-shimmer rounded" />
          <div className="h-3 w-32 skeleton-shimmer rounded" />
          <div className="h-3 w-20 skeleton-shimmer rounded" />
        </div>
        <div className="rounded-lg border bg-card p-3 space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between">
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
    <aside className="hidden lg:block w-[300px] sticky top-[3.5rem] self-start h-[calc(100vh-4rem)]">
      <div className="flex h-full flex-col space-y-4">
        {/* SocialCard */}
        <div className="rounded-lg border bg-card p-3 flex justify-center gap-2">
          <div className="h-8 w-8 skeleton-shimmer rounded-md" />
          <div className="h-8 w-8 skeleton-shimmer rounded-md" />
          <div className="h-8 w-8 skeleton-shimmer rounded-md" />
        </div>
        {/* ModontyCard - جديد مودونتي */}
        <div className="rounded-lg border bg-card p-3 flex flex-col gap-1">
          <div className="h-3 w-20 skeleton-shimmer rounded shrink-0" />
          <div className="h-3 w-full skeleton-shimmer rounded" />
          <div className="h-3 w-full skeleton-shimmer rounded" />
          <div className="h-3 w-4/5 skeleton-shimmer rounded" />
        </div>
        {/* NewClientsCard - شركاء النجاح */}
        <div className="rounded-lg border bg-card p-4 flex-1 min-h-0 flex flex-col gap-2">
          <div className="flex justify-between gap-2 shrink-0">
            <div className="h-3 w-24 skeleton-shimmer rounded" />
            <div className="h-3 w-12 skeleton-shimmer rounded" />
          </div>
          <div className="space-y-1 flex-1 min-h-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-0.5">
                <div className="h-7 w-7 skeleton-shimmer rounded-full shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-32 skeleton-shimmer rounded" />
                  <div className="h-3 w-full skeleton-shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* More - المزيد */}
        <div className="rounded-lg border bg-card p-1.5 flex flex-col gap-0.5 shrink-0">
          <div className="h-3 w-12 skeleton-shimmer rounded mb-1" />
          <div className="h-6 w-full skeleton-shimmer rounded" />
          <div className="h-6 w-full skeleton-shimmer rounded" />
          <div className="h-6 w-full skeleton-shimmer rounded" />
        </div>
      </div>
    </aside>
  );
}

