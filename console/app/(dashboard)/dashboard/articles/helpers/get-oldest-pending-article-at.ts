import { ArticleStatus } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * When the longest-waiting AWAITING_APPROVAL article reached the client — the start of
 * the 5-day countdown in the approval banner. Read from `updatedAt`: the move to
 * AWAITING_APPROVAL is itself a write, and the client cannot edit the article while it
 * waits. A team edit during the wait restarts the clock, which is right — it is a new
 * version to review (Khalid, 15 Oct 2026: no new field for this).
 */
export async function getOldestPendingArticleAt(clientId: string): Promise<Date | null> {
  const oldest = await db.article.findFirst({
    where: { clientId, status: ArticleStatus.AWAITING_APPROVAL },
    orderBy: { updatedAt: "asc" },
    select: { updatedAt: true },
  });
  return oldest?.updatedAt ?? null;
}
