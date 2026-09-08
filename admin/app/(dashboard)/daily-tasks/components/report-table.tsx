"use client";

import { useState } from "react";
import { CalendarClock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TASK_PRIORITY_META, TASK_STATUS_META, type TaskStatusKey } from "@/lib/tasks/task-config";

const dueFmt = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long" });

export interface ReportRow {
  id: string; title: string; description: string | null; person: string; personImage: string | null; role: string | null;
  status: TaskStatusKey; priority: "LOW" | "NORMAL" | "HIGH" | "URGENT"; dueDate: Date | null; late: boolean;
  createdAt: Date; assignedBy: { name: string | null; email: string | null } | null;
}

export function ReportTable({ rows }: { rows: ReportRow[] }) {
  const groups = new Map<string, ReportRow[]>();
  for (const row of rows) groups.set(row.person, [...(groups.get(row.person) ?? []), row]);
  const groupEntries = [...groups.entries()];
  const [openPeople, setOpenPeople] = useState<string[]>(() => groupEntries.map(([person]) => person));
  const allOpen = openPeople.length === groupEntries.length;

  return <div className="space-y-2">
    <div className="flex items-center gap-1.5">
      <button type="button" className="rounded border px-2 py-1 text-xs hover:bg-muted" onClick={() => setOpenPeople(groupEntries.map(([person]) => person))} disabled={allOpen}>فتح الكل</button>
      <button type="button" className="rounded border px-2 py-1 text-xs hover:bg-muted" onClick={() => setOpenPeople([])} disabled={openPeople.length === 0}>طي الكل</button>
    </div>
    {groupEntries.map(([person, tasks]) => {
    const first = tasks[0]; const late = tasks.filter((task) => task.late).length;
    const statusCounts = (Object.keys(TASK_STATUS_META) as TaskStatusKey[])
      .map((status) => ({ status, count: tasks.filter((task) => task.status === status).length }))
      .filter(({ count }) => count > 0);
    const open = openPeople.includes(person);
    return <details key={person} open={open} onToggle={(event) => { const isOpen = event.currentTarget.open; setOpenPeople((current) => isOpen ? [...new Set([...current, person])] : current.filter((key) => key !== person)); }} className="group overflow-hidden rounded-lg border bg-card">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 hover:bg-muted/40">
        {first.personImage ? <img src={first.personImage} alt="" className="size-7 rounded-full object-cover" /> : <span className="grid size-7 place-items-center rounded-full bg-muted text-xs font-bold">{person.charAt(0)}</span>}
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{person}</span>
        {first.role && <span className="text-[11px] text-muted-foreground">{first.role}</span>}
        <span className="hidden items-center gap-1.5 md:flex">
          {statusCounts.map(({ status, count }) => <span key={status} className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", TASK_STATUS_META[status].tone)}>{TASK_STATUS_META[status].label} {count}</span>)}
        </span>
        {late > 0 && <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-[11px] font-medium text-red-600 dark:text-red-400">{late} متأخر</span>}
        <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">{tasks.length}</span>
        <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="border-t bg-muted/20 p-2 sm:p-3"><div className="overflow-hidden rounded-md border bg-background"><table className="w-full text-sm"><tbody>{tasks.map((task) => <tr key={task.id} className="border-b last:border-0">
        <td className="px-3 py-2 font-medium"><details className="group/task"><summary className="flex cursor-pointer list-none items-center gap-1.5"><ChevronDown className="size-3.5 text-muted-foreground transition-transform group-open/task:rotate-180" />{task.title}</summary><div className="mt-2 grid gap-2 border-s ps-3 text-xs font-normal text-muted-foreground sm:grid-cols-2"><p className="sm:col-span-2 text-foreground">{task.description || "لا يوجد وصف للمهمة."}</p><span>أُنشئت: {dueFmt.format(task.createdAt)}</span>{task.assignedBy && <span>أسندها: {task.assignedBy.name || task.assignedBy.email || "عضو بالفريق"}</span>}</div></details></td>
        <td className="hidden px-2 py-2 sm:table-cell"><span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", TASK_PRIORITY_META[task.priority].tone)}>{TASK_PRIORITY_META[task.priority].label}</span></td>
        <td className="hidden px-2 py-2 sm:table-cell"><span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", TASK_STATUS_META[task.status].tone)}>{TASK_STATUS_META[task.status].label}</span></td>
        <td className={cn("whitespace-nowrap px-3 py-2 text-end text-[11px]", task.late ? "font-medium text-red-600 dark:text-red-400" : "text-muted-foreground")}>{task.dueDate ? <span className="inline-flex items-center gap-1"><CalendarClock className="size-3" />{dueFmt.format(task.dueDate)}</span> : "—"}</td>
      </tr>)}</tbody></table></div></div>
    </details>;
    })}</div>;
}
