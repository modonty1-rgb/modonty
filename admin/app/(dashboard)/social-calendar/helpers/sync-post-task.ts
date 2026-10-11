import "server-only";

import type { Prisma, TaskStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { TASK_NOT_ARCHIVED } from "@/lib/tasks/not-archived";

import { MONTH_LABELS } from "./dates";
import type { SocialPostNotifyInput } from "./notify-post-event";
import { postHref } from "./post-href";

/**
 * تاسك التصميم يتبع المنشور (خالد ١١ أكتوبر ٢٠٢٦: «ما يكون في دبل وورك»).
 *
 * المنشور هو المصدر، والتاسك نافذة المصمم عليه في نظام المهام:
 *   منشور جديد بمصمم  → تاسك «للعمل» عنده، موعده قبل النشر بيومين
 *   جاهز للمراجعة      → التاسك «مراجعة»
 *   رفض بسبب           → التاسك يرجع «جاري» وسبب الرفض ملاحظته
 *   موافقة / نشر        → التاسك «تم»
 * لا يُحرَّك التاسك المربوط من البورد (`lib/tasks/task-actions.ts`) — المراجعة في التقويم.
 * يُستدعى من `notifySocialPostEvent` الذي يمرّ به كل حدث، ومن تعديل المنشور عند تغيير المصمم.
 */
const DUE_DAYS_BEFORE = 2; // مؤقّت حتى يحدّده خالد
const DAY_MS = 86_400_000;

function taskTitle(idea: string): string {
  return `تصميم: ${idea || "بدون فكرة"}`.slice(0, 200);
}

function taskDescription(post: SocialPostNotifyInput["post"], clientName: string): string {
  const d = post.scheduledFor;
  return [
    `${clientName} — يوم ${d.getUTCDate()} ${MONTH_LABELS[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
    "حالة هذا التاسك تتبع المنشور في التقويم — ارفع التصميم من صفحة الإنتاج.",
    `صفحة الإنتاج: ${postHref(post.calendarId, post.id, "production")}`,
  ].join("\n");
}

async function topPosition(status: TaskStatus, assigneeId: string): Promise<number> {
  const first = await db.task.findFirst({
    where: { status, assigneeId, ...TASK_NOT_ARCHIVED },
    select: { position: true },
    orderBy: { position: "asc" },
  });
  return first ? first.position - 1000 : 1000;
}

/** ينشئ تاسك المنشور، أو يحدّث مصمّمه إن وُجد — بلا مصمم لا تاسك (يظهر «بدون مصمم» في التقويم). */
export async function upsertPostTask(post: SocialPostNotifyInput["post"], clientName: string, actorId: string): Promise<void> {
  const existing = await db.task.findFirst({
    where: { socialPostId: post.id, ...TASK_NOT_ARCHIVED },
    select: { id: true, assigneeId: true, status: true },
  });
  if (!post.creativeAssigneeId) {
    if (existing) await db.task.update({ where: { id: existing.id }, data: { assigneeId: null } });
    return;
  }
  const dueDate = new Date(post.scheduledFor.getTime() - DUE_DAYS_BEFORE * DAY_MS);
  if (existing) {
    await db.task.update({
      where: { id: existing.id },
      data: { assigneeId: post.creativeAssigneeId, title: taskTitle(post.idea), description: taskDescription(post, clientName), dueDate },
    });
    return;
  }
  await db.task.create({
    data: {
      title: taskTitle(post.idea),
      description: taskDescription(post, clientName),
      status: "TODO",
      priority: "NORMAL",
      position: await topPosition("TODO", post.creativeAssigneeId),
      dueDate,
      assigneeId: post.creativeAssigneeId,
      createdById: actorId,
      socialPostId: post.id,
    },
  });
}

/** حالة التاسك من حدث المنشور. */
export async function syncPostTask(input: SocialPostNotifyInput): Promise<void> {
  try {
    if (input.event === "created") {
      await upsertPostTask(input.post, input.clientName, input.actorId);
      return;
    }
    const now = new Date();
    const data: Record<Exclude<SocialPostNotifyInput["event"], "created">, Prisma.TaskUpdateManyMutationInput> = {
      readyForReview: { status: "REVIEW", reviewNote: null, completedAt: null },
      rejected: { status: "IN_PROGRESS", reviewNote: input.note?.trim() || null, completedAt: null },
      approved: { status: "DONE", reviewNote: null, completedAt: now },
      published: { status: "DONE", reviewNote: null },
    };
    await db.task.updateMany({ where: { socialPostId: input.post.id, ...TASK_NOT_ARCHIVED }, data: data[input.event] });
  } catch (error) {
    // التاسك مرآة — فشله لا يُفشل حدث المنشور.
    console.error("[social-calendar] post task sync failed", { event: input.event, postId: input.post.id, error });
  }
}
