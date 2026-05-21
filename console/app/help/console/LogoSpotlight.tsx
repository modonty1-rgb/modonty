"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useMemo } from "react";

const LOGO_URL =
  "https://res.cloudinary.com/dfegnpgwx/image/upload/v1768724691/final-01_fdnhom.svg";

interface Props {
  activeWord?: string;
  isPlaying: boolean;
  /** Full plain (stripped) words array from SalesPitchOverlay */
  words?: string[];
  /** Index of currently-narrated word within `words` */
  activeWordIdx?: number;
}

/** Split a flat word array into phrase chunks based on punctuation */
function splitIntoPhrases(words: string[]): { start: number; end: number; text: string }[] {
  if (!words.length) return [];
  const phrases: { start: number; end: number; text: string }[] = [];
  let chunkStart = 0;
  const TERMINATORS = /[.؟!?،,:؛;]$|\.\.$|\.\.\.$/;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (TERMINATORS.test(w) || i === words.length - 1) {
      const text = words.slice(chunkStart, i + 1).join(" ");
      phrases.push({ start: chunkStart, end: i, text });
      chunkStart = i + 1;
    }
  }
  return phrases;
}

/**
 * Cinematic logo display for section 03 (فلسفة الشعار — النقطة).
 * Reacts to the active word being narrated:
 * - "نقط…" → dot pulses with golden glow
 * - "شعار / مدونتي" → full logo gets warm halo
 * - "ثلاث…" → 3 orbiting micro-dots appear
 * - "قصة / مقال / عميل" → 3 final dots cascade
 */
export function LogoSpotlight({
  activeWord = "",
  isPlaying,
  words = [],
  activeWordIdx = -1,
}: Props) {
  const hasPoint = /نقط|بكسل|بِكْسِل|طوب|طُوب|حرف|حَرْف/.test(activeWord);
  const hasLogoWord = /شعار|مدونت|مُدَوَّن|بنيان|بُنْيَان|مرصوص|مَرْصُوص/.test(activeWord);
  const hasThree = /ثلاث|ثَلَاث/.test(activeWord);
  const isFinale =
    /قصة|قِصَّة|مقال|مَقَال|عميل|عَمِيل/.test(activeWord);

  // Build phrases once when words change
  const phrases = useMemo(() => splitIntoPhrases(words), [words]);

  // Find the active phrase
  const activePhrase = useMemo(() => {
    if (activeWordIdx < 0 || !phrases.length) return null;
    return phrases.find(
      (p) => activeWordIdx >= p.start && activeWordIdx <= p.end,
    );
  }, [phrases, activeWordIdx]);

  return (
    <div className="relative w-full h-full flex flex-col items-stretch justify-start gap-2 select-none py-2">
      {/* LOGO STAGE — fills 70% of vertical space, top-aligned */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto w-full flex-[7] min-h-[180px] overflow-hidden rounded-2xl"
      >
        {/* Warm halo behind logo — pulses with the whole logo when "شعار/مدونتي" is spoken */}
        <motion.div
          className="absolute inset-0 -z-10 rounded-[2rem]"
          animate={{
            background: hasLogoWord
              ? "radial-gradient(ellipse at center, rgba(251,191,36,0.42), rgba(0,0,0,0) 65%)"
              : "radial-gradient(ellipse at center, rgba(251,191,36,0.14), rgba(0,0,0,0) 70%)",
            scale: hasLogoWord ? 1.12 : 1,
          }}
          transition={{ duration: 0.5 }}
        />

        {/* The logo itself — gently breathing while playing; pulses harder when "نقط" is spoken.
            transformOrigin center + willChange prevent layout reflow during animation. */}
        <motion.div
          className="relative w-full h-full"
          style={{ transformOrigin: "center center", willChange: "transform, filter" }}
          animate={{
            scale: hasPoint
              ? [1, 1.06, 1]
              : isPlaying
                ? [1, 1.018, 1]
                : 1,
            filter: hasPoint
              ? "drop-shadow(0 0 22px rgba(251,191,36,0.7))"
              : isPlaying
                ? "drop-shadow(0 0 8px rgba(251,191,36,0.2))"
                : "none",
          }}
          transition={{
            duration: hasPoint ? 0.6 : 4,
            repeat: isPlaying ? Infinity : 0,
            ease: "easeInOut",
          }}
        >
          <Image
            src={LOGO_URL}
            alt="مُدَوَّنَتِي"
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            priority
            className="object-contain"
            style={{ transform: "scale(1.65)" }}
          />
        </motion.div>

        {/* Three orbiting dots — appear when "ثلاثة" is spoken */}
        <AnimatePresence>
          {hasThree && (
            <motion.div
              key="three-dots"
              className="absolute inset-0 pointer-events-none z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 0.4 },
                rotate: { duration: 6, repeat: Infinity, ease: "linear" },
              }}
              style={{ transformOrigin: "50% 50%" }}
            >
              {[0, 120, 240].map((deg) => (
                <div
                  key={deg}
                  className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-amber-400"
                  style={{
                    transform: `rotate(${deg}deg) translateY(-60px)`,
                    boxShadow: "0 0 10px rgba(251,191,36,0.7)",
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      {/* CINEMATIC SUBTITLE — separate row beneath the logo. Takes ~30% of available space. */}
      <div
        className="relative mx-auto w-full flex-[3] min-h-[70px] flex items-center justify-center px-4 rounded-xl bg-gradient-to-b from-amber-50/40 to-transparent dark:from-amber-950/15"
        dir="rtl"
      >
        <AnimatePresence mode="wait">
          {activePhrase && (
            <motion.p
              key={activePhrase.start}
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="text-center text-lg md:text-xl lg:text-2xl font-semibold leading-snug text-foreground"
            >
              {activePhrase.text}
            </motion.p>
          )}
          {!activePhrase && (
            <motion.p
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center text-sm md:text-base text-foreground/60 italic"
            >
              اضغط تشغيل لتسمع القصة..
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Finale: 3 dots cascade — appears INSIDE container, bottom edge */}
      <AnimatePresence>
        {isFinale && (
          <motion.div
            key="finale-dots"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-2 z-30 flex gap-3"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: i * 0.18,
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
