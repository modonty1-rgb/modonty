"use server";

import { revalidatePath } from "next/cache";
import type { Session } from "next-auth";

import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { canSeeReports } from "@/lib/can-see-reports";
import { db } from "@/lib/db";

import { RealtimeEvent, staffChannel } from "@/lib/realtime/channels";
import { publish } from "@/lib/realtime/publish";

import { TASK_NOT_ARCHIVED } from "./not-archived";
import { createTaskSchema, moveTaskSchema, updateTaskSchema } from "./task-schema";

// Every action follows the same order: session → Zod → try/catch → revalidate.
// Errors are RETURNED, never thrown: a thrown error inside a server action lands
// the whole board on error.tsx, and losing the board is a worse outcome than one
// card refusing to move.

type Result = { success: true } | { success: false; error: string };

/**
 * **بطاقةٌ تتحرّك تُبطل لوحتَها وشريطَ الأدمن كلَّه.**
 *
 * كان `revalidatePath("/tasks", "layout")` وحده — فأعمدةُ اللوحة تتحدّث، وبادجُ «Tasks»
 * في الشريط يبقى على رقمه القديم في كلّ صفحةٍ خارج `/tasks`. مقيس (خالد ٢٠ سبتمبر ٢٠٢٦):
 * «التاسك لمّا نحرّكها العدّاد ما يتغيّر».
 *
 * والسببُ أنّ البادج يُحسب في `app/(dashboard)/layout.tsx` — تخطيطٌ يغطّي الأدمن كلَّه،
 * لا تخطيطَ `/tasks`. فيُبطَل الجذرُ معه: `revalidatePath("/", "layout")` يشمل كلَّ ما
 * تحته، فيُعاد حسابُ العدّاد أينما كان الموظّف واقفاً.
 *
 * ── ولا يكفي وحدَه حين يكون صاحبُ المهمّة شخصاً آخر ──
 * `revalidatePath` يصل مَن نفّذ الحركة وحده: الصفحةُ التي يرسمها الخادمُ له الآن. أمّا
 * صاحبُ المهمّة الجالسُ في متصفّحه فلا شيء يخبره حتّى ينتقل. فمعه نبضةٌ على قناته
 * (`assigneeId`) يُعاد بها حسابُ بادجه من مونغو بلا أن يلمس شيئاً.
 */
const revalidateBoard = (assigneeId?: string) => {
  revalidatePath("/tasks", "layout");
  revalidatePath("/", "layout");
  if (assigneeId) publish(staffChannel(assigneeId), RealtimeEvent.TASKS_CHANGED);
};

/** Empty string from a `<select>`/`<input>` means "not set", not "set to empty". */
const orNull = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

/**
 * "Not archived", in the only form Mongo answers correctly.
 *
 * An optional field that was never written is ABSENT, and `archivedAt: null`
 * does NOT match an absent field. Measured: with a plain `archivedAt: null`
 * filter, `create` reported success and every card vanished on the next reload
 * — six rows were in the database and invisible.
 *
 * The condition itself moved to [TASK_NOT_ARCHIVED] once the header badge was
 * measured counting archived cards — a second reader means it needs one home.
 */
const LIVE: Prisma.TaskWhereInput = TASK_NOT_ARCHIVED;

/** Task cards are private to their assignee. Enforce this on the server too:
 * hiding a card in the browser must not make its action endpoints public. */
