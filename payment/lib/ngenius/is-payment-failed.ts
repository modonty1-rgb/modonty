import type { NGeniusPaymentState } from "./types";

/** فشلٌ نهائي — لا يُنتظر بعده تحوّل. ما ليس نجاحاً ولا فشلاً فهو «ما زال يجري» (STARTED مثلاً). */
const FAILURE_STATES: NGeniusPaymentState[] = ["DECLINED", "FAILED", "EXPIRED", "CANCELLED"];

export function isPaymentFailed(state: string | undefined): boolean {
  return !!state && (FAILURE_STATES as string[]).includes(state);
}
