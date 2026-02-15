import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ArticleLoading() {
  return (
    <div className="[&_.animate-pulse]:!bg-muted-foreground/15">
      <Skeleton className="h-1 w-full" />
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "العملاء", href: "/clients" },
          { label: "..." },
          { label: "..." },
        ]}
      />

      <main className="container mx-auto max-w-[1128px] px-4 sm:px-6 lg:px-8 py-6 md:py-8 flex-1">
        <div className="flex flex-col lg:grid lg:grid-cols-[240px_1fr_280px] lg:items-start gap-6 md:gap-8">
          {/* Left sidebar – مشاركة وتفاعل + العميل */}
          <aside
            className="hidden lg:flex w-[240px] min-w-0 shrink-0 flex-col gap-6"
            role="complementary"
            aria-label="مشاركة وتفاعل"
          >
            <div className="sticky top-[3.5rem] flex flex-col gap-6">
              <Card className="min-w-0 overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
              <Card className="min-w-0">
                <CardContent className="p-4 flex flex-col gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-14" />
                  </div>
                  <div className="flex flex-col gap-2 border-t border-border pt-4">
                    <Skeleton className="h-3 w-20" />
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-9" />
                      <Skeleton className="h-9 w-9" />
                      <Skeleton className="h-9 w-9" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          <div className="w-full min-w-0">
            <article>
              <header className="mb-6 md:mb-8">
                <Skeleton className="h-8 md:h-9 w-full mb-4" />
                <Skeleton className="h-5 w-5/6 mb-6" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm mb-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </header>

              <Skeleton className="aspect-video w-full rounded-lg mb-6" />

              <div className="flex flex-wrap gap-2 mb-6">
                <Skeleton className="h-7 w-20 rounded-md" />
                <Skeleton className="h-7 w-24 rounded-md" />
                <Skeleton className="h-7 w-16 rounded-md" />
                <Skeleton className="h-7 w-20 rounded-md" />
              </div>

              <div id="article-content" className="mb-8 md:mb-12">
                <div className="space-y-3 max-w-none">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-11/12" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-10/12" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-9/12" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-10/12" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-4/5" />
                </div>
              </div>

              <section className="my-8 md:my-12" aria-labelledby="gallery-heading">
                <Skeleton className="h-7 w-32 mb-6" id="gallery-heading" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="aspect-video w-full" />
                      <CardContent className="p-4">
                        <Skeleton className="h-4 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              <section id="article-faq" className="my-2 md:my-3">
                <Card className="min-w-0">
                  <CardContent className="p-4 flex flex-col gap-4">
                    <div className="flex w-full items-center justify-between gap-2">
                      <Skeleton className="h-5 w-5 shrink-0" />
                      <Skeleton className="h-4 w-44" />
                      <Skeleton className="h-4 w-28 shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section className="my-2 md:my-3" id="article-comments">
                <Card className="min-w-0">
                  <CardContent className="p-4 flex flex-col gap-4">
                    <div className="flex w-full items-center justify-between gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-5 shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section className="my-2 md:my-3">
                <Card className="min-w-0">
                  <CardContent className="p-4 flex flex-col gap-4">
                    <div className="flex w-full items-center justify-between gap-2">
                      <Skeleton className="h-5 w-5 shrink-0" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-28 shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </section>
              <section className="my-2 md:my-3">
                <Card className="min-w-0">
                  <CardContent className="p-4 flex flex-col gap-4">
                    <div className="flex w-full items-center justify-between gap-2">
                      <Skeleton className="h-5 w-5 shrink-0" />
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-4 w-28 shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </section>
              <section className="my-2 md:my-3">
                <Card className="min-w-0">
                  <CardContent className="p-4 flex flex-col gap-4">
                    <div className="flex w-full items-center justify-between gap-2">
                      <Skeleton className="h-5 w-5 shrink-0" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-28 shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </section>
              <section className="my-2 md:my-3">
                <Card className="min-w-0">
                  <CardContent className="p-4 flex flex-col gap-4">
                    <div className="flex w-full items-center justify-between gap-2">
                      <Skeleton className="h-5 w-5 shrink-0" />
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-4 w-28 shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </section>

              <footer className="my-8 md:my-12 pt-6 md:pt-8 border-t border-border space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-40" />
              </footer>
            </article>
          </div>

          <aside
            className="hidden lg:flex min-w-0 flex-col gap-6"
            role="complementary"
            aria-label="جدول المحتويات"
          >
            <div className="[&_section]:my-0">
              <Card className="min-w-0">
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </CardContent>
              </Card>
            </div>
            <div className="[&>div]:mt-0 [&>div]:mb-0">
              <Card className="min-w-0">
                <CardContent className="p-4 flex flex-col gap-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="min-w-0">
              <Skeleton className="h-24 w-full rounded-lg mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="[&>div]:mt-0 [&>div]:mb-0">
              <Card className="sticky top-24 min-w-0">
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
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
