import { NextResponse } from "next/server";
import { SubscriptionStatus } from "@prisma/client";

import { db } from "@/lib/db";

import type { ApiResponse } from "@/lib/types";

/**
 * The industries Modo can actually serve, newest-first by how many partners stand behind them.
 *
 * Industry is the axis the business runs on: partners belong to an industry, so an industry with
 * partners is a question Modo can end with a booking. An industry with none is a dead end and is
 * never offered.
 */
export async function GET() {
  try {
    const industries = await db.industry.findMany({
      select: {
        name: true,
        slug: true,
        description: true,
        // socialImage is deliberately NOT selected: every industry carries the platform default
        // logo, so the chips rendered six identical grey squares and six image requests for no
        // information. `getScopeIcon` gives a distinct icon for free.
        _count: { select: { clients: { where: { subscriptionStatus: SubscriptionStatus.ACTIVE } } } },
      },
      take: 20,
    });

    const usable = industries
      .map((i) => ({
        name: i.name,
        slug: i.slug,
        description: i.description,
        partnerCount: i._count.clients,
      }))
      .filter((i) => i.partnerCount > 0)
      .sort((a, b) => b.partnerCount - a.partnerCount);

    return NextResponse.json({ industries: usable });
  } catch (error) {
    console.error("[modo-chat/api/industries]", error);
    return NextResponse.json(
      { success: false, error: "تعذّر جلب المجالات" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
