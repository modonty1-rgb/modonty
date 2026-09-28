import { normalizeArabic } from "../../helpers/normalize-arabic";
import type { AccreditationStatus, ProgramMatch } from "../helpers/types";
import { programs } from "./programs";

const LIMIT = 8;
/** Fully accredited first — what the reader hopes to find — then the rest in the order of concern. */
const ORDER: Record<AccreditationStatus, number> = { full: 0, conditional: 1, pending: 2, none: 3, expired: 4, rejected: 5 };

/** Programmes whose name, university or city holds every word the reader typed. */
export function searchPrograms(query: string): { total: number; results: ProgramMatch[] } {
  const words = normalizeArabic(query).split(" ").filter(Boolean);
  const hits = programs.filter((p) => words.every((w) => p.key.includes(w)));
  const results = hits
    .sort((a, b) => ORDER[a.status] - ORDER[b.status] || a.institution.localeCompare(b.institution, "ar"))
    .slice(0, LIMIT)
    .map(({ institution, campus, city, degree, program, status, year }) => ({ institution, campus, city, degree, program, status, year }));
  return { total: hits.length, results };
}
