"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogoSpotlight } from "./LogoSpotlight";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  Volume2,
  Gauge,
  RotateCcw,
  Square,
} from "lucide-react";

interface ManifestSection {
  id: string;
  label: string;
  text: string;
  wordCount: number;
  /** Optional substring(s) of `text` to render with visual highlight (amber/bold). Can be one phrase or several. */
  highlight?: string | string[];
  /** When true, section is NOT part of the main sales flow — rendered as a chip button in the header. Auto-advance/next/prev skip it. */
  optional?: boolean;
  /** Optional emoji to show on the chip button when section is optional */
  chipEmoji?: string;
  /** ElevenLabs mode only — MP3 filename */
  file?: string;
  sizeKB?: number;
  /** Optional rich media that replaces/augments the karaoke view for this section */
  media?: "logo-spotlight";
}

interface ManifestCategory {
  label: string;
  emoji?: string;
  sectionIds: string[];
}

interface Manifest {
  voice: string;
  categories?: ManifestCategory[];
  sections: ManifestSection[];
}

const SPEED_OPTIONS = [0.75, 1, 1.25] as const;
const TASHKEEL_REGEX = /[\u064B-\u0652\u0670\u0656-\u065F]/g;
const stripTashkeel = (s: string) => s.replace(TASHKEEL_REGEX, "");

interface Props {
  open: boolean;
  onClose: () => void;
  /** elevenlabs = play pre-generated MP3; browser-tts = live Web Speech API */
  mode: "elevenlabs" | "browser-tts";
  manifestUrl: string;
  /** required when mode === "elevenlabs" — base path where MP3 files live */
  audioBase?: string;
}

