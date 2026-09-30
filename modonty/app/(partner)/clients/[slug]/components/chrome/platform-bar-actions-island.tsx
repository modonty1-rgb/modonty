import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PlatformBarActions } from "./platform-bar-actions";

interface PlatformBarActionsIslandProps {
  clientSlug: string;
}

/**
 * Follow/share with the reader's real follow state already on the first paint.
 *
 * The button used to start as «متابعة» for everyone and learn the truth from a request after
 * mount. Under load that request came back late: 50 followers pressed at once and 43 of them
 * sent «follow» (a no-op) instead of «unfollow» (subscriber QA #18, 29 Sep 2026). Reading it
 * here — behind the bar's own Suspense, like the account menu beside it — keeps the rest of the
 * partner chrome static.
 */
export async function PlatformBarActionsIsland({ clientSlug }: PlatformBarActionsIslandProps) {
  const session = await auth();
  const userId = session?.user?.id;
  const following = userId
    ? Boolean(
        await db.clientLike.findFirst({
          where: { userId, client: { slug: clientSlug } },
          select: { id: true },
        }),
      )
    : false;
  return <PlatformBarActions clientSlug={clientSlug} initialIsFollowing={following} />;
}
