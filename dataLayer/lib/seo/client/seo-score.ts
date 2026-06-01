// Client SEO score — the SINGLE source of truth for EVERY surface (clients list,
// client detail banner, client SEO page header, console portal). Combines two
// independent, validity-based scores:
//   • META   → computeClientMetaScore  (Google title/desc/OG/canonical/hreflang rules)
//   • JSON-LD → computeClientJsonLdScore (stored Adobe/Ajv/custom validation + recommended completeness)
//
// Reads STORED DB fields (nextjsMetadata + jsonLdStructuredData + jsonLdValidationReport
// + raw client columns) so the number reflects what's actually published and is
// identical everywhere. Designed to extend: an article scorer will live beside this
// under dataLayer/lib/seo/article/ with the same SeoScore/EntitySeoScore contract.

import type { EntitySeoScore, SeoCheck, SeoScore } from "./types";
import { computeClientMetaScore, type ClientMetaInput } from "./meta-score";
import { computeClientJsonLdScore, type ClientJsonLdInput } from "./jsonld-score";

export type { SeoCheck, SeoScore, EntitySeoScore } from "./types";

export interface ClientSeoInput extends ClientMetaInput, ClientJsonLdInput {}

/** Full breakdown: meta + jsonLd + overall, each validity-based. */
export function computeClientEntitySeo(client: ClientSeoInput): EntitySeoScore {
  const meta = computeClientMetaScore(client);
  const jsonLd = computeClientJsonLdScore(client);
  const overall = Math.round((meta.score + jsonLd.score) / 2);
  return { meta, jsonLd, overall };
}

export interface SeoScoreResult {
  score: number;
  checks: SeoCheck[];
}

/**
 * Backward-compatible entry point used by existing surfaces.
 * Returns the OVERALL score + a merged checklist (meta then jsonLd).
 * Existing callers that pass only { nextjsMetadata, jsonLdStructuredData } keep
 * working — missing raw fields simply score as "not filled" (honest low number),
 * which is the whole point of the refactor.
 */
export function computeClientSeoScore(client: ClientSeoInput): SeoScoreResult {
  const { meta, jsonLd, overall } = computeClientEntitySeo(client);
  return { score: overall, checks: [...meta.checks, ...jsonLd.checks] };
}
