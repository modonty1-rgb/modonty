import { notFound } from "next/navigation";

import { FollowUpLog } from "../components/follow-up-log";
import { LeadCard } from "../components/lead-card";
import { countLeadFollowUps, getLead } from "../helpers/get-lead";
import { suggestSlug } from "../helpers/convert-lead";
import { getLeadSourceLabels } from "../helpers/get-lead-source-labels";

export const metadata = { title: "العميل المحتمل — أدمن مدونتي" };

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  // متوازيان: العدّ لا يتوقّف على السلَق ولا العكس، وتسلسلهما يضيف رحلةً إلى القاعدة بلا سبب.
  const [suggestedSlug, followUpCount, sourceLabels] = await Promise.all([
    lead.convertedClientId ? Promise.resolve("") : suggestSlug(lead.name),
    countLeadFollowUps(id),
    getLeadSourceLabels(),
  ]);

  // الخريطة تشمل المقفول: العميل القديم مصدره «سوشال» وقد أُقفل البند، والاسم يجب أن يبقى
  // مقروءاً عنده. الإقفال يمنع الاختيار الجديد لا يمحو القديم.
  const sourceLabel = lead.source ? sourceLabels[lead.source] ?? null : null;

  const closed = lead.stage === "WON" || lead.stage === "LOST";

  return (
    <div dir="rtl" className="space-y-5 p-4 sm:p-6">
      <LeadCard lead={lead} suggestedSlug={suggestedSlug} sourceLabel={sourceLabel} />
      {/* السجلّ تحت البيانات لا بجانبها: البيانات تُقرأ مرّة، والسجلّ يُقرأ ويُكتب فيه كل
          مكالمة — فهو الأطول والأكثر استعمالاً، ووضعه في عمودٍ ضيّق يخنقه. */}
      <FollowUpLog
        leadId={lead.id}
        rows={lead.followUps}
        total={followUpCount}
        closed={closed}
      />
    </div>
  );
}
