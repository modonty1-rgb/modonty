"use server";

import { revalidatePath } from "next/cache";

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
  if (!session) return { success: false, error: "غير مصرّح" };

  const parsed = createTaskSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "بيانات ناقصة" };
  }
  const data = parsed.data;

  try {
    // New cards go to the TOP of their column: a task you just wrote is the one
    // you are thinking about, and burying it under fifty older rows is why
    // "add" and "then scroll to find it" became two steps in other tools.
    const first = await db.task.findFirst({
      where: { status: data.status },
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
        assigneeId: orNull(data.assigneeId),
        createdById: (session.user as { id?: string })?.id ?? null,
        completedAt: data.status === "DONE" ? new Date() : null,
      },
    });

    revalidateBoard();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "فشل إنشاء المهمة" };
  }
}

export async function updateTask(raw: unknown): Promise<Result> {
  const session = await auth();
  if (!session) return { success: false, error: "غير مصرّح" };

  const parsed = updateTaskSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "بيانات ناقصة" };
  }
  const data = parsed.data;

  try {
    const existing = await db.task.findUnique({
      where: { id: data.id },
      select: { id: true, status: true, completedAt: true },
    });
    if (!existing) return { success: false, error: "المهمة مش موجودة — يمكن حد حذفها" };

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
    return { success: false, error: e instanceof Error ? e.message : "فشل حفظ المهمة" };
  }
}

/** Drag-drop and the keyboard "move to" menu both land here — one write path. */
export async function moveTask(raw: unknown): Promise<Result> {
  const session = await auth();
  if (!session) return { success: false, error: "غير مصرّح" };

  const parsed = moveTaskSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "نقل غير صالح" };
  }
  const { id, status, toIndex } = parsed.data;

  try {
    const task = await db.task.findUnique({
      where: { id },
      select: { id: true, status: true, completedAt: true },
    });
    if (!task) return { success: false, error: "المهمة مش موجودة — يمكن حد حذفها" };

    // Siblings EXCLUDING the moving card: if it is already in this column, its
    // own row would otherwise shift every index by one and land the card next
    // to where it was dropped instead of on it.
    const siblings = await db.task.findMany({
      where: { status, NOT: { id: task.id } },
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
    return { success: false, error: e instanceof Error ? e.message : "فشل نقل المهمة" };
  }
}

export async function deleteTask(id: string): Promise<Result> {
  const session = await auth();
  if (!session) return { success: false, error: "غير مصرّح" };
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return { success: false, error: "المعرّف غير صالح" };

  try {
    const task = await db.task.findUnique({ where: { id }, select: { id: true } });
    if (!task) return { success: false, error: "المهمة مش موجودة — يمكن حد حذفها قبلك" };

    await db.task.delete({ where: { id: task.id } });
    revalidateBoard();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "فشل حذف المهمة" };
  }
}
