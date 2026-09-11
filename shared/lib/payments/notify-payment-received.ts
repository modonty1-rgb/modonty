import { escapeTgHtml, sendAdminTelegram } from "../telegram/client";

/**
 * One message for every «money arrived» event, whichever door it came through — the
 * gateway webhook, the fallback status poll, or a staff member confirming a bank transfer
 * (PAY-E7). Never throws: a notification must not fail the payment it reports.
 * `sendAdminTelegram` is a no-op outside production (shared/lib/telegram/client.ts:71).
 */
export interface PaymentReceivedNotice {
  orderNumber: string;
  planName: string;
  paidMonths: number;
  bonusServiceMonths: number;
  totalMinor: number;
  currency: string;
  market: string;
  buyerName: string;
  source: "gateway" | "status-poll" | "manual-transfer";
}

const SOURCE_LABEL: Record<PaymentReceivedNotice["source"], string> = {
  gateway: "بوابة الدفع",
  "status-poll": "الاستعلام الاحتياطي",
  "manual-transfer": "تأكيد تحويل يدوي",
};

export function formatPaymentReceivedMessage(n: PaymentReceivedNotice): string {
  const amount = (n.totalMinor / 100).toLocaleString("ar-SA", { maximumFractionDigits: 2 });
  const bonus = n.bonusServiceMonths ? ` + ${n.bonusServiceMonths} هدية` : "";
  return [
    `💰 <b>وصل مبلغ — ${escapeTgHtml(n.orderNumber)}</b>`,
    `الباقة: ${escapeTgHtml(n.planName)} · ${n.paidMonths} أشهر${bonus}`,
    `الإجمالي: ${amount} ${escapeTgHtml(n.currency)} · السوق ${escapeTgHtml(n.market)}`,
    `المشتري: ${escapeTgHtml(n.buyerName)}`,
    `المصدر: ${SOURCE_LABEL[n.source]}`,
  ].join("\n");
}

export async function notifyPaymentReceived(n: PaymentReceivedNotice): Promise<{ success: boolean; error?: string }> {
  try {
    return await sendAdminTelegram(formatPaymentReceivedMessage(n));
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "notify failed" };
  }
}
