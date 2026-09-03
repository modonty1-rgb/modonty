import { notFound } from "next/navigation";

import { LeadCard } from "../components/lead-card";
import { getLead } from "../helpers/get-lead";
import { suggestSlug } from "../helpers/convert-lead";

export const metadata = { title: "العميل المحتمل — أدمن مدونتي" };

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  // يُحسب على السيرفر ويُمرَّر جاهزاً: الحوار يُفتح بعنوانٍ مفحوصٍ لا محجوز، فالحالة الشائعة
  // ضغطةٌ واحدة. وحسابه هنا يوفّر رحلة ذهاب وعودة عند فتح الحوار.
  const suggestedSlug = lead.convertedClientId ? "" : await suggestSlug(lead.name);

  return (
    <div dir="rtl" className="p-4 sm:p-6">
      <LeadCard lead={lead} suggestedSlug={suggestedSlug} />
    </div>
  );
}
