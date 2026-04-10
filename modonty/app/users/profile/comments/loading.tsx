import { Skeleton } from "@/components/ui/skeleton";

export default function CommentsLoading() {
  return (
    <div className="space-y-3 py-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  );
}
