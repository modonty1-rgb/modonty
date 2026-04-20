import { Skeleton } from "@/components/ui/skeleton";

export default function EmailTemplatesLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="flex gap-4 h-[600px]">
        <Skeleton className="w-56 shrink-0 rounded-lg" />
        <Skeleton className="flex-1 rounded-lg" />
      </div>
    </div>
  );
}
