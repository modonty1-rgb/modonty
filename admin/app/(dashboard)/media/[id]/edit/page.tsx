import { getMediaById } from "../../actions/media-actions";
import { notFound } from "next/navigation";
import { EditMediaForm } from "./edit-media-form";

export default async function EditMediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const media = await getMediaById(id);

  if (!media) {
    notFound();
  }

  const transformedMedia = {
    ...media,
    client: media.client || undefined,
  };

  return <EditMediaForm media={transformedMedia} />;
}
