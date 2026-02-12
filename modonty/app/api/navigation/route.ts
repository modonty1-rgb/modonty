import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, NavigationItem } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    // Navigation items - can be made dynamic from database in future
    const navigationItems: NavigationItem[] = [
      { icon: "Home", label: "الرئيسية", href: "/" },
      { icon: "Tags", label: "الفئات", href: "/categories" },
      { icon: "Hash", label: "الوسوم", href: "/tags" },
      { icon: "Building2", label: "العملاء", href: "/clients" },
    ];

    const response: ApiResponse<NavigationItem[]> = {
      success: true,
      data: navigationItems,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching navigation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch navigation",
      } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
