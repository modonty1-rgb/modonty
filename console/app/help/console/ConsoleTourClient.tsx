"use client";

import { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import {
  MousePointerClick,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  PlayCircle,
} from "lucide-react";
import { consoleSimulationStops, type HotspotPriority } from "./tour-config";
import { SalesPitchPlayer } from "./SalesPitchPlayer";

/** Color classes by priority — keep red/amber/blue mapping consistent across dot, halo, and list badge. */
const PRIORITY_CLASSES: Record<
  HotspotPriority,
  { dot: string; halo: string; badge: string; badgeText: string; legend: string }
> = {
  critical: {
    dot: "bg-red-600 text-white",
    halo: "bg-red-500/25",
    badge: "bg-red-100 dark:bg-red-500/20",
    badgeText: "text-red-700 dark:text-red-400",
    legend: "حرج",
  },
  important: {
    dot: "bg-amber-500 text-white",
    halo: "bg-amber-500/25",
    badge: "bg-amber-100 dark:bg-amber-500/20",
    badgeText: "text-amber-700 dark:text-amber-400",
    legend: "مهم",
  },
  optional: {
    dot: "bg-primary text-primary-foreground",
    halo: "bg-primary/20",
    badge: "bg-primary/10",
    badgeText: "text-primary",
    legend: "معلومة",
  },
};

/** Precompute the starting global number per stop so dot numbering is sequential across all 17 stops. */
const STOP_START_NUMBERS: number[] = (() => {
  const starts: number[] = [];
  let cursor = 1;
  for (const stop of consoleSimulationStops) {
    starts.push(cursor);
    cursor += stop.hotspots.length;
  }
  return starts;
})();

function celebrate() {
  const colors = ["#f59e0b", "#fb923c", "#1e58c8", "#10b981"];
  confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors });
  setTimeout(() => {
    confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
    confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
  }, 250);
}

