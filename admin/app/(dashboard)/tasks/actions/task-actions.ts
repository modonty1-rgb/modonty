"use server";

import { revalidatePath } from "next/cache";

import type { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { createTaskSchema, moveTaskSchema, updateTaskSchema } from "../helpers/task-schema";

// Every action follows the same order: session → Zod → try/catch → revalidate.
// Errors are RETURNED, never thrown: a thrown error inside a server action lands
// the whole board on error.tsx, and losing the board is a worse outcome than one
// card refusing to move.

type Result = { success: true } | { success: false; error: string };

/** `revalidatePath("/tasks", "layout")` — the layout owns the counters, and a
 *  card that moves changes TWO columns plus the header. The default page-only
 *  invalidation would refresh the board and leave the counts stale. */
const revalidateBoard = () => revalidatePath("/tasks", "layout");

/** Empty string from a `<select>`/`<input>` means "not set", not "set to empty". */
const orNull = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

/**
 * "Not archived", in the only form Mongo answers correctly.
 *
 * An optional field that was never written is ABSENT, and `archivedAt: null`
 * does NOT match an absent field. Measured: with a plain `archivedAt: null`
 * filter, `create` reported success and every card vanished on the next reload
 * — six rows were in the database and invisible.
 */
// NOT `as const`: that freezes `OR` into a readonly tuple, and Prisma's
// `TaskWhereInput.OR` is a mutable array — three call sites failed to compile.
const LIVE: Prisma.TaskWhereInput = {
  OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
};

function parseDueDate(value: string | undefined): Date | null {
  const raw = orNull(value);
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Position for a card landing at `toIndex` of `column`.
 *
 * The midpoint between its new neighbours, so a drop writes ONE row instead of
 * renumbering the column. Ends are handled explicitly: dropping first goes below
 * the current first, dropping last goes above the current last.
 */
function positionAt(siblings: { position: number }[], toIndex: number): number {
  if (siblings.length === 0) return 1000;
  if (toIndex <= 0) return siblings[0].position - 1000;
  if (toIndex >= siblings.length) return siblings[siblings.length - 1].position + 1000;
  return (siblings[toIndex - 1].position + siblings[toIndex].position) / 2;
}

export async function createTask(raw: unknown): Promise<Result> {
  const session = await auth();
  if (!session) return { success: false, error: "Not authorised" };

  const parsed = createTaskSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Missing data" };
  }
  const data = parsed.data;

  try {
    // New cards go to the TOP of their column: a task you just wrote is the one
    // you are thinking about, and burying it under fifty older rows is why
    // "add" and "then scroll to find it" became two steps in other tools.
    const first = await db.task.findFirst({
      where: { status: data.status, ...LIVE },
      select: { position: true },
      orderBy: { position: "asc" },
    });

    await db.task.create({
      data: {
        title: data.title,
        description: orNull(data.description),
        status: data.status,
        priority: data.priority,
        position: first ? first.position - 1000 : 1000,
        dueDate: parseDueDate(data.dueDate),
        // A new task belongs to whoever wrote it — Khalid, 2026-09-02: the
        // employee adds their own tasks, so `New Task` has no assignee field to
        // fill in. Reassigning is an EDIT, and only there.
        //
        // Taken from the SESSION, never from the payload: the form no longer
        // sends one, and the action is reachable without the form.
        assigneeId: (session.user as { id?: string })?.id ?? null,
        createdById: (session.user as { id?: string })?.id ?? null,
        completedAt: data.status === "DONE" ? new Date() : null,
        // Written explicitly so the field EXISTS as null instead of being absent
        // — see `LIVE` above for what absent costs.
        archivedAt: null,
      },
    });

    revalidateBoard();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Could not create the task" };
  }
}

export async function updateTask(raw: unknown): Promise<Result> {
  const session = await auth();
  if (!session) return { success: false, error: "Not authorised" };

  const parsed = updateTaskSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Missing data" };
  }
  const data = parsed.data;

  try {
    const existing = await db.task.findUnique({
      where: { id: data.id },
      select: { id: true, status: true, completedAt: true },
    });
    if (!existing) return { success: false, error: "Task not found" };

    await db.task.update({
      where: { id: existing.id },
      data: {
        title: data.title,
        description: orNull(data.description),
        status: data.status,
        priority: data.priority,
        dueDate: parseDueDate(data.dueDate),
        assigneeId: orNull(data.assigneeId),
        // Stamped the first time it reaches DONE and never overwritten after —
        // editing a finished task must not rewrite when it finished. Leaving
        // DONE clears it, so a reopened task does not claim a completion date.
        completedAt:
          data.status === "DONE" ? (existing.completedAt ?? new Date()) : null,
      },
    });

    revalidateBoard();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Could not save the task" };
  }
}

