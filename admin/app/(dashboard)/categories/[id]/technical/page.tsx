import { redirect } from "next/navigation";

import { getCategoryById } from "../../actions/categories-actions";
import { ReferenceSeoTechnical } from "@/components/shared/seo-doctor/reference-seo-technical";

export default async function CategoryTechnicalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category) redirect("/categories");

  return (
    <ReferenceSeoTechnical
      backHref={`/categories/${id}`}
      entityLabel="التصنيف"
      name={category.name}
      nextjsMetadata={category.nextjsMetadata}
      jsonLdStructuredData={category.jsonLdStructuredData}
      jsonLdValidationReport={category.jsonLdValidationReport}
    />
  );
}
