"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { messages } from "@/lib/messages";
import {
  generatePairingCode,
  disconnectTelegram,
} from "@/lib/telegram/pairing";
import { sendTelegramMessage } from "@/lib/telegram/client";
import {
  TELEGRAM_EVENTS,
  type TelegramEventKey,
  type TelegramEventPreferences,
} from "@/lib/telegram/events";
import type { Prisma } from "@prisma/client";

type Result<T = unknown> =
  | ({ success: true } & T)
  | { success: false; error: string };

async function getClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}

const VALID_EVENT_KEYS = new Set<string>(TELEGRAM_EVENTS.map((e) => e.key));

function sanitizeEventPrefs(input: unknown): TelegramEventPreferences {
  const out: TelegramEventPreferences = {};
  if (!input || typeof input !== "object") return out;
  const raw = input as Record<string, unknown>;
  for (const [key, value] of Object.entries(raw)) {
    if (VALID_EVENT_KEYS.has(key) && typeof value === "boolean") {
      out[key as TelegramEventKey] = value;
    }
  }
  return out;
}

export async function generateTelegramPairingCodeAction(): Promise<
  Result<{ code: string; expiresAt: string }>
> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const res = await generatePairingCode(clientId);
  if (!res.success) return { success: false, error: res.error };

  revalidatePath("/dashboard/settings");
  return {
    success: true,
    code: res.code,
    expiresAt: res.expiresAt.toISOString(),
  };
}

export async function disconnectTelegramAction(): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const res = await disconnectTelegram(clientId);
  if (!res.success) {
    return { success: false, error: messages.error.serverError };
  }
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateTelegramEventPreferencesAction(
  prefs: TelegramEventPreferences
): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const clean = sanitizeEventPrefs(prefs);

  try {
    await db.client.update({
      where: { id: clientId },
      data: {
        telegramEventPreferences: clean as Prisma.InputJsonValue,
      },
    });
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function sendTelegramTestMessageAction(): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const client = await db.client.findUnique({
    where: { id: clientId },
    select: { telegramChatId: true, name: true },
  });
  if (!client?.telegramChatId) {
    return {
      success: false,
      error: "ربط تيليجرام غير مفعّل. ولّد كود وأكمل الربط أولاً.",
    };
  }

  const res = await sendTelegramMessage(
    client.telegramChatId,
    `🧪 <b>رسالة اختبار</b>\nالربط شغّال — راح تستلم إشعارات <b>${client.name}</b> هنا.`
  );
  if (!res.success) {
    return {
      success: false,
      error: res.error ?? "فشل إرسال رسالة الاختبار",
    };
  }
  return { success: true };
}
