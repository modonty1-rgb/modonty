import "server-only";

import { z } from "zod";

import { db } from "@/lib/db";

// The beacon fires on page-hide with nothing authenticating it, so the numbers are
// bounded here: scrollDepth is a percentage, the rest are durations that only run
// forwards. Anything outside those ranges is a hand-made payload, not a reader.
const analyticsUpdateSchema = z.object({
  timeOnPage: z.number().min(0).optional(),
  scrollDepth: z.number().min(0).max(100).optional(),
  bounced: z.boolean().optional(),
  lcp: z.number().min(0).optional(),
  cls: z.number().min(0).optional(),
  inp: z.number().min(0).optional(),
});

export type AnalyticsUpdateResult =
  | { kind: "invalid"; fields: Record<string, string[] | undefined> }
  | { kind: "not_found" }
  | { kind: "forbidden" }
  | { kind: "updated" };

/**
 * Engagement numbers for one article visit — the body of `PATCH /articles/[slug]/api/analytics/[id]`
 * with the visit passed in. The row belongs to the visit that created it: the web names that visit
 * by the `modonty_view_sid` cookie, the app by `app:<X-Device-Id>` (the same value E6 stored in
 * `Analytics.sessionId`). No visit, or another visit → forbidden.
 */
export async function updateArticleAnalytics(
  id: string,
  body: unknown,
  sessionId: string | undefined,
): Promise<AnalyticsUpdateResult> {
  const parsed = analyticsUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return { kind: "invalid", fields: parsed.error.flatten().fieldErrors };
  }

  const { timeOnPage, scrollDepth, bounced, lcp, cls, inp } = parsed.data;

  const existing = await db.analytics.findUnique({
    where: { id },
    select: { id: true, sessionId: true },
  });
  if (!existing) return { kind: "not_found" };

  // The old check skipped itself whenever the cookie was absent, so a bare `curl -X PATCH` — no
  // account, no cookie — could rewrite any row's engagement numbers, the same numbers every
  // partner report is built from.
  if (!sessionId || sessionId !== existing.sessionId) return { kind: "forbidden" };

  await db.analytics.update({
    where: { id },
    data: {
      ...(timeOnPage !== undefined && { timeOnPage }),
      ...(scrollDepth !== undefined && { scrollDepth }),
      ...(bounced !== undefined && { bounced }),
      ...(lcp !== undefined && { lcp }),
      ...(cls !== undefined && { cls }),
      ...(inp !== undefined && { inp }),
    },
  });

  return { kind: "updated" };
}
