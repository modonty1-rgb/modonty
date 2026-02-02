import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCategoryAnalytics } from "../../../helpers/category-queries";
import type { ApiResponse, CategoryAnalytics } from "../../../helpers/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Find category by slug to get ID
    const category = await db.category.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        } as ApiResponse<never>,
        { status: 404 }
      );
    }

    const analytics = await getCategoryAnalytics(category.id);

    const response: ApiResponse<CategoryAnalytics> = {
      success: true,
      data: analytics,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching category analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch category analytics",
      } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
