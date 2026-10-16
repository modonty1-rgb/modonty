import { escapeTgHtml } from "@modonty/shared/lib/telegram/client";

import { ADMIN_ORIGIN, sendTasksTelegram } from "@/lib/tasks/telegram";
import { getMorningRoster } from "@/lib/tasks/telegram/get-morning-roster";
import { isCronAuthorized } from "@/lib/tasks/telegram/is-cron-authorized";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const N = new Intl.NumberFormat("ar-EG");
const DAY = new Intl.DateTimeFormat("ar-EG", { timeZone: "Asia/Riyadh", weekday: "long", day: "numeric", month: "long" });

/**
 * **تقرير ٨:٣٠ صباحاً** — لمجموعة الإشراف (خالد وروان): مَن كتب مهامَّه وكم، ومَن لم يكتب.
 * ومَن لم يُطابَق حسابُه في تليجرام يُذكر باسمه: التذكيرُ يكتبه نصّاً بلا تنبيهٍ يصله.
 * الجدول في `vercel.json` (٠٥:٣٠ UTC، الأحد–الخميس — الجمعة والسبت إجازة).
 */
export async function GET(request: Request) {
  if (!isCronAuthorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const chatId = process.env.TASKS_TELEGRAM_SUPERVISOR_CHAT_ID;
  if (!chatId) return Response.json({ error: "TASKS_TELEGRAM_SUPERVISOR_CHAT_ID is not configured" }, { status: 500 });

  const roster = await getMorningRoster();
  const wrote = roster.filter((r) => r.written > 0);
  const missing = roster.filter((r) => r.written === 0);
  const unlinked = roster.filter((r) => !r.telegramUserId);

  const lines = [
    `<b>تقرير مهام ${DAY.format(new Date())} — ٨:٣٠</b>`,
    "",
    `<b>كتبوا (${N.format(wrote.length)} من ${N.format(roster.length)})</b>`,
    ...(wrote.length ? wrote.map((r) => `• ${escapeTgHtml(r.name)} — ${N.format(r.written)}`) : ["—"]),
    "",
    `<b>ما كتبوا (${N.format(missing.length)})</b>`,
    ...(missing.length ? missing.map((r) => `• ${escapeTgHtml(r.name)}`) : ["الكل كتب"]),
    ...(unlinked.length ? ["", `بلا حساب تليجرام مطابَق:${unlinked.map((r) => escapeTgHtml(r.name)).join("، ")}`] : []),
  ];

  const sent = await sendTasksTelegram(chatId, lines.join("\n"), { label: "تقرير اليوم", url: `${ADMIN_ORIGIN}/daily-tasks` });
  return Response.json({ sent, expected: roster.length, wrote: wrote.length, missing: missing.length, unlinked: unlinked.length });
}
