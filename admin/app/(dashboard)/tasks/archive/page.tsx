import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { getArchivedTasks } from "../helpers/queries";
import { TASK_PRIORITY_META, TASK_STATUS_META } from "@/lib/tasks/task-config";
import { RestoreTaskButton } from "../components/restore-task-button";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { canSeeReports } from "@/lib/can-see-reports";
import { ArchivePersonFilter } from "./components/archive-person-filter";

const dateFmt = new Intl.DateTimeFormat("ar-EG", {
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
function dayStart(value?: string) {
  if (!value?.match(/^\d{4}-\d{2}-\d{2}$/)) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default async function ArchivedTasksPage({ searchParams }: { searchParams: Promise<{ person?: string; from?: string; to?: string }> }) {
  const { person = "", from, to } = await searchParams;
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;

  const staff = await db.staff.findUnique({ where: { id: userId }, select: { role: true, canViewReports: true } });
  const teamArchive = canSeeReports(staff);
  const allTasks = await getArchivedTasks(teamArchive ? undefined : userId);
  const people = [...new Map(allTasks.filter((task) => task.assignee).map((task) => [task.assignee!.id, task.assignee!.name ?? "بدون اسم"])).entries()];
  const fromDate = dayStart(from);
  const toDate = dayStart(to);
  if (toDate) toDate.setHours(23, 59, 59, 999);
  const tasks = allTasks.filter((task) => {
    return (!person || task.assignee?.id === person) && (!fromDate || task.archivedAt >= fromDate) && (!toDate || task.archivedAt <= toDate);
  });

  if (allTasks.length === 0) {
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
    <div className="space-y-3">
      <header><h2 className="text-lg font-bold">{teamArchive ? "أرشيف مهام الفريق" : "أرشيف مهامي"}</h2><p className="text-sm text-muted-foreground">{teamArchive ? "كل المهام التي أرشفها الفريق." : "المهام التي أرشفتها."}</p></header>
      <form className="flex flex-wrap items-end gap-2 rounded-lg border bg-card p-3">
        <ArchivePersonFilter people={people} value={person} />
        <label className="text-xs text-muted-foreground">من<Input name="from" type="date" defaultValue={from} className="mt-1 h-8 w-36" /></label>
        <label className="text-xs text-muted-foreground">إلى<Input name="to" type="date" defaultValue={to} className="mt-1 h-8 w-36" /></label>
        <Button type="submit" size="sm">تطبيق</Button>
        {(person || from || to) && <Button asChild type="button" size="sm" variant="ghost"><Link href="/tasks/archive">مسح</Link></Button>}
      </form>
      {tasks.length === 0 ? <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">لا توجد مهام مؤرشفة تطابق الفلتر.</p> :
      <ul className="flex flex-col gap-2">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="grid gap-3 rounded-lg border bg-card p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {task.assignee?.image ? <img src={task.assignee.image} alt="" className="size-6 rounded-full object-cover" /> : <span className="grid size-6 place-items-center rounded-full bg-muted text-[10px] font-bold">{(task.assignee?.name ?? "؟").charAt(0)}</span>}
              <span>الموظف:</span><span className="font-medium text-foreground">{task.assignee?.name ?? "غير مسندة"}</span>
            </div>
            <p className="mt-2 truncate text-sm font-semibold">{task.title}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className={cn("rounded px-1.5 py-0.5 font-semibold", TASK_PRIORITY_META[task.priority].tone)}>{TASK_PRIORITY_META[task.priority].label}</span>
              <span className={cn("rounded px-1.5 py-0.5 font-semibold", TASK_STATUS_META[task.status].tone)}>{TASK_STATUS_META[task.status].label}</span>
              <span>أُرشفت: {dateFmt.format(task.archivedAt)}</span>
            </div>
          </div>
          <RestoreTaskButton id={task.id} title={task.title} column={TASK_STATUS_META[task.status].label} />
        </li>
      ))}
      </ul>
      }
    </div>
  );
}