// `auth` has middleware overloads as well as its server-session overload. Using
// ReturnType<typeof auth> selects the middleware signature in TypeScript, even
// though this call site awaits a Session. Name the value we actually receive.
function sessionUserId(session: Session | null): string | null {
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

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

/**
 * **إشعارُ الجرس حين يُسنِد إليك أحدٌ مهمّة** (خالد ٢٠ سبتمبر ٢٠٢٦: «لمّا يجيني تاسك من
 * شخص ثاني تجيني في النوتيفيكيشن اللي عند الجرس»).
 *
 * ── ولا يُشعَر مَن أسند لنفسه ──
 * الموظّفُ يكتب مهامَّه بنفسه في الغالب (`createTask` يُسندها له افتراضاً)، فإشعارُه
 * بما كتبه قبل ثانية ضجيجٌ يجعله يتجاهل الجرسَ كلَّه — وحينها يضيع الإشعارُ الذي يهمّ.
 *
 * ── ولا يُسقط المهمّة ──
 * الكتابةُ نجحت، وفشلُ الإشعار لا يُلغيها. فالخطأ يُبلَّغ في السجلّ ويمضي — كما يفعل
 * `logAction` بالضبط، وللسبب نفسِه.
 *
 * ── ولماذا `staffId` لا `userId` ──
 * الصفُّ يقبل الاثنين (`schema.prisma:3636-3639`)، و`userId` لقرّاء مدونتي. والموظّفون
 * في `Staff` منذ فُصل الجدولان، فهذا هو الحقلُ الذي يقرؤه جرسُ الأدمن.
 */
async function notifyAssignee(p: {
  taskId: string;
  title: string;
  assigneeId: string;
  actorId: string;
}): Promise<void> {
  if (p.assigneeId === p.actorId) return;
  try {
    const actor = await db.staff.findUnique({ where: { id: p.actorId }, select: { name: true, email: true } });
    const from = actor?.name?.trim() || actor?.email?.trim() || "زميل";
    await db.notification.create({
      data: {
        staffId: p.assigneeId,
        type: "task_assigned",
        title: `مهمّة جديدة من ${from}`,
        body: p.title,
        relatedId: p.taskId,
      },
    });
    publish(staffChannel(p.assigneeId), RealtimeEvent.NOTIFICATION_NEW);
  } catch (error) {
    console.error("[tasks] notifyAssignee failed", error);
  }
}

/**
 * **إشعارُ صاحب الطلب حين تبلغ مهمّتُه عمودَ المراجعة** (خالد ٢٠ سبتمبر ٢٠٢٦: «جاني تاسك
 * من روان وخلّصته ووديته على الريفيو… أبغى أرسل له إشعار إن التاسك محتاج المراجعة تبعتك»).
 *
 * ── إلى `createdById` لا إلى المُسنَد إليه ──
 * المراجعُ هو مَن كتب المهمّة وأسندها، لا مَن نفّذها. والحقلُ مكتوبٌ منذ `createTask`
 * (`schema.prisma:364`)، فلا حاجةَ لحقلٍ جديد.
 *
 * ── ولا يُشعَر مَن راجع نفسَه ──
 * المهمّةُ التي كتبها الموظّفُ لنفسه `createdById === assigneeId`، فتحريكُها إلى
 * `REVIEW` حدثٌ داخليٌّ لا يعني أحداً. نفسُ حارسِ [notifyAssignee] وللسبب نفسِه.
 *
 * ── ولا يُرسَل مرّتين على نفس الانتقال ──
 * الشرطُ في نداءِ الدالّة: الحالةُ القديمة **ليست** `REVIEW`. وبدونه يُعيد كلُّ سحبٍ
 * داخل عمود المراجعة (ترتيبٌ فقط، لا انتقال) إشعاراً جديداً.
 *
 * ── ولا يُسقط الحركة ──
 * البطاقةُ تحرّكت فعلاً؛ فشلُ الإشعار يُسجَّل ويمضي، كما في [notifyAssignee].
 */
async function notifyReviewer(p: {
  taskId: string;
  title: string;
  createdById: string | null;
  actorId: string;
}): Promise<void> {
  if (!p.createdById || p.createdById === p.actorId) return;
  try {
    const actor = await db.staff.findUnique({ where: { id: p.actorId }, select: { name: true, email: true } });
    const from = actor?.name?.trim() || actor?.email?.trim() || "زميل";
    await db.notification.create({
      data: {
        staffId: p.createdById,
        type: "task_review",
        title: `مهمّة تنتظر مراجعتك من ${from}`,
        body: p.title,
        relatedId: p.taskId,
      },
    });
    publish(staffChannel(p.createdById), RealtimeEvent.NOTIFICATION_NEW);
    // عدّادُ «Reviews» عند المراجِع يُحسب من مونغو — نبضةٌ تُعيده بلا أن يلمس شيئاً.
    publish(staffChannel(p.createdById), RealtimeEvent.TASKS_CHANGED);
  } catch (error) {
    console.error("[tasks] notifyReviewer failed", error);
  }
}

/** سحبُ المنفّذِ مهمّتَه من REVIEW يُنقص طابورَ مراجِعها — فيُعاد حسابُ عدّاده. */
function pingReviewer(createdById: string | null, actorId: string): void {
  if (createdById && createdById !== actorId) publish(staffChannel(createdById), RealtimeEvent.TASKS_CHANGED);
}

/**
 * **قرارُ المراجِع — اعتمادٌ أو إرجاعٌ بملاحظة** (خالد ٢٣ سبتمبر ٢٠٢٦).
 *
 * ── مَن يقرّر ──
 * كاتبُ المهمّة وحده، ما دامت في REVIEW ومُسنَدةً لغيره. لوحةُ الموظّف خاصّةٌ به
 * (`assigneeId !== userId` تُرفض في كلّ فعلٍ آخر هنا)، وهذا البابُ الوحيد الذي يلمس فيه
 * غيرُ المنفّذ مهمّته — وبفعلين لا غير: لا يعدّل نصَّها ولا يحرّكها إلى عمودٍ ثالث.
 *
 * ── والمنفّذُ يعرف فوراً ──
 * إشعارٌ في جرسه، ونبضةٌ تُعيد رسمَ لوحته وبادجه.
 */
async function loadForReview(id: string, reviewerId: string) {
  const task = await db.task.findUnique({
    where: { id },
    select: { id: true, title: true, status: true, assigneeId: true, createdById: true, archivedAt: true },
  });
  if (
    !task ||
    task.archivedAt ||
    task.createdById !== reviewerId ||
    !task.assigneeId ||
    task.assigneeId === reviewerId
  ) {
    return { error: "Task not found" } as const;
  }
  if (task.status !== "REVIEW") return { error: "This task is no longer waiting for review" } as const;
  return { task: { ...task, assigneeId: task.assigneeId } } as const;
}

async function notifyDecision(p: { to: string; actorId: string; taskId: string; type: string; title: (from: string) => string; body: string }) {
  try {
    const actor = await db.staff.findUnique({ where: { id: p.actorId }, select: { name: true, email: true } });
    const from = actor?.name?.trim() || actor?.email?.trim() || "زميل";
    await db.notification.create({
      data: { staffId: p.to, type: p.type, title: p.title(from), body: p.body, relatedId: p.taskId },
    });
    publish(staffChannel(p.to), RealtimeEvent.NOTIFICATION_NEW);
  } catch (error) {
    console.error("[tasks] notifyDecision failed", error);
  }
}

/** أعلى العمود: القرارُ الأحدث يُرى أوّلاً في لوحة المنفّذ. */
async function topOf(status: "DONE" | "IN_PROGRESS", assigneeId: string): Promise<number> {
  const first = await db.task.findFirst({
    where: { status, assigneeId, ...LIVE },
    select: { position: true },
    orderBy: { position: "asc" },
  });
  return first ? first.position - 1000 : 1000;
}

export async function approveTask(id: string): Promise<Result> {
  const userId = sessionUserId(await auth());
  if (!userId) return { success: false, error: "Not authorised" };
  if (!id) return { success: false, error: "Task not found" };

  try {
    const loaded = await loadForReview(id, userId);
    if ("error" in loaded) return { success: false, error: loaded.error as string };
    const { task } = loaded;

    await db.task.update({
      where: { id: task.id },
      data: { status: "DONE", completedAt: new Date(), reviewNote: null, position: await topOf("DONE", task.assigneeId) },
    });
    await notifyDecision({
      to: task.assigneeId,
      actorId: userId,
      taskId: task.id,
      type: "task_approved",
      title: (from) => `اعتمد ${from} مهمّتك`,
      body: task.title,
    });

    revalidateBoard(task.assigneeId);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Could not approve the task" };
  }
}

const returnTaskSchema = z.object({
  id: z.string().min(1),
  note: z.string().trim().min(3, "اكتب ملاحظتك — ثلاثة أحرف على الأقل").max(1000, "الملاحظة طويلة"),
});

export async function returnTask(raw: unknown): Promise<Result> {
  const userId = sessionUserId(await auth());
  if (!userId) return { success: false, error: "Not authorised" };

  const parsed = returnTaskSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid note" };
  const { id, note } = parsed.data;

  try {
    const loaded = await loadForReview(id, userId);
    if ("error" in loaded) return { success: false, error: loaded.error as string };
    const { task } = loaded;

    await db.task.update({
      where: { id: task.id },
      data: {
        status: "IN_PROGRESS",
        completedAt: null,
        reviewNote: note,
        position: await topOf("IN_PROGRESS", task.assigneeId),
      },
    });
    await notifyDecision({
      to: task.assigneeId,
      actorId: userId,
      taskId: task.id,
      type: "task_returned",
      title: (from) => `أرجع ${from} مهمّتك بملاحظة`,
      body: `${task.title} — ${note}`,
    });

    revalidateBoard(task.assigneeId);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Could not send the task back" };
  }
}

export async function createTask(raw: unknown): Promise<Result> {
  const session = await auth();
  const userId = sessionUserId(session);
  if (!userId) return { success: false, error: "Not authorised" };

  const parsed = createTaskSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Missing data" };
  }
  const data = parsed.data;

  try {
    // The report UI is available to Admins and staff with `canViewReports`; both
    // may assign a newly created report task. The destination is still verified
    // against an active staff record rather than trusted from the browser.
    const actor = await db.staff.findUnique({
      where: { id: userId },
      select: { role: true, canViewReports: true },
    });
    const assigneeId = canSeeReports(actor) ? (orNull(data.assigneeId) ?? userId) : userId;
    const assignee = await db.staff.findUnique({
      where: { id: assigneeId },
      select: { id: true, isActive: true },
    });
    if (!assignee || assignee.isActive === false) {
      return { success: false, error: "Choose an active user" };
    }

    // New cards go to the TOP of their column: a task you just wrote is the one
    // you are thinking about, and burying it under fifty older rows is why
    // "add" and "then scroll to find it" became two steps in other tools.
    const first = await db.task.findFirst({
      where: { status: data.status, assigneeId, ...LIVE },
      select: { position: true },
      orderBy: { position: "asc" },
    });

    const created = await db.task.create({
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
        assigneeId,
        createdById: userId,
        completedAt: data.status === "DONE" ? new Date() : null,
        // Written explicitly so the field EXISTS as null instead of being absent
        // — see `LIVE` above for what absent costs.
        archivedAt: null,
      },
      select: { id: true, title: true },
    });

    await notifyAssignee({ taskId: created.id, title: created.title, assigneeId, actorId: userId });

    // `assigneeId` لا `userId`: البطاقةُ قد تكون كُتبت لزميل، والبادجُ الذي تغيّر بادجُه هو.
    revalidateBoard(assigneeId);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Could not create the task" };
  }
}

