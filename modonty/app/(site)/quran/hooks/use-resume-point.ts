import { useEffect, useRef, useState } from "react";

import type { Reciter } from "../data/quran-reciters";
import type { Surah } from "../data/quran-surahs";

/** Where the last recitation stopped, kept in this browser only. */
const RESUME_KEY = "modonty.audio.quran.last";
/** Under half a minute is not a place anyone wants back. */
const RESUME_MIN_SECONDS = 30;

interface ResumePoint {
  n: number;
  r: number;
  t: number;
}

/**
 * The bookmark in this browser's `localStorage`: read once after mount, written while the
 * recitation plays. `savedAt` is the last written second — the player resets it on a new source.
 */
export function useResumePoint(surah: Surah | null, reciterFor: (n: number) => Reciter) {
  const [resume, setResume] = useState<ResumePoint | null>(null);
  const savedAt = useRef(0);

  // Read on the client, never during render: the server has no `localStorage`, and a value read
  // during render would make the first paint disagree with the HTML it is hydrating.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RESUME_KEY);
      if (!raw) return;
      const v: unknown = JSON.parse(raw);
      if (
        typeof v === "object" &&
        v !== null &&
        typeof (v as ResumePoint).n === "number" &&
        typeof (v as ResumePoint).r === "number" &&
        typeof (v as ResumePoint).t === "number" &&
        (v as ResumePoint).t >= RESUME_MIN_SECONDS
      ) {
        setResume(v as ResumePoint);
      }
    } catch {
      // Private mode, or a value someone else wrote. Losing the bookmark is not worth a crash.
    }
  }, []);

  /**
   * سورة البقرة runs two hours. Without this, closing the tab costs the whole sitting — which is
   * the single thing that decides whether someone uses this page twice.
   * Written every five seconds, not every quarter of one: `timeupdate` fires four times a second.
   */
  const remember = (t: number) => {
    if (!surah || t < RESUME_MIN_SECONDS || Math.abs(t - savedAt.current) < 5) return;
    savedAt.current = t;
    try {
      window.localStorage.setItem(
        RESUME_KEY,
        JSON.stringify({ n: surah.n, r: reciterFor(surah.n).id, t: Math.floor(t) } satisfies ResumePoint)
      );
    } catch {
      // Storage full or blocked — the recitation keeps playing, which is the part that matters.
    }
  };

  return { resume, setResume, savedAt, remember };
}
