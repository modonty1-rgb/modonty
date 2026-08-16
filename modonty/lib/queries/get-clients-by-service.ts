import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";
import { ClientCtaMode, SubscriptionStatus } from "@prisma/client";
import { mediaSrc } from "@modonty/shared/lib/media-src";

/** The two service doors on the mobile bottom bar. */
export type ServiceKind = "booking" | "shop";

export interface ServiceClient {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  heroUrl?: string;
  slogan: string | null;
  addressCity: string | null;
  articleCount: number;
  phone: string | null;
}

// Clients are matched through their CTA preset, and `Client.ctaPresetId` is deliberately
// NOT a Prisma relation (schema.prisma:600 — deleting a button must never touch a client).
// So the preset ids are read first, then the clients are filtered by them.
export async function getClientsByService(kind: ServiceKind): Promise<ServiceClient[]> {
  "use cache";
  cacheTag("clients");
  cacheLife("hours");

  const presets = await db.ctaPreset.findMany({
    where: {
      isActive: true,
      // Booking is a form the visitor fills in; shopping sends them out to a store link.
      ...(kind === "booking" ? { mode: ClientCtaMode.FORM } : { mode: ClientCtaMode.LINK }),
    },
    select: { id: true, labelKey: true },
  });

  const presetIds = presets
    .filter((preset) => (kind === "shop" ? preset.labelKey.includes("تسوق") : true))
    .map((preset) => preset.id);

  if (presetIds.length === 0) return [];

  const clients = await db.client.findMany({
    where: {
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      ctaPresetId: { in: presetIds },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      slogan: true,
      addressCity: true,
      phone: true,
      logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
      heroImageMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
      _count: { select: { articles: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return clients.map((client) => ({
    id: client.id,
    name: client.name,
    slug: client.slug,
    logoUrl: mediaSrc(client.logoMedia) ?? undefined,
    heroUrl: mediaSrc(client.heroImageMedia) ?? undefined,
    slogan: client.slogan,
    addressCity: client.addressCity,
    articleCount: client._count.articles,
    phone: client.phone,
  }));
}
