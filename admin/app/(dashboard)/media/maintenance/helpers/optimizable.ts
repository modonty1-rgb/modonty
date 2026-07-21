import { db } from "@/lib/db";

// Best-practice ceiling for a web image. Anything heavier — or any non-WebP format —
// is flagged for the maintenance optimizer. WebP masters average ~130KB in this library.
export const OVERSIZE_BYTES = 300 * 1024;

export interface OptimizableImage {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  fileSize: number | null;
  width: number | null;
  height: number | null;
  type: string | null;
  clientName: string | null;
  /** Why it's flagged. */
  reasons: string[];
}

function isWebp(mime: string): boolean {
  return mime.toLowerCase().includes("webp");
}

/**
 * Every managed image (ALL types INCLUDING gallery, excluding PLATFORM assets) that is
 * either not WebP or heavier than the best-practice ceiling — the candidates for
 * one-by-one re-compression on the maintenance page.
 */
export async function getOptimizableImages(): Promise<OptimizableImage[]> {
  const rows = await db.media.findMany({
    where: {
      scope: { not: "PLATFORM" },
      mimeType: { startsWith: "image/" },
      OR: [{ mimeType: { not: "image/webp" } }, { fileSize: { gt: OVERSIZE_BYTES } }],
    },
    orderBy: { fileSize: "desc" },
    select: {
      id: true,
      url: true,
      filename: true,
      mimeType: true,
      fileSize: true,
      width: true,
      height: true,
      type: true,
      client: { select: { name: true } },
    },
    take: 500,
  });

  return rows.map((m) => {
    const reasons: string[] = [];
    if (!isWebp(m.mimeType)) reasons.push("ليست WebP");
    if ((m.fileSize ?? 0) > OVERSIZE_BYTES) reasons.push("أكبر من الحد");
    return {
      id: m.id,
      url: m.url,
      filename: m.filename,
      mimeType: m.mimeType,
      fileSize: m.fileSize,
      width: m.width,
      height: m.height,
      type: m.type,
      clientName: m.client?.name ?? null,
      reasons,
    };
  });
}
