import { Skeleton } from "@/components/ui/skeleton";

export default function ContactLoading() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-10 space-y-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-28 w-full rounded-md" />
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
  );
}
