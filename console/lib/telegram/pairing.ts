/**
 * Pairing flow for linking a Client account to a Telegram chat.
 *
 * Flow:
 *  1. Client clicks "Generate code" in console settings.
 *      → generatePairingCode(clientId) saves a 6-digit code with 10-min TTL
 *  2. Client opens t.me/ModontyAlertsBot, sends /start
 *      → bot replies with the code (via /api/telegram/webhook handler)
 *  3. Client pastes code in console
 *      → redeemPairingCode(clientId, code, chatId) validates + persists chatId
 */

import { db } from "@/lib/db";

const CODE_TTL_MINUTES = 10;

function generateCode(): string {
  // 6-digit numeric — easy to read and type
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function generatePairingCode(clientId: string): Promise<{
  success: true;
  code: string;
  expiresAt: Date;
} | { success: false; error: string }> {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

  try {
    await db.client.update({
      where: { id: clientId },
      data: {
        telegramPairingCode: code,
        telegramPairingExpiresAt: expiresAt,
      },
    });
    return { success: true, code, expiresAt };
  } catch {
    return { success: false, error: "Failed to generate pairing code" };
  }
}

/**
 * Called by the Telegram bot webhook when a user sends /start.
 * The user's chat_id from Telegram is stored as a candidate; the actual
 * binding to a client only happens once the client confirms the code in console.
 *
 * Strategy:
 *  - User sends /start in Telegram → webhook receives chatId
 *  - Webhook responds with: "أرسل الكود الذي رأيته في الإعدادات"
 *  - User sends the 6-digit code → webhook calls confirmPairingByCode(code, chatId)
 *  - On match: link chatId to client + clear code
 */
export async function confirmPairingByCode(
  code: string,
  chatId: string
): Promise<{ success: true; clientName: string } | { success: false; error: string }> {
  const cleaned = String(code).trim();
  if (!/^\d{6}$/.test(cleaned)) {
    return { success: false, error: "الكود يجب أن يكون 6 أرقام" };
  }

  const client = await db.client.findFirst({
    where: {
      telegramPairingCode: cleaned,
      telegramPairingExpiresAt: { gt: new Date() },
    },
    select: { id: true, name: true },
  });

  if (!client) {
    return { success: false, error: "الكود غير صحيح أو منتهي الصلاحية" };
  }

  await db.client.update({
    where: { id: client.id },
    data: {
      telegramChatId: chatId,
      telegramConnectedAt: new Date(),
      telegramPairingCode: null,
      telegramPairingExpiresAt: null,
    },
  });

  return { success: true, clientName: client.name };
}

export async function disconnectTelegram(clientId: string): Promise<{
  success: boolean;
}> {
  try {
    await db.client.update({
      where: { id: clientId },
      data: {
        telegramChatId: null,
        telegramConnectedAt: null,
        telegramPairingCode: null,
        telegramPairingExpiresAt: null,
      },
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}
