import Link from "next/link";
import { Users, Chrome, KeyRound, MailCheck, MailWarning } from "lucide-react";

import { memberCounts } from "@/lib/dashboard/cached";
import { CARD_GRID, SummaryChip, TierCard } from "../dashboard-ui";
import { CollapsibleSection } from "../collapsible-section";

/**
 * Registered members — visitors who signed up on modonty.com (Google or
 * email+password). The signup split is a plain fact; an email member who never
 * confirmed the verification link is the one thing that asks for attention (warm).
 */

export async function MembersPipeline() {
  const { total, google, emailPassword, linkConfirmed, awaitingLink, newLast30 } =
    await memberCounts();

  return (
    <CollapsibleSection
      iconNode={<Users className="h-4 w-4 text-muted-foreground" />}
      title="Members"
      subtitle="registered visitors"
      storageKey="dashMembersOpen"
      summary={
        <>
          <SummaryChip icon={Chrome} value={google} tier="plain" />
          <SummaryChip icon={KeyRound} value={emailPassword} tier="plain" />
          <SummaryChip icon={MailWarning} value={awaitingLink} tier={awaitingLink > 0 ? "warm" : "ok"} />
        </>
      }
      right={
        <Link
          href="/members"
          className="flex items-baseline gap-2 text-xs text-muted-foreground hover:underline"
        >
          <span className="text-base font-bold tabular-nums text-foreground">
            {total.toLocaleString("en-US")}
          </span>
          total
          <span className="text-muted-foreground/40">·</span>
          {newLast30.toLocaleString("en-US")} this month
          <span className="text-primary">→</span>
        </Link>
      }
    >
      <div className={CARD_GRID}>
        <TierCard
          href="/members"
          tier="plain"
          icon={Chrome}
          value={google}
          label="Google sign-in"
          note="OAuth — email auto-verified"
        />
        <TierCard
          href="/members"
          tier="plain"
          icon={KeyRound}
          value={emailPassword}
          label="Email + password"
          note="signed up with credentials"
        />
        <TierCard
          href="/members"
          tier={linkConfirmed > 0 ? "ok" : "plain"}
          icon={MailCheck}
          value={linkConfirmed}
          label="Link confirmed"
          note="verified their email link"
        />
        <TierCard
          href="/members"
          tier={awaitingLink > 0 ? "warm" : "ok"}
          icon={MailWarning}
          value={awaitingLink}
          label="Awaiting confirmation"
          note="never confirmed the email link"
        />
      </div>
    </CollapsibleSection>
  );
}
