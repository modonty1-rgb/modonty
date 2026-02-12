import { NextRequest, NextResponse } from "next/server";
import { getCategoriesWithCounts } from "../helpers/category-queries";
import type { ApiResponse, CategoryResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const categories = await getCategoriesWithCounts();

    const response: ApiResponse<CategoryResponse[]> = {
      success: true,
      data: categories,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
      } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
