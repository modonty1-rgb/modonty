import { Skeleton } from "@/components/ui/skeleton";

export default function LegalLoading() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 space-y-5">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-32" />
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
