"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface RemoveResult {
  ok: boolean;
  subscribersDeleted?: number;
  clientsDeleted?: number;
  error?: string;
}

// Pattern that uniquely identifies seeded test data. This is the safety anchor:
// the delete can ONLY ever match records whose jbrseoId starts with "test-",
// so it can never touch a real subscriber or a real converted client.
const TEST_PREFIX = "test-";

export async function removeTestSubscribersAction(): Promise<RemoveResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  try {
    const testSubs = await db.jbrseoSubscriber.findMany({
      where: { jbrseoId: { startsWith: TEST_PREFIX } },
      select: { id: true, convertedToClientId: true },
    });

    if (testSubs.length === 0) {
      return { ok: true, subscribersDeleted: 0, clientsDeleted: 0 };
    }

    const clientIds = testSubs
      .map((s) => s.convertedToClientId)
      .filter((id): id is string => Boolean(id));

    let clientsDeleted = 0;
    if (clientIds.length > 0) {
      // SEO lives as fields on Client (no separate model) — deleted with the client.
      await db.emailEvent.deleteMany({ where: { clientId: { in: clientIds } } });
      const res = await db.client.deleteMany({ where: { id: { in: clientIds } } });
      clientsDeleted = res.count;
    }

    const subsRes = await db.jbrseoSubscriber.deleteMany({
      where: { jbrseoId: { startsWith: TEST_PREFIX } },
    });

    revalidatePath("/clients");
    return {
      ok: true,
      subscribersDeleted: subsRes.count,
      clientsDeleted,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to remove test subscribers";
    return { ok: false, error: message };
  }
}

/** Count test data so the UI can show "X subscribers + Y clients" before deleting. */
export async function countTestSubscribersAction(): Promise<{
  subscribers: number;
  clients: number;
}> {
  const session = await auth();
  if (!session?.user) return { subscribers: 0, clients: 0 };

  const testSubs = await db.jbrseoSubscriber.findMany({
    where: { jbrseoId: { startsWith: TEST_PREFIX } },
    select: { convertedToClientId: true },
  });

  return {
    subscribers: testSubs.length,
    clients: testSubs.filter((s) => s.convertedToClientId).length,
  };
}