export function ConsoleTourClient() {
  const startTour = useCallback(() => {
    // Build a flat array of every hotspot across every stop
    const steps: Array<{ element: string; popover: { title: string; description: string; side: "top" | "bottom" | "left" | "right"; align: "start" | "center" | "end" } }> = [];

    consoleSimulationStops.forEach((stop) => {
      stop.hotspots.forEach((h) => {
        steps.push({
          element: `#${stop.id}-h${h.n}`,
          popover: {
            title: h.title,
            description: h.description,
            side: "top",
            align: "center",
          },
        });
      });
    });

    if (steps.length === 0) return;

    // Scroll to the first hotspot's stop
    document.getElementById(consoleSimulationStops[0].id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setTimeout(() => {
      const total = steps.length;
      let reachedFinal = false;
      const tour = driver({
        showProgress: true,
        progressText: `{{current}} من ${total}`,
        nextBtnText: "التالي ←",
        prevBtnText: "→ السابق",
        doneBtnText: "خلصنا ✓",
        smoothScroll: true,
        animate: true,
        overlayColor: "#0f172a",
        overlayOpacity: 0.5,
        stagePadding: 6,
        stageRadius: 999, // round spotlight on the small dot
        steps,
        onPopoverRender: (_, { state, config }) => {
          const idx = state.activeIndex ?? 0;
          const totalSteps = (config.steps ?? []).length;
          if (idx === totalSteps - 1) reachedFinal = true;
        },
        onDestroyed: () => {
          if (reachedFinal) celebrate();
        },
      });
      tour.drive();
    }, 600);
  }, []);

  return (
    <div className="min-h-dvh bg-background">
      {/* Fixed top bar — sales-pitch player + start-tour button always reachable */}
      <div className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-background/90 border-b border-border shadow-sm">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-2.5 flex items-center justify-between gap-3">
          <Link
            href="/help"
            className="text-xs md:text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            مركز المساعدة
          </Link>
          <div className="flex items-center gap-2">
            <SalesPitchPlayer
              mode="elevenlabs"
              manifestUrl="/help/audio/sales-pitch/manifest.json"
              audioBase="/help/audio/sales-pitch"
            />
            <button
              type="button"
              onClick={startTour}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs md:text-sm px-4 py-2 rounded-full shadow-md transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
              ابدأ الجولة
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-6 pt-14 py-10 md:py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link href="/help" className="text-muted-foreground hover:text-foreground">
            مركز المساعدة
          </Link>
          <span className="mx-2 text-muted-foreground">›</span>
          <span className="text-foreground font-medium">الجولة التفاعلية</span>
        </nav>

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl p-8 md:p-10 mb-8 overflow-hidden"
        >
          <motion.div
            className="absolute -bottom-20 -start-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <div className="relative">
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Sparkles className="w-3 h-3" />
              تجربة بصرية تفاعلية
            </span>
            <h1 className="text-3xl md:text-4xl font-black leading-tight mb-3">
              <MousePointerClick className="inline w-8 h-8 mb-2 me-1" />
              جولة في الكونسول
            </h1>
            <p className="text-base md:text-lg opacity-95 max-w-2xl leading-relaxed">
              نوريك كل صفحة بصورتها الحقيقية مع نقاط مرقّمة تشرح كل عنصر مهم. اضغط زر «ابدأ الجولة»
              في الأعلى وخلّنا نأخذك في جولة كاملة.
            </p>
          </div>
        </motion.section>

        {/* Stops with hotspots overlaid on screenshots — sequential numbering across all stops */}
        <div className="space-y-7">
          {consoleSimulationStops.map((stop, stopIdx) => {
            const startN = STOP_START_NUMBERS[stopIdx];
            return (
              <motion.section
                key={stop.id}
                id={stop.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.35 }}
                className="scroll-mt-8 bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
              >
                <header className="flex items-center gap-3 px-5 py-3 border-b border-border bg-muted/30">
                  <span className="inline-flex items-center justify-center min-w-[2.25rem] h-9 px-2.5 rounded-full bg-amber-500 text-white text-sm font-bold">
                    {startN}–{startN + stop.hotspots.length - 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-extrabold text-foreground text-base">{stop.pageLabel}</h3>
                    <p className="text-xs text-muted-foreground">{stop.intro}</p>
                  </div>
                </header>

                {/* Screenshot with sequential-numbered, priority-colored dots */}
                <div className="relative bg-muted/20">
                  <Image
                    src={stop.image}
                    alt={stop.pageLabel}
                    width={1366}
                    height={768}
                    className="w-full h-auto block"
                    unoptimized
                  />
                  {stop.hotspots.map((h, idx) => {
                    const globalN = startN + idx;
                    const colors = PRIORITY_CLASSES[h.priority ?? "optional"];
                    const style: React.CSSProperties = { top: `${h.top}%` };
                    if (h.right !== undefined) style.right = `${h.right}%`;
                    if (h.left !== undefined) style.left = `${h.left}%`;
                    return (
                      <div
                        key={h.n}
                        style={style}
                        className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group"
                      >
                        <span
                          aria-hidden
                          className={`absolute inset-0 -m-2 rounded-full ${colors.halo} blur-[2px]`}
                        />
                        <button
                          type="button"
                          id={`${stop.id}-h${h.n}`}
                          className={`relative w-7 h-7 rounded-full ${colors.dot} text-xs font-extrabold shadow-md ring-[3px] ring-background flex items-center justify-center hover:scale-110 transition-transform`}
                          aria-label={h.title}
                        >
                          {globalN}
                        </button>
                        <span
                          className="pointer-events-none absolute top-full mt-2 right-1/2 translate-x-1/2 whitespace-nowrap rounded-md bg-foreground text-background text-[11px] font-bold px-2.5 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
                          role="tooltip"
                        >
                          {h.title}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Per-hotspot list — same sequential number + matching priority color */}
                <ul className="px-5 py-4 space-y-2">
                  {stop.hotspots.map((h, idx) => {
                    const globalN = startN + idx;
                    const colors = PRIORITY_CLASSES[h.priority ?? "optional"];
                    return (
                      <li key={h.n} className="flex items-start gap-2.5 text-sm">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 shrink-0 rounded-full ${colors.badge} ${colors.badgeText} text-xs font-bold`}
                        >
                          {globalN}
                        </span>
                        <div className="flex-1">
                          <span className="font-bold text-foreground">{h.title}: </span>
                          <span className="text-muted-foreground">{h.description}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </motion.section>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-10 text-center bg-primary/5 border border-primary/15 rounded-2xl p-6">
          <p className="text-sm text-foreground/85 mb-4">
            تبي تشغّل الجولة من البداية؟
          </p>
          <button
            type="button"
            onClick={startTour}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold text-sm px-5 py-2.5 rounded-full hover:bg-primary/90 transition-colors"
          >
            <PlayCircle className="w-4 h-4" />
            ابدأ من جديد
          </button>
          <div className="mt-4">
            <Link
              href="/help"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowRight className="w-3 h-3" />
              رجوع لمركز المساعدة
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
