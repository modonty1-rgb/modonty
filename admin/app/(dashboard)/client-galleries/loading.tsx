import { Skeleton } from "@/components/ui/skeleton";

export default function ClientGalleriesLoading() {
  return (
    <div className="mx-auto max-w-[1080px] space-y-6">
      <div>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-1 h-4 w-80" />
      </div>
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}
