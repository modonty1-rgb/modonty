import { Media } from "@prisma/client";

/**
 * Generates Schema.org ImageObject JSON-LD for a media item
 * @param media - The Media object from Prisma
 * @returns JSON-LD structured data object
 */
export function generateImageObjectSchema(media: Media): object {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: media.url,
    encodingFormat: media.encodingFormat || media.mimeType,
  };

  // Basic properties
  if (media.url) {
    schema.url = media.url;
  }
  if (media.contentUrl) {
    schema.contentUrl = media.contentUrl;
  }
  if (media.thumbnailUrl) {
    schema.thumbnailUrl = media.thumbnailUrl;
  }

  // Dimensions
  if (media.width && media.height) {
    schema.width = media.width;
    schema.height = media.height;
  }

  // SEO properties
  if (media.title) {
    schema.name = media.title;
  }
  if (media.description) {
    schema.description = media.description;
  }
  if (media.altText) {
    schema.alternateName = media.altText;
  }
  if (media.caption) {
    schema.caption = media.caption;
  }

  // Keywords removed - Schema.org ImageObject doesn't have a standard keywords property
  // Keywords should be naturally incorporated into description, name, and alternateName

  // License and copyright
  if (media.license) {
    schema.license = media.license;
  }
  if (media.copyrightHolder) {
    schema.copyrightHolder = {
      "@type": "Organization",
      name: media.copyrightHolder,
    };
  }
  if (media.credit) {
    schema.creditText = media.credit;
  }

  // Creator/Author
  if (media.creator) {
    schema.creator = {
      "@type": "Person",
      name: media.creator,
    };
  }

  // Date created
  if (media.dateCreated) {
    schema.dateCreated = media.dateCreated.toISOString();
  }

  // Geographic location
  if (media.geoLatitude !== null && media.geoLongitude !== null) {
    schema.contentLocation = {
      "@type": "Place",
      geo: {
        "@type": "GeoCoordinates",
        latitude: media.geoLatitude,
        longitude: media.geoLongitude,
      },
    };

    if (media.geoLocationName) {
      (schema.contentLocation as Record<string, unknown>).name = media.geoLocationName;
    }
  } else if (media.contentLocation) {
    schema.contentLocation = {
      "@type": "Place",
      name: media.contentLocation,
    };
  }

  // Upload date
  if (media.createdAt) {
    schema.uploadDate = media.createdAt.toISOString();
  }

  return schema;
}

/**
 * Generates Schema.org JSON-LD script tag content
 * @param media - The Media object from Prisma
 * @returns JSON string for use in script tag
 */
export function generateImageObjectJSONLD(media: Media): string {
  const schema = generateImageObjectSchema(media);
  return JSON.stringify(schema, null, 2);
}
