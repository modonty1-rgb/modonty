import "server-only";

/** Where every button in a tasks message lands — the board itself, never a guessed deep link. */
export const ADMIN_ORIGIN = "https://admin.modonty.com";

/** A slow Telegram must never hold a server action open: the send gives up after 4 s. */
const TIMEOUT_MS = 4_000;

/**
 * **رسالةٌ من بوت المهامّ `@modonty_tasks_bot`** — للموظّف في الخاص أو لمجموعة الإشراف.
 *
 * بوتٌ مستقلّ (خالد ١٦ أكتوبر ٢٠٢٦) لا بوت الأدمن: ذاك تنبيهاتُ أخطاء النظام، وخلطُ مهمّةِ موظّفٍ
 * بها يجعل الاثنين يُتجاهَلان. بلا مفتاح ← لا شيء، فأيُّ بيئةٍ لم يُضبط فيها لا ترسل.
 *
 * لا ترمي أبداً: المهمّةُ كُتبت أو تحرّكت فعلاً، وفشلُ رسالتها يُسجَّل ويمضي.
 */
export async function sendTasksTelegram(
  chatId: string,
  text: string,
  button?: { label: string; url: string },
): Promise<boolean> {
  const token = process.env.TASKS_TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text.slice(0, 4000),
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
        ...(button ? { reply_markup: { inline_keyboard: [[{ text: button.label, url: button.url }]] } } : {}),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) console.error("[tasks-telegram] send failed", res.status, (await res.text().catch(() => "")).slice(0, 200));
    return res.ok;
  } catch (err) {
    console.error("[tasks-telegram] send failed", err instanceof Error ? err.message : err);
    return false;
  }
}
