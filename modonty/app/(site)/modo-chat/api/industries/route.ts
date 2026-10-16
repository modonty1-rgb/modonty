import { NextResponse } from "next/server";

import type { ApiResponse } from "@/lib/types";
import { getAnswerableIndustries } from "@/app/(site)/modo-chat/data/get-answerable-industries";

/**
 * The industries Modo can actually serve, most partners first.
 *
 * Industry is the axis the business runs on: partners belong to an industry, so an industry with
 * partners AND their published articles is a question Modo can answer and end with a booking.
 * Anything else is a dead end and is never offered (`get-answerable-industries.ts`).
 * socialImage is deliberately not read: every industry carries the platform default logo, and
 * `getScopeIcon` gives a distinct icon for free.
 */
export async function GET() {
  try {
    return NextResponse.json({ industries: await getAnswerableIndustries() });
  } catch (error) {
    console.error("[modo-chat/api/industries]", error);
    return NextResponse.json(
      { success: false, error: "تعذّر جلب المجالات" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
