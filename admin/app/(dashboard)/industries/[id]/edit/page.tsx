import { redirect } from "next/navigation";
import { getIndustryById } from "../../actions/industries-actions";
import { IndustryForm } from "../../components/industry-form";
import { DeleteIndustryButton } from "../components/delete-industry-button";
import { RevalidateSEOButton } from "../components/revalidate-seo-button";
import { SeoCachePreview } from "@/components/shared/seo-cache-preview";

export default async function EditIndustryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const industry = await getIndustryById(id);

  if (!industry) {
    redirect("/industries");
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Edit Industry</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Update industry information</p>
        </div>
        <div className="flex items-center gap-2">
          <RevalidateSEOButton industryId={id} />
          <DeleteIndustryButton industryId={id} />
        </div>
      </div>
      <SeoCachePreview
        jsonLd={industry.jsonLdStructuredData}
        metaTags={industry.nextjsMetadata}
        lastGenerated={industry.jsonLdLastGenerated}
      />
      <IndustryForm initialData={industry} industryId={id} />
    </div>
  );
}