export function SalesPitchOverlay({
  open,
  onClose,
  mode,
  manifestUrl,
  audioBase,
}: Props) {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState<(typeof SPEED_OPTIONS)[number]>(1);
  const [volume, setVolume] = useState(1);
  const [ttsActiveWordIdx, setTtsActiveWordIdx] = useState(-1);
  const [autoplay, setAutoplay] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const ttsStartTimeRef = useRef<number>(0);
  /** Mirror autoplay state in a ref so closure-captured onEnd handlers see the current value. */
  const autoplayRef = useRef(autoplay);
  useEffect(() => {
    autoplayRef.current = autoplay;
  }, [autoplay]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const isDev = process.env.NODE_ENV === "development";

  const loadManifest = useCallback(
    async (bustCache = false) => {
      if (bustCache) setIsRefreshing(true);
      try {
        const url = bustCache ? `${manifestUrl}?t=${Date.now()}` : manifestUrl;
        const r = await fetch(url, bustCache ? { cache: "no-store" } : undefined);
        const m: Manifest = await r.json();
        setManifest(m);
      } catch {
        setManifest(null);
      } finally {
        if (bustCache) setIsRefreshing(false);
      }
    },
    [manifestUrl],
  );

  // Load manifest once on mount / when URL changes
  useEffect(() => {
    loadManifest();
  }, [loadManifest]);


  // Reset playback when overlay closes — covers both modes
  useEffect(() => {
    if (!open) {
      if (audioRef.current) audioRef.current.pause();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      setTtsActiveWordIdx(-1);
    }
  }, [open]);

  // Apply speed + volume to audio element (elevenlabs mode)
  useEffect(() => {
    if (mode === "elevenlabs" && audioRef.current) {
      audioRef.current.playbackRate = speed;
      audioRef.current.volume = volume;
    }
  }, [speed, volume, mode]);

  // ESC closes overlay + Space toggles play
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isPlaying, currentIdx, manifest, mode]);

  const currentSection = manifest?.sections[currentIdx];

  // Core sections = mandatory flow. Optional = chips in header.
  const coreSections = useMemo(
    () => manifest?.sections.filter((s) => !s.optional) ?? [],
    [manifest],
  );
  const optionalSections = useMemo(
    () => manifest?.sections.filter((s) => !!s.optional) ?? [],
    [manifest],
  );
  const corePositionLabel = useMemo(() => {
    if (!manifest || !currentSection) return "";
    if (currentSection.optional) return "اختياري";
    const corePos = coreSections.findIndex((s) => s.id === currentSection.id);
    return `${corePos + 1} من ${coreSections.length}`;
  }, [manifest, currentSection, coreSections]);

  const findNextCoreIdx = useCallback(
    (fromIdx: number) => {
      if (!manifest) return -1;
      for (let i = fromIdx + 1; i < manifest.sections.length; i++) {
        if (!manifest.sections[i].optional) return i;
      }
      return -1;
    },
    [manifest],
  );

  const findPrevCoreIdx = useCallback(
    (fromIdx: number) => {
      if (!manifest) return -1;
      for (let i = fromIdx - 1; i >= 0; i--) {
        if (!manifest.sections[i].optional) return i;
      }
      return -1;
    },
    [manifest],
  );

  const words = useMemo(() => {
    if (!currentSection?.text) return [];
    return stripTashkeel(currentSection.text).split(/\s+/).filter(Boolean);
  }, [currentSection?.text]);

  // Indices of words that belong to ANY highlight phrase — rendered with amber/bold
  const highlightIndices = useMemo(() => {
    const indices = new Set<number>();
    const raw = currentSection?.highlight;
    if (!raw) return indices;
    const phrases = Array.isArray(raw) ? raw : [raw];
    // Strip Arabic + Latin punctuation so "مستأجرة" matches "مستأجرة."
    const stripPunct = (s: string) =>
      s.replace(/[.,!?؟،؛:«»""—\-…()\[\]{}]/g, "");
    const norm = (s: string) => stripPunct(stripTashkeel(s));
    const normalizedWords = words.map(norm);
    for (const phrase of phrases) {
      const hl = norm(phrase).split(/\s+/).filter(Boolean);
      if (!hl.length || hl.length > normalizedWords.length) continue;
      for (let i = 0; i <= normalizedWords.length - hl.length; i++) {
        let match = true;
        for (let j = 0; j < hl.length; j++) {
          if (normalizedWords[i + j] !== hl[j]) {
            match = false;
            break;
          }
        }
        if (match) {
          for (let j = 0; j < hl.length; j++) indices.add(i + j);
          break; // first occurrence per phrase
        }
      }
    }
    return indices;
  }, [currentSection?.highlight, words]);

  // Active word index: elevenlabs uses time-based estimate; browser-tts uses boundary events
  const audioActiveWordIdx = useMemo(() => {
    if (!duration || !words.length) return -1;
    const progress = currentTime / duration;
    return Math.min(words.length - 1, Math.floor(progress * words.length));
  }, [currentTime, duration, words.length]);

  const activeWordIdx =
    mode === "elevenlabs" ? audioActiveWordIdx : ttsActiveWordIdx;

  // ── Browser-TTS helpers ──────────────────────────────────────────────────
  const pickArabicVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (typeof window === "undefined" || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    // Prefer Saudi → Egyptian → any Arabic
    return (
      voices.find((v) => v.lang === "ar-SA") ||
      voices.find((v) => v.lang === "ar-EG") ||
      voices.find((v) => v.lang.startsWith("ar")) ||
      null
    );
  }, []);

  const playBrowserTTS = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const plain = stripTashkeel(text).trim();
      const u = new SpeechSynthesisUtterance(plain);
      const voice = pickArabicVoice();
      if (voice) u.voice = voice;
      u.lang = voice?.lang || "ar-SA";
      u.rate = speed;
      u.volume = volume;
      u.pitch = 1;

      // Estimate duration (~15 chars/sec at rate 1) — used for progress bar fallback
      const estDuration = (plain.length / 15) * (1 / speed);
      setDuration(estDuration);
      setCurrentTime(0);
      ttsStartTimeRef.current = Date.now();

      // Word boundary → active word
      u.onboundary = (event) => {
        if (event.name !== "word") return;
        const charIdx = event.charIndex;
        // Count words ending at or before charIdx
        const wordsBefore = plain
          .slice(0, charIdx)
          .split(/\s+/)
          .filter(Boolean).length;
        setTtsActiveWordIdx(wordsBefore);
        // Update progress estimate
        setCurrentTime((Date.now() - ttsStartTimeRef.current) / 1000);
      };

      u.onend = () => {
        setIsPlaying(false);
        setTtsActiveWordIdx(-1);
        // Auto-advance only if autoplay enabled. Skip optional sections.
        const nextCore = findNextCoreIdx(currentIdx);
        if (autoplayRef.current && manifest && nextCore >= 0) {
          setCurrentIdx(nextCore);
          setTimeout(() => {
            const next = manifest.sections[nextCore];
            if (next) {
              setIsPlaying(true);
              playBrowserTTS(next.text);
            }
          }, 300);
        }
      };

      u.onerror = () => {
        setIsPlaying(false);
      };

      ttsUtteranceRef.current = u;
      window.speechSynthesis.speak(u);
      setIsPlaying(true);
    },
    [speed, volume, pickArabicVoice, manifest, currentIdx],
  );

  // ── Universal controls ──────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    if (!currentSection) return;
    if (mode === "elevenlabs") {
      const audio = audioRef.current;
      if (!audio) return;
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        const wanted = `${audioBase}/${currentSection.file}`;
        if (audio.src !== new URL(wanted, window.location.origin).href) {
          audio.src = wanted;
        }
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    } else {
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } else if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        playBrowserTTS(currentSection.text);
      }
    }
  }, [isPlaying, currentSection, mode, audioBase, playBrowserTTS]);

  const handleSectionClick = useCallback(
    (idx: number) => {
      if (!manifest) return;
      setCurrentIdx(idx);
      setTtsActiveWordIdx(-1);
      setCurrentTime(0);
      const sec = manifest.sections[idx];
      if (mode === "elevenlabs") {
        const audio = audioRef.current;
        if (!audio || !sec.file) return;
        audio.src = `${audioBase}/${sec.file}`;
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      } else {
        playBrowserTTS(sec.text);
      }
    },
    [manifest, mode, audioBase, playBrowserTTS],
  );

  const handlePrev = useCallback(() => {
    const prev = findPrevCoreIdx(currentIdx);
    if (prev >= 0) handleSectionClick(prev);
  }, [currentIdx, handleSectionClick, findPrevCoreIdx]);

  const handleNext = useCallback(() => {
    const next = findNextCoreIdx(currentIdx);
    if (next >= 0) handleSectionClick(next);
  }, [currentIdx, handleSectionClick, findNextCoreIdx]);

  /** Full stop — cancels playback and resets state. Different from pause. */
  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setTtsActiveWordIdx(-1);
  }, []);

  const handleRestart = useCallback(() => {
    if (mode === "elevenlabs") {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = 0;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else if (currentSection) {
      playBrowserTTS(currentSection.text);
    }
  }, [mode, currentSection, playBrowserTTS]);

  const handleSpeedToggle = useCallback(() => {
    const i = SPEED_OPTIONS.indexOf(speed);
    setSpeed(SPEED_OPTIONS[(i + 1) % SPEED_OPTIONS.length]);
  }, [speed]);

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (mode !== "elevenlabs") return;
      const audio = audioRef.current;
      if (!audio) return;
      const newTime = parseFloat(e.target.value);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [mode],
  );

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!manifest || typeof document === "undefined") return null;

  const overlayContent = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden"
          onClick={onClose}
        >
          {/* Premium B2B backdrop — deep navy base + slow-drifting brand gradients */}
          <div className="absolute inset-0 bg-[#0e065a]/95" />
          <motion.div
            aria-hidden
            className="absolute -inset-20 pointer-events-none"
            animate={{
              background: [
                "radial-gradient(circle at 20% 30%, rgba(48,48,255,0.35) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0,216,216,0.25) 0%, transparent 55%)",
                "radial-gradient(circle at 80% 20%, rgba(48,48,255,0.35) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(0,216,216,0.25) 0%, transparent 55%)",
                "radial-gradient(circle at 20% 30%, rgba(48,48,255,0.35) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0,216,216,0.25) 0%, transparent 55%)",
              ],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 backdrop-blur-md" />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 28,
              mass: 0.9,
            }}
            className="relative bg-card text-foreground rounded-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 start-3 z-10 w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Top header — title + autoplay toggle + mode badge */}
            <div className="border-b border-border bg-muted/30 px-4 md:px-6 py-2.5 pt-14 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-[11px] text-muted-foreground font-bold">
                  شرح صوتي لمودونتي — {corePositionLabel}
                </p>
                {optionalSections.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    {optionalSections.map((opt) => {
                      const optIdx = manifest.sections.findIndex(
                        (s) => s.id === opt.id,
                      );
                      const isActive = optIdx === currentIdx;
                      const shortLabel = opt.label
                        .split("—")[0]
                        .replace(/^[٠١٢٣٤٥٦٧٨٩\d.\s]+/, "")
                        .trim();
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSectionClick(optIdx)}
                          className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1.5 rounded-full border transition-colors ${
                            isActive
                              ? "bg-primary/15 border-primary/40 text-primary"
                              : "bg-background border-border text-foreground/85 hover:bg-muted"
                          }`}
                          title={`اختياري — ${stripTashkeel(shortLabel)}`}
                        >
                          {opt.chipEmoji && (
                            <span className="text-[16px] leading-none">
                              {opt.chipEmoji}
                            </span>
                          )}
                          <span>{stripTashkeel(shortLabel)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {mode === "browser-tts" && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold">
                    وضع تجربة — صوت المتصفح
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setAutoplay((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-foreground/80 hover:text-foreground transition-colors group"
                  aria-pressed={autoplay}
                  aria-label="تشغيل تلقائي للمقاطع التالية"
                  title="عند انتهاء المقطع، ينتقل تلقائياً للتالي"
                >
                  <span
                    className={`relative inline-block w-8 h-4 rounded-full transition-colors ${
                      autoplay ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <motion.span
                      className="absolute top-0.5 inline-block w-3 h-3 rounded-full bg-white shadow"
                      animate={{ x: autoplay ? 17 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </span>
                  <span>تشغيل تلقائي</span>
                </button>
                {isDev && (
                  <button
                    type="button"
                    onClick={() => loadManifest(true)}
                    disabled={isRefreshing}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                    aria-label="تحديث النصوص من الـ manifest (وضع التطوير فقط)"
                    title="DEV — يعيد تحميل manifest.json بدون قفل النافذة"
                  >
                    <RotateCcw
                      className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`}
                    />
                    <span>تحديث (dev)</span>
                  </button>
                )}
              </div>
            </div>

            {/* MAIN: 2-column on md+, stacked on mobile */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
              {/* SIDEBAR — sections by category */}
              <aside
                data-pitch-tour="categories"
                className="md:w-72 md:shrink-0 md:border-s border-border bg-muted/20 overflow-y-auto px-3 md:px-4 py-3 max-h-[35vh] md:max-h-none"
              >
                {manifest.categories && manifest.categories.length > 0 ? (
                  <div className="space-y-3">
                    {manifest.categories.map((cat) => (
                      <div key={cat.label}>
                        <p className="text-[10px] font-extrabold text-foreground/70 mb-1.5 flex items-center gap-1 sticky top-0 bg-muted/95 backdrop-blur py-1 -mx-1 px-1 rounded">
                          {cat.emoji && <span>{cat.emoji}</span>}
                          <span>{cat.label}</span>
                        </p>
                        {cat.sectionIds.length === 0 && (
                          <p className="text-[11px] text-muted-foreground/70 italic px-3 py-2 border border-dashed border-border rounded-lg">
                            قريباً…
                          </p>
                        )}
                        <div className="flex flex-col gap-1">
                          {cat.sectionIds.map((sid) => {
                            const idx = manifest.sections.findIndex(
                              (s) => s.id === sid,
                            );
                            if (idx < 0) return null;
                            const sec = manifest.sections[idx];
                            const isActive = idx === currentIdx;
                            return (
                              <button
                                key={sec.id}
                                type="button"
                                onClick={() => handleSectionClick(idx)}
                                className={`text-start text-[12px] md:text-[13px] font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                                  isActive
                                    ? "bg-primary text-primary-foreground shadow-sm font-bold"
                                    : "bg-background hover:bg-muted text-foreground/85 border border-border/50"
                                }`}
                              >
                                <span
                                  className={`text-[10px] font-mono shrink-0 ${
                                    isActive
                                      ? "text-primary-foreground/80"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {sec.id}
                                </span>
                                <span className="truncate">
                                  {stripTashkeel(
                                    sec.label
                                      .split("—")[0]
                                      .replace(/^[٠١٢٣٤٥٦٧٨٩\d.\s]+/, "")
                                      .trim(),
                                  )}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {manifest.sections.map((sec, idx) => {
                      if (sec.optional) return null;
                      const isActive = idx === currentIdx;
                      return (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => handleSectionClick(idx)}
                          className={`text-start text-[12px] md:text-[13px] font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm font-bold"
                              : "bg-background hover:bg-muted text-foreground/85 border border-border/50"
                          }`}
                        >
                          <span
                            className={`text-[10px] font-mono shrink-0 ${
                              isActive
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground"
                            }`}
                          >
                            {sec.id}
                          </span>
                          <span className="truncate">
                            {stripTashkeel(
                              sec.label
                                .split("—")[0]
                                .replace(/^[٠١٢٣٤٥٦٧٨٩\d.\s]+/, "")
                                .trim(),
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </aside>

              {/* MAIN — section title + karaoke text (animated transition per section) */}
              <div
                className={`flex-1 px-5 md:px-8 py-5 md:py-7 min-h-0 ${
                  currentSection?.media === "logo-spotlight"
                    ? "overflow-hidden flex items-center justify-center"
                    : "overflow-y-auto"
                }`}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIdx}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className={
                      currentSection?.media === "logo-spotlight"
                        ? "w-full h-full flex flex-col"
                        : ""
                    }
                  >
                    {currentSection?.media !== "logo-spotlight" && (
                    <motion.h3
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
                      className="text-base md:text-lg font-extrabold text-foreground mb-4 pb-2 border-b border-border"
                    >
                      {currentSection?.label ? stripTashkeel(currentSection.label) : ""}
                    </motion.h3>
                    )}

                    {currentSection?.media === "logo-spotlight" && (
                      <LogoSpotlight
                        activeWord={words[activeWordIdx] ?? ""}
                        isPlaying={isPlaying}
                        words={words}
                        activeWordIdx={activeWordIdx}
                      />
                    )}

                    {currentSection?.media !== "logo-spotlight" && (
                    <p
                      className="text-lg md:text-xl leading-loose text-foreground/90 font-medium"
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
                          <motion.span
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
                          </motion.span>
                        );
                      })}
                    </p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="border-t border-border bg-muted/20 px-4 md:px-6 py-4 space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono w-10 text-end">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  disabled={mode === "browser-tts"}
                  className="flex-1 h-1.5 rounded-full bg-muted accent-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span className="font-mono w-10">{formatTime(duration)}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={findPrevCoreIdx(currentIdx) < 0}
                    className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    aria-label="المقطع السابق"
                  >
                    <SkipForward className="w-4 h-4 rtl:rotate-180" />
                  </button>
                  <div className="relative">
                    {/* Breathing aura — quiet pulse, signals "alive, waiting" */}
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-primary/40"
                      animate={
                        isPlaying
                          ? { scale: [1, 1.45, 1], opacity: [0.6, 0, 0.6] }
                          : { scale: [1, 1.25, 1], opacity: [0.35, 0.08, 0.35] }
                      }
                      transition={{
                        duration: isPlaying ? 1.6 : 2.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <motion.button
                      type="button"
                      onClick={togglePlay}
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      className="relative w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex items-center justify-center"
                      aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ms-0.5" />}
                    </motion.button>
                  </div>
                  <button
                    type="button"
                    onClick={handleStop}
                    data-pitch-tour="stop"
                    disabled={!isPlaying && currentTime === 0 && ttsActiveWordIdx === -1}
                    className="w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    aria-label="إيقاف نهائي"
                    title="إيقاف وإعادة تعيين"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={findNextCoreIdx(currentIdx) < 0}
                    className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    aria-label="المقطع التالي"
                  >
                    <SkipBack className="w-4 h-4 rtl:rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center transition-colors ms-1"
                    aria-label="إعادة من البداية"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSpeedToggle}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-muted hover:bg-muted/70 text-xs font-bold transition-colors"
                    aria-label="تغيير السرعة"
                  >
                    <Gauge className="w-3.5 h-3.5" />
                    {speed}×
                  </button>
                  <div className="hidden md:flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-20 h-1 rounded-full bg-muted accent-primary cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {isPlaying && (
                <div className="flex items-center justify-center gap-1 pt-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className="block w-0.5 bg-primary rounded-full"
                      style={{
                        height: "10px",
                        animation: `pitch-eq 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {mode === "elevenlabs" && (
              <audio
                ref={audioRef}
                preload="auto"
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onEnded={() => {
                  const nextCore = findNextCoreIdx(currentIdx);
                  if (autoplay && nextCore >= 0) {
                    handleSectionClick(nextCore);
                  } else {
                    setIsPlaying(false);
                  }
                }}
              />
            )}

            <style jsx>{`
              @keyframes pitch-eq {
                from { transform: scaleY(0.4); }
                to { transform: scaleY(2.2); }
              }
            `}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(overlayContent, document.body);
}
