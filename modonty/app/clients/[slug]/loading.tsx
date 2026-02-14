import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ClientDetailLoading() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "العملاء", href: "/clients" },
          { label: "..." },
        ]}
      />

      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto max-w-[1128px] px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <Skeleton className="w-full md:w-48 aspect-square rounded-xl" />

            <div className="flex-1">
              <Skeleton className="h-12 w-64 mb-4" />
              <Skeleton className="h-6 w-full max-w-3xl mb-2" />
              <Skeleton className="h-6 w-5/6 max-w-3xl mb-6" />
              
              <div className="flex flex-wrap gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div>
                      <Skeleton className="h-8 w-16 mb-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-[1128px] px-4 py-8 flex-1">
        <div className="flex items-center justify-end mb-6">
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="flex items-center gap-4 mb-8 border-b">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left sidebar */}
          <div className="w-full lg:w-[280px] shrink-0 space-y-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-[83%]" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-2">
                    <Skeleton className="h-4 w-4 shrink-0" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          {/* Center feed */}
          <div className="w-full lg:flex-1 lg:max-w-[600px] space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="aspect-video w-full rounded-lg mb-4" />
                  <div className="flex gap-4 pt-3 border-t">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Right sidebar */}
          <div className="w-full lg:w-[280px] shrink-0 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full rounded-lg" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

    </>
  );
}
