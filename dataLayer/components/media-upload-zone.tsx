"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, RotateCcw, UploadCloud, X } from "lucide-react";

import { cx } from "../lib/cx";
import { formatBytes, uploadWithProgress } from "../lib/upload-with-progress";
import { ProgressBar } from "./progress-bar";

type Phase = "queued" | "preparing" | "uploading" | "saving" | "done" | "error";

interface Item {
  id: string;
  file: File;
  previewUrl: string;
  phase: Phase;
  percent: number | null;
  error?: string;
}

export interface UploadedArgs {
  /** Parsed JSON body the upload endpoint returned. */
  response: unknown;
  /** What was actually sent (post-`transform`). */
  file: File;
  /** What the user picked, before any compression. */
  original: File;
}

export interface MediaUploadZoneLabels {
  idle: string;
  hint: string;
  busy: string;
  preparing: string;
  uploading: string;
  saving: string;
  done: string;
  retry: string;
  remove: string;
  notAnImage: string;
  tooLarge: string;
  failed: string;
  dropNow: string;
  keepOpen: string;
  summary: (done: number, total: number) => string;
}

const AR: MediaUploadZoneLabels = {
  idle: "ارفع صورك",
  hint: "اسحب الصور هنا أو اضغط للاختيار",
  busy: "جاري الرفع…",
  preparing: "نجهّز الصورة…",
  uploading: "جاري الرفع",
  saving: "نحفظها…",
  done: "تمّت",
  retry: "أعد المحاولة",
  remove: "شيلها من القائمة",
  notAnImage: "مش صورة",
  tooLarge: "حجمها كبير",
  failed: "ما نجح الرفع",
  dropNow: "أفلتها هنا",
  keepOpen: "خلّي الصفحة مفتوحة",
  summary: (done, total) => `${done} من ${total}`,
};

/** How long a finished row stays on screen before it clears itself. */
const AUTO_DISMISS_MS = 2500;

interface Props {
  endpoint: string;
  /** Extra form fields, e.g. `{ folder: "reels" }`. */
  fields?: Record<string, string>;
  accept?: string;
  multiple?: boolean;
  maxBytes?: number;
  disabled?: boolean;
  className?: string;
  labels?: Partial<MediaUploadZoneLabels>;
  /** Runs before upload — compression, resizing. Return the file to actually send. */
  transform?: (file: File) => Promise<File>;
  /**
   * Persist step: called once the bytes landed. Return `{ ok: false, error }` to mark the
   * row failed and keep it retryable — a successful upload with a failed DB write is the
   * case a plain "uploaded ✓" would quietly lie about.
   */
  onUploaded?: (args: UploadedArgs) => Promise<{ ok: boolean; error?: string } | void>;
  /** Fired once the whole batch settles, with how many fully succeeded. */
  onSettled?: (okCount: number, total: number) => void;
}

/**
 * Shared upload surface for every image flow in the repo (gallery · reels · media library).
 *
 * The point of it is honesty about time: a 20 MB upload over a slow connection is a real
 * wait, and a spinner tells the user nothing about whether it is moving. Every file gets
 * its own byte-level bar, its own phase label, and its own retry — so one failure in a
 * batch of ten does not force the other nine to be re-picked.
 */
