"use client";

import { useRef, useState } from "react";
import { Upload, Video, X } from "lucide-react";
import { toast } from "sonner";

import { ProgressBar } from "@modonty/shared/components/progress-bar";

/**
 * Direct browser → Bunny upload over tus (ق2, 2026-08-05).
 *
 * Why not the ordinary upload route the images use: a 90-second clip is 10–50MB, past
 * Vercel's request-body limit and its function ceiling. tus also survives what a phone on
 * mobile data actually does — the connection drops, and the upload continues from the
 * byte it stopped at instead of starting over.
 *
 * ق7 says any device may upload, and the file is checked automatically instead. That check
 * runs HERE, before a single byte goes out: the browser can read a video's duration and
 * dimensions from the file itself, so a clip that breaks the rules costs the client
 * nothing but the moment it took to pick it.
 *
 * Two callers, two sets of rules: a reel is vertical and short, an intro video on the
 * client's own page is landscape and can run minutes. The mechanism is identical, so the
 * rules come in as props and the server actions are injected — the component knows how to
 * move bytes, not what the bytes are for.
 */

const MIN_DURATION_SEC = 2;
const MAX_BYTES = 300 * 1024 * 1024;
const ACCEPTED = ["video/mp4", "video/quicktime", "video/webm"];

export interface VideoUploadTicket {
  mediaId: string;
  endpoint: string;
  libraryId: string;
  videoId: string;
  signature: string;
  expire: number;
}

export interface VideoUploadProps {
  /** Reserves the video on Bunny and the row here, and signs this one upload. */
  createTicket: (
    filename: string
  ) => Promise<{ success: true; ticket: VideoUploadTicket } | { success: false; error: string }>;
  /** Stores what the browser measured once the bytes are through. */
  finalize: (
    mediaId: string,
    input: { durationSec: number; width: number; height: number; fileSize: number }
  ) => Promise<{ success: true } | { success: false; error: string }>;
  /** Polled while Bunny encodes — there is no playable file or cover until it finishes. */
  getEncodingState: (
    mediaId: string
  ) => Promise<{ ready: boolean; failed: boolean; progress: number }>;
  maxDurationSec: number;
  /** Reels are 1080×1920; a page video is not, so the check is opt-in. */
  requireVertical?: boolean;
  labels: { idle: string; hint: string; done: string };
  onDone: () => void;
}

/** Bunny's documented backoff — seven attempts before it gives up on a dead connection. */
const RETRY_DELAYS = [0, 3000, 5000, 10000, 20000, 60000, 60000];

