import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { ApiResponse } from "../helpers/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, clientId } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Invalid email" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: "Client ID required" } as ApiResponse<never>,
        { status: 400 }
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
