"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SEOPreviewCardProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  siteName?: string;
}

export function SEOPreviewCard({
  title,
  description,
  url,
  image,
  siteName = "مودونتي",
}: SEOPreviewCardProps) {
  const displayTitle = title || "عنوان المقال";
  const displayDescription = description || "وصف المقال...";
  const displayUrl = url || "modonty.com/articles/...";
  const displayImage = image || "/og-image.jpg";

  return (
    <Card>
      <CardHeader>
        <CardTitle>معاينة SEO</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="google" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="google">Google</TabsTrigger>
            <TabsTrigger value="facebook">Facebook</TabsTrigger>
            <TabsTrigger value="twitter">Twitter</TabsTrigger>
          </TabsList>

          <TabsContent value="google" className="mt-4">
            <div className="border border-border rounded-md p-4 space-y-2">
              <div className="text-sm text-muted-foreground">{displayUrl}</div>
              <h3 className="text-lg text-primary hover:underline cursor-pointer line-clamp-1">
                {displayTitle}
              </h3>
              <p className="text-sm text-foreground line-clamp-2">{displayDescription}</p>
            </div>
          </TabsContent>

          <TabsContent value="facebook" className="mt-4">
            <div className="border border-border rounded-md overflow-hidden">
              {displayImage && (
                <div className="aspect-video w-full bg-muted">
                  <img
                    src={displayImage}
                    alt={displayTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4 space-y-2">
                <div className="text-xs text-muted-foreground uppercase">{siteName}</div>
                <h3 className="text-lg font-semibold line-clamp-2">{displayTitle}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {displayDescription}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="twitter" className="mt-4">
            <div className="border border-border rounded-md overflow-hidden">
              {displayImage && (
                <div className="aspect-video w-full bg-muted">
                  <img
                    src={displayImage}
                    alt={displayTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4 space-y-2">
                <h3 className="text-base font-semibold line-clamp-2">{displayTitle}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {displayDescription}
                </p>
                <div className="text-xs text-muted-foreground">{displayUrl}</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
