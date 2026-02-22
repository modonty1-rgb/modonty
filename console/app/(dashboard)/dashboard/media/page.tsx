import { auth } from "@/lib/auth";
import { ar } from "@/lib/ar";
import { redirect } from "next/navigation";
import { getClientMedia } from "./helpers/media-queries";
import { MediaGallery } from "./components/media-gallery";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;

  if (!clientId) {
    redirect("/");
  }

  const allMedia = await getClientMedia(clientId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {ar.media.mediaLibrary}
        </h1>
        <p className="text-muted-foreground mt-1">
          {ar.media.viewMediaAssets}
        </p>
      </div>

      <MediaGallery clientId={clientId} media={allMedia} />
    </div>
  );
}
