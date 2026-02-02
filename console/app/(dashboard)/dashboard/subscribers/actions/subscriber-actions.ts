"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function unsubscribeUser(subscriberId: string, clientId: string) {
  try {
    const subscriber = await db.subscriber.findFirst({
      where: {
        id: subscriberId,
        clientId,
      },
    });

    if (!subscriber) {
      return { success: false, error: "Subscriber not found" };
    }

    await db.subscriber.update({
      where: { id: subscriberId },
      data: {
        subscribed: false,
        unsubscribedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/subscribers");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unsubscribe failed";
    return { success: false, error: message };
  }
}

export async function resubscribeUser(subscriberId: string, clientId: string) {
  try {
    const subscriber = await db.subscriber.findFirst({
      where: {
        id: subscriberId,
        clientId,
      },
    });

    if (!subscriber) {
      return { success: false, error: "Subscriber not found" };
    }

    await db.subscriber.update({
      where: { id: subscriberId },
      data: {
        subscribed: true,
        unsubscribedAt: null,
      },
    });

    revalidatePath("/dashboard/subscribers");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Resubscribe failed";
    return { success: false, error: message };
  }
}

export async function deleteSubscriber(subscriberId: string, clientId: string) {
  try {
    const subscriber = await db.subscriber.findFirst({
      where: {
        id: subscriberId,
        clientId,
      },
    });

    if (!subscriber) {
      return { success: false, error: "Subscriber not found" };
    }

    await db.subscriber.delete({
      where: { id: subscriberId },
    });

    revalidatePath("/dashboard/subscribers");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return { success: false, error: message };
  }
}

export async function exportSubscribers(clientId: string) {
  try {
    const subscribers = await db.subscriber.findMany({
      where: {
        clientId,
        subscribed: true,
      },
      select: {
        email: true,
        name: true,
        subscribedAt: true,
        consentGiven: true,
      },
    });

    const csv = [
      ["Email", "Name", "Subscribed At", "Consent Given"].join(","),
      ...subscribers.map((s) =>
        [
          s.email,
          s.name || "",
          s.subscribedAt.toISOString(),
          s.consentGiven ? "Yes" : "No",
        ].join(",")
      ),
    ].join("\n");

    return { success: true, data: csv };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    return { success: false, error: message };
  }
}
