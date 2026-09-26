import { cacheLife, cacheTag } from "next/cache";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";

export interface MobileHero {
  src: string;
  alt: string;
  /** The row's stored LQIP — painted while the image loads, so the box is never blank. */
  blur: string | null;
  /** `mobile` = the phone art (2:1) · `cover` = the fallback, the desktop cover (6:1). */
  kind: "mobile" | "cover";
}

const mediaSelect = { url: true, bunnyUrl: true, blurDataURL: true, altText: true } as const;

/**
 * The image at the top of `/modonty` on phones, chosen in the admin's media library
 * (Khalid, 26 Sep 2026: «الصور نرفعها في الميديا لايبراري… صورة للديسكتوب وصورة للموبايل»).
 * The client's own phone image when one is set; otherwise its regular cover («الصورة الستاندر
 * تبعت العميل هي اللي حتكون الفول باك»); null when neither exists, so no empty box is drawn.
 */
export async function getModontyMobileHero(clientId: string): Promise<MobileHero | null> {
  "use cache";
  cacheTag("clients");
  cacheLife("hours");

  const row = await db.client.findUnique({
    where: { id: clientId },
    select: { mobileHeroImageMedia: { select: mediaSelect }, heroImageMedia: { select: mediaSelect } },
  });

  const mobile = mediaSrc(row?.mobileHeroImageMedia);
  if (mobile) {
    const m = row?.mobileHeroImageMedia;
    return { src: mobile, alt: m?.altText ?? "", blur: m?.blurDataURL ?? null, kind: "mobile" };
  }
  const cover = mediaSrc(row?.heroImageMedia);
  if (cover) {
    const c = row?.heroImageMedia;
    return { src: cover, alt: c?.altText ?? "", blur: c?.blurDataURL ?? null, kind: "cover" };
  }
  return null;
}
