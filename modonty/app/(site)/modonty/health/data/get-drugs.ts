import { cacheLife, cacheTag } from "next/cache";

import { cleanText } from "../helpers/clean-text";
import { parseCsv } from "../helpers/parse-csv";
import type { Drug } from "../helpers/types";
import { downloadOpenDataCsv } from "./download-open-data-csv";

/**
 * هيئة الغذاء والدواء's registered human medicines on the open data platform (open data licence):
 * «الادوية البشرية غير المحلية المسجلة 2025» and «الادوية البشرية المحلية المسجلة 2025» — 8,707
 * drugs, about 1 MB (28 Sep 2026). Not the authority's website: its terms forbid copying from it
 * (sfda.gov.sa/ar/terms-of-use), so no price and no leaflet until it approves.
 */
const DATASETS = ["4b89de5c-a73e-48e5-a553-db6cae96f43a", "2b775c0c-3cce-498e-9671-88d6f74a7588"];

const DISPENSING: Record<string, Drug["dispensing"]> = { OTC: "otc", Prescription: "prescription" };

/** Every registered drug, read from the open data platform and kept for a day — nothing in our database. */
export async function getDrugs(): Promise<Drug[]> {
  "use cache";
  cacheTag("health-drugs");
  cacheLife("days");

  const out: Drug[] = [];
  for (const id of DATASETS) {
    // A file that fails throws: half the list cached for a day would say a drug is not registered.
    const rows = parseCsv(await downloadOpenDataCsv(id));
    const header = rows[0].map(cleanText);
    const col = (name: RegExp) => header.findIndex((h) => name.test(h));
    const [tradeC, sciC, legalC, makerC, countryC, authC] = [
      col(/^TradeName$/i),
      col(/^Scientifi/i),
      col(/^LegalStatus$/i),
      col(/^Manufacture.?Name$/i),
      col(/^Manufacture.?Country$/i),
      col(/^AuthorizationStatus$/i),
    ];
    for (const r of rows.slice(1)) {
      const trade = cleanText(r[tradeC]);
      if (!trade) continue;
      // Only licences still in force.
      if (authC >= 0 && cleanText(r[authC]) && cleanText(r[authC]) !== "Valid") continue;
      out.push({
        trade,
        scientific: cleanText(r[sciC]),
        dispensing: DISPENSING[cleanText(r[legalC])] ?? "other",
        manufacturer: cleanText(r[makerC]),
        country: cleanText(r[countryC]),
      });
    }
  }
  return out;
}
