/** The leave beacon: how long the reader stayed, how far they scrolled, and whether that counts as a bounce. */
export function sendArticleLeave(
  articleSlug: string,
  id: string,
  { timeOnPage, scrollDepth, bounced }: { timeOnPage: number; scrollDepth: number; bounced: boolean },
) {
  const payload = JSON.stringify({ timeOnPage, scrollDepth, bounced });
  fetch(`/articles/${encodeURIComponent(articleSlug)}/api/analytics/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}
