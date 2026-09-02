import type { ReactNode } from "react";

import { TASK_STATUSES, TASK_STATUS_META } from "./helpers/task-config";
import { getTaskCounts } from "./helpers/queries";
import { TaskNav } from "./components/task-nav";

export const metadata = { title: "إدارة المهام" };

/**
 * Owns the title and the counters for every screen under `/tasks`.
 *
 * They live here rather than in each page for the reason the reels layout was
 * built the same way: the counts are identical on the board and on "مهامي", and
 * `getTaskCounts` is wrapped in `cache()` so the layout and the page share one
 * query instead of running it twice per open.
 */
export default async function TasksLayout({ children }: { children: ReactNode }) {
  const counts = await getTaskCounts();

  return (
    <div dir="rtl" className="flex h-full min-h-0 flex-col gap-4 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-bold sm:text-xl">إدارة المهام</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {counts.total === 0
              ? "لسه مافيش مهام — ابدأ بواحدة"
              : `${counts.total} مهمة · ${counts.DONE} خلصت`}
          </p>
        </div>
        <TaskNav
          counts={TASK_STATUSES.map((s) => ({
            key: s,
            label: TASK_STATUS_META[s].label,
            count: counts[s],
          }))}
        />
      </header>

      {children}
    </div>
  );
}
