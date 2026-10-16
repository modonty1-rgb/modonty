import { escapeTgHtml } from "@modonty/shared/lib/telegram/client";

/**
 * Name of a staff member as a Telegram mention — `tg://user?id=` notifies them on their phone
 * when they are in the group. Without a matched account it is just the name, still readable.
 */
export function mentionStaff(s: { name: string | null; email: string | null; telegramUserId: string | null }): string {
  const name = escapeTgHtml(s.name?.trim() || s.email?.trim() || "زميل");
  return s.telegramUserId && /^\d+$/.test(s.telegramUserId)
    ? `<a href="tg://user?id=${s.telegramUserId}">${name}</a>`
    : name;
}
