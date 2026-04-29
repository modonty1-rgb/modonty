"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { messages } from "@/lib/messages";

type Result =
  | { success: true }
  | { success: false; error: string };

type ExportResult =
  | { success: true; data: string }
  | { success: false; error: string };

type BulkResult =
  | { success: true; count: number }
  | { success: false; error: string };

async function getCurrentClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}

/** Verifies that a subscriber belongs to the current client (cross-tenant guard). */
async function ensureOwnedSubscriber(subscriberId: string, clientId: string) {
  return db.subscriber.findFirst({
    where: { id: subscriberId, clientId },
    select: { id: true },
  });
}

export async function unsubscribeUser(subscriberId: string): Promise<Result> {
  const clientId = await getCurrentClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  try {
    const owned = await ensureOwnedSubscriber(subscriberId, clientId);
    if (!owned) return { success: false, error: messages.error.notFound };

    await db.subscriber.update({
      where: { id: subscriberId },
      data: { subscribed: false, unsubscribedAt: new Date() },
    });

    revalidatePath("/dashboard/subscribers");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function resubscribeUser(subscriberId: string): Promise<Result> {
  const clientId = await getCurrentClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  try {
    const owned = await ensureOwnedSubscriber(subscriberId, clientId);
    if (!owned) return { success: false, error: messages.error.notFound };

    await db.subscriber.update({
      where: { id: subscriberId },
      data: { subscribed: true, unsubscribedAt: null },
    });

    revalidatePath("/dashboard/subscribers");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function deleteSubscriber(subscriberId: string): Promise<Result> {
  const clientId = await getCurrentClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  try {
    const owned = await ensureOwnedSubscriber(subscriberId, clientId);
    if (!owned) return { success: false, error: messages.error.notFound };

    await db.subscriber.delete({ where: { id: subscriberId } });
    revalidatePath("/dashboard/subscribers");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

// ─── Bulk actions ────────────────────────────────────────────────────

export async function bulkUnsubscribeAction(ids: string[]): Promise<BulkResult> {
  const clientId = await getCurrentClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  if (ids.length === 0) return { success: true, count: 0 };

  try {
    const result = await db.subscriber.updateMany({
      where: { id: { in: ids }, clientId, subscribed: true },
      data: { subscribed: false, unsubscribedAt: new Date() },
    });
    revalidatePath("/dashboard/subscribers");
    return { success: true, count: result.count };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function bulkDeleteAction(ids: string[]): Promise<BulkResult> {
  const clientId = await getCurrentClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  if (ids.length === 0) return { success: true, count: 0 };

  try {
    const result = await db.subscriber.deleteMany({
      where: { id: { in: ids }, clientId },
    });
    revalidatePath("/dashboard/subscribers");
    return { success: true, count: result.count };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

// ─── CSV Export with RFC 4180 escaping ───────────────────────────────

function csvEscape(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Quote if contains comma, double-quote, or newline; double the inner quotes.
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function exportSubscribers(): Promise<ExportResult> {
  const clientId = await getCurrentClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  try {
    const subscribers = await db.subscriber.findMany({
      where: { clientId, subscribed: true },
      select: {
        email: true,
        name: true,
        subscribedAt: true,
        consentGiven: true,
        consentDate: true,
      },
      orderBy: { subscribedAt: "desc" },
    });

    const header = [
      "Email",
      "Name",
      "Subscribed At",
      "Consent Given",
      "Consent Date",
    ].join(",");

    const rows = subscribers.map((s) =>
      [
        csvEscape(s.email),
        csvEscape(s.name),
        csvEscape(s.subscribedAt.toISOString()),
        s.consentGiven ? "Yes" : "No",
        csvEscape(s.consentDate?.toISOString()),
      ].join(",")
    );

    // BOM for Excel UTF-8 compatibility (Arabic names render correctly).
    const csv = "\uFEFF" + [header, ...rows].join("\r\n");
    return { success: true, data: csv };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
