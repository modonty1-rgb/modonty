import { PageHeader } from "@/components/shared/page-header";
import { getCoreClientId } from "@modonty/database/lib/core-client";
import { TagForm } from "../components/tag-form";

export default async function NewTagPage() {
  const coreClientId = await getCoreClientId();
  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader title="Create Tag" description="Add a new tag to the system" />
      <TagForm coreClientId={coreClientId} />
    </div>
  );
}
