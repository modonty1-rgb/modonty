import { normalizeArabic } from "../../helpers/normalize-arabic";
import type { Facility } from "../helpers/types";
import { getFacilities } from "./get-facilities";

const LIMIT = 8;

/** Facilities whose Arabic or English name holds every word typed — hospitals first, then the rest. */
export async function searchFacilities(query: string): Promise<{ results: Facility[]; total: number }> {
  const words = normalizeArabic(query).split(" ").filter(Boolean);
  const hits = (await getFacilities()).filter((f) => {
    const key = normalizeArabic(`${f.name} ${f.nameEn ?? ""} ${f.city}`);
    return words.every((w) => key.includes(w));
  });
  const rank = (f: Facility) => (f.type.includes("مستشفى") ? 0 : 1);
  return { total: hits.length, results: hits.sort((a, b) => rank(a) - rank(b)).slice(0, LIMIT) };
}
