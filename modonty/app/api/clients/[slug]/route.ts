import { NextRequest, NextResponse } from "next/server";
import { getClientBySlug } from "../../helpers/client-queries";
import type { ApiResponse } from "../../helpers/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const client = await getClientBySlug(slug);

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          error: "Client not found",
        } as ApiResponse<never>,
        { status: 404 }
      );
    }

    const response: ApiResponse<typeof client> = {
      success: true,
      data: client,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch client",
      } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
