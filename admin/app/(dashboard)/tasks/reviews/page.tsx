import Link from "next/link";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getReviewQueue } from "@/lib/tasks/review-queue";
import { TASK_PRIORITY_META } from "@/lib/tasks/task-config";
import { cn } from "@/lib/utils";

import { ReviewDecision } from "./components/review-decision";

export const metadata = { title: "Reviews" };

const dateFmt = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long", hour: "numeric", minute: "2-digit", timeZone: "Asia/Riyadh" });
const dueFmt = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long" });
const rtf = new Intl.RelativeTimeFormat("ar-EG", { numeric: "auto" });

/** «قبل ساعتين» · «قبل ٣ أيام» — كم انتظر الزميلُ قرارك، لا تاريخٌ يُحسب في الرأس. */
function waited(since: Date): string {
  const mins = Math.round((Date.now() - since.getTime()) / 60000);
  if (mins < 60) return rtf.format(-Math.max(1, mins), "minute");
  const hours = Math.round(mins / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  return rtf.format(-Math.round(hours / 24), "day");
}

/**
 * **مهامُّ أرسلتَها وتنتظر اعتمادك** (خالد ٢٣ سبتمبر ٢٠٢٦: «مراجعاتي… تكون موجودة عنده على طول»).
 *
 * صفحةٌ لا عمودٌ في اللوحة: اللوحةُ لوحةُ الموظّف بمهامّه هو، وهذه مهامُّ زملائه التي
 * ينتظرون قرارَه فيها. خلطُهما يجعل بطاقةَ غيره تبدو عملاً عليه أن ينفّذه.
 */
export default async function ReviewsPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;

  const queue = await getReviewQueue(userId);

  if (queue.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">لا شيء ينتظر مراجعتك</p>
        <p className="text-[13px] text-muted-foreground">
          حين يُنهي زميلٌ مهمّةً أسندتَها له ويسلّمها «بانتظار الاعتماد»، تظهر هنا لتعتمدها أو تُرجعها بملاحظة.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/tasks">رجوع للوحة</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3" dir="rtl">
      <header>
        <h2 className="text-lg font-bold">بانتظار مراجعتك ({new Intl.NumberFormat("ar-EG").format(queue.length)})</h2>
        <p className="text-sm text-muted-foreground">مهامّ أرسلتَها لزملائك وأنهوها — اعتمدها أو أرجعها بملاحظة.</p>
      </header>
      {/* سطرٌ لكلّ مهمّة (خالد ٣ أكتوبر ٢٠٢٦: «مساحات مهدرة»): مَن · ماذا · منذ متى ينتظر · القرار.
          كانت بطاقةً بـ١٣٠ بكسل فلا يُرى منها على الشاشة إلّا ثلاث. التفاصيلُ تُفتح بالضغط على العنوان. */}
      <ul className="divide-y overflow-hidden rounded-lg border bg-card">
        {queue.map((task) => {
          const who = task.assignee?.name?.trim() || task.assignee?.email || "زميل";
          const loud = task.priority === "HIGH" || task.priority === "URGENT";
          return (
            <li key={task.id} className="grid items-center gap-x-3 gap-y-1 px-3 py-2 sm:grid-cols-[9rem_minmax(0,1fr)_auto_auto]">
              <span className="flex min-w-0 items-center gap-2 text-[13px]">
                {task.assignee?.image ? (
                  <img src={task.assignee.image} alt="" className="size-6 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-bold">{who.charAt(0)}</span>
                )}
                <bdi className="truncate font-medium">{who}</bdi>
              </span>
              <details className="group min-w-0">
                <summary className="flex cursor-pointer list-none items-center gap-2">
                  <span className="truncate text-sm font-semibold group-open:whitespace-normal">{task.title}</span>
                  {loud ? (
                    <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold", TASK_PRIORITY_META[task.priority].tone)}>
                      {TASK_PRIORITY_META[task.priority].labelAr}
                    </span>
                  ) : null}
                </summary>
                <div className="mt-1.5 space-y-1 border-s-2 ps-2 text-[13px] text-muted-foreground">
                  <p className="whitespace-pre-line">{task.description || "بلا تفاصيل."}</p>
                  <p className="text-[12px]">
                    سلّمها {dateFmt.format(task.updatedAt)}
                    {task.dueDate ? ` · موعدها كان ${dueFmt.format(task.dueDate)}` : ""}
                  </p>
                </div>
              </details>
              <span className="whitespace-nowrap text-[12px] text-muted-foreground" title={dateFmt.format(task.updatedAt)}>
                سُلّمت {waited(task.updatedAt)}
              </span>
              <ReviewDecision id={task.id} title={task.title} assignee={who} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