export async function updateTask(raw: unknown): Promise<Result> {
  const session = await auth();
  const userId = sessionUserId(session);
  if (!userId) return { success: false, error: "Not authorised" };

  const parsed = updateTaskSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Missing data" };
  }
  const data = parsed.data;

  try {
    const existing = await db.task.findUnique({
      where: { id: data.id },
      select: { id: true, status: true, completedAt: true, assigneeId: true, createdById: true },
    });
    if (!existing) return { success: false, error: "Task not found" };
    if (existing.assigneeId !== userId) return { success: false, error: "Task not found" };

    await db.task.update({
      where: { id: existing.id },
      data: {
        title: data.title,
        description: orNull(data.description),
        status: data.status,
        priority: data.priority,
        dueDate: parseDueDate(data.dueDate),
        // Tasks cannot be reassigned through a personal board.
        assigneeId: userId,
        // Stamped the first time it reaches DONE and never overwritten after —
        // editing a finished task must not rewrite when it finished. Leaving
        // DONE clears it, so a reopened task does not claim a completion date.
        completedAt:
          data.status === "DONE" ? (existing.completedAt ?? new Date()) : null,
        // تسليمٌ جديد للمراجعة يطوي ملاحظةَ الإرجاع السابقة — عولجت أو لا، فالمراجِعُ يحكم.
        ...(data.status === "REVIEW" && existing.status !== "REVIEW" ? { reviewNote: null } : {}),
      },
    });

    if (existing.status === "REVIEW" && data.status !== "REVIEW") pingReviewer(existing.createdById, userId);
    if (data.status === "REVIEW" && existing.status !== "REVIEW") {
      await notifyReviewer({
        taskId: existing.id,
        title: data.title,
        createdById: existing.createdById,
        actorId: userId,
      });
    }

    revalidateBoard(userId);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Could not save the task" };
  }
}

