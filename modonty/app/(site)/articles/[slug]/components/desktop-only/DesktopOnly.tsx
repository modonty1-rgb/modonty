"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Mounts its children only when the screen is at least `minWidth` wide.
 *
 * `hidden lg:block` hides a desktop island from a phone's eyes, not from its network: React still
 * mounts every client component inside, and each lazy one fetches its chunk. Measured 3 Oct 2026
 * on an article at 390px — the desktop action tabs (like · save · comment · share) and the rail's
 * reading tools loaded on every phone, behind `display:none`. Khalid: «ما تشتغل إلا لما يضغط
 * عليها… البرفورمانس تبع الموبايل».
 *
 * For INTERACTIVE islands only — anything a crawler should read stays server-rendered outside it.
 */
export function DesktopOnly({ children, minWidth = 1024 }: { children: ReactNode; minWidth?: number }) {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [minWidth]);
  return wide ? <>{children}</> : null;
}
