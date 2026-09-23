import { notFound } from "next/navigation";

import { LeadForm } from "../../components/lead-form";
import { getIndustryOptions, getLead } from "../../helpers/get-lead";
import { getLeadCatalog } from "../../helpers/get-lead-catalog";
import { priceLeadDeal } from "../../helpers/price-lead-deal";
import { getLeadSources } from "../../helpers/get-lead-sources";
import { getCampaignOptions } from "../../helpers/get-campaign-options";
import type { LeadInput } from "../../helpers/lead-schema";

export const metadata = { title: "تعديل عميل — أدمن مدونتي" };

export default async function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [lead, industries, catalog, leadSources, campaigns] = await Promise.all([
    getLead(id),
    getIndustryOptions(),
    getLeadCatalog(),
    getLeadSources(),
    getCampaignOptions(),
  ]);
  if (!lead) notFound();

  // Nulls from the database become empty strings for the inputs — a controlled input handed
  // `null` switches to uncontrolled mid-render and React drops the value the user typed.
  const initial = Object.fromEntries(
    Object.entries(lead).map(([k, v]) => [k, v == null ? "" : v]),
  ) as unknown as Partial<LeadInput>;

  /**
   * سلَقٌ قديم من `modonty_plans` (`growth`…) يُفتح على باقته في الكتالوج (`zakham`)، فتظهر
   * بطاقتها مختارةً ويُكتب سلَق الكتالوج عند الحفظ. وباقةٌ لم تعد منشورة تبقى كما خُزّنت،
   * والنموذج يقول ذلك ويطلب اختياراً (٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد).
   */
  const plan = priceLeadDeal(lead, catalog).plan;
  if (plan) initial.expectedTier = plan.slug;

  return (
    <div dir="rtl" className="p-4 sm:p-6">
      <LeadForm
        leadId={lead.id}
        industries={industries}
        plans={catalog.plans}
        terms={catalog.terms}
        leadSources={leadSources}
        campaigns={campaigns}
        initial={initial}
      />
    </div>
  );
}
