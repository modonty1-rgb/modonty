import { Skeleton } from "@/components/ui/skeleton";

export default function ClientMentionsLoading() {
  return (
    <section className="space-y-2">
      <Skeleton className="h-7 w-24" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <Skeleton className="h-4 w-[85%] max-w-lg" />
    </section>
  );
}
