import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors `client-hero-v2.tsx` + the shell below it, so the page does not jump when
 * the real content lands.
 *
 * It exists because without it this route inherits `/clients/loading.tsx` — the
 * partner LIST skeleton (full-bleed slider + industry chips + card grid), which is a
 * different layout entirely. A wrong-shaped skeleton is worse than a plain spinner:
 * it promises a page the visitor is not about to get.
 */
export default function ClientPageLoading() {
  return (
    <div className="w-full">
      {/* breadcrumb strip */}
      <div className="mx-auto max-w-[1128px] px-4 py-3">
        <Skeleton className="h-4 w-56" />
      </div>

      {/* HERO card — cover + identity bar */}
      <section className="w-full">
        <div className="mx-auto max-w-[1128px] px-4">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {/* cover */}
            <Skeleton className="h-[140px] w-full rounded-none sm:h-[200px]" />

            <div className="p-4">
              {/* desktop identity row: logo · name+tagline · divider · stats · CTAs */}
              <div className="hidden items-center gap-3 lg:flex">
                <Skeleton className="h-16 w-16 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-56" />
                  <Skeleton className="h-3.5 w-72" />
                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
                <div className="mx-1 h-10 w-px bg-border" aria-hidden="true" />
                <div className="flex shrink-0 gap-4">
                  <Skeleton className="h-10 w-16" />
                  <Skeleton className="h-10 w-16" />
                  <Skeleton className="h-10 w-16" />
                </div>
                <div className="ms-auto flex shrink-0 gap-2">
                  <Skeleton className="h-10 w-28 rounded-lg" />
                  <Skeleton className="h-10 w-24 rounded-lg" />
                </div>
              </div>

              {/* mobile identity: stacked */}
              <div className="space-y-2 lg:hidden">
                <Skeleton className="h-14 w-14 rounded-xl" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3.5 w-full max-w-xs" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="mt-3.5 flex gap-2.5">
                  <Skeleton className="h-16 flex-1 rounded-lg" />
                  <Skeleton className="h-16 w-24 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BODY — main column + sidebar */}
      <div className="mx-auto mt-6 max-w-[1128px] px-4">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <Skeleton className="mb-3 h-5 w-40" />
                <Skeleton className="mb-2 h-3.5 w-full" />
                <Skeleton className="mb-2 h-3.5 w-11/12" />
                <Skeleton className="h-3.5 w-4/5" />
              </div>
            ))}
          </div>
          <aside className="hidden space-y-4 lg:block">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <Skeleton className="mb-3 h-4 w-28" />
                <Skeleton className="mb-2 h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}
