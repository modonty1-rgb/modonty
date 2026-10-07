import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";
import { getClientFavoriteState, type ClientFavoriteResult } from "@/lib/clients/get-client-favorite-state";
import { favoriteClientAs } from "@/lib/clients/favorite-client-as";
import { unfavoriteClientAs } from "@/lib/clients/unfavorite-client-as";

/**
 * Toggle favorite for the current user on a client page.
 * Idempotent — POST = add, DELETE = remove.
 *
 * Web door: identity from the session cookie; the logic lives in lib/clients/*favorite*
 * (shared with the mobile API). Responses are unchanged.
 */

function answer(result: ClientFavoriteResult) {
  if (!result.found) {
    return NextResponse.json(
      { success: false, error: "Client not found" } as ApiResponse<never>,
      { status: 404 }
    );
  }
  return NextResponse.json({
    success: true,
    data: { isFavorited: result.isFavorited, count: result.count },
  } as ApiResponse<{ isFavorited: boolean; count: number }>);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: true, data: { isFavorited: false, count: 0 } } as ApiResponse<{
        isFavorited: boolean;
        count: number;
      }>
    );
  }
  const { slug } = await params;
  return answer(await getClientFavoriteState(session.user.id, decodeURIComponent(slug)));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" } as ApiResponse<never>,
      { status: 401 }
    );
  }
  const { slug } = await params;
  return answer(
    await favoriteClientAs(
      { id: session.user.id, name: session.user.name ?? null, email: session.user.email ?? null },
      decodeURIComponent(slug),
      request.headers,
    )
  );
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" } as ApiResponse<never>,
      { status: 401 }
    );
  }
  const { slug } = await params;
  return answer(await unfavoriteClientAs(session.user.id, decodeURIComponent(slug)));
}
