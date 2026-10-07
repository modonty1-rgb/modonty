/** Register the view and hand back the server's answer (analytics row id, GA4 payload, Clarity tags). */
export function sendArticleView(articleSlug: string) {
  const slug = encodeURIComponent(articleSlug);
  // Send the real entry context: document.referrer (external source) +
  // location.href (UTM params) — the fetch's own Referer header is useless
  // for source attribution (it's always this page).
  return fetch(`/articles/${slug}/api/view`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ referrer: document.referrer || null, url: window.location.href }),
  }).then((res) => res.json());
}
