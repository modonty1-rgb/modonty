import { getMediaById } from "../../actions/media-actions";
import { notFound, redirect } from "next/navigation";
import { EditMediaForm } from "./edit-media-form";
import { Prisma } from "@prisma/client";

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

  // Transform exifData from JsonValue to Record<string, unknown> | null
  const transformedMedia = {
    ...media,
    exifData: media.exifData
      ? (typeof media.exifData === "object" && media.exifData !== null && !Array.isArray(media.exifData)
          ? (media.exifData as Record<string, unknown>)
          : null)
      : null,
    client: media.client || undefined,
  };

  return <EditMediaForm media={transformedMedia} />;
}
