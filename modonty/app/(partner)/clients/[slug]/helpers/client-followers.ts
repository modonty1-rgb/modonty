import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";

export async function getClientFollowers(rawSlug: string, limit = 6) {
  "use cache";
  cacheTag("clients");
  cacheLife("hours");
  const decodedSlug = decodeURIComponent(rawSlug);

  const client = await db.client.findUnique({
    where: { slug: decodedSlug },
    select: { id: true },
  });

  if (!client) return null;

  const likes = await db.clientLike.findMany({
    where: { clientId: client.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return likes.map((like) => ({
    id: like.id,
    userId: like.user?.id ?? null,
    name: like.user?.name ?? "متابع",
    image: like.user?.image ?? null,
  }));
}
