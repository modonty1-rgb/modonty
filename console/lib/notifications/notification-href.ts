/**
 * أين يفتح التنبيه في الكونسول على الويب — نفس بادئات `targetOf` (نقطة التنبيهات) و`tapTabOf`
 * (تطبيق الجوّال)، فالتنبيه الواحد يفتح نفس الشاشة على الجهازين. وما لا شاشة له يبقى بلا رابط.
 */
export function notificationHref(rawType: string, relatedId: string | null): string | null {
  const type = rawType.toLowerCase();
  if (type.startsWith("article")) return relatedId ? `/dashboard/articles/${relatedId}` : "/dashboard/articles";
  if (type.startsWith("booking")) return "/dashboard/bookings";
  if (type === "page_question") return "/dashboard/page-faq";
  if (type.startsWith("faq") || type.includes("question")) return "/dashboard/questions";
  if (type.startsWith("comment")) return "/dashboard/comments";
  if (type.startsWith("review")) return "/dashboard/client-reviews";
  if (type.startsWith("reel") || type.startsWith("video") || type.startsWith("media")) return "/dashboard/reels";
  return null;
}