/** Sizes read by an Arabic speaker — "MB" mid-sentence breaks the line's direction. */
function megabytes(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))} ميجا`;
}

type Phase = "idle" | "checking" | "uploading" | "saving" | "encoding";

interface Probe {
  durationSec: number;
  width: number;
  height: number;
}

/**
 * Read the real duration and dimensions out of the file. The browser decodes just the
 * metadata header — nothing is uploaded, and nothing is trusted from the file name.
 */
function probeVideo(file: File): Promise<Probe> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement("video");
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      const probe = {
        durationSec: el.duration,
        width: el.videoWidth,
        height: el.videoHeight,
      };
      URL.revokeObjectURL(url);
      resolve(probe);
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("ما قدرنا نقرأ المقطع"));
    };
    el.src = url;
  });
}

/** The rules, in the client's words — returns null when the file passes. */
function rejectionReason(
  probe: Probe,
  maxDurationSec: number,
  requireVertical: boolean
): string | null {
  if (!Number.isFinite(probe.durationSec)) return "ما قدرنا نقرأ مدّة المقطع";
  if (probe.durationSec > maxDurationSec) {
    const shown =
      maxDurationSec >= 60 ? `${Math.round(maxDurationSec / 60)} دقائق` : `${maxDurationSec} ثانية`;
    return `المقطع ${Math.round(probe.durationSec)} ثانية — الحدّ ${shown}`;
  }
  if (probe.durationSec < MIN_DURATION_SEC) return "المقطع قصير جداً";
  if (requireVertical && probe.width && probe.height && probe.width > probe.height) {
    return "المقطع عرضي — الريلز تُعرض طولية (1080 × 1920)";
  }
  return null;
}

export function VideoUpload({
  createTicket,
  finalize,
  getEncodingState,
  maxDurationSec,
  requireVertical = false,
  labels,
  onDone,
}: VideoUploadProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [percent, setPercent] = useState(0);
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<(() => void) | null>(null);

  const busy = phase !== "idle";

  function reset() {
    setPhase("idle");
    setPercent(0);
    setFileName("");
    abortRef.current = null;
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFile(file: File) {
    if (!ACCEPTED.includes(file.type)) {
      toast.error("الصيغة غير مدعومة — استخدم MP4 أو MOV أو WebM");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(`الملف ${megabytes(file.size)} — الحدّ ${megabytes(MAX_BYTES)}`);
      return;
    }

    setFileName(file.name);
    setPhase("checking");

    let probe: Probe;
    try {
      probe = await probeVideo(file);
    } catch {
      toast.error("ما قدرنا نقرأ المقطع — جرّب ملفاً ثانياً");
      reset();
      return;
    }

    const reason = rejectionReason(probe, maxDurationSec, requireVertical);
    if (reason) {
      toast.error(reason);
      reset();
      return;
    }

    const ticketRes = await createTicket(file.name);
    if (!ticketRes.success) {
      toast.error(ticketRes.error);
      reset();
      return;
    }
    const ticket = ticketRes.ticket;

    setPhase("uploading");
    // Loaded on demand: the client only pays for the upload library when they actually
    // upload, and it never lands in the console's initial bundle.
    const { Upload: TusUpload } = await import("tus-js-client");

    const upload = new TusUpload(file, {
      endpoint: ticket.endpoint,
      retryDelays: RETRY_DELAYS,
      headers: {
        AuthorizationSignature: ticket.signature,
        AuthorizationExpire: String(ticket.expire),
        VideoId: ticket.videoId,
        LibraryId: ticket.libraryId,
      },
      metadata: { filetype: file.type, title: file.name },
      onProgress: (sent, total) => setPercent(Math.round((sent / total) * 100)),
      onError: () => {
        toast.error("الرفع تعثّر — جرّب مرة ثانية");
        reset();
      },
      onSuccess: async () => {
        setPhase("saving");
        const saved = await finalize(ticket.mediaId, {
          durationSec: probe.durationSec,
          width: probe.width,
          height: probe.height,
          fileSize: file.size,
        });
        if (!saved.success) {
          toast.error(saved.error);
          reset();
          return;
        }
        setPhase("encoding");
        await waitForEncoding(ticket.mediaId);
      },
    });

    abortRef.current = () => void upload.abort();
    upload.start();
  }

  /**
   * Bunny encodes after the upload; until it finishes there is no playable file and no
   * cover. Polled rather than pushed because a webhook would need a public endpoint for
   * something only this screen is waiting on.
   */
  async function waitForEncoding(mediaId: string) {
    for (let attempt = 0; attempt < 60; attempt++) {
      const state = await getEncodingState(mediaId);
      if (state.failed) {
        toast.error("بني ما قدر يعالج المقطع — جرّب ملفاً ثانياً");
        break;
      }
      if (state.ready) {
        toast.success(labels.done);
        break;
      }
      setPercent(state.progress);
      await new Promise((r) => setTimeout(r, 5000));
    }
    reset();
    onDone();
  }

  if (busy) {
    return (
      <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{fileName}</p>
            <p className="text-xs text-muted-foreground">
              {phase === "checking" && "نفحص المقطع…"}
              {phase === "uploading" && `نرفع… ${percent}%`}
              {phase === "saving" && "نحفظ…"}
              {phase === "encoding" && `نجهّز المقطع للعرض… ${percent}%`}
            </p>
          </div>
          {phase === "uploading" && (
            <button
              type="button"
              onClick={() => {
                abortRef.current?.();
                reset();
              }}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="ألغِ الرفع"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <ProgressBar
          value={phase === "uploading" || phase === "encoding" ? percent : null}
        />
        {phase === "encoding" && (
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            تقدر تسكّر الصفحة — المقطع يكمّل تجهيزه عند بني، وبيلقاك هنا.
          </p>
        )}
      </div>
    );
  }

  return (
    <label
      className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-dashed border-border bg-muted/30 p-8 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) void handleFile(file);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <Upload className="h-8 w-8" />
      <span className="text-sm font-medium text-foreground">{labels.idle}</span>
      <span className="text-center text-xs">
        {labels.hint} · حتى {megabytes(MAX_BYTES)}
      </span>
      <span className="flex items-center gap-1 text-[11px]">
        <Video className="h-3 w-3" />
        الرفع يكمّل حتى لو ضعف الاتصال
      </span>
    </label>
  );
}