export function MediaUploadZone({
  endpoint,
  fields,
  accept = "image/*",
  multiple = true,
  maxBytes = 20 * 1024 * 1024,
  disabled,
  className,
  labels,
  transform,
  onUploaded,
  onSettled,
}: Props) {
  const t = { ...AR, ...labels };
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  // Object URLs are a leak if left behind — one revoke pass when the component goes away.
  const urlsRef = useRef<string[]>([]);
  const timersRef = useRef<number[]>([]);
  useEffect(() => {
    const urls = urlsRef.current;
    const timers = timersRef.current;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const patch = useCallback((id: string, next: Partial<Item>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...next } : it)));
  }, []);

  const runOne = useCallback(
    async (item: Item): Promise<boolean> => {
      if (!item.file.type.startsWith("image/")) {
        patch(item.id, { phase: "error", error: t.notAnImage });
        return false;
      }
      if (item.file.size > maxBytes) {
        patch(item.id, { phase: "error", error: `${t.tooLarge} — ${formatBytes(maxBytes)}` });
        return false;
      }

      try {
        let toSend = item.file;
        if (transform) {
          patch(item.id, { phase: "preparing", percent: null });
          toSend = await transform(item.file);
        }

        patch(item.id, { phase: "uploading", percent: 0 });
        const res = await uploadWithProgress({
          endpoint,
          file: toSend,
          fields,
          onProgress: (p) => patch(item.id, { percent: p.percent }),
        });
        if (!res.ok) {
          const msg = (res.data as { error?: string } | null)?.error;
          patch(item.id, { phase: "error", error: msg || t.failed });
          return false;
        }

        // Bytes are in, but the row is not written yet — and that write is what makes the
        // image real to the app. No percentage exists for it, so the bar goes indeterminate.
        patch(item.id, { phase: "saving", percent: null });
        const saved = await onUploaded?.({ response: res.data, file: toSend, original: item.file });
        if (saved && saved.ok === false) {
          patch(item.id, { phase: "error", error: saved.error || t.failed });
          return false;
        }

        patch(item.id, { phase: "done", percent: 100 });
        return true;
      } catch {
        patch(item.id, { phase: "error", error: t.failed });
        return false;
      }
    },
    [endpoint, fields, maxBytes, onUploaded, patch, t.failed, t.notAnImage, t.tooLarge, transform]
  );

  const start = useCallback(
    async (queued: Item[]) => {
      setBusy(true);
      let ok = 0;
      // Sequential on purpose: parallel uploads on a phone share one uplink, so they all
      // crawl and every bar stalls together. One at a time finishes the first one sooner.
      for (const item of queued) if (await runOne(item)) ok++;
      setBusy(false);
      onSettled?.(ok, queued.length);

      // A finished bar has nothing left to say — the image is already in the grid below.
      // Successful rows clear themselves; failed ones stay, because they still need a
      // decision (retry or dismiss) and auto-hiding them would hide the failure itself.
      const timer = window.setTimeout(() => {
        setItems((prev) => prev.filter((it) => it.phase !== "done"));
      }, AUTO_DISMISS_MS);
      timersRef.current.push(timer);
    },
    [onSettled, runOne]
  );

  const add = useCallback(
    (files: FileList | File[] | null) => {
      const list = Array.from(files ?? []);
      if (!list.length) return;
      const next: Item[] = list.map((file, i) => {
        const previewUrl = URL.createObjectURL(file);
        urlsRef.current.push(previewUrl);
        return {
          id: `${Date.now()}-${i}-${file.name}`,
          file,
          previewUrl,
          phase: "queued" as const,
          percent: null,
        };
      });
      setItems((prev) => [...prev, ...next]);
      void start(next);
    },
    [start]
  );

  function retry(item: Item) {
    patch(item.id, { phase: "queued", percent: null, error: undefined });
    void start([{ ...item, phase: "queued", percent: null, error: undefined }]);
  }

  function drop(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  const doneCount = items.filter((i) => i.phase === "done").length;
  const settled = items.filter((i) => i.phase === "done" || i.phase === "error").length;
  const active = items.find((i) => i.phase === "uploading" || i.phase === "preparing" || i.phase === "saving");
  // One number for the whole batch: finished files plus how far the current one has got.
  const overall = items.length
    ? Math.min(100, Math.round(((settled + (active?.percent ?? 0) / 100) / items.length) * 100))
    : 0;

  return (
    <div className={cx("space-y-3", className)}>
      {/* Blocking overlay while bytes are moving. Without it the client keeps hitting
          "upload" because nothing on screen says the click already registered — and each
          extra click queues another copy of the same file. */}
      {busy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{t.busy}</p>
                <p className="truncate text-[11px] text-muted-foreground" title={active?.file.name}>
                  {active?.file.name ?? ""}
                </p>
              </div>
              <span className="shrink-0 text-sm font-bold tabular-nums text-primary">{overall}%</span>
            </div>
            <ProgressBar value={overall} className="mt-3 h-2" label={t.busy} />
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              {t.summary(settled, items.length)} · {t.keepOpen}
            </p>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          add(e.target.files);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || busy}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          add(e.dataTransfer.files);
        }}
        className={cx(
          "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 transition-colors disabled:opacity-60",
          dragging
            ? "border-primary bg-primary/5 text-primary"
            : "border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/30"
        )}
      >
        {busy ? (
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        ) : dragging ? (
          <UploadCloud className="h-7 w-7" />
        ) : (
          <ImagePlus className="h-7 w-7" />
        )}
        <span className="text-sm font-medium text-foreground">
          {busy ? t.busy : dragging ? t.dropNow : t.idle}
        </span>
        <span className="text-[11px]">{t.hint}</span>
      </button>

      {items.length > 0 && (
        <div className="space-y-2 rounded-lg border border-border bg-card p-2">
          <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
            <span>{t.summary(doneCount, items.length)}</span>
            {busy && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>
          {items.map((item) => (
            <Row key={item.id} item={item} t={t} onRetry={() => retry(item)} onDrop={() => drop(item.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function Row({
  item,
  t,
  onRetry,
  onDrop,
}: {
  item: Item;
  t: MediaUploadZoneLabels;
  onRetry: () => void;
  onDrop: () => void;
}) {
  const failed = item.phase === "error";
  const done = item.phase === "done";
  const phaseText =
    item.phase === "preparing"
      ? t.preparing
      : item.phase === "uploading"
        ? `${t.uploading} ${item.percent ?? 0}%`
        : item.phase === "saving"
          ? t.saving
          : done
            ? t.done
            : failed
              ? item.error
              : "";

  return (
    <div
      className={cx(
        "flex items-center gap-2.5 rounded-md p-1.5 transition-colors",
        failed ? "bg-red-500/5" : done ? "bg-emerald-500/5" : "bg-muted/30"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- object URL, never optimizable */}
      <img
        src={item.previewUrl}
        alt=""
        className="h-11 w-11 shrink-0 rounded object-cover ring-1 ring-border"
      />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[11px] font-medium text-foreground" title={item.file.name}>
            {item.file.name}
          </span>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {formatBytes(item.file.size)}
          </span>
        </div>
        <ProgressBar
          value={done ? 100 : failed ? 100 : item.percent}
          tone={failed ? "red" : done ? "emerald" : "primary"}
          label={item.file.name}
        />
        <span
          className={cx(
            "block text-[10px] leading-tight",
            failed ? "text-red-600" : done ? "text-emerald-600" : "text-muted-foreground"
          )}
        >
          {phaseText}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {done && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        {failed && (
          <button
            type="button"
            onClick={onRetry}
            aria-label={t.retry}
            title={t.retry}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
        {(done || failed) && (
          <button
            type="button"
            onClick={onDrop}
            aria-label={t.remove}
            title={t.remove}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
