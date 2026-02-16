"use client";

import { ShareButtons } from "@/components/shared";

interface ArticleShareButtonsProps {
  title: string;
  url: string;
  articleSlug: string;
  hideCopyLink?: boolean;
}

/** Article share UI; sends analytics POST after ShareButtons performs the share (fire-and-forget). */
export function ArticleShareButtons({ title, url, articleSlug, hideCopyLink = false }: ArticleShareButtonsProps) {
  // Fired after user shares; POSTs to backend for per-article/platform counts. Silent on failure.
  const onShare = async (platform: string) => {
    const bodyPlatform = platform === "copy" ? "COPY_LINK" : platform.toUpperCase();
    try {
      await fetch(`/api/articles/${encodeURIComponent(articleSlug)}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: bodyPlatform }),
      });
    } catch {
      // Silent fail for tracking
    }
  };

  return (
    <ShareButtons
      title={title}
      url={url}
      platforms={["twitter", "linkedin", "facebook", "whatsapp"]}
      showCopyLink={!hideCopyLink}
      onShare={onShare}
      size="sm"
    />
  );
}
