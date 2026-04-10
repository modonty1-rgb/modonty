"use client";

import { ShareButtons } from "@/components/shared";
import { trackCtaClick } from "@/lib/cta-tracking";

interface ArticleShareButtonsProps {
  title: string;
  url: string;
  articleSlug: string;
  hideCopyLink?: boolean;
  buttonVariant?: "outline" | "ghost";
  articleId?: string;
  clientId?: string;
}

/** Article share UI; sends analytics POST after ShareButtons performs the share (fire-and-forget). */
export function ArticleShareButtons({
  title,
  url,
  articleSlug,
  hideCopyLink = false,
  buttonVariant = "outline",
  articleId,
  clientId,
}: ArticleShareButtonsProps) {
  const onShare = async (platform: string) => {
    const bodyPlatform = platform === "copy" ? "COPY_LINK" : platform.toUpperCase();
    const label = platform === "copy" ? "نسخ الرابط" : `مشاركة ${platform}`;
    trackCtaClick({
      type: "LINK",
      label,
      targetUrl: typeof window !== "undefined" ? window.location.pathname : "",
      articleId,
      clientId,
    });
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
      buttonVariant={buttonVariant}
    />
  );
}
