import { Skeleton } from "@/components/ui/skeleton";

export default function IndustryLoading() {
  return (
    <div className="container mx-auto max-w-[1128px] px-4 py-10">
      <div className="flex flex-col items-center gap-3 mb-10">
        <Skeleton className="h-16 w-16 rounded-2xl" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
