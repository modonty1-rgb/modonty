import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";
import { getOrCreateSessionId, createConversion } from "@/lib/conversion-tracking";
import { ConversionType } from "@prisma/client";

const subscribeSchema = z.object({
  email: z.string().email().max(254),
  clientId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const { email, clientId } = parsed.data;

    // Rate limit: max 5 subscription attempts per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await db.subscriber.count({
      where: { email, subscribedAt: { gt: oneHourAgo } },
    });
    if (recentCount >= 5) {
      return NextResponse.json(
        { success: false, error: "حاول مرة أخرى لاحقاً" } as ApiResponse<never>,
        { status: 429 }
      );
    }

    // Check if already subscribed for this client
    const existing = await db.subscriber.findFirst({
      where: {
        email,
        clientId,
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        data: { message: "Already subscribed to this client" },
      } as ApiResponse<{ message: string }>);
    }

    // Create subscriber
    await db.subscriber.create({
      data: {
        email,
        clientId,
        subscribed: true,
        subscribedAt: new Date(),
        consentGiven: true,
        consentDate: new Date(),
      },
    });

    const sessionId = await getOrCreateSessionId();
    await createConversion({
      type: ConversionType.NEWSLETTER,
      clientId,
      sessionId,
    });

    return NextResponse.json({
      success: true,
      data: { message: "Subscribed successfully" },
    } as ApiResponse<{ message: string }>);
  } catch (error) {
    console.error("Error subscribing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to subscribe" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
