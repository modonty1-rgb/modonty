import { getMediaById } from "../../actions/media-actions";
import { getClients } from "../../actions/get-clients";
import { notFound } from "next/navigation";
import { EditMediaForm } from "./edit-media-form";

export default async function EditMediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [media, clients] = await Promise.all([getMediaById(id), getClients()]);

  if (!media) {
    notFound();
  }

  const transformedMedia = {
    ...media,
    client: media.client || undefined,
  };

  return <EditMediaForm media={transformedMedia} clients={clients} />;
}
