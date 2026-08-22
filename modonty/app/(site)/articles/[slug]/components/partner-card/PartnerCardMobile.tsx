import type { ReactNode } from "react";
import { PartnerAvatar } from "@modonty/shared/components/partner-avatar/PartnerAvatar";
import { VerifiedBadge } from "@modonty/shared/components/verified-badge/VerifiedBadge";
import { mediaSrc } from "@modonty/shared/lib/media-src";

import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { IconChevronLeft } from "@/lib/icons";

interface PartnerCardMobileProps {
  client: {
    id: string;
    name: string;
    slug: string;
    addressCity?: string | null;
    logoMedia?: { url: string; bunnyUrl: string | null; blurDataURL: string | null } | null;
  };
  articleId: string;
  /** What the partner does — the one field that says why this name is worth trusting here. */
  credential?: string | null;
  /** The ways to reach them, shown under the row. */
  details?: ReactNode;
  labels: {
    reviewed: string;
    verifiedBadge: string;
    verifiedBy: string;
  };
}

/**
 * The ONE partner block on a phone (Khalid, 21 Aug — mobile refactor).
 *
 * It used to be one of three: the header printed «راجعه واعتمده — اسم الشريك», this card repeated
 * the same name behind the same ✓ right underneath, and the full card said it a third time after
 * the article. One block now — identity, then the ways to reach them.
 *
 * Nothing collapses here (Khalid, 21 Aug). It was a sheet, then an expander, and both were the
 * wrong weight for what is behind them: once the panel stopped repeating the row — no cover, no
 * logo, no name, no city, no brief — what was left is a strip of channels 121px tall. A control
 * that hides 121px costs the reader more attention than it saves them screen.
 *
 * The identity row stays a tracked link to the partner's page, which is where depth lives.
 */
export function PartnerCardMobile({ client, articleId, credential, details, labels }: PartnerCardMobileProps) {
  // Keep the ROW so OptimizedImage can read the stored blur off it.
  const logoMedia = mediaSrc(client.logoMedia) ? client.logoMedia : null;
  const sub = [credential?.trim(), client.addressCity?.trim()].filter(Boolean).join(" · ");

  return (
    <div className="mb-4 mt-3 overflow-hidden rounded-xl border border-primary/20 bg-primary/5 lg:hidden">
      <CtaTrackedLink
        href={`/clients/${client.slug}`}
        label={client.name}
        type="LINK"
        articleId={articleId}
        clientId={client.id}
        className="flex items-center gap-3 p-3"
      >
        <PartnerAvatar media={logoMedia} name={client.name} size="standard" />
        <span className="min-w-0 flex-1">
          {/* The claim first, small: it is what the reader is checking before they read, and it
              frames the name underneath instead of repeating beside it. */}
          <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
            <VerifiedBadge className="h-3.5 w-3.5" label={labels.verifiedBadge} />
            {labels.reviewed}
          </span>
          <span className="mt-0.5 block truncate text-[15px] font-bold leading-tight text-foreground">
            {client.name}
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
            {sub || labels.verifiedBy}
          </span>
        </span>
        <IconChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      </CtaTrackedLink>

      {/* White, as it read inside the old sheet: the tinted row is identity, this strip is
          controls — one face each. */}
      {details && <div className="border-t border-primary/20 bg-card p-3">{details}</div>}
    </div>
  );
}
