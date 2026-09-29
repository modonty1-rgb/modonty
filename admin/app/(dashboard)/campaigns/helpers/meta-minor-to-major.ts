/** Currencies Meta reports without a minor unit — every other budget comes in cents. */
const NO_DECIMALS = new Set(["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"]);

/** Meta stores budgets in the currency's smallest unit; `null` when the value is not a number. */
export function metaMinorToMajor(value: string | undefined, currency: string): number | null {
  const amount = Number(value);
  if (value == null || value === "" || !Number.isFinite(amount)) return null;
  return NO_DECIMALS.has(currency) ? amount : amount / 100;
}
