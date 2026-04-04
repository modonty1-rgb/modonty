"use client";

import { useState, useEffect } from "react";

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

function formatAbsolute(date: Date): string {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

interface RelativeTimeProps {
  date: Date | string;
  dateTime?: string;
}

export function RelativeTime({ date, dateTime }: RelativeTimeProps) {
  const d = typeof date === "string" ? new Date(date) : date;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const text = mounted ? formatRelative(d, new Date()) : formatAbsolute(d);

  if (dateTime !== undefined) {
    return <time dateTime={dateTime} suppressHydrationWarning>{text}</time>;
  }
  return <span suppressHydrationWarning>{text}</span>;
}