/** Drag-drop and the keyboard "move to" menu both land here — one write path. */
export async function moveTask(raw: unknown): Promise<Result> {
  const session = await auth();
  if (!session) return { success: false, error: "Not authorised" };

  const parsed = moveTaskSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid move" };
  }
  const { id, status, toIndex } = parsed.data;

  try {
    const task = await db.task.findUnique({
      where: { id },
      select: { id: true, status: true, completedAt: true },
    });
    if (!task) return { success: false, error: "Task not found" };

    // Siblings EXCLUDING the moving card: if it is already in this column, its
    // own row would otherwise shift every index by one and land the card next
    // to where it was dropped instead of on it.
    const siblings = await db.task.findMany({
      // Archived rows are excluded too: they hold positions the board does not
      // show, so counting them would land the card at the wrong index.
      where: { status, ...LIVE, NOT: { id: task.id } },
      select: { position: true },
      orderBy: { position: "asc" },
      take: 500,
    });

    await db.task.update({
      where: { id: task.id },
      data: {
        status,
        position: positionAt(siblings, toIndex),
        completedAt: status === "DONE" ? (task.completedAt ?? new Date()) : null,
      },
    });

    revalidateBoard();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Could not move the task" };
  }
}

/**
 * Take a task off the board without destroying it.
 *
 * There is no delete in this feature at all — Khalid, 2026-09-02: «مافي حذف،
 * أرشفه بدل الحذف». Who did what and when is the point of a board a team shares;
 * a row that can vanish makes that history a guess.
 */
export async function archiveTask(id: string): Promise<Result> {
  const session = await auth();
  if (!session) return { success: false, error: "Not authorised" };
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return { success: false, error: "Invalid id" };

  try {
    const task = await db.task.findUnique({
      where: { id },
      select: { id: true, archivedAt: true },
    });
    if (!task) return { success: false, error: "Task not found" };
    if (task.archivedAt) return { success: false, error: "Task is already archived" };

    await db.task.update({ where: { id: task.id }, data: { archivedAt: new Date() } });
    revalidateBoard();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Could not archive the task" };
  }
}

/**
 * Put an archived task back on the board.
 *
 * It returns to the column it left, and to the TOP of it: its old `position`
 * may sit between two cards that no longer exist, and a card you deliberately
 * brought back should be visible, not buried.
 */
export async function restoreTask(id: string): Promise<Result> {
  const session = await auth();
  if (!session) return { success: false, error: "Not authorised" };
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return { success: false, error: "Invalid id" };

  try {
    const task = await db.task.findUnique({
      where: { id },
      select: { id: true, status: true, archivedAt: true },
    });
    if (!task) return { success: false, error: "Task not found" };
    if (!task.archivedAt) return { success: false, error: "Task is not archived" };

    const first = await db.task.findFirst({
      where: { status: task.status, ...LIVE },
      select: { position: true },
      orderBy: { position: "asc" },
    });

    await db.task.update({
      where: { id: task.id },
      data: { archivedAt: null, position: first ? first.position - 1000 : 1000 },
    });

    revalidateBoard();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Could not restore the task" };
  }
}
