import { toE164 } from "@modonty/shared/lib/phone";

import { db } from "@/lib/db";

interface ExistingClient {
  id: string;
  name: string;
  /** Which identifier matched — said in the message, so the rep knows what to check. */
  matchedOn: "email" | "phone";
  /** The client's current order — where «تجديد» starts. Null when the account has none. */
  activeOrderId: string | null;
}

/**
 * **A buyer is one client however many orders he pays** (Khalid, 1 Oct 2026: «العميل واحد والطلبات
 * متعدّدة… سواء ايميل سواء رقم موبايل في حاجات بتكون يونيك ما ينفع تتكرر»).
 *
 * `Client.email` and `Client.phone` are unique in the database (`clients_email_key` ·
 * `clients_phone_key`, measured on dev and production 1 Oct 2026). But that index fires only at
 * activation, as a raw error, after the money is recorded on a second «new» order. This is the
 * same rule asked before anything is written:
 * - email compared case-insensitively — the index is case-sensitive, `Ali@x.com` ≠ `ali@x.com`;
 * - phone compared in E.164 — every client phone is stored that way (46/46), so `0101…` and
 *   `+20101…` are the same number here as they are to the customer.
 */
export async function findClientByIdentity(input: { email?: string | null; phone?: string | null; excludeClientId?: string }): Promise<ExistingClient | null> {
  const email = input.email?.trim();
  const phone = input.phone ? toE164(input.phone).e164 : null;
  const select = { id: true, name: true, activeOrderId: true } as const;
  const notSelf = input.excludeClientId ? { id: { not: input.excludeClientId } } : {};

  if (email) {
    const byEmail = await db.client.findFirst({ where: { email: { equals: email, mode: "insensitive" }, ...notSelf }, select });
    if (byEmail) return { ...byEmail, matchedOn: "email" };
  }
  if (phone) {
    const byPhone = await db.client.findFirst({ where: { phone, ...notSelf }, select });
    if (byPhone) return { ...byPhone, matchedOn: "phone" };
  }
  return null;
}
