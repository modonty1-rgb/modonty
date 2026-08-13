export function LeftSidebarSkeleton() {
  return (
    <aside aria-hidden="true" className="hidden lg:block w-[300px] sticky top-20 self-start">
      <div className="space-y-3 rounded-2xl border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 rounded-xl skeleton-shimmer" />
          <div className="space-y-2"><div className="h-3 w-20 rounded skeleton-shimmer" /><div className="h-3 w-40 rounded skeleton-shimmer" /></div>
        </div>
        <div className="h-11 w-full rounded-xl skeleton-shimmer" />
      </div>
    </aside>
  );
}

export function RightSidebarSkeleton() {
  return (
    <aside aria-hidden="true" className="hidden h-[calc(100dvh-5rem)] w-[300px] self-start overflow-hidden xl:sticky xl:top-20 xl:block">
      <div className="h-full rounded-lg border bg-card p-4 flex flex-col gap-2">
        <div className="flex justify-between gap-2 shrink-0"><div className="h-3 w-24 skeleton-shimmer rounded" /><div className="h-3 w-12 skeleton-shimmer rounded" /></div>
        <div className="space-y-1 flex-1 min-h-0 overflow-hidden">{[1, 2, 3, 4, 5, 6, 7, 8].map((index) => <div key={index} className="flex items-center gap-3 py-1"><div className="h-7 w-7 skeleton-shimmer rounded-md shrink-0" /><div className="flex-1 space-y-1"><div className="h-3 w-32 skeleton-shimmer rounded" /><div className="h-3 w-20 skeleton-shimmer rounded" /></div></div>)}</div>
      </div>
    </aside>
  );
}
