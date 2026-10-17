import type { ModoPose } from "@modonty/shared/lib/modo-images";

interface ReplyShape {
  partners?: unknown[];
  source?: "web";
  noSources?: boolean;
  industrySuggestion?: unknown;
}

/** Plain answers cycle through these, so a long conversation doesn't show the same stamp on every line. */
const PLAIN_POSES: readonly ModoPose[] = ["front", "thumbs", "reading"];

/**
 * Which pose Modo takes beside a reply: what the reply DOES picks it first, and only a plain answer
 * rotates. Deterministic by position, so a re-render never shuffles a pose the visitor already saw.
 */
export function replyPose(m: ReplyShape, index: number, inArticle: boolean): ModoPose {
  if (m.industrySuggestion) return "point";
  if (m.noSources) return "surprised";
  if (m.partners?.length) return "point";
  if (m.source === "web") return "laptop";
  if (inArticle) return "reading";
  return PLAIN_POSES[Math.floor(index / 2) % PLAIN_POSES.length];
}
