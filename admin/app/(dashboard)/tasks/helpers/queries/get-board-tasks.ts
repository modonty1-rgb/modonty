import { cache } from "react";

import { db } from "@/lib/db";

import { TASK_STATUSES, type TaskStatusKey } from "../task-config";

export interface BoardTask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatusKey;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  position: number;
  dueDate: Date | null;
  completedAt: Date | null;
  assignee: { id: string; name: string | null; image: string | null } | null;
}

/**
 * Every task on the board, grouped by column and ordered inside it.
 *
 * One query, not four: the whole board is a few hundred rows at most, and four
 * round trips to Atlas to slice the same collection costs more than the rows do.
 * `take` still caps it — an unbounded `findMany` is how a board becomes a timeout.
 *
 * `cache()` because the layout draws the counters and the page draws the columns
 * in the SAME request; without it both would run this query, exactly the waste
 * that `getReelStatusCounts` was wrapped to stop.
 */
export const getBoardTasks = cache(async (): Promise<Record<TaskStatusKey, BoardTask[]>> => {
  const rows = await db.task.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      position: true,
      dueDate: true,
      completedAt: true,
      assignee: { select: { id: true, name: true, image: true } },
    },
    orderBy: [{ status: "asc" }, { position: "asc" }],
    take: 500,
  });

  const board = Object.fromEntries(TASK_STATUSES.map((s) => [s, [] as BoardTask[]])) as Record<
    TaskStatusKey,
    BoardTask[]
  >;
  for (const row of rows) board[row.status as TaskStatusKey].push(row as BoardTask);
  return board;
});
