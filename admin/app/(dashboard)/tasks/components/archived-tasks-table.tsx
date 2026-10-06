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
  // لا شيء مؤرشف = لا قسم: كان صندوقاً منقّطاً يقول «لا توجد» تحت كلّ لوحة (خالد ٣ أكتوبر ٢٠٢٦).
  if (tasks.length === 0) return null;
  return (
    // مطويٌّ حتى يُطلب — مكانُ استرداد، لا جزءٌ من يومك.
    <details className="group/arch mb-6 rounded-lg border bg-card">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm font-semibold">
        <ArchiveRestore className="size-4 text-muted-foreground" aria-hidden />
        المؤرشفة <span className="font-normal text-muted-foreground">({tasks.length}) — اضغط للاسترداد</span>
      </summary>
      <div className="border-t">
        <div className="overflow-x-auto">
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
                      {TASK_PRIORITY_META[task.priority].labelAr}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", TASK_STATUS_META[task.status].tone)}>
                      {TASK_STATUS_META[task.status].labelAr}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted-foreground">
                    {dateFmt.format(task.archivedAt)}
                  </td>
                  <td className="px-3 py-2.5 text-end">
                    <RestoreTaskButton id={task.id} title={task.title} column={TASK_STATUS_META[task.status].labelAr} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  );
}
