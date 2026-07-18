import Link from "next/link";
import { Mail, MailCheck, MailX, ShieldAlert, UserPlus } from "lucide-react";

import { subscriberCounts } from "@/lib/dashboard/cached";
import { CARD_GRID, TierCard } from "../dashboard-ui";
import { CollapsibleSection } from "../collapsible-section";

/**
 * Newsletter subscribers (contract: admin-dashboard-triage-v2-ui.html style).
 * Active audience and this month's growth are the health signals; a subscriber
 * with no recorded GDPR consent is the one thing that asks for action (warm).
 */

export async function SubscribersPipeline() {
  const { total, active, unsubscribed, newLast30, noConsent } = await subscriberCounts();

  return (
    <CollapsibleSection
      iconNode={<Mail className="h-4 w-4 text-muted-foreground" />}
      title="Subscribers"
      subtitle="newsletter audience"
      right={
        <Link
          href="/subscribers"
          className="flex items-baseline gap-2 text-xs text-muted-foreground hover:underline"
        >
          <span className="text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {active.toLocaleString("en-US")}
          </span>
          active
          <span className="text-muted-foreground/40">·</span>
          {total.toLocaleString("en-US")} total
          <span className="text-primary">→</span>
        </Link>
      }
    >
      <div className={CARD_GRID}>
        <TierCard
          href="/subscribers"
          tier={active > 0 ? "ok" : "plain"}
          icon={MailCheck}
          value={active}
          label="Active"
          note="opted in, still subscribed"
        />
        <TierCard
          href="/subscribers"
          tier="plain"
          icon={UserPlus}
          value={newLast30}
          label="New this month"
          note="joined in the last 30 days"
        />
        <TierCard
          href="/subscribers"
          tier={noConsent > 0 ? "warm" : "ok"}
          icon={ShieldAlert}
          value={noConsent}
          label="No consent recorded"
          note="GDPR — record consent or remove"
        />
        <TierCard
          href="/subscribers"
          tier="plain"
          icon={MailX}
          value={unsubscribed}
          label="Unsubscribed"
          note="opted out — kept for records"
        />
      </div>
    </CollapsibleSection>
  );
}
