import { Skeleton } from "@/components/ui/skeleton";

export default function ChatbotQuestionsLoading() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-64" />
      </div>
      <Skeleton className="h-72 w-full rounded-md" />
    </div>
  );
}
