import { BROWSER_HEADERS } from "../helpers/browser-headers";

const BASE = "https://open.data.gov.sa";
/** Waits before each retry — the platform's firewall turns away bursts, then lets the same request in. */
const BACKOFF_MS = [0, 1500, 4000];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * One dataset's CSV straight from the national open data platform, by its id — read at request time,
 * nothing stored in our database (Khalid, 28 Sep 2026). The platform now and then answers «Request
 * Rejected» to a request it accepted a second earlier (seen in the dev server, 28 Sep 2026), so each
 * file gets three tries, spaced out. Throws when all fail — the caller must not cache half a list.
 */
export async function downloadOpenDataCsv(datasetId: string): Promise<string> {
  let lastError = "";
  for (const wait of BACKOFF_MS) {
    if (wait) await sleep(wait);
    try {
      const meta = (await (await fetch(`${BASE}/api/datasets/${datasetId}`, { headers: BROWSER_HEADERS })).json()) as {
        resources?: { resourceID: string; format: string }[];
      };
      const resource = meta.resources?.find((r) => /csv/i.test(r.format));
      if (!resource) throw new Error("no CSV resource");
      const text = await (await fetch(`${BASE}/data/api/v1/datasets/${datasetId}/resources/${resource.resourceID}/download`, { headers: BROWSER_HEADERS })).text();
      if (/Request Rejected/.test(text.slice(0, 300))) throw new Error("rejected");
      return text.replace(/^﻿/, "");
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }
  throw new Error(`open data ${datasetId}: ${lastError}`);
}
