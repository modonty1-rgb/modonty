"use client";

import { useEffect, useId, useRef, useState } from "react";

import {
  IconListen,
  IconListenOff,
  IconPlay,
  IconPause,
  IconReplay,
  IconAdvance,
  IconAlertTriangle,
  IconClose,
} from "@/lib/icons";
import { cn } from "@/lib/utils";

interface ArticleAudioPlayerProps {
  /** The article's audio version. Absent on most articles — the tab then sits inert. */
  src?: string | null;
  /** Keys the saved position, so a two-hour recording resumes where the reader left it. */
  slug: string;
  /**
   * The recording's length from the database (`Article.audioDurationSeconds`).
   *
   * With it the collapsed tab can say «٢:٠٦:١٥» having fetched nothing at all. Without it the
   * only way to learn the number is to make the browser read the file, which on that same
   * recording meant range-reading a 116MB origin on every article view, for a feature most
   * readers never touch. Null on articles recorded before the field existed — those fall back
   * to reading metadata, so nothing regresses.
   */
  durationSeconds?: number | null;
  /** The tab class the other four tabs use, so this one is not a lookalike but the same thing. */
  tabClassName: string;
}

const SPEEDS = [1, 1.25, 1.5, 2] as const;
const JUMP = 15;

/** Arabic-Indic digits, because every other number the reader sees on this page is in them. */
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const toArabic = (s: string) => s.replace(/\d/g, (d) => AR_DIGITS[Number(d)]);

