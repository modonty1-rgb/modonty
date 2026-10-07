"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function exportUserData(userId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        comments: true,
        articleLikes: true,
        articleFavorites: true,
        clientFavorites: true,
        commentLikes: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const exportData = {
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      comments: user.comments,
      articleLikes: user.articleLikes,
      articleFavorites: user.articleFavorites,
      clientFavorites: user.clientFavorites,
      commentLikes: user.commentLikes,
    };

    return { success: true, data: exportData };
  } catch (error) {
    console.error("Error exporting user data:", error);
    return { success: false, error: "Failed to export data" };
  }
}
