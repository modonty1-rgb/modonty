import type { Metadata } from "next";

export interface KnownOpenGraphImageDimensions {
  url: string;
  width?: number | null;
  height?: number | null;
}

export function withHonestOpenGraphImageDimensions(
  metadata: Metadata,
  knownImages: KnownOpenGraphImageDimensions[] = [],
): Metadata {
  const openGraph = metadata.openGraph;
  const rawImages = (openGraph as { images?: unknown } | undefined)?.images;
  if (!openGraph || !Array.isArray(rawImages)) return metadata;

  const images = rawImages.map((image) => {
    if (!image || typeof image !== "object" || image instanceof URL) return image;

    const entry = image as Record<string, unknown>;
    const { width: _width, height: _height, ...withoutDimensions } = entry;
    const url = typeof entry.url === "string" ? entry.url : "";
    const known = knownImages.find((candidate) => candidate.url === url);

    return known?.width && known.height
      ? { ...withoutDimensions, width: known.width, height: known.height }
      : withoutDimensions;
  });

  return {
    ...metadata,
    openGraph: { ...openGraph, images } as Metadata["openGraph"],
  };
}
