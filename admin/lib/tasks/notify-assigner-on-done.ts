import { db } from "@/lib/db";
import { RealtimeEvent, staffChannel } from "@/lib/realtime/channels";
import { publish } from "@/lib/realtime/publish";

/**
 * **إشعارُ مَن أسند المهمّة حين ينقلها منفّذُها إلى «منجَزة»** (خالد ٦ أكتوبر ٢٠٢٦: مَن يُسند
 * مهمّةً لزميل لا يعرف أنّها خلصت إلّا لو قيل له).
 *
 * ── إلى `createdById` ──
 * هو مَن كتب المهمّة وأسندها (`createTask` يكتبه من الجلسة)، أيّاً كان دوره — القاعدةُ لكلّ
 * موظّف لا للأدمن وحده.
 *
 * ── ولا يُشعَر مَن أنهى بنفسه ──
 * مهمّةٌ كتبها الموظّفُ لنفسه، أو اعتمدها مُسنِدُها بيده (`approveTask`)، لا خبرَ فيها لأحد.
 * نفسُ حارسِ `notifyAssignee` وللسبب نفسِه: الضجيجُ يجعل الجرسَ كلَّه يُتجاهَل.
 *
 * ── نفسُ قناة «مهمّة جديدة» بالضبط ──
 * صفٌّ في `notifications` بـ`staffId` + نبضة `NOTIFICATION_NEW` على قناة المُسنِد. ومعها
 * `TASKS_CHANGED` لأنّ جدولَ «Assign Task» عنده يعرض حالةَ المهمّة فتتحدّث بلا أن يلمس شيئاً.
 *
 * ── ولا يُسقط الحركة ──
 * البطاقةُ انتقلت فعلاً؛ فشلُ الإشعار يُسجَّل ويمضي.
 *
 * «متى» = `createdAt` للصفّ، والجرسُ يعرضه (`notifications-bell.tsx` ← `timeAgo`).
 */
export async function notifyAssignerOnDone(p: {
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
        type: "task_done",
        title: `أنجز ${from} المهمّة اللي أسندتها له`,
        body: p.title,
        relatedId: p.taskId,
      },
      select: { id: true },
    });
    publish(staffChannel(p.createdById), RealtimeEvent.NOTIFICATION_NEW);
    publish(staffChannel(p.createdById), RealtimeEvent.TASKS_CHANGED);
  } catch (error) {
    console.error("[tasks] notifyAssignerOnDone failed", error);
  }
}
