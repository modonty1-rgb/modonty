"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { SETTINGS_SINGLETON_WHERE, ensureSettingsId } from "@/lib/settings/settings-singleton";

import { DEFAULT_DISCLAIMER_TEXT, type DisclaimerSettings } from "../disclaimer-constants";

export async function getDisclaimerSettings(): Promise<DisclaimerSettings> {
  const s = await db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
    select: { disclaimerText: true, disclaimerVersion: true },
  });
  return {
    text: s?.disclaimerText ?? DEFAULT_DISCLAIMER_TEXT,
    version: s?.disclaimerVersion ?? 1,
  };
}

interface SaveResult {
  ok: boolean;
  error?: string;
  version?: number;
}

/**
 * Saves the disclaimer text. When the text actually changes (and one already
 * existed), the version is bumped so clients are re-prompted to accept.
 */
export async function saveDisclaimer(text: string): Promise<SaveResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Disclaimer text is required" };

  try {
    const id = await ensureSettingsId();
    const current = await db.settings.findUnique({
      where: { id },
      select: { disclaimerText: true, disclaimerVersion: true },
    });

    const prevText = current?.disclaimerText ?? null;
    const prevVersion = current?.disclaimerVersion ?? 1;
    // Bump only when an existing text is being changed → forces clients to re-accept.
    const changed = prevText !== null && prevText !== trimmed;
    const nextVersion = changed ? prevVersion + 1 : prevVersion;

    await db.settings.update({
      where: { id },
      data: { disclaimerText: trimmed, disclaimerVersion: nextVersion },
    });

    revalidatePath("/settings/disclaimer");
    await revalidateModontyTag("settings");
    return { ok: true, version: nextVersion };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save disclaimer";
    return { ok: false, error: message };
  }
}
