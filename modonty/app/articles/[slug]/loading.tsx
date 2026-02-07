import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ArticleLoading() {
  return (
    <>
      <Skeleton className="h-1 w-full" />
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "..." },
          { label: "..." },
        ]}
      />

      <main className="container mx-auto max-w-[1128px] px-4 sm:px-6 lg:px-8 py-6 md:py-8 flex-1">
        <div className="flex flex-col lg:flex-row lg:justify-center lg:items-start gap-6 md:gap-8">
          <div className="w-full">
            <article>
              <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-6 w-24" />
            </div>
            
            <Skeleton className="h-12 w-full mb-3" />
            <Skeleton className="h-12 w-5/6 mb-6" />

                <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>

            <Skeleton className="aspect-video w-full rounded-lg mb-8" />

                <div className="flex items-center justify-between mb-6 pb-6 border-b">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                  </div>
                </div>
              </header>

              <div className="prose prose-lg max-w-none mb-12">
                <Skeleton className="h-5 w-full mb-3" />
                <Skeleton className="h-5 w-full mb-3" />
                <Skeleton className="h-5 w-11/12 mb-6" />

                <Skeleton className="h-5 w-full mb-3" />
                <Skeleton className="h-5 w-full mb-3" />
                <Skeleton className="h-5 w-10/12 mb-6" />

                <Skeleton className="h-5 w-full mb-3" />
                <Skeleton className="h-5 w-full mb-3" />
                <Skeleton className="h-5 w-full mb-3" />
                <Skeleton className="h-5 w-9/12 mb-6" />

                <Skeleton className="h-5 w-full mb-3" />
                <Skeleton className="h-5 w-full mb-3" />
                <Skeleton className="h-5 w-10/12 mb-6" />
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20" />
                ))}
              </div>

              <section className="mb-12">
                <Skeleton className="h-8 w-48 mb-6" />

                <Card className="mb-4">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-24 w-full mb-3" />
                        <Skeleton className="h-10 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="mb-4">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-32 mb-2" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-5/6 mb-3" />
                          <div className="flex items-center gap-4">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-8 w-16" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </section>

              <section>
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="aspect-video w-full" />
                      <CardHeader className="pb-3">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-6 w-full mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-32" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </article>
          </div>

          <aside
            className="hidden lg:block lg:max-w-[280px]"
            role="complementary"
            aria-label="جدول المحتويات"
          >
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-24 mb-2" />
              </CardHeader>
              <CardContent className="space-y-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className={`h-4 ${index % 3 === 2 ? "w-3/4" : "w-full"}`}
                  />
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </>
  );
}
