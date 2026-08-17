import { Skeleton } from "@/components/ui/skeleton";

export default function ClientPhotosLoading() {
  return (
    <section className="space-y-4">
      <Skeleton className="h-7 w-16" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </section>
  );
}
