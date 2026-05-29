"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface SeedResult {
  ok: boolean;
  created?: number;
  updated?: number;
  error?: string;
}

// One test subscriber per plan — plan names MUST match SubscriptionTierConfig.name
// (synced from jbrseo) so the conversion can resolve the tier.
const TEST_SUBSCRIBERS = [
  { planName: "مجاني", planIndex: 0, alias: "free" },
  { planName: "الانطلاقة", planIndex: 1, alias: "starter" },
  { planName: "الزخم", planIndex: 2, alias: "growth" },
  { planName: "الريادة", planIndex: 3, alias: "scale" },
] as const;

export async function seedTestSubscribersAction(): Promise<SeedResult> {
  // TEMP: allowed in production for a one-time prod test. Pattern-scoped (jbrseoId
  // starts with "test-") so it only ever creates/removes test records. Removed next push.
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  try {
    let created = 0;
    let updated = 0;

    for (const t of TEST_SUBSCRIBERS) {
      const jbrseoId = `test-${t.alias}`;
      const email = `modonty1+${t.alias}@gmail.com`;
      const base = {
        jbrseoId,
        contactName: "Test User",
        email,
        phone: "+966500000000",
        businessName: `Test — ${t.planName}`,
        businessType: null,
        planName: t.planName,
        planIndex: t.planIndex,
        country: "SA",
        isAnnual: true,
        jbrseoCreatedAt: new Date(),
      };

      const existing = await db.jbrseoSubscriber.findUnique({
        where: { jbrseoId },
        select: { id: true },
      });

      if (existing) {
        // Preserve conversion state; refresh base fields + sync time
        await db.jbrseoSubscriber.update({
          where: { jbrseoId },
          data: { ...base, syncedAt: new Date() },
        });
        updated++;
      } else {
        await db.jbrseoSubscriber.create({
          data: { ...base, syncedAt: new Date() },
        });
        created++;
      }
    }

    revalidatePath("/clients");
    return { ok: true, created, updated };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to seed test subscribers";
    return { ok: false, error: message };
  }
}
