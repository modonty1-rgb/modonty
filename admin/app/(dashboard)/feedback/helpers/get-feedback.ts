import "server-only";
import { db } from "@/lib/db";

export interface FeedbackRow {
  id: string;
  author: string;
  type: string | null;
  app: string | null;
  whereExactly: string | null;
  message: string;
  steps: string | null;
  severity: string | null;
  benefit: string | null;
  page: string | null;
  createdAt: Date;
  replyCount: number;
}

/**
 * Everything the team has sent through the feedback dialog, newest first.
 *
 * It was always being written — `sendFeedback` has saved an `AdminNote` row since the
 * button existed — but nothing ever read it back, so the only way to see a report was
 * the email copy. Khalid (2026-09-04): «نستفيد منها لو أي فيه feedback موجود».
 *
 * `take` is not a display cap chosen by feel: this table grows one row per report from a
 * seven-person team, so the ceiling exists to bound the query, not to hide rows. If it is
 * ever reached the page says so rather than silently ending the list.
 */
const CEILING = 500;

export async function getFeedback(): Promise<{ rows: FeedbackRow[]; total: number; truncated: boolean }> {
  const [total, notes] = await Promise.all([
    db.adminNote.count(),
    db.adminNote.findMany({
      orderBy: { createdAt: "desc" },
      take: CEILING,
      select: {
        id: true,
        author: true,
        type: true,
        app: true,
        whereExactly: true,
        message: true,
        steps: true,
        severity: true,
        benefit: true,
        page: true,
        createdAt: true,
        _count: { select: { replies: true } },
      },
    }),
  ]);

  return {
    rows: notes.map(({ _count, ...n }) => ({ ...n, replyCount: _count.replies })),
    total,
    truncated: total > notes.length,
  };
}
