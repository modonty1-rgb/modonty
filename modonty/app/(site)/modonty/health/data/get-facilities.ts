import { cacheLife, cacheTag } from "next/cache";

import { cleanText } from "../helpers/clean-text";
import { parseCsv } from "../helpers/parse-csv";
import type { Facility } from "../helpers/types";
import { downloadOpenDataCsv } from "./download-open-data-csv";

/** سباهي — «حالة الاعتماد للمنشآت الصحية», one dataset per region (ids read 28 Sep 2026). */
const CBAHI = [
  "4c446883-2636-4b8d-af36-2d75d59b4f0f", "28182873-3308-4be3-916d-912455586a2c", "d5ea2fa6-65f8-42ed-9866-3bf649937bfb",
  "bc16b4b2-5ddc-4362-b1f4-1989a3fba511", "3df9ad42-d214-47a9-b917-86d4ae345759", "6fde56d9-842e-4b58-8a8c-576e13841234",
  "ef27e888-6a68-4e3c-8f31-b3d522b33957", "54cd6a88-5579-4c43-b300-a4103256597a", "b5ba5868-ab65-4df7-b76d-963daf8ce43e",
  "2ad011c3-562d-46d6-bde3-7d4207c523bb", "6d762c30-967a-489a-9a13-16d1c94743e9", "8621e305-cee8-4b6c-b343-a019b03a588d",
  "1b847982-af4f-407e-a2a7-8f2ba19d96b2",
];
/** مجلس الضمان الصحي — the private hospitals and pharmacies accredited for insurance (2025 Q4). */
const CHI = ["f354a904-a68b-4365-9d48-f5e1700f0e03", "4811a908-9bb1-478d-9f39-bd8da558cd28"];

// One region's file is in English; the page speaks Arabic.
const STATUS: Record<string, string> = { Accredited: "معتمد", Denial: "رفض الاعتماد", Conditional: "اعتماد مشروط", Revoked: "سحب الاعتماد", Suspended: "تعليق الاعتماد" };
const TYPE: Record<string, string> = {
  Hospital: "مستشفى",
  "Clinical Laboratory and Blood Bank": "المختبرات الطبية وبنوك الدم",
  "Primary Healthcare Center": "مراكز الرعاية الصحية الأولية",
  "Ambulatory Care Center": "المراكز والمجمعات الطبية الخارجية",
  "Dental Centers": "مراكز الأسنان",
  "Home Healthcare": "مراكز الرعاية الصحية المنزلية",
};

// A file that fails throws: a region missing for a day would say its hospitals are not accredited.
const read = async (id: string) => parseCsv(await downloadOpenDataCsv(id));

/**
 * Every facility in the two official lists, read from the open data platform and kept for a day —
 * nothing in our database. سباهي gives a facility's accreditation status and its end date; مجلس الضمان
 * الصحي says whether an insurer may send you there.
 */
export async function getFacilities(): Promise<Facility[]> {
  "use cache";
  cacheTag("health-facilities");
  cacheLife("days");

  // One after another, not fifteen at once — a burst is what the platform's firewall turns away.
  const cbahi: string[][][] = [];
  for (const id of CBAHI) cbahi.push(await read(id));
  const chi: string[][][] = [];
  for (const id of CHI) chi.push(await read(id));
  const out: Facility[] = [];

  for (const rows of cbahi) {
    for (const r of rows.slice(1)) {
      const name = cleanText(r[2]);
      if (!name) continue;
      const status = cleanText(r[6]);
      out.push({
        name,
        type: TYPE[cleanText(r[3])] ?? cleanText(r[3]),
        region: cleanText(r[1]),
        city: cleanText(r[4]),
        source: "cbahi",
        status: STATUS[status] ?? status,
        until: cleanText(r[7]).split("-")[1]?.trim() || undefined,
      });
    }
  }
  for (const rows of chi) {
    for (const r of rows.slice(1)) {
      const name = cleanText(r[0]);
      if (!name) continue;
      out.push({ name, nameEn: cleanText(r[1]) || undefined, type: cleanText(r[2]), region: cleanText(r[4]), city: cleanText(r[3]), source: "chi" });
    }
  }
  return out;
}