/** `2:06:15`, not `126:15` — the hour slot appears only when there is one. */
function clock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "٠٠:٠٠";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return toArabic(h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`);
}

/**
 * The listen tab IS the player (Khalid, 20 Aug).
 *
 * The audio used to live in a card above the article body, which meant it scrolled out of reach
 * the moment the reader started reading — the one thing a listener needs is a control that stays.
 * The tab row is already `fixed` under the navbar, so hanging the player off the tab gives that
 * for free, without a second sticky bar competing with the navbar for the top of the screen.
 *
 * The tab carries its own state so it is worth looking at while collapsed: the duration before
 * anything plays (a reader deserves to know it is six minutes and not two hours BEFORE they
 * commit), and the elapsed time plus a progress line along the bottom edge while it runs.
 *
 * Deliberately one meaning per control: the tab opens and closes the panel, and nothing else.
 * Making a 48px square mean both "toggle" and "play/pause" is exactly how a control becomes a
 * dead click, and dead clicks are this site's single biggest measured frustration signal.
 */
export function ArticleAudioPlayer({ src, slug, tabClassName, durationSeconds }: ArticleAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  // The article page mounts the tab row twice — once in the fixed desktop layer, once in the
  // phone column — so a literal id would appear twice in the document and `aria-controls` would
  // point at whichever the browser found first.
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(durationSeconds ?? 0);
  const [buffered, setBuffered] = useState(0);
  const [rate, setRate] = useState<(typeof SPEEDS)[number]>(1);
  const [failed, setFailed] = useState(false);
  const [started, setStarted] = useState(false);
  const [live, setLive] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const storageKey = `modonty:audio:${slug}`;

  // Read the duration, and restore the saved position — guarded at both ends so a reader who
  // finished is not dropped back at the last second of the recording.
  const readMeta = () => {
    const el = audioRef.current;
    if (!el || !Number.isFinite(el.duration)) return;
    setDuration(el.duration);
    const saved = Number(window.sessionStorage.getItem(storageKey) ?? 0);
    if (saved > 10 && saved < el.duration - 10) {
      el.currentTime = saved;
      setCurrent(saved);
    }
  };

  // `loadedmetadata` can fire before an effect runs — effects are flushed after paint, and a
  // cached file resolves sooner than that. The element's own handler covers the normal case;
  // this covers the race, where the metadata already arrived and the event is gone.
  useEffect(() => {
    if ((audioRef.current?.readyState ?? 0) >= 1) readMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, live]);

  // The article page mounts this twice — the fixed desktop row and the phone row — and one of
  // them is `display:none` at any width. Both were fetching metadata, so every article view paid
  // twice for a file most readers never play, and on a two-hour recording that is a 116MB origin
  // being range-read for nothing. Only the copy with a real box on screen loads.
  // Width, not `offsetParent`: the desktop copy lives inside a `fixed` layer, where
  // `offsetParent` is null even while it is perfectly visible.
  useEffect(() => {
    const check = () => setLive((wrapRef.current?.getBoundingClientRect().width ?? 0) > 0);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const onTime = () => {
    const el = audioRef.current;
    if (!el) return;
    setCurrent(el.currentTime);
    if (el.buffered.length) setBuffered(el.buffered.end(el.buffered.length - 1));
    window.sessionStorage.setItem(storageKey, String(el.currentTime));
  };

  const toggleTab = () => {
    const next = !open;
    setOpen(next);
    // Opening it the first time is a clear enough intent to start playing — nobody unfolds a
    // player to look at it.
    if (next && !started && !failed) {
      setStarted(true);
      void audioRef.current?.play().catch(() => setFailed(true));
    }
  };

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el || failed) return;
    setStarted(true);
    if (el.paused) void el.play().catch(() => setFailed(true));
    else el.pause();
  };

  const nudge = (by: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Math.min(Math.max(el.currentTime + by, 0), el.duration || 0);
    setCurrent(el.currentTime);
  };

  const cycleSpeed = () => {
    const next = SPEEDS[(SPEEDS.indexOf(rate) + 1) % SPEEDS.length];
    setRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  // No recording: the tab keeps its place struck through rather than disappearing, so the row is
  // the same five tabs on every article.
  if (!src) {
    return (
      <span
        className={cn(tabClassName, "cursor-not-allowed bg-muted text-muted-foreground/70 hover:translate-y-0")}
        title="لا توجد نسخة صوتية لهذا المقال"
        aria-label="لا توجد نسخة صوتية لهذا المقال"
        aria-disabled="true"
      >
        <IconListenOff className="size-[18px]" />
      </span>
    );
  }

  const pct = duration > 0 ? (current / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={toggleTab}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "إغلاق المشغّل" : "استمع للمقال"}
        className={cn(tabClassName, "overflow-hidden bg-action-listen text-action-listen-foreground")}
      >
        {failed ? (
          <IconAlertTriangle className="size-[18px]" />
        ) : playing ? (
          <IconPause className="size-[18px]" />
        ) : (
          <IconListen className="size-[18px]" />
        )}
        {/* Idle it shows how long the recording is; running, how far in the reader is. */}
        {!failed && duration > 0 && (
          <span className="tabular-nums" dir="ltr">
            {started ? clock(current) : clock(duration)}
          </span>
        )}
        {/* A line along the bottom edge, not a ring: the tab is a rounded rectangle and a ring
            around one reads as a badge stuck on it. */}
        {started && !failed && (
          <span
            className="absolute inset-x-0 bottom-0 h-[3px] bg-action-listen-foreground/80 transition-[width] duration-200"
            style={{ width: `${pct}%` }}
            aria-hidden
          />
        )}
      </button>

      {open && (
        <div
          id={panelId}
          data-audio-panel
          // Hung off the tab it would run past the rail and cover the first characters of the
          // article — measured 413 against a text column starting at 403. The panel is wider
          // than the tab row, so it is pulled back by half the difference and ends up centred on
          // the row, sitting inside the rail column instead of over the reading. The two offsets
          // are the two tab sizes: 48px on a phone, 40px from `lg` up.
          className="absolute -end-[10px] top-full z-50 mt-2 w-[292px] rounded-xl border border-border bg-card p-3 shadow-lg lg:-end-[30px]"
          dir="rtl"
        >
          {/* A close button inside the panel (Khalid, 22 Aug). The tab above closes it too, but
              once the panel is open the tab is behind the reader's own hand and reads as the
              thing that opened this — not as the way out. Every panel needs its own exit. */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="إغلاق المشغّل"
            className="absolute end-1 top-1 grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <IconClose className="size-4" />
          </button>
          {failed ? (
            <div className="flex items-start gap-2 text-sm">
              <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
              <p className="text-muted-foreground">
                الملف الصوتي ما فتح. جرّب تحدّث الصفحة، والمقال مكتوب كامل تحت.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={playing ? "إيقاف مؤقّت" : "تشغيل"}
                  className="grid size-11 shrink-0 place-items-center rounded-full bg-action-listen text-action-listen-foreground transition-transform hover:scale-105"
                >
                  {playing ? <IconPause className="size-5" /> : <IconPlay className="size-5" />}
                </button>

                {/* Latin direction for the time pair: elapsed then total, the order every player
                    on earth uses, and it must not flip with the surrounding Arabic. */}
                <span className="text-sm tabular-nums text-muted-foreground" dir="ltr">
                  {clock(current)} / {clock(duration)}
                </span>

                <button
                  type="button"
                  onClick={cycleSpeed}
                  aria-label={`سرعة التشغيل ${rate}`}
                  // The multiplication sign is direction-neutral, so `×١` renders as `١×` inside
                  // the Arabic panel. Latin direction pins it to the shape people read as a rate.
                  dir="ltr"
                  className="ms-auto rounded-full border border-border px-2.5 py-1 text-xs font-semibold tabular-nums hover:bg-muted"
                >
                  {toArabic(`×${rate}`)}
                </button>
              </div>

              <div className="relative mt-3">
                {/* What has actually downloaded, behind the handle — on a two-hour file the gap
                    between "seekable" and "downloaded" is the whole story. */}
                <span
                  className="pointer-events-none absolute inset-y-0 start-0 my-auto h-1 rounded-full bg-muted-foreground/25"
                  style={{ width: `${bufferedPct}%` }}
                  aria-hidden
                />
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={1}
                  value={current}
                  onChange={(e) => {
                    const el = audioRef.current;
                    if (!el) return;
                    el.currentTime = Number(e.target.value);
                    setCurrent(el.currentTime);
                  }}
                  aria-label="موضع التشغيل"
                  dir="ltr"
                  className="relative h-1 w-full cursor-pointer appearance-none rounded-full bg-border accent-action-listen"
                />
              </div>

              {/* Fifteen seconds each way. On a two-hour recording the 292px bar gives one pixel
                  per ~25 seconds, so dragging cannot land a sentence — these buttons can. */}
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => nudge(-JUMP)}
                  aria-label="رجوع ١٥ ثانية"
                  className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
                >
                  <IconReplay className="size-4" aria-hidden />
                  {toArabic("١٥")}
                </button>
                <button
                  type="button"
                  onClick={() => nudge(JUMP)}
                  aria-label="تقديم ١٥ ثانية"
                  className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
                >
                  <IconAdvance className="size-4" aria-hidden />
                  {toArabic("١٥")}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Nothing is fetched until the reader presses play — the tab already knows the length from
          the database. `metadata` is the fallback for the visible copy of an older article whose
          duration was never recorded; the hidden copy never fetches at all. */}
      <audio
        ref={audioRef}
        src={src}
        preload={live && !durationSeconds ? "metadata" : "none"}
        onLoadedMetadata={readMeta}
        onDurationChange={readMeta}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          window.sessionStorage.removeItem(storageKey);
        }}
        onTimeUpdate={onTime}
        onProgress={onTime}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
