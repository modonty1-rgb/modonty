import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { getArchivedTasks } from "../helpers/queries";
import { TASK_PRIORITY_META, TASK_STATUS_META } from "@/lib/tasks/task-config";
import { RestoreTaskButton } from "../components/restore-task-button";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Everything taken off the board.
 *
 * This screen is why there is no delete: archiving is only a safe answer to
 * "get this out of my way" if there is somewhere to look afterwards. Each row
 * names the column it will return to, so restoring holds no surprise.
 */
export default async function ArchivedTasksPage() {
  const tasks = await getArchivedTasks();

  if (tasks.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">Archive is empty</p>
        <p className="text-[13px] text-muted-foreground">
          Anything you archive from the board lands here, and you can restore it any time.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/tasks">Back to board</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((task) => (
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

          {task.assignee && (
            <span className="max-w-32 truncate text-[11px] text-muted-foreground">
              {task.assignee.name ?? "No name"}
            </span>
          )}

          <span className="text-[11px] tabular-nums text-muted-foreground">
            Archived {dateFmt.format(task.archivedAt)}
          </span>

          {/* The column it goes back to — restoring must not be a guess. */}
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-semibold",
              TASK_STATUS_META[task.status].tone,
            )}
          >
            {TASK_STATUS_META[task.status].label}
          </span>

          <RestoreTaskButton
            id={task.id}
            title={task.title}
            column={TASK_STATUS_META[task.status].label}
          />
        </li>
      ))}
    </ul>
  );
}
