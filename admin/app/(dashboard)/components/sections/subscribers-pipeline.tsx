import Link from "next/link";
import { MailCheck, MailX, ShieldAlert, UserPlus, Heart, Users } from "lucide-react";

import { subscriberCounts } from "@/lib/dashboard/cached";
import { db } from "@/lib/db";
import { CARD_GRID, TierCard } from "../dashboard-ui";
import { PanelHead } from "../panel-head";

/**
 * Newsletter subscribers.
 * Active audience and this month's growth are the health signals; a subscriber
 * with no recorded GDPR consent is the one thing that asks for action (warm).
 */

export async function SubscribersPipeline() {
  const [{ total, active, unsubscribed, newLast30, noConsent }, articleFavorites, clientFollows] =
    await Promise.all([subscriberCounts(), db.articleFavorite.count(), db.clientLike.count()]);

  return (
    <>
      <PanelHead
        title="مشتركو العملاء"
        hint="لكل عميل"
        right={
          <Link href="/subscribers" className="flex items-baseline gap-2 text-xs text-muted-foreground hover:underline">
            <span className="text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{active.toLocaleString("en-US")}</span>
            نشط
            <span className="text-muted-foreground/40">·</span>
            {total.toLocaleString("en-US")} إجمالي
            <span className="text-primary">←</span>
          </Link>
        }
      />
      <div className={CARD_GRID}>
        <TierCard
          href="/subscribers"
          tier={active > 0 ? "ok" : "plain"}
          icon={MailCheck}
          value={active}
          label="نشط"
          note="اشترك وما ألغى"
        />
        <TierCard
          href="/subscribers"
          tier="plain"
          icon={UserPlus}
          value={newLast30}
          label="جدد هذا الشهر"
          note="آخر 30 يوم"
        />
        <TierCard
          href="/subscribers"
          tier={noConsent > 0 ? "warm" : "ok"}
          icon={ShieldAlert}
          value={noConsent}
          label="بلا موافقة مسجّلة"
          note="GDPR — سجّل الموافقة أو احذف"
        />
        <TierCard
          href="/subscribers"
          tier="plain"
          icon={MailX}
          value={unsubscribed}
          label="ألغوا"
          note="محفوظ للسجل"
        />
      </div>

      {/* إشارات الاهتمام — أساس الاشتراك القادم (للمراجعة) */}
      <div className="mt-3 rounded-xl border border-dashed p-3" dir="rtl">
        <p className="mb-1 text-[12px] font-bold text-foreground">
          إشارات الاهتمام — أساس الاشتراك القادم
        </p>
        <p className="mb-3 max-w-[65ch] text-xs leading-relaxed text-muted-foreground">
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
              <p className="pt-1 text-xs font-semibold leading-tight">اهتمام المقالات</p>
              <p className="text-xs leading-snug text-muted-foreground">حفظ (favorite) على المقالات</p>
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
              <p className="pt-1 text-xs font-semibold leading-tight">اهتمام العملاء</p>
              <p className="text-xs leading-snug text-muted-foreground">متابعة «تابعني» للعملاء</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
