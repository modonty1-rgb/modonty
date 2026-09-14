import type { NGeniusPaymentState } from "./types";

/** الحالات التي تعني أن المال أُخذ فعلاً. مغلقة عمداً: أي حالة جديدة تُقرأ «غير ناجحة» حتى تُضاف هنا بقرار. */
const SUCCESS_STATES: NGeniusPaymentState[] = ["AUTHORISED", "CAPTURED", "PURCHASED"];

export function isPaymentSucceeded(state: string | undefined): boolean {
  return !!state && (SUCCESS_STATES as string[]).includes(state);
}
