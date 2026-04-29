import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";
import { notifyTelegram } from "@/lib/telegram/notify";

/**
 * Toggle favorite for the current user on a client page.
 * Idempotent — POST = add, DELETE = remove.
 */

async function findClient(rawSlug: string) {
  const slug = decodeURIComponent(rawSlug);
  return db.client.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });
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
  const client = await findClient(slug);
  if (!client) {
    return NextResponse.json(
      { success: false, error: "Client not found" } as ApiResponse<never>,
      { status: 404 }
    );
  }
  const [existing, count] = await Promise.all([
    db.clientFavorite.findUnique({
      where: { clientId_userId: { clientId: client.id, userId: session.user.id } },
      select: { id: true },
    }),
    db.clientFavorite.count({ where: { clientId: client.id } }),
  ]);
  return NextResponse.json({
    success: true,
    data: { isFavorited: !!existing, count },
  } as ApiResponse<{ isFavorited: boolean; count: number }>);
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
  const client = await findClient(slug);
  if (!client) {
    return NextResponse.json(
      { success: false, error: "Client not found" } as ApiResponse<never>,
      { status: 404 }
    );
  }

  const existing = await db.clientFavorite.findUnique({
    where: { clientId_userId: { clientId: client.id, userId: session.user.id } },
    select: { id: true },
  });

  if (!existing) {
    await db.clientFavorite.create({
      data: { clientId: client.id, userId: session.user.id },
    });

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      null;
    notifyTelegram(client.id, "clientFavorite", {
      title: client.name,
      meta: { بواسطة: session.user.name ?? session.user.email ?? "زائر" },
      ipAddress: ip,
      headers: request.headers,
    }).catch(() => {});
  }

  const count = await db.clientFavorite.count({ where: { clientId: client.id } });
  return NextResponse.json({
    success: true,
    data: { isFavorited: true, count },
  } as ApiResponse<{ isFavorited: boolean; count: number }>);
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
  const client = await findClient(slug);
  if (!client) {
    return NextResponse.json(
      { success: false, error: "Client not found" } as ApiResponse<never>,
      { status: 404 }
    );
  }

  await db.clientFavorite.deleteMany({
    where: { clientId: client.id, userId: session.user.id },
  });
  const count = await db.clientFavorite.count({ where: { clientId: client.id } });
  return NextResponse.json({
    success: true,
    data: { isFavorited: false, count },
  } as ApiResponse<{ isFavorited: boolean; count: number }>);
}
