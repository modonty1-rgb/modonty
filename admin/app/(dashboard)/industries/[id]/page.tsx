import { redirect } from "next/navigation";
import { getIndustryById, getIndustryClients } from "../actions/industries-actions";
import { IndustryView } from "./components/industry-view";
import { IndustryClients } from "./components/industry-clients";
import { RevalidateSEOButton } from "./components/revalidate-seo-button";
import { ArchiveTaxonomyControl } from "@/components/shared/taxonomy-archive/archive-taxonomy-control";

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
    <div className="max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Industry Details</h1>
          <p className="text-sm text-muted-foreground mt-0.5">View industry information and clients</p>
        </div>
        <div className="flex items-center gap-2">
          <RevalidateSEOButton industryId={id} />
          <ArchiveTaxonomyControl kind="industry" id={id} />
        </div>
      </div>
      <div className="space-y-6">
        <IndustryView industry={industry} />
        <IndustryClients clients={clients} industryId={id} />
      </div>
    </div>
  );
}
