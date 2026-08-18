import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div dir="rtl" className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <header className="shrink-0 border-b border-border bg-background">
        <div className="mx-auto flex min-h-[56px] w-full max-w-3xl items-center gap-3 px-4 py-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
          <Skeleton className="h-5 w-40" />
        </div>
      </header>
      <div className="mx-auto w-full max-w-3xl flex-1 space-y-4 p-4">
        <Skeleton className="h-16 w-3/4 rounded-2xl" />
        <Skeleton className="ms-auto h-12 w-2/3 rounded-2xl" />
        <Skeleton className="h-20 w-4/5 rounded-2xl" />
      </div>
    </div>
  );
}
