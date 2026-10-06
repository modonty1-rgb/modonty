import type { TaskStatusKey } from "./task-config";

/**
 * متأخّرةٌ = فات موعدُها وهي بعدُ عند المنفّذ («لم تبدأ» أو «قيد التنفيذ»).
 *
 * ما في المراجعة ليس متأخّراً (خالد ٣ أكتوبر ٢٠٢٦): المنفّذ سلّم، والكرةُ عند المراجِع —
 * كانت تُصبغ حمراءَ في عمود «Review» وتُعدّ عليه في «Assign Task». قاعدةٌ واحدة يقرؤها
 * اللوحةُ وصفحةُ الإسناد ونافذةُ الإسناد، كي لا يقول مكانٌ «متأخّرة» ويسكت آخر.
 */
export function isTaskLate(task: { dueDate: Date | null; status: TaskStatusKey | string }, now = Date.now()): boolean {
  if (!task.dueDate || (task.status !== "TODO" && task.status !== "IN_PROGRESS")) return false;
  return new Date(task.dueDate).setHours(23, 59, 59, 999) < now;
}
