import { Skeleton } from "@/components/ui/skeleton";

export default function FAQManagementLoading() {
  return (
    <div className="container mx-auto max-w-[1128px]">
      {/* Header: title + create button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-3.5 w-72 mt-1.5" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* FAQ cards */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
