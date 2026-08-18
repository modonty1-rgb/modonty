import { NextResponse } from "next/server";
import { connection } from "next/server";

import { auth } from "@/lib/auth";
import { getVisitorMemory } from "@/app/(site)/modo-chat/data/get-visitor-memory";

/** What Modo remembers about the signed-in visitor — empty for everyone else. */
export async function GET() {
  await connection();
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ recentScopes: [], lastQuestion: null });
  }

  try {
    return NextResponse.json(await getVisitorMemory(session.user.id));
  } catch (error) {
    console.error("[modo-chat/api/memory]", error);
    // Memory is a courtesy: failing to recall must never block a new conversation.
    return NextResponse.json({ recentScopes: [], lastQuestion: null });
  }
}
