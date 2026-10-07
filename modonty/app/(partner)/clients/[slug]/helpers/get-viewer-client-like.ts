import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/** Does the signed-in reader follow this partner — false for a guest. */
export async function getViewerClientLike(clientSlug: string): Promise<boolean> {
  const session = await auth();
  const userId = session?.user?.id;
  return userId
    ? Boolean(
        await db.clientLike.findFirst({
          where: { userId, client: { slug: clientSlug } },
          select: { id: true },
        }),
      )
    : false;
}
