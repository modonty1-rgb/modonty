"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LegalEntityDisplay } from "@/lib/seo/to-legal-entity-display";
import { LazyMotion, domAnimation, m, AnimatePresence, useReducedMotion } from "framer-motion";
import { IconPlay, IconPause, IconSkipBack, IconSkipForward, IconVolume2, IconSpeed, IconReplay, IconStop, IconEmail, IconChevronDown } from "@/lib/icons";
import { LogoSpotlight } from "../logo-spotlight/LogoSpotlight";
import { Vision2030Spotlight } from "../vision-2030-spotlight/Vision2030Spotlight";
import { TeamCarousel } from "../team-carousel/TeamCarousel";
import { TestimonialPlayer } from "../testimonial-player/TestimonialPlayer";
import { PartnersShowcase } from "../partners-showcase/PartnersShowcase";
import { WhatsAppIcon } from "../whatsapp-icon/WhatsAppIcon";
import { VisionMenuButton } from "../vision-menu-button/VisionMenuButton";
import { OptionalSectionsList } from "../optional-sections-list/OptionalSectionsList";
import { MenuSkeleton } from "../menu-skeleton/MenuSkeleton";
import { FounderOfferButton } from "../founder-offer-button/FounderOfferButton";
import { PlayerBadges } from "../player-badges/PlayerBadges";
import { TranscriptDialog } from "../transcript-dialog/TranscriptDialog";
import { TranscriptWords } from "../transcript-words/TranscriptWords";
import { SalesContactLinks } from "../sales-contact-links/SalesContactLinks";
import { TrustStrip } from "../trust-strip/TrustStrip";
import { NowPlayingGlyph } from "../now-playing-glyph/NowPlayingGlyph";
import { HighlightList } from "../highlight-list/HighlightList";
import { stripTashkeel } from "../../helpers/strip-tashkeel";
import { salesWhatsappUrl } from "../../helpers/sales-whatsapp-url";
import { SALES_EMAIL, SALES_EMAIL_URL, SALES_WHATSAPP_DISPLAY } from "../../helpers/sales-contacts";
import { formatTime } from "../../helpers/format-time";
import { getHighlightIndices } from "../../helpers/get-highlight-indices";
import { getHighlightStates } from "../../helpers/get-highlight-states";
import type { Manifest, ManifestSection } from "../../helpers/manifest-types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PARTNER_SIGNUP_URL } from "@/constants";
import { formatCounted, type CountedForms } from "@modonty/shared/lib/commercial/arabic-count";
import type { StoryOffer } from "../../helpers/get-story-offer";

const SPEED_OPTIONS = [0.75, 1, 1.25] as const;

const HIDDEN_FROM_MENU = new Set<string>(["18", "20"]);

export interface SalesPitchProps {
  manifestUrl: string;
  audioBase: string;
  /** Read from Settings by the server page — the trust strip below renders it as-is. */
  legal: LegalEntityDisplay;
  /**
   * اسم الموقع من `Settings.siteName`، يُمرَّر من صفحة السيرفر — فلا يقرأ هذا المكوّن
   * العميل ثابتاً من الكود ولا يضرب القاعدة. غيابه يعني عموداً فارغاً، لا اسماً قديماً.
   */
  siteName?: string;
  /** العرض وعدد الباقات من كتالوج البيع (`helpers/story-offer.ts`) — لا أرقام في هذا الملفّ. */
  offer: StoryOffer;
}

const arabicDigits = new Intl.NumberFormat("ar-SA");
/** «٤ باقات شفافة» بتصريفٍ صحيح لأي عدد (arabic-count.ts). */
const PLANS_COUNTED: CountedForms = {
  one: "باقة شفافة",
  two: "باقتان شفافتان",
  few: "باقات شفافة",
  many: "باقةً شفافة",
};

