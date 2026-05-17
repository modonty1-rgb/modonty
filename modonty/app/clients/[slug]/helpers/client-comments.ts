import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";
import { CommentStatus } from "@prisma/client";

export interface ClientCommentItem {
  id: string;
  content: string;
  createdAt: Date;
  author: { id: string; name: string | null; image: string | null } | null;
}

export async function getClientComments(rawSlug: string, limit = 50): Promise<ClientCommentItem[]> {
  "use cache";
  cacheTag("clients");
  cacheLife("hours");
  const decodedSlug = decodeURIComponent(rawSlug);

  const client = await db.client.findUnique({
    where: { slug: decodedSlug },
    select: { id: true },
  });

  if (!client) return [];

  const comments = await db.clientComment.findMany({
    where: {
      clientId: client.id,
      status: CommentStatus.APPROVED,
      parentId: null,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return comments;
}
