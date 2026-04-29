/**
 * Raw Telegram Bot API wrapper. Single bot model — `TELEGRAM_BOT_TOKEN`
 * env var holds the token of @ModontyAlertsBot. Each client is identified
 * by their `chat_id` (saved on Client.telegramChatId after pairing).
 */

const TG_API = "https://api.telegram.org";

function getToken(): string | null {
  // Use TELEGRAM_CLIENT_BOT_TOKEN to avoid conflict with the older admin-global
  // TELEGRAM_BOT_TOKEN that powers `modonty/lib/telegram.ts`
  return process.env.TELEGRAM_CLIENT_BOT_TOKEN ?? null;
}

export interface SendMessageResult {
  success: boolean;
  error?: string;
}

/**
 * Send a Telegram message. Uses HTML parse mode so we can format with <b>, <i>.
 * Returns success/failure — never throws (callers shouldn't fail their flow
 * because Telegram is down).
 */
export async function sendTelegramMessage(
  chatId: string,
  text: string
): Promise<SendMessageResult> {
  const token = getToken();
  if (!token) {
    return { success: false, error: "TELEGRAM_BOT_TOKEN not configured" };
  }
  if (!chatId) {
    return { success: false, error: "Missing chatId" };
  }

  try {
    const res = await fetch(`${TG_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { success: false, error: `Telegram ${res.status}: ${body.slice(0, 200)}` };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown Telegram error",
    };
  }
}

/**
 * Escape user-supplied text before injecting into HTML-mode messages.
 * Telegram's HTML parser requires &amp; &lt; &gt; on user content.
 */
export function escapeTgHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
