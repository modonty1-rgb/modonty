import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-hidden>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-6 h-4 w-24" />
      <Skeleton className="mt-3 h-9 w-72" />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
