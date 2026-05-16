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

/**
 * Cinematic visual for section 18 — مدونتي ٢٠٣٠.
 * Stage: Vision 2030 mark (right) ⇄ Modonty logo (left) with a glowing bridge.
 * Reactive cues:
 *  - «٢٠٣٠» said → 2030 number pulses gold
 *  - «منشآت / مليون» said → SME counter (1.7M) animates in
 *  - «منظومة / بنيان» said → bridge glows + Modonty halo
 */
function Vision2030SpotlightImpl({
  activeWord = "",
  isPlaying,
  words = [],
  activeWordIdx = -1,
}: Props) {
  const has2030 = /٢٠٣٠|2030|الرُّؤْيَة|الرؤية/.test(activeWord);
  const hasSME = /مُنْشَأَة|منشأة|مَلْيُون|مليون|سُّعُودِيَّة|السعودية/.test(activeWord);
  const hasBridge = /بُنْيَان|بنيان|مَنْظُومَة|منظومة|تَمَاشٍ|تماشي|لَبِنَة|لبنة|طُوبَة|طوبة/.test(activeWord);

  const phrases = useMemo(() => splitIntoPhrases(words), [words]);
  const activePhrase = useMemo(() => {
    if (activeWordIdx < 0 || !phrases.length) return null;
    return phrases.find((p) => activeWordIdx >= p.start && activeWordIdx <= p.end);
  }, [phrases, activeWordIdx]);

  return (
    <div className="relative w-full h-full flex flex-col items-stretch justify-start gap-3 select-none py-2">
      {/* STAGE — Vision 2030 mark + bridge + Modonty logo */}
      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto w-full flex-[7] min-h-[200px] overflow-hidden rounded-2xl bg-gradient-to-b from-emerald-950/30 via-transparent to-amber-950/15"
      >
        {/* Background — Saudi-themed radial glows */}
        <m.div
          aria-hidden
          className="absolute inset-0 -z-10"
          animate={{
            background: hasBridge
              ? "radial-gradient(ellipse at 50% 60%, rgba(6,108,53,0.30), transparent 65%), radial-gradient(ellipse at 50% 60%, rgba(251,191,36,0.20), transparent 70%)"
              : "radial-gradient(ellipse at 50% 60%, rgba(6,108,53,0.15), transparent 70%), radial-gradient(ellipse at 50% 60%, rgba(251,191,36,0.08), transparent 75%)",
          }}
          transition={{ duration: 0.6 }}
        />

        <div className="relative w-full h-full flex items-center justify-around gap-2 px-3">
          {/* RIGHT (RTL natural first read) — Vision 2030 mark */}
          <m.div
            className="relative flex flex-col items-center gap-1.5"
            animate={{ scale: has2030 ? [1, 1.06, 1] : 1 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            <div className="relative w-28 h-28 md:w-32 md:h-32">
              <m.div
                className="relative w-full h-full"
                animate={{
                  filter: has2030
                    ? "drop-shadow(0 0 18px rgba(6,108,53,0.6))"
                    : "drop-shadow(0 0 6px rgba(6,108,53,0.2))",
                }}
                transition={{ duration: 0.6 }}
              >
                <Image
                  src="/vision-2030-logo.png"
                  alt="رؤية المملكة 2030"
                  fill
                  sizes="(max-width: 768px) 112px, 128px"
                  priority
                  className="object-contain"
                />
              </m.div>
              <AnimatePresence>
                {hasSME && (
                  <m.div
                    key="sme-badge"
                    initial={{ opacity: 0, y: 8, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-600/95 text-white text-[9px] font-extrabold whitespace-nowrap shadow-md"
                  >
                    ١.٧ مليون منشأة
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </m.div>

          {/* CENTER — connecting bridge (animations pause when audio not playing — saves GPU) */}
          <div className="relative flex-1 h-1 max-w-[80px] mx-1">
            <m.div
              className="absolute inset-y-0 right-0 left-0 rounded-full bg-gradient-to-l from-amber-400 via-emerald-500 to-emerald-600"
              animate={{
                opacity: hasBridge && isPlaying ? [0.6, 1, 0.6] : 0.5,
                boxShadow: hasBridge
                  ? "0 0 18px rgba(251,191,36,0.6), 0 0 28px rgba(6,108,53,0.4)"
                  : "0 0 6px rgba(6,108,53,0.2)",
              }}
              transition={{ duration: 1.2, repeat: hasBridge && isPlaying ? Infinity : 0, ease: "easeInOut" }}
            />
            <AnimatePresence>
              {hasBridge && isPlaying && (
                <m.div
                  key="bridge-pulse"
                  className="absolute inset-y-0 left-0 w-3 h-3 -my-1 rounded-full bg-amber-400 shadow-lg shadow-amber-400/60"
                  initial={{ x: "100%" }}
                  animate={{ x: "-100%" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* LEFT — Modonty logo */}
          <m.div
            className="relative flex flex-col items-center gap-1.5"
            animate={{
              scale: hasBridge ? [1, 1.06, 1] : 1,
              filter: hasBridge
                ? "drop-shadow(0 0 16px rgba(48,48,255,0.55))"
                : isPlaying
                  ? "drop-shadow(0 0 6px rgba(48,48,255,0.2))"
                  : "none",
            }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            <div className="relative w-24 h-24 md:w-28 md:h-28">
              <Image
                src={MODONTY_LOGO_URL}
                alt="مُدَوَّنَتِي"
                fill
                sizes="(max-width: 768px) 96px, 112px"
                priority
                className="object-contain"
                style={{ transform: "scale(1.65)" }}
              />
            </div>
            <p className="text-[10px] font-extrabold text-primary/90 tracking-widest mt-2">
              مدونتي
            </p>
          </m.div>
        </div>
      </m.div>

      {/* SUBTITLE — synchronized phrases */}
      <div
        className="relative mx-auto w-full flex-[3] min-h-[70px] flex items-center justify-center px-4 rounded-xl bg-gradient-to-b from-emerald-50/30 to-transparent dark:from-emerald-950/15"
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
              className="text-center text-base md:text-lg lg:text-xl font-semibold leading-snug text-foreground"
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
              نساهم في رؤية المملكة ٢٠٣٠
            </m.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export const Vision2030Spotlight = memo(Vision2030SpotlightImpl);
Vision2030Spotlight.displayName = "Vision2030Spotlight";
