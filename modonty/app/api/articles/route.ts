import { NextRequest, NextResponse } from "next/server";
import { getArticles } from "../helpers/article-queries";
import type { ApiResponse, ArticleResponse } from "../helpers/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const category = searchParams.get("category") || undefined;
    const client = searchParams.get("client") || undefined;
    const featured = searchParams.get("featured") === "true" ? true : undefined;

    const result = await getArticles({
      page,
      limit,
      category,
      client,
      featured,
    });

    const response: ApiResponse<ArticleResponse[]> = {
      success: true,
      data: result.articles,
      pagination: result.pagination,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch articles",
      } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
