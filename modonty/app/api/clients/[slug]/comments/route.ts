import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentStatus } from "@prisma/client";
import type { ApiResponse } from "@/lib/types";
import { notifyTelegram } from "@/lib/telegram/notify";

const COMMENT_COOLDOWN_MS = 60 * 1000; // 1 minute between comments per user

async function findClient(rawSlug: string) {
  const slug = decodeURIComponent(rawSlug);
  return db.client.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });
}

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Please log in to comment." } as ApiResponse<never>,
      { status: 401 }
    );
  }

  // Rate limit: 1 comment per 60s per user
  const recent = await db.clientComment.findFirst({
    where: {
      authorId: session.user.id,
      createdAt: { gt: new Date(Date.now() - COMMENT_COOLDOWN_MS) },
    },
    select: { id: true },
  });
  if (recent) {
    return NextResponse.json(
      { success: false, error: "Please wait before posting another comment." } as ApiResponse<never>,
      { status: 429 }
    );
  }

  const { slug } = await params;
  const client = await findClient(slug);
  if (!client) {
    return NextResponse.json(
      { success: false, error: "Client not found" } as ApiResponse<never>,
      { status: 404 }
    );
  }

  let body: { content?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" } as ApiResponse<never>,
      { status: 400 }
    );
  }

  const content =
    typeof body.content === "string" ? body.content.trim() : "";
  if (content.length < 3) {
    return NextResponse.json(
      { success: false, error: "Comment must be at least 3 characters" } as ApiResponse<never>,
      { status: 400 }
    );
  }
  if (content.length > 2000) {
    return NextResponse.json(
      { success: false, error: "Comment must be less than 2000 characters" } as ApiResponse<never>,
      { status: 400 }
    );
  }

  const comment = await db.clientComment.create({
    data: {
      clientId: client.id,
      authorId: session.user.id,
      content,
      status: CommentStatus.PENDING,
    },
    select: { id: true, status: true, createdAt: true },
  });

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    null;
  notifyTelegram(client.id, "clientComment", {
    title: client.name,
    body: `${session.user.name ?? "زائر"}: ${content}`,
    link: {
      label: "مراجعة من اللوحة",
      url: "https://console.modonty.com/dashboard/client-comments",
    },
    ipAddress: ip,
    headers: request.headers,
  }).catch(() => {});

  return NextResponse.json({
    success: true,
    data: {
      id: comment.id,
      message: "Your comment is pending approval and will appear after review.",
    },
  } as ApiResponse<{ id: string; message: string }>);
}
