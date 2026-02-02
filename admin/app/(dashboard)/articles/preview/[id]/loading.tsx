import { Skeleton } from "@/components/ui/skeleton";

export default function PreviewLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-[1128px] px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <nav className="mb-6 flex items-center gap-2 py-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </nav>

        <div className="flex flex-col lg:flex-row lg:justify-center lg:items-start gap-6 md:gap-8">
          <div className="w-full min-w-0">
            <header className="mb-6 md:mb-8">
              <Skeleton className="h-9 w-3/4 mb-4" />
              <Skeleton className="h-5 w-full max-w-2xl mb-6" />
              <div className="flex flex-wrap gap-4 mb-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="w-full aspect-video rounded-lg mb-6" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-md" />
              </div>
            </header>

            <div className="space-y-3 mb-12">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full mt-6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          <aside className="hidden lg:block lg:max-w-[280px] shrink-0">
            <Skeleton className="h-10 w-full mb-4 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
