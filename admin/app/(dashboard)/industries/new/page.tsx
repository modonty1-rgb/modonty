import { PageHeader } from "@/components/shared/page-header";
import { IndustryForm } from "../components/industry-form";

export default function NewIndustryPage() {
  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader title="Create Industry" description="Add a new industry to the system" />
      <IndustryForm />
    </div>
  );
}
