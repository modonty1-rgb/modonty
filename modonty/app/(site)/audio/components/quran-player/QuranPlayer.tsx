"use client";

import { useEffect, useRef, useState } from "react";

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

/** «سُورَةُ ٱلْكَهۡفِ» → «ٱلْكَهۡفِ». The word «سورة» on every chip is six characters of nothing. */
const shortName = (name: string) => name.replace(/^\S+\s+/, "");

/**
 * The six people actually come for.
 *
 * A phone list of 114 puts سورة الملك twenty-two screens down, and searching means stopping,
 * typing, and reading — three steps for something someone already decided before opening the page.
 * These six cover the overwhelming share of what is asked for in Saudi Arabia and Egypt: the
 * opening, the one recited on Friday, the two of the evening, and the two longest habits.
 */
const QUICK = [1, 2, 18, 36, 55, 67] as const;

/** Where the last recitation stopped, kept in this browser only. */
const RESUME_KEY = "modonty.audio.quran.last";
/** Under half a minute is not a place anyone wants back. */
const RESUME_MIN_SECONDS = 30;

interface ResumePoint {
  n: number;
  r: number;
  t: number;
}

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
  /** Surah number → reciter id. Anything unset is recited by the page-wide voice below. */
  const [choice, setChoice] = useState<Record<number, number>>({});
  /**
   * The voice for everything that has not been given one of its own.
   *
   * The per-surah choice stays — Khalid listens to different reciters for different surahs, and
   * that is why it lives on the card. But on a phone that meant the SAME name printed 114 times
   * in a 288px-wide button, when nine readers out of ten want one voice for the whole sitting.
   * So the session-wide choice moves up top and the per-surah one becomes an override.
   */
  const [defaultReciter, setDefaultReciter] = useState(DEFAULT_RECITER);
  const [picking, setPicking] = useState<number | "default" | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [resume, setResume] = useState<ResumePoint | null>(null);
  /** Set before a source change when playback must land somewhere other than the beginning. */
  const seekTo = useRef<number | null>(null);
  const savedAt = useRef(0);

  const reciterFor = (n: number) =>
    RECITERS.find((r) => r.id === (choice[n] ?? defaultReciter)) ?? RECITERS[0];

  // Read on the client, never during render: the server has no `localStorage`, and a value read
  // during render would make the first paint disagree with the HTML it is hydrating.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RESUME_KEY);
      if (!raw) return;
      const v: unknown = JSON.parse(raw);
      if (
        typeof v === "object" &&
        v !== null &&
        typeof (v as ResumePoint).n === "number" &&
        typeof (v as ResumePoint).r === "number" &&
        typeof (v as ResumePoint).t === "number" &&
        (v as ResumePoint).t >= RESUME_MIN_SECONDS
      ) {
        setResume(v as ResumePoint);
      }
    } catch {
      // Private mode, or a value someone else wrote. Losing the bookmark is not worth a crash.
    }
  }, []);

  /**
   * سورة البقرة runs two hours. Without this, closing the tab costs the whole sitting — which is
   * the single thing that decides whether someone uses this page twice.
   * Written every five seconds, not every quarter of one: `timeupdate` fires four times a second.
   */
  const remember = (t: number) => {
    if (!surah || t < RESUME_MIN_SECONDS || Math.abs(t - savedAt.current) < 5) return;
    savedAt.current = t;
    try {
      window.localStorage.setItem(
        RESUME_KEY,
        JSON.stringify({ n: surah.n, r: reciterFor(surah.n).id, t: Math.floor(t) } satisfies ResumePoint)
      );
    } catch {
      // Storage full or blocked — the recitation keeps playing, which is the part that matters.
    }
  };

  const playResume = () => {
    if (!resume) return;
    const i = SURAHS.findIndex((s) => s.n === resume.n);
    if (i === -1) return;
    setChoice((prev) => ({ ...prev, [resume.n]: resume.r }));
    setFailed(false);
    setCurrent(resume.t);
    setDuration(0);
    seekTo.current = resume.t;
    savedAt.current = resume.t;
    setIndex(i);
    setResume(null);
    requestAnimationFrame(() => void audioRef.current?.play().catch(() => setFailed(true)));
  };

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
    savedAt.current = 0;
    seekTo.current = null;
    setIndex(i);
    // `src` follows the state, so play once the element has it.
    requestAnimationFrame(() => void audioRef.current?.play().catch(() => setFailed(true)));
  };

  const chooseReciter = (target: number | "default", reciterId: number) => {
    if (target === "default") setDefaultReciter(reciterId);
    else setChoice((prev) => ({ ...prev, [target]: reciterId }));
    setPicking(null);
    // Changing the voice of the surah being recited restarts it in that voice — anything else
    // would leave the header naming a reciter that is not the one being heard. Changing the
    // page-wide voice only touches it when this surah had no voice of its own.
    const affectsCurrent =
      surah !== null &&
      (target === surah.n || (target === "default" && choice[surah.n] === undefined));
    if (affectsCurrent) {
      setFailed(false);
      setCurrent(0);
      savedAt.current = 0;
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

  const pickingSurah = typeof picking === "number" ? SURAHS.find((s) => s.n === picking) ?? null : null;
  const pickingOpen = picking !== null;
  const pickedReciterId = pickingSurah ? choice[pickingSurah.n] ?? defaultReciter : defaultReciter;
  const defaultReciterName = RECITERS.find((r) => r.id === defaultReciter)?.name ?? RECITERS[0].name;

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
    // Flex on phones for one reason: the attribution moves to the bottom there (see below).
    <section aria-labelledby="quran-heading" className="max-md:flex max-md:flex-col">
      {/* The section had no heading at all: a screen reader met 114 cards with nothing telling it
          what they were, and the page's outline jumped from «استمع» straight to «المقالات». */}
      {/* On a phone the active tab already reads «القرآن», so the heading is spoken but not drawn —
          the outline stays intact for a screen reader without spending 58px saying it twice. */}
      <h2 id="quran-heading" className="text-xl font-bold leading-tight max-md:sr-only">
        المصحف المسموع
      </h2>

      {/* Provenance on the page, not in the code (Khalid: «المصدر لازم يكون موجود»). The riwaya is
          named because a recitation without one is unattributed. */}
      <p className="mt-2 rounded-2xl border border-border bg-card p-4 text-[11px] leading-relaxed text-muted-foreground max-md:order-last max-md:mt-6 max-md:p-3">
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
        {/* The credit is owed and stays at every size. The explanation behind it is worth 150px of
            a 664px phone screen only once, and this is not it. */}
        <span className="max-md:hidden">
          . لا نستضيف التلاوة ولا نعدّل عليها، ولا يُعرض نصّ القرآن هنا — الصوت فقط.
        </span>
      </p>

      {/* Phone only, all three: the page-wide voice, the six surahs people ask for, and the
          bookmark. Each is `md:hidden`, so the desktop column is byte-identical to what it was. */}
      <div className="mt-3 flex items-center gap-2 md:hidden">
        <span className="shrink-0 text-xs text-muted-foreground">القارئ</span>
        <button
          type="button"
          onClick={() => setPicking("default")}
          aria-label={`اختر القارئ لكل السور — الحالي ${defaultReciterName}`}
          className="flex h-11 min-w-0 flex-1 items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 text-sm font-bold motion-safe:transition-transform motion-safe:active:scale-95"
        >
          <span className="truncate">{defaultReciterName}</span>
          <IconChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </div>

      {resume && (
        <button
          type="button"
          onClick={playResume}
          className="mt-3 flex w-full items-center gap-3 rounded-xl border border-action-listen/40 bg-action-listen/10 p-3 text-start motion-safe:transition-transform motion-safe:active:scale-95 md:hidden"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-action-listen text-action-listen-foreground">
            <IconPlay className="size-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            {/* The surah name carries its own full diacritics, so it cannot be dropped into a
                sentence after a verb without the vowels fighting the grammar. It gets its own
                line instead, where it is a label rather than an object. */}
            <span className="block truncate text-sm font-bold">كمّل من وين وقفت</span>
            <span className="block truncate text-xs text-muted-foreground">
              {SURAHS.find((s) => s.n === resume.n)?.name} · وقفت عند {clock(resume.t)}
            </span>
          </span>
        </button>
      )}

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {QUICK.map((n) => {
          const i = SURAHS.findIndex((s) => s.n === n);
          if (i === -1) return null;
          return (
            <button
              key={n}
              type="button"
              onClick={() => playSurah(i)}
              aria-label={`تلاوة ${SURAHS[i].name}`}
              className="h-11 shrink-0 rounded-full border border-border bg-card px-4 text-xs font-bold motion-safe:transition-transform motion-safe:active:scale-95"
            >
              {shortName(SURAHS[i].name)}
            </button>
          );
        })}
      </div>

      {/* Docked at the bottom in one row, the way every music player people already know does it —
          Spotify, Apple Music, YouTube Music, SoundCloud. It was a 152px block pinned under the
          navbar, nineteen per cent of the screen, and it also drew the progress twice. Controls
          cannot live only inside the card: in a grid of 114 the playing card is off-screen a
          second after you start scrolling, and control has to travel with the reader.
          Bottom rather than top so it never pushes the surahs down. */}
      {surah && (
        // `env(safe-area-inset-bottom)`: on a phone with a home indicator the last 34px of the
        // screen belong to the system, and without this the play button sits under it. Resolves
        // to 0 everywhere else, so desktop is untouched. Same pattern as `MobileCtaBar`.
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
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
      <ul className={cn("mt-4 grid grid-cols-1 gap-3 max-md:gap-2 sm:grid-cols-2 xl:grid-cols-3", surah && "pb-[calc(5rem+env(safe-area-inset-bottom))]")}>
        {shown.map(({ s, i }) => {
          const isCurrent = i === index;
          const r = reciterFor(s.n);
          return (
            <li
              key={s.n}
              className={cn(
                "rounded-2xl border bg-card p-3 transition-colors max-md:p-2",
                isCurrent ? "border-action-listen bg-action-listen/5" : "border-border"
              )}
            >
              <div className="flex items-start gap-3 max-md:items-center max-md:gap-2">
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

                {/* Phone: the card is ONE row, 60px instead of 129 — 114 of them was 17,589px of
                    page. The reciter keeps its own button so the per-surah override survives, but
                    it shows a letter rather than repeating the same name 114 times down the page.
                    Both are 44px, and the label still says whose voice it is. */}
                <span className="flex shrink-0 items-center gap-1 md:hidden">
                  <button
                    type="button"
                    onClick={() => setPicking(s.n)}
                    aria-label={`اختر قارئ ${s.name} — الحالي ${r.name}`}
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-full text-sm font-bold motion-safe:transition-transform motion-safe:active:scale-95",
                      choice[s.n] === undefined
                        ? "border border-border text-muted-foreground"
                        : "bg-action-listen/15 text-action-listen ring-1 ring-action-listen/40"
                    )}
                  >
                    {r.name.trim().charAt(0)}
                  </button>
                  <button
                    type="button"
                    onClick={() => playSurah(i)}
                    aria-label={`تلاوة ${s.name}`}
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-action-listen text-action-listen-foreground motion-safe:transition-transform motion-safe:active:scale-95"
                  >
                    {isCurrent && playing ? <IconPause className="size-4" /> : <IconPlay className="size-4" />}
                  </button>
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 max-md:hidden">
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

      {pickingOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={pickingSurah ? `اختر قارئ ${pickingSurah.name}` : "اختر القارئ لكل السور"}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
          onClick={() => setPicking(null)}
        >
          <div
            className="max-h-[80vh] w-full overflow-y-auto rounded-t-2xl border border-border bg-card p-4 sm:max-w-md sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">
                  {pickingSurah ? pickingSurah.name : "القارئ لكل السور"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {pickingSurah ? "قارئ هذي السورة وحدها" : "تقدر تغيّره لسورة وحدها من بطاقتها"} · {RIWAYA}
                </p>
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
                const active = rec.id === pickedReciterId;
                return (
                  <li key={rec.id}>
                    <button
                      type="button"
                      onClick={() => chooseReciter(pickingSurah ? pickingSurah.n : "default", rec.id)}
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
        onLoadedMetadata={() => {
          const el = audioRef.current;
          if (!el) return;
          setDuration(el.duration ?? 0);
          // `preload="none"` means the file has no length until now, so a resume can only seek here.
          if (seekTo.current !== null) {
            el.currentTime = seekTo.current;
            setCurrent(seekTo.current);
            seekTo.current = null;
          }
        }}
        onTimeUpdate={() => {
          const t = audioRef.current?.currentTime ?? 0;
          setCurrent(t);
          remember(t);
        }}
        onEnded={onEnded}
        onError={() => index !== null && setFailed(true)}
      />
    </section>
  );
}
