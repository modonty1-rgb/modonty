import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { canSeeReports } from "@/lib/can-see-reports";
import { type TaskStatusKey } from "@/lib/tasks/task-config";
import { isTaskLate } from "@/lib/tasks/is-task-late";

import { AssignTaskButton } from "./components/assign-task-button";
import { SentTasksTable, type SentTaskRow } from "./components/sent-tasks-table";

export const metadata = { title: "Assign Task" };


/**
 * **Assign Task — إسنادُ المهامّ ومتابعتُها** (خالد ٢٣ سبتمبر ٢٠٢٦).
 *
 * كان الإسنادُ زرّاً داخل «Everyone's Tasks»، وتلك صفحةُ تقرير: تُقرأ ولا يُكتب فيها. فصار
 * للإسناد بابُه: زرٌّ يُسند، وتحته كلُّ ما أسندتَه لزملائك وأين وصل — مفتوح · متأخّر · بانتظار
 * اعتمادك · منجَز. و«Reviews» تبقى صفحتَها (قرار خالد): هنا المتابعة، وهناك القرار.
 *
 * مَن يُسند: مَن يرى التقارير — نفسُ حارس `createTask` (`lib/tasks/task-actions.ts`)، فلا
 * يرى أحدٌ زرّاً يرفضه الخادم.
 */
export default async function AssignTaskPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;

  const me = await db.staff.findUnique({ where: { id: userId }, select: { role: true, canViewReports: true } });
  if (!canSeeReports(me)) redirect("/tasks");

  const [staff, openTasks, sent] = await Promise.all([
    db.staff.findMany({
      // Older staff rows may not have `isActive` written; absent means active.
      where: { OR: [{ isActive: true }, { isActive: { isSet: false } }] },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
      take: 200,
    }),
    // حِملُ كلّ زميلٍ الآن — يظهر على بطاقته في نافذة الإسناد كي لا يُسند لمن غرق.
    db.task.findMany({
      where: {
        NOT: [{ status: "DONE" }],
        OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
      },
      select: { assigneeId: true, dueDate: true, status: true },
      take: 5000,
    }),
    db.task.findMany({
      where: {
        createdById: userId,
        NOT: [{ assigneeId: userId }],
        // المؤرشفُ خارج — والحقلُ الغائبُ في مونغو لا يطابق `null`، فيُسأل الشكلان.
        OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
      },
      select: {
        id: true, title: true, description: true, status: true, priority: true, dueDate: true, createdAt: true, completedAt: true,
        assignee: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  const now = Date.now();
  const load = new Map<string, { open: number; late: number }>();
  for (const t of openTasks) {
    if (!t.assigneeId) continue;
    const l = load.get(t.assigneeId) ?? { open: 0, late: 0 };
    l.open += 1;
    if (isTaskLate(t, now)) l.late += 1;
    load.set(t.assigneeId, l);
  }
  // لا يُسند المرءُ لنفسه من هنا — لوحتُه لذلك.
  const assignees = staff
    .filter((a) => a.id !== userId)
    .map((a) => ({ ...a, open: load.get(a.id)?.open ?? 0, late: load.get(a.id)?.late ?? 0 }));
  const rows: SentTaskRow[] = sent.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status as TaskStatusKey,
    priority: t.priority,
    dueDate: t.dueDate,
    createdAt: t.createdAt,
    completedAt: t.completedAt,
    late: isTaskLate(t, now),
    assignee: t.assignee ? { id: t.assignee.id, name: t.assignee.name, image: t.assignee.image } : null,
    assigneeName: t.assignee?.name?.trim() || t.assignee?.email || "—",
  }));

  return (
    <div className="space-y-3" dir="rtl">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Assign Task</h2>
          <p className="text-sm text-muted-foreground">أسند مهمّةً لزميل، وتابع أين وصلت كلُّ مهمّةٍ أسندتَها.</p>
        </div>
        <AssignTaskButton assignees={assignees} />
      </header>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-10 text-center">
          <p className="text-sm font-medium">لم تُسند مهمّةً لأحدٍ بعد</p>
          <p className="text-[13px] text-muted-foreground">اضغط «إسناد مهمّة»، واختر الزميل — تظهر هنا وتتابعها حتى تُنجَز.</p>
        </div>
      ) : (
        <SentTasksTable rows={rows} />
      )}
    </div>
  );
}
