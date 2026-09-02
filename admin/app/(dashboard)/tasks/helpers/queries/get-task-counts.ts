import { cache } from "react";

import { TASK_STATUSES, type TaskStatusKey } from "@/lib/tasks/task-config";
import { getBoardTasks } from "./get-board-tasks";

export type TaskCounts = Record<TaskStatusKey, number> & { total: number };

/**
 * Counts per column.
 *
 * Derived from the SAME rows the board renders, never from a separate `groupBy`.
 * That is the admin entity standard's rule (#4): one definition drives both the
 * number on the header and the cards under it, so the header can never announce
 * a count the column does not show.
 */
export const getTaskCounts = cache(async (): Promise<TaskCounts> => {
  const board = await getBoardTasks();
  const counts = Object.fromEntries(TASK_STATUSES.map((s) => [s, board[s].length])) as Record<
    TaskStatusKey,
    number
  >;
  return { ...counts, total: TASK_STATUSES.reduce((sum, s) => sum + board[s].length, 0) };
});
