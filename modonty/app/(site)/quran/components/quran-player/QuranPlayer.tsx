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
  IconUser,
} from "@/lib/icons";
import { cn } from "@/lib/utils";

import { hushOtherAudio } from "@/lib/audio/hush-other-audio";
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
 * كل نصّ يراه الزائر هنا يصل من `messages/ar.json` عبر الصفحة (سيرفر) — لا استيراد للملف
 * في مكوّن عميل حتى لا تدخل الرسائل كلها في باندل المتصفح. الجمل المركّبة تُبنى بكلمات
 * بادئة (prefix) بدل قوالب، فيبقى العميل خالياً من أي منطق قوالب.
 */
export interface QuranPlayerLabels {
  heading: string;
  provenanceLead: string;
  provenanceRiwaya: string;
  provenanceMiddle: string;
  provenanceDisclaimer: string;
  reciterLabel: string;
  pickReciterAll: string;
  pickReciterForPrefix: string;
  currentPrefix: string;
  resumeTitle: string;
  resumeAtPrefix: string;
  recitePrefix: string;
  pause: string;
  resume: string;
  loadFailed: string;
  seekLabel: string;
  back15: string;
  forward15: string;
  nextSurah: string;
  closePlayer: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchCountOf: string;
  searchCountUnit: string;
  verseUnit: string;
  juzPrefix: string;
  defaultVoiceTitle: string;
  pickThisSurahOnly: string;
  pickDefaultHint: string;
  close: string;
}

interface QuranPlayerProps {
  labels: QuranPlayerLabels;
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
export function QuranPlayer({ labels }: QuranPlayerProps) {
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

  // Esc closes the reciter dialog (WAI-ARIA APG, dialog pattern: «Escape: Closes the dialog»).
  // It had no key handler at all — measured 26 Sep 2026: Esc left it open over the page.
  useEffect(() => {
    if (!pickingOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPicking(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pickingOpen]);

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
    // Flex at every size for one reason: the attribution moves to the bottom (see below).
    <section aria-labelledby="quran-heading" className="flex flex-col">
      {/* Spoken, never drawn, since `/quran` became its own page (26 Sep 2026): the page's h1
          «القرآن الكريم» is the visible title, and a second heading under it read as the
          hierarchy upside down (intro line → heading → fine print, on desktop). */}
      <h2 id="quran-heading" className="sr-only">
        {labels.heading}
      </h2>

      {/* Provenance on the page, not in the code (Khalid: «المصدر لازم يكون موجود»). The riwaya is
          named because a recitation without one is unattributed.
          Now the page's one subtitle, right under the title (Khalid, 26 Sep: «حشو كثير، تكرار
          كثير… الهنت اللي تحت شوف لها مكان أحسن»). It used to say the same facts twice — an
          intro line up top AND a bordered box of fine print at the bottom. One unboxed line
          holds the facts and the credit; the «we don't host it» explanation moved into the
          reciter dialog, where the question of whose voice this is actually comes up. */}
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground [text-wrap:balance] max-md:mb-3 max-md:text-xs">
        <span className="font-semibold text-foreground">{labels.provenanceLead}</span> {labels.provenanceRiwaya}{" "}
        <span className="font-semibold text-foreground">{RIWAYA}</span>
        {/* On a phone the line breaks here on purpose — between «what» and «who/where from» —
            instead of wherever it happens to, which left «·» opening the second line. */}
        <span className="max-md:hidden"> · </span>
        <br className="md:hidden" />
        {labels.provenanceMiddle.replace(/^·\s*/, "")}{" "}
        <a
          href={SOURCE.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-link hover:underline"
          dir="ltr"
        >
          {SOURCE.name}
        </a>
      </p>

      {/* The controls, on ONE row from `md` up: the page-wide voice and the surah search are the
          two things you do before anything else, so they sit side by side instead of stacking
          into 104px of form above the list. Stacked on phones.
          The reciter is shown at EVERY size since 26 Sep 2026 — it was phone-only, so on desktop
          the only way to change the voice was one surah at a time, 114 times. */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-2 md:w-80 md:shrink-0">
          <span className="shrink-0 text-xs text-muted-foreground">{labels.reciterLabel}</span>
          <button
            type="button"
            onClick={() => setPicking("default")}
            aria-label={`${labels.pickReciterAll} — ${labels.currentPrefix} ${defaultReciterName}`}
            className="flex h-11 min-w-0 flex-1 items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 text-sm font-bold motion-safe:transition-transform motion-safe:active:scale-95"
          >
            <span className="truncate">{defaultReciterName}</span>
            <IconChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </button>
        </div>
        {/* Seventeen thousand pixels of page on a phone, and the only way to سورة الكهف was to
            scroll past seventeen others. Filtering by name — with the search-friendly forms folded
            in, since «الفاتحة» is typed far more often than «سُورَةُ ٱلْفَاتِحَةِ». */}
        <div className="min-w-0 flex-1">
          <label htmlFor="surah-search" className="sr-only">
            {labels.searchLabel}
          </label>
          <input
            id="surah-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.searchPlaceholder}
            className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm"
          />
        </div>
      </div>
      {query && (
        <p className="mt-2 text-xs text-muted-foreground">
          {toArabic(shown.length)} {labels.searchCountOf} {toArabic(SURAHS.length)} {labels.searchCountUnit}
        </p>
      )}

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
            <span className="block truncate text-sm font-bold">{labels.resumeTitle}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {SURAHS.find((s) => s.n === resume.n)?.name} · {labels.resumeAtPrefix} {clock(resume.t)}
            </span>
          </span>
        </button>
      )}


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
              aria-label={playing ? labels.pause : labels.resume}
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
                    {labels.loadFailed}
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
              aria-label={labels.seekLabel}
              dir="ltr"
              className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-action-listen"
            />

            <span className="hidden shrink-0 text-[11px] tabular-nums text-muted-foreground sm:block" dir="ltr">
              {clock(current)} / {clock(duration)}
            </span>

            <button type="button" onClick={() => nudge(-JUMP)} aria-label={labels.back15} className="hidden size-11 shrink-0 place-items-center rounded-lg hover:bg-muted sm:grid">
              <IconReplay className="size-4" aria-hidden />
            </button>
            <button type="button" onClick={() => nudge(JUMP)} aria-label={labels.forward15} className="hidden size-11 shrink-0 place-items-center rounded-lg hover:bg-muted sm:grid">
              <IconAdvance className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => index !== null && index + 1 < SURAHS.length && playSurah(index + 1)}
              aria-label={labels.nextSurah}
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
              aria-label={labels.closePlayer}
              className="grid size-11 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
            >
              <IconClose className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      )}

