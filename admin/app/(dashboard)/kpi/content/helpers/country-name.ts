/**
 * Search Console reports countries as lowercase ISO 3166-1 alpha-3 («sau», «egy»); the browser's
 * Intl.DisplayNames only names alpha-2 regions. This maps the countries modonty's audience actually
 * comes from — the Arab world first, then the usual rest; anything else shows its code.
 */
const ALPHA3_TO_ALPHA2: Record<string, string> = {
  sau: "SA", egy: "EG", are: "AE", kwt: "KW", qat: "QA", bhr: "BH", omn: "OM", jor: "JO", lbn: "LB",
  syr: "SY", irq: "IQ", yem: "YE", pse: "PS", sdn: "SD", lby: "LY", tun: "TN", dza: "DZ", mar: "MA",
  mrt: "MR", som: "SO", dji: "DJ", com: "KM",
  usa: "US", gbr: "GB", can: "CA", aus: "AU", nzl: "NZ", irl: "IE", deu: "DE", fra: "FR", ita: "IT",
  esp: "ES", prt: "PT", nld: "NL", bel: "BE", che: "CH", aut: "AT", swe: "SE", nor: "NO", dnk: "DK",
  fin: "FI", pol: "PL", rou: "RO", grc: "GR", ukr: "UA", rus: "RU", tur: "TR", irn: "IR", isr: "IL",
  pak: "PK", ind: "IN", bgd: "BD", afg: "AF", idn: "ID", mys: "MY", sgp: "SG", phl: "PH", chn: "CN",
  jpn: "JP", kor: "KR", bra: "BR", mex: "MX", arg: "AR", nga: "NG", ken: "KE", eth: "ET", zaf: "ZA",
};

const names = new Intl.DisplayNames(["en"], { type: "region" });

export function countryName(alpha3: string): string {
  if (alpha3 === "zzz") return "Unknown";
  const a2 = ALPHA3_TO_ALPHA2[alpha3.toLowerCase()];
  return a2 ? (names.of(a2) ?? a2) : alpha3.toUpperCase();
}
