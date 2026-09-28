import type { MediaType, Prisma } from "@prisma/client";
import { linkedWhere, mediaSiteUsedWhere, type MediaLinks } from "@/lib/media/usage-where";

/**
 * The kinds of file Modonty owns on Modonty › Media (27 Sep 2026). Matched by LINK first, like
 * Clients › Media: a category's share image uploaded as GENERAL still reads «Site pages».
 * Measured on modonty_dev the same day, the core client's 171 files: 165 gallery, 79 in
 * article galleries, 41 article featured images, 8 industry images, 6 reels, 3 brand slots.
 *
 * `role` is what Upload offers when that kind is on.
 */
export const MODONTY_MEDIA_KINDS = [
  { value: "site", label: "Site pages", role: "OGIMAGE" },
  // View only — article images upload from Articles › Media (see modonty-upload.tsx).
  { value: "articles", label: "Articles", role: null },
  { value: "brand", label: "Brand", role: "LOGO" },
  // Sector page heroes (27 Sep 2026). The phone image uploads from the sector's own screen.
  { value: "sectors", label: "Sector pages", role: "SECTOR_HERO" },
  { value: "gallery", label: "Gallery", role: null },
  { value: "reels", label: "Reels", role: null },
] as const satisfies ReadonlyArray<{ value: string; label: string; role: MediaType | null }>;

export type ModontyMediaKind = (typeof MODONTY_MEDIA_KINDS)[number]["value"];

/**
 * A kind's rows. `siteUrls` = the image URLs site settings hold (see getSiteImageUrls);
 * `links` = the files each pointer holds, so no kind runs a `$lookup` per row.
 */
export function modontyKindWhere(kind: ModontyMediaKind, siteUrls: string[], links: MediaLinks): Prisma.MediaWhereInput {
  switch (kind) {
    case "site":
      return { OR: [mediaSiteUsedWhere(links), { url: { in: siteUrls } }, { bunnyUrl: { in: siteUrls } }] };
    case "articles":
      return { OR: [{ type: "POST" }, linkedWhere(links, "featuredArticles", "articleGallery")] };
    case "brand":
      return {
        OR: [
          { type: { in: ["LOGO", "HERO", "HERO_MOBILE", "CLIENT_MINI"] } },
          linkedWhere(links, "logoClients", "heroImageClients", "mobileHeroImageClients"),
        ],
      };
    case "sectors":
      return {
        OR: [
          { type: { in: ["SECTOR_HERO", "SECTOR_HERO_MOBILE"] } },
          linkedWhere(links, "sectorHeroImages", "sectorHeroMobileImages"),
        ],
      };
    case "gallery":
      return { type: "GALLERY" };
    case "reels":
      return { OR: [{ inReels: true }, { reelStatus: { not: null } }] };
  }
}
