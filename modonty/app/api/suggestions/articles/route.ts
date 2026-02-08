import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { getRecentArticles } from "../../helpers/article-queries";
import type { ApiResponse, ArticleResponse } from "../../helpers/types";

export async function GET(request: NextRequest) {
  try {
    try {
      await connection();
    } catch {
      return NextResponse.json({ success: true, data: [] } as ApiResponse<ArticleResponse[]>);
    }
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    const exclude = searchParams.get("exclude") || undefined;

    const articles = await getRecentArticles(limit, exclude);

    const response: ApiResponse<ArticleResponse[]> = {
      success: true,
      data: articles,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching article suggestions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch article suggestions",
      } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
