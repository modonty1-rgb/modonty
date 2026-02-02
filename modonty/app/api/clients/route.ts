import { NextRequest, NextResponse } from "next/server";
import { getClientsWithCounts } from "../helpers/client-queries";
import type { ApiResponse, ClientResponse } from "../helpers/types";

export async function GET(request: NextRequest) {
  try {
    const clients = await getClientsWithCounts();

    const response: ApiResponse<ClientResponse[]> = {
      success: true,
      data: clients,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch clients",
      } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
