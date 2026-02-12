import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { BackToTop } from "@/components/layout/BackToTop";
import { Skeleton } from "@/components/ui/skeleton";
import { InfiniteFeedSkeleton } from "@/components/feed/infiniteScroll/InfiniteFeedSkeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function HomeLoading() {
  return (
    <>
      <ScrollProgress />
      <h1 className="sr-only">جاري تحميل أحدث المقالات والمدونات</h1>
      
      <div className="container mx-auto max-w-[1128px] px-4 py-6 flex-1">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <LeftSidebarSkeleton />
          <MainFeedSkeleton />
          <RightSidebarSkeleton />
        </div>
      </div>
      <BackToTop />
    </>
  );
}

function LeftSidebarSkeleton() {
  return (
    <aside className="hidden lg:block w-[240px] sticky top-[3.5rem] self-start">
      <div className="space-y-4">
        {/* Category Analytics Card */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3.5 w-3.5" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Categories List Card */}
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-4 w-16 mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-3 w-4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-4 w-20 mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5">
                  <Skeleton className="h-2 w-2 rounded-full mt-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}

function MainFeedSkeleton() {
  return (
    <main className="w-full lg:flex-1 lg:max-w-[600px] space-y-4 pb-20 md:pb-0 [&>article:first-of-type]:!mt-0">
      <section aria-labelledby="loading-articles-heading">
        <h2 id="loading-articles-heading" className="sr-only">
          جاري تحميل آخر المقالات
        </h2>
        <InfiniteFeedSkeleton count={10} />
      </section>
    </main>
  );
}

function RightSidebarSkeleton() {
  return (
    <aside className="hidden xl:block w-[300px] sticky top-[3.5rem] self-start">
      <div className="space-y-4">
        {/* Modonty News Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-4 w-full" />
                  {i === 0 && <Skeleton className="h-5 w-12 rounded-full" />}
                </div>
                <Skeleton className="h-3 w-5/6" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Suggested Articles Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-28" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-2">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Newsletter Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-2 w-full" />
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
