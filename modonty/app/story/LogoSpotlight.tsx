"use client";

import { m, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { memo, useMemo } from "react";
import { MODONTY_LOGO_URL } from "./_constants";
import { splitIntoPhrases } from "./_utils/phrases";

interface Props {
  activeWord?: string;
  isPlaying: boolean;
  words?: string[];
  activeWordIdx?: number;
}

function LogoSpotlightImpl({
  activeWord = "",
  isPlaying,
  words = [],
  activeWordIdx = -1,
}: Props) {
  const hasPoint = /نقط|بكسل|بِكْسِل|طوب|طُوب|حرف|حَرْف/.test(activeWord);
  const hasLogoWord = /شعار|مدونت|مُدَوَّن|بنيان|بُنْيَان|مرصوص|مَرْصُوص/.test(activeWord);
  const hasThree = /ثلاث|ثَلَاث/.test(activeWord);
  const isFinale = /قصة|قِصَّة|مقال|مَقَال|عميل|عَمِيل/.test(activeWord);

  const phrases = useMemo(() => splitIntoPhrases(words), [words]);

  const activePhrase = useMemo(() => {
    if (activeWordIdx < 0 || !phrases.length) return null;
    return phrases.find((p) => activeWordIdx >= p.start && activeWordIdx <= p.end);
  }, [phrases, activeWordIdx]);

  return (
    <div className="relative w-full h-full flex flex-col items-stretch justify-start gap-2 select-none py-2">
      <m.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto w-full flex-[7] min-h-[180px] overflow-hidden rounded-2xl"
      >
        <m.div
          className="absolute inset-0 -z-10 rounded-[2rem]"
          animate={{
            background: hasLogoWord
              ? "radial-gradient(ellipse at center, rgba(251,191,36,0.42), rgba(0,0,0,0) 65%)"
              : "radial-gradient(ellipse at center, rgba(251,191,36,0.14), rgba(0,0,0,0) 70%)",
            scale: hasLogoWord ? 1.12 : 1,
          }}
          transition={{ duration: 0.5 }}
        />

        <m.div
          className="relative w-full h-full"
          style={{ transformOrigin: "center center", willChange: "transform, filter" }}
          animate={{
            scale: hasPoint ? [1, 1.06, 1] : isPlaying ? [1, 1.018, 1] : 1,
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
            src={MODONTY_LOGO_URL}
            alt="مُدَوَّنَتِي"
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            priority
            className="object-contain"
            style={{ transform: "scale(1.65)" }}
          />
        </m.div>

        <AnimatePresence>
          {hasThree && (
            <m.div
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
            </m.div>
          )}
        </AnimatePresence>
      </m.div>

      <div
        className="relative mx-auto w-full flex-[3] min-h-[70px] flex items-center justify-center px-4 rounded-xl bg-gradient-to-b from-amber-50/40 to-transparent dark:from-amber-950/15"
        dir="rtl"
      >
        <AnimatePresence mode="wait">
          {activePhrase && (
            <m.p
              key={activePhrase.start}
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="text-center text-lg md:text-xl lg:text-2xl font-semibold leading-snug text-foreground"
            >
              {activePhrase.text}
            </m.p>
          )}
          {!activePhrase && (
            <m.p
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center text-sm md:text-base text-foreground/60 italic"
            >
              اضغط تشغيل لتسمع القصة..
            </m.p>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isFinale && (
          <m.div
            key="finale-dots"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-2 z-30 flex gap-3"
          >
            {[0, 1, 2].map((i) => (
              <m.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.18, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
              />
            ))}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const LogoSpotlight = memo(LogoSpotlightImpl);
LogoSpotlight.displayName = "LogoSpotlight";
