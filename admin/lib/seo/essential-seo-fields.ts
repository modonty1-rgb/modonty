import "server-only";
import { db } from "@/lib/db";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";

export interface EssentialSeoField {
  key: string;
  label: string;
}

// Non-negotiable SEO/brand fields for modonty.com's homepage + Organization.
// Single source of truth = Settings DB. No hardcoded fallback — if any is empty,
// the admin is alerted (EssentialSeoDialog) to fill it in Modonty settings.
export const ESSENTIAL_SEO_FIELDS: readonly EssentialSeoField[] = [
  { key: "siteName", label: "Site Name" },
  { key: "brandDescription", label: "Brand Description" },
  { key: "modontySeoTitle", label: "Homepage SEO Title" },
  { key: "modontySeoDescription", label: "Homepage SEO Description" },
  { key: "ogImageUrl", label: "Share Image (OG)" },
  { key: "logoUrl", label: "Logo (desktop)" },
  { key: "logoIconUrl", label: "Logo (mobile icon)" },
] as const;

// Returns the essential fields that are still empty in Settings (so the admin can fix them).
export async function getMissingEssentialSeoFields(): Promise<EssentialSeoField[]> {
  const settings = await db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
    select: {
      siteName: true,
      brandDescription: true,
      modontySeoTitle: true,
      modontySeoDescription: true,
      ogImageUrl: true,
      logoUrl: true,
      logoIconUrl: true,
    },
  });

  if (!settings) {
    return [...ESSENTIAL_SEO_FIELDS];
  }

  return ESSENTIAL_SEO_FIELDS.filter((field) => {
    const value = (settings as Record<string, unknown>)[field.key];
    return typeof value !== "string" || value.trim().length === 0;
  });
}
