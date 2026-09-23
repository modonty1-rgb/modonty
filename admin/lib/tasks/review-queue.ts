import { cache } from "react";

import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

import { TASK_NOT_ARCHIVED } from "./not-archived";

/**
 * **مهامُّ أرسلتَها لزميل، وأنهاها، وتنتظر اعتمادك** (خالد ٢٣ سبتمبر ٢٠٢٦: «اللي أرسل لي
 * يشوف الريفيو في صفحته، يقول لي دن أو يديني ملاحظاته»).
 *
 * مصدرٌ واحد يقرؤه عدّادُ «Reviews» في قائمة Tasks وصفحةُ `/tasks/reviews` — تعريفٌ واحد
 * للعدد وللقائمة، فلا يقول العدّادُ ٣ والصفحةُ ٢.
 *
 * `assigneeId ≠ أنا`: المهمّةُ التي كتبها الموظّفُ لنفسه ونقلها إلى REVIEW حدثٌ داخليّ،
 * لا مراجعةَ فيها لأحد — نفسُ حارس `notifyReviewer`.
 */
export function reviewQueueWhere(reviewerId: string): Prisma.TaskWhereInput {
  return {
    createdById: reviewerId,
    status: "REVIEW",
    AND: [{ assigneeId: { not: null } }, { assigneeId: { not: reviewerId } }, TASK_NOT_ARCHIVED],
  };
}

export const countReviewQueue = cache(async (reviewerId: string): Promise<number> =>
  db.task.count({ where: reviewQueueWhere(reviewerId) }).catch(() => 0),
);

export type ReviewQueueTask = {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  dueDate: Date | null;
  updatedAt: Date;
  assignee: { name: string | null; email: string | null; image: string | null } | null;
};

export const getReviewQueue = cache(async (reviewerId: string): Promise<ReviewQueueTask[]> =>
  db.task.findMany({
    where: reviewQueueWhere(reviewerId),
    select: {
      id: true,
      title: true,
      description: true,
      priority: true,
      dueDate: true,
      updatedAt: true,
      assignee: { select: { name: true, email: true, image: true } },
    },
    // الأقدمُ أوّلاً: من انتظر أطول يُراجَع أوّلاً.
    orderBy: { updatedAt: "asc" },
    take: 200,
  }),
);
