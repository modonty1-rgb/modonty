import { NextRequest, NextResponse } from "next/server";
import { getFeaturedArticles } from "../../helpers/article-queries";
import type { ApiResponse, ArticleResponse } from "../../helpers/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const articles = await getFeaturedArticles(limit);

    const response: ApiResponse<ArticleResponse[]> = {
      success: true,
      data: articles,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching featured articles:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch featured articles",
      } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
