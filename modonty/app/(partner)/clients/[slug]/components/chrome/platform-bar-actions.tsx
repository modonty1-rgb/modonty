"use client";

import { useState } from "react";
import { IconCheck, IconShare } from "@/lib/icons";
import { ClientFollowButton } from "../client-follow-button";

interface PlatformBarActionsProps {
  clientSlug: string;
  /** Read on the server (platform-bar-actions-island.tsx), so the first paint is already right. */
  initialIsFollowing: boolean;
}

/**
 * Follow and share, on modonty's strip above the partner's own site.
 *
 * The partner page was rebuilt as the partner's site (his header, his footer), and the old
 * hero that carried these two buttons was left unmounted — a subscriber could not follow or
 * share a partner at all (subscriber QA finding #9, 29 Sep 2026). They are platform actions,
 * not the partner's, so they live on the platform's bar rather than inside his templates.
 */
export function PlatformBarActions({ clientSlug, initialIsFollowing }: PlatformBarActionsProps) {
  const [shared, setShared] = useState(false);

  const share = async () => {
    const url = location.href;
    let platform: "OTHER" | "COPY_LINK";
    if (navigator.share) {
      try {
        await navigator.share({ url });
        platform = "OTHER";
      } catch {
        return; // the reader dismissed the sheet
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        platform = "COPY_LINK";
      } catch {
        return;
      }
    }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
    fetch(`/clients/${encodeURIComponent(clientSlug)}/api/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform }),
      keepalive: true,
    }).catch(() => {});
  };

  return (
    // Phone: two 36px icons — with words they pushed the theme and account buttons 118px off
    // a 390px screen and the whole partner page shrank to fit (mobile QA, 29 Sep 2026).
    <span className="flex items-center gap-1.5 md:gap-2">
      <ClientFollowButton
        clientSlug={clientSlug}
        initialIsFollowing={initialIsFollowing}
        initialFollowersCount={0}
        size="sm"
        compact
        className="relative h-7 border-white/25 bg-transparent px-3 text-xs text-white hover:bg-white/10 hover:text-white max-md:after:absolute max-md:after:-inset-1.5 max-md:after:content-['']"
      />
      <button
        type="button"
        onClick={share}
        aria-label={shared ? "تم — الرابط جاهز" : "مشاركة"}
        className="relative flex h-7 items-center justify-center gap-1.5 rounded-md border border-white/25 px-3 text-xs text-white transition-colors hover:bg-white/10 max-md:size-9 max-md:px-0 max-md:after:absolute max-md:after:-inset-1.5 max-md:after:content-['']"
      >
        {shared ? <IconCheck className="h-3.5 w-3.5" aria-hidden /> : <IconShare className="h-3.5 w-3.5" aria-hidden />}
        <span className="max-md:sr-only">{shared ? "تم" : "مشاركة"}</span>
      </button>
    </span>
  );
}