      {/* Room for the dock, so the last surahs are never hidden under it. */}
      <ul
        className={cn(
          // 13rem → 18rem: at 1096px that was five 212px columns and every name truncated to
          // «سُورَةُ …»; at four (268px) the name fit but the verse·juz line still cut. Three of
          // ~360px, with the repeated «سورة» dropped from the card.
          "mt-4 grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-2",
          surah && "pb-[calc(5rem+env(safe-area-inset-bottom))]"
        )}
      >
        {shown.map(({ s, i }) => {
          const isCurrent = i === index;
          const r = reciterFor(s.n);
          return (
            <li
              key={s.n}
              className={cn(
                "rounded-xl border bg-card p-2.5 transition-colors",
                isCurrent ? "border-action-listen bg-action-listen/5" : "border-border"
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums",
                    isCurrent ? "bg-action-listen text-action-listen-foreground" : "border border-border text-muted-foreground"
                  )}
                >
                  {toArabic(s.n)}
                </span>
                <span className="min-w-0 flex-1">
                  {/* The name without «سُورَةُ»: the page is the mushaf, so the word repeated
                      114 times carried nothing and cost every card its width (desktop showed
                      «سُورَةُ …» on all of them). The full name stays in every aria-label. */}
                  <span className="block truncate text-base font-bold">{shortName(s.name)}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {toArabic(s.a)} {labels.verseUnit} · {s.p} · {labels.juzPrefix} {toArabic(s.j)}
                  </span>
                  {/* The override is now SEEN on the card, not only in the button's aria-label. */}
                  {choice[s.n] !== undefined && (
                    <span className="block truncate text-xs font-semibold text-action-listen">{r.name}</span>
                  )}
                </span>

                {/* Every card stays one compact row. The per-surah reciter button showed the first
                    letter of the voice — «م» on 114 cards, which nobody could read as "reciter". A
                    person mark says what it is; the override itself shows as the name above. */}
                <span className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPicking(s.n)}
                    aria-label={`${labels.pickReciterForPrefix} ${s.name} — ${labels.currentPrefix} ${r.name}`}
                    title={`${labels.pickReciterForPrefix} — ${r.name}`}
                    className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-full motion-safe:transition-transform motion-safe:active:scale-95",
                      choice[s.n] === undefined
                        ? "border border-border text-muted-foreground hover:border-action-listen/60 hover:text-foreground"
                        : "bg-action-listen/15 text-action-listen ring-1 ring-action-listen/40"
                    )}
                  >
                    <IconUser className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => playSurah(i)}
                    aria-label={`${labels.recitePrefix} ${s.name}`}
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-action-listen text-action-listen-foreground motion-safe:transition-transform motion-safe:active:scale-95"
                  >
                    {isCurrent && playing ? <IconPause className="size-4" /> : <IconPlay className="size-4" />}
                  </button>
                </span>
              </div>

            </li>
          );
        })}
      </ul>

      {pickingOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={pickingSurah ? `${labels.pickReciterForPrefix} ${pickingSurah.name}` : labels.pickReciterAll}
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
                  {pickingSurah ? pickingSurah.name : labels.defaultVoiceTitle}
                </p>
                <p className="text-xs text-muted-foreground">
                  {pickingSurah ? labels.pickThisSurahOnly : labels.pickDefaultHint} · {RIWAYA}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPicking(null)}
                aria-label={labels.close}
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
            {/* Moved here from the page (26 Sep 2026): «we don't host or edit the recitation» is
                an answer to "whose voice is this?", which is the question this dialog asks. */}
            <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
              {labels.provenanceMiddle.replace(/^·\s*/, "")}{" "}
              <a href={SOURCE.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-link hover:underline" dir="ltr">
                {SOURCE.name}
              </a>
              {labels.provenanceDisclaimer}
            </p>
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
