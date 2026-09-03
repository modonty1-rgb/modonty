import { cache } from "react";

import { db } from "@/lib/db";

import { TASK_STATUSES, type TaskStatusKey } from "@/lib/tasks/task-config";
import type { BoardTask } from "@/lib/tasks/task-types";

// Re-exported so the existing `helpers/queries` barrel keeps working; the shape
// itself now lives in lib because `/daily-tasks` consumes it too.
export type { BoardTask };

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
export const getBoardTasks = cache(async (assigneeId: string): Promise<Record<TaskStatusKey, BoardTask[]>> => {
  const rows = await db.task.findMany({
    // Live cards only. An archived task KEEPS its status, so without this it
    // would sit in its old column as if nothing had happened.
    //
    // Both shapes, not just `null`: in Mongo a field that was never written is
    // ABSENT, and `archivedAt: null` does not match an absent field. Measured —
    // six stored rows went invisible until this OR was added.
    where: {
      assigneeId,
      OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      position: true,
      dueDate: true,
      completedAt: true,
      assigneeId: true,
      createdById: true,
      assignee: { select: { id: true, name: true, image: true } },
      createdBy: { select: { role: true } },
    },
    orderBy: [{ status: "asc" }, { position: "asc" }],
    take: 500,
  });

  const board = Object.fromEntries(TASK_STATUSES.map((s) => [s, [] as BoardTask[]])) as Record<
    TaskStatusKey,
    BoardTask[]
  >;
  for (const row of rows) {
    board[row.status as TaskStatusKey].push({
      ...row,
      assignedByAdmin: row.createdBy?.role === "ADMIN" && row.createdById !== row.assigneeId,
    } as BoardTask);
  }
  return board;
});
