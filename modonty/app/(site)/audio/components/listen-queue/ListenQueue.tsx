"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import {
  IconPlay,
  IconPause,
  IconReplay,
  IconAdvance,
  IconSkipForward,
  IconListen,
  IconAlertTriangle,
  IconClients,
} from "@/lib/icons";
import { cn } from "@/lib/utils";

import { hushOtherAudio } from "../../helpers/hush-other-audio";
import type { AudioArticle } from "../../data/get-audio-articles";

interface ListenQueueProps {
  articles: AudioArticle[];
  /**
   * Rail form: the articles sit beside the Qur'an now, in a 300px column.
   *
   * A seek bar and two ±15s buttons cannot be used at that width — the bar would give a pixel per
   * several seconds and the buttons would crowd out the title. So the compact form keeps what a
   * side shelf is for (start it, skip it, see what is on) and drops precision scrubbing, which
   * belongs to the recording you actually chose to sit with.
   */
  compact?: boolean;
}

const SPEEDS = [1, 1.25, 1.5, 2] as const;
const JUMP = 15;

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const toArabic = (s: string) => s.replace(/\d/g, (d) => AR_DIGITS[Number(d)]);

function clock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "٠٠:٠٠";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return toArabic(h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`);
}

/** «ساعتان و١٣ دقيقة» — a total is read, not counted, so it is said in words. */
function totalPhrase(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  const hours = h === 0 ? "" : h === 1 ? "ساعة" : h === 2 ? "ساعتان" : `${toArabic(String(h))} ساعات`;
  const mins = m === 0 ? "" : m === 1 ? "دقيقة" : m === 2 ? "دقيقتان" : `${toArabic(String(m))} دقيقة`;
  return [hours, mins].filter(Boolean).join(" و") || "أقل من دقيقة";
}

/**
 * The listening page is a QUEUE, not a shelf.
 *
 * A list of the articles that happen to have audio is not a page — it is a filter on `/articles`,
 * and Khalid said so plainly: «أحس إنه الصفحة هذه بزيادة». The one thing this page can do that the
 * article page cannot is play STRAIGHT THROUGH: press once, and it moves to the next recording by
 * itself. That is the whole reason it exists, and it is what someone driving actually needs.
 *
 * There is exactly ONE `<audio>` in the page — up in the header. The rows are not players, they
 * are a playlist. That is what kills the failure mode a per-row player would create: twenty
 * elements each reading their file on load, and two of them able to talk over each other.
 *
 * Nothing is fetched until the reader presses play: every duration shown here comes from
 * `Article.audioDurationSeconds` in the database, so the page opens having downloaded no audio.
 */
export function ListenQueue({ articles, compact }: ListenQueueProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  // The 404 recording in the seed data proves the case: a row with no playable file must not be
  // able to stall the queue, so unplayable rows are listed but never become `current`.
  const playable = articles.filter((a) => a.durationSeconds);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [rate, setRate] = useState<(typeof SPEEDS)[number]>(1);
  const [failed, setFailed] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const track = playable[index];
  const duration = track?.durationSeconds ?? 0;
  const totalSeconds = playable.reduce((sum, a) => sum + (a.durationSeconds ?? 0), 0);

  // Changing track means a new file: play it only if the reader was already listening, so that
  // picking a row and pressing play behave the same way and neither surprises anyone.
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !started) return;
    el.playbackRate = rate;
    void el.play().catch(() => setFailed(track?.id ?? null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, started]);

  const playIndex = (i: number) => {
    setStarted(true);
    setFailed(null);
    setCurrent(0);
    if (i === index) {
      const el = audioRef.current;
      if (!el) return;
      if (el.paused) void el.play().catch(() => setFailed(track?.id ?? null));
      else el.pause();
      return;
    }
    setIndex(i);
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

  /** The point of the whole page: when one ends, the next one starts. */
  const onEnded = () => {
    if (index + 1 < playable.length) setIndex(index + 1);
    else {
      setPlaying(false);
      setStarted(false);
      setIndex(0);
      setCurrent(0);
    }
  };

  /**
   * Skip instead of a selection mode.
   *
   * Checkboxes would put a step between opening the page and hearing anything, and whoever opens
   * this page is usually driving. Skipping gives the same control at the moment it is actually
   * wanted — after hearing the first seconds — and costs one tap instead of a selection pass.
   * Picking a specific recording is already possible by pressing its row.
   */
  const skip = () => {
    setFailed(null);
    setCurrent(0);
    setStarted(true);
    setIndex(index + 1 < playable.length ? index + 1 : 0);
  };

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <>
      {/* The player rides with the reader down the list — a control that scrolls away is the
          defect this whole page was rebuilt to avoid. */}
      <div className={cn(
        "rounded-2xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur",
        // In the rail it is already pinned by the rail itself; on its own it does the pinning.
        compact ? "" : "sticky top-16 z-30 mt-6"
      )}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <IconListen className="size-4 text-action-listen" aria-hidden />
          <span>
            {toArabic(String(playable.length))} مقالات · {totalPhrase(totalSeconds)}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => playIndex(index)}
            aria-label={playing ? "إيقاف مؤقّت" : started ? "متابعة" : "شغّل الكل"}
            className="grid size-12 shrink-0 place-items-center rounded-full bg-action-listen text-action-listen-foreground transition-transform hover:scale-105"
          >
            {playing ? <IconPause className="size-5" /> : <IconPlay className="size-5" />}
          </button>

          {/* Only once something is playing — a skip button before the first sound points at
              nothing. */}
          {started && playable.length > 1 && (
            <button
              type="button"
              onClick={skip}
              aria-label="تخطَّ إلى التالي"
              title="تخطَّ"
              className="grid size-11 shrink-0 place-items-center rounded-full border border-border hover:bg-muted"
            >
              <IconSkipForward className="size-4" aria-hidden />
            </button>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">
              {started ? track?.title : "شغّل الكل"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {started ? track?.clientName : "يمشي مقال ورا مقال بلا ما تلمس شيء"}
            </p>
          </div>

          <button
            type="button"
            onClick={cycleSpeed}
            aria-label={`سرعة التشغيل ${rate}`}
            dir="ltr"
            // 31×26 measured on a phone — under the 44px floor, and it is the one control here
            // someone reaches for while driving. Phones only, so the rail on desktop is unchanged.
            className="shrink-0 rounded-full border border-border px-2.5 py-1 text-xs font-semibold tabular-nums hover:bg-muted max-md:inline-grid max-md:h-11 max-md:min-w-11 max-md:place-items-center"
          >
            {toArabic(`×${rate}`)}
          </button>
        </div>

        <div className={cn("mt-3 items-center gap-3", compact ? "hidden" : "flex")}>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground" dir="ltr">
            {clock(current)} / {clock(duration)}
          </span>
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
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-border accent-action-listen"
          />
          {/* Fifteen seconds each way: on a two-hour recording the bar gives one pixel per ~25
              seconds, so dragging cannot land on a sentence — these can. */}
          <button
            type="button"
            onClick={() => nudge(-JUMP)}
            aria-label="رجوع ١٥ ثانية"
            className="grid size-11 shrink-0 place-items-center rounded-lg border border-border hover:bg-muted"
          >
            <IconReplay className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => nudge(JUMP)}
            aria-label="تقديم ١٥ ثانية"
            className="grid size-11 shrink-0 place-items-center rounded-lg border border-border hover:bg-muted"
          >
            <IconAdvance className="size-4" aria-hidden />
          </button>
        </div>

        {failed && (
          <p className="mt-2 flex items-center gap-2 text-xs text-destructive">
            <IconAlertTriangle className="size-4 shrink-0" aria-hidden />
            هذا التسجيل ما فتح. اضغط اللي بعده، والمقال مكتوب كامل.
          </p>
        )}
      </div>

      <ol className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {articles.map((article) => {
          const queueAt = playable.findIndex((p) => p.id === article.id);
          const isPlayable = queueAt !== -1;
          const isCurrent = isPlayable && queueAt === index && started;

          return (
            <li key={article.id} className={cn("relative", isCurrent && "bg-action-listen/10")}>
              <div className="flex items-center gap-3 p-3">
                <button
                  type="button"
                  onClick={() => isPlayable && playIndex(queueAt)}
                  disabled={!isPlayable}
                  aria-label={isPlayable ? `شغّل ${article.title}` : "لا يوجد تسجيل صالح"}
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-full transition-transform",
                    isPlayable
                      ? "bg-action-listen text-action-listen-foreground hover:scale-105"
                      : "cursor-not-allowed bg-muted text-muted-foreground/60"
                  )}
                >
                  {!isPlayable ? (
                    <IconAlertTriangle className="size-4" />
                  ) : isCurrent && playing ? (
                    <IconPause className="size-4" />
                  ) : (
                    <IconPlay className="size-4" />
                  )}
                </button>

                <span className={cn("relative aspect-video w-[88px] shrink-0 overflow-hidden rounded-lg bg-muted", compact && "hidden")}>
                  {article.image ? (
                    <OptimizedImage
                      media={asMedia(article.image, article.title, article.imageBlur)}
                      alt=""
                      fill
                      sizes="88px"
                      className="object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center">
                      <IconClients className="size-4 text-muted-foreground" aria-hidden />
                    </span>
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 block text-sm font-bold leading-6">{article.title}</span>
                  <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="min-w-0 truncate">{article.clientName}</span>
                    <span className="shrink-0 tabular-nums" dir="ltr">
                      {article.durationSeconds ? clock(article.durationSeconds) : "—"}
                    </span>
                  </span>
                </span>

                {/* Listening is the page's job, but some people would rather read — one link, not
                    a whole second entry point. */}
                <Link
                  href={`/articles/${encodeURIComponent(article.slug)}`}
                  className={cn(
                    "shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted",
                    compact && "hidden"
                  )}
                >
                  اقرأ
                </Link>
              </div>

              {isCurrent && (
                <span
                  className="absolute inset-x-0 bottom-0 h-[3px] bg-action-listen transition-[width] duration-200"
                  style={{ width: `${pct}%` }}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* One element for the whole page. `preload="none"`: the durations above come from the
          database, so opening the page downloads no audio at all. */}
      <audio
        ref={audioRef}
        src={track?.audioUrl}
        preload="none"
        onPlay={() => {
          hushOtherAudio(audioRef.current);
          setPlaying(true);
        }}
        onPause={() => setPlaying(false)}
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime ?? 0)}
        onEnded={onEnded}
        onError={() => setFailed(track?.id ?? null)}
      />
    </>
  );
}
