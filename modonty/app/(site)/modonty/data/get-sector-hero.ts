import { cacheLife, cacheTag } from "next/cache";

import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";

interface HeroImage {
  src: string;
  alt: string;
  /** The inline blur every upload stores — shown while the image loads. */
  blur: string | null;
}

export interface SectorHero {
  title: string | null;
  subtitle: string | null;
  desktop: HeroImage | null;
  mobile: HeroImage | null;
}

/**
 * The top of a sector page as the editor set it in Modonty › Sectors (Khalid, 27 Sep 2026: «ما نشتغل
 * هارد كودد»): two images from Modonty's library and two lines of text. Tagged «pages» — the tag
 * the admin's save busts.
 */
export async function getSectorHero(sector: string): Promise<SectorHero> {
  "use cache";
  cacheTag("pages");
  cacheLife("hours");

  const row = await db.sectorPage.findUnique({
    where: { sector },
    select: {
      heroTitle: true,
      heroSubtitle: true,
      heroMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true, altText: true } },
      heroMobileMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true, altText: true } },
    },
  });

  const image = (m: { url: string; bunnyUrl: string | null; blurDataURL: string | null; altText: string | null } | null | undefined): HeroImage | null => {
    const src = m ? mediaSrc(m) : null;
    return src && m ? { src, alt: m.altText ?? "", blur: m.blurDataURL } : null;
  };

  return {
    title: row?.heroTitle ?? null,
    subtitle: row?.heroSubtitle ?? null,
    desktop: image(row?.heroMedia),
    mobile: image(row?.heroMobileMedia),
  };
}
