import { db } from "@/lib/db";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";

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
  const settings = await db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
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
