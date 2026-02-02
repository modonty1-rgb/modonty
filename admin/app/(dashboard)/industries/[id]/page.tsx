import { redirect } from "next/navigation";
import { getIndustryById, getIndustryClients } from "../actions/industries-actions";
import { PageHeader } from "@/components/shared/page-header";
import { IndustryView } from "./components/industry-view";
import { IndustryClients } from "./components/industry-clients";
import { DeleteIndustryButton } from "./components/delete-industry-button";

export default async function IndustryViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const [industry, clients] = await Promise.all([
    getIndustryById(id),
    getIndustryClients(id),
  ]);

  if (!industry) {
    redirect("/industries");
  }

  return (
    <div className="container mx-auto max-w-[1128px]">
      <PageHeader
        title="Industry Details"
        description="View industry information and clients"
      />
      <div className="mb-6">
        <DeleteIndustryButton industryId={id} />
      </div>
      <div className="space-y-6">
        <IndustryView industry={industry} />
        <IndustryClients clients={clients} industryId={id} />
      </div>
    </div>
  );
}
