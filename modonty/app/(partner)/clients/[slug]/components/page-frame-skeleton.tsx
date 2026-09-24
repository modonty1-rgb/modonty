import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton of `PageFrame` + the first block under it — the shape every titled inner page of a
 * partner site draws (`/articles` · `/services` · `/faq` · `/contact` · `/photos` · `/reviews`):
 * trail, eyebrow, title in the `max-w-[1128px] px-6` box, then one block (`px-6 py-16`) with its
 * own eyebrow + heading and a body. `body` picks the body's shape: cards in a grid, or rows.
 */
export function PageFrameSkeleton({ body = "grid" }: { body?: "grid" | "rows" }) {
  return (
    <div aria-hidden>
      <div className="mx-auto max-w-[1128px] px-6 pt-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-6 h-4 w-24" />
        <Skeleton className="mt-3 h-9 w-72" />
      </div>
      <div className="mt-10">
        <div className="mx-auto max-w-[1128px] px-6 py-16">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-3 h-8 w-56" />
          {body === "grid" ? (
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="mx-auto mt-8 max-w-3xl divide-y rounded-xl border">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="p-4">
                  <Skeleton className="h-5 w-2/3" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
