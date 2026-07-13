import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-[420px] w-full" />
    </div>
  );
}
