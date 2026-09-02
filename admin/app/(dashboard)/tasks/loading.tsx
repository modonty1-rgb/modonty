import { Skeleton } from "@/components/ui/skeleton";

import { TASK_STATUSES } from "./helpers/task-config";

/**
 * Mirrors the real board: four columns, a header row inside each.
 *
 * The page title and counters are NOT skeletoned here — they live in
 * `layout.tsx`, which is already on screen while this renders. Drawing a grey
 * bar where the real title already sits is the mistake the reels skeleton made.
 */
export default function TasksLoading() {
  return (
    <div className="flex min-h-0 flex-1 gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4">
      {TASK_STATUSES.map((s) => (
        <div key={s} className="flex w-72 shrink-0 flex-col rounded-xl border bg-muted/30 sm:w-full">
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Skeleton className="size-2 rounded-full" />
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="ms-auto h-4 w-6 rounded-full" />
          </div>
          <div className="flex flex-col gap-2 p-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-2.5">
                <Skeleton className="h-3.5 w-4/5" />
                <div className="mt-2 flex items-center gap-1.5">
                  <Skeleton className="h-4 w-12 rounded" />
                  <Skeleton className="ms-auto size-6 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
