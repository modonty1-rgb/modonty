"use client";

import { useRef, useState } from "react";

import {
  IconPlay,
  IconPause,
  IconSkipForward,
  IconReplay,
  IconAdvance,
  IconChevronDown,
  IconAlertTriangle,
  IconClose,
} from "@/lib/icons";
import { cn } from "@/lib/utils";

import { hushOtherAudio } from "../../helpers/hush-other-audio";
import { RECITERS, DEFAULT_RECITER, RIWAYA, SOURCE, surahFile } from "../../data/quran-reciters";
import { SURAHS } from "../../data/quran-surahs";

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const toArabic = (v: number | string) => String(v).replace(/\d/g, (d) => AR_DIGITS[Number(d)]);

function clock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "٠٠:٠٠";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return toArabic(h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`);
}

const JUMP = 15;

/**
 * المصحف المسموع — a card per surah, each with its own reciter.
 *
 * Not one list and not one global reciter: Khalid listens to different reciters for different
 * surahs, so the choice belongs on the card. It is held per surah and remembered while the page is
 * open, so returning to a surah returns to the voice it was set to.
 *
 * The picker is ONE dialog shared by all 114 cards, not a `<select>` inside each. Mounting a
 * hundred and fourteen selects of twenty options each would put 2,280 option nodes into the page
 * for a control most visitors touch once — and a native select of twenty Arabic names is a poor
 * thing to open on a phone.
 *
 * Not one word of the Qur'an is displayed (Khalid, 20 Aug). Each card shows facts ABOUT the surah
 * — number, name, verse count, where it was revealed, which juz — and plays the recitation. Text
 * on a screen can lose a diacritic to a font, and no reader should be handed scripture this site
 * has not verified letter by letter.
 */
export function QuranPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  /** Surah number → reciter id. Anything unset is recited by the default. */
  const [choice, setChoice] = useState<Record<number, number>>({});
  const [picking, setPicking] = useState<number | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");

  const reciterFor = (n: number) =>
    RECITERS.find((r) => r.id === (choice[n] ?? DEFAULT_RECITER)) ?? RECITERS[0];

  const surah = index === null ? null : SURAHS[index];
  const src = surah ? surahFile(reciterFor(surah.n).server, surah.n) : undefined;

  const playSurah = (i: number) => {
    setFailed(false);
    if (i === index) {
      const el = audioRef.current;
      if (!el) return;
      if (el.paused) void el.play().catch(() => setFailed(true));
      else el.pause();
      return;
    }
    setCurrent(0);
    setDuration(0);
    setIndex(i);
    // `src` follows the state, so play once the element has it.
    requestAnimationFrame(() => void audioRef.current?.play().catch(() => setFailed(true)));
  };

  const chooseReciter = (surahNumber: number, reciterId: number) => {
    setChoice((prev) => ({ ...prev, [surahNumber]: reciterId }));
    setPicking(null);
    // Changing the voice of the surah being recited restarts it in that voice — anything else
    // would leave the header naming a reciter that is not the one being heard.
    if (surah?.n === surahNumber) {
      setFailed(false);
      setCurrent(0);
      requestAnimationFrame(() => void audioRef.current?.play().catch(() => setFailed(true)));
    }
  };

  const nudge = (by: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Math.min(Math.max(el.currentTime + by, 0), el.duration || 0);
    setCurrent(el.currentTime);
  };

  const onEnded = () => {
    if (index !== null && index + 1 < SURAHS.length) playSurah(index + 1);
    else {
      setPlaying(false);
      setIndex(null);
    }
  };

  const pickingSurah = picking === null ? null : SURAHS.find((s) => s.n === picking);

  // Matched against the bare letters: the stored names carry full diacritics and a leading
  // «سُورَةُ», neither of which anybody types. The index travels with each match so the play
  // handler keeps addressing the real position in the mushaf, not a position in the filtered view.
  //
  // The range has to reach past ordinary tashkeel into the Qur'anic marks: «الكَهۡفِ» carries a
  // small high sukun (U+06E1) and «ٱلْفَاتِحَةِ» an alef wasla (U+0671), and neither is on anybody's
  // keyboard. Stripping only U+064B–U+0652 left «الكهۡف», so typing «الكهف» matched nothing.
  //
  // «آلِ عِمۡرَانَ» needed one more: the madda is stored DECOMPOSED — alef U+0627 followed by
  // U+0653 — while a keyboard produces the single character آ (U+0622). Normalising to NFC first
  // folds the pair into that one character, and then the alef rule catches it.
  const bare = (v: string) =>
    v
      .normalize("NFC")
      .replace(/[ً-ٰٕـٖ-ٟۖ-ۭ]/g, "")
      .replace(/[آأإٱ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه");
  const q = bare(query.trim());
  const shown = SURAHS.map((s, i) => ({ s, i })).filter(
    ({ s }) => !q || bare(s.name).includes(q) || String(s.n) === q || toArabic(s.n) === q
  );

  return (
    <section aria-labelledby="quran-heading">
      {/* The section had no heading at all: a screen reader met 114 cards with nothing telling it
          what they were, and the page's outline jumped from «استمع» straight to «المقالات». */}
      <h2 id="quran-heading" className="text-xl font-bold leading-tight">
        المصحف المسموع
      </h2>

      {/* Provenance on the page, not in the code (Khalid: «المصدر لازم يكون موجود»). The riwaya is
          named because a recitation without one is unattributed. */}
      <p className="mt-2 rounded-2xl border border-border bg-card p-4 text-[11px] leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">المصحف كامل ١١٤ سورة</span> برواية{" "}
        <span className="font-semibold text-foreground">{RIWAYA}</span> · عشرون قارئاً · التلاوات من{" "}
        <a
          href={SOURCE.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-link hover:underline"
          dir="ltr"
        >
          {SOURCE.name}
        </a>
        . لا نستضيف التلاوة ولا نعدّل عليها، ولا يُعرض نصّ القرآن هنا — الصوت فقط.
      </p>

      {/* Docked at the bottom in one row, the way every music player people already know does it —
          Spotify, Apple Music, YouTube Music, SoundCloud. It was a 152px block pinned under the
          navbar, nineteen per cent of the screen, and it also drew the progress twice. Controls
          cannot live only inside the card: in a grid of 114 the playing card is off-screen a
          second after you start scrolling, and control has to travel with the reader.
          Bottom rather than top so it never pushes the surahs down. */}
      {surah && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
          <div className="container mx-auto flex max-w-[1128px] items-center gap-3 px-3 py-2 sm:px-4">
            <button
              type="button"
              onClick={() => playSurah(index as number)}
              aria-label={playing ? "إيقاف التلاوة" : "متابعة التلاوة"}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-action-listen text-action-listen-foreground transition-transform hover:scale-105"
            >
              {playing ? <IconPause className="size-5" /> : <IconPlay className="size-5" />}
            </button>

            <div className="min-w-0 w-[26%] shrink-0 sm:w-[22%]">
              <p className="truncate text-xs font-bold leading-tight">{surah.name}</p>
              <p className="truncate text-[11px] leading-tight text-muted-foreground">
                {failed ? (
                  <span className="flex items-center gap-1 text-destructive">
                    <IconAlertTriangle className="size-3 shrink-0" aria-hidden />
                    ما فتحت — جرّب قارئاً آخر
                  </span>
                ) : (
                  reciterFor(surah.n).name
                )}
              </p>
            </div>

            {/* One progress control, not two. */}
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
              aria-label="موضع التلاوة"
              dir="ltr"
              className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-action-listen"
            />

            <span className="hidden shrink-0 text-[11px] tabular-nums text-muted-foreground sm:block" dir="ltr">
              {clock(current)} / {clock(duration)}
            </span>

            <button type="button" onClick={() => nudge(-JUMP)} aria-label="رجوع ١٥ ثانية" className="hidden size-11 shrink-0 place-items-center rounded-lg hover:bg-muted sm:grid">
              <IconReplay className="size-4" aria-hidden />
            </button>
            <button type="button" onClick={() => nudge(JUMP)} aria-label="تقديم ١٥ ثانية" className="hidden size-11 shrink-0 place-items-center rounded-lg hover:bg-muted sm:grid">
              <IconAdvance className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => index !== null && index + 1 < SURAHS.length && playSurah(index + 1)}
              aria-label="السورة التالية"
              className="grid size-11 shrink-0 place-items-center rounded-lg hover:bg-muted"
            >
              <IconSkipForward className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => {
                audioRef.current?.pause();
                setIndex(null);
              }}
              aria-label="إغلاق المشغّل"
              className="grid size-11 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
            >
              <IconClose className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      )}

      {/* Seventeen thousand pixels of page on a phone, and the only way to سورة الكهف was to
          scroll past seventeen others. Filtering by name — with the search-friendly forms folded
          in, since «الفاتحة» is typed far more often than «سُورَةُ ٱلْفَاتِحَةِ». */}
      <div className="mt-4">
        <label htmlFor="surah-search" className="sr-only">
          ابحث عن سورة
        </label>
        <input
          id="surah-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن سورة — الكهف · يس · الرحمن"
          className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
        />
        {query && (
          <p className="mt-1 text-xs text-muted-foreground">
            {toArabic(shown.length)} من {toArabic(SURAHS.length)} سورة
          </p>
        )}
      </div>

      {/* Room for the dock, so the last surahs are never hidden under it. */}
      <ul className={cn("mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3", surah && "pb-20")}>
        {shown.map(({ s, i }) => {
          const isCurrent = i === index;
          const r = reciterFor(s.n);
          return (
            <li
              key={s.n}
              className={cn(
                "rounded-2xl border bg-card p-3 transition-colors",
                isCurrent ? "border-action-listen bg-action-listen/5" : "border-border"
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums",
                    isCurrent ? "bg-action-listen text-action-listen-foreground" : "border border-border text-muted-foreground"
                  )}
                >
                  {toArabic(s.n)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-bold">{s.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {toArabic(s.a)} آية · {s.p} · الجزء {toArabic(s.j)}
                  </span>
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                {/* The voice for THIS surah. One shared dialog does the picking. */}
                <button
                  type="button"
                  onClick={() => setPicking(s.n)}
                  aria-label={`اختر قارئ ${s.name} — الحالي ${r.name}`}
                  className="flex h-11 min-w-0 flex-1 items-center justify-between gap-2 rounded-lg border border-border px-3 text-xs font-semibold hover:bg-muted"
                >
                  <span className="truncate">{r.name}</span>
                  <IconChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => playSurah(i)}
                  aria-label={`تلاوة ${s.name}`}
                  className="grid size-11 shrink-0 place-items-center rounded-full bg-action-listen text-action-listen-foreground transition-transform hover:scale-105"
                >
                  {isCurrent && playing ? <IconPause className="size-4" /> : <IconPlay className="size-4" />}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {pickingSurah && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`اختر قارئ ${pickingSurah.name}`}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
          onClick={() => setPicking(null)}
        >
          <div
            className="max-h-[80vh] w-full overflow-y-auto rounded-t-2xl border border-border bg-card p-4 sm:max-w-md sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{pickingSurah.name}</p>
                <p className="text-xs text-muted-foreground">اختر القارئ · {RIWAYA}</p>
              </div>
              <button
                type="button"
                onClick={() => setPicking(null)}
                aria-label="إغلاق"
                className="grid size-11 shrink-0 place-items-center rounded-lg border border-border hover:bg-muted"
              >
                <IconClose className="size-4" aria-hidden />
              </button>
            </div>

            <ul className="mt-3 space-y-1">
              {RECITERS.map((rec) => {
                const active = rec.id === (choice[pickingSurah.n] ?? DEFAULT_RECITER);
                return (
                  <li key={rec.id}>
                    <button
                      type="button"
                      onClick={() => chooseReciter(pickingSurah.n, rec.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg p-3 text-start text-sm transition-colors",
                        active ? "bg-action-listen/15 font-bold ring-1 ring-action-listen/40" : "hover:bg-muted"
                      )}
                    >
                      {/* A letter, not a face: no source carries photographs of the reciters, and
                          hosting them without permission is not something to do here. */}
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-action-listen/15 text-sm font-bold text-action-listen">
                        {rec.name.trim().charAt(0)}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{rec.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onPlay={() => {
          hushOtherAudio(audioRef.current);
          setPlaying(true);
        }}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime ?? 0)}
        onEnded={onEnded}
        onError={() => index !== null && setFailed(true)}
      />
    </section>
  );
}
