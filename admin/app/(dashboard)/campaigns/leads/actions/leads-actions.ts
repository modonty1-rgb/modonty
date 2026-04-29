"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { CampaignInterestStatus, CampaignReach } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface CampaignLead {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  clientSlug: string;
  reach: CampaignReach;
  source: string | null;
  status: CampaignInterestStatus;
  notes: string | null;
  contactedAt: Date | null;
  convertedAt: Date | null;
  cancelledAt: Date | null;
  cancelReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getCampaignLeads(): Promise<CampaignLead[]> {
  const rows = await db.campaignInterest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: {
        select: { id: true, name: true, email: true, phone: true, slug: true },
      },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    clientId: r.clientId,
    clientName: r.client.name,
    clientEmail: r.client.email,
    clientPhone: r.client.phone,
    clientSlug: r.client.slug,
    reach: r.reach,
    source: r.source,
    status: r.status,
    notes: r.notes,
    contactedAt: r.contactedAt,
    convertedAt: r.convertedAt,
    cancelledAt: r.cancelledAt,
    cancelReason: r.cancelReason,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

export async function getCampaignLeadStats() {
  const counts = await db.campaignInterest.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const map: Record<CampaignInterestStatus, number> = {
    NEW: 0,
    CONTACTED: 0,
    CONVERTED: 0,
    CANCELLED: 0,
  };
  counts.forEach((c) => {
    map[c.status] = c._count._all;
  });
  return map;
}

interface UpdateInput {
  id: string;
  status: CampaignInterestStatus;
  notes?: string;
  cancelReason?: string;
}

type Result =
  | { success: true }
  | { success: false; error: "unauthorized" | "not_found" | "server_error" };

export async function updateCampaignLeadStatusAction(input: UpdateInput): Promise<Result> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "unauthorized" };

  try {
    const existing = await db.campaignInterest.findUnique({
      where: { id: input.id },
      select: { id: true, status: true, notes: true },
    });
    if (!existing) return { success: false, error: "not_found" };

    const now = new Date();
    const data: {
      status: CampaignInterestStatus;
      notes?: string;
      cancelReason?: string | null;
      contactedAt?: Date;
      convertedAt?: Date;
      cancelledAt?: Date | null;
    } = { status: input.status };

    if (input.status === "CONTACTED" && existing.status !== "CONTACTED") {
      data.contactedAt = now;
    }
    if (input.status === "CONVERTED" && existing.status !== "CONVERTED") {
      data.convertedAt = now;
    }
    if (input.status === "CANCELLED" && existing.status !== "CANCELLED") {
      data.cancelledAt = now;
      data.cancelReason = input.cancelReason ?? null;
    }
    if (input.notes !== undefined) {
      data.notes = input.notes;
    }

    await db.campaignInterest.update({ where: { id: input.id }, data });
    revalidatePath("/campaigns/leads");
    return { success: true };
  } catch {
    return { success: false, error: "server_error" };
  }
}

export async function appendCampaignLeadNoteAction(
  id: string,
  note: string
): Promise<Result> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "unauthorized" };
  if (!note.trim()) return { success: false, error: "server_error" };

  try {
    const existing = await db.campaignInterest.findUnique({
      where: { id },
      select: { notes: true },
    });
    if (!existing) return { success: false, error: "not_found" };

    const stamp = new Date().toISOString();
    const line = `📝 ${stamp.slice(0, 16).replace("T", " ")} — ${note.trim()}`;
    const merged = existing.notes ? `${existing.notes}\n${line}` : line;

    await db.campaignInterest.update({
      where: { id },
      data: { notes: merged },
    });
    revalidatePath("/campaigns/leads");
    return { success: true };
  } catch {
    return { success: false, error: "server_error" };
  }
}
