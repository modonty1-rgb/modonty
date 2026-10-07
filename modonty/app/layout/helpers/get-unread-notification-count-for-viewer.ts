import { unstable_noStore } from "next/cache";
import { auth } from "@/lib/auth";
import { countUnreadNotifications } from "./count-unread-notifications";

/**
 * عدّاد الجرس على الديسكتوب: `null` لغير المسجَّل (فلا يُرسم الجرس أصلاً)، والعدد لمن له جلسة.
 *
 * الجلسة داخل `try`: `auth()` يرمي `JWTSessionError` حين يكون كوكي الزائر تالفاً أو
 * موقَّعاً بسرٍّ قديم (`JWEInvalid: Failed to base64url decode the iv`)، ويطبعه authjs
 * في سجلّ الخادم قبل أن يصل المستدعي.
 *
 * ولماذا يهمّ هذا **صفحة البيع**: `app/not-found.tsx` يركّب `SiteShell` بنفسه، وNext
 * يجهّز صفحة ٤٠٤ مع كل طلب — فهذا الجرس يُنفَّذ على `/pay/sa` أيضاً وهي خارج مجموعة
 * `(site)` تماماً (قيس ١٤ سبتمبر ٢٠٢٦: مرّتان لكل طلب، و٦ أخطاء بكوكي تالف).
 * فكان سجلّ خادم صفحة بيعٍ لغير المسجَّلين يمتلئ بأخطاء مصادقة لا شأن لها بها،
 * وتغرق فيها أخطاء الدفع الحقيقية يوم تقع.
 *
 * وزائرٌ بكوكي تالف هو زائرٌ غير مسجَّل — فالجرس لا يُرسم، وهو ما تفعله السطور التالية.
 */
export async function getUnreadNotificationCountForViewer(): Promise<number | null> {
  unstable_noStore();

  const session = await auth().catch(() => null);
  if (!session?.user?.id) return null;

  return countUnreadNotifications(session.user.id);
}
