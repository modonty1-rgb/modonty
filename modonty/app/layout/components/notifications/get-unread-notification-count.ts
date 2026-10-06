import { cache } from "react";
import { auth } from "@/lib/auth";
import { countUnreadNotifications } from "@/lib/notifications/count-unread-notifications";

/**
 * عدّاد الإشعارات غير المقروءة لشارة الجوّال. صفرٌ لغير المسجَّل — **وصفرٌ أيضاً لمن كوكيه
 * تالف**، وهما حالٌ واحدة من حيث النتيجة.
 *
 * `catch` لأن `auth()` يرمي `JWTSessionError` على كوكي تالف أو موقَّع بسرٍّ قديم، وauthjs
 * يطبعه في السجلّ قبل أن يصل المستدعي. وهذا العدّاد يُنفَّذ على **كل** صفحة — بما فيها
 * صفحة البيع — لأن `app/not-found.tsx` يركّب `SiteShell` وNext يجهّز ٤٠٤ مع كل طلب.
 *
 * العدّ نفسه في `countUnreadNotifications` — نفس الدالّة التي تنادي بها واجهة التطبيق.
 */
export const getUnreadNotificationCount = cache(async (): Promise<number> => {
  const session = await auth().catch(() => null);
  if (session?.user?.id == null) return 0;
  return countUnreadNotifications(session.user.id);
});
