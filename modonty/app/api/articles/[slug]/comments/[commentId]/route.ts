import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { CommentStatus, ArticleStatus } from "@prisma/client";
import type { ApiResponse } from "@/lib/types";
import { sendEmail } from "@/lib/email/resend-client";
import { commentReplyEmail } from "@/lib/email/templates/comment-reply";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; commentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in to reply." } as ApiResponse<never>,
        { status: 401 }
      );
    }

    const { slug, commentId } = await params;
    const decodedSlug = decodeURIComponent(slug);

    // Find article
    const article = await db.article.findFirst({
      where: {
        slug: decodedSlug,
        status: ArticleStatus.PUBLISHED,
      },
      select: { id: true, title: true },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: "Article not found" } as ApiResponse<never>,
        { status: 404 }
      );
    }

    // Find and validate parent comment
    const parentComment = await db.comment.findFirst({
      where: {
        id: commentId,
        articleId: article.id,
        status: CommentStatus.APPROVED,
      },
      select: {
        id: true,
        author: { select: { id: true, name: true, email: true, notificationPreferences: true } },
      },
    });

    if (!parentComment) {
      return NextResponse.json(
        { success: false, error: "Parent comment not found or not approved" } as ApiResponse<never>,
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { content } = body;

    // Validate content
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { success: false, error: "Reply content is required" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length < 3) {
      return NextResponse.json(
        { success: false, error: "Reply must be at least 3 characters long" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    if (trimmedContent.length > 2000) {
      return NextResponse.json(
        { success: false, error: "Reply must be less than 2000 characters" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    // Create reply with PENDING status
    const reply = await db.comment.create({
      data: {
        articleId: article.id,
        authorId: session.user.id,
        parentId: parentComment.id,
        content: trimmedContent,
        status: CommentStatus.PENDING,
      },
      select: {
        id: true,
        content: true,
        status: true,
        parentId: true,
        createdAt: true,
      },
    });

    // Notify parent comment author (non-blocking, skip if same user or opted out)
    const parentAuthor = parentComment.author;
    const prefs = parentAuthor?.notificationPreferences as Record<string, boolean> | null;
    const emailAllowed = prefs?.emailCommentReplies !== false;
    if (
      parentAuthor?.email &&
      parentAuthor.id !== session.user.id &&
      emailAllowed
    ) {
      const articleUrl = `https://modonty.com/articles/${decodedSlug}`;
      const emailPayload = commentReplyEmail({
        userName: parentAuthor.name ?? parentAuthor.email,
        articleTitle: article.title,
        articleUrl,
        replyAuthor: session.user.name ?? "مستخدم",
        replyContent: trimmedContent,
      });
      sendEmail({ to: parentAuthor.email, ...emailPayload }).catch((err) =>
        console.error("[comments/reply] Reply notification failed:", err)
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: reply.id,
        message: "Your reply is pending approval and will appear after review.",
      },
    } as ApiResponse<{ id: string; message: string }>);
  } catch (error) {
    console.error("Error creating reply:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create reply" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
