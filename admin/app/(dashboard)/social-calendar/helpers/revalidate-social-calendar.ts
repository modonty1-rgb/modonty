import "server-only";

import { revalidatePath } from "next/cache";

/**
 * كل كتابة في التقويم تُبطل الشجرة كلّها تحت `/social-calendar`: لوحة العملاء تعدّ المنشورات،
 * والتقويم والمعرض والأرشيف والتفصيل كلّها تقرأ نفس الصفّ. مسار واحد بنمط layout يغطّيها.
 */
export function revalidateSocialCalendar(): void {
  revalidatePath("/social-calendar", "layout");
}
