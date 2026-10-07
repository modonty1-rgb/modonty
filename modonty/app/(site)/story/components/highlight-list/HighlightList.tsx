import { m } from "framer-motion";
import { stripTashkeel } from "../../helpers/strip-tashkeel";
import type { HighlightState } from "../../helpers/get-highlight-states";

interface HighlightListProps {
  highlightStates: HighlightState[];
}

/** The playing chapter's key phrases — ticked once passed, lit while on them, hidden until reached. */
export function HighlightList({ highlightStates }: HighlightListProps) {
  return (
    <ul className="flex-1 min-h-0 overflow-y-auto space-y-1.5 mb-3 pr-1">
      {highlightStates
        .filter((h) => h.state !== "future")
        .map((h) => {
          const isPresent = h.state === "present";
          return (
            <m.li
              key={h.phrase}
              initial={{
                opacity: 0,
                y: -18,
                scale: 0.9,
                filter: "blur(8px)",
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
              }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`flex items-start gap-2 text-[12px] md:text-[13px] leading-snug pr-2 py-1.5 transition-colors duration-500 rounded-md ${
                isPresent
                  ? "border-r-[3px] border-amber-400 text-amber-700 dark:text-amber-300 font-bold bg-amber-400/10"
                  : "text-foreground/50"
              }`}
            >
              {isPresent ? (
                <m.span
                  aria-hidden
                  className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5"
                  animate={{
                    scale: [1, 1.6, 1],
                    opacity: [1, 0.4, 1],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ) : (
                <span
                  aria-hidden
                  className="inline-block text-amber-500/70 shrink-0 mt-0.5 text-xs"
                >
                  ✓
                </span>
              )}
              <span className={isPresent ? "" : "line-through decoration-foreground/20"}>
                {isPresent ? `«${stripTashkeel(h.phrase)}»` : stripTashkeel(h.phrase)}
              </span>
            </m.li>
          );
        })}
    </ul>
  );
}
