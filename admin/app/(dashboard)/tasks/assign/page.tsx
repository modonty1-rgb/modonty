import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { canSeeReports } from "@/lib/can-see-reports";
import { TASK_PRIORITY_META, TASK_STATUS_META, type TaskStatusKey } from "@/lib/tasks/task-config";
import { cn } from "@/lib/utils";

import { AssignTaskButton } from "./components/assign-task-button";

export const metadata = { title: "Assign Task" };

const dateFmt = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long" });
const N = new Intl.NumberFormat("ar-EG");

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
      select: { assigneeId: true, dueDate: true },
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
        id: true, title: true, status: true, priority: true, dueDate: true, createdAt: true, completedAt: true,
        assignee: { select: { name: true, email: true, image: true } },
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
    if (t.dueDate && new Date(t.dueDate).setHours(23, 59, 59, 999) < now) l.late += 1;
    load.set(t.assigneeId, l);
  }
  // لا يُسند المرءُ لنفسه من هنا — لوحتُه لذلك.
  const assignees = staff
    .filter((a) => a.id !== userId)
    .map((a) => ({ ...a, open: load.get(a.id)?.open ?? 0, late: load.get(a.id)?.late ?? 0 }));
  const isLate = (t: { dueDate: Date | null; status: string }) =>
    !!t.dueDate && t.status !== "DONE" && new Date(t.dueDate).setHours(23, 59, 59, 999) < now;
  const counts = {
    open: sent.filter((t) => t.status === "TODO" || t.status === "IN_PROGRESS").length,
    late: sent.filter(isLate).length,
    review: sent.filter((t) => t.status === "REVIEW").length,
    done: sent.filter((t) => t.status === "DONE").length,
  };

  return (
    <div className="space-y-3" dir="rtl">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Assign Task</h2>
          <p className="text-sm text-muted-foreground">أسند مهمّةً لزميل، وتابع أين وصلت كلُّ مهمّةٍ أسندتَها.</p>
        </div>
        <AssignTaskButton assignees={assignees} />
      </header>

      {/* الخلاصةُ قبل القائمة — المتأخّرُ مصبوغ، و«بانتظار اعتمادك» تفتح صفحةَ القرار. */}
      <div className="flex flex-wrap items-center gap-2 text-[12px]">
        <span className="rounded-full border bg-card px-2.5 py-1">مفتوحة <b className="tabular-nums">{N.format(counts.open)}</b></span>
        <span className={cn("rounded-full border px-2.5 py-1", counts.late ? "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400" : "bg-card")}>
          متأخّرة <b className="tabular-nums">{N.format(counts.late)}</b>
        </span>
        <Link
          href="/tasks/reviews"
          className={cn("rounded-full border px-2.5 py-1 hover:bg-muted", counts.review ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400" : "bg-card")}
        >
          بانتظار اعتمادك <b className="tabular-nums">{N.format(counts.review)}</b> ←
        </Link>
        <span className="rounded-full border bg-card px-2.5 py-1">منجَزة <b className="tabular-nums">{N.format(counts.done)}</b></span>
      </div>

      {sent.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-10 text-center">
          <p className="text-sm font-medium">لم تُسند مهمّةً لأحدٍ بعد</p>
          <p className="text-[13px] text-muted-foreground">اضغط «إسناد مهمّة»، واختر الزميل والموعد — تظهر هنا وتتابعها حتى تُنجَز.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/60 text-[12px] font-bold">
                <th className="px-3 py-2 text-right">المهمّة</th>
                <th className="px-3 py-2 text-right">إلى</th>
                <th className="px-3 py-2 text-right">الحالة</th>
                <th className="px-3 py-2 text-right">الأولويّة</th>
                <th className="px-3 py-2 text-right">الموعد</th>
                <th className="px-3 py-2 text-right">أُسندت</th>
              </tr>
            </thead>
            <tbody>
              {sent.map((t) => {
                const late = isLate(t);
                const who = t.assignee?.name?.trim() || t.assignee?.email || "—";
                const status = TASK_STATUS_META[t.status as TaskStatusKey];
                return (
                  <tr key={t.id} className={cn("border-b last:border-0", late && "bg-red-500/5")}>
                    <td className="max-w-[360px] px-3 py-2 font-medium">
                      <span className="line-clamp-2">{t.title}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">{who}</td>
                    <td className="px-3 py-2">
                      <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-semibold", status.tone)}>{status.labelAr}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-semibold", TASK_PRIORITY_META[t.priority].tone)}>
                        {TASK_PRIORITY_META[t.priority].labelAr}
                      </span>
                    </td>
                    <td className={cn("whitespace-nowrap px-3 py-2 tabular-nums", late ? "font-bold text-red-600 dark:text-red-400" : "text-muted-foreground")}>
                      {t.dueDate ? dateFmt.format(t.dueDate) : "—"}
                      {late ? " · متأخّرة" : ""}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums text-muted-foreground">{dateFmt.format(t.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
