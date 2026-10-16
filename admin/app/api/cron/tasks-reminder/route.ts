import { ADMIN_ORIGIN, mentionStaff, sendTasksTelegram } from "@/lib/tasks/telegram";
import { getMorningRoster } from "@/lib/tasks/telegram/get-morning-roster";
import { isCronAuthorized } from "@/lib/tasks/telegram/is-cron-authorized";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * **تذكير ٨:٠٠ صباحاً** — رسالةٌ واحدة في مجموعة «مدونتي — المهام» تذكر بالاسم مَن لم يكتب
 * مهامَّ يومه، فيصله تنبيه، ويرى الفريقُ أنّ خالد متابع (خالد ١٦ أكتوبر ٢٠٢٦). الكلّ كتب ← لا رسالة.
 * الجدول في `vercel.json` (٠٥:٠٠ UTC، الأحد–الخميس — الجمعة والسبت إجازة).
 */
export async function GET(request: Request) {
  if (!isCronAuthorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const chatId = process.env.TASKS_TELEGRAM_GROUP_CHAT_ID;
  if (!chatId) return Response.json({ error: "TASKS_TELEGRAM_GROUP_CHAT_ID is not configured" }, { status: 500 });

  const roster = await getMorningRoster();
  const missing = roster.filter((r) => r.written === 0);
  if (!missing.length) return Response.json({ expected: roster.length, missing: 0, sent: false });

  const sent = await sendTasksTelegram(
    chatId,
    `صباح الخير\nما كتبوا مهام اليوم بعد:\n${missing.map((r) => `• ${mentionStaff({ name: r.name, email: r.email, telegramUserId: r.telegramUserId })}`).join("\n")}\n\nآخر موعد <b>٨:٣٠</b> — والتقرير يوصل خالد.`,
    { label: "اكتب مهامك", url: `${ADMIN_ORIGIN}/tasks` },
  );
  return Response.json({ expected: roster.length, missing: missing.length, sent });
}
