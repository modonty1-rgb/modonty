import { CommentStatus } from "@prisma/client";
import { db } from "@/lib/db";

export async function getClientReviewsBySlug(rawSlug: string) {
  const decodedSlug = decodeURIComponent(rawSlug);

  const client = await db.client.findUnique({
    where: { slug: decodedSlug },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!client) {
    return null;
  }

  const reviews = await db.comment.findMany({
    where: {
      article: { clientId: client.id },
      status: CommentStatus.APPROVED,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      article: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 40,
  });

  return {
    client,
    reviews,
  };
}

