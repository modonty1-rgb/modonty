"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Gauge,
  RotateCcw,
  Square,
  Mail,
  ChevronDown,
  Wallet,
  MapPin,
  ShieldCheck,
} from "lucide-react";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}
import Image from "next/image";
import { LogoSpotlight } from "./LogoSpotlight";
import { Vision2030Spotlight } from "./Vision2030Spotlight";
import { TeamCarousel } from "./TeamCarousel";
import { TestimonialPlayer } from "./TestimonialPlayer";
import { PartnersShowcase } from "./PartnersShowcase";
import { LEGAL_ENTITY } from "./_constants";
import { stripTashkeel } from "./_utils/arabic";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ManifestSection {
  id: string;
  label: string;
  text: string;
  wordCount: number;
  highlight?: string | string[];
  optional?: boolean;
  chipEmoji?: string;
  file?: string;
  sizeKB?: number;
  media?: "logo-spotlight" | "vision-2030" | "team" | "testimonial" | "partners";
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

const HIDDEN_FROM_MENU = new Set<string>(["18", "20"]);

const JBRSEO_PRICING_URL = "https://www.jbrseo.com/pricing";

const SALES_WHATSAPP = process.env.NEXT_PUBLIC_SALES_WHATSAPP || "966541018020";
const SALES_WHATSAPP_DISPLAY =
  process.env.NEXT_PUBLIC_SALES_WHATSAPP_DISPLAY || "+966 54 101 8020";
const SALES_EMAIL = process.env.NEXT_PUBLIC_SALES_EMAIL || "modonty@modonty.com";
const SALES_WHATSAPP_PREFILL =
  "السلام عليكم، شفت قصة مدونتي وعندي سؤال:";
const SALES_WHATSAPP_URL = `https://wa.me/${SALES_WHATSAPP}?text=${encodeURIComponent(SALES_WHATSAPP_PREFILL)}`;
const SALES_EMAIL_URL = `mailto:${SALES_EMAIL}`;

function formatTime(t: number): string {
  const mins = Math.floor(t / 60);
  const secs = Math.floor(t % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export interface SalesPitchProps {
  manifestUrl: string;
  audioBase: string;
}

export function SalesPitchPage({ manifestUrl, audioBase }: SalesPitchProps) {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState<(typeof SPEED_OPTIONS)[number]>(1);
  const [volume, setVolume] = useState(1);
  const [autoplay, setAutoplay] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [nextChapter, setNextChapter] = useState<{
    id: string;
    label: string;
    idx: number;
  } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTimeUpdateRef = useRef(0);

  useEffect(() => {
    if (isPlaying && !hasStarted) setHasStarted(true);
  }, [isPlaying, hasStarted]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    fetch(manifestUrl)
      .then((r) => r.json())
      .then((m: Manifest) => {
        if (!alive) return;
        setManifest(m);
        if (m.categories && m.categories.length > 1) {
          setCollapsedCategories(new Set(m.categories.slice(1).map((c) => c.label)));
        }
        const philosophyIdx = m.sections.findIndex((s) => s.id === "03");
        if (philosophyIdx >= 0) {
          setCurrentIdx(philosophyIdx);
          return;
        }
        const firstVisible = m.sections.findIndex(
          (s) => !s.optional && !HIDDEN_FROM_MENU.has(s.id),
        );
        if (firstVisible >= 0) setCurrentIdx(firstVisible);
      })
      .catch(() => {
        if (alive) setManifest(null);
      });
    return () => {
      alive = false;
    };
  }, [manifestUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
      audioRef.current.volume = volume;
    }
  }, [speed, volume]);

  const currentSection = manifest?.sections[currentIdx];

  useEffect(() => {
    if (!manifest?.categories || !currentSection) return;
    const activeCat = manifest.categories.find((c) => c.sectionIds.includes(currentSection.id));
    if (!activeCat) return;
    setCollapsedCategories((prev) => {
      if (!prev.has(activeCat.label)) return prev;
      const next = new Set(prev);
      next.delete(activeCat.label);
      return next;
    });
  }, [manifest, currentSection]);

  const toggleCategory = useCallback((label: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

  const positionMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!manifest?.categories) return map;
    let pos = 1;
    for (const cat of manifest.categories) {
      for (const sid of cat.sectionIds) {
        if (!HIDDEN_FROM_MENU.has(sid)) {
          map.set(sid, pos++);
        }
      }
    }
    return map;
  }, [manifest]);

  const totalPositions = positionMap.size;

  const closingSectionIdx = useMemo(() => {
    if (!manifest) return -1;
    return manifest.sections.findIndex((s) => s.id === "20");
  }, [manifest]);

  const visionSectionIdx = useMemo(() => {
    if (!manifest) return -1;
    return manifest.sections.findIndex((s) => s.id === "18");
  }, [manifest]);
  const optionalSections = useMemo(
    () => manifest?.sections.filter((s) => !!s.optional) ?? [],
    [manifest],
  );
  const corePositionLabel = useMemo(() => {
    if (!manifest || !currentSection) return "";
    if (currentSection.optional) return "اختياري";
    const pos = positionMap.get(currentSection.id);
    if (!pos) return "";
    return `${pos} من ${totalPositions}`;
  }, [manifest, currentSection, positionMap, totalPositions]);

  const idxByPosition = useCallback(
    (targetPos: number) => {
      if (!manifest) return -1;
      for (const [id, pos] of positionMap.entries()) {
        if (pos === targetPos) {
          return manifest.sections.findIndex((s) => s.id === id);
        }
      }
      return -1;
    },
    [manifest, positionMap],
  );

  const findNextCoreIdx = useCallback(
    (fromIdx: number) => {
      if (!manifest) return -1;
      const currentId = manifest.sections[fromIdx]?.id;
      const currentPos = currentId ? positionMap.get(currentId) : undefined;
      if (currentPos === undefined) return idxByPosition(1);
      return idxByPosition(currentPos + 1);
    },
    [manifest, positionMap, idxByPosition],
  );

  const findPrevCoreIdx = useCallback(
    (fromIdx: number) => {
      if (!manifest) return -1;
      const currentId = manifest.sections[fromIdx]?.id;
      const currentPos = currentId ? positionMap.get(currentId) : undefined;
      if (currentPos === undefined || currentPos <= 1) return -1;
      return idxByPosition(currentPos - 1);
    },
    [manifest, positionMap, idxByPosition],
  );

  const words = useMemo(() => {
    if (!currentSection?.text) return [];
    return stripTashkeel(currentSection.text).split(/\s+/).filter(Boolean);
  }, [currentSection?.text]);

  const highlightIndices = useMemo(() => {
    const indices = new Set<number>();
    const raw = currentSection?.highlight;
    if (!raw) return indices;
    const phrases = Array.isArray(raw) ? raw : [raw];
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
          break;
        }
      }
    }
    return indices;
  }, [currentSection?.highlight, words]);

  const activeWordIdx = useMemo(() => {
    if (!duration || !words.length) return -1;
    const progress = currentTime / duration;
    return Math.min(words.length - 1, Math.floor(progress * words.length));
  }, [currentTime, duration, words.length]);

  const allHighlights = useMemo(() => {
    const raw = currentSection?.highlight;
    if (!raw) return [] as string[];
    return Array.isArray(raw) ? raw : [raw];
  }, [currentSection?.highlight]);

  const highlightStates = useMemo(() => {
    if (!allHighlights.length)
      return [] as { phrase: string; state: "past" | "present" | "future"; startIdx: number }[];
    const stripPunct = (s: string) =>
      s.replace(/[.,!?؟،؛:«»""—\-…()\[\]{}]/g, "");
    const norm = (s: string) => stripPunct(stripTashkeel(s));
    const normalizedWords = words.map(norm);
    const results: { phrase: string; state: "past" | "present" | "future"; startIdx: number }[] = [];
    for (const phrase of allHighlights) {
      const hl = norm(phrase).split(/\s+/).filter(Boolean);
      let startIdx = -1;
      if (hl.length && hl.length <= normalizedWords.length) {
        for (let i = 0; i <= normalizedWords.length - hl.length; i++) {
          let match = true;
          for (let j = 0; j < hl.length; j++) {
            if (normalizedWords[i + j] !== hl[j]) {
              match = false;
              break;
            }
          }
          if (match) {
            startIdx = i;
            break;
          }
        }
      }
      let state: "past" | "present" | "future" = "future";
      if (startIdx >= 0 && activeWordIdx >= 0) {
        if (activeWordIdx >= startIdx + hl.length) state = "past";
        else if (activeWordIdx >= startIdx) state = "present";
      }
      results.push({ phrase, state, startIdx });
    }
    results.sort((a, b) => {
      if (a.startIdx === -1 && b.startIdx === -1) return 0;
      if (a.startIdx === -1) return 1;
      if (b.startIdx === -1) return -1;
      return a.startIdx - b.startIdx;
    });
    return results;
  }, [allHighlights, activeWordIdx, words]);

  const progressPercent = duration ? Math.min(100, (currentTime / duration) * 100) : 0;

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSection?.file) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    const wanted = `${audioBase}/${currentSection.file}`;
    if (audio.src !== new URL(wanted, window.location.origin).href) {
      audio.src = wanted;
    }
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [isPlaying, currentSection, audioBase]);

  const handleSectionClick = useCallback(
    (idx: number) => {
      if (!manifest) return;
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
      setNextChapter(null);
      setCurrentIdx(idx);
      setCurrentTime(0);
      const sec = manifest.sections[idx];
      const audio = audioRef.current;
      if (!audio || !sec.file) return;
      audio.src = `${audioBase}/${sec.file}`;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    },
    [manifest, audioBase],
  );

  const prevCoreIdx = useMemo(() => findPrevCoreIdx(currentIdx), [currentIdx, findPrevCoreIdx]);
  const nextCoreIdx = useMemo(() => findNextCoreIdx(currentIdx), [currentIdx, findNextCoreIdx]);

  const handlePrev = useCallback(() => {
    if (prevCoreIdx >= 0) handleSectionClick(prevCoreIdx);
  }, [prevCoreIdx, handleSectionClick]);

  const handleNext = useCallback(() => {
    if (nextCoreIdx >= 0) handleSectionClick(nextCoreIdx);
  }, [nextCoreIdx, handleSectionClick]);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleRestart = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, []);

  const handleSpeedToggle = useCallback(() => {
    const i = SPEED_OPTIONS.indexOf(speed);
    setSpeed(SPEED_OPTIONS[(i + 1) % SPEED_OPTIONS.length]);
  }, [speed]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);


  const renderSidebarSectionButton = (sec: ManifestSection, idx: number) => {
    const isActive = idx === currentIdx;
    const position = positionMap.get(sec.id);
    const isDraft = !sec.file && !sec.media;
    return (
      <button
        key={sec.id}
        type="button"
        onClick={() => handleSectionClick(idx)}
        className={`text-start text-[12px] md:text-[13px] font-medium px-3 py-2 rounded-lg transition-all duration-200 flex items-start gap-2 group ${
          isActive
            ? "bg-gradient-to-l from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/30 font-bold scale-[1.02]"
            : isDraft
              ? "bg-amber-500/5 hover:bg-amber-500/15 hover:translate-x-[-2px] text-foreground/85 border border-dashed border-amber-500/40 hover:border-amber-500/70"
              : "bg-background/60 hover:bg-card hover:translate-x-[-2px] text-foreground/90 border border-border/40 hover:border-primary/30"
        }`}
        title={isDraft ? "مسوّدة — الصوت قيد التحضير" : undefined}
      >
        {position !== undefined && (
          <span
            className={`text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded tabular-nums mt-0.5 ${
              isActive ? "bg-white/25 text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {position}
          </span>
        )}
        <span className="leading-snug break-words flex-1">
          {stripTashkeel(
            sec.label
              .split("—")[0]
              .replace(/^[٠١٢٣٤٥٦٧٨٩\d.\s]+/, "")
              .trim(),
          )}
        </span>
        {isDraft && (
          <span
            className="text-[9px] font-bold shrink-0 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 mt-0.5"
            aria-label="مسوّدة"
          >
            مسوّدة
          </span>
        )}
      </button>
    );
  };

  return (
    <LazyMotion features={domAnimation}>
      <article className="relative bg-gradient-to-b from-background via-background to-muted/20 md:h-[calc(100dvh-56px)] py-3 md:py-4 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(48,48,255,0.10), transparent 60%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(251,191,36,0.06), transparent 60%)",
          }}
        />
        <div className="max-w-[1600px] mx-auto px-3 md:px-4 h-full">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 h-full">

            {/* RIGHT COLUMN (RTL natural first read): MENU */}
            <aside
              className="w-full md:w-64 lg:w-72 md:shrink-0 bg-card rounded-2xl shadow-lg ring-1 ring-border/60 overflow-hidden md:h-full flex flex-col"
              dir="rtl"
              aria-label="قائمة الأقسام"
            >
              {/* HEADER */}
              <div className="px-3 md:px-4 py-2.5 border-b border-border/40 bg-gradient-to-b from-muted/40 to-card shrink-0">
                {visionSectionIdx >= 0 && (
                  <m.button
                    type="button"
                    onClick={() => handleSectionClick(visionSectionIdx)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="flex w-full items-center justify-center gap-2 px-3 py-2 rounded-full bg-gradient-to-l from-emerald-700/25 via-emerald-600/20 to-amber-500/20 hover:from-emerald-700/40 hover:via-emerald-600/35 hover:to-amber-500/35 border border-emerald-600/40 hover:border-emerald-500/70 shadow-sm shadow-emerald-700/15 hover:shadow-emerald-600/30 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                    aria-label="اسمع: نساهم في رؤية المملكة ٢٠٣٠"
                    title="اضغط للاستماع: مدونتي ٢٠٣٠ — لبنة في الرؤية"
                  >
                    <Image
                      src="/vision-2030-logo.png"
                      alt=""
                      width={26}
                      height={18}
                      className="object-contain"
                      unoptimized
                    />
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 tracking-[0.1em]">
                      نساهم في رؤية المملكة ٢٠٣٠
                    </span>
                    <span
                      aria-hidden
                      className="text-emerald-600 dark:text-emerald-400 text-sm group-hover:translate-x-0.5 transition-transform"
                    >
                      ▸
                    </span>
                  </m.button>
                )}
              </div>

              {/* BODY (scrollable — shadcn ScrollArea) */}
              <ScrollArea className="flex-1 min-h-0" dir="rtl">
                <div className="px-3 md:px-4 py-3" dir="rtl">
              {manifest && optionalSections.length > 0 && (
                <div className="mb-4 pb-4 border-b border-border/40">
                  <div className="flex flex-col gap-1.5">
                    {optionalSections.map((opt) => {
                      const idx = manifest.sections.findIndex((s) => s.id === opt.id);
                      if (idx < 0) return null;
                      const isActive = idx === currentIdx;
                      const shortLabel = opt.label
                        .split("—")[0]
                        .replace(/^[٠١٢٣٤٥٦٧٨٩\d.\s]+/, "")
                        .trim();
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSectionClick(idx)}
                          className={`text-start text-[13px] md:text-[14px] font-medium px-3 py-2.5 rounded-xl transition-all duration-200 flex items-start gap-2.5 group ${
                            isActive
                              ? "bg-gradient-to-l from-amber-400/95 to-amber-500/90 text-amber-950 shadow-md shadow-amber-400/30 font-bold scale-[1.02]"
                              : "bg-amber-400/10 hover:bg-amber-400/20 hover:translate-x-[-2px] text-foreground border border-amber-400/30 hover:border-amber-400/60"
                          }`}
                          title={`اختياري — ${stripTashkeel(shortLabel)}`}
                        >
                          {opt.chipEmoji && (
                            <span className="text-[18px] leading-none shrink-0 mt-0.5">
                              {opt.chipEmoji}
                            </span>
                          )}
                          <span className="leading-snug break-words">{stripTashkeel(shortLabel)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!manifest && (
                <div className="space-y-3" aria-label="جارٍ التحميل" role="status">
                  {[0, 1, 2].map((cat) => (
                    <div key={cat} className="space-y-1.5">
                      <div className="h-3 w-24 rounded bg-muted animate-pulse mb-2" />
                      {[0, 1, 2].map((row) => (
                        <div
                          key={row}
                          className="h-9 rounded-lg bg-muted/60 animate-pulse"
                          style={{ animationDelay: `${(cat * 3 + row) * 60}ms` }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {manifest?.categories && manifest.categories.length > 0 ? (
                <div className="space-y-2">
                  {manifest.categories.map((cat) => {
                    const isCollapsed = collapsedCategories.has(cat.label);
                    const visibleIds = cat.sectionIds.filter((sid) => !HIDDEN_FROM_MENU.has(sid));
                    const count = visibleIds.length;
                    return (
                      <div key={cat.label} className="rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleCategory(cat.label)}
                          aria-expanded={!isCollapsed}
                          aria-controls={`cat-body-${cat.label}`}
                          className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-muted/60 active:bg-muted transition-colors group sticky top-0 bg-gradient-to-b from-card to-card/85 backdrop-blur z-10 -mx-2"
                        >
                          {cat.emoji && <span className="text-base shrink-0" aria-hidden>{cat.emoji}</span>}
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-foreground/85 flex-1 text-start">
                            {cat.label}
                          </span>
                          {count > 0 && (
                            <span className="text-[9px] font-bold tabular-nums px-1.5 py-0.5 rounded-full bg-muted text-foreground/65 group-hover:bg-background">
                              {count}
                            </span>
                          )}
                          <ChevronDown
                            aria-hidden
                            className={`w-3.5 h-3.5 text-foreground/60 shrink-0 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {!isCollapsed && (
                            <m.div
                              id={`cat-body-${cat.label}`}
                              key="body"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-col gap-1 pt-1 pb-1">
                                {cat.sectionIds.length === 0 && (
                                  <p className="text-[11px] text-muted-foreground/70 italic px-3 py-2 border border-dashed border-border rounded-lg">
                                    قريباً…
                                  </p>
                                )}
                                {visibleIds.map((sid) => {
                                  const idx = manifest.sections.findIndex((s) => s.id === sid);
                                  if (idx < 0) return null;
                                  return renderSidebarSectionButton(manifest.sections[idx], idx);
                                })}
                              </div>
                            </m.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {manifest?.sections.map((sec, idx) =>
                    sec.optional || HIDDEN_FROM_MENU.has(sec.id)
                      ? null
                      : renderSidebarSectionButton(sec, idx),
                  )}
                </div>
              )}
                </div>
              </ScrollArea>

              {/* FOOTER CTA — Founder Offer hook + سكشن «خطوتك الأولى» */}
              {closingSectionIdx >= 0 && (
                <div className="px-3 md:px-4 py-3 border-t border-border/40 bg-gradient-to-b from-muted/30 to-card/80 shrink-0">
                  <m.button
                    type="button"
                    onClick={() => handleSectionClick(closingSectionIdx)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative w-full flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl bg-gradient-to-l from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 transition-all shadow-md shadow-amber-500/30 hover:shadow-amber-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 focus-visible:ring-offset-card overflow-hidden"
                    aria-label="عرض المؤسسين: ادفع ١٢ شهراً واحصل على ١٨ — انتقل لخطوتك الأولى مع البنيان"
                  >
                    {/* shine sweep on hover */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-l from-transparent via-white/40 to-transparent"
                    />
                    {/* HOOK STRIP */}
                    <span className="relative flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-amber-950/85">
                      <span aria-hidden>🎁</span>
                      <span>عرض المؤسسين</span>
                      <span aria-hidden className="opacity-60">·</span>
                      <span className="font-extrabold">ادفع ١٢ احصل على ١٨</span>
                    </span>
                    {/* MAIN LINE */}
                    <span className="relative flex items-center gap-1.5 text-[13px] font-extrabold">
                      <span aria-hidden>🚀</span>
                      <span>خطوتك الأولى مع البنيان</span>
                    </span>
                  </m.button>
                </div>
              )}
            </aside>

            {/* CENTER COLUMN: TV */}
            <div className="flex-1 min-w-0 w-full relative bg-gradient-to-b from-card to-card/95 backdrop-blur-sm text-foreground rounded-3xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)] ring-2 ring-foreground/5 overflow-hidden flex flex-col md:h-full min-h-[60vh]">
              <div className="border-b border-border bg-muted/30 px-3 md:px-5 py-2 shrink-0">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-x-3 gap-y-1 text-[10px] md:text-[11px] text-foreground/75 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <span aria-hidden className="text-amber-500">⏱</span>
                      <span>خمس دقائق فقط</span>
                    </span>
                    <span aria-hidden className="text-foreground/30">·</span>
                    <span className="inline-flex items-center gap-1">
                      <span aria-hidden className="text-amber-500">🚫</span>
                      <span>بدون اتصال بيع</span>
                    </span>
                    <span aria-hidden className="hidden md:inline text-foreground/30">·</span>
                    <span className="hidden md:inline-flex items-center gap-1">
                      <span aria-hidden className="text-amber-500">🚫</span>
                      <span>بدون PDF</span>
                    </span>
                    <span aria-hidden className="hidden md:inline text-foreground/30">·</span>
                    <span className="hidden md:inline-flex items-center gap-1">
                      <span aria-hidden className="text-amber-500">👂</span>
                      <span>اسمع · احكم · قرّر</span>
                    </span>
                  </div>

                {currentSection?.text && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-background/40 hover:bg-muted/40 text-[11px] font-bold text-foreground/75 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                        title="اقرأ النص الكامل للمقطع الحالي"
                        aria-label="افتح نص المقطع الحالي"
                      >
                        <span aria-hidden>📄</span>
                        <span>اقرأ النص</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent
                      className="max-w-2xl max-h-[85vh] flex flex-col p-0"
                      dir="rtl"
                    >
                      <DialogHeader className="px-6 pt-6 pb-3 border-b border-border shrink-0">
                        <DialogTitle className="text-base md:text-lg font-extrabold text-foreground text-start">
                          {currentSection?.label ? stripTashkeel(currentSection.label) : "نص المقطع"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 scrollbar-thin">
                        <p
                          className="text-sm md:text-base leading-loose text-foreground/90 select-text"
                          dir="rtl"
                        >
                          {currentSection?.text ? stripTashkeel(currentSection.text) : ""}
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                <button
                  type="button"
                  onClick={() => setAutoplay((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-foreground/80 hover:text-foreground transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded"
                  role="switch"
                  aria-checked={autoplay}
                  aria-label="تشغيل تلقائي للمقاطع التالية"
                  title="عند انتهاء المقطع، ينتقل تلقائياً للتالي"
                >
                  <span
                    className={`relative inline-block w-8 h-4 rounded-full transition-colors ${
                      autoplay ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <m.span
                      className="absolute top-0.5 inline-block w-3 h-3 rounded-full bg-white shadow"
                      animate={{ x: autoplay ? 17 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </span>
                  <span>تشغيل تلقائي</span>
                </button>
                </div>
              </div>

              <div
                className={`flex-1 min-h-0 px-4 md:px-6 py-4 md:py-5 ${
                  currentSection?.media === "logo-spotlight" || currentSection?.media === "vision-2030" || currentSection?.media === "team" || currentSection?.media === "testimonial" || currentSection?.media === "partners"
                    ? "overflow-hidden flex items-center justify-center"
                    : "overflow-y-auto"
                }`}
              >
                <AnimatePresence mode="wait">
                  <m.div
                    key={currentIdx}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className={
                      currentSection?.media === "logo-spotlight" || currentSection?.media === "vision-2030" || currentSection?.media === "team" || currentSection?.media === "testimonial" || currentSection?.media === "partners"
                        ? "w-full h-full flex flex-col"
                        : ""
                    }
                  >
                    {!currentSection?.media && (
                      <m.h2
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
                        className="text-base md:text-lg font-extrabold text-foreground mb-3 pb-2 border-b border-border"
                      >
                        {currentSection?.label ? stripTashkeel(currentSection.label) : ""}
                      </m.h2>
                    )}

                    {/* sr-only heading للـ media sections — screen readers تعرف اسم السكشن */}
                    {currentSection?.media && currentSection.label && (
                      <h2 className="sr-only">{stripTashkeel(currentSection.label)}</h2>
                    )}

                    {currentSection?.media === "logo-spotlight" && (
                      <LogoSpotlight
                        activeWord={words[activeWordIdx] ?? ""}
                        isPlaying={isPlaying}
                        words={words}
                        activeWordIdx={activeWordIdx}
                      />
                    )}

                    {currentSection?.media === "vision-2030" && (
                      <Vision2030Spotlight
                        activeWord={words[activeWordIdx] ?? ""}
                        isPlaying={isPlaying}
                        words={words}
                        activeWordIdx={activeWordIdx}
                      />
                    )}

                    {currentSection?.media === "team" && <TeamCarousel />}

                    {currentSection?.media === "testimonial" && <TestimonialPlayer />}

                    {currentSection?.media === "partners" && <PartnersShowcase />}

                    {!currentSection?.media && (
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
                    )}

                  </m.div>
                </AnimatePresence>
              </div>

              <div className="border-t border-border bg-muted/20 px-3 md:px-5 py-3 space-y-2 shrink-0">
                <AnimatePresence>
                  {!hasStarted && (
                    <m.div
                      key="start-hint"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center justify-center gap-2 text-[11px] font-bold text-primary/90 -mt-1 mb-1"
                    >
                      <m.span
                        aria-hidden
                        className="inline-block w-1.5 h-1.5 rounded-full bg-primary"
                        animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <span>اضغط للبدء</span>
                    </m.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono w-10 text-end">{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeek}
                    className="flex-1 h-1.5 rounded-full bg-muted accent-primary cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                    aria-label="موضع المقطع"
                    aria-valuetext={`${formatTime(currentTime)} من ${formatTime(duration)}`}
                  />
                  <span className="font-mono w-10">{formatTime(duration)}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={prevCoreIdx < 0}
                      className="w-11 h-11 rounded-full bg-muted hover:bg-muted/70 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                      aria-label="المقطع السابق"
                    >
                      <SkipBack className="w-4 h-4 rtl:rotate-180" />
                    </button>
                    <div className="relative">
                      <m.span
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
                      <m.button
                        type="button"
                        onClick={togglePlay}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 22 }}
                        className="relative w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                        aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
                      >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ms-0.5" />}
                      </m.button>
                    </div>
                    <button
                      type="button"
                      onClick={handleStop}
                      disabled={!isPlaying && currentTime === 0}
                      className="w-11 h-11 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                      aria-label="إيقاف نهائي"
                      title="إيقاف وإعادة تعيين"
                    >
                      <Square className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={nextCoreIdx < 0}
                      className="w-11 h-11 rounded-full bg-muted hover:bg-muted/70 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                      aria-label="المقطع التالي"
                    >
                      <SkipForward className="w-4 h-4 rtl:rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRestart}
                      className="w-11 h-11 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center transition-colors ms-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                      aria-label="إعادة من البداية"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSpeedToggle}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-muted hover:bg-muted/70 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                      aria-label={`تغيير السرعة (الحالية ${speed} مرة)`}
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
                        className="w-20 h-1 rounded-full bg-muted accent-primary cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                        aria-label="مستوى الصوت"
                        aria-valuetext={`${Math.round(volume * 100)}٪`}
                      />
                    </div>
                  </div>
                </div>

              </div>

              <audio
                ref={audioRef}
                preload="none"
                onTimeUpdate={(e) => {
                  // throttle to 4Hz (250ms) — saves React reconciliation work
                  const now = performance.now();
                  if (now - lastTimeUpdateRef.current < 250) return;
                  lastTimeUpdateRef.current = now;
                  setCurrentTime(e.currentTarget.currentTime);
                }}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onEnded={() => {
                  const nextCore = findNextCoreIdx(currentIdx);
                  if (autoplay && nextCore >= 0 && manifest) {
                    const next = manifest.sections[nextCore];
                    setIsPlaying(false);
                    setNextChapter({ id: next.id, label: next.label, idx: nextCore });
                    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
                    transitionTimerRef.current = setTimeout(() => {
                      setNextChapter(null);
                      handleSectionClick(nextCore);
                    }, 3200);
                  } else {
                    setIsPlaying(false);
                  }
                }}
              />

              <AnimatePresence>
                {nextChapter && (
                  <m.div
                    key="next-chapter"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 z-30 bg-[#08051f]/98 backdrop-blur-md flex flex-col items-center justify-center px-6"
                    dir="rtl"
                    aria-live="polite"
                  >
                    <m.div
                      aria-hidden
                      className="absolute inset-0 pointer-events-none"
                      animate={{
                        background: [
                          "radial-gradient(ellipse at 50% 50%, rgba(48,48,255,0.25), transparent 60%)",
                          "radial-gradient(ellipse at 50% 50%, rgba(251,191,36,0.18), transparent 65%)",
                          "radial-gradient(ellipse at 50% 50%, rgba(48,48,255,0.25), transparent 60%)",
                        ],
                      }}
                      transition={{ duration: 3.2, ease: "easeInOut" }}
                    />
                    <m.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="text-[11px] md:text-xs uppercase tracking-[0.35em] font-bold text-amber-400/90 mb-4"
                    >
                      الفصل التالي
                    </m.p>
                    <m.div
                      initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="text-[88px] md:text-[120px] lg:text-[150px] font-extrabold leading-none bg-gradient-to-br from-primary via-white to-primary/60 bg-clip-text text-transparent select-none"
                    >
                      {nextChapter.id}
                    </m.div>
                    <m.h3
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="mt-4 text-xl md:text-2xl lg:text-3xl font-bold text-white/95 text-center max-w-2xl"
                    >
                      {stripTashkeel(
                        nextChapter.label
                          .split("—")[0]
                          .replace(/^[٠١٢٣٤٥٦٧٨٩\d.\s]+/, "")
                          .trim(),
                      )}
                    </m.h3>
                    <div className="mt-10 relative w-40 h-[3px] rounded-full bg-white/10 overflow-hidden">
                      <m.div
                        className="absolute inset-y-0 right-0 bg-gradient-to-l from-amber-400 via-amber-300 to-amber-400 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, ease: "linear" }}
                      />
                    </div>
                    <div className="mt-6 flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
                          const target = nextChapter.idx;
                          setNextChapter(null);
                          handleSectionClick(target);
                        }}
                        className="text-[11px] text-white/85 hover:text-white transition-colors underline decoration-dotted underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 rounded"
                        aria-label="ابدأ الفصل التالي الآن"
                      >
                        ابدأ الآن ▸
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (transitionTimerRef.current) {
                            clearTimeout(transitionTimerRef.current);
                            transitionTimerRef.current = null;
                          }
                          setNextChapter(null);
                        }}
                        className="text-[11px] text-white/50 hover:text-white/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
                        aria-label="إلغاء الانتقال التلقائي والبقاء في هذا المقطع"
                      >
                        ابقَ هنا ✕
                      </button>
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </div>

            {/* LEFT COLUMN: Cinematic "Now Playing" panel */}
            <aside
              className="relative w-full md:w-64 lg:w-80 md:shrink-0 bg-gradient-to-br from-card via-card to-muted/40 rounded-2xl shadow-lg ring-1 ring-border/60 p-5 md:p-6 md:h-full overflow-hidden"
              dir="rtl"
              aria-label="معلومات المقطع الحالي"
            >
              <m.div
                aria-hidden
                className="absolute -inset-10 -z-10 opacity-60"
                animate={{
                  background: [
                    "radial-gradient(circle at 20% 20%, rgba(48,48,255,0.18), transparent 50%)",
                    "radial-gradient(circle at 80% 70%, rgba(251,191,36,0.16), transparent 55%)",
                    "radial-gradient(circle at 20% 80%, rgba(48,48,255,0.18), transparent 50%)",
                    "radial-gradient(circle at 80% 20%, rgba(251,191,36,0.16), transparent 55%)",
                    "radial-gradient(circle at 20% 20%, rgba(48,48,255,0.18), transparent 50%)",
                  ],
                }}
                transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
              />

              <AnimatePresence mode="wait">
                {!hasStarted ? (
                  <m.div
                    key="idle"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full flex flex-col justify-center"
                  >
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-1 leading-[1.05] bg-gradient-to-l from-primary via-foreground to-primary bg-clip-text text-transparent">
                      قصة مدونتي
                    </h1>
                    <p className="text-sm md:text-base lg:text-lg text-foreground/55 italic mb-6 leading-snug">
                      البنيان الرقمي للعالم العربي
                    </p>
                    <blockquote className="relative border-r-[4px] border-amber-400 pr-4 mb-5 text-[15px] md:text-base text-foreground/95 leading-relaxed font-medium">
                      <span className="absolute -top-2 -right-2 text-3xl text-amber-400/30 leading-none font-serif select-none" aria-hidden>
                        ❝
                      </span>
                      حياك الله في مدونتي. مشروعك يطلع لعميلك — وأنت مرتاح.
                    </blockquote>

                    <m.button
                      type="button"
                      onClick={togglePlay}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      className="w-full mb-6 inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-extrabold shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                      aria-label="ابدأ الاستماع للقصة الآن"
                    >
                      <Play className="w-5 h-5" fill="currentColor" />
                      <span>ابدأ القصة الآن</span>
                    </m.button>
                    {/* Secondary CTA — outline/ghost (demoted from primary to reduce decision paralysis) */}
                    <a
                      href={JBRSEO_PRICING_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group mb-1 flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                      aria-label="افتح صفحة الباقات على جبر-سيو في تاب جديد"
                    >
                      <span className="flex flex-col gap-0 min-w-0">
                        <span className="text-[12px] font-bold text-foreground/80 group-hover:text-foreground truncate transition-colors">
                          شوف الباقات على جبر-سيو
                        </span>
                        <span className="text-[10px] text-foreground/50 truncate">
                          ٤ باقات شفافة
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className="text-sm text-foreground/40 group-hover:text-primary group-hover:-translate-x-0.5 transition-all shrink-0"
                      >
                        ▸
                      </span>
                    </a>
                    <p className="mb-4 text-[10px] text-foreground/45 italic px-1">
                      شريكنا التقني لإدارة الباقات والاشتراكات
                    </p>

                    {/* Tertiary — compact contact links (no headers, no cards) */}
                    <div className="mb-5 pt-3 border-t border-border/40 space-y-1">
                      <a
                        href={SALES_WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 text-[12px] py-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 rounded"
                        aria-label={`واتساب المبيعات — ${SALES_WHATSAPP_DISPLAY}`}
                      >
                        <WhatsAppIcon className="w-4 h-4 text-emerald-500/80 shrink-0" />
                        <span className="text-foreground/55">واتساب:</span>
                        <span
                          className="font-mono font-bold text-foreground/85 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                          dir="ltr"
                        >
                          {SALES_WHATSAPP_DISPLAY}
                        </span>
                      </a>
                      <a
                        href={SALES_EMAIL_URL}
                        className="group flex items-center gap-2 text-[12px] py-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                        aria-label={`إيميل المبيعات — ${SALES_EMAIL}`}
                      >
                        <Mail className="w-4 h-4 text-foreground/50 shrink-0" />
                        <span className="text-foreground/55">إيميل:</span>
                        <span
                          className="font-medium text-foreground/85 group-hover:text-foreground transition-colors"
                          dir="ltr"
                        >
                          {SALES_EMAIL}
                        </span>
                      </a>
                    </div>

                    {/* COMPACT TRUST STRIP — landmark section + lucide icons + balanced visual weight */}
                    <section
                      aria-label="بيانات الشركة الموثّقة"
                      className="mb-5 pt-3 border-t border-border/30 space-y-1.5"
                    >
                      {/* Row 1: Brand/DBA + verification cluster (نشط badge + تحقّق link) */}
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] leading-snug min-w-0 flex-1">
                          <span className="font-bold text-foreground/95">{LEGAL_ENTITY.brand}</span>
                          <span className="text-foreground/65"> · تحت مظلة {LEGAL_ENTITY.dba}</span>
                        </p>
                        <div className="inline-flex items-center gap-1.5 shrink-0">
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                            <ShieldCheck className="w-3 h-3" aria-hidden />
                            نشط
                          </span>
                          <a
                            href={LEGAL_ENTITY.verifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-primary hover:underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                            aria-label={`ابحث بالرقم ${LEGAL_ENTITY.cr} في وزارة التجارة`}
                          >
                            تحقّق
                            <span aria-hidden> ↗</span>
                          </a>
                        </div>
                      </div>

                      {/* Row 2: Credentials strip — wrap-safe, balanced weight, Latin year for numeric consistency */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]">
                        <span className="inline-flex items-center gap-1">
                          <span className="text-emerald-500" aria-hidden>
                            ✓
                          </span>
                          <span className="text-foreground/65">سجل</span>
                          <span
                            className="font-mono font-bold text-foreground text-[11px] tracking-tight"
                            dir="ltr"
                          >
                            {LEGAL_ENTITY.cr}
                          </span>
                        </span>
                        <span
                          className="inline-flex items-baseline gap-1"
                          aria-label={`رأس المال ثمانية ملايين ${LEGAL_ENTITY.currency}`}
                        >
                          <Wallet className="w-3 h-3 text-amber-600 dark:text-amber-400 self-center" aria-hidden />
                          <span className="text-foreground/65 text-[9px]" aria-hidden>
                            رأس المال
                          </span>
                          <span
                            className="font-mono font-bold text-amber-600 dark:text-amber-400 text-[11px] tracking-tight"
                            dir="ltr"
                            aria-hidden
                          >
                            {LEGAL_ENTITY.capital}
                          </span>
                          <span className="font-bold text-amber-600/85 dark:text-amber-400/85 text-[10px]" aria-hidden>
                            {LEGAL_ENTITY.currency}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-foreground/65">
                          <MapPin className="w-3 h-3" aria-hidden />
                          <span>
                            {LEGAL_ENTITY.city} · {LEGAL_ENTITY.country} · {LEGAL_ENTITY.foundedYear}
                          </span>
                        </span>
                      </div>
                    </section>

                  </m.div>
                ) : (
                  <m.div
                    key={`playing-${currentIdx}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full flex flex-col"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <m.span
                        className="inline-block w-2 h-2 rounded-full bg-amber-400"
                        animate={
                          isPlaying
                            ? { opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }
                            : { opacity: 0.5 }
                        }
                        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-500/90">
                        يُعرض الآن
                      </span>
                    </div>

                    <div className="relative mb-4 flex items-center justify-center">
                      <div
                        className="text-[72px] md:text-[88px] lg:text-[104px] font-extrabold leading-none bg-gradient-to-br from-primary via-foreground to-primary/70 bg-clip-text text-transparent select-none"
                        style={{ fontFeatureSettings: '"tnum"' }}
                      >
                        {(() => {
                          if (!currentSection) return "—";
                          const pos = positionMap.get(currentSection.id);
                          if (pos !== undefined) {
                            return (
                              <m.span
                                key={`pos-${currentSection.id}`}
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                className="inline-block"
                              >
                                {pos}
                              </m.span>
                            );
                          }
                          if (currentSection.media === "logo-spotlight") {
                            const animateProps = shouldReduceMotion
                              ? { rotate: 45, opacity: 1 }
                              : isPlaying
                                ? {
                                    scale: [1, 1.05, 1],
                                    rotate: [45, 48, 45, 42, 45],
                                    opacity: 1,
                                  }
                                : { rotate: 45, opacity: 1 };
                            return (
                              <m.span
                                key="logo-dot"
                                aria-label="نقطة الشعار"
                                className="inline-block align-middle"
                                initial={{ scale: 0.6, rotate: 45, opacity: 0 }}
                                animate={animateProps}
                                transition={
                                  shouldReduceMotion
                                    ? { duration: 0.3 }
                                    : isPlaying
                                      ? {
                                          scale: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
                                          rotate: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
                                          opacity: { duration: 0.4 },
                                        }
                                      : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
                                }
                                style={{
                                  width: "0.68em",
                                  height: "0.68em",
                                  background: "#00D8D8",
                                  boxShadow:
                                    "0 0 42px rgba(0,216,216,0.45), 0 8px 24px rgba(0,180,180,0.3), inset 0 -8px 18px rgba(0,0,0,0.12)",
                                }}
                              />
                            );
                          }
                          return (
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600">
                              {currentSection.chipEmoji ?? "★"}
                            </span>
                          );
                        })()}
                      </div>
                      <svg
                        viewBox="0 0 100 100"
                        className="absolute -top-2 -end-2 w-12 h-12 -rotate-90"
                        aria-hidden
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="44"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="text-muted opacity-30"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="44"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          className="text-primary transition-all duration-300"
                          strokeDasharray={`${2 * Math.PI * 44}`}
                          strokeDashoffset={`${2 * Math.PI * 44 * (1 - progressPercent / 100)}`}
                        />
                      </svg>
                    </div>

                    <h2 className="text-lg md:text-xl lg:text-2xl font-extrabold text-foreground mb-4 leading-snug text-center">
                      {currentSection?.label
                        ? stripTashkeel(currentSection.label.split("—")[0]).trim()
                        : ""}
                    </h2>

                    {highlightStates.length > 0 && (
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
                                    className="inline-block text-amber-500/70 shrink-0 mt-0.5 text-[11px]"
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
                    )}

                    <div className="mt-auto">
                      <div className="pt-3 border-t border-border/40 text-[11px] text-foreground/60 flex items-center justify-between">
                        <span>{corePositionLabel}</span>
                        <span className="font-mono">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>
                      <div className="mt-2.5 pt-2.5 border-t border-border/25 flex items-center justify-between gap-2">
                        <p className="text-[10px] text-foreground/65 truncate">
                          <span className="font-bold text-foreground/85">فريق المبيعات</span>
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={SALES_WHATSAPP_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors shadow-sm"
                            aria-label={`واتساب فريق المبيعات — ${SALES_WHATSAPP_DISPLAY}`}
                            title={`واتساب — ${SALES_WHATSAPP_DISPLAY}`}
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={SALES_EMAIL_URL}
                            className="w-7 h-7 rounded-full bg-foreground/15 hover:bg-foreground/25 text-foreground flex items-center justify-center transition-colors"
                            aria-label={`إيميل فريق المبيعات — ${SALES_EMAIL}`}
                            title={`إيميل — ${SALES_EMAIL}`}
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </aside>

          </div>
        </div>
      </article>
    </LazyMotion>
  );
}
