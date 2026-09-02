import Link from "next/link";
import { CalendarClock } from "lucide-react";

import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { getBoardTasks } from "../helpers/queries";
import {
  TASK_PRIORITY_META,
  TASK_PRIORITY_WEIGHT,
  TASK_STATUSES,
  TASK_STATUS_META,
} from "../helpers/task-config";

const dateFmt = new Intl.DateTimeFormat("ar-SA", { day: "numeric", month: "long" });

/**
 * The signed-in person's own queue — one list, not four columns.
 *
 * The board answers "where does the work stand?"; this answers "what do I do
 * next?", and that question is a priority-ordered list, never a grid you have to
 * scan in four places. Finished tasks are excluded: a to-do list that shows what
 * you already did buries what you have not.
 *
 * It reuses `getBoardTasks` rather than adding a query — same request, already
 * cached, and one definition of what a task looks like.
 */
export default async function MyTasksPage() {
  const session = await auth();
  const myId = (session?.user as { id?: string } | undefined)?.id ?? null;

  const board = await getBoardTasks();
  const mine = TASK_STATUSES.filter((s) => s !== "DONE")
    .flatMap((s) => board[s])
    .filter((t) => t.assignee?.id === myId)
    .sort((a, b) => {
      const p = TASK_PRIORITY_WEIGHT[a.priority] - TASK_PRIORITY_WEIGHT[b.priority];
      if (p !== 0) return p;
      // No due date sorts last: a task with a deadline is more urgent than one
      // without, at the same priority.
      const ad = a.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
      const bd = b.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
      return ad - bd;
    });

  if (!myId) {
    return (
      <p className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
        ما قدرنا نعرف حسابك — سجّل دخول من جديد.
      </p>
    );
  }

  if (mine.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">مافيش مهام مسنودة لك</p>
        <p className="text-[13px] text-muted-foreground">
          كل اللي عليك خلص، أو لسه محدش سند لك حاجة.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/tasks">شوف اللوح كامل</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {mine.map((task) => {
        const late =
          task.dueDate && new Date(task.dueDate).setHours(23, 59, 59, 999) < Date.now();
        return (
          <li
            key={task.id}
            className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3"
          >
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                TASK_PRIORITY_META[task.priority].tone,
              )}
            >
              {TASK_PRIORITY_META[task.priority].label}
            </span>

            <span className="min-w-0 flex-1 text-[13px] font-medium">{task.title}</span>

            {task.dueDate && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] tabular-nums",
                  late
                    ? "bg-red-500/15 font-medium text-red-600 dark:text-red-400"
                    : "text-muted-foreground",
                )}
              >
                <CalendarClock className="size-3" aria-hidden />
                {dateFmt.format(task.dueDate)}
                {late && " — متأخرة"}
              </span>
            )}

            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                TASK_STATUS_META[task.status].tone,
              )}
            >
              {TASK_STATUS_META[task.status].label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