export function SalesPitchPage({ manifestUrl, audioBase, legal, siteName, offer }: SalesPitchProps) {
  /**
   * أرقام العرض والباقات تأتي من القاعدة؛ وغيابها يُقال بجملةٍ بلا رقم، لا برقمٍ قديم.
   * ٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد.
   */
  const offerHook = offer.annualOffer
    ? `ادفع ${arabicDigits.format(offer.annualOffer.paidMonths)} احصل على ${arabicDigits.format(offer.annualOffer.totalMonths)}`
    : null;
  const offerAria = offer.annualOffer
    ? `عرض المؤسسين: ادفع ${arabicDigits.format(offer.annualOffer.paidMonths)} شهراً واحصل على ${arabicDigits.format(offer.annualOffer.totalMonths)} — انتقل لخطوتك الأولى مع البنيان`
    : "عرض المؤسسين — انتقل لخطوتك الأولى مع البنيان";
  const plansLine = offer.planCount ? formatCounted(offer.planCount, PLANS_COUNTED) : "باقات شفافة";
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
  const tvRef = useRef<HTMLDivElement | null>(null);
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

  const highlightIndices = useMemo(
    () => getHighlightIndices(currentSection?.highlight, words),
    [currentSection?.highlight, words],
  );

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

  const highlightStates = useMemo(
    () => getHighlightStates(allHighlights, words, activeWordIdx),
    [allHighlights, activeWordIdx, words],
  );

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

  // Space key toggles play/pause (standard audio/video player UX)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== " ") return;
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          target.isContentEditable
        ) {
          return;
        }
      }
      if (!currentSection?.file) return;
      e.preventDefault();
      togglePlay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, currentSection]);

  // On a phone the chapter list sits BELOW the player (see the `max-md:order-*` note on the
  // columns), so tapping a chapter starts audio a full screen away from the screen showing
  // its words. Bring the player back under the reader's thumb. Phones only — at `md` the
  // three columns are side by side and nothing needs to move.
  //
  // Fired twice on purpose. Both panels swap through `AnimatePresence mode="wait"`, so at the
  // moment of the tap the page is still laid out for the OLD section and a single scroll
  // lands wherever that stale layout put the player — measured 235px past it on an iPhone 12.
  // The first call starts moving immediately so the tap feels answered; the second corrects
  // once the swap has settled (both exits are 0.4–0.5s in this file, so 560ms clears them),
  // and it is a no-op whenever the first call already landed right. `scroll-mt` on the player
  // itself owns the offset that clears the sticky header.
  const scrollPlayerIntoViewOnPhone = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    const behavior = shouldReduceMotion ? "auto" : "smooth";
    const go = () => tvRef.current?.scrollIntoView({ behavior, block: "start" });
    go();
    window.setTimeout(go, 560);
  }, [shouldReduceMotion]);

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
      scrollPlayerIntoViewOnPhone();
      const sec = manifest.sections[idx];
      const audio = audioRef.current;
      if (!audio || !sec.file) return;
      audio.src = `${audioBase}/${sec.file}`;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    },
    [manifest, audioBase, scrollPlayerIntoViewOnPhone],
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
        className={`text-start text-[12px] md:text-[13px] font-medium px-3 py-2 max-md:min-h-11 max-md:items-center rounded-lg transition-all duration-200 flex items-start gap-2 group ${
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
            className={`text-xs font-bold shrink-0 px-1.5 py-0.5 rounded tabular-nums mt-0.5 max-md:mt-0 ${
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
            className="text-xs font-bold shrink-0 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 mt-0.5 max-md:mt-0"
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
        <div className="max-w-[1600px] mx-auto px-3 md:px-4 h-full flex flex-col md:flex-row gap-3 md:gap-4">

          {/* RIGHT COLUMN (RTL natural first read): MENU */}
          {/* On a phone the three columns stack, and DOM order put the chapter list first:
              the reader landed on a menu, and the page's own title + play button sat at
              1205px — two screens down (measured 22 Aug, iPhone 12). `max-md:order-*` flips
              the stack to hero → player → chapters and stops applying at `md`, where the row
              keeps its DOM order untouched. */}
          <aside
            className="w-full md:w-64 lg:w-72 md:shrink-0 bg-card rounded-2xl shadow-lg ring-1 ring-border/60 overflow-hidden md:h-full flex flex-col max-md:order-3"
            dir="rtl"
            aria-label="قائمة الأقسام"
          >
            {/* HEADER */}
            <div className="px-3 md:px-4 py-2.5 border-b border-border/40 bg-gradient-to-b from-muted/40 to-card shrink-0">
              {visionSectionIdx >= 0 && (
                <VisionMenuButton onClick={() => handleSectionClick(visionSectionIdx)} />
              )}
            </div>

            {/* BODY (scrollable — shadcn ScrollArea) */}
            <ScrollArea className="flex-1 min-h-0" dir="rtl">
              <div className="px-3 md:px-4 py-3" dir="rtl">
            {manifest && optionalSections.length > 0 && (
              <OptionalSectionsList
                sections={manifest.sections}
                optionalSections={optionalSections}
                currentIdx={currentIdx}
                onSelect={handleSectionClick}
              />
            )}

            {!manifest && (
              <MenuSkeleton />
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
                        className="w-full flex items-center gap-1.5 px-2 py-1.5 max-md:min-h-11 rounded-md hover:bg-muted/60 active:bg-muted transition-colors group sticky top-0 bg-gradient-to-b from-card to-card/85 backdrop-blur z-10 -mx-2"
                      >
                        {cat.emoji && <span className="text-base shrink-0" aria-hidden>{cat.emoji}</span>}
                        <span className="text-xs uppercase tracking-wider font-extrabold text-foreground/85 flex-1 text-start">
                          {cat.label}
                        </span>
                        {count > 0 && (
                          <span className="text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-full bg-muted text-foreground/65 group-hover:bg-background">
                            {count}
                          </span>
                        )}
                        <IconChevronDown
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
                                <p className="text-xs text-muted-foreground/70 italic px-3 py-2 border border-dashed border-border rounded-lg">
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
              <FounderOfferButton
                onClick={() => handleSectionClick(closingSectionIdx)}
                offerAria={offerAria}
                offerHook={offerHook}
              />
            )}
          </aside>

          {/* CENTER COLUMN: TV */}
          <div
            ref={tvRef}
            className="flex-1 min-w-0 w-full relative bg-gradient-to-b from-card to-card/95 backdrop-blur-sm text-foreground rounded-3xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)] ring-2 ring-foreground/5 overflow-hidden flex flex-col md:h-full min-h-[60vh] max-md:order-2 max-md:scroll-mt-16"
          >
            <div className="border-b border-border bg-muted/30 px-3 md:px-5 py-2 shrink-0">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <PlayerBadges />

              {currentSection?.text && (
                <TranscriptDialog section={currentSection} />
              )}
              <button
                type="button"
                onClick={() => setAutoplay((v) => !v)}
                className="inline-flex items-center gap-1.5 max-md:min-h-11 max-md:px-2 text-xs font-medium text-foreground/80 hover:text-foreground transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded"
                role="switch"
                aria-checked={autoplay}
                aria-label="تشغيل تلقائي للمقاطع التالية"
                title="عند انتهاء المقطع، ينتقل تلقائياً للتالي"
              >
                <span
                  className={`relative inline-block w-8 h-4 rounded-full transition-colors ${
                    autoplay ? "bg-accent" : "bg-muted-foreground/30"
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
                      siteName={siteName}
                    />
                  )}

                  {currentSection?.media === "vision-2030" && (
                    <Vision2030Spotlight
                      activeWord={words[activeWordIdx] ?? ""}
                      isPlaying={isPlaying}
                      words={words}
                      activeWordIdx={activeWordIdx}
                      siteName={siteName}
                    />
                  )}

                  {currentSection?.media === "team" && <TeamCarousel />}

                  {currentSection?.media === "testimonial" && <TestimonialPlayer />}

                  {currentSection?.media === "partners" && <PartnersShowcase />}

                  {!currentSection?.media && (
                    <TranscriptWords
                      words={words}
                      activeWordIdx={activeWordIdx}
                      isPlaying={isPlaying}
                      highlightIndices={highlightIndices}
                    />
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
                    className="flex items-center justify-center gap-2 text-xs font-bold text-primary/90 -mt-1 mb-1"
                  >
                    <m.span
                      aria-hidden
                      className="inline-block w-1.5 h-1.5 rounded-full bg-current"
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
                  // 6px tall is a mouse target, not a thumb one — measured 246×6 on an
                  // iPhone 12. `h-11` gives the range its 44px row; the native track stays
                  // its own thickness, centred, so only the touchable area grows.
                  className="flex-1 h-1.5 max-md:h-11 max-md:bg-transparent rounded-full bg-muted accent-primary cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
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
                    <IconSkipBack className="w-4 h-4 rtl:rotate-180" />
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
                      {isPlaying ? <IconPause className="w-6 h-6" /> : <IconPlay className="w-6 h-6 ms-0.5" />}
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
                    <IconStop className="w-4 h-4 fill-current" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={nextCoreIdx < 0}
                    className="w-11 h-11 rounded-full bg-muted hover:bg-muted/70 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                    aria-label="المقطع التالي"
                  >
                    <IconSkipForward className="w-4 h-4 rtl:rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="w-11 h-11 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center transition-colors ms-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                    aria-label="إعادة من البداية"
                  >
                    <IconReplay className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSpeedToggle}
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 max-md:min-h-11 max-md:min-w-11 rounded-md bg-muted hover:bg-muted/70 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                    aria-label={`تغيير السرعة (الحالية ${speed} مرة)`}
                  >
                    <IconSpeed className="w-3.5 h-3.5" />
                    {speed}×
                  </button>
                  <div className="hidden md:flex items-center gap-1.5">
                    <IconVolume2 className="w-3.5 h-3.5 text-muted-foreground" />
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
                    className="text-xs md:text-xs uppercase tracking-[0.35em] font-bold text-amber-400/90 mb-4"
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
                      className="text-xs text-white/85 hover:text-white transition-colors underline decoration-dotted underline-offset-4 max-md:inline-flex max-md:items-center max-md:min-h-11 max-md:px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 rounded"
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
                      className="text-xs text-white/50 hover:text-white/80 transition-colors max-md:inline-flex max-md:items-center max-md:min-h-11 max-md:px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
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
            className="relative w-full md:w-64 lg:w-80 md:shrink-0 bg-gradient-to-br from-card via-card to-muted/40 rounded-2xl shadow-lg ring-1 ring-border/60 p-5 md:p-6 md:h-full overflow-hidden max-md:order-1"
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
                  {/* The page's one focal point on a phone, now that it is the first thing
                      in the stack — 30px was sized for a third column, not for a 390px
                      screen where nothing competes with it. */}
                  <h1 className="text-3xl max-md:text-[34px] md:text-4xl lg:text-5xl font-extrabold mb-1 leading-[1.05] bg-gradient-to-l from-primary via-foreground to-primary bg-clip-text text-transparent">
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

                  {/* Deliberately NOT scrolled to the player: the hero collapses into the
                      now-playing panel right under the thumb, which is the answer to the
                      tap. A scroll here has to chase a layout that keeps moving while the
                      words stream in — measured 179px past the player — and an unasked-for
                      561px jump reads worse than staying put. */}
                  <m.button
                    type="button"
                    onClick={togglePlay}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="w-full mb-6 inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-extrabold shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                    aria-label="ابدأ الاستماع للقصة الآن"
                  >
                    <IconPlay className="w-5 h-5" fill="currentColor" />
                    <span>ابدأ القصة الآن</span>
                  </m.button>
                  {/* Secondary CTA — outline/ghost (demoted from primary to reduce decision paralysis) */}
                  <a
                    href={PARTNER_SIGNUP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mb-4 flex items-center justify-between gap-2 px-3 py-2.5 max-md:min-h-11 rounded-lg border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                    aria-label="افتح صفحة الباقات في تاب جديد"
                  >
                    <span className="flex flex-col gap-0 min-w-0">
                      <span className="text-[12px] font-bold text-foreground/80 group-hover:text-foreground truncate transition-colors">
                        شوف الباقات
                      </span>
                      <span className="text-xs text-foreground/50 truncate">
                        {plansLine}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className="text-sm text-foreground/40 group-hover:text-primary group-hover:-translate-x-0.5 transition-all shrink-0"
                    >
                      ▸
                    </span>
                  </a>
                  {/* سقط سطر «شريكنا التقني لإدارة الباقات» (٢٣ سبتمبر ٢٠٢٦): كان عن jbrseo، وقد
                      أُوقف والرابط صار pay.modonty.com — فالسطر يَنسب الباقات لجهةٍ ليست هي. */}

                  <SalesContactLinks siteName={siteName} />

                  <TrustStrip legal={legal} siteName={siteName} />

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
                    <span className="text-xs uppercase tracking-[0.2em] font-bold text-amber-500/90">
                      يُعرض الآن
                    </span>
                  </div>

                  <div className="relative mb-4 flex items-center justify-center">
                    <div
                      className="text-[72px] md:text-[88px] lg:text-[104px] font-extrabold leading-none bg-gradient-to-br from-primary via-foreground to-primary/70 bg-clip-text text-transparent select-none"
                      style={{ fontFeatureSettings: '"tnum"' }}
                    >
                      <NowPlayingGlyph
                        section={currentSection}
                        positionMap={positionMap}
                        shouldReduceMotion={shouldReduceMotion}
                        isPlaying={isPlaying}
                      />
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
                    <HighlightList highlightStates={highlightStates} />
                  )}

                  <div className="mt-auto">
                    <div className="pt-3 border-t border-border/40 text-xs text-foreground/60 flex items-center justify-between">
                      <span>{corePositionLabel}</span>
                      <span className="font-mono">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                    <div className="mt-2.5 pt-2.5 border-t border-border/25 flex items-center justify-between gap-2">
                      <p className="text-xs text-foreground/65 truncate">
                        <span className="font-bold text-foreground/85">فريق المبيعات</span>
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={salesWhatsappUrl(siteName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-7 h-7 max-md:w-11 max-md:h-11 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors shadow-sm"
                          aria-label={`واتساب فريق المبيعات — ${SALES_WHATSAPP_DISPLAY}`}
                          title={`واتساب — ${SALES_WHATSAPP_DISPLAY}`}
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={SALES_EMAIL_URL}
                          className="w-7 h-7 max-md:w-11 max-md:h-11 rounded-full bg-foreground/15 hover:bg-foreground/25 text-foreground flex items-center justify-center transition-colors"
                          aria-label={`إيميل فريق المبيعات — ${SALES_EMAIL}`}
                          title={`إيميل — ${SALES_EMAIL}`}
                        >
                          <IconEmail className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </aside>

        </div>
      </article>
    </LazyMotion>
  );
}
