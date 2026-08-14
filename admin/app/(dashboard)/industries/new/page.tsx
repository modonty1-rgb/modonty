import { PageHeader } from "@/components/shared/page-header";
import { getCoreClientId } from "@modonty/shared/lib/core-client";
import { IndustryForm } from "../components/industry-form";

export default async function NewIndustryPage() {
  const coreClientId = await getCoreClientId();
  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader title="Create Industry" description="Add a new industry to the system" />
      <IndustryForm coreClientId={coreClientId} />
    </div>
  );
}
