import { PageHeader } from "@/components/shared/page-header";
import { TagForm } from "../components/tag-form";

export default function NewTagPage() {
  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader title="Create Tag" description="Add a new tag to the system" />
      <TagForm />
    </div>
  );
}
