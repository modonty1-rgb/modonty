import type { ReactNode } from "react";

import { getTaskCounts } from "./helpers/queries";
import { auth } from "@/lib/auth";

export const metadata = { title: "Tasks" };

/**
 * Title and one summary line for every screen under `/tasks`.
 *
 * It used to carry a Board/Archive tab strip and a per-column counter row. Both
 * are gone (Khalid, 2026-09-02): the same two destinations are in the Tasks menu
 * in the top bar, and every column already prints its own count in its header —
 * the strip repeated four numbers that were six inches below it.
 */
export default async function TasksLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;

  const counts = await getTaskCounts(userId);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-4 sm:p-6">
      <header className="min-w-0">
        <h1 className="text-lg font-bold sm:text-xl">Tasks</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {counts.total === 0
            ? "No tasks yet — start with one"
            : `${counts.total} tasks · ${counts.DONE} done`}
        </p>
      </header>

      {children}
    </div>
  );
}
