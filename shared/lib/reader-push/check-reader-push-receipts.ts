import { Expo } from "expo-server-sdk";
import { db } from "../db";
import { disableReaderDevices } from "./disable-reader-devices";

/**
 * إيصالات Expo — توثيق Expo: «checking push receipts 15 minutes after sending»، والإيصال يُمسح
 * بعد ٢٤ ساعة. الإيصال وحده يقول إن Google/Apple اعتبرا الجهاز محذوفاً (`DeviceNotRegistered`)،
 * فيُوقف ذلك الجهاز ولا يُدفع له حتى يسجّل من جديد.
 *
 * التذكرة تُحذف متى وصل إيصالها أو تجاوزت ٢٤ ساعة؛ ما لم يصل إيصاله بعد يبقى للدورة التالية.
 */
const WAIT_MS = 15 * 60 * 1000;
const EXPIRE_MS = 24 * 60 * 60 * 1000;
const BATCH = 3000;

export interface ReceiptCheckResult {
  checked: number;
  errors: number;
  disabledDevices: number;
  expired: number;
}

export async function checkReaderPushReceipts(): Promise<ReceiptCheckResult> {
  const now = Date.now();
  const tickets = await db.readerPushTicket.findMany({
    where: { createdAt: { lte: new Date(now - WAIT_MS) } },
    orderBy: { createdAt: "asc" },
    take: BATCH,
    select: { id: true, ticketId: true, expoPushToken: true, createdAt: true },
  });
  if (tickets.length === 0) return { checked: 0, errors: 0, disabledDevices: 0, expired: 0 };

  const accessToken = process.env.EXPO_ACCESS_TOKEN;
  const expo = new Expo(accessToken ? { accessToken } : {});
  const byTicket = new Map(tickets.map((t) => [t.ticketId, t]));
  const done: string[] = [];
  const deadTokens: string[] = [];
  let errors = 0;

  for (const ids of expo.chunkPushNotificationReceiptIds(tickets.map((t) => t.ticketId))) {
    let receipts: Awaited<ReturnType<Expo["getPushNotificationReceiptsAsync"]>>;
    try {
      receipts = await expo.getPushNotificationReceiptsAsync(ids);
    } catch (error) {
      console.error("[reader-push] receipts request failed — retried next run", error);
      continue;
    }
    for (const [ticketId, receipt] of Object.entries(receipts)) {
      const ticket = byTicket.get(ticketId);
      if (!ticket) continue;
      done.push(ticket.id);
      if (receipt.status === "ok") continue;
      errors += 1;
      if (receipt.details?.error === "DeviceNotRegistered") deadTokens.push(ticket.expoPushToken);
      else console.warn("[reader-push] receipt error", receipt.details?.error ?? receipt.message);
    }
  }

  const finished = new Set(done);
  const expired = tickets.filter((t) => !finished.has(t.id) && now - t.createdAt.getTime() > EXPIRE_MS).map((t) => t.id);
  const remove = [...done, ...expired];
  if (remove.length) await db.readerPushTicket.deleteMany({ where: { id: { in: remove } } });
  const disabledDevices = deadTokens.length ? await disableReaderDevices({ tokens: deadTokens }, "DeviceNotRegistered") : 0;

  return { checked: done.length, errors, disabledDevices, expired: expired.length };
}
