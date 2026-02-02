/**
 * Client Seed Actions
 * Server actions for creating client seed data (Phase 1)
 */

"use server";

import { runFullSeed, type SeedSummary } from "../../actions/seed-core";

export interface ClientSeedOptions {
  clientCount: number;
  useOpenAI?: boolean;
  industryBrief?: string;
  clearDatabase?: boolean;
}

export interface ClientSeedResult {
  success: boolean;
  summary?: SeedSummary;
  error?: string;
}

/**
 * Create client seed data (Phase 1: Clients + Media only)
 */
export async function createClientSeed(
  options: ClientSeedOptions
): Promise<ClientSeedResult> {
  const { clientCount, useOpenAI = false, industryBrief, clearDatabase = true } = options;

  try {
    if (clientCount < 1 || clientCount > 50) {
      return {
        success: false,
        error: "Client count must be between 1 and 50",
      };
    }

    const summary = await runFullSeed({
      articleCount: 0, // No articles in Phase 1
      clientCount,
      useOpenAI,
      industryBrief,
      clearDatabase,
      seedPhase: "clients-only",
    });

    return {
      success: true,
      summary,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
