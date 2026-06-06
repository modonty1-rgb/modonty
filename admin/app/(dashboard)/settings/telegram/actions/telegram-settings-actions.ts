"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { SETTINGS_SINGLETON_WHERE, ensureSettingsId } from "@/lib/settings/settings-singleton";

export interface TelegramAdminSettings {
  mirrorAll: boolean;
}

export async function getTelegramAdminSettings(): Promise<TelegramAdminSettings> {
  const s = await db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
    select: { telegramAdminMirrorAll: true },
  });
  return { mirrorAll: s?.telegramAdminMirrorAll ?? true };
}

interface SaveResult {
  ok: boolean;
  error?: string;
}

/** Toggle the admin activity feed (mirror ALL client events to the admin chat). */
export async function saveTelegramAdminMirror(mirrorAll: boolean): Promise<SaveResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  try {
    const id = await ensureSettingsId();
    await db.settings.update({
      where: { id },
      data: { telegramAdminMirrorAll: mirrorAll },
    });
    revalidatePath("/settings/telegram");
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save";
    return { ok: false, error: message };
  }
}
