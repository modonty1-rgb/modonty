"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getJbrseoDb } from "@/lib/jbrseo-client";
import { revalidatePath } from "next/cache";
import type { ObjectId } from "mongodb";

interface JbrseoSubscriberDoc {
  _id: ObjectId;
  contactName?: string | null;
  email: string;
  phone: string;
  businessName?: string | null;
  businessType?: string | null;
  planName: string;
  planIndex?: number | null;
  country: string;
  isAnnual?: boolean;
  createdAt: Date;
}

export type SyncResult =
  | {
      ok: true;
      total: number;
      created: number;
      updated: number;
      durationMs: number;
    }
  | { ok: false; error: string };

export async function syncJbrseoSubscribersAction(): Promise<SyncResult> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Unauthorized" };
  }

  const start = Date.now();

  try {
    const jbrseoDb = await getJbrseoDb();
    const collection = jbrseoDb.collection<JbrseoSubscriberDoc>("Subscriber");

    const docs = await collection.find({}).toArray();
    const total = docs.length;

    let created = 0;
    let updated = 0;

    for (const doc of docs) {
      const jbrseoId = doc._id.toString();
      const data = {
        jbrseoId,
        contactName: doc.contactName ?? null,
        email: doc.email,
        phone: doc.phone,
        businessName: doc.businessName ?? null,
        businessType: doc.businessType ?? null,
        planName: doc.planName,
        planIndex: doc.planIndex ?? null,
        country: doc.country,
        isAnnual: doc.isAnnual ?? false,
        jbrseoCreatedAt: new Date(doc.createdAt),
        syncedAt: new Date(),
      };

      const existing = await db.jbrseoSubscriber.findUnique({
        where: { jbrseoId },
        select: { id: true },
      });

      if (existing) {
        await db.jbrseoSubscriber.update({ where: { jbrseoId }, data });
        updated++;
      } else {
        await db.jbrseoSubscriber.create({ data });
        created++;
      }
    }

    revalidatePath("/jbrseo-subscribers");

    return {
      ok: true,
      total,
      created,
      updated,
      durationMs: Date.now() - start,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown sync error",
    };
  }
}
