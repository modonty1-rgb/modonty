"use client";

import { useEffect } from "react";

import { trackBodyLinkClick } from "../../helpers/track-body-link-click";

interface ArticleBodyLinkTrackerProps {
  articleId: string;
}

export function ArticleBodyLinkTracker({ articleId }: ArticleBodyLinkTrackerProps) {
  useEffect(() => {
    const el = document.getElementById("article-content");
    if (!el) return;
    const handler = (e: MouseEvent) => trackBodyLinkClick(articleId, e);
    el.addEventListener("click", handler);
    return () => el.removeEventListener("click", handler);
  }, [articleId]);

  return null;
}
