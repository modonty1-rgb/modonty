import { normalizeArabic } from "../../helpers/normalize-arabic";
import type { SchoolGender } from "../helpers/types";
import raw from "./schools.json";

type RawResult = [test: string, track: string, year: number, average: number, rank: number];

/**
 * ETEC's ranking of secondary schools in القدرات and التحصيلي — every school's average and national
 * rank, per year, test, track and school gender — written by `scripts/import-etec-education.mjs`
 * from the 26 regional files on the national open data platform. Open data licence: use and build
 * on it, naming the source.
 */
const data = raw as unknown as {
  years: number[];
  /** `${year}|${test}|${track}|${gender}` → the number of schools ranked in that group. */
  totals: Record<string, number>;
  schools: [name: string, region: string, gender: SchoolGender, results: RawResult[]][];
};

export const schools = {
  years: data.years,
  totals: data.totals,
  rows: data.schools.map(([name, region, gender, results]) => ({ name, region, gender, results, key: normalizeArabic(name) })),
};
