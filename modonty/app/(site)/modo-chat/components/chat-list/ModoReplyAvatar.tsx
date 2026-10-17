"use client";

import type { ModoPose } from "@modonty/shared/lib/modo-images";
import { ModoFace } from "@/components/shared/modo-face";

/**
 * Modo beside each of his replies, in the pose that fits the reply (Khalid, 17 Oct 2026: «في الردود
 * تلعب في الزوايا تبعته عشان تدي إيحاء بالاحترافية»). Keyed by pose so a change fades in instead of snapping.
 */
export function ModoReplyAvatar({ pose }: { pose: ModoPose }) {
  return (
    <span
      key={pose}
      className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-primary/5 ring-1 ring-primary/10 animate-in fade-in zoom-in-95 duration-300"
    >
      <ModoFace pose={pose} sizes="36px" framing="bust" decorative />
    </span>
  );
}
