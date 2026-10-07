/** A click inside the article body: if it landed on a link, record it (internal or external). */
export function trackBodyLinkClick(articleId: string, e: MouseEvent) {
  const target = e.target;
  const anchor = target instanceof Element ? target.closest("a") : null;
  if (!anchor || !anchor.href) return;
  const href = anchor.href.trim();
  if (!href || href === "#") return;

  let isExternal = true;
  try {
    isExternal = new URL(href).origin !== window.location.origin;
  } catch {
    isExternal = true;
  }

  const linkText = (anchor.textContent || "").trim().slice(0, 500);

  fetch("/articles/api/track/article-link-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      articleId,
      linkUrl: href,
      linkText: linkText || undefined,
      isExternal,
    }),
    keepalive: true,
  }).catch(() => {});
}
