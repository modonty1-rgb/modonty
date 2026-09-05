import { notFound } from "next/navigation";

import { FollowUpLog } from "../components/follow-up-log";
import { LeadDealRail } from "../components/lead-deal-rail";
import { LeadHeader } from "../components/lead-header";
import { LeadProfileRail } from "../components/lead-profile-rail";
import { countLeadFollowUps, getLead } from "../helpers/get-lead";
import { suggestSlug } from "../helpers/convert-lead";
import { getLeadSourceLabels } from "../helpers/get-lead-source-labels";
import { getTierLabels } from "../helpers/get-tier-labels";
import type { Stage } from "../helpers/funnel";
import { ThreeColumnLayout } from "@modonty/shared/components/column-layout/ThreeColumnLayout";
import { PLAN_DURATIONS, priceForDuration, type PlanDuration } from "@modonty/shared/lib/pricing-durations";

export const metadata = { title: "العميل المحتمل — أدمن مدونتي" };

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  // متوازيان: العدّ لا يتوقّف على السلَق ولا العكس، وتسلسلهما يضيف رحلةً إلى القاعدة بلا سبب.
  const [suggestedSlug, followUpCount, sourceLabels, tierLabels] = await Promise.all([
    lead.convertedClientId ? Promise.resolve("") : suggestSlug(lead.name),
    countLeadFollowUps(id),
    getLeadSourceLabels(),
    getTierLabels(),
  ]);

  /**
   * إجماليّ الصفقة — بالدالّة نفسها التي عرضتها شاشة التأسيس.
   *
   * كانت البطاقة تقول «متوقّع في الشهر ٣٬٩٩٩» بينما المندوبة قالت للعميلة «٢٣٬٩٩٤»: نفس
   * الصفقة برقمين. والباقات تُباع بمدّة لا بشهر.
   */
  const months = (lead.expectedMonths ?? null) as PlanDuration | null;
  const dealTotal =
    lead.expectedMonthly && months && (PLAN_DURATIONS as readonly number[]).includes(months)
      ? priceForDuration(lead.expectedMonthly, months).total
      : lead.expectedMonthly ?? null;

  // الخريطة تشمل المقفول: العميل القديم مصدره «سوشال» وقد أُقفل البند، والاسم يجب أن يبقى
  // مقروءاً عنده. الإقفال يمنع الاختيار الجديد لا يمحو القديم.
  const sourceLabel = lead.source ? sourceLabels[lead.source] ?? null : null;

  const stage = lead.stage as Stage;
  const closed = stage === "WON" || stage === "LOST";

  return (
    /**
     * الصدفة نفسها التي تستعملها شاشة التأسيس — الشاشتان أختان، والمندوبة تنتقل بينهما في
     * الدقيقة الواحدة، فاختلاف الإيقاع بينهما يكلّف إعادة توجيهٍ بصريّ في كل انتقال.
     *
     * والقسمة بأولويّة الاستعمال لا بحجم البيانات: **الوسط** للسجلّ لأنه ما يُكتب فيه كل
     * مكالمة، و**اليمين** لمَن هو (يُقرأ لمحةً)، و**اليسار** للموعد والصفقة والقرار.
     *
     * قبل التقسيم: `scroll 1457` مقابل `client 963` (مقيس على ١٢٨٠×١٠٢٠) — أي أن نموذج
     * التسجيل، وهو أكثر ما يُستعمل، كان تحت الطيّة دائماً خلف `488` بكسلاً من بياناتٍ مرجعية
     * نصفها فارغ.
     *
     * و`sticky` مباشرةً بلا `StickyRail`: تلك تحسب `top` من `window.innerHeight`، وهو صحيحٌ
     * في مدونتي حيث تمرّر الصفحة — أمّا هنا فالمُمرِّر `main` (`overflow-y: auto`).
     */
    <div dir="rtl" className="p-4 sm:p-6">
      <ThreeColumnLayout
        className="!px-0 !py-0"
        header={<div className="-mb-2">
          <LeadHeader name={lead.name} company={lead.company} stage={stage} />
        </div>}
        right={
          <aside aria-label="بيانات العميل" className="w-full shrink-0 lg:sticky lg:top-0 lg:w-[260px]">
            <LeadProfileRail lead={lead} sourceLabel={sourceLabel} />
          </aside>
        }
        center={
          <FollowUpLog
            leadId={lead.id}
            rows={lead.followUps}
            total={followUpCount}
            closed={closed}
          />
        }
        left={
          <aside aria-label="الصفقة والقرار" className="w-full shrink-0 lg:sticky lg:top-0 lg:w-[260px]">
            <LeadDealRail
              lead={lead}
              suggestedSlug={suggestedSlug}
              tierLabels={tierLabels}
              dealTotal={dealTotal}
              dealMonths={months}
            />
          </aside>
        }
      />
    </div>
  );
}
