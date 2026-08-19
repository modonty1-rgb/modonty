import { Skeleton } from "@/components/ui/skeleton";

/** Matches the page as it stands today: one container, one heading. Grows with it. */
export default function AudioLoading() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <Skeleton className="h-8 w-64" />
    </main>
  );
}
