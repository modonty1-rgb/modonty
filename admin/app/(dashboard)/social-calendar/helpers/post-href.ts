import type { SocialPostStatus } from "@prisma/client";

/**
 * روابط صفحات المنشور — مكان واحد. بلا `page` = صفحة التفصيل.
 * `"stage"` = صفحة المرحلة كما تفتحها شارة الحالة في القديم (`statusHref` — `CalendarTable.tsx:182-187`):
 * «جاهز للنشر/تم النشر» → النشر، وما قبلهما → الإنتاج.
 */
export function postHref(
  clientId: string,
  postId: string,
  page?: "edit" | "production" | "publish" | { stage: SocialPostStatus },
): string {
  const base = `/social-calendar/${clientId}/posts/${postId}`;
  if (!page) return base;
  if (typeof page === "string") return `${base}/${page}`;
  return page.stage === "READY_TO_PUBLISH" || page.stage === "PUBLISHED" ? `${base}/publish` : `${base}/production`;
}
