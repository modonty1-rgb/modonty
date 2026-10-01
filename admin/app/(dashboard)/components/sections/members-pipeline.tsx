import Link from "next/link";
import { Chrome, KeyRound, MailCheck, MailWarning } from "lucide-react";

import { memberCounts } from "@/lib/dashboard/cached";
import { CARD_GRID, TierCard } from "../dashboard-ui";
import { PanelHead } from "../panel-head";

/**
 * Registered members — visitors who signed up on modonty.com (Google or
 * email+password). The signup split is a plain fact; an email member who never
 * confirmed the verification link is the one thing that asks for attention (warm).
 */

export async function MembersPipeline() {
  const { total, google, emailPassword, linkConfirmed, awaitingLink, newLast30 } =
    await memberCounts();

  return (
    <>
      <PanelHead
        title="الأعضاء"
        hint="زوار سجّلوا في مدونتي"
        right={
          <Link href="/members" className="flex items-baseline gap-2 text-xs text-muted-foreground hover:underline">
            <span className="text-base font-bold tabular-nums text-foreground">{total.toLocaleString("en-US")}</span>
            إجمالي
            <span className="text-muted-foreground/40">·</span>
            {newLast30.toLocaleString("en-US")} هذا الشهر
            <span className="text-primary">←</span>
          </Link>
        }
      />
      <div className={CARD_GRID}>
        <TierCard
          href="/members"
          tier="plain"
          icon={Chrome}
          value={google}
          label="دخول جوجل"
          note="OAuth — البريد مؤكّد تلقائياً"
        />
        <TierCard
          href="/members"
          tier="plain"
          icon={KeyRound}
          value={emailPassword}
          label="بريد وكلمة مرور"
          note="سجّلوا بكلمة مرور"
        />
        <TierCard
          href="/members"
          tier={linkConfirmed > 0 ? "ok" : "plain"}
          icon={MailCheck}
          value={linkConfirmed}
          label="أكّدوا البريد"
          note="ضغطوا رابط التأكيد"
        />
        <TierCard
          href="/members"
          tier={awaitingLink > 0 ? "warm" : "ok"}
          icon={MailWarning}
          value={awaitingLink}
          label="ما أكّدوا البريد"
          note="ما ضغطوا رابط التأكيد أبداً"
        />
      </div>
    </>
  );
}
