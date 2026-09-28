"use client";

import { useEffect, useState } from "react";

/**
 * Today's date in Riyadh as `YYYY-MM-DD`, read in the browser after it mounts — the page is built
 * ahead of time, so «how many days left» computed on the server would be the day it was built.
 * `null` until then, so the first paint matches the server's.
 */
export function useRiyadhToday(): string | null {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => {
    setToday(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh" }).format(new Date()));
  }, []);
  return today;
}
