import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContactMessagesLoading() {
  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="رسائل التواصل"
        description="رسائل الزوار من صفحة التواصل — ردّ عليها وتابعها"
      />
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}
