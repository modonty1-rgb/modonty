import { Skeleton } from "@/components/ui/skeleton";

export default function ContactRequestsLoading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 pb-8" dir="rtl">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
