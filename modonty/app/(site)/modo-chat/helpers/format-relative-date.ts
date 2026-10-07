import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const time = date.toLocaleTimeString(SITE_LOCALE, { hour: "2-digit", minute: "2-digit" });
  let label: string;
  if (diffDays === 0) label = "اليوم";
  else if (diffDays === 1) label = "أمس";
  else if (diffDays >= 2 && diffDays < 7) label = `قبل ${diffDays} أيام`;
  else if (diffDays >= 7 && diffDays < 30) label = `قبل ${Math.floor(diffDays / 7)} أسابيع`;
  else label = date.toLocaleDateString(SITE_LOCALE);
  return `${label} ${time}`;
}
