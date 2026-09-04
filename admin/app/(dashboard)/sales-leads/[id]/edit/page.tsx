import { notFound } from "next/navigation";

import { LeadForm } from "../../components/lead-form";
import { getIndustryOptions, getLead } from "../../helpers/get-lead";
import { getPlans } from "../../helpers/get-plans";
import { getLeadSources } from "../../helpers/get-lead-sources";
import type { LeadInput } from "../../helpers/lead-schema";

export const metadata = { title: "تعديل عميل — أدمن مدونتي" };

export default async function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [lead, industries, plans, leadSources] = await Promise.all([
    getLead(id),
    getIndustryOptions(),
    getPlans(),
    getLeadSources(),
  ]);
  if (!lead) notFound();

  // Nulls from the database become empty strings for the inputs — a controlled input handed
  // `null` switches to uncontrolled mid-render and React drops the value the user typed.
  const initial = Object.fromEntries(
    Object.entries(lead).map(([k, v]) => [k, v == null ? "" : v]),
  ) as unknown as Partial<LeadInput>;

  return (
    <div dir="rtl" className="p-4 sm:p-6">
      <LeadForm
        leadId={lead.id}
        industries={industries}
        plans={plans}
        leadSources={leadSources}
        initial={initial}
      />
    </div>
  );
}
