"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getSubscribers() {
  try {
    const subscribers = await db.subscriber.findMany({
      include: {
        client: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return subscribers;
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return [];
  }
}

export async function updateSubscriberStatus(id: string, subscribed: boolean) {
  try {
    const subscriber = await db.subscriber.update({
      where: { id },
      data: {
        subscribed,
        unsubscribedAt: subscribed ? null : new Date(),
      },
    });
    revalidatePath("/subscribers");
    return { success: true, subscriber };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update subscriber";
    return { success: false, error: message };
  }
}

export async function deleteSubscriber(id: string) {
  try {
    await db.subscriber.delete({ where: { id } });
    revalidatePath("/subscribers");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete subscriber";
    return { success: false, error: message };
  }
}

export async function getClients() {
  try {
    return await db.client.findMany({ orderBy: { name: "asc" } });
  } catch (error) {
    return [];
  }
}
