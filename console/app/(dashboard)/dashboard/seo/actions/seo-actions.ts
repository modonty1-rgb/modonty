"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { messages } from "@/lib/messages";
import { auth } from "@/lib/auth";

/**
 * Security fix (Khalid, 4 Oct 2026): none of these actions checked the session. Create/list
 * trusted a caller-supplied `clientId`, and update/delete acted on a bare row id — so anyone
 * could read, change or delete another partner's keywords and competitors, and errors handed
 * the raw database message to the screen. Every action now resolves the partner from the
 * session and touches only that partner's rows. The `clientId` arguments stay for the existing
 * callers but must equal the signed-in partner.
 */
async function sessionClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}

function refresh() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/seo");
}

export async function createCompetitor(
  clientId: string,
  data: { name: string; url?: string | null; notes?: string | null; order?: number }
) {
  const owner = await sessionClientId();
  if (!owner || owner !== clientId) return { success: false, error: messages.error.unauthorized };
  try {
    await db.clientCompetitor.create({
      data: {
        clientId: owner,
        name: data.name.trim(),
        url: data.url?.trim() || null,
        notes: data.notes?.trim() || null,
        order: data.order ?? 0,
      },
    });
    refresh();
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function updateCompetitor(
  id: string,
  data: { name?: string; url?: string | null; notes?: string | null; order?: number }
) {
  const owner = await sessionClientId();
  if (!owner) return { success: false, error: messages.error.unauthorized };
  try {
    const res = await db.clientCompetitor.updateMany({
      where: { id, clientId: owner },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.url !== undefined && { url: data.url?.trim() || null }),
        ...(data.notes !== undefined && { notes: data.notes?.trim() || null }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });
    if (res.count === 0) return { success: false, error: messages.error.notFound };
    refresh();
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function deleteCompetitor(id: string) {
  const owner = await sessionClientId();
  if (!owner) return { success: false, error: messages.error.unauthorized };
  try {
    const res = await db.clientCompetitor.deleteMany({ where: { id, clientId: owner } });
    if (res.count === 0) return { success: false, error: messages.error.notFound };
    refresh();
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function listCompetitors(clientId: string) {
  const owner = await sessionClientId();
  if (!owner || owner !== clientId) return [];
  return db.clientCompetitor.findMany({
    where: { clientId: owner },
    orderBy: { order: "asc" },
  });
}

export async function createKeyword(
  clientId: string,
  data: { keyword: string; intent?: string | null; priority?: number; reason?: string | null }
) {
  const owner = await sessionClientId();
  if (!owner || owner !== clientId) return { success: false, error: messages.error.unauthorized };
  try {
    await db.clientKeyword.create({
      data: {
        clientId: owner,
        keyword: data.keyword.trim(),
        intent: data.intent?.trim() || null,
        priority: data.priority ?? 0,
        reason: data.reason?.trim() || null,
      },
    });
    refresh();
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function updateKeyword(
  id: string,
  data: { keyword?: string; intent?: string | null; priority?: number; reason?: string | null }
) {
  const owner = await sessionClientId();
  if (!owner) return { success: false, error: messages.error.unauthorized };
  try {
    const res = await db.clientKeyword.updateMany({
      where: { id, clientId: owner },
      data: {
        ...(data.keyword !== undefined && { keyword: data.keyword.trim() }),
        ...(data.intent !== undefined && { intent: data.intent?.trim() || null }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.reason !== undefined && { reason: data.reason?.trim() || null }),
      },
    });
    if (res.count === 0) return { success: false, error: messages.error.notFound };
    refresh();
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function deleteKeyword(id: string) {
  const owner = await sessionClientId();
  if (!owner) return { success: false, error: messages.error.unauthorized };
  try {
    const res = await db.clientKeyword.deleteMany({ where: { id, clientId: owner } });
    if (res.count === 0) return { success: false, error: messages.error.notFound };
    refresh();
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function listKeywords(clientId: string) {
  const owner = await sessionClientId();
  if (!owner || owner !== clientId) return [];
  return db.clientKeyword.findMany({
    where: { clientId: owner },
    orderBy: [{ priority: "desc" }, { keyword: "asc" }],
  });
}
