export function orderMarketLabel(market: string): string {
  if (market === "SA") return "السعودية";
  if (market === "EG") return "مصر";
  return market;
}
