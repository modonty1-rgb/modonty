/** Tell the server a share happened, fire-and-forget — the counter, not the share itself. */
export function sendArticleShare(articleSlug: string, platform: "COPY_LINK" | "OTHER") {
  fetch(`/articles/${encodeURIComponent(articleSlug)}/api/share`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platform }),
  }).catch(() => {});
}
