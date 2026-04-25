import type { GscUrlInspectionResult } from "./types";
import { GSC_PROPERTY, getSearchConsoleClient } from "./client";

export async function inspectUrl(url: string): Promise<GscUrlInspectionResult> {
  const client = getSearchConsoleClient();

  const res = await client.urlInspection.index.inspect({
    requestBody: {
      inspectionUrl: url,
      siteUrl: GSC_PROPERTY,
      languageCode: "ar-SA",
    },
  });

  const result = res.data.inspectionResult;

  return {
    inspectionUrl: url,
    indexStatusResult: result?.indexStatusResult
      ? {
          verdict: result.indexStatusResult.verdict ?? "UNKNOWN",
          coverageState: result.indexStatusResult.coverageState ?? "",
          robotsTxtState: result.indexStatusResult.robotsTxtState ?? "",
          indexingState: result.indexStatusResult.indexingState ?? "",
          lastCrawlTime: result.indexStatusResult.lastCrawlTime ?? undefined,
          pageFetchState: result.indexStatusResult.pageFetchState ?? undefined,
          googleCanonical: result.indexStatusResult.googleCanonical ?? undefined,
          userCanonical: result.indexStatusResult.userCanonical ?? undefined,
          sitemap: result.indexStatusResult.sitemap ?? undefined,
          referringUrls: result.indexStatusResult.referringUrls ?? undefined,
          crawledAs: result.indexStatusResult.crawledAs ?? undefined,
        }
      : undefined,
    mobileUsabilityResult: result?.mobileUsabilityResult
      ? {
          verdict: result.mobileUsabilityResult.verdict ?? "UNKNOWN",
        }
      : undefined,
  };
}
