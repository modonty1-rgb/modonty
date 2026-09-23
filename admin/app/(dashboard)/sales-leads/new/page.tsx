import { LeadForm } from "../components/lead-form";
import { getIndustryOptions } from "../helpers/get-lead";
import { getLeadCatalog } from "../helpers/get-lead-catalog";
import { getLeadSources } from "../helpers/get-lead-sources";
import { getCampaignOptions } from "../helpers/get-campaign-options";

export const metadata = { title: "عميل محتمل جديد — أدمن مدونتي" };

export default async function NewLeadPage() {
  // متوازيان: لا يتوقّف أحدهما على الآخر، وتسلسلهما يضيف رحلةً إلى القاعدة بلا سبب.
  // الباقات والمدد من الكتالوج (`CommercialPlan` · `CommercialTermPolicy`) — ٢٣ سبتمبر ٢٠٢٦.
  const [industries, catalog, leadSources, campaigns] = await Promise.all([
    getIndustryOptions(),
    getLeadCatalog(),
    getLeadSources(),
    getCampaignOptions(),
  ]);

  // بلا حشوةٍ هنا: `main` في الأدمن يحملها (`padding: 24`، مقيس)، والصدفة تحمل حشوتها.
  // ثلاثتها معاً كانت `72` بكسلاً فوق أوّل كلمة.
  return (
    <div dir="rtl">
      <LeadForm
        industries={industries}
        plans={catalog.plans}
        terms={catalog.terms}
        leadSources={leadSources}
        campaigns={campaigns}
      />
    </div>
  );
}
