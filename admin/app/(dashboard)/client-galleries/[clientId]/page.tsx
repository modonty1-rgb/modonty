import { notFound } from "next/navigation";

import { getClientGallery } from "../helpers/load-galleries";
import { ClientGalleryGrid } from "./components/client-gallery-grid";

export default async function ClientGalleryPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const data = await getClientGallery(decodeURIComponent(clientId));
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-[1080px] space-y-5">
      <ClientGalleryGrid
        clientId={data.client.id}
        clientName={data.client.name}
        images={data.images}
      />
    </div>
  );
}
