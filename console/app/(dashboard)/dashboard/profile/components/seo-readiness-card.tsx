import { computeClientSeoScore } from "@modonty/database/lib/seo/client/seo-score";
import { clientToSeoInput } from "@modonty/database/lib/seo/client/from-client";

import { SeoReadinessButton } from "./seo-readiness-button";

interface SeoReadinessCardProps {
  /** Raw client row (loose shape) — mapped to the scorer input internally. */
  client: Record<string, unknown>;
}

// Server-side compute, then hands the serializable {score, checks} to a small
// client trigger that shows a compact "جاهزية SEO · NN%" badge in the header and
// opens a dialog with the full checklist on click.
export function SeoReadinessCard({ client }: SeoReadinessCardProps) {
  const { score, checks } = computeClientSeoScore(clientToSeoInput(client));
  return <SeoReadinessButton score={score} checks={checks} />;
}
