import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContactMessageDetailLoading() {
  return (
    <div className="container mx-auto max-w-[1128px]">
      <PageHeader
        title="Contact Message"
        description="View and manage contact message details"
      />
      <div className="space-y-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}
