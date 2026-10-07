import { m } from "framer-motion";

interface TranscriptWordsProps {
  words: string[];
  activeWordIdx: number;
  isPlaying: boolean;
  highlightIndices: Set<number>;
}

/** The chapter's words, one span each, lit as the audio reaches them. */
export function TranscriptWords({ words, activeWordIdx, isPlaying, highlightIndices }: TranscriptWordsProps) {
  return (
    <p
      className="text-base md:text-lg leading-loose text-foreground/90 font-medium"
      dir="rtl"
    >
      {words.map((w, i) => {
        const isActive = i === activeWordIdx && isPlaying;
        const isPassed = i < activeWordIdx;
        const isHighlight = highlightIndices.has(i);
        let cls = "inline-block transition-all duration-200 ";
        if (isActive) {
          cls +=
            "bg-gradient-to-r from-amber-300 to-amber-400 dark:from-amber-500/50 dark:to-amber-400/50 text-foreground rounded-md px-1 shadow-sm";
        } else if (isHighlight) {
          cls +=
            "font-extrabold text-amber-700 dark:text-amber-400 underline decoration-amber-500/40 decoration-2 underline-offset-4";
        } else if (isPassed) {
          cls += "text-foreground/50";
        } else {
          cls += "text-foreground/95";
        }
        return (
          <m.span
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.25,
              delay: 0.1 + Math.min(i, 30) * 0.012,
              ease: "easeOut",
            }}
            className={cls}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </m.span>
        );
      })}
    </p>
  );
}
