import { notFound } from "next/navigation";

import { FollowUpLog } from "../components/follow-up-log";
import { LeadDealRail } from "../components/lead-deal-rail";
import { LeadHeader } from "../components/lead-header";
import { LeadProfileRail } from "../components/lead-profile-rail";
import { countLeadFollowUps, getLead } from "../helpers/get-lead";
import { suggestSlug } from "../helpers/convert-lead";
import { getLeadSourceLabels } from "../helpers/get-lead-source-labels";
import { getLeadCatalog } from "../helpers/get-lead-catalog";
import { priceLeadDeal } from "../helpers/price-lead-deal";
import type { Stage } from "../helpers/funnel";
import { ThreeColumnLayout } from "@modonty/shared/components/column-layout/ThreeColumnLayout";

export const metadata = { title: "العميل المحتمل — أدمن مدونتي" };

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  // متوازيان: العدّ لا يتوقّف على السلَق ولا العكس، وتسلسلهما يضيف رحلةً إلى القاعدة بلا سبب.
  const [followUpCount, sourceLabels, catalog] = await Promise.all([
    countLeadFollowUps(id),
    getLeadSourceLabels(),
    getLeadCatalog(),
  ]);

  /**
   * الصفقة — باقتها وإجماليّها من الكتالوج، بالدالّة نفسها التي تسعّر بها القائمة.
   *
   * كانت البطاقة تقول «متوقّع في الشهر ٣٬٩٩٩» بينما المندوبة قالت للعميلة «٢٣٬٩٩٤»: نفس
   * الصفقة برقمين. والباقات تُباع بمدّة لا بشهر.
   *
   * ٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد. الاسم والسعر من `CommercialPlan`، والمدّة من
   * `CommercialTermPolicy` — لا `modonty_plans` ولا `pricing-durations.ts`. وسلَقٌ قديم
   * (`growth`…) يُترجَم في `resolveLeadPlan`؛ وما لم يعد في الكتالوج يُعرض كما خُزّن ومعه وسمه.
   */
  const deal = priceLeadDeal(lead, catalog);
  const planLabel = deal.plan
    ? deal.plan.name
    : lead.expectedTier
      ? `${lead.expectedTier} — ليست في الكتالوج الآن`
      : null;

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
              planLabel={planLabel}
              dealTotal={deal.total}
              dealCurrency={deal.currency}
              dealMonths={deal.total != null ? deal.paidMonths : null}
            />
          </aside>
        }
      />
    </div>
  );
}
