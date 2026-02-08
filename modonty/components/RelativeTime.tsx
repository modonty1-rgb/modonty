"use client";

import dynamic from "next/dynamic";

const rtf = new Intl.RelativeTimeFormat("ar", { numeric: "always" });

function formatRelative(date: Date, now: Date): string {
  const diff = date.getTime() - now.getTime();
  const sec = Math.floor(-diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (day > 0) return rtf.format(-day, "day");
  if (hr > 0) return rtf.format(-hr, "hour");
  if (min > 0) return rtf.format(-min, "minute");
  return "الآن";
}

interface RelativeTimeProps {
  date: Date | string;
  dateTime?: string;
}

function RelativeTimeInner({ date, dateTime }: RelativeTimeProps) {
  const d = typeof date === "string" ? new Date(date) : date;
  const timeAgo = formatRelative(d, new Date());

  if (dateTime !== undefined) {
    return <time dateTime={dateTime} suppressHydrationWarning>{timeAgo}</time>;
  }
  return <span suppressHydrationWarning>{timeAgo}</span>;
}

export const RelativeTime = dynamic(
  () => Promise.resolve({ default: RelativeTimeInner }),
  { ssr: false, loading: () => <span>...</span> }
);
