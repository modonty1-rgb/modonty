import { ArchiveRestore } from "lucide-react";

import { cn } from "@/lib/utils";
import { TASK_PRIORITY_META, TASK_STATUS_META } from "@/lib/tasks/task-config";

import type { ArchivedTask } from "../helpers/queries/get-archived-tasks";
import { RestoreTaskButton } from "./restore-task-button";

const dateFmt = new Intl.DateTimeFormat("ar-EG", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** The active board excludes archived cards; this table is their recovery path. */
export function ArchivedTasksTable({ tasks }: { tasks: ArchivedTask[] }) {
  return (
    <section aria-labelledby="archived-tasks-heading" className="mb-8 mt-5 border-t pt-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 id="archived-tasks-heading" className="text-base font-bold">
            المهام المؤرشفة
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {tasks.length === 0 ? "لا توجد مهام مؤرشفة حالياً." : `${tasks.length} مهمة يمكن استردادها إلى اللوحة.`}
          </p>
        </div>
        <ArchiveRestore className="size-5 text-muted-foreground" aria-hidden />
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          أي مهمة تؤرشفها ستظهر هنا ويمكنك استردادها في أي وقت.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="px-3 py-2 text-start font-medium">
                  المهمة
                </th>
                <th scope="col" className="px-3 py-2 text-start font-medium">
                  الأولوية
                </th>
                <th scope="col" className="px-3 py-2 text-start font-medium">
                  ستعود إلى
                </th>
                <th scope="col" className="px-3 py-2 text-start font-medium">
                  تاريخ الأرشفة
                </th>
                <th scope="col" className="px-3 py-2 text-end font-medium">
                  <span className="sr-only">استرداد</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b last:border-0">
                  <td className="max-w-0 px-3 py-2.5">
                    <p className="truncate font-medium">{task.title}</p>
                    {task.description && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{task.description}</p>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", TASK_PRIORITY_META[task.priority].tone)}>
                      {TASK_PRIORITY_META[task.priority].label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", TASK_STATUS_META[task.status].tone)}>
                      {TASK_STATUS_META[task.status].label}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted-foreground">
                    {dateFmt.format(task.archivedAt)}
                  </td>
                  <td className="px-3 py-2.5 text-end">
                    <RestoreTaskButton id={task.id} title={task.title} column={TASK_STATUS_META[task.status].label} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
