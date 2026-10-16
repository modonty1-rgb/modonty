import "server-only";

import { after } from "next/server";

import { escapeTgHtml } from "@modonty/shared/lib/telegram/client";

import { db } from "@/lib/db";

import { mentionStaff } from "./mention-staff";
import { ADMIN_ORIGIN, sendTasksTelegram } from "./send-tasks-telegram";

type TaskTelegram = {
  /** The staff member whose bell just rang — the same row `notification.staffId` was written for. */
  to: string;
  /** The bell's own title and body, so Telegram and the bell never say two different things. */
  title: string;
  body: string;
  /** Board page the button opens; the assignee's board unless the message is for a reviewer. */
  path?: string;
};

/**
 * **نسخةُ تليجرام من إشعار جرس المهامّ** — في مجموعة «مدونتي — المهام»، تذكر صاحبَها فيصله تنبيه.
 *
 * مجموعةٌ لا خاص (خالد ١٦ أكتوبر ٢٠٢٦): البوتُ لا يراسل في الخاص مَن لم يضغط Start، والفريقُ
 * كلُّه في المجموعة أصلاً. وفيها يرى خالد مَن أسند لمَن بلا قناةٍ ثانية.
 *
 * تُرسل بعد الرد (`after`)، فلا تُبطئ الحركة على اللوحة؛ و`after` يرمي خارج نطاق الطلب —
 * وحينها إرسالٌ في الخلفية يكفي.
 */
export function queueTaskTelegram(p: TaskTelegram): void {
  const run = () => deliver(p);
  try {
    after(run);
  } catch {
    void run();
  }
}

async function deliver(p: TaskTelegram): Promise<void> {
  const chatId = process.env.TASKS_TELEGRAM_GROUP_CHAT_ID;
  if (!chatId) return;
  try {
    const staff = await db.staff.findUnique({
      where: { id: p.to },
      select: { name: true, email: true, telegramUserId: true },
    });
    if (!staff) return;
    await sendTasksTelegram(
      chatId,
      `${mentionStaff(staff)}\n<b>${escapeTgHtml(p.title)}</b>\n${escapeTgHtml(p.body)}`,
      { label: "افتح المهام", url: `${ADMIN_ORIGIN}${p.path ?? "/tasks"}` },
    );
  } catch (err) {
    console.error("[tasks-telegram] deliver failed", err instanceof Error ? err.message : err);
  }
}
