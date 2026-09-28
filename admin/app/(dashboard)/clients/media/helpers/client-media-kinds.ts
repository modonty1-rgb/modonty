import type { MediaType, Prisma } from "@prisma/client";
import { linkedWhere, type MediaLinks } from "@/lib/media/usage-where";

/**
 * The kinds of file a client owns on Clients › Media (Khalid, 26 Sep 2026). No «General»:
 * a general image goes through the main Media library, which stays exactly as it is.
 *
 * Each kind is matched by its ROLE OR ITS LINK, never by the stored type alone. Measured on
 * modonty_dev the same day: 19 logos and covers that clients actually show were uploaded as
 * GENERAL (picked before the roles existed), and every reel video is GENERAL too. A type-only
 * filter would have hidden 19 live images and all 22 client reels from the page built to
 * show them. The links come resolved (see `linkedWhere`) — not a `$lookup` per row.
 */
export const CLIENT_MEDIA_KINDS = [
  { value: "logo", label: "Logo", role: "LOGO", where: (l) => ({ OR: [{ type: "LOGO" }, linkedWhere(l, "logoClients")] }) },
  { value: "cover", label: "Cover — Desktop", role: "HERO", where: (l) => ({ OR: [{ type: "HERO" }, linkedWhere(l, "heroImageClients")] }) },
  {
    value: "cover-mobile",
    label: "Cover — Mobile",
    role: "HERO_MOBILE",
    where: (l) => ({ OR: [{ type: "HERO_MOBILE" }, linkedWhere(l, "mobileHeroImageClients")] }),
  },
  { value: "mini", label: "Client Mini", role: "CLIENT_MINI", where: () => ({ type: "CLIENT_MINI" }) },
  { value: "gallery", label: "Gallery", role: null, where: () => ({ type: "GALLERY" }) },
  { value: "reels", label: "Reels", role: null, where: () => ({ OR: [{ inReels: true }, { reelStatus: { not: null } }] }) },
] as const satisfies ReadonlyArray<{
  value: string;
  label: string;
  role: MediaType | null;
  where: (l: MediaLinks) => Prisma.MediaWhereInput;
}>;

export type ClientMediaKind = (typeof CLIENT_MEDIA_KINDS)[number]["value"];
