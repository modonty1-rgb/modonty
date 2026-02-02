import { Media } from "@prisma/client";

export interface OpenGraphImageMeta {
  "og:image": string;
  "og:image:alt": string;
  "og:image:width"?: string;
  "og:image:height"?: string;
  "og:image:type"?: string;
  "og:image:secure_url"?: string;
}

/**
 * Generates Open Graph meta tags for an image
 * @param media - The Media object from Prisma
 * @returns Open Graph metadata object
 */
export function generateOpenGraphImageMeta(media: Media): OpenGraphImageMeta {
  const meta: OpenGraphImageMeta = {
    "og:image": media.url,
    "og:image:alt": media.altText || media.title || media.filename,
  };

  // Dimensions
  if (media.width) {
    meta["og:image:width"] = media.width.toString();
  }
  if (media.height) {
    meta["og:image:height"] = media.height.toString();
  }

  // MIME type
  if (media.mimeType || media.encodingFormat) {
    meta["og:image:type"] = media.encodingFormat || media.mimeType || undefined;
  }

  // Secure URL (use HTTPS if available)
  if (media.url && (media.url.startsWith("https://") || media.url.startsWith("http://"))) {
    meta["og:image:secure_url"] = media.url.replace("http://", "https://");
  } else if (media.url) {
    meta["og:image:secure_url"] = media.url;
  }

  return meta;
}

/**
 * Converts Open Graph meta object to Next.js metadata format
 * @param media - The Media object from Prisma
 * @returns Next.js metadata object
 */
export function generateNextJSImageMetadata(media: Media) {
  const ogMeta = generateOpenGraphImageMeta(media);

  return {
    openGraph: {
      images: [
        {
          url: ogMeta["og:image"],
          alt: ogMeta["og:image:alt"],
          width: ogMeta["og:image:width"] ? parseInt(ogMeta["og:image:width"]) : undefined,
          height: ogMeta["og:image:height"] ? parseInt(ogMeta["og:image:height"]) : undefined,
          type: ogMeta["og:image:type"],
          secureUrl: ogMeta["og:image:secure_url"],
        },
      ],
    },
  };
}
