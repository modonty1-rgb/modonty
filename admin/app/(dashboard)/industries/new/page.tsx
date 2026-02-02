import { PageHeader } from "@/components/shared/page-header";
import { IndustryForm } from "../components/industry-form";

export default function NewIndustryPage() {
  return (
    <div className="container mx-auto max-w-[1128px]">
      <PageHeader title="Create Industry" description="Add a new industry to the system" />
      <IndustryForm />
    </div>
  );
}
