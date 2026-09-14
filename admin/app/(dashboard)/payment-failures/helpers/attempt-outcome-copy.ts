import type { PaymentAttemptOutcome } from "@prisma/client";

/**
 * «رُفض» و«فشل» ليسا مترادفين وإن بدا كذلك: الرفض قرارٌ من البنك (المال موجود أو لا،
 * البطاقة مسموحة أو لا)، والفشل عطلٌ عندنا أو عند المزوّد. الأوّل يُعالَج برسالة للمشتري،
 * والثاني بإصلاح. فصلهما في الشاشة يمنع قراءة عطلٍ تقنيّ على أنه ضعف طلب.
 */
const COPY: Record<PaymentAttemptOutcome, { label: string; tone: "declined" | "failed" }> = {
  declined: { label: "رُفض من البنك", tone: "declined" },
  failed: { label: "فشل", tone: "failed" },
  timeout: { label: "انتهت المهلة", tone: "failed" },
  error: { label: "عطل تقني", tone: "failed" },
};

export function attemptOutcomeCopy(outcome: PaymentAttemptOutcome | null) {
  return outcome ? COPY[outcome] : { label: "غير محدّد", tone: "failed" as const };
}
