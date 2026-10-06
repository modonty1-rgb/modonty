import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";
import { clientSlugTag } from "@modonty/shared/lib/cache/client-cache-tags";

export interface ClientGalleryImage {
  id: string;
  url: string;
  bunnyUrl: string | null;
  blurDataURL: string | null;
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
  "use cache";
  cacheTag("clients", clientSlugTag(clientSlug));
  // Hours, not minutes (plan أ٦, 2 Oct 2026). «minutes» was the stopgap for a console that
  // could not bust modonty's cache; it can now — every console write to reviews, the page FAQ
  // and the gallery goes through regenerateClientSeo(), which calls revalidateModontyTag
  // ("clients") (console/.../regenerate-client-seo.ts). Left at minutes, this one helper
  // capped the WHOLE partner page at a one-minute life: measured on prod, `X-Vercel-Cache:
  // STALE` with `Age` back to 0 within minutes, and a 2.1 s first byte for the unlucky visitor.
  cacheLife("hours");
  const images = await db.media.findMany({
    where: { client: { slug: clientSlug }, type: "GALLERY" },
    select: { id: true, url: true, bunnyUrl: true, blurDataURL: true, altText: true, width: true, height: true },
    orderBy: { createdAt: "desc" },
    take: 24,
  });
  return images;
}
