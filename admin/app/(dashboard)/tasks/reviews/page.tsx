import Link from "next/link";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getReviewQueue } from "@/lib/tasks/review-queue";
import { TASK_PRIORITY_META } from "@/lib/tasks/task-config";
import { cn } from "@/lib/utils";

import { ReviewDecision } from "./components/review-decision";

export const metadata = { title: "Reviews" };

const dateFmt = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long", hour: "numeric", minute: "2-digit", timeZone: "Asia/Riyadh" });

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
          حين يُنهي زميلٌ مهمّةً أرسلتَها له وينقلها إلى Review، تظهر هنا لتعتمدها أو تُرجعها بملاحظة.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/tasks">Back to board</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3" dir="rtl">
      <header>
        <h2 className="text-lg font-bold">بانتظار مراجعتك ({queue.length})</h2>
        <p className="text-sm text-muted-foreground">مهامّ أرسلتَها لزملائك وأنهوها — اعتمدها أو أرجعها بملاحظة.</p>
      </header>
      <ul className="flex flex-col gap-2">
        {queue.map((task) => {
          const who = task.assignee?.name?.trim() || task.assignee?.email || "زميل";
          return (
            <li key={task.id} className="grid gap-3 rounded-lg border bg-card p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {task.assignee?.image ? (
                    <img src={task.assignee.image} alt="" className="size-6 rounded-full object-cover" />
                  ) : (
                    <span className="grid size-6 place-items-center rounded-full bg-muted text-[10px] font-bold">{who.charAt(0)}</span>
                  )}
                  <span className="font-medium text-foreground">{who}</span>
                  <span>· أنهاها {dateFmt.format(task.updatedAt)}</span>
                </div>
                <p className="mt-2 text-sm font-semibold">{task.title}</p>
                {task.description && <p className="mt-1 line-clamp-3 whitespace-pre-line text-[13px] text-muted-foreground">{task.description}</p>}
                <span className={cn("mt-2 inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold", TASK_PRIORITY_META[task.priority].tone)}>
                  {TASK_PRIORITY_META[task.priority].label}
                </span>
              </div>
              <ReviewDecision id={task.id} title={task.title} assignee={who} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
