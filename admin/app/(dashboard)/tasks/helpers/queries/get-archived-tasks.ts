import { cache } from "react";

import { db } from "@/lib/db";

import type { BoardTask } from "./get-board-tasks";

export interface ArchivedTask extends BoardTask {
  archivedAt: Date;
}

/**
 * Tasks taken off the board, newest first.
 *
 * Its own query rather than a slice of `getBoardTasks`: the board filters
 * archived rows out at the database, which is the point — pulling them back
 * into memory only to hide them would make the board pay for the archive.
 */
export const getArchivedTasks = cache(async (assigneeId: string): Promise<ArchivedTask[]> => {
  const rows = await db.task.findMany({
    // `isSet: true` — an ARCHIVED row is one where the field exists AND holds a
    // date. `NOT: { archivedAt: null }` would be the mirror of the board's bug:
    // in Mongo it also matches rows where the field is merely absent.
    where: { assigneeId, archivedAt: { isSet: true, not: null } },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      position: true,
      dueDate: true,
      completedAt: true,
      archivedAt: true,
      assignee: { select: { id: true, name: true, image: true } },
    },
    orderBy: { archivedAt: "desc" },
    take: 200,
  });

  return rows as ArchivedTask[];
});
