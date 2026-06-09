import { db } from "@/lib/db";

export interface ClientGalleryImage {
  id: string;
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

/**
 * Curated portfolio images for the client mini-site gallery — the dedicated
 * GALLERY Media (type=GALLERY, scope=CLIENT) the partner uploads from console,
 * NOT article featured images. Feeds the gallery grid + Organization.image[] JSON-LD.
 */
export async function getClientGallery(clientSlug: string): Promise<ClientGalleryImage[]> {
  const images = await db.media.findMany({
    where: { client: { slug: clientSlug }, type: "GALLERY" },
    select: { id: true, url: true, altText: true, width: true, height: true },
    orderBy: { createdAt: "desc" },
    take: 24,
  });
  return images;
}
