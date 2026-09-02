import { db } from "@/lib/db";

import type { TaskStatusKey } from "@/lib/tasks/task-config";

// Declared here rather than imported from the board's route: a route may not
// reach into a sibling route's folder, and this screen reads different fields.
export interface DayTask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatusKey;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  dueDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  assignee: { id: string; name: string | null; image: string | null; role: string | null } | null;
}

export interface StaffDay {
  staffId: string | null;
  name: string;
  image: string | null;
  role: string | null;
  tasks: DayTask[];
  counts: Record<TaskStatusKey, number> & { late: number };
}

/** Local midnight → next local midnight. `toISOString()` would shift the day. */
export function dayBounds(day: Date) {
  const from = new Date(day);
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + 1);
  return { from, to };
}

/**
 * What each member of staff put on their plate for one day, grouped by person.
 *
 * Grouped by PERSON, not by column: the team is remote, so the question this
 * screen answers is "who is holding what right now", which a four-column board
 * cannot show — it mixes everyone's work into the same four piles.
 *
 * The day is `createdAt`, because the routine is that each person writes their
 * tasks in the morning. A task carried over from yesterday is re-entered, so it
 * appears on the day it was written down rather than the day it began.
 */
export async function getTasksByDay(day: Date): Promise<StaffDay[]> {
  const { from, to } = dayBounds(day);

  const rows = await db.task.findMany({
    where: {
      createdAt: { gte: from, lt: to },
      // Archived rows are off every board. Both shapes — a field never written
      // is ABSENT in Mongo and `archivedAt: null` does not match it.
      OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      dueDate: true,
      completedAt: true,
      createdAt: true,
      assignee: { select: { id: true, name: true, image: true, role: true } },
    },
    orderBy: [{ createdAt: "asc" }],
    take: 500,
  });

  const groups = new Map<string, StaffDay>();
  const isLate = (t: { dueDate: Date | null; status: string }) =>
    !!t.dueDate && t.status !== "DONE" && new Date(t.dueDate).setHours(23, 59, 59, 999) < Date.now();

  for (const row of rows) {
    // Unassigned work is its own lane, not hidden: a task nobody owns is
    // exactly the thing this screen exists to surface.
    const key = row.assignee?.id ?? "__unassigned__";
    if (!groups.has(key)) {
      groups.set(key, {
        staffId: row.assignee?.id ?? null,
        name: row.assignee?.name?.trim() || (row.assignee ? "No name" : "Unassigned"),
        image: row.assignee?.image ?? null,
        role: row.assignee?.role ?? null,
        tasks: [],
        counts: { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0, late: 0 },
      });
    }
    const g = groups.get(key)!;
    g.tasks.push(row as DayTask);
    g.counts[row.status as TaskStatusKey] += 1;
    if (isLate(row)) g.counts.late += 1;
  }

  // Most work first — whoever is carrying the most is who you look at first.
  // The unassigned lane sinks to the bottom; it is a gap, not a person.
  return [...groups.values()].sort((a, b) => {
    if (!a.staffId) return 1;
    if (!b.staffId) return -1;
    return b.tasks.length - a.tasks.length;
  });
}
