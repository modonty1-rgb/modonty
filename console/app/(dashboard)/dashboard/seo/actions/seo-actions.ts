"use server";

import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createSeoIntake(
  clientId: string,
  answers: Record<string, unknown>,
  collectedBy?: string | null
) {
  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    });
    if (!client) return { success: false, error: "Client not found" };

    const existing = await db.seoIntake.findFirst({
      where: { clientId },
      orderBy: { collectedAt: "desc" },
      select: { id: true },
    });

    if (existing) {
      await db.seoIntake.update({
        where: { id: existing.id },
        data: {
          answers: answers as Prisma.InputJsonValue,
          collectedAt: new Date(),
          collectedBy: collectedBy ?? null,
        },
      });
    } else {
      await db.seoIntake.create({
        data: {
          clientId,
          answers: answers as Prisma.InputJsonValue,
          collectedBy: collectedBy ?? null,
        },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/seo");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Create failed";
    return { success: false, error: message };
  }
}

export async function getLatestSeoIntake(clientId: string) {
  return db.seoIntake.findFirst({
    where: { clientId },
    orderBy: { collectedAt: "desc" },
  });
}

export async function createCompetitor(
  clientId: string,
  data: { name: string; url?: string | null; notes?: string | null; order?: number }
) {
  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    });
    if (!client) return { success: false, error: "Client not found" };

    await db.clientCompetitor.create({
      data: {
        clientId,
        name: data.name.trim(),
        url: data.url?.trim() || null,
        notes: data.notes?.trim() || null,
        order: data.order ?? 0,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/seo");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Create failed";
    return { success: false, error: message };
  }
}

export async function updateCompetitor(
  id: string,
  data: { name?: string; url?: string | null; notes?: string | null; order?: number }
) {
  try {
    await db.clientCompetitor.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.url !== undefined && { url: data.url?.trim() || null }),
        ...(data.notes !== undefined && { notes: data.notes?.trim() || null }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/seo");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed";
    return { success: false, error: message };
  }
}

export async function deleteCompetitor(id: string) {
  try {
    await db.clientCompetitor.delete({ where: { id } });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/seo");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Delete failed";
    return { success: false, error: message };
  }
}

export async function listCompetitors(clientId: string) {
  return db.clientCompetitor.findMany({
    where: { clientId },
    orderBy: { order: "asc" },
  });
}

export async function createKeyword(
  clientId: string,
  data: { keyword: string; intent?: string | null; priority?: number; reason?: string | null }
) {
  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    });
    if (!client) return { success: false, error: "Client not found" };

    await db.clientKeyword.create({
      data: {
        clientId,
        keyword: data.keyword.trim(),
        intent: data.intent?.trim() || null,
        priority: data.priority ?? 0,
        reason: data.reason?.trim() || null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/seo");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Create failed";
    return { success: false, error: message };
  }
}

export async function updateKeyword(
  id: string,
  data: { keyword?: string; intent?: string | null; priority?: number; reason?: string | null }
) {
  try {
    await db.clientKeyword.update({
      where: { id },
      data: {
        ...(data.keyword !== undefined && { keyword: data.keyword.trim() }),
        ...(data.intent !== undefined && { intent: data.intent?.trim() || null }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.reason !== undefined && { reason: data.reason?.trim() || null }),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/seo");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed";
    return { success: false, error: message };
  }
}

export async function deleteKeyword(id: string) {
  try {
    await db.clientKeyword.delete({ where: { id } });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/seo");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Delete failed";
    return { success: false, error: message };
  }
}

export async function listKeywords(clientId: string) {
  return db.clientKeyword.findMany({
    where: { clientId },
    orderBy: [{ priority: "desc" }, { keyword: "asc" }],
  });
}

