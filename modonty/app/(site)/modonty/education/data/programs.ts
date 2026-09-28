import { normalizeArabic } from "../../helpers/normalize-arabic";
import type { AccreditationStatus } from "../helpers/types";
import raw from "./programs.json";

/**
 * ETEC's list of university programmes and their accreditation status — the latest year of each
 * programme, written by `scripts/import-etec-education.mjs` from «برامج مؤسسات التعليم العالي الوطني
 * وفق حالة الاعتماد» on the national open data platform. Open data licence: naming the source.
 */
const data = raw as unknown as [institution: string, campus: string, city: string, degree: string, program: string, status: AccreditationStatus, year: number][];

export const programs = data.map(([institution, campus, city, degree, program, status, year]) => ({
  institution,
  campus,
  city,
  degree,
  program,
  status,
  year,
  key: normalizeArabic(`${program} ${institution} ${city}`),
}));
