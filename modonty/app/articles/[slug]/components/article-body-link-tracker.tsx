"use client";

import { useEffect } from "react";

interface ArticleBodyLinkTrackerProps {
  articleId: string;
}

function handleClick(articleId: string, e: MouseEvent) {
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

  fetch("/api/track/article-link-click", {
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

export function ArticleBodyLinkTracker({ articleId }: ArticleBodyLinkTrackerProps) {
  useEffect(() => {
    const el = document.getElementById("article-content");
    if (!el) return;
    const handler = (e: MouseEvent) => handleClick(articleId, e);
    el.addEventListener("click", handler);
    return () => el.removeEventListener("click", handler);
  }, [articleId]);

  return null;
}
