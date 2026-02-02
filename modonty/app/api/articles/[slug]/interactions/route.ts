import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getArticleInteractions } from "../../../helpers/interaction-queries";
import type { ApiResponse, InteractionCounts } from "../../../helpers/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Find article by slug to get ID
    const article = await db.article.findFirst({
      where: { slug },
      select: { id: true },
    });

    if (!article) {
      return NextResponse.json(
        {
          success: false,
          error: "Article not found",
        } as ApiResponse<never>,
        { status: 404 }
      );
    }

    const interactions = await getArticleInteractions(article.id);

    const response: ApiResponse<InteractionCounts> = {
      success: true,
      data: interactions,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching article interactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch article interactions",
      } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
