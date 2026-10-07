import { useEffect, useState, type RefObject } from "react";

/**
 * The active reel = the one most in view. A single observer watches every section; whichever
 * crosses 60% and is the most visible becomes active — it plays, the rest pause.
 */
export function useActiveReel(
  scrollRef: RefObject<HTMLDivElement | null>,
  sectionsRef: RefObject<(HTMLElement | null)[]>,
  count: number
) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const ratios = new Map<number, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = Number((e.target as HTMLElement).dataset.index);
          ratios.set(i, e.intersectionRatio);
        }
        let best = -1;
        let bestRatio = 0.6; // must clear the threshold to take over
        for (const [i, r] of ratios) {
          if (r >= bestRatio) {
            bestRatio = r;
            best = i;
          }
        }
        if (best !== -1) setActive(best);
      },
      { root, threshold: [0, 0.6, 0.9] }
    );
    sectionsRef.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [count]);

  return active;
}
