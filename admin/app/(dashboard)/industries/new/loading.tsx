import { Skeleton } from "@/components/ui/skeleton";

export default function NewIndustryLoading() {
  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-3 w-52 mt-1.5" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-52 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
