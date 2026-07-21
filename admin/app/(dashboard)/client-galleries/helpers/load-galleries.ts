import { db } from "@/lib/db";

// Data for the Client Galleries route (client-page GALLERY images, type=GALLERY · scope=CLIENT).
// These live here now instead of the general /media library.

export interface GalleryClientRow {
  id: string;
  name: string;
  logoUrl: string | null;
  count: number;
}

/** Every client + how many gallery images it has, worst-populated last (most first). */
export async function getClientsWithGalleryCounts(): Promise<GalleryClientRow[]> {
  const [clients, counts] = await Promise.all([
    db.client.findMany({
      select: { id: true, name: true, logoMedia: { select: { url: true } } },
    }),
    db.media.groupBy({
      by: ["clientId"],
      where: { type: "GALLERY", clientId: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const countMap = new Map(counts.map((c) => [c.clientId, c._count._all]));

  return clients
    .map((c) => ({
      id: c.id,
      name: c.name,
      logoUrl: c.logoMedia?.url ?? null,
      count: countMap.get(c.id) ?? 0,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ar"));
}

export interface GalleryImageRow {
  id: string;
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  filename: string;
  mimeType: string;
  createdAt: string;
}

export interface ClientGalleryData {
  client: { id: string; name: string };
  images: GalleryImageRow[];
}

/** One client's gallery grid (newest first). Null when the client id is unknown. */
export async function getClientGallery(clientId: string): Promise<ClientGalleryData | null> {
  const client = await db.client.findUnique({
    where: { id: clientId },
    select: { id: true, name: true },
  });
  if (!client) return null;

  const images = await db.media.findMany({
    where: { clientId, type: "GALLERY" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      url: true,
      altText: true,
      width: true,
      height: true,
      fileSize: true,
      filename: true,
      mimeType: true,
      createdAt: true,
    },
  });

  return {
    client,
    images: images.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })),
  };
}
