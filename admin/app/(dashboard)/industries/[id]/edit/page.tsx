import { redirect } from "next/navigation";
import { getIndustryById } from "../../actions/industries-actions";
import { PageHeader } from "@/components/shared/page-header";
import { IndustryForm } from "../../components/industry-form";
import { DeleteIndustryButton } from "../components/delete-industry-button";

export default async function EditIndustryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const industry = await getIndustryById(id);

  if (!industry) {
    redirect("/industries");
  }

  return (
    <div className="container mx-auto max-w-[1128px]">
      <PageHeader title="Edit Industry" description="Update industry information" />
      <div className="mb-6">
        <DeleteIndustryButton industryId={id} />
      </div>
      <IndustryForm initialData={industry} industryId={id} />
    </div>
  );
}
