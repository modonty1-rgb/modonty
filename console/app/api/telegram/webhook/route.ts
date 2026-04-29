/**
 * Telegram bot webhook. Receives updates from @ModontyAlertsBot and:
 *   - /start  → onboarding message
 *   - 6-digit code → attempts to redeem pairing
 *   - anything else → help message
 *
 * Webhook URL must be set once via setWebhook:
 *   POST https://api.telegram.org/bot<TOKEN>/setWebhook
 *   { "url": "https://console.modonty.com/api/telegram/webhook",
 *     "secret_token": "<TELEGRAM_WEBHOOK_SECRET>" }
 *
 * Telegram echoes the secret in `x-telegram-bot-api-secret-token` header
 * on every call — we verify it to reject forged requests.
 */

import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram/client";
import { confirmPairingByCode } from "@/lib/telegram/pairing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TelegramUpdate {
  message?: {
    chat?: { id: number };
    text?: string;
    from?: { first_name?: string };
  };
}

const ONBOARDING = `👋 أهلاً بك في إشعارات مدونتي.

لربط حسابك:
1. افتح صفحة الإعدادات في console.modonty.com
2. اضغط «ربط Telegram» — راح يطلع لك كود من 6 أرقام
3. ارجع هنا وأرسل الكود

أرسل /help للمساعدة.`;

const HELP = `📖 الأوامر المتاحة:
/start — معلومات الربط
/help — هذي القائمة

لربط حسابك، أرسل الكود من 6 أرقام اللي ظهر في صفحة الإعدادات.`;

function isPairingCode(text: string): boolean {
  return /^\d{6}$/.test(text.trim());
}

export async function POST(request: NextRequest) {
  // Verify webhook secret (optional but recommended)
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expectedSecret) {
    const incoming = request.headers.get("x-telegram-bot-api-secret-token");
    if (incoming !== expectedSecret) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const chatId = update.message?.chat?.id;
  const text = update.message?.text?.trim() ?? "";
  if (!chatId) {
    return NextResponse.json({ ok: true });
  }

  const chatIdStr = String(chatId);

  try {
    if (text === "/start") {
      await sendTelegramMessage(chatIdStr, ONBOARDING);
      return NextResponse.json({ ok: true });
    }

    if (text === "/help") {
      await sendTelegramMessage(chatIdStr, HELP);
      return NextResponse.json({ ok: true });
    }

    if (isPairingCode(text)) {
      const res = await confirmPairingByCode(text, chatIdStr);
      if (res.success) {
        await sendTelegramMessage(
          chatIdStr,
          `✅ تم الربط بنجاح!\nشركتك: <b>${res.clientName}</b>\nمن الآن، إشعارات مدونتي راح توصلك هنا حسب اللي اخترته في الإعدادات.`
        );
      } else {
        await sendTelegramMessage(
          chatIdStr,
          `❌ ${res.error}\n\nتأكد من الكود من صفحة الإعدادات أو ولّد كود جديد.`
        );
      }
      return NextResponse.json({ ok: true });
    }

    // Fallback
    await sendTelegramMessage(
      chatIdStr,
      "🤔 ما فهمت رسالتك. أرسل /start للبدء أو الكود من 6 أرقام للربط."
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
