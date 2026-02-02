import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try to find user
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });

    // If user not found, try to find linked author
    if (!user) {
      // Check if it's an author slug instead
      const author = await db.author.findUnique({
        where: { slug: id },
        include: {
          articles: {
            where: {
              status: ArticleStatus.PUBLISHED,
            },
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              datePublished: true,
            },
            orderBy: {
              datePublished: "desc",
            },
            take: 20,
          },
        },
      });

      if (author) {
        return NextResponse.json({
          success: true,
          data: {
            id: author.id,
            name: author.name,
            slug: author.slug,
            bio: author.bio,
            image: author.image,
            jobTitle: author.jobTitle,
            articles: author.articles,
            articleCount: author.articles.length,
            isAuthor: true,
          },
        });
      }

      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // For regular users, return public profile
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email, // Public email (can be made optional)
        image: user.image,
        createdAt: user.createdAt,
        isAuthor: false,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
