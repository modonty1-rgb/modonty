import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getClientMedia, getMediaStats } from "./helpers/media-queries";
import { MediaGallery } from "./components/media-gallery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;

  if (!clientId) {
    redirect("/");
  }

  const [allMedia, stats] = await Promise.all([
    getClientMedia(clientId),
    getMediaStats(clientId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold leading-tight text-foreground">
            Media Library
          </h1>
          <p className="text-muted-foreground mt-1">
            View your media assets
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-baseline gap-2 justify-end">
            <span className="text-sm font-medium text-muted-foreground">Total Media:</span>
            <p className="text-2xl font-semibold text-foreground">
              {stats.totalMedia}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {(stats.totalSize / 1024 / 1024).toFixed(2)} MB total size
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.byType.map((type) => (
          <Card key={type.type} className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium capitalize">
                {type.type.toLowerCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">
                {type.count}
              </p>
              <p className="text-xs text-muted-foreground mt-1">files</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <MediaGallery clientId={clientId} media={allMedia} />
    </div>
  );
}
