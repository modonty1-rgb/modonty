import { NextRequest, NextResponse } from "next/server";
import { getCategoryBySlug } from "../../helpers/category-queries";
import type { ApiResponse } from "../../helpers/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const category = await getCategoryBySlug(slug);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        } as ApiResponse<never>,
        { status: 404 }
      );
    }

    const response: ApiResponse<typeof category> = {
      success: true,
      data: category,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch category",
      } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
