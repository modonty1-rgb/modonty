import { PageHeader } from "@/components/shared/page-header";
import { TagForm } from "../components/tag-form";

export default function NewTagPage() {
  return (
    <div className="container mx-auto max-w-[1128px]">
      <PageHeader title="Create Tag" description="Add a new tag to the system" />
      <TagForm />
    </div>
  );
}
