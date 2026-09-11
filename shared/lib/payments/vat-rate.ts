/**
 * VAT per market, in basis points (1500 = 15%). One constant, read by the order snapshot
 * only — the catalog price is VAT-INCLUSIVE (PAY-Q7), so this is used to split a total into
 * subtotal + VAT for the tax invoice (PAY-Q14), never to add on top.
 *
 * Egypt throws on purpose: its rate is unmeasured (PAY-UNKNOWN #5) and Egypt is not sold
 * through a gateway yet (PAY-Q5). Guessing 14% here would print a wrong tax line.
 */
export const SA_VAT_RATE_BP = 1500;

export function vatRateBpForMarket(market: string): number {
  if (market === "SA") return SA_VAT_RATE_BP;
  throw new Error(`VAT rate for market "${market}" is not configured`);
}
