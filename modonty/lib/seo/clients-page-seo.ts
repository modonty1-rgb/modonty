import { db } from "@/lib/db";
import type { Metadata } from "next";

export interface ClientsPageSeo {
  metadata: Metadata | null;
  jsonLd: string | null;
}

// Read cached Metadata + JSON-LD for the clients page from Settings (SOT).
// Does not build or mutate SEO – it only reads what admin flows cached.
export async function getClientsPageSeo(): Promise<ClientsPageSeo> {
  const settings = await db.settings.findFirst({
    select: {
      clientsPageMetaTags: true,
      clientsPageJsonLdStructuredData: true,
    },
  });

  if (!settings) {
    return { metadata: null, jsonLd: null };
  }

  const raw = settings.clientsPageMetaTags as Record<string, unknown> | null;
  const { viewport: _v, themeColor: _t, ...metaOnly } = raw ?? {};
  const metadata = (Object.keys(metaOnly).length ? metaOnly : null) as Metadata | null;

  const rawJsonLd = settings.clientsPageJsonLdStructuredData;
  const jsonLd =
    typeof rawJsonLd === "string" && rawJsonLd.trim().length > 0
      ? rawJsonLd
      : null;

  return { metadata, jsonLd };
}

export interface B2bPanelSettings {
  b2bLabel: string | null;
  b2bHeadline: string | null;
  b2bBullet1: string | null;
  b2bBullet2: string | null;
  b2bBullet3: string | null;
  b2bCtaText: string | null;
  b2bCtaUrl: string | null;
}

export async function getB2bPanelSettings(): Promise<B2bPanelSettings> {
  const settings = await db.settings.findFirst({
    select: {
      b2bLabel: true,
      b2bHeadline: true,
      b2bBullet1: true,
      b2bBullet2: true,
      b2bBullet3: true,
      b2bCtaText: true,
      b2bCtaUrl: true,
    },
  });

  return {
    b2bLabel: settings?.b2bLabel ?? null,
    b2bHeadline: settings?.b2bHeadline ?? null,
    b2bBullet1: settings?.b2bBullet1 ?? null,
    b2bBullet2: settings?.b2bBullet2 ?? null,
    b2bBullet3: settings?.b2bBullet3 ?? null,
    b2bCtaText: settings?.b2bCtaText ?? null,
    b2bCtaUrl: settings?.b2bCtaUrl ?? null,
  };
}
