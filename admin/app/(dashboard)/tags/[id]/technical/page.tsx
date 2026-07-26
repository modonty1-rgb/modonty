import { redirect } from "next/navigation";

import { getTagById } from "../../actions/tags-actions";
import { ReferenceSeoTechnical } from "@/components/shared/seo-doctor/reference-seo-technical";

export default async function TagTechnicalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tag = await getTagById(id);
  if (!tag) redirect("/tags");

  return (
    <ReferenceSeoTechnical
      backHref={`/tags/${id}`}
      entityLabel="الوسم"
      name={tag.name}
      nextjsMetadata={tag.nextjsMetadata}
      jsonLdStructuredData={tag.jsonLdStructuredData}
      jsonLdValidationReport={tag.jsonLdValidationReport}
    />
  );
}
