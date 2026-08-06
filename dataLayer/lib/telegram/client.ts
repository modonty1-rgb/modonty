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
        link_preview_options: { is_disabled: true },
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
 * Mirror a message to the admin-global alerts chat
 * (`TELEGRAM_ADMIN_CHAT_ID` via the admin bot `TELEGRAM_BOT_TOKEN`).
 * Lets the admin watch high-signal client events in one place, independent of
 * whether the client connected their own Telegram. No-ops if not configured.
 */
export async function sendAdminTelegram(text: string): Promise<SendMessageResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN ?? null;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID ?? null;
  if (!token || !chatId) {
    return { success: false, error: "Admin Telegram not configured" };
  }

  try {
    const res = await fetch(`${TG_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
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
 * Send to the CONTENT TEAM group — the writers and designers who work from the briefs.
 *
 * A SEPARATE BOT on purpose (@jbr_alerts_bot), not the one behind `TELEGRAM_BOT_TOKEN`
 * (@Modonty_admin_bot, whose chat carries system error alerts). The two were confused
 * once already: `JBRSEO/content/.env` holds the admin bot's token under a content-app
 * name, so "it is configured" is not evidence that it is configured CORRECTLY.
 *
 * There is deliberately NO fallback to the admin chat. A note to a writer that quietly
 * lands in the on-call error feed is worse than one that fails: the sender believes it
 * arrived, the writer never sees it, and nobody finds out. Missing config returns an
 * error the UI shows and the notification row records.
 */
export async function sendContentTeamTelegram(text: string): Promise<SendMessageResult> {
  const token = process.env.CONTENT_TEAM_BOT_TOKEN ?? null;
  const chatId = process.env.CONTENT_TEAM_CHAT_ID ?? null;
  if (!token || !chatId) {
    return {
      success: false,
      error: "قناة فريق المحتوى غير مضبوطة — ضبط CONTENT_TEAM_BOT_TOKEN و CONTENT_TEAM_CHAT_ID",
    };
  }

  try {
    const res = await fetch(`${TG_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
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
