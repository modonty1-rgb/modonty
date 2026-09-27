import type { MediaType, Prisma } from "@prisma/client";
import { MEDIA_SITE_USED_WHERE } from "@/lib/media/usage-where";

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
  { value: "gallery", label: "Gallery", role: null },
  { value: "reels", label: "Reels", role: null },
] as const satisfies ReadonlyArray<{ value: string; label: string; role: MediaType | null }>;

export type ModontyMediaKind = (typeof MODONTY_MEDIA_KINDS)[number]["value"];

/** A kind's rows. `siteUrls` = the image URLs site settings hold (see getSiteImageUrls). */
export function modontyKindWhere(kind: ModontyMediaKind, siteUrls: string[]): Prisma.MediaWhereInput {
  switch (kind) {
    case "site":
      return { OR: [MEDIA_SITE_USED_WHERE, { url: { in: siteUrls } }, { bunnyUrl: { in: siteUrls } }] };
    case "articles":
      return { OR: [{ type: "POST" }, { featuredArticles: { some: {} } }, { articleGallery: { some: {} } }] };
    case "brand":
      return {
        OR: [
          { type: { in: ["LOGO", "HERO", "HERO_MOBILE", "CLIENT_MINI"] } },
          { logoClients: { some: {} } },
          { heroImageClients: { some: {} } },
          { mobileHeroImageClients: { some: {} } },
        ],
      };
    case "gallery":
      return { type: "GALLERY" };
    case "reels":
      return { OR: [{ inReels: true }, { reelStatus: { not: null } }] };
  }
}
