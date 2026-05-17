import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CommentStatus } from "@prisma/client";
import type { ApiResponse } from "@/lib/types";

async function findClient(rawSlug: string) {
  const slug = decodeURIComponent(rawSlug);
  return db.client.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });
}

// Posting client comments moved to a Server Action — see
// app/clients/[slug]/actions/client-comment-actions.ts
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const client = await findClient(slug);
  if (!client) {
    return NextResponse.json(
      { success: false, error: "Client not found" } as ApiResponse<never>,
      { status: 404 }
    );
  }

  const comments = await db.clientComment.findMany({
    where: { clientId: client.id, status: CommentStatus.APPROVED, parentId: null },
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { replies: true, likes: true, dislikes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    success: true,
    data: { comments },
  } as ApiResponse<{ comments: typeof comments }>);
}