/** Drag-drop and the keyboard "move to" menu both land here — one write path. */
export async function moveTask(raw: unknown): Promise<Result> {
  const session = await auth();
  const userId = sessionUserId(session);
  if (!userId) return { success: false, error: "Not authorised" };

  const parsed = moveTaskSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid move" };
  }
  const { id, status, toIndex } = parsed.data;

  try {
    const task = await db.task.findUnique({
      where: { id },
      select: { id: true, title: true, status: true, completedAt: true, assigneeId: true, createdById: true },
    });
    if (!task) return { success: false, error: "Task not found" };
    if (task.assigneeId !== userId) return { success: false, error: "Task not found" };

    // Siblings EXCLUDING the moving card: if it is already in this column, its
    // own row would otherwise shift every index by one and land the card next
    // to where it was dropped instead of on it.
    const siblings = await db.task.findMany({
      // Archived rows are excluded too: they hold positions the board does not
      // show, so counting them would land the card at the wrong index.
      where: { status, assigneeId: userId, ...LIVE, NOT: { id: task.id } },
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
        ...(status === "REVIEW" && task.status !== "REVIEW" ? { reviewNote: null } : {}),
      },
    });

    if (task.status === "REVIEW" && status !== "REVIEW") pingReviewer(task.createdById, userId);
    if (status === "REVIEW" && task.status !== "REVIEW") {
      await notifyReviewer({
        taskId: task.id,
        title: task.title,
        createdById: task.createdById,
        actorId: userId,
      });
    }

    revalidateBoard(userId);
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
  const userId = sessionUserId(session);
  if (!userId) return { success: false, error: "Not authorised" };
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return { success: false, error: "Invalid id" };

  try {
    const task = await db.task.findUnique({
      where: { id },
      select: { id: true, archivedAt: true, assigneeId: true },
    });
    if (!task) return { success: false, error: "Task not found" };
    if (task.assigneeId !== userId) return { success: false, error: "Task not found" };
    if (task.archivedAt) return { success: false, error: "Task is already archived" };

    await db.task.update({ where: { id: task.id }, data: { archivedAt: new Date() } });
    revalidateBoard(userId);
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
  const userId = sessionUserId(session);
  if (!userId) return { success: false, error: "Not authorised" };
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return { success: false, error: "Invalid id" };

  try {
    const task = await db.task.findUnique({
      where: { id },
      select: { id: true, status: true, archivedAt: true, assigneeId: true },
    });
    if (!task) return { success: false, error: "Task not found" };
    if (task.assigneeId !== userId) return { success: false, error: "Task not found" };
    if (!task.archivedAt) return { success: false, error: "Task is not archived" };

    const first = await db.task.findFirst({
      where: { status: task.status, assigneeId: userId, ...LIVE },
      select: { position: true },
      orderBy: { position: "asc" },
    });

    await db.task.update({
      where: { id: task.id },
      data: { archivedAt: null, position: first ? first.position - 1000 : 1000 },
    });

    revalidateBoard(userId);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Could not restore the task" };
  }
}
