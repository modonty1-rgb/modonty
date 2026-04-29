"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CampaignReach } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { notifyTelegram } from "@/lib/telegram/notify";

const NOTIFICATION_TYPE = "campaign_interest";

const REACH_LABEL: Record<CampaignReach, string> = {
  OWN: "مشتركو نشرة العميل",
  INDUSTRY: "جمهور القطاع",
  FULL: "كامل قاعدة مودونتي",
};

const SOURCE_VALID = ["hero", "tier-own", "tier-industry", "tier-full", "final-cta"] as const;
type Source = (typeof SOURCE_VALID)[number];

interface Input {
  reach: "own" | "industry" | "full";
  source?: Source;
}

type Result =
  | { success: true; alreadyRegistered: boolean; reachChanged: boolean }
  | { success: false; error: "unauthorized" | "server_error" };

function toEnum(reach: Input["reach"]): CampaignReach {
  if (reach === "industry") return "INDUSTRY";
  if (reach === "full") return "FULL";
  return "OWN";
}

export async function registerCampaignInterestAction(input: Input): Promise<Result> {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) return { success: false, error: "unauthorized" };

  const reach = toEnum(input.reach);
  const source = input.source && SOURCE_VALID.includes(input.source) ? input.source : null;

  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { id: true, name: true, userId: true },
    });
    if (!client) return { success: false, error: "unauthorized" };

    const existing = await db.campaignInterest.findUnique({
      where: { clientId },
      select: { id: true, reach: true, notes: true },
    });

    let reachChanged = false;

    if (existing) {
      if (existing.reach !== reach) {
        const stamp = new Date().toISOString();
        const historyLine = `🔄 رفع الاهتمام من ${existing.reach} → ${reach} (${stamp})`;
        const updatedNotes = existing.notes ? `${existing.notes}\n${historyLine}` : historyLine;
        await db.campaignInterest.update({
          where: { clientId },
          data: { reach, notes: updatedNotes, ...(source ? { source } : {}) },
        });
        reachChanged = true;
      }
      // Same reach → no-op (true idempotency on the lead row).
      revalidatePath("/dashboard/campaigns");
      return { success: true, alreadyRegistered: true, reachChanged };
    }

    await db.campaignInterest.create({
      data: {
        clientId,
        reach,
        source,
        status: "NEW",
      },
    });

    // Bell-icon ping for the team (one-shot — not the source of truth).
    const targetUserId =
      client.userId ??
      (
        await db.user.findFirst({
          where: { role: "ADMIN" },
          select: { id: true },
        })
      )?.id;

    if (targetUserId) {
      await db.notification.create({
        data: {
          userId: targetUserId,
          clientId,
          type: NOTIFICATION_TYPE,
          title: `طلب اهتمام بالحملات — ${client.name}`,
          body: `العميل سجّل اهتمامه (${REACH_LABEL[reach]}). افتح لوحة الحملات للمتابعة.`,
          readAt: null,
        },
      });
    }

    notifyTelegram(clientId, "campaignInterest", {
      title: client.name,
      meta: { النطاق: REACH_LABEL[reach] },
    }).catch(() => {});

    revalidatePath("/dashboard/campaigns");
    return { success: true, alreadyRegistered: false, reachChanged: false };
  } catch {
    return { success: false, error: "server_error" };
  }
}
