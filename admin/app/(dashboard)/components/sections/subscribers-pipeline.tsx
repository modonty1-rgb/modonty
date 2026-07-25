import Link from "next/link";
import { Mail, MailCheck, MailX, ShieldAlert, UserPlus, Heart, Users } from "lucide-react";

import { subscriberCounts } from "@/lib/dashboard/cached";
import { db } from "@/lib/db";
import { CARD_GRID, SummaryChip, TierCard } from "../dashboard-ui";
import { CollapsibleSection } from "../collapsible-section";

/**
 * Newsletter subscribers (contract: admin-dashboard-triage-v2-ui.html style).
 * Active audience and this month's growth are the health signals; a subscriber
 * with no recorded GDPR consent is the one thing that asks for action (warm).
 */

export async function SubscribersPipeline() {
  const [{ total, active, unsubscribed, newLast30, noConsent }, articleFavorites, clientFollows] =
    await Promise.all([subscriberCounts(), db.articleFavorite.count(), db.clientLike.count()]);

  return (
    <CollapsibleSection
      iconNode={<Mail className="h-4 w-4 text-muted-foreground" />}
      title="Client Subscribers"
      subtitle="مشتركو العملاء (لكل عميل)"
      storageKey="dashSubscribersOpen"
      summary={
        <>
          <SummaryChip icon={MailCheck} value={active} tier={active > 0 ? "ok" : "plain"} />
          <SummaryChip icon={UserPlus} value={newLast30} tier="plain" />
          <SummaryChip icon={ShieldAlert} value={noConsent} tier={noConsent > 0 ? "warm" : "ok"} />
          <SummaryChip icon={MailX} value={unsubscribed} tier="plain" />
        </>
      }
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

      {/* إشارات الاهتمام — أساس الاشتراك القادم (للمراجعة) */}
      <div className="mt-3 rounded-xl border border-dashed p-3" dir="rtl">
        <p className="mb-1 text-[12px] font-bold text-foreground">
          💡 إشارات الاهتمام — أساس الاشتراك القادم
        </p>
        <p className="mb-3 max-w-[65ch] text-[11px] leading-relaxed text-muted-foreground">
          خطة قادمة: نشيل زر «اشترك في النشرة» من المقال والعميل. بدله الاهتمام يُلتقط تلقائياً —
          <span className="font-semibold text-foreground"> حفظ المقال (favorite) = مهتم بالمقال</span>،
          و<span className="font-semibold text-foreground">«تابعني» للعميل = مهتم بالعميل</span>.
          الحملة توصل لمن أبدى اهتماماً <span className="font-semibold text-foreground">ووافق على التواصل</span>.
          الرقمان تحت للمتابعة فقط.
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex items-center gap-2.5 rounded-lg border p-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Heart className="h-4 w-4" />
            </span>
            <div>
              <span className="text-xl font-bold leading-none tabular-nums">
                {articleFavorites.toLocaleString("en-US")}
              </span>
              <p className="pt-1 text-[11px] font-semibold leading-tight">اهتمام المقالات</p>
              <p className="text-[10px] leading-snug text-muted-foreground">حفظ (favorite) على المقالات</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg border p-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Users className="h-4 w-4" />
            </span>
            <div>
              <span className="text-xl font-bold leading-none tabular-nums">
                {clientFollows.toLocaleString("en-US")}
              </span>
              <p className="pt-1 text-[11px] font-semibold leading-tight">اهتمام العملاء</p>
              <p className="text-[10px] leading-snug text-muted-foreground">متابعة «تابعني» للعملاء</p>
            </div>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
