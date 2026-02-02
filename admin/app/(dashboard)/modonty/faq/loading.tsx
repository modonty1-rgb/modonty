import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function FAQManagementLoading() {
  return (
    <div className="container mx-auto max-w-[1128px]">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="FAQ Management"
          description="Manage frequently asked questions for the public FAQ page"
        />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  );
}
