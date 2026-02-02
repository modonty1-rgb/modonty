"use server";

import { getJsonLdStats } from "@/lib/seo";

export async function getJsonLdStatistics(): Promise<{
  total: number;
  withJsonLd: number;
  withErrors: number;
  withWarnings: number;
}> {
  return getJsonLdStats();
}
