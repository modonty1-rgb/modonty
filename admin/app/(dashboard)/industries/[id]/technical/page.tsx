import { redirect } from "next/navigation";

import { getIndustryById } from "../../actions/industries-actions";
import { ReferenceSeoTechnical } from "@/components/shared/seo-doctor/reference-seo-technical";

export default async function IndustryTechnicalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const industry = await getIndustryById(id);
  if (!industry) redirect("/industries");

  return (
    <ReferenceSeoTechnical
      backHref={`/industries/${id}`}
      entityLabel="الصناعة"
      name={industry.name}
      nextjsMetadata={industry.nextjsMetadata}
      jsonLdStructuredData={industry.jsonLdStructuredData}
      jsonLdValidationReport={industry.jsonLdValidationReport}
    />
  );
}
