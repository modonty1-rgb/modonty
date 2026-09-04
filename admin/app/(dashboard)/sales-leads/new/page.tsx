import { LeadForm } from "../components/lead-form";
import { getIndustryOptions } from "../helpers/get-lead";
import { getPlans } from "../helpers/get-plans";
import { getLeadSources } from "../helpers/get-lead-sources";

export const metadata = { title: "عميل محتمل جديد — أدمن مدونتي" };

export default async function NewLeadPage() {
  // متوازيان: لا يتوقّف أحدهما على الآخر، وتسلسلهما يضيف رحلةً إلى القاعدة بلا سبب.
  const [industries, plans, leadSources] = await Promise.all([
    getIndustryOptions(),
    getPlans(),
    getLeadSources(),
  ]);

  // بلا حشوةٍ هنا: `main` في الأدمن يحملها (`padding: 24`، مقيس)، والصدفة تحمل حشوتها.
  // ثلاثتها معاً كانت `72` بكسلاً فوق أوّل كلمة.
  return (
    <div dir="rtl">
      <LeadForm industries={industries} plans={plans} leadSources={leadSources} />
    </div>
  );
}
