import "server-only";

import { db } from "@/lib/db";
import { mediaSrc } from "@modonty/shared/lib/media-src";

const mediaSelect = { id: true, url: true, bunnyUrl: true, blurDataURL: true } as const;

/**
 * The four page images of ONE client — set or missing. Answers the question the grid alone
 * could not (Khalid's review, 26 Sep 2026): «what is this client still missing?».
 * The mini image has no field on Client; it is a CLIENT_MINI row the client owns.
 */
export async function getClientMediaSlots(clientId: string) {
  const [client, mini] = await Promise.all([
    db.client.findUnique({
      where: { id: clientId },
      select: {
        name: true,
        logoMedia: { select: mediaSelect },
        heroImageMedia: { select: mediaSelect },
        mobileHeroImageMedia: { select: mediaSelect },
      },
    }),
    db.media.findFirst({
      where: { clientId, type: "CLIENT_MINI" },
      orderBy: { createdAt: "desc" },
      select: mediaSelect,
    }),
  ]);
  if (!client) return null;

  return {
    name: client.name,
    /** What the box shows — the grid below leaves these out so nothing appears twice. */
    shownIds: [client.logoMedia?.id, client.heroImageMedia?.id, client.mobileHeroImageMedia?.id, mini?.id].filter(
      (id): id is string => !!id,
    ),
    slots: [
      { role: "LOGO" as const, src: mediaSrc(client.logoMedia), id: client.logoMedia?.id },
      { role: "HERO" as const, src: mediaSrc(client.heroImageMedia), id: client.heroImageMedia?.id },
      { role: "HERO_MOBILE" as const, src: mediaSrc(client.mobileHeroImageMedia), id: client.mobileHeroImageMedia?.id },
      { role: "CLIENT_MINI" as const, src: mediaSrc(mini), id: mini?.id },
    ],
  };
}
