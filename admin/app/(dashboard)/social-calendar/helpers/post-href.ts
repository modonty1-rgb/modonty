import type { SocialCalendarKind, SocialPostStatus } from "@prisma/client";

/**
 * روابط صفحات المنشور — مكان واحد. بلا `page` = صفحة التفصيل.
 * `"stage"` = صفحة المرحلة كما تفتحها شارة الحالة في القديم (`statusHref` — `CalendarTable.tsx:182-187`):
 * «جاهز للنشر/تم النشر» → النشر، وما قبلهما → الإنتاج.
 */
export function postHref(
  calendarId: string,
  postId: string,
  page?: "edit" | "production" | "publish" | { stage: SocialPostStatus },
): string {
  const base = `/social-calendar/${calendarId}/posts/${postId}`;
  if (!page) return base;
  if (typeof page === "string") return `${base}/${page}`;
  return page.stage === "READY_TO_PUBLISH" || page.stage === "PUBLISHED" ? `${base}/publish` : `${base}/production`;
}

/** قسم الكاليندر في Social Calendar: «المحتوى» أو «السوشيال ميديا» حسب نوعه. */
export function calendarHomeHref(calendar: { kind: SocialCalendarKind }): string {
  return calendar.kind === "SOCIAL" ? "/social-calendar/social" : "/social-calendar";
}
